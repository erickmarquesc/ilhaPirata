import { ILHA } from './config.js';
import { dentroDaIlha, pontoAreia } from './ilha.js';
import { mundo } from './mundo.js';
import { podeFicar } from './espaco.js';

// ===== Rotas inteligentes =====
// Compara o caminho reto pelo meio da ilha com o caminho pela faixa de areia.
// O caminho reto fica "caro" quando passa no meio de árvores ou construções.
function distPontoSegmento(px, py, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / l2));
  return Math.hypot(px - (a.x + vx * t), py - (a.y + vy * t));
}
function custoSegmento(a, b) {
  // andar pelo meio da ilha (grama, mato) é mais "caro" que pela areia
  let custo = Math.hypot(b.x - a.x, b.y - a.y) * 1.3;
  for (const t of mundo.arvores) if (distPontoSegmento(t.x, t.y, a, b) < 26) custo += 60;
  for (const s of mundo.estruturas) if (!s.area && distPontoSegmento(s.x, s.y, a, b) < s.raio + 12) custo += 400;
  return custo;
}
function planejarRota(a, alvo) {
  const direto = Math.hypot(alvo.x - a.x, alvo.y - a.y);
  if (direto < 70) return [{ x: alvo.x, y: alvo.y }];
  const custoReto = custoSegmento(a, alvo);
  if (custoReto <= direto * 1.15) return [{ x: alvo.x, y: alvo.y }]; // caminho livre: vai reto
  // Caminho pela areia: desce até a praia, contorna e sobe até o alvo
  const angA = Math.atan2(a.y - ILHA.y, a.x - ILHA.x), angB = Math.atan2(alvo.y - ILHA.y, alvo.x - ILHA.x);
  const dif = Math.atan2(Math.sin(angB - angA), Math.cos(angB - angA));
  const passos = Math.max(1, Math.ceil(Math.abs(dif) / 0.2));
  const rota = [];
  for (let i = 0; i <= passos; i++) rota.push(pontoAreia(angA + dif * i / passos));
  rota.push({ x: alvo.x, y: alvo.y });
  let custoAreia = custoSegmento(a, rota[0]) + custoSegmento(rota[rota.length - 2], alvo);
  for (let i = 1; i < rota.length - 1; i++) custoAreia += Math.hypot(rota[i].x - rota[i - 1].x, rota[i].y - rota[i - 1].y);
  return custoAreia < custoReto ? rota : [{ x: alvo.x, y: alvo.y }];
}
// Próximo ponto para onde andar (segue a rota até o destino)
export function proximoPonto(a) {
  const d = a.destino;
  if (!a.rota || !a.rotaPara || Math.hypot(a.rotaPara.x - d.x, a.rotaPara.y - d.y) > 25) {
    a.rota = planejarRota(a, d);
    a.rotaPara = { x: d.x, y: d.y };
  }
  while (a.rota.length > 1 && Math.hypot(a.rota[0].x - a.x, a.rota[0].y - a.y) < 10) a.rota.shift();
  return a.rota.length > 1 ? a.rota[0] : d;
}

// ===================== Movimento =====================
export function mover(a, dx, dy, dt) {
  const len = Math.hypot(dx, dy);
  if (!len) return true;
  const passo = a.velocidade * dt;
  const mx = dx / len * passo, my = dy / len * passo;
  // Se estiver preso dentro de algo (ex.: plantaram em cima), deixa sair
  const preso = !podeFicar(a.x, a.y, a.raio);
  const ok = (x, y) => podeFicar(x, y, a.raio) || (preso && dentroDaIlha(x, y, a.raio));
  // Contornando um obstáculo: mantém o desvio por um instante para não ficar indo e voltando
  if (a.desvio && a.desvio.t > 0) {
    a.desvio.t -= dt;
    const nx = a.x + Math.cos(a.desvio.ang) * passo, ny = a.y + Math.sin(a.desvio.ang) * passo;
    if (ok(nx, ny)) { a.x = nx; a.y = ny; return true; }
    a.desvio = null;
  }
  let moveu = false;
  if (Math.abs(mx) > 1e-6 && ok(a.x + mx, a.y)) { a.x += mx; moveu = true; }
  if (Math.abs(my) > 1e-6 && ok(a.x, a.y + my)) { a.y += my; moveu = true; }
  if (moveu) return true;
  // Travou de frente (ex.: árvore no caminho): contorna pelo lado
  const ang = Math.atan2(dy, dx), lado = a.ladoDesvio || 1;
  for (const giro of [1.57, -1.57, 2.3, -2.3]) {
    const angDesvio = ang + giro * lado;
    const nx = a.x + Math.cos(angDesvio) * passo, ny = a.y + Math.sin(angDesvio) * passo;
    if (ok(nx, ny)) { a.x = nx; a.y = ny; a.desvio = { ang: angDesvio, t: 0.4 }; return true; }
  }
  a.ladoDesvio = -lado;
  return false;
}
