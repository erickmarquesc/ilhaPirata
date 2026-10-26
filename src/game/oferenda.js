import { LOTES_TROCA, TAXA_TROCA } from './config.js';
import { luzDivina, textoFlutuante } from './efeitos.js';
import { PRATOS, fogueira } from './fogueira.js';
import { gastarRecursos, ganhar, temRecursos } from './inventario.js';
import { mundo } from './mundo.js';
import { atualizarInventario } from './ui.js';

// ===================== Oferenda aos deuses (na fogueira) =====================
// O que sobrou no espeto pode ser oferecido aos deuses: o espeto fica livre e cada
// pedaço vira 1 favor. Na fogueira também dá para trocar um recurso por outro:
// a taxa é TAXA_TROCA → 1, e cada favor deixa uma troca em 1 → 1.
export const RECURSOS_TROCA = ['madeira', 'pedra', 'tijolo', 'carne', 'peixe', 'trigo', 'sementes'];
export { LOTES_TROCA };

export function oferecerEspeto() {
  const comida = mundo.comida, s = fogueira();
  if (!comida.servido || !s) return;
  const { prato, pedacos } = comida.servido;
  comida.servido = null;
  comida.torrando = null;
  mundo.favor += pedacos;
  luzDivina(s.x, s.y);
  textoFlutuante(s.x, s.y - 50, `Os deuses aceitaram ${PRATOS[prato].icone}! +${pedacos} ✨`, '#fff3b0');
  atualizarInventario();
}

// Quanto se recebe dando "qtd" (com favor a troca é 1 → 1)
export function recebidoNaTroca(qtd) { return mundo.favor > 0 ? qtd : Math.floor(qtd / TAXA_TROCA); }
export function podeTrocar(dar, receber, qtd) {
  return !!fogueira() && dar !== receber && temRecursos({ [dar]: qtd }) && recebidoNaTroca(qtd) > 0;
}
// Dá mais do que recebe (ou igual, com favor), então o resultado sempre cabe no estoque
export function trocarComDeuses(dar, receber, qtd) {
  if (!podeTrocar(dar, receber, qtd)) return;
  const recebe = recebidoNaTroca(qtd), s = fogueira();
  if (mundo.favor > 0) mundo.favor--;
  gastarRecursos({ [dar]: qtd });
  ganhar(receber, recebe);
  luzDivina(s.x, s.y);
  textoFlutuante(s.x, s.y - 50, 'Os deuses aceitaram a troca!', '#fff3b0');
  atualizarInventario();
}
