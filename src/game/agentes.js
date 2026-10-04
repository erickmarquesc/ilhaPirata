import { VELOCIDADE } from './config.js';
import { mundo } from './mundo.js';

// ===================== Personagens (agentes) =====================
// Todos compartilham: posição, destino, tarefa (o que vão fazer) e ação (o que estão fazendo)
export function novoAgente(tipo, x, y, extra = {}) {
  return { tipo, x, y, raio: 10, velocidade: VELOCIDADE, destino: null, tarefa: null, acao: null, espera: 0, embarcado: null, ...extra };
}
export function agenteEm(p) {
  return mundo.agentes.find(a => a !== mundo.jogador && !a.dentro && Math.hypot(p.x - a.x, p.y - (a.y - a.raio * 0.5)) < a.raio + 10);
}
export function pertoDe(a, x, y, raio) { return Math.hypot(x - a.x, y - a.y) <= raio + a.raio + 8; }
export function cancelar(a) { a.destino = null; a.tarefa = null; a.acao = null; a.rota = null; }
// Cancela a tarefa de outros agentes que miram o mesmo alvo (o jogador tem prioridade)
export function liberarAlvo(campo, alvo) {
  for (const o of mundo.agentes) if (o !== mundo.jogador && o.tarefa && o.tarefa[campo] === alvo) cancelar(o);
}
