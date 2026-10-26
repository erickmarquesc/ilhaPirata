import { PEDACOS_POR_PRATO, TEMPO_ENTRE_PEDIDOS, TEMPO_PRIMEIRO_PEDIDO, TEMPO_TORRAR } from './config.js';
import { CONSTRUCOES } from './construcoes.js';
import { cancelar } from './agentes.js';
import { textoFlutuante } from './efeitos.js';
import { estruturaDoTipo, linhaDoNivel } from './estruturas.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { mundo } from './mundo.js';
import { iniciarTarefa } from './tarefas.js';
import { atualizarInventario, definirModo } from './ui.js';

// ===================== Fogueira =====================
// Jones cozinha na fogueira: churrasco gasta carne, peixada gasta peixe.
// Cada prato rende 5 pedaços e fica no espeto até o último ser comido; enquanto
// tiver comida no espeto, Jones não cozinha outro prato.
// Depois do 1º churrasco a família passa a conhecer a comida: de tempos em tempos
// a esposa ou um filho para o que está fazendo, vai até a fogueira e pede um prato.
// Se o prato no espeto for o pedido, come um pedaço e volta ao trabalho; se for outro,
// fica esperando ele acabar para Jones fazer o que pediu.
// Se mais da metade da família está esperando outro prato, o do espeto torra
// depois de alguns segundos e se perde, para ninguém ficar travado esperando.
export const PRATOS = {
  churrasco: { nome: 'Churrasco', icone: '🍖', recurso: 'carne', pronto: 'Churrasco pronto!' },
  peixada: { nome: 'Peixada', icone: '🐟', recurso: 'peixe', pronto: 'Peixada pronta!' },
};

export function fogueira() { return estruturaDoTipo('fogueira'); }

// Quanto cada prato gasta no nível atual da fogueira
export function consumoDaFogueira(nivel = fogueira()?.nivel ?? 1) {
  return linhaDoNivel(CONSTRUCOES.fogueira, nivel).consumo;
}
export function custoDoPrato(prato, nivel) {
  return { [PRATOS[prato].recurso]: consumoDaFogueira(nivel) };
}
// Prato no espeto: { prato, pedacos } ou null
export function pratoServido() { return mundo.comida.servido; }
export function podeCozinhar(prato) {
  const { jogador } = mundo;
  return !!fogueira() && !jogador.embarcado && !pratoServido() && temRecursos(custoDoPrato(prato));
}
export function pedidoDe(a) { return mundo.comida.pedidos.find(p => p.quem === a); }

// Ação do painel da fogueira
export function cozinhar(prato) {
  const { jogador } = mundo;
  const s = fogueira();
  if (!podeCozinhar(prato)) return;
  definirModo(null);
  cancelar(jogador);
  iniciarTarefa(jogador, { tipo: 'cozinhar', construcao: 'fogueira', prato, estrutura: s, x: s.x, y: s.y, raio: s.raio });
}

function sortearEspera() {
  const [min, max] = TEMPO_ENTRE_PEDIDOS;
  return min + Math.random() * (max - min);
}

// Conclusão da tarefa "cozinhar" (chamada por tarefas.js): o prato vai para o espeto
export function concluirCozinhar(t) {
  const p = PRATOS[t.prato], custo = custoDoPrato(t.prato);
  const comida = mundo.comida;
  if (comida.servido) return;
  if (!temRecursos(custo)) { textoFlutuante(t.x, t.y - 20, `Falta ${p.icone} para ${p.nome.toLowerCase()}`, '#ffb0a0'); return; }
  gastarRecursos(custo);
  comida.servido = { prato: t.prato, pedacos: PEDACOS_POR_PRATO };
  textoFlutuante(t.x, t.y - 40, `${p.pronto} ${p.icone} ×${PEDACOS_POR_PRATO}`);
  if (t.prato === 'churrasco' && !comida.conhece) {
    comida.conhece = true;
    comida.espera = TEMPO_PRIMEIRO_PEDIDO;
    textoFlutuante(t.x, t.y - 60, 'A família agora conhece o churrasco!', '#ffd0a0');
  }
}

