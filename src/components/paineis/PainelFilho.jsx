import { FASES } from '../../game/config.js';
import { estruturaDoTipo } from '../../game/estruturas.js';
import Painel from '../ui/Painel.jsx';

export default function PainelFilho({ alvo: filho }) {
  const fase = FASES[filho.tipo];
  const texto = filho.tipo === 'crianca' && estruturaDoTipo('campoTrigo')
    ? 'Criança. Cuida do campo de trigo: planta e colhe. Vira adolescente quando nascer o próximo irmão.'
    : fase.texto;
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>{fase.icone} {filho.nome}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>{texto}</Painel.Texto>
    </>
  );
}
