import { CARDUMES_MAX, ILHA, NOME_PAI, TEMPO_CRESCER } from './config.js';
import { construirEm } from './acoes.js';
import { agenteEm, cancelar, liberarAlvo, novoAgente } from './agentes.js';
import { animalEm, atualizarAnimais } from './animais.js';
import { adulta, arvoreEm, atualizarArvores, gerarArvores } from './arvores.js';
import { atualizarCardumes, novoCardume } from './cardumes.js';
import { atualizarEfeitos, textoFlutuante } from './efeitos.js';
import { motivoNaoPlantar, podeConstruirEm } from './espaco.js';
import { estruturaEm } from './estruturas.js';
import { atualizarMontes, gerarMontes, monteEm } from './montes.js';
import { expansaoPara, tarefaAterrar } from './expansao.js';
import { atualizarFamiliar } from './familia.js';
import { alternarEmbarque, atualizarEstruturas } from './jangada.js';
import { limparMundo, mundo, notificar } from './mundo.js';
import { executar, iniciarTarefa } from './tarefas.js';
import { atualizarCanteiros, clicarCampo } from './trigo.js';
import {
  abrirPainel, alternarCartas, alternarExpandir, alternarPlantar, atualizarInventario, cancelarTudo, definirModo, fecharPainel, validarPainel,
} from './ui.js';

// ===================== Início =====================
export function criarMundo() {
  limparMundo();
  mundo.jogador = novoAgente('jogador', ILHA.x, ILHA.y, { nome: NOME_PAI });
  mundo.agentes.push(mundo.jogador);
  gerarArvores(12);
  gerarMontes();
  for (let i = 0; i < CARDUMES_MAX; i++) novoCardume();
  atualizarInventario();
}

// ===================== Atualização =====================
function direcaoDoTeclado() {
  const { teclas } = mundo;
  let dx = 0, dy = 0;
  if (teclas['arrowleft']  || teclas['a']) dx -= 1;
  if (teclas['arrowright'] || teclas['d']) dx += 1;
  if (teclas['arrowup']    || teclas['w']) dy -= 1;
  if (teclas['arrowdown']  || teclas['s']) dy += 1;
  return { dx, dy };
}

export function atualizar(dt) {
  atualizarArvores(dt);
  atualizarEstruturas(dt);

  const { dx, dy } = direcaoDoTeclado();
  executar(mundo.jogador, dt, dx, dy);

  for (const a of mundo.agentes) if (a !== mundo.jogador) atualizarFamiliar(a, dt);
  atualizarAnimais(dt);
  atualizarCardumes(dt);
  atualizarCanteiros(dt);
  atualizarMontes(dt);
  atualizarEfeitos(dt);
}

// A interface é atualizada 4x por segundo (contadores, painéis)
let relogioUI = 0;
export function passo(dt) {
  atualizar(dt);
  relogioUI += dt;
  if (relogioUI > 0.25) {
    relogioUI = 0;
    validarPainel();
    notificar();
  }
}

// ===================== Entrada =====================
const TECLAS_MOVIMENTO = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'];

export function teclaPressionada(tecla) {
  const k = tecla.toLowerCase();
  if (k === 'p') { alternarPlantar(); return; }
  if (k === 'c') { alternarCartas(); return; }
  if (k === 'x') { alternarExpandir(); return; }
  if (k === 'e') { alternarEmbarque(); return; }
  if (k === 'escape') { cancelarTudo(); return; }
  mundo.teclas[k] = true;
  if (TECLAS_MOVIMENTO.includes(k)) cancelar(mundo.jogador);
}
export function teclaSolta(tecla) {
  mundo.teclas[tecla.toLowerCase()] = false;
}

export function moverPonteiro(p) {
  Object.assign(mundo.ponteiro, p);
}

export function clicar(p) {
  const { jogador, ui } = mundo;
  moverPonteiro(p);

  // Navegando: toque na jangada abre o painel, qualquer outro lugar é destino no mar
  if (jogador.embarcado) {
    if (estruturaEm(p) === jogador.embarcado) abrirPainel('jangada', jogador.embarcado);
    else { fecharPainel(); jogador.destino = p; }
    return;
  }

  if (ui.modo.tipo === 'plantar') {
    cancelar(jogador);
    const motivo = motivoNaoPlantar(p);
    if (!motivo) iniciarTarefa(jogador, { tipo: 'plantar', x: p.x, y: p.y, raio: 18 });
    else textoFlutuante(p.x, p.y - 10, motivo, '#ffb0a0');
    return;
  }
  if (ui.modo.tipo === 'expandir') {
    cancelar(jogador);
    if (expansaoPara(p)) iniciarTarefa(jogador, tarefaAterrar(p));
    else textoFlutuante(p.x, p.y - 10, 'Toque no mar, perto da praia', '#ffb0a0');
    return;
  }
  if (ui.modo.tipo === 'construir') {
    cancelar(jogador);
    const id = ui.modo.construcao;
    if (podeConstruirEm(id, p)) {
      construirEm(id, p);
      definirModo(null);
    } else textoFlutuante(p.x, p.y - 10, 'Não dá para construir aqui', '#ffb0a0');
    return;
  }

  // Família
  const ag = agenteEm(p);
  if (ag) { ag === mundo.esposa ? abrirPainel('esposa') : abrirPainel('filho', ag); return; }
  // Animais
  const an = animalEm(p);
  if (an) { abrirPainel('animal', an); return; }
  // Montes de barro / pedra
  const monte = monteEm(p);
  if (monte) { abrirPainel('monte', monte); return; }
  // Construções
  const s = estruturaEm(p);
  if (s) {
    if (s.tipo === 'totem') abrirPainel('totem', s);
    else if (s.tipo === 'campoTrigo') clicarCampo(s, p);
    else if (s.tipo === 'jangada') abrirPainel('jangada', s);
    else abrirPainel('estrutura', s);
    return;
  }

  fecharPainel();
  cancelar(jogador);
  const t = arvoreEm(p);
  if (t) {
    if (!adulta(t)) {
      textoFlutuante(t.x, t.y - 30, 'Ainda crescendo (' + Math.ceil(TEMPO_CRESCER - t.idade) + 's)', '#c8f0b0');
      return;
    }
    // Se alguém da família ia cortar essa, deixa para o jogador
    liberarAlvo('arvore', t);
    iniciarTarefa(jogador, { tipo: 'serrar', x: t.x, y: t.y, raio: t.raio, arvore: t });
  } else {
    jogador.destino = p;
    jogador.rota = null;
  }
}
