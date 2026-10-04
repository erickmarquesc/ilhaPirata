import { CONSTRUCOES } from './construcoes.js';
import { cancelar } from './agentes.js';
import { custoEvolucao, estruturaDoTipo, requisitosOk } from './estruturas.js';
import { estaNoMar, prepararJangada } from './jangada.js';
import { pontoTerraPerto } from './ilha.js';
import { temRecursos } from './inventario.js';
import { mundo } from './mundo.js';
import { iniciarTarefa } from './tarefas.js';
import { abrirMenu, definirModo } from './ui.js';

// ===================== Ações disparadas pela interface =====================
export function evoluir(id) {
  const { jogador } = mundo;
  const s = estruturaDoTipo(id);
  if (!s || !temRecursos(custoEvolucao(s)) || !requisitosOk(id)) return;
  definirModo(null);
  abrirMenu(false);
  cancelar(jogador);
  if (jogador.embarcado) return;
  if (s.tipo === 'jangada') { prepararJangada(s); if (s.reservadaPor || s.tripulacao.length) return; }
  const noMar = estaNoMar(s);
  const pos = noMar ? pontoTerraPerto(s.x, s.y) : s;   // jangada no mar: trabalha a partir da praia
  iniciarTarefa(jogador, { tipo: 'evoluir', construcao: id, estrutura: s, x: pos.x, y: pos.y, raio: noMar ? 6 : s.raio });
}

export function escolherConstrucao(id) {
  if (estruturaDoTipo(id)) evoluir(id);
  else definirModo('construir', id);
}

export function construirEm(id, p) {
  iniciarTarefa(mundo.jogador, { tipo: 'construir', construcao: id, x: p.x, y: p.y, raio: CONSTRUCOES[id].raio });
}
