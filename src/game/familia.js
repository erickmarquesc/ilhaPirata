import { DISTANCIA_MIN_ARVORES, RESERVA_SEMENTES, TEMPO_CUIDAR_BEBE, TEMPO_DESCANSO } from './config.js';
import { cancelar, novoAgente } from './agentes.js';
import { adulta } from './arvores.js';
import { cacavel } from './animais.js';
import { textoFlutuante, luzDivina } from './efeitos.js';
import { lugarLivrePerto, podeFicar, podePlantarEm } from './espaco.js';
import { estruturaDoTipo } from './estruturas.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { tentarViagemDePesca } from './jangada.js';
import { mundo } from './mundo.js';
import { PEDIDOS } from './pedidos.js';
import { executar, iniciarTarefa } from './tarefas.js';
import { cuidarDoCampo } from './trigo.js';
import { atualizarInventario, fecharPainel } from './ui.js';

// ===================== Família =====================
export function podeNamorar() {
  const { esposa } = mundo;
  return !!esposa && esposa.gravidez <= 0 && esposa.cuidado <= 0 && esposa.descanso <= 0;
}
export function namorar() {
  const { jogador, esposa } = mundo;
  if (!esposa) return;
  cancelar(jogador);
  iniciarTarefa(jogador, { tipo: 'namorar', alvo: esposa, x: esposa.x, y: esposa.y, raio: esposa.raio });
}

export function pedirEsposa(id) {
  const p = PEDIDOS[id];
  const totem = estruturaDoTipo('totem');
  if (!totem || !p.disponivel() || !temRecursos(p.custo)) return;
  gastarRecursos(p.custo);
  const pos = lugarLivrePerto(totem.x, totem.y, 38);
  mundo.esposa = novoAgente('esposa', pos.x, pos.y, { velocidade: 120, gravidez: 0, cuidado: 0, descanso: 0, plantarProximo: false, espera: 1.8 });
  mundo.agentes.push(mundo.esposa);
  luzDivina(pos.x, pos.y);
  textoFlutuante(totem.x, totem.y - 90, 'Os deuses atenderam!', '#fff3b0');
  atualizarInventario();
  fecharPainel();
}

function virarAdulto(f) {
  Object.assign(f, { tipo: 'adulto', raio: 10, velocidade: 160, plantarProximo: false });
  cancelar(f);
  f.espera = 1;
  textoFlutuante(f.x, f.y - 35, f.nome + ' virou adulto!', '#b8d8ff');
}
function virarAdolescente(f) {
  Object.assign(f, { tipo: 'adolescente', raio: 9, velocidade: 140, plantarProximo: false });
  cancelar(f);
  f.espera = 1;
  textoFlutuante(f.x, f.y - 35, f.nome + ' virou adolescente!', '#b8f0e0');
}
function nascerCrianca(mae) {
  mundo.contadorFilhos++;
  const pos = lugarLivrePerto(mae.x, mae.y, 24);
  const c = novoAgente('crianca', pos.x, pos.y, { raio: 7, velocidade: 100, nome: 'Filho ' + mundo.contadorFilhos, espera: 1 });
  mundo.agentes.push(c);
  textoFlutuante(mae.x, mae.y - 40, 'O bebê virou criança!', '#c8e8ff');
}

// Contagem para o HUD: adultos, adolescentes, crianças e bebê
export function resumoFilhos() {
  const { agentes, esposa } = mundo;
  return {
    adultos: agentes.filter(a => a.tipo === 'adulto').length,
    adolescentes: agentes.filter(a => a.tipo === 'adolescente').length,
    criancas: agentes.filter(a => a.tipo === 'crianca').length,
    bebe: !!esposa && esposa.cuidado > 0,
  };
}

