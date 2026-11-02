import { FATOR_ARVORE_CHUVA, ILHA, MADEIRA_POR_ARVORE, SEMENTES_POR_ARVORE, TEMPO_CRESCER, TEMPO_SERRAR } from './config.js';
import { ritmoDasPlantas } from './chuva.js';
import { dentroDaIlha } from './ilha.js';
import { mundo } from './mundo.js';

// ===================== Árvores =====================
// tipo: 'pinheiro' (comum) ou 'chuva' (nasce quando chove; vale FATOR_ARVORE_CHUVA vezes mais)
export function novaArvore(x, y, adulta, tipo = 'pinheiro') {
  const t = { x, y, tipo, raio: 14 + Math.random() * 6, idade: 0 };
  if (adulta) t.idade = tempoCrescer(t);
  return t;
}
const fator = t => t.tipo === 'chuva' ? FATOR_ARVORE_CHUVA : 1;
export function tempoCrescer(t) { return TEMPO_CRESCER * fator(t); }
export function tempoSerrar(t) { return TEMPO_SERRAR * fator(t); }
export function madeiraDe(t) { return MADEIRA_POR_ARVORE * fator(t); }
export function sementesDe(t) { return SEMENTES_POR_ARVORE * fator(t); }
export function adulta(t) { return t.idade >= tempoCrescer(t); }
export function crescimento(t) { return Math.min(t.idade / tempoCrescer(t), 1); }

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
  const passo = dt * ritmoDasPlantas(); // na chuva crescem mais rápido
  for (const t of mundo.arvores) if (!adulta(t)) t.idade += passo;
}
