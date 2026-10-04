import { ILHA, MUNDO, ANEL_AREIA } from './config.js';
import { podeFicar } from './espaco.js';
import { mundo } from './mundo.js';

// ===================== Ilha =====================
const ondas = [
  { freq: 3, amp: 0.08, fase: 0.7 },
  { freq: 5, amp: 0.05, fase: 2.1 },
  { freq: 7, amp: 0.03, fase: 4.0 },
];

// Cada expansão é uma "lombada" suave no raio da ilha, centrada no ângulo onde foi aterrada
function alturaExpansao(e, angulo) {
  const d = Math.atan2(Math.sin(angulo - e.ang), Math.cos(angulo - e.ang)) / e.larg;
  return e.alt * Math.exp(-d * d);
}
// extras: expansões ainda não feitas (para prever como a ilha vai ficar)
export function raioIlha(angulo, extras = []) {
  let r = 1;
  for (const o of ondas) r += Math.sin(angulo * o.freq + o.fase) * o.amp;
  r *= ILHA.raio;
  for (const e of mundo.expansoes) r += alturaExpansao(e, angulo);
  for (const e of extras) r += alturaExpansao(e, angulo);
  return r;
}
export function dentroDaIlha(x, y, margem = 0, extras = []) {
  const dx = x - ILHA.x, dy = y - ILHA.y;
  return Math.hypot(dx, dy) <= raioIlha(Math.atan2(dy, dx), extras) - margem;
}
export function naGrama(x, y) { return dentroDaIlha(x, y, 55); }

export function pontoAreia(ang) {
  const r = raioIlha(ang) - ANEL_AREIA;
  return { x: ILHA.x + Math.cos(ang) * r, y: ILHA.y + Math.sin(ang) * r };
}
export function pontoTerraPerto(x, y) {
  const ang = Math.atan2(y - ILHA.y, x - ILHA.x);
  const r = raioIlha(ang) - 14;
  return { x: ILHA.x + Math.cos(ang) * r, y: ILHA.y + Math.sin(ang) * r };
}
export function terraLivrePerto(x, y, deslocamento = 0) {
  const ang0 = Math.atan2(y - ILHA.y, x - ILHA.x) + deslocamento;
  for (const off of [0, 0.04, -0.04, 0.08, -0.08, 0.14, -0.14, 0.2, -0.2]) {
    for (const recuo of [14, 24, 36]) {
      const ang = ang0 + off, r = raioIlha(ang) - recuo;
      const p = { x: ILHA.x + Math.cos(ang) * r, y: ILHA.y + Math.sin(ang) * r };
      if (podeFicar(p.x, p.y, 10)) return p;
    }
  }
  return null;
}
export function podeNavegar(x, y, r) {
  if (x < r || y < r || x > MUNDO.w - r || y > MUNDO.h - r) return false;
  const ang = Math.atan2(y - ILHA.y, x - ILHA.x);
  return Math.hypot(x - ILHA.x, y - ILHA.y) >= raioIlha(ang) + r * 0.4;
}
