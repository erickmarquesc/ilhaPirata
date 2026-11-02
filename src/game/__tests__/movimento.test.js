import { beforeEach, describe, expect, it } from 'vitest';
import { FATOR_PE, ILHA, TEMPO_TRAVADO } from '../config.js';
import { novoAgente } from '../agentes.js';
import { novaArvore } from '../arvores.js';
import { dentroDaIlha, raioIlha } from '../ilha.js';
import { mover } from '../movimento.js';
import { limparMundo, mundo } from '../mundo.js';

const DT = 1 / 60;
const { x: cx, y: cy } = ILHA;

function arvore(x, y, raio = 20) {
  const t = novaArvore(x, y, true);
  t.raio = raio;
  mundo.arvores.push(t);
  return t;
}
// Círculo fechado de árvores em volta de (x, y): sobra só um espacinho no meio
function cercarDeArvores(x, y) {
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    arvore(x + Math.cos(ang) * 14, y + Math.sin(ang) * 14);
  }
}
// Anda em direção ao destino por até "segundos"; chama "cadaQuadro" depois de cada passo
function andarAte(a, destino, segundos, cadaQuadro = () => {}) {
  for (let t = 0; t < segundos; t += DT) {
    if (Math.hypot(destino.x - a.x, destino.y - a.y) < 5) return true;
    mover(a, destino.x - a.x, destino.y - a.y, DT);
    cadaQuadro(t + DT);
  }
  return Math.hypot(destino.x - a.x, destino.y - a.y) < 5;
}

beforeEach(() => limparMundo());

describe('mover', () => {
  it('contorna uma árvore no caminho sem atravessar o tronco', () => {
    const t = arvore(cx + 100, cy);
    const colisao = t.raio * 0.35 + 10 * FATOR_PE;
    const a = novoAgente('jogador', cx, cy);
    let fantasma = false;
    const chegou = andarAte(a, { x: cx + 200, y: cy }, 5, () => {
      if (a.fantasma > 0) fantasma = true;
      expect(Math.hypot(a.x - t.x, a.y - t.y)).toBeGreaterThanOrEqual(colisao);
    });
    expect(chegou).toBe(true);
    expect(fantasma, 'contornou usando a rede de segurança').toBe(false);
  });

  it(`rede de segurança: preso, sai depois de TEMPO_TRAVADO (${TEMPO_TRAVADO} s)`, () => {
    cercarDeArvores(cx, cy);
    const a = novoAgente('jogador', cx, cy);
    let saiu = null;
    andarAte(a, { x: cx + 150, y: cy }, TEMPO_TRAVADO + 2, t => {
      const longe = Math.hypot(a.x - cx, a.y - cy) > 20;
      if (t < TEMPO_TRAVADO - 0.05) {
        expect(a.fantasma ?? 0, `rede ligou cedo, em ${t.toFixed(2)} s`).toBeLessThanOrEqual(0);
        expect(longe, `saiu antes da rede, em ${t.toFixed(2)} s`).toBe(false);
      }
      if (longe && saiu === null) saiu = t;
    });
    expect(saiu, 'continuou preso').not.toBeNull();
    expect(saiu).toBeLessThan(TEMPO_TRAVADO + 1);
  });

  it('nunca entra no mar andando da praia para fora', () => {
    const r = raioIlha(0);
    const a = novoAgente('jogador', cx + r - 30, cy);
    andarAte(a, { x: cx + r + 100, y: cy }, 5, () => {
      expect(dentroDaIlha(a.x, a.y, a.raio)).toBe(true);
    });
  });

  it('nunca entra no mar nem com a rede de segurança ligada', () => {
    const r = raioIlha(0);
    const centro = { x: cx + r - 32, y: cy };
    cercarDeArvores(centro.x, centro.y);
    const a = novoAgente('jogador', centro.x, centro.y);
    let fantasma = false;
    andarAte(a, { x: cx + r + 100, y: cy + 40 }, 6, () => {
      if (a.fantasma > 0) fantasma = true;
      expect(dentroDaIlha(a.x, a.y, a.raio)).toBe(true);
    });
    expect(fantasma, 'a rede de segurança deveria ter ligado').toBe(true);
  });
});
