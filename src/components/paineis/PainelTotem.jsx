import { useState } from 'react';
import { ICONES, TAXA_TROCA } from '../../game/config.js';
import { temRecursos } from '../../game/inventario.js';
import { LOTES_TROCA, RECURSOS_TROCA, podeTrocar, recebidoNaTroca, trocarComDeuses } from '../../game/oferenda.js';
import { PEDIDOS } from '../../game/pedidos.js';
import { fecharPainel } from '../../game/ui.js';
import { useMundo } from '../../hooks/useMundo.js';
import ListaCusto, { NOMES } from '../ui/ListaCusto.jsx';
import Moldura from '../ui/Moldura.jsx';

// Totem da Vida numa moldura de madeira e ouro (como a Família e as Construções):
// os pedidos aos deuses em cartas e a troca de um recurso por outro em medalhões.
// Usa a própria moldura no lugar da caixa escura do painel (ver PainelInteracao).
const icone = r => ICONES[r].split(' ')[0];

export default function PainelTotem({ alvo }) {
  const { favor } = useMundo();
  return (
    <Moldura className="w-full">
      <Moldura.Placa>🗿 Totem da Vida</Moldura.Placa>
      <Moldura.Acao onClick={fecharPainel} aria-label="Fechar">✕</Moldura.Acao>
      <Moldura.Corpo>
        <p className="m-0 mt-1 text-center text-[12px] leading-snug text-[#f3dcae]">
          <span className="texto-ouro text-[13px]">Nível {alvo?.nivel ?? 1}</span> · Faça uma oferenda e peça algo aos deuses.
        </p>
        <Secao titulo="Pedidos">
          <div className="flex gap-2 pt-2">
            {Object.entries(PEDIDOS).map(([id, p]) => <CartaPedido key={id} id={id} pedido={p} />)}
          </div>
        </Secao>
        <Secao titulo="Troca com os deuses">
          <TrocaComDeuses favor={favor} />
        </Secao>
      </Moldura.Corpo>
    </Moldura>
  );
}
PainelTotem.moldura = true;

// Título de seção entre dois filetes de ouro
function Secao({ titulo, children }) {
  return (
    <section className="mt-2.5">
      <h3 className="texto-ouro m-0 mb-1 flex items-center gap-2 text-[14px] font-normal">
        <span className="h-[2px] flex-1 rounded-full bg-[#d9a441]/70" />
        {titulo}
        <span className="h-[2px] flex-1 rounded-full bg-[#d9a441]/70" />
      </h3>
      {children}
    </section>
  );
}

// Pedido como carta de madeira: disponível brilha com a fita "Pedir!"; indisponível fica apagada
function CartaPedido({ id, pedido: p }) {
  useMundo();
  const disponivel = p.disponivel();
  const pode = disponivel && temRecursos(p.custo);
  return (
    <button
      type="button"
      disabled={!pode}
      onClick={() => p.realizar(id)}
      className={[
        'carta-madeira relative flex flex-1 cursor-pointer flex-col items-center rounded-lg border-2 px-1.5 pt-1.5 pb-1.5 text-center text-[#f3dcae]',
        'transition duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        pode ? 'border-[#f0bd4e] shadow-[0_0_14px_rgb(245_200_76/0.6)]' : 'border-[#9a7040] opacity-60 saturate-50',
      ].join(' ')}
    >
      {pode && (
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 animate-pulse rounded-sm border border-[#f0bd4e] bg-gradient-to-b from-[#e8584a] to-[#9c2a22] px-2 text-[11px] whitespace-nowrap text-white shadow-[0_2px_0_#5a2e0c] [font-family:var(--font-jogo)]">
          Pedir!
        </span>
      )}
      <span className="text-[28px] leading-none drop-shadow-[0_2px_1px_rgb(0_0_0/0.45)]">{p.icone}</span>
      <span className="texto-ouro mt-1 mb-1 text-[14px] leading-tight">{p.nome}</span>
      {disponivel
        ? <ListaCusto custo={p.custo} />
        : <span className="rounded-md bg-black/30 px-1 py-0.5 text-[11px] leading-tight">{p.motivo}</span>}
    </button>
  );
}

// Escambo com os deuses: escolhe o que dar e o que receber (medalhões) e o lote (cartas)
function TrocaComDeuses({ favor }) {
  const [dar, setDar] = useState('madeira');
  const [receber, setReceber] = useState('pedra');
  return (
    <>
      <p className="m-0 text-center text-[12px] leading-snug text-[#f3dcae]">
        {favor > 0
          ? <><span className="texto-ouro text-[13px]">✨ Favor dos deuses</span> · troca 1 por 1 por mais {Math.ceil(favor)}s</>
          : <>Taxa <span className="texto-ouro text-[13px]">{TAXA_TROCA} por 1</span> · ofereça o espeto na fogueira para ganhar ✨ favor</>}
      </p>
      <EscolhaRecurso rotulo="Dar" valor={dar} onEscolher={setDar} />
      <EscolhaRecurso rotulo="Receber" valor={receber} onEscolher={setReceber} />
      {dar === receber
        ? <p className="m-0 mt-2 text-center text-[12px] font-semibold text-[#ff8a7a]">Escolha recursos diferentes</p>
        : (
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {LOTES_TROCA.map(qtd => <Lote key={qtd} dar={dar} receber={receber} qtd={qtd} />)}
          </div>
        )}
    </>
  );
}

// Fileira de medalhões com o recurso e quanto se tem; o escolhido ganha aro de ouro brilhando
function EscolhaRecurso({ rotulo, valor, onEscolher }) {
  const { inventario } = useMundo();
  return (
    <div className="mt-1.5">
      <span className="texto-ouro text-[12px]">{rotulo}</span>
      <div className="flex justify-between gap-0.5">
        {RECURSOS_TROCA.map(r => {
          const escolhido = valor === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={escolhido}
              title={NOMES[r]}
              onClick={() => onEscolher(r)}
              className={[
                'medalhao flex w-[34px] cursor-pointer flex-col items-center rounded-lg pt-0.5 text-white transition',
                'hover:brightness-115 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white',
                escolhido ? 'scale-105 !border-[#ffd75e] shadow-[0_0_0_2px_#ffd75e,0_0_10px_rgb(255_215_94/0.8)]' : 'opacity-75',
              ].join(' ')}
            >
              <span className="text-[16px] leading-none drop-shadow-[0_1px_0_rgb(0_0_0/0.5)]">{icone(r)}</span>
              <span className="texto-ouro text-[10px] leading-tight tabular-nums">{inventario[r]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Lote como cartinha: o que se dá em cima, o que se recebe embaixo
function Lote({ dar, receber, qtd }) {
  const pode = podeTrocar(dar, receber, qtd);
  return (
    <button
      type="button"
      disabled={!pode}
      onClick={() => trocarComDeuses(dar, receber, qtd)}
      className={[
        'carta-madeira flex cursor-pointer flex-col items-center rounded-lg border-2 px-1 py-1 text-[#f3dcae]',
        'transition duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        pode ? 'border-[#f0bd4e] shadow-[0_0_10px_rgb(245_200_76/0.5)]' : 'border-[#9a7040] opacity-50 saturate-50',
      ].join(' ')}
    >
      <span className="text-[12px] leading-tight">Dá <span className="texto-ouro text-[14px]">{qtd}</span> {icone(dar)}</span>
      <span className="text-[10px] leading-none opacity-70">▼</span>
      <span className="text-[12px] leading-tight">Ganha <span className="texto-ouro text-[14px]">{recebidoNaTroca(qtd)}</span> {icone(receber)}</span>
    </button>
  );
}
