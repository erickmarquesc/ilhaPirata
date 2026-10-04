import {
  DESCANSO_VIAGEM, ILHA, PEIXES_POR_PESCA, PESCAS_POR_VIAGEM, TEMPO_EMPURRAR, TEMPO_PESCAR, VELOCIDADE_JANGADA,
} from './config.js';
import { cancelar } from './agentes.js';
import { cardumeMaisProximo, cardumeSob, removerCardume } from './cardumes.js';
import { textoFlutuante } from './efeitos.js';
import { emObra, estruturaDoTipo } from './estruturas.js';
import { dentroDaIlha, podeNavegar, pontoTerraPerto, terraLivrePerto } from './ilha.js';
import { cabeNoEstoque, ganhar } from './inventario.js';
import { mundo } from './mundo.js';
import { iniciarTarefa } from './tarefas.js';
import { atualizarInventario, definirModo } from './ui.js';

// ===================== Jangada: tripulação, navegação e pesca =====================
// A jangada só navega com DOIS adultos: o pai + um filho adulto, ou dois filhos adultos.
// est.tripulacao: quem está a bordo | est.reservadaPor: 'jogador' ou 'filhos'
export function jangadaNaAgua(est) { return !!est && est.empurrar !== undefined && est.empurrar >= 1; }
export function prepararJangada(est) {
  if (!est.tripulacao) Object.assign(est, { tripulacao: [], reservadaPor: null, viagem: null, pesca: 0, moveu: false, descansoViagem: 0 });
}
export function jangadaLivre(est) {
  prepararJangada(est);
  return jangadaNaAgua(est) && !est.reservadaPor && !est.tripulacao.length && !emObra('jangada');
}
function pertoDaPraia(est) {
  const p = pontoTerraPerto(est.x, est.y);
  return Math.hypot(p.x - est.x, p.y - est.y) <= est.raio + 36;
}
export function podeDesembarcar(est) { return !!est && pertoDaPraia(est) && !!terraLivrePerto(est.x, est.y); }
export function estaNoMar(est) { return !dentroDaIlha(est.x, est.y, 0); }

// ----- Tripulação -----
export function adultosLivres(excluir = []) {
  return mundo.agentes.filter(a => a.tipo === 'adulto' && !a.embarcado && !excluir.includes(a) &&
    !(a.tarefa && (a.tarefa.tipo === 'ajudar' || a.tarefa.tipo === 'embarcar')));
}
function vindoEmbarcar(est) { return mundo.agentes.filter(a => a.tarefa && a.tarefa.tipo === 'embarcar' && a.tarefa.estrutura === est); }
function mandarEmbarcar(a, est) {
  cancelar(a);
  const p = pontoTerraPerto(est.x, est.y);
  iniciarTarefa(a, { tipo: 'embarcar', estrutura: est, x: p.x, y: p.y, raio: 4 });
}
// Garante que alguém está a caminho para completar os dois adultos
function chamarTripulante(est) {
  if (est.tripulacao.length + vindoEmbarcar(est).length >= 2) return true;
  const livres = adultosLivres();
  if (!livres.length) return false;
  livres.sort((a, b) => Math.hypot(a.x - est.x, a.y - est.y) - Math.hypot(b.x - est.x, b.y - est.y));
  mandarEmbarcar(livres[0], est);
  return true;
}
export function embarcar(a, est) {
  cancelar(a);
  a.embarcado = est;
  a.x = est.x; a.y = est.y;
  est.tripulacao.push(a);
  if (est.tripulacao.length === 2) textoFlutuante(est.x, est.y - 60, 'Zarpando! ⛵', '#c8e8ff');
  if (a === mundo.jogador) definirModo(null);
}
function desembarcarTodos(est) {
  est.tripulacao.forEach((m, i) => {
    const p = terraLivrePerto(est.x, est.y, i * 0.06) || terraLivrePerto(est.x, est.y) || pontoTerraPerto(est.x, est.y);
    m.embarcado = null;
    cancelar(m);
    m.x = p.x; m.y = p.y;
    m.espera = 1;
  });
  for (const a of vindoEmbarcar(est)) cancelar(a);
  est.tripulacao = [];
  est.reservadaPor = null;
  est.viagem = null;
  est.pesca = 0;
  definirModo(null);
}

