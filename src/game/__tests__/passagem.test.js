import { beforeEach, describe, expect, it } from 'vitest';
import { DISTANCIA_MIN_CONSTRUCAO, ESPECIES, FATOR_PE, ILHA, MONTES } from '../config.js';
import { CONSTRUCOES } from '../construcoes.js';
import { novoAgente } from '../agentes.js';
import { folgaEntre, mioloDe } from '../espaco.js';
import { mover } from '../movimento.js';
import { limparMundo, mundo } from '../mundo.js';
import { colocarConstrucao, formaDe } from './ajudantes.js';

// Regra de passagem (plano 1 e config.js): duas construções (ou construção e monte) postas à
// folga mínima permitida sempre deixam um vão por onde quem anda passa sem a rede de segurança.
//
// Os pares saem do catálogo: todas as combinações de dois tipos de construção diferentes
// e cada construção com cada tipo de monte.
const tipos = Object.keys(CONSTRUCOES);
const pares = [];
for (let i = 0; i < tipos.length; i++) {
  for (let j = i + 1; j < tipos.length; j++) pares.push([tipos[i], tipos[j]]);
  for (const m of Object.keys(MONTES)) pares.push([tipos[i], 'monte:' + m]);
}
// Quem anda: as pessoas (raio 10, o maior pé) e o maior animal
const raios = [10, Math.max(...Object.values(ESPECIES).map(e => e.raio))];

const ehMonte = id => id.startsWith('monte:');
const raioDe = id => ehMonte(id) ? MONTES[id.slice(6)].raio : CONSTRUCOES[id].raio;
function colocar(id, x, y) {
  if (!ehMonte(id)) return colocarConstrucao(id, x, y);
  const m = { tipo: id.slice(6), x, y, raio: raioDe(id), restante: 500, recarga: 0 };
  mundo.montes.push(m);
  return m;
}
const formaDoId = (id, x, y) => ehMonte(id) ? { x, y, r: raioDe(id) } : formaDe(id, x, y);
// Distância ao centro abaixo da qual quem tem esse raio fica bloqueado (igual a podeFicar)
function bloqueio(obj, raio) {
  if (mundo.montes.includes(obj)) return obj.raio * 0.8 + raio * 0.5;
  if (obj.area) return null; // área cercada não bloqueia
  return mioloDe(obj) + Math.min(raio, 10) * FATOR_PE;
}

beforeEach(() => limparMundo());

// Monta o par alinhado no eixo x, com a folga mínima entre as bordas
function montarPar(a, b) {
  const xA = ILHA.x - 60, y = ILHA.y;
  const xB = xA + raioDe(a) + raioDe(b) + DISTANCIA_MIN_CONSTRUCAO;
  const A = colocar(a, xA, y), B = colocar(b, xB, y);
  return { A, B, y, vaoX: xA + raioDe(a) + DISTANCIA_MIN_CONSTRUCAO / 2 };
}

describe.each(pares)('%s + %s à folga mínima', (a, b) => {
  it('as formas ficam exatamente à folga mínima', () => {
    const { A, B } = montarPar(a, b);
    expect(folgaEntre(formaDoId(a, A.x, A.y), formaDoId(b, B.x, B.y))).toBeCloseTo(DISTANCIA_MIN_CONSTRUCAO);
  });

  it.each(raios)('sobra vão entre os bloqueios (raio %i)', raio => {
    const { A, B } = montarPar(a, b);
    const bA = bloqueio(A, raio), bB = bloqueio(B, raio);
    if (bA === null || bB === null) return; // um dos dois não bloqueia: passagem livre
    expect(Math.hypot(B.x - A.x, B.y - A.y) - bA - bB).toBeGreaterThan(0);
  });

  // reto: atravessa perpendicular ao par; diagonal: cruza o vão inclinado, raspando nas bordas
  it.each([
    ['reto', raio => [raio, 0]],
    ['diagonal', raio => [raio, 30]],
  ].flatMap(([nome, f]) => raios.map(r => [nome, r, f(r)[1]])))('atravessa o vão %s (raio %i)', (_, raio, desvio) => {
    const { A, B, y, vaoX } = montarPar(a, b);
    const p = novoAgente('adulto', vaoX - desvio, y - 80, { raio });
    const destino = { x: vaoX + desvio, y: y + 80 };
    let chegou = false;
    for (let t = 0; t < 2 && !chegou; t += 1 / 60) {
      mover(p, destino.x - p.x, destino.y - p.y, 1 / 60);
      expect(p.fantasma ?? 0, 'usou a rede de segurança').toBeLessThanOrEqual(0);
      for (const o of [A, B]) {
        const lim = bloqueio(o, raio);
        if (lim !== null) expect(Math.hypot(p.x - o.x, p.y - o.y)).toBeGreaterThanOrEqual(lim - 1e-9);
      }
      chegou = Math.hypot(destino.x - p.x, destino.y - p.y) < 5;
    }
    expect(chegou, `parou em (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).toBe(true);
  });
});
