import { CONSTRUCOES } from '../construcoes.js';
import { mundo } from '../mundo.js';

// ===================== Ajudantes dos testes =====================
// Gerador com semente (mulberry32): a mesma semente repete a mesma partida
export function geradorComSemente(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Construção pronta no mapa, no mesmo formato que a obra cria (ver CONCLUIR.construir em tarefas.js)
export function colocarConstrucao(tipo, x, y, nivel = 1) {
  const c = CONSTRUCOES[tipo];
  const est = { tipo, x, y, raio: c.raio, nivel };
  if (c.area) { est.area = true; est.ocupa = c.raio * 1.42; }
  mundo.estruturas.push(est);
  return est;
}

// Forma no chão, igual à de espaco.js: área = quadrado (h), resto = círculo (r)
export function formaDe(tipo, x, y) {
  const c = CONSTRUCOES[tipo];
  return c.area ? { x, y, h: c.raio } : { x, y, r: c.raio };
}