// ----- Jogador -----
export function irEmbarcar(est) {
  const { jogador } = mundo;
  if (!est || jogador.embarcado || !jangadaLivre(est) || !adultosLivres().length) return;
  definirModo(null);
  cancelar(jogador);
  est.reservadaPor = 'jogador';
  mandarEmbarcar(jogador, est);
  chamarTripulante(est);
}
export function desembarcar() {
  const { jogador } = mundo;
  const est = jogador.embarcado;
  if (!podeDesembarcar(est)) return;
  desembarcarTodos(est);
  textoFlutuante(jogador.x, jogador.y - 30, 'Terra firme!', '#ffe9b0');
  atualizarInventario();
}
// Tecla E: embarca ou desembarca
export function alternarEmbarque() {
  if (mundo.jogador.embarcado) desembarcar();
  else { const j = estruturaDoTipo('jangada'); if (j) irEmbarcar(j); }
}

// ----- Filhos adultos saem sozinhos para pescar -----
export function tentarViagemDePesca(a) {
  const est = estruturaDoTipo('jangada');
  if (!est || !jangadaLivre(est) || est.descansoViagem > 0) return false;
  if (!mundo.cardumes.some(c => c.peixes > 0)) return false;
  if (!cabeNoEstoque(PEIXES_POR_PESCA)) return false; // estoque cheio: nem saem
  const outros = adultosLivres([a]);
  if (!outros.length) return false;   // precisa de dois adultos
  est.reservadaPor = 'filhos';
  est.viagem = null;
  mandarEmbarcar(a, est);
  mandarEmbarcar(outros[0], est);
  return true;
}

// ----- Movimento no mar -----
function moverJangada(est, dx, dy, dt) {
  const len = Math.hypot(dx, dy);
  if (!len) return false;
  const passo = VELOCIDADE_JANGADA * dt;
  const mx = dx / len * passo, my = dy / len * passo;
  let moveu = false;
  if (podeNavegar(est.x + mx, est.y, est.raio)) { est.x += mx; moveu = true; }
  if (podeNavegar(est.x, est.y + my, est.raio)) { est.y += my; moveu = true; }
  if (moveu) est.moveu = true;
  return moveu;
}
// Vai até um ponto; se a ilha estiver no caminho, contorna pela costa
function rumoPara(est, alvo, dt) {
  if (moverJangada(est, alvo.x - est.x, alvo.y - est.y, dt)) return;
  const a1 = Math.atan2(est.y - ILHA.y, est.x - ILHA.x), a2 = Math.atan2(alvo.y - ILHA.y, alvo.x - ILHA.x);
  const dif = Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
  const sentido = dif >= 0 ? 1 : -1;
  moverJangada(est, -Math.sin(a1) * sentido + Math.cos(a1) * 0.3, Math.cos(a1) * sentido + Math.sin(a1) * 0.3, dt);
}

export function navegar(dt, dx, dy) {
  const { jogador } = mundo;
  const est = jogador.embarcado;
  if (est.tripulacao.length < 2) { chamarTripulante(est); jogador.destino = null; return; } // espera o filho
  if (!dx && !dy && jogador.destino) {
    const vx = jogador.destino.x - est.x, vy = jogador.destino.y - est.y;
    if (Math.hypot(vx, vy) < 4) jogador.destino = null;
    else { dx = vx; dy = vy; }
  }
  if ((dx || dy) && !moverJangada(est, dx, dy, dt)) jogador.destino = null;
}

