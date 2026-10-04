import { CONSTRUCOES } from '../../game/construcoes.js';
import Painel from '../ui/Painel.jsx';

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
    </>
  );
}
