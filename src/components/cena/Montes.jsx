import { QTD_POR_MONTE } from '../../game/config.js';
import { useMundo } from '../../hooks/useMundo.js';
import { aoTocarEntidade } from './clique.js';
import { alturaDoChao, idDe, paraCena } from './coords.js';
import { MODELOS_MONTE } from './modelos/Montes.jsx';

// O monte encolhe conforme é coletado; esgotado, fica um restinho até se recompor
export function escalaDoMonte(m) {
  const fator = m.restante > 0 ? 0.45 + 0.55 * m.restante / QTD_POR_MONTE : 0.25;
  return fator * m.raio / 20;
}

export default function Montes() {
  const { montes } = useMundo();
  return montes.map(m => {
    const Modelo = MODELOS_MONTE[m.tipo];
    return (
      <group
        key={idDe(m)}
        position={paraCena(m.x, m.y, alturaDoChao(m.x, m.y))}
        scale={escalaDoMonte(m)}
        onPointerDown={e => aoTocarEntidade(e, m.x, m.y)}
      >
        <Modelo />
      </group>
    );
  });
}
