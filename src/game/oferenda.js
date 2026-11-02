import { LOTES_TROCA, TAXA_TROCA, TEMPO_FAVOR } from './config.js';
import { luzDivina, textoFlutuante } from './efeitos.js';
import { PRATOS, fogueira } from './fogueira.js';
import { estruturaDoTipo } from './estruturas.js';
import { gastarRecursos, ganhar, temRecursos } from './inventario.js';
import { mundo } from './mundo.js';
import { atualizarInventario } from './ui.js';

// ===================== Oferenda e troca com os deuses =====================
// Na fogueira, o que sobrou no espeto pode ser oferecido aos deuses: o espeto fica
// livre e vem o favor dos deuses por TEMPO_FAVOR segundos. No Totem da Vida dá para trocar
// um recurso por outro: a taxa é TAXA_TROCA → 1; com o favor ativo, 1 → 1.
// O favor não acumula: enquanto está ativo, não dá para oferecer de novo.
export const RECURSOS_TROCA = ['madeira', 'pedra', 'tijolo', 'carne', 'peixe', 'trigo', 'sementes'];
export { LOTES_TROCA };

export function favorAtivo() {
  return mundo.favor > 0;
}
export function podeOferecer() {
  return !!mundo.comida.servido && !!fogueira() && !favorAtivo();
}

export function oferecerEspeto() {
  const comida = mundo.comida,
    s = fogueira();
  if (!podeOferecer()) return;
  const { prato } = comida.servido;
  comida.servido = null;
  comida.torrando = null;
  mundo.favor = TEMPO_FAVOR;
  luzDivina(s.x, s.y);
  textoFlutuante(s.x, s.y - 50, `Os deuses aceitaram ${PRATOS[prato].icone}! ✨ Troca 1 por 1 por ${TEMPO_FAVOR}s`, '#fff3b0');
  atualizarInventario();
}

export function atualizarFavor(dt) {
  if (!favorAtivo()) return;
  mundo.favor = Math.max(mundo.favor - dt, 0);
  if (!favorAtivo()) {
    const s = estruturaDoTipo('totem') ?? mundo.jogador;
    textoFlutuante(s.x, s.y - 60, 'O favor dos deuses acabou', '#fff3b0');
  }
}

// Quanto se recebe dando "qtd" (com o favor ativo a troca é 1 → 1)
export function recebidoNaTroca(qtd) {
  return favorAtivo() ? qtd : Math.floor(qtd / TAXA_TROCA);
}
export function podeTrocar(dar, receber, qtd) {
  return !!estruturaDoTipo('totem') && dar !== receber && temRecursos({ [dar]: qtd }) && recebidoNaTroca(qtd) > 0;
}
// Dá mais do que recebe (ou igual, com o favor), então o resultado sempre cabe no estoque
export function trocarComDeuses(dar, receber, qtd) {
  if (!podeTrocar(dar, receber, qtd)) return;
  const recebe = recebidoNaTroca(qtd),
    s = estruturaDoTipo('totem');
  gastarRecursos({ [dar]: qtd });
  ganhar(receber, recebe);
  luzDivina(s.x, s.y);
  textoFlutuante(s.x, s.y - 110, 'Os deuses aceitaram a troca!', '#fff3b0');
  atualizarInventario();
}