// ===================== Pedidos de comida =====================
// Quem pode parar o que está fazendo para pedir: a esposa (fora da cabana e sem bebê)
// e qualquer filho que não esteja na jangada, ajudando numa obra ou já pedindo comida.
function podePedir(a) {
  if (a === mundo.jogador || a.embarcado || a.dentro || pedidoDe(a)) return false;
  if (a.tarefa && ['ajudar', 'embarcar', 'esperarNaCabana', 'cuidarNaCabana'].includes(a.tarefa.tipo)) return false;
  if (a === mundo.esposa) return a.cuidado <= 0 && mundo.jogador.tarefa?.tipo !== 'namorar';
  return true;
}

function lugarDoPedido(s) {
  // em volta da frente da fogueira (lado da câmera)
  const ang = Math.PI * (0.15 + Math.random() * 0.7);
  const d = s.raio + 12 + Math.random() * 8;
  return { x: s.x + Math.cos(ang) * d, y: s.y + Math.sin(ang) * d };
}

function novoPedido(s) {
  const candidatos = mundo.agentes.filter(podePedir);
  if (!candidatos.length) return;
  const quem = candidatos[Math.floor(Math.random() * candidatos.length)];
  // só pede peixada se der para conseguir peixe (tem peixe ou já tem a jangada)
  const temPeixe = mundo.inventario.peixe > 0 || !!estruturaDoTipo('jangada');
  const prato = temPeixe && Math.random() < 0.5 ? 'peixada' : 'churrasco';
  const p = lugarDoPedido(s);
  cancelar(quem);
  iniciarTarefa(quem, { tipo: 'pedirComida', prato, x: p.x, y: p.y, raio: 4 });
  mundo.comida.pedidos.push({ quem, prato });
  textoFlutuante(quem.x, quem.y - 40, `${quem.nome} está com fome!`, '#ffd0a0');
  atualizarInventario();
}

// Quem já chegou na fogueira e pediu o prato do espeto come um pedaço
function servirPedidos() {
  const comida = mundo.comida;
  for (const pedido of [...comida.pedidos]) {
    const servido = comida.servido;
    if (!servido) return;
    const { quem } = pedido;
    if (pedido.prato !== servido.prato || !quem.acao) continue;
    servido.pedacos--;
    const p = PRATOS[servido.prato];
    textoFlutuante(quem.x, quem.y - 40, `${quem.nome}: Que delícia! ${p.icone}`, '#ffe9b0');
    comida.pedidos.splice(comida.pedidos.indexOf(pedido), 1);
    cancelar(quem);
    quem.espera = 1;
    if (servido.pedacos <= 0) {
      comida.servido = null;
      const s = fogueira();
      textoFlutuante(s.x, s.y - 50, `${p.nome} acabou!`, '#ffd0a0');
    }
    atualizarInventario();
  }
}

// Mais da metade da família (esposa e filhos) na fogueira querendo outro prato:
// conta o tempo e, se continuar assim, o prato do espeto torra
function verificarTorra(dt, s) {
  const comida = mundo.comida, servido = comida.servido;
  const familia = mundo.agentes.filter(a => a !== mundo.jogador).length;
  const querOutro = servido ? comida.pedidos.filter(p => p.quem.acao && p.prato !== servido.prato).length : 0;
  if (!servido || querOutro <= familia / 2) { comida.torrando = null; return; }
  const p = PRATOS[servido.prato];
  if (comida.torrando === null) {
    comida.torrando = TEMPO_TORRAR;
    textoFlutuante(s.x, s.y - 50, `${p.nome} está torrando! 🔥`, '#ffb0a0');
  }
  comida.torrando -= dt;
  if (comida.torrando > 0) return;
  comida.servido = null;
  comida.torrando = null;
  textoFlutuante(s.x, s.y - 50, `${p.nome} torrou! Os pedaços se perderam`, '#ffb0a0');
  atualizarInventario();
}

export function atualizarPedidosDeComida(dt) {
  const comida = mundo.comida;
  const s = fogueira();
  if (!comida.conhece || !s) return;
  // quem pediu e foi chamado para outra coisa (obra, cabana, cresceu...) desiste do pedido
  comida.pedidos = comida.pedidos.filter(({ quem }) => mundo.agentes.includes(quem) && quem.tarefa?.tipo === 'pedirComida');
  servirPedidos();
  verificarTorra(dt, s);
  comida.espera -= dt;
  if (comida.espera <= 0) {
    const antes = comida.pedidos.length;
    novoPedido(s);
    // ninguém disponível agora: tenta de novo daqui a pouco
    comida.espera = comida.pedidos.length > antes ? sortearEspera() : 5;
  }
}