// ===================== Inteligência da família =====================
function ocupadaPorOutro(a, arvore) {
  return mundo.agentes.some(o => o !== a && o.tarefa && o.tarefa.arvore === arvore);
}
function arvoreMaisProxima(a) {
  let melhor = null, dist = Infinity;
  for (const t of mundo.arvores) {
    if (!adulta(t) || ocupadaPorOutro(a, t)) continue;
    const d = Math.hypot(t.x - a.x, t.y - a.y);
    if (d < dist) { dist = d; melhor = t; }
  }
  return melhor;
}
function acharLugarPlantio(a) {
  for (let i = 0; i < 40; i++) {
    const ang = Math.random() * Math.PI * 2, d = 40 + Math.random() * 120;
    const p = { x: a.x + Math.cos(ang) * d, y: a.y + Math.sin(ang) * d };
    if (!podePlantarEm(p)) continue;
    // evita dois plantando no mesmo lugar
    if (mundo.agentes.some(o => o.tarefa && o.tarefa.tipo === 'plantar' && Math.hypot(o.tarefa.x - p.x, o.tarefa.y - p.y) < DISTANCIA_MIN_ARVORES)) continue;
    return p;
  }
  return null;
}
function passear(a) {
  const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
  const p = { x: a.x + Math.cos(ang) * d, y: a.y + Math.sin(ang) * d };
  if (podeFicar(p.x, p.y, a.raio)) a.destino = p;
  a.espera = 1.5 + Math.random() * 1.5;
}
function tentarPlantar(a) {
  if (mundo.inventario.sementes <= RESERVA_SEMENTES) return false;
  const p = acharLugarPlantio(a);
  if (!p) return false;
  iniciarTarefa(a, { tipo: 'plantar', x: p.x, y: p.y, raio: 18 });
  return true;
}
function presaMaisProxima(a) {
  let melhor = null, dist = Infinity;
  for (const an of mundo.animais) {
    if (!cacavel(an)) continue;
    if (mundo.agentes.some(o => o !== a && o.tarefa && o.tarefa.alvo === an)) continue;
    const d = Math.hypot(an.x - a.x, an.y - a.y);
    if (d < dist) { dist = d; melhor = an; }
  }
  return melhor;
}
function escolherTarefa(a) {
  // Filhos adultos: com outro irmão adulto, pegam a jangada para pescar
  if (a.tipo === 'adulto' && tentarViagemDePesca(a)) return;
  // Adolescente e adulto caçam (a criança só planta)
  if (a.tipo === 'adolescente' || a.tipo === 'adulto') {
    const presa = presaMaisProxima(a);
    if (presa) { iniciarTarefa(a, { tipo: 'cacar', alvo: presa, x: presa.x, y: presa.y, raio: presa.raio }); return; }
  }
  if (a.tipo === 'esposa' || a.tipo === 'adolescente' || a.tipo === 'adulto') {
    // Depois de cortar uma árvore, planta uma semente
    if (a.plantarProximo) { a.plantarProximo = false; if (tentarPlantar(a)) return; }
    const t = arvoreMaisProxima(a);
    if (t) { iniciarTarefa(a, { tipo: 'serrar', x: t.x, y: t.y, raio: t.raio, arvore: t }); return; }
  }
  if (a.tipo === 'crianca') {
    // Com o campo de trigo pronto, a criança passa a cuidar só dele
    const campo = estruturaDoTipo('campoTrigo');
    if (campo) { cuidarDoCampo(a, campo); return; }
    if (tentarPlantar(a)) return;
  }
  passear(a);
}

// Gravidez, bebê e descanso da esposa. Devolve true se ela não deve fazer mais nada neste quadro.
function cicloDaEsposa(a, dt) {
  const { agentes, jogador } = mundo;
  if (a.gravidez > 0) {
    a.gravidez -= dt;
    if (a.gravidez <= 0) {
      a.gravidez = 0;
      a.cuidado = TEMPO_CUIDAR_BEBE;
      cancelar(a);
      textoFlutuante(a.x, a.y - 40, 'Nasceu um bebê! 👶', '#c8e8ff');
      // Cada nascimento empurra os irmãos: adolescente vira adulto, criança vira adolescente
      const adols = agentes.filter(f => f.tipo === 'adolescente');
      const cris = agentes.filter(f => f.tipo === 'crianca');
      adols.forEach(virarAdulto);
      cris.forEach(virarAdolescente);
      atualizarInventario();
    }
  }
  if (a.cuidado > 0) {
    a.cuidado -= dt;
    if (a.cuidado <= 0) { a.cuidado = 0; a.descanso = TEMPO_DESCANSO; nascerCrianca(a); atualizarInventario(); }
    return true; // cuidando do bebê: não faz mais nada
  }
  if (a.descanso > 0) {
    a.descanso -= dt;
    if (a.descanso <= 0) { a.descanso = 0; textoFlutuante(a.x, a.y - 40, 'Pronta para outro filho 💕', '#ffc0dd'); }
  }
  // Esperando o marido para namorar
  if (jogador.tarefa && jogador.tarefa.tipo === 'namorar') {
    if (a.tarefa || a.acao || a.destino) cancelar(a);
    return true;
  }
  return false;
}

export function atualizarFamiliar(a, dt) {
  if (a.embarcado) return; // na jangada: quem manda é a jangada
  if (a === mundo.esposa && cicloDaEsposa(a, dt)) return;
  if (!a.tarefa && !a.acao && !a.destino) {
    a.espera -= dt;
    if (a.espera <= 0) escolherTarefa(a);
  }
  executar(a, dt);
}
