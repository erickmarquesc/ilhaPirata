import { qtdEspecie } from '../../game/animais.js';
import { ESPECIES } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { limiteDoAbrigo, noNivelMaximo } from '../../game/estruturas.js';
import { capacidadeDoEstoque, totalNoEstoque } from '../../game/inventario.js';
import Painel from '../ui/Painel.jsx';

// Abrigo de animais: quantos tem, o limite do nível atual e o do próximo
function InfoAbrigo({ estrutura }) {
  const { abrigo } = CONSTRUCOES[estrutura.tipo];
  const nome = ESPECIES[abrigo].nome.f.toLowerCase() + 's';
  const limite = limiteDoAbrigo(estrutura.tipo, estrutura.nivel);
  return (
    <>
      <Painel.Texto>{ESPECIES[abrigo].icone.f} {qtdEspecie(abrigo)} de {limite} {nome}.</Painel.Texto>
      <Painel.Texto>
        {noNivelMaximo(estrutura)
          ? 'Nível máximo.'
          : `No nível ${estrutura.nivel + 1}: até ${limiteDoAbrigo(estrutura.tipo, estrutura.nivel + 1)} ${nome}.`}
      </Painel.Texto>
    </>
  );
}

// Moinho: estoque atual e o do próximo nível
function InfoMoinho({ estrutura }) {
  return (
    <>
      <Painel.Texto>📦 Estoque: {totalNoEstoque()} de {capacidadeDoEstoque(estrutura.nivel)}.</Painel.Texto>
      <Painel.Texto>
        {noNivelMaximo(estrutura) ? 'Nível máximo.' : `No nível ${estrutura.nivel + 1}: até ${capacidadeDoEstoque(estrutura.nivel + 1)}.`}
      </Painel.Texto>
    </>
  );
}

// Painel genérico para construções sem ações próprias (cabana, cercados...)
export default function PainelEstrutura({ alvo: estrutura }) {
  const c = CONSTRUCOES[estrutura.tipo];
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>{c.icone} {c.nome} · nível {estrutura.nivel}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>{c.descricao || ''}</Painel.Texto>
      {c.abrigo && <InfoAbrigo estrutura={estrutura} />}
      {estrutura.tipo === 'moinho' && <InfoMoinho estrutura={estrutura} />}
    </>
  );
}
