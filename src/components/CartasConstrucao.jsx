import { createContext, useContext } from 'react';
import { escolherConstrucao } from '../game/acoes.js';
import { CONSTRUCOES } from '../game/construcoes.js';
import { custoEvolucao, emObra, estruturaDoTipo, requisitosDaConstrucao, requisitosOk } from '../game/estruturas.js';
import { temRecursos } from '../game/inventario.js';
import { alternarCartas, definirModo } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import { useMiniatura } from './cena/Miniaturas.jsx';
import ListaCusto from './ui/ListaCusto.jsx';
import Moldura from './ui/Moldura.jsx';

// Cartas de construção numa moldura de madeira e ouro (canto inferior esquerdo).
// Ordem da carta: ilustração (o próprio modelo 3D), nome, status e a lista de custos.
// Disponível: aro de ouro brilhando + fita "Construir!/Evoluir!".
// Selecionada ou em obra: a carta vira uma placa de ouro. Sem recursos: apagada.
//
// <CartasConstrucao>
//   <CartasConstrucao.Carta id="cabana" />
//   ...
// </CartasConstrucao>
// Sem filhos, mostra todas as construções.
const CartasContext = createContext(null);

function CartasConstrucao({ children }) {
  const { ui } = useMundo();
  const abertas = ui.cartasAbertas;
  return (
    <CartasContext.Provider value={{ modo: ui.modo }}>
      <div className="pointer-events-auto max-w-[calc(100vw_-_24px)] pt-3.5">
        <Moldura className={abertas ? '' : 'min-w-[220px] pb-1.5'}>
          <Moldura.Placa>Construções</Moldura.Placa>
          <Moldura.Acao onClick={() => alternarCartas()}>{abertas ? 'Recolher (C)' : 'Mostrar (C)'}</Moldura.Acao>
          <Moldura.Corpo>
            {abertas && (
              <div className="flex gap-2.5 overflow-x-auto px-0.5 pt-3 pb-1.5">
                {children ?? Object.keys(CONSTRUCOES).map(id => <Carta key={id} id={id} />)}
              </div>
            )}
          </Moldura.Corpo>
        </Moldura>
      </div>
    </CartasContext.Provider>
  );
}

// Estado de uma carta: o que mostrar e se está disponível
function estadoDaCarta(id, modo) {
  const c = CONSTRUCOES[id];
  const existente = estruturaDoTipo(id);
  const obra = emObra(id);
  const custo = existente ? custoEvolucao(existente) : c.custo;
  const temCusto = temRecursos(custo);
  const temAjuda = requisitosOk(id);
  const selecionada = !existente && modo.tipo === 'construir' && modo.construcao === id;
  return {
    c, existente, obra, custo, selecionada, requisitos: requisitosDaConstrucao(id),
    disponivel: !obra && temCusto && temAjuda,
    acao: existente ? `Evoluir p/ nível ${existente.nivel + 1}` : 'Construir',
  };
}

// Ilustração: o modelo 3D da construção no nível atual (emoji enquanto a imagem é gerada)
function Ilustracao({ id, nivel, icone }) {
  const url = useMiniatura(id, nivel);
  return (
    <span className="flex h-[78px] w-full items-center justify-center">
      {url
        ? <img src={url} alt="" draggable={false} className="h-[78px] w-[78px] object-contain drop-shadow-[0_3px_2px_rgb(0_0_0/0.45)]" />
        : <span className="text-[34px] leading-none">{icone}</span>}
    </span>
  );
}

function Carta({ id }) {
  const { modo } = useContext(CartasContext);
  const e = estadoDaCarta(id, modo);
  const ativa = e.obra || e.selecionada;

  let visual = 'carta-madeira border-[#9a7040] opacity-60 saturate-50';
  if (e.disponivel) visual = 'carta-madeira border-[#f0bd4e] shadow-[0_0_14px_rgb(245_200_76/0.6)]';
  if (ativa) visual = 'ouro border-[#8a5414] shadow-[0_0_16px_rgb(245_200_76/0.85)]';

  return (
    <button
      type="button"
      disabled={!e.disponivel && !e.selecionada}
      onClick={() => (e.selecionada ? definirModo(null) : escolherConstrucao(id))}
      className={[
        'relative flex w-[124px] shrink-0 cursor-pointer flex-col items-center rounded-lg border-2 px-1.5 pt-1.5 pb-1.5 text-center',
        'transition duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        ativa ? 'text-[#5a2e0c]' : 'text-[#f3dcae]',
        visual,
      ].join(' ')}
    >
      {e.disponivel && !ativa && (
        // fitinha vermelha com borda de ouro
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 animate-pulse rounded-sm border border-[#f0bd4e] bg-gradient-to-b from-[#e8584a] to-[#9c2a22] px-2 text-[11px] whitespace-nowrap text-white shadow-[0_2px_0_#5a2e0c] [font-family:var(--font-jogo)]">
          {e.existente ? 'Evoluir!' : 'Construir!'}
        </span>
      )}
      {e.existente && (
        // moedinha de ouro com o nível
        <span className="ouro texto-gravado absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] shadow-[0_2px_0_#5a2e0c]">
          {e.existente.nivel}
        </span>
      )}
      {/* 1. ilustração */}
      <Ilustracao id={id} nivel={e.existente?.nivel ?? 1} icone={e.c.icone} />
      {/* 2. nome */}
      <span className={`text-[14px] leading-tight ${ativa ? 'texto-gravado' : 'texto-ouro'}`}>{e.c.nome}</span>
      {/* 3. status */}
      <span className="mt-0.5 mb-1 text-[11px] leading-tight font-semibold opacity-90">
        {e.obra ? (e.existente ? 'Evoluindo...' : 'Em construção...') : e.acao}
      </span>
      {/* 4. recursos (e gente) necessários, um embaixo do outro */}
      {!e.obra && <ListaCusto custo={e.custo} requisitos={e.requisitos} escuro={ativa} />}
    </button>
  );
}

CartasConstrucao.Carta = Carta;

export default CartasConstrucao;
