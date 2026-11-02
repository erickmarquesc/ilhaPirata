import { beforeEach, describe, expect, it } from 'vitest';
import { DISTANCIA_MIN_CONSTRUCAO, ILHA, MONTES } from '../config.js';
import { novaArvore } from '../arvores.js';
import { folgaEntre, mioloDe, motivoNaoPlantar, podeConstruirEm, podeFicar, saidaDaBorda } from '../espaco.js';
import { raioIlha } from '../ilha.js';
import { limparMundo, mundo } from '../mundo.js';
import { colocarConstrucao } from './ajudantes.js';

const { x: cx, y: cy } = ILHA;
const monte = (x, y) => ({ tipo: 'pedra', x, y, raio: MONTES.pedra.raio, restante: 500, recarga: 0 });
// Ponto na areia, a "recuo" da costa, no ângulo 0 (lado +x)
const naCosta = recuo => ({ x: cx + raioIlha(0) - recuo, y: cy });

beforeEach(() => limparMundo());

describe('folgaEntre', () => {
  it('círculo com círculo', () => {
    expect(folgaEntre({ x: 0, y: 0, r: 10 }, { x: 30, y: 0, r: 5 })).toBeCloseTo(15);
    expect(folgaEntre({ x: 0, y: 0, r: 10 }, { x: 10, y: 0, r: 5 })).toBeCloseTo(-5); // sobrepostos
  });
  it('quadrado com quadrado', () => {
    expect(folgaEntre({ x: 0, y: 0, h: 10 }, { x: 30, y: 0, h: 5 })).toBeCloseTo(15);
    expect(folgaEntre({ x: 0, y: 0, h: 10 }, { x: 30, y: 30, h: 5 })).toBeCloseTo(Math.hypot(15, 15)); // quina com quina
    expect(folgaEntre({ x: 0, y: 0, h: 10 }, { x: 12, y: 0, h: 5 })).toBeCloseTo(-3); // sobrepostos
  });
  it('círculo com quadrado, nas duas ordens', () => {
    const c = { x: 0, y: 0, r: 5 };
    expect(folgaEntre(c, { x: 30, y: 0, h: 10 })).toBeCloseTo(15);
    expect(folgaEntre({ x: 30, y: 0, h: 10 }, c)).toBeCloseTo(15);
    expect(folgaEntre(c, { x: 20, y: 20, h: 10 })).toBeCloseTo(Math.hypot(10, 10) - 5); // na quina
    expect(folgaEntre(c, { x: 0, y: 0, h: 10 })).toBeCloseTo(-15); // círculo dentro do quadrado
  });
});

describe('podeFicar', () => {
  it('livre no meio da ilha vazia', () => {
    expect(podeFicar(cx, cy, 10)).toBe(true);
  });
  it('fora da ilha não pode', () => {
    expect(podeFicar(cx, cy + 700, 10)).toBe(false);
  });
  it('árvore bloqueia só o miolo do tronco', () => {
    const t = novaArvore(cx + 100, cy, true);
    t.raio = 20; // miolo 7 + pé 4 = 11
    mundo.arvores.push(t);
    expect(podeFicar(cx + 105, cy, 10)).toBe(false);
    expect(podeFicar(cx + 115, cy, 10)).toBe(true);
  });
  it('construção bloqueia só o miolo; a borda deixa ficar', () => {
    const s = colocarConstrucao('totem', cx - 100, cy);
    const limite = mioloDe(s) + 4; // pé de quem tem raio 10
    expect(podeFicar(s.x + limite - 1, cy, 10)).toBe(false);
    expect(podeFicar(s.x + limite + 1, cy, 10)).toBe(true);
    expect(podeFicar(s.x + s.raio - 1, cy, 10)).toBe(true); // dentro do raio cheio, na borda macia
  });
  it('área cercada não bloqueia', () => {
    colocarConstrucao('campoTrigo', cx, cy);
    expect(podeFicar(cx, cy, 10)).toBe(true);
  });
  it('monte bloqueia', () => {
    mundo.montes.push(monte(cx, cy - 100));
    expect(podeFicar(cx, cy - 85, 10)).toBe(false);
    expect(podeFicar(cx, cy - 75, 10)).toBe(true);
  });
});

