import { CARDUMES_MAX, ILHA, PEIXES_POR_CARDUME, TEMPO_NOVO_CARDUME } from './config.js';
import { podeNavegar, raioIlha } from './ilha.js';
import { mundo } from './mundo.js';

// ===================== Cardumes =====================
export function novoCardume() {
  const { cardumes } = mundo;
  for (let i = 0; i < 60; i++) {
    const ang = Math.random() * Math.PI * 2;
    const min = raioIlha(ang) + 60;
    const d = min + Math.random() * 120;
    const x = ILHA.x + Math.cos(ang) * d, y = ILHA.y + Math.sin(ang) * d;
    if (!podeNavegar(x, y, 32)) continue;
    if (cardumes.some(c => Math.hypot(c.x - x, c.y - y) < 110)) continue;
    cardumes.push({ x, y, raio: 30, peixes: PEIXES_POR_CARDUME, dir: Math.random() * Math.PI * 2, fase: Math.random() * 10 });
    return;
  }
}
export function cardumeSob(est) {
  return mundo.cardumes.find(c => c.peixes > 0 && Math.hypot(c.x - est.x, c.y - est.y) < c.raio + est.raio);
}
export function cardumeMaisProximo(est) {
  let melhor = null, dist = Infinity;
  for (const c of mundo.cardumes) {
    if (c.peixes <= 0) continue;
    const d = Math.hypot(c.x - est.x, c.y - est.y);
    if (d < dist) { dist = d; melhor = c; }
  }
  return melhor;
}
export function removerCardume(c) {
  mundo.cardumes.splice(mundo.cardumes.indexOf(c), 1);
}
export function atualizarCardumes(dt) {
  for (const c of mundo.cardumes) {
    c.fase += dt;
    if (c.parado > 0) { c.parado -= dt; continue; }
    if (Math.random() < dt * 0.3) c.dir += (Math.random() - 0.5) * 1.5;
    const nx = c.x + Math.cos(c.dir) * 4 * dt, ny = c.y + Math.sin(c.dir) * 4 * dt;
    if (podeNavegar(nx, ny, 32)) { c.x = nx; c.y = ny; } else c.dir += Math.PI;
  }
  if (mundo.cardumes.length < CARDUMES_MAX) {
    mundo.relogioCardume += dt;
    if (mundo.relogioCardume >= TEMPO_NOVO_CARDUME) { mundo.relogioCardume = 0; novoCardume(); }
  }
}
