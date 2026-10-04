import { ILHA, TEMPO_CRESCER } from './config.js';
import { dentroDaIlha } from './ilha.js';
import { mundo } from './mundo.js';

// ===================== Árvores =====================
export function novaArvore(x, y, adulta) { return { x, y, raio: 14 + Math.random() * 6, idade: adulta ? TEMPO_CRESCER : 0 }; }
export function adulta(t) { return t.idade >= TEMPO_CRESCER; }
export function crescimento(t) { return Math.min(t.idade / TEMPO_CRESCER, 1); }

export function gerarArvores(qtd) {
  const { arvores } = mundo;
  let tentativas = 0;
  while (arvores.length < qtd && tentativas < 2000) {
    tentativas++;
    const a = Math.random() * Math.PI * 2, d = Math.random() * ILHA.raio * 0.75;
    const x = ILHA.x + Math.cos(a) * d, y = ILHA.y + Math.sin(a) * d;
    if (!dentroDaIlha(x, y, 70)) continue;
    if (Math.hypot(x - ILHA.x, y - ILHA.y) < 60) continue;
    if (arvores.some(t => Math.hypot(t.x - x, t.y - y) < 70)) continue;
    arvores.push(novaArvore(x, y, true));
  }
}

export function arvoreEm(p) {
  return mundo.arvores.find(t => {
    const c = 0.3 + 0.7 * crescimento(t);
    return Math.hypot(p.x - t.x, p.y - t.y) < t.raio + 6 ||
           Math.hypot(p.x - t.x, p.y - (t.y - t.raio * 0.9 * c)) < t.raio * 1.6 * c;
  });
}

export function removerArvores(lista) {
  mundo.arvores = mundo.arvores.filter(t => !lista.includes(t));
}

export function atualizarArvores(dt) {
  for (const t of mundo.arvores) if (t.idade < TEMPO_CRESCER) t.idade += dt;
}