// ----- Atualização da jangada (a cada quadro) -----
function viagemDosFilhos(est, dt) {
  if (!est.viagem) est.viagem = { fase: 'ir', pescas: 0 };
  const v = est.viagem;
  if (v.pescas >= PESCAS_POR_VIAGEM || !cabeNoEstoque(PEIXES_POR_PESCA)) v.fase = 'voltar';
  if (v.fase === 'ir') {
    const alvo = cardumeMaisProximo(est);
    if (!alvo) v.fase = 'voltar';
    else if (Math.hypot(alvo.x - est.x, alvo.y - est.y) < 8) v.fase = 'pescar'; // chega no meio do cardume
    else rumoPara(est, alvo, dt);
  } else if (v.fase === 'pescar') {
    if (!cardumeSob(est)) v.fase = 'ir';
  } else if (v.fase === 'voltar') {
    if (podeDesembarcar(est)) {
      textoFlutuante(est.x, est.y - 60, 'Os filhos voltaram da pesca!', '#c8e8ff');
      desembarcarTodos(est);
      est.descansoViagem = DESCANSO_VIAGEM;
    } else {
      rumoPara(est, pontoTerraPerto(est.x, est.y), dt);
    }
  }
}

function pescar(est, dt) {
  // Pesca: dois adultos a bordo, jangada parada em cima de um cardume
  const c = est.tripulacao.length === 2 && !est.moveu ? cardumeSob(est) : null;
  est.estoqueCheio = !!c && !cabeNoEstoque(PEIXES_POR_PESCA);
  if (!c || est.estoqueCheio) { est.pesca = 0; return; }
  c.parado = 0.3;   // cardume fica parado enquanto estão pescando nele
  est.pesca += dt;
  if (est.pesca < TEMPO_PESCAR) return;
  est.pesca = 0;
  c.peixes -= 1;
  ganhar('peixe', PEIXES_POR_PESCA);
  textoFlutuante(est.x, est.y - 55, '+' + PEIXES_POR_PESCA + ' 🐟', '#c8e8ff');
  if (est.viagem) est.viagem.pescas += 1;
  if (c.peixes <= 0) removerCardume(c);
  atualizarInventario();
}

function atualizarJangada(est, dt) {
  const { jogador } = mundo;
  prepararJangada(est);
  if (est.descansoViagem > 0) est.descansoViagem -= dt;

  // Reserva abandonada: libera a jangada
  if (est.reservadaPor === 'jogador' && !jogador.embarcado && !(jogador.tarefa && jogador.tarefa.estrutura === est)) {
    desembarcarTodos(est);
  }
  if (est.reservadaPor === 'filhos' && est.tripulacao.length < 2 && !chamarTripulante(est)) {
    desembarcarTodos(est);
  }

  // Viagem automática dos filhos
  if (est.reservadaPor === 'filhos' && est.tripulacao.length === 2) viagemDosFilhos(est, dt);

  pescar(est, dt);
  est.moveu = false;

  // Tripulação acompanha a jangada
  for (const m of est.tripulacao) { m.x = est.x; m.y = est.y; }
}

// Depois de pronta, a jangada é empurrada da praia até a água
function empurrarParaAgua(est, dt) {
  est.empurrar = Math.min(est.empurrar + dt / TEMPO_EMPURRAR, 1);
  const e = est.empurrar < 0.5 ? 2 * est.empurrar ** 2 : 1 - (-2 * est.empurrar + 2) ** 2 / 2; // suave
  est.x = est.praia.x + (est.agua.x - est.praia.x) * e;
  est.y = est.praia.y + (est.agua.y - est.praia.y) * e;
  if (est.empurrar >= 1) textoFlutuante(est.x, est.y - 60, 'A jangada está na água! 🌊', '#c8e8ff');
}

export function atualizarEstruturas(dt) {
  for (const est of mundo.estruturas) {
    if (est.tipo === 'jangada' && jangadaNaAgua(est)) atualizarJangada(est, dt);
    if (est.empurrar !== undefined && est.empurrar < 1) empurrarParaAgua(est, dt);
  }
}
