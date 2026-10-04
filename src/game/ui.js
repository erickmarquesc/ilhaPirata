import { CUSTO_EXPANSAO } from './config.js';
import { CONSTRUCOES } from './construcoes.js';
import { requisitosOk } from './estruturas.js';
import { temRecursos } from './inventario.js';
import { mundo, notificar } from './mundo.js';

// ===================== Estado da interface =====================
// Modos (plantar / construir / expandir), cartas de construção e painel de interação.
// O React só lê mundo.ui; quem muda é sempre a engine, por estas funções.

export function definirModo(tipo, construcao = null) {
  const { ui, jogador, inventario } = mundo;
  if (tipo && jogador.embarcado) return; // navegando não planta nem constrói
  if (tipo === 'plantar' && inventario.sementes <= 0) return;
  if (tipo === 'expandir' && !temRecursos(CUSTO_EXPANSAO)) return;
  if (tipo === 'construir' && (!temRecursos(CONSTRUCOES[construcao].custo) || !requisitosOk(construcao))) return;
  ui.modo = { tipo, construcao };
  if (tipo) fecharPainel();
  notificar();
}
export function alternarPlantar() {
  definirModo(mundo.ui.modo.tipo === 'plantar' ? null : 'plantar');
}
export function alternarExpandir() {
  definirModo(mundo.ui.modo.tipo === 'expandir' ? null : 'expandir');
}

export function alternarCartas(abrir = !mundo.ui.cartasAbertas) {
  mundo.ui.cartasAbertas = abrir;
  notificar();
}

// tipo: 'totem' | 'esposa' | 'filho' | 'animal' | 'monte' | 'campo' | 'jangada' | 'estrutura'
export function abrirPainel(tipo, alvo = null) {
  mundo.ui.painel = { tipo, alvo };
  notificar();
}
export function fecharPainel() {
  mundo.ui.painel = null;
  notificar();
}
export function cancelarTudo() {
  definirModo(null);
  fecharPainel();
}

// O painel continua válido enquanto o alvo existir no mundo (pode ter sido caçado, por exemplo)
export function painelValido(p) {
  if (!p) return false;
  switch (p.tipo) {
    case 'totem': return true;
    case 'esposa': return !!mundo.esposa;
    case 'filho': return mundo.agentes.includes(p.alvo);
    case 'animal': return mundo.animais.includes(p.alvo);
    case 'monte': return mundo.montes.includes(p.alvo);
    default: return mundo.estruturas.includes(p.alvo);
  }
}
export function validarPainel() {
  if (mundo.ui.painel && !painelValido(mundo.ui.painel)) fecharPainel();
}

// Chamado depois de qualquer mudança no inventário / família
export function atualizarInventario() {
  const { modo } = mundo.ui;
  if (modo.tipo === 'plantar' && mundo.inventario.sementes <= 0) definirModo(null);
  if (modo.tipo === 'construir' && !temRecursos(CONSTRUCOES[modo.construcao].custo)) definirModo(null);
  if (modo.tipo === 'expandir' && !temRecursos(CUSTO_EXPANSAO)) definirModo(null);
  notificar();
}
