import { CONSTRUCOES } from './construcoes.js';
import { DISTANCIA_MIN_ARVORES } from './config.js';
import { dentroDaIlha, naGrama } from './ilha.js';
import { mundo } from './mundo.js';

// ===================== Regras de espaço =====================
// Colisão com árvore usa só o miolo do tronco e o "pé" do personagem.
// Como as árvores nunca ficam a menos de ~40 de distância, sempre sobra passagem entre elas.
function colisaoArvore(t, raio) { return t.raio * 0.35 + Math.min(raio, 10) * 0.4; }

export function podeFicar(x, y, raio) {
  if (!dentroDaIlha(x, y, raio)) return false;
  for (const t of mundo.arvores) if (Math.hypot(t.x - x, t.y - y) < colisaoArvore(t, raio)) return false;
  for (const s of mundo.estruturas) if (!s.area && Math.hypot(s.x - x, s.y - y) < s.raio + raio) return false;
  return true;
}
export function espacoLivre(x, y, raio, folga, checarJogador = true, checarArvores = true) {
  const { arvores, estruturas, jogador } = mundo;
  if (checarArvores && arvores.some(t => Math.hypot(t.x - x, t.y - y) < t.raio + raio + folga)) return false;
  if (estruturas.some(s => Math.hypot(s.x - x, s.y - y) < (s.ocupa || s.raio) + raio + folga)) return false;
  if (checarJogador && Math.hypot(jogador.x - x, jogador.y - y) < jogador.raio + raio + 4) return false;
  return true;
}
export function podePlantarEm(p) { return naGrama(p.x, p.y) && espacoLivre(p.x, p.y, 18, DISTANCIA_MIN_ARVORES - 36); }
export function podeConstruirEm(id, p) {
  const c = CONSTRUCOES[id];
  const ocupa = c.area ? c.raio * 1.42 : c.raio;   // área quadrada: usa a diagonal
  const lugarOk = c.local ? c.local(p) : dentroDaIlha(p.x, p.y, ocupa + 8);
  // árvores não impedem: as que estiverem no lugar são derrubadas (sem recursos)
  return lugarOk && espacoLivre(p.x, p.y, ocupa, 10, !c.area, false);
}
// Árvores que ficam embaixo da construção
export function arvoresAfetadas(id, p) {
  const c = CONSTRUCOES[id];
  return mundo.arvores.filter(t => c.area
    ? Math.abs(t.x - p.x) < c.raio + t.raio * 0.6 && Math.abs(t.y - p.y) < c.raio + t.raio * 0.6
    : Math.hypot(t.x - p.x, t.y - p.y) < c.raio + t.raio * 0.8);
}
export function lugarLivrePerto(x, y, dist) {
  for (let i = 0; i < 24; i++) {
    const ang = i / 24 * Math.PI * 2;
    const px = x + Math.cos(ang) * dist, py = y + Math.sin(ang) * dist;
    if (podeFicar(px, py, 10)) return { x: px, y: py };
  }
  return { x, y: y + dist };
}
