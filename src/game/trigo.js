import { TEMPO_TRIGO_CRESCER } from './config.js';
import { cancelar } from './agentes.js';
import { textoFlutuante } from './efeitos.js';
import { mundo } from './mundo.js';
import { iniciarTarefa, rendimentoDe } from './tarefas.js';
import { cabeNoEstoque } from './inventario.js';
import { abrirPainel, fecharPainel } from './ui.js';

// ===================== Campo de trigo =====================
// O campo é uma grade de canteiros. Só ali dentro se planta trigo.
export function criarCanteiros(est) {
  const cols = 4, linhas = 4, passo = (est.raio * 2 - 12) / cols, lista = [];
  for (let l = 0; l < linhas; l++) for (let c = 0; c < cols; c++) {
    lista.push({
      x: est.x - est.raio + 6 + passo * (c + 0.5),
      y: est.y - est.raio + 6 + passo * (l + 0.5),
      tam: passo - 4, estado: 'vazio', idade: 0,
    });
  }
  return lista;
}
function canteiroEm(est, p) {
  return est.canteiros.find(k => Math.abs(p.x - k.x) < k.tam / 2 + 1 && Math.abs(p.y - k.y) < k.tam / 2 + 1);
}
export function contarCanteiros(est, estado) { return est.canteiros.filter(k => k.estado === estado).length; }

export function atualizarCanteiros(dt) {
  for (const est of mundo.estruturas) {
    if (!est.canteiros) continue;
    for (const k of est.canteiros) {
      if (k.estado !== 'crescendo') continue;
      k.idade += dt;
      if (k.idade >= TEMPO_TRIGO_CRESCER) k.estado = 'maduro';
    }
  }
}
function sementesTrigoLivres(excluir = null) {
  const aCaminho = mundo.agentes.filter(o => o !== excluir && o.tarefa && o.tarefa.tipo === 'plantarTrigo').length;
  return mundo.inventario.sementesTrigo - aCaminho;
}
export function clicarCampo(est, p) {
  const { jogador } = mundo;
  const k = canteiroEm(est, p);
  if (!k) { abrirPainel('campo', est); return; }
  fecharPainel();
  cancelar(jogador);
  if (k.estado === 'vazio') {
    if (sementesTrigoLivres() <= 0) { textoFlutuante(k.x, k.y - 12, 'Sem sementes de trigo', '#ffb0a0'); return; }
    iniciarTarefa(jogador, { tipo: 'plantarTrigo', canteiro: k, x: k.x, y: k.y, raio: 2 });
  }
  else if (k.estado === 'maduro') iniciarTarefa(jogador, { tipo: 'colher', canteiro: k, x: k.x, y: k.y, raio: 2 });
  else textoFlutuante(k.x, k.y - 12, 'Trigo crescendo (' + Math.ceil(TEMPO_TRIGO_CRESCER - k.idade) + 's)', '#f5e6a0');
}
// Criança no campo: colhe o que está maduro, planta onde está vazio, senão espera no campo
export function cuidarDoCampo(a, campo) {
  const livre = k => !mundo.agentes.some(o => o !== a && o.tarefa && o.tarefa.canteiro === k);
  const perto = lista => lista.sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0];
  const maduro = perto(campo.canteiros.filter(k => k.estado === 'maduro' && livre(k)));
  const colher = maduro && { tipo: 'colher', canteiro: maduro, x: maduro.x, y: maduro.y, raio: 2 };
  if (colher && cabeNoEstoque(rendimentoDe(colher))) { iniciarTarefa(a, colher); return; }
  const vazio = sementesTrigoLivres(a) > 0 ? perto(campo.canteiros.filter(k => k.estado === 'vazio' && livre(k))) : null;
  if (vazio) { iniciarTarefa(a, { tipo: 'plantarTrigo', canteiro: vazio, x: vazio.x, y: vazio.y, raio: 2 }); return; }
  const m = campo.raio - 12;
  a.destino = { x: campo.x + (Math.random() * 2 - 1) * m, y: campo.y + (Math.random() * 2 - 1) * m };
  a.espera = 2 + Math.random() * 2;
}
