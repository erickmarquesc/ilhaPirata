import { PEDACOS_POR_PRATO } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { noNivelMaximo } from '../../game/estruturas.js';
import { PRATOS, consumoDaFogueira, cozinhar, custoDoPrato, podeCozinhar } from '../../game/fogueira.js';
import { useMundo } from '../../hooks/useMundo.js';
import Botao from '../ui/Botao.jsx';
import Custo from '../ui/Custo.jsx';
import Painel from '../ui/Painel.jsx';

// Fogueira: Jones faz churrasco ou peixada (5 pedaços cada). Mostra o prato no espeto
// e quem da família está esperando comida.
export default function PainelFogueira({ alvo: estrutura }) {
  const { comida, jogador } = useMundo();
  const c = CONSTRUCOES.fogueira;
  const { servido } = comida;
  const pedidos = comida.pedidos.filter(p => p.quem.acao); // só quem já chegou na fogueira
  const cozinhando = jogador.tarefa?.tipo === 'cozinhar' ? jogador.tarefa.prato : null;
  const querem = id => pedidos.filter(p => p.prato === id).length;
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>{c.icone} {c.nome} · nível {estrutura.nivel}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>{c.descricao} Cada prato rende {PEDACOS_POR_PRATO} pedaços.</Painel.Texto>
      <Painel.Texto>
        {noNivelMaximo(estrutura)
          ? `Cada prato gasta ${consumoDaFogueira(estrutura.nivel)}. Nível máximo.`
          : `Cada prato gasta ${consumoDaFogueira(estrutura.nivel)}; no nível ${estrutura.nivel + 1}, ${consumoDaFogueira(estrutura.nivel + 1)}.`}
      </Painel.Texto>
      {servido && (
        <Painel.Texto>
          No espeto: {PRATOS[servido.prato].icone} {PRATOS[servido.prato].nome.toLowerCase()} · {servido.pedacos} de {PEDACOS_POR_PRATO} pedaços
        </Painel.Texto>
      )}
      {pedidos.map(p => (
        <Painel.Texto key={p.quem.nome}>🗨️ {p.quem.nome} quer {PRATOS[p.prato].nome.toLowerCase()} {PRATOS[p.prato].icone}</Painel.Texto>
      ))}
      {!comida.conhece && <Painel.Texto>Faça o primeiro churrasco para a família conhecer a comida.</Painel.Texto>}
      <Painel.Acoes>
        {Object.entries(PRATOS).map(([id, p]) => (
          <Botao
            key={id}
            cor="obra"
            ativo={cozinhando === id || (!servido && querem(id) > 0)}
            disabled={!podeCozinhar(id)}
            onClick={() => cozinhar(id)}
          >
            <Botao.Nome>{p.icone} {cozinhando === id ? 'Cozinhando...' : p.nome}</Botao.Nome>
            <Botao.Detalhe><Custo custo={custoDoPrato(id, estrutura.nivel)} /></Botao.Detalhe>
            {servido && <Botao.Detalhe falta>Espere o {PRATOS[servido.prato].nome.toLowerCase()} acabar</Botao.Detalhe>}
          </Botao>
        ))}
      </Painel.Acoes>
    </>
  );
}
