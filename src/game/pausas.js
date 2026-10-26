import { textoFlutuante } from './efeitos.js';
import { mundo, notificar } from './mundo.js';

// ===================== Pausar a produção da família =====================
// O jogador toca no medalhão do recurso no inventário para pausar ou retomar.
// A pausa vale só para a família (o jogador continua podendo produzir) e só para
// tarefas novas: quem já está trabalhando termina a unidade atual e para.
export const PAUSAVEIS = {
  carne: { nome: 'Caça', icone: '🍖' },
  peixe: { nome: 'Pesca', icone: '🐟' },
  madeira: { nome: 'Corte de árvores', icone: '🪵' },
  pedra: { nome: 'Coleta de pedra', icone: '🪨' },
  tijolo: { nome: 'Coleta de barro', icone: '🧱' },
  trigo: { nome: 'Colheita de trigo', icone: '🌾' },
};

export function pausado(recurso) { return !!mundo.pausas[recurso]; }
export function algumaPausa() { return Object.values(mundo.pausas).some(Boolean); }

export function alternarPausa(recurso) {
  const p = PAUSAVEIS[recurso];
  if (!p) return;
  mundo.pausas[recurso] = !mundo.pausas[recurso];
  const { jogador } = mundo;
  const feminino = !p.nome.startsWith('Corte');
  const estado = mundo.pausas[recurso] ? (feminino ? 'pausada' : 'pausado') : (feminino ? 'retomada' : 'retomado');
  textoFlutuante(jogador.x, jogador.y - 50, `${p.nome} ${estado} ${p.icone}`, mundo.pausas[recurso] ? '#ffd0a0' : '#c8f0b0');
  notificar();
}
