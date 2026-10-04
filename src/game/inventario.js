import { ESTOQUE_BASE, ESTOQUE_POR_NIVEL_MOINHO } from './config.js';
import { estruturaDoTipo } from './estruturas.js';
import { mundo } from './mundo.js';

// ===================== Inventário =====================
export function temRecursos(custo) { return Object.entries(custo).every(([r, q]) => mundo.inventario[r] >= q); }
export function gastarRecursos(custo) {
  for (const [r, q] of Object.entries(custo)) { mundo.inventario[r] -= q; piscar(r); }
}
// Ganhos nunca passam da capacidade do estoque (as tarefas já checam antes, com cabeNoEstoque)
export function ganhar(recurso, qtd) {
  if (qtd > 0) qtd = Math.min(qtd, espacoNoEstoque());
  if (!qtd) return;
  mundo.inventario[recurso] += qtd;
  piscar(recurso);
}
// Marca o recurso para a interface destacar o número
export function piscar(recurso) {
  mundo.ui.piscar[recurso] = (mundo.ui.piscar[recurso] || 0) + 1;
}

// ===================== Estoque =====================
// A soma de todos os recursos é limitada; o moinho aumenta o limite.
export function totalNoEstoque() {
  return Object.values(mundo.inventario).reduce((soma, q) => soma + q, 0);
}
export function capacidadeDoEstoque(nivelMoinho = estruturaDoTipo('moinho')?.nivel ?? 0) {
  return ESTOQUE_BASE + ESTOQUE_POR_NIVEL_MOINHO * nivelMoinho;
}
export function espacoNoEstoque() { return Math.max(0, capacidadeDoEstoque() - totalNoEstoque()); }
export function cabeNoEstoque(qtd) { return qtd <= espacoNoEstoque(); }
