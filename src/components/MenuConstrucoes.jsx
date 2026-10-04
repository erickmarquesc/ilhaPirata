import { createContext, useContext } from 'react';
import { escolherConstrucao } from '../game/acoes.js';
import { CONSTRUCOES } from '../game/construcoes.js';
import { custoEvolucao, emObra, estruturaDoTipo, requisitosOk, temAdolescente } from '../game/estruturas.js';
import { temRecursos } from '../game/inventario.js';
import { useMundo } from '../hooks/useMundo.js';
import Botao from './ui/Botao.jsx';
import Custo from './ui/Custo.jsx';
import Painel from './ui/Painel.jsx';

// <MenuConstrucoes>
//   <MenuConstrucoes.Item id="cabana" />
//   ...
// </MenuConstrucoes>
// Sem filhos, lista todas as construções do jogo.
const MenuContext = createContext(null);

function MenuConstrucoes({ children }) {
  const { ui } = useMundo();
  if (!ui.menuAberto) return null;
  return (
    <MenuContext.Provider value={{ modo: ui.modo }}>
      <Painel className="max-h-[calc(100vh_-_380px)] min-h-[120px] overflow-y-auto">
        <Painel.Cabecalho>
          <Painel.Titulo>Construções</Painel.Titulo>
        </Painel.Cabecalho>
        {children ?? Object.keys(CONSTRUCOES).map(id => <Item key={id} id={id} />)}
      </Painel>
    </MenuContext.Provider>
  );
}

function Item({ id }) {
  const { modo } = useContext(MenuContext);
  const c = CONSTRUCOES[id];
  const existente = estruturaDoTipo(id);
  const obra = emObra(id);
  // Já construída: o item vira a evolução para o próximo nível
  const custo = existente ? custoEvolucao(existente) : c.custo;
  const ativo = existente ? obra : modo.tipo === 'construir' && modo.construcao === id;

  let detalhe;
  if (existente) detalhe = obra ? 'Evoluindo...' : <>Evoluir para nível {existente.nivel + 1}: <Custo custo={custo} /></>;
  else detalhe = obra ? 'Em construção...' : <Custo custo={custo} />;

  return (
    <Botao
      cor="obra"
      ativo={ativo}
      disabled={obra || !temRecursos(custo) || !requisitosOk(id)}
      onClick={() => escolherConstrucao(id)}
    >
      <Botao.Nome>
        {c.icone} {c.nome}{existente && ` · nível ${existente.nivel}`}
      </Botao.Nome>
      <Botao.Detalhe>{detalhe}</Botao.Detalhe>
      <Requisito id={id} />
    </Botao>
  );
}

function Requisito({ id }) {
  if (!CONSTRUCOES[id].precisaAdolescente) return null;
  return <Botao.Detalhe falta={!temAdolescente()}>Precisa de 1 filho adolescente ou adulto para ajudar</Botao.Detalhe>;
}

MenuConstrucoes.Item = Item;
MenuConstrucoes.Requisito = Requisito;

export default MenuConstrucoes;
