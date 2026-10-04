import { clicar } from '../../game/jogo.js';
import { mundo } from '../../game/mundo.js';
import { gestos } from './gestos.js';

// Toque num objeto de pé (árvore, pessoa, animal, construção): usa a posição da base dele,
// como o jogo 2D fazia. Com modo plantar/construir/expandir ativo, deixa o toque seguir
// para o chão, que usa o ponto exato.
export function aoTocarEntidade(e, x, y) {
  if (e.nativeEvent.button > 0 || gestos.pincando || mundo.ui.modo.tipo) return;
  e.stopPropagation();
  clicar({ x, y });
}
