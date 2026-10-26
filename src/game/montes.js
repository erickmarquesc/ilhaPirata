import { ILHA, MONTES, QTD_POR_MONTE, TEMPO_RECARGA_MONTE } from './config.js';
import { textoFlutuante } from './efeitos.js';
import { dentroDaIlha } from './ilha.js';
import { ganhar } from './inventario.js';
import { mundo } from './mundo.js';
import { pausado } from './pausas.js';

// ===================== Montes de barro e de pedra =====================
// Cada monte tem 500 unidades. Um filho adulto por vez coleta 1 unidade a cada ação.
// Quando zera, o monte fica esgotado por 60s e depois volta a ter 500.
export function gerarMontes() {
  for (const tipo of Object.keys(MONTES)) {
    const { raio } = MONTES[tipo];
    for (let i = 0; i < 300; i++) {
      const a = Math.random() * Math.PI * 2, d = ILHA.raio * (0.35 + Math.random() * 0.3);
      const x = ILHA.x + Math.cos(a) * d, y = ILHA.y + Math.sin(a) * d;
      if (!dentroDaIlha(x, y, 80)) continue;
      if (mundo.montes.some(m => Math.hypot(m.x - x, m.y - y) < 160)) continue;
      mundo.montes.push({ tipo, x, y, raio, restante: QTD_POR_MONTE, recarga: 0 });
      // tira as árvores que ficariam em cima do monte
      mundo.arvores = mundo.arvores.filter(t => Math.hypot(t.x - x, t.y - y) > raio + t.raio + 12);
      break;
    }
  }
}

export function monteEm(p) {
  return mundo.montes.find(m => Math.hypot(p.x - m.x, p.y - m.y) < m.raio + 6);
}
export function trabalhadorDo(monte) {
  return mundo.agentes.find(a => a.tarefa && a.tarefa.tipo === 'coletar' && a.tarefa.monte === monte);
}
export function tarefaColetar(monte) {
  return { tipo: 'coletar', monte, x: monte.x, y: monte.y, raio: monte.raio };
}

// Preferência pela ordem de nascimento entre os filhos adultos:
// o 1º adulto prefere pedra, o 2º prefere barro (tijolo); os demais pegam o mais perto
const PREFERENCIA = ['pedra', 'barro'];
export function recursoPreferido(a) {
  const adultos = mundo.agentes.filter(f => f.tipo === 'adulto').sort((x, y) => (x.ordem ?? Infinity) - (y.ordem ?? Infinity));
  return PREFERENCIA[adultos.indexOf(a)] ?? null;
}
function outrosNoMonte(m, a) {
  return mundo.agentes.filter(f => f !== a && f.tarefa && f.tarefa.tipo === 'coletar' && f.tarefa.monte === m);
}
function recursoPausado(m) { return pausado(MONTES[m.tipo].recurso); }
function livrePara(m, a) { return m.restante > 0 && !recursoPausado(m) && !outrosNoMonte(m, a).length; }
// O monte preferido só conta como ocupado se quem está nele também o prefere;
// quem está lá "de favor" cede o lugar na próxima unidade (ver coletarUma)
function monteLivrePreferido(a) {
  const tipo = recursoPreferido(a);
  return tipo ? mundo.montes.find(m => m.tipo === tipo && m.restante > 0 && !recursoPausado(m) &&
    !outrosNoMonte(m, a).some(f => recursoPreferido(f) === tipo)) : null;
}

// Obrigação do filho adulto: pega o monte livre do tipo preferido; se não tiver
// (esgotado ou ocupado), o monte livre mais perto, para não ficar parado
export function monteLivreParaColetar(a) {
  const preferido = monteLivrePreferido(a);
  if (preferido) return preferido;
  let melhor = null, dist = Infinity;
  for (const m of mundo.montes) {
    if (!livrePara(m, a)) continue;
    const d = Math.hypot(m.x - a.x, m.y - a.y);
    if (d < dist) { dist = d; melhor = m; }
  }
  return melhor;
}

// Coleta 1 unidade. Devolve a próxima tarefa (continua no mesmo monte, ou vai para o
// monte preferido se ele ficou livre) ou null.
export function coletarUma(monte, a) {
  if (monte.restante <= 0) return null;
  const { recurso, acabou } = MONTES[monte.tipo];
  monte.restante -= 1;
  ganhar(recurso, 1);
  textoFlutuante(monte.x, monte.y - 20, '+1 ' + (recurso === 'tijolo' ? '🧱' : '🪨'), '#f0d8c0');
  if (monte.restante <= 0) {
    monte.recarga = TEMPO_RECARGA_MONTE;
    textoFlutuante(monte.x, monte.y - 40, acabou, '#ffe9b0');
    return null;
  }
  const preferido = monteLivrePreferido(a);
  if (preferido && preferido !== monte) return tarefaColetar(preferido);
  // o jogador pausou este recurso: para depois desta unidade
  if (recursoPausado(monte)) return null;
  // está aqui de favor e o dono chegou: cede o lugar e procura outro monte livre
  if (outrosNoMonte(monte, a).length) {
    const outro = monteLivreParaColetar(a);
    return outro ? tarefaColetar(outro) : null;
  }
  return tarefaColetar(monte);
}

export function esgotado(monte) { return monte.restante <= 0; }

// Montes esgotados se recompõem com o tempo
export function atualizarMontes(dt) {
  for (const m of mundo.montes) {
    if (m.restante > 0) continue;
    m.recarga -= dt;
    if (m.recarga <= 0) {
      m.recarga = 0;
      m.restante = QTD_POR_MONTE;
      textoFlutuante(m.x, m.y - 40, MONTES[m.tipo].voltou, '#c8f0b0');
    }
  }
}