describe('podeConstruirEm', () => {
  it('outra construção: pode com a folga mínima exata, não pode com menos', () => {
    colocarConstrucao('totem', cx, cy);
    const d = 16 + 14 + DISTANCIA_MIN_CONSTRUCAO; // totem + fogueira + folga
    expect(podeConstruirEm('fogueira', { x: cx + d, y: cy })).toBe(true);
    expect(podeConstruirEm('fogueira', { x: cx + d - 1, y: cy })).toBe(false);
  });
  it('área cercada também respeita a folga (como quadrado)', () => {
    colocarConstrucao('curral', cx, cy);
    const d = 44 + 14 + DISTANCIA_MIN_CONSTRUCAO;
    expect(podeConstruirEm('fogueira', { x: cx + d, y: cy })).toBe(true);
    expect(podeConstruirEm('fogueira', { x: cx + d - 1, y: cy })).toBe(false);
  });
  it('monte: pode com a folga mínima exata, não pode com menos', () => {
    mundo.montes.push(monte(cx, cy));
    const d = MONTES.pedra.raio + 16 + DISTANCIA_MIN_CONSTRUCAO;
    expect(podeConstruirEm('totem', { x: cx + d, y: cy })).toBe(true);
    expect(podeConstruirEm('totem', { x: cx + d - 1, y: cy })).toBe(false);
  });
  it('não pode no mar nem com a borda passando da costa', () => {
    expect(podeConstruirEm('totem', { x: cx, y: cy + 700 })).toBe(false);
    expect(podeConstruirEm('totem', naCosta(5))).toBe(false);
  });
  it('jangada só na areia, colada na água', () => {
    expect(podeConstruirEm('jangada', naCosta(20))).toBe(true);
    expect(podeConstruirEm('jangada', { x: cx, y: cy })).toBe(false);
  });
});

describe('motivoNaoPlantar', () => {
  it('pode no meio da grama vazia', () => {
    expect(motivoNaoPlantar({ x: cx, y: cy })).toBeNull();
  });
  it('fora da grama', () => {
    expect(motivoNaoPlantar(naCosta(20))).toBe('Só dá para plantar na grama');
  });
  it('perto de outra árvore', () => {
    mundo.arvores.push(novaArvore(cx, cy, false));
    expect(motivoNaoPlantar({ x: cx + 30, y: cy })).toBe('Muito perto de outra árvore');
  });
  it('perto de uma construção', () => {
    colocarConstrucao('totem', cx, cy);
    expect(motivoNaoPlantar({ x: cx + 30, y: cy })).toBe('Muito perto de uma construção'); // folga 4 < 6
    expect(motivoNaoPlantar({ x: cx + 33, y: cy })).toBeNull();
  });
  it('perto do monte', () => {
    mundo.montes.push(monte(cx, cy));
    expect(motivoNaoPlantar({ x: cx + 34, y: cy })).toBe('Muito perto do monte');
  });
});

describe('saidaDaBorda', () => {
  it('fora da borda: null', () => {
    colocarConstrucao('totem', cx, cy);
    expect(saidaDaBorda(cx + 30, cy, 10)).toBeNull();
  });
  it('área cercada não tem borda', () => {
    colocarConstrucao('campoTrigo', cx, cy);
    expect(saidaDaBorda(cx + 10, cy, 10)).toBeNull();
  });
  it('dentro da borda: aponta para fora, do tamanho de quanto entrou', () => {
    colocarConstrucao('totem', cx, cy); // fim da borda = 16 + 4 = 20
    const s = saidaDaBorda(cx + 15, cy, 10);
    expect(s.dx).toBeCloseTo(5);
    expect(s.dy).toBeCloseTo(0);
    const diag = saidaDaBorda(cx - 12, cy - 12, 10);
    expect(diag.dx).toBeLessThan(0);
    expect(diag.dy).toBeLessThan(0);
  });
  it('nunca maior que a largura da borda', () => {
    const s = colocarConstrucao('totem', cx, cy);
    const largura = s.raio + 4 - (mioloDe(s) + 4);
    const saida = saidaDaBorda(cx + 2, cy, 10);
    expect(Math.hypot(saida.dx, saida.dy)).toBeCloseTo(largura);
  });
});
