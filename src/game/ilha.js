import { ILHA, MUNDO, ANEL_AREIA } from './config.js';
import { podeFicar } from './espaco.js';

// ===================== Ilha =====================
const ondas = [
  { freq: 3, amp: 0.08, fase: 0.7 },
  { freq: 5, amp: 0.05, fase: 2.1 },
  { freq: 7, amp: 0.03, fase: 4.0 },
];

export function raioIlha(angulo) {
  let r = 1;
  for (const o of ondas) r += Math.sin(angulo * o.freq + o.fase) * o.amp;
  return ILHA.raio * r;
}
export function dentroDaIlha(x, y, margem = 0) {
  const dx = x - ILHA.x, dy = y - ILHA.y;
  return Math.hypot(dx, dy) <= raioIlha(Math.atan2(dy, dx)) - margem;
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
