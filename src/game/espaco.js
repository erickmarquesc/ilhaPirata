import { CONSTRUCOES } from './construcoes.js';
import { DISTANCIA_MIN_ARVORES, DISTANCIA_MIN_CONSTRUCAO } from './config.js';
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
  for (const m of mundo.montes) if (Math.hypot(m.x - x, m.y - y) < m.raio * 0.8 + raio * 0.5) return false;
  return true;
}
export function espacoLivre(x, y, raio, folga, checarJogador = true, checarArvores = true) {
  const { arvores, estruturas, jogador } = mundo;
  if (checarArvores && arvores.some(t => Math.hypot(t.x - x, t.y - y) < t.raio + raio + folga)) return false;
  if (estruturas.some(s => Math.hypot(s.x - x, s.y - y) < (s.ocupa || s.raio) + raio + folga)) return false;
  if (mundo.montes.some(m => Math.hypot(m.x - x, m.y - y) < m.raio + raio + folga)) return false;
  if (checarJogador && Math.hypot(jogador.x - x, jogador.y - y) < jogador.raio + raio + 4) return false;
  return true;
}
export function podePlantarEm(p) { return naGrama(p.x, p.y) && espacoLivre(p.x, p.y, 18, DISTANCIA_MIN_ARVORES - 36); }
// ===================== Construir =====================
// Formas no chão: áreas cercadas são quadrados (h = meio lado), o resto é círculo (r).
function formaDaConstrucao(id, x, y) {
  const c = CONSTRUCOES[id];
  return c.area ? { x, y, h: c.raio } : { x, y, r: c.raio };
}
function formaDaEstrutura(s) { return s.area ? { x: s.x, y: s.y, h: s.raio } : { x: s.x, y: s.y, r: s.raio }; }
function formaDoMonte(m) { return { x: m.x, y: m.y, r: m.raio }; }

// Distância entre as bordas de duas formas (negativa quando se sobrepõem)
export function folgaEntre(a, b) {
  if (a.h === undefined && b.h === undefined) return Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;
  if (a.h !== undefined && b.h !== undefined) {
    const dx = Math.abs(a.x - b.x) - a.h - b.h, dy = Math.abs(a.y - b.y) - a.h - b.h;
    return dx > 0 || dy > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) : Math.max(dx, dy);
  }
  const [c, q] = a.h === undefined ? [a, b] : [b, a]; // círculo e quadrado
  const dx = Math.abs(c.x - q.x) - q.h, dy = Math.abs(c.y - q.y) - q.h;
  const fora = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return (fora > 0 ? fora : Math.max(dx, dy)) - c.r;
}

// A forma inteira precisa estar em terra (borda e centro)
function formaEmTerra(f) {
  const pontos = [[0, 0]];
  if (f.h !== undefined) {
    for (const sx of [-1, 0, 1]) for (const sy of [-1, 0, 1]) pontos.push([sx * f.h, sy * f.h]);
  } else {
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pontos.push([Math.cos(a) * f.r, Math.sin(a) * f.r]); }
  }
  return pontos.every(([dx, dy]) => dentroDaIlha(f.x + dx, f.y + dy, 2));
}

// Só outra construção ou um monte impedem (sempre com a folga mínima).
// Árvores embaixo são derrubadas; pessoas e animais saem andando.
export function podeConstruirEm(id, p) {
  const c = CONSTRUCOES[id];
  const forma = formaDaConstrucao(id, p.x, p.y);
  const lugarOk = c.local ? c.local(p) : formaEmTerra(forma);
  return lugarOk &&
    mundo.estruturas.every(s => folgaEntre(forma, formaDaEstrutura(s)) >= DISTANCIA_MIN_CONSTRUCAO) &&
    mundo.montes.every(m => folgaEntre(forma, formaDoMonte(m)) >= DISTANCIA_MIN_CONSTRUCAO);
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
