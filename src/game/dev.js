import { CONSTRUCOES } from './construcoes.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { mundo, notificar } from './mundo.js';

// ===================== Modo dev (só no npm run dev) =====================
// Para testes rápidos: com o modo ligado, as obras não gastam recursos, não pedem
// filhos ajudando nem o nível do totem, e ficam prontas assim que o Jones chega.
// O painel (components/Dev.jsx) também troca o nível das construções direto.
// No build (import.meta.env.DEV = false) nada disso existe.
export function devAtivo() {
  return import.meta.env.DEV && mundo.dev;
}

export function alternarDev() {
  if (!import.meta.env.DEV) return;
  mundo.dev = !mundo.dev;
  notificar();
}

// Custo de obra: no modo dev, sempre dá para pagar e não gasta nada
export function podePagarObra(custo) {
  return devAtivo() || temRecursos(custo);
}
export function pagarObra(custo) {
  if (!devAtivo()) gastarRecursos(custo);
}

// Troca o nível de uma construção já construída (sem obra nem custo)
export function definirNivel(id, nivel) {
  if (!devAtivo()) return;
  const est = mundo.estruturas.find(s => s.tipo === id);
  if (!est) return;
  est.nivel = Math.max(1, Math.min(nivel, CONSTRUCOES.totem.niveis.length));
  notificar();
}
export function definirNivelDeTodas(nivel) {
  for (const id of Object.keys(CONSTRUCOES)) definirNivel(id, nivel);
}
