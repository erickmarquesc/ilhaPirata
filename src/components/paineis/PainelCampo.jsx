import { SEMENTES_TRIGO_POR_COLHEITA, TRIGO_POR_COLHEITA } from '../../game/config.js';
import { contarCanteiros } from '../../game/trigo.js';
import { useMundo } from '../../hooks/useMundo.js';
import Painel from '../ui/Painel.jsx';

export default function PainelCampo({ alvo: campo }) {
  const { inventario } = useMundo();
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>🌾 Campo de trigo · nível {campo.nivel}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>
        Cada canteiro gasta 1 semente de trigo. Ao colher rende {TRIGO_POR_COLHEITA} 🌾 e devolve {SEMENTES_TRIGO_POR_COLHEITA} sementes.
      </Painel.Texto>
      <Painel.Texto>Sementes de trigo: {inventario.sementesTrigo}</Painel.Texto>
      <Painel.Texto>
        Vazios: {contarCanteiros(campo, 'vazio')} · Crescendo: {contarCanteiros(campo, 'crescendo')} · Maduros: {contarCanteiros(campo, 'maduro')}
      </Painel.Texto>
    </>
  );
}
