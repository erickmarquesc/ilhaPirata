import { FASES } from '../../game/config.js';
import { estruturaDoTipo } from '../../game/estruturas.js';
import { PAUSAVEIS } from '../../game/pausas.js';
import { useMundo } from '../../hooks/useMundo.js';
import Painel from '../ui/Painel.jsx';

export default function PainelFilho({ alvo: filho }) {
  const { pausas } = useMundo();
  const pausados = Object.keys(PAUSAVEIS).filter(r => pausas[r]);
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
      {pausados.length > 0 && (
        <Painel.Texto>⏸ Produção pausada: {pausados.map(r => PAUSAVEIS[r].icone).join(' ')}</Painel.Texto>
      )}
    </>
  );
}
