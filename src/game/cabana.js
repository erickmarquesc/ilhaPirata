import { cancelar } from './agentes.js';
import { estruturaDoTipo } from './estruturas.js';
import { mundo } from './mundo.js';

// ===================== Dentro da cabana =====================
// Quem está dentro some do mapa (a.dentro = cabana) e fica parado na porta.
// Namorar e cuidar do bebê acontecem lá dentro.
export const TAREFAS_NA_CABANA = ['namorar', 'esperarNaCabana', 'cuidarNaCabana'];

export function cabanaDaFamilia() { return estruturaDoTipo('cabana'); }

// Ponto em frente à porta, fora da cabana (a porta fica na frente, lado +y do mundo)
export function portaDaCabana(cabana) {
  return { x: cabana.x + 5, y: cabana.y + cabana.raio + 8 };
}
export function tarefaNaPorta(tipo, cabana) {
  const p = portaDaCabana(cabana);
  return { tipo, cabana, x: p.x, y: p.y, raio: 4 };
}

export function entrarNaCabana(a, cabana) {
  const p = portaDaCabana(cabana);
  a.dentro = cabana;
  a.x = p.x; a.y = p.y;
  a.destino = null; a.rota = null;
}
export function sairDaCabana(a, desvio = 0) {
  if (!a.dentro) return;
  const p = portaDaCabana(a.dentro);
  a.dentro = null;
  a.x = p.x + desvio; a.y = p.y + 4;
  a.espera = 1;
}

// Está dentro por um motivo válido? (senão sai: ex. o jogador cancelou o namoro)
export function temMotivoParaFicar(a) {
  return !!a.tarefa && TAREFAS_NA_CABANA.includes(a.tarefa.tipo);
}
export function sairSemMotivo(a) {
  if (a.dentro && !temMotivoParaFicar(a)) { cancelar(a); sairDaCabana(a); }
}
