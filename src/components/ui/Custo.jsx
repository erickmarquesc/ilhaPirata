import { Fragment } from 'react';
import { ICONES } from '../../game/config.js';
import { useMundo } from '../../hooks/useMundo.js';

// Mostra um custo como "60 🪵 + 4 🌱", com o que falta em vermelho
export default function Custo({ custo }) {
  const { inventario } = useMundo();
  return Object.entries(custo).map(([r, q], i) => (
    <Fragment key={r}>
      {i > 0 && ' + '}
      <span className={inventario[r] < q ? 'text-falta' : ''}>{q} {ICONES[r]}</span>
    </Fragment>
  ));
}
