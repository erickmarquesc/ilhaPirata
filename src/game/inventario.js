import { mundo } from './mundo.js';

// ===================== Inventário =====================
export function temRecursos(custo) { return Object.entries(custo).every(([r, q]) => mundo.inventario[r] >= q); }
export function gastarRecursos(custo) {
  for (const [r, q] of Object.entries(custo)) { mundo.inventario[r] -= q; piscar(r); }
}
export function ganhar(recurso, qtd) {
  mundo.inventario[recurso] += qtd;
  piscar(recurso);
}
// Marca o recurso para a interface destacar o número
export function piscar(recurso) {
  mundo.ui.piscar[recurso] = (mundo.ui.piscar[recurso] || 0) + 1;
}
