import { ESPECIES, TEMPO_CRESCER_ANIMAL, TEMPO_CRIA_ANIMAL } from './config.js';
import { cancelar, liberarAlvo } from './agentes.js';
import { luzDivina, textoFlutuante } from './efeitos.js';
import { lugarLivrePerto, podeFicar } from './espaco.js';
import { abrigoDe, estruturaDoTipo, limiteEspecie } from './estruturas.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { mover } from './movimento.js';
import { mundo } from './mundo.js';
import { PEDIDOS } from './pedidos.js';
import { iniciarTarefa } from './tarefas.js';
import { atualizarInventario, fecharPainel } from './ui.js';

// ===================== Animais =====================
// reprodutor: animal enviado pelos deuses (o casal). Não pode ser caçado.
export function novoAnimal(especie, sexo, x, y, reprodutor) {
  const E = ESPECIES[especie];
  return {
    especie, sexo, x, y, reprodutor,
    raio: E.raio, velocidade: E.velocidade,
    idade: reprodutor ? TEMPO_CRESCER_ANIMAL : 0,
    destino: null, espera: 1 + Math.random() * 2, cria: 0, dir: 1,
  };
}
export function nomeAnimal(an) { return ESPECIES[an.especie].nome[an.sexo]; }
export function iconeAnimal(an) { return ESPECIES[an.especie].icone[an.sexo]; }
export function animalAdulto(an) { return an.idade >= TEMPO_CRESCER_ANIMAL; }
export function cacavel(an) { return !an.reprodutor && animalAdulto(an); }
export function casal(especie) {
  const r = mundo.animais.filter(a => a.especie === especie && a.reprodutor);
  return { f: r.find(a => a.sexo === 'f'), m: r.find(a => a.sexo === 'm') };
}
export function qtdEspecie(especie) { return mundo.animais.filter(a => a.especie === especie).length; }
// Espécies que ainda não têm o casal completo (1 fêmea + 1 macho)
export function especiesIncompletas() {
  return Object.keys(ESPECIES).filter(e => { const c = casal(e); return !(c.f && c.m); });
}

export function pedirAnimal(id) {
  const p = PEDIDOS[id];
  const totem = estruturaDoTipo('totem');
  const opcoes = especiesIncompletas();
  if (!totem || !opcoes.length || !temRecursos(p.custo)) return;
  gastarRecursos(p.custo);
  const especie = opcoes[Math.floor(Math.random() * opcoes.length)];
  const c = casal(especie);
  // Nunca duas fêmeas ou dois machos: vem o sexo que falta
  const sexo = c.f ? 'm' : c.m ? 'f' : (Math.random() < 0.5 ? 'f' : 'm');
  const pos = lugarLivrePerto(totem.x, totem.y, 42);
  const an = novoAnimal(especie, sexo, pos.x, pos.y, true);
  mundo.animais.push(an);
  luzDivina(pos.x, pos.y);
  textoFlutuante(totem.x, totem.y - 90, `Os deuses enviaram ${sexo === 'f' ? 'uma' : 'um'} ${nomeAnimal(an).toLowerCase()}!`, '#fff3b0');
  atualizarInventario();
  fecharPainel();
}

export function animalEm(p) {
  return mundo.animais.find(a => Math.hypot(p.x - a.x, p.y - (a.y - a.raio * 0.6)) < a.raio + 8);
}
function sendoCacado(an) { return mundo.agentes.some(a => a.acao && a.acao.tarefa.alvo === an); }

// O jogador vai caçar o animal (tira a presa de quem já estava indo)
export function cacar(an) {
  const { jogador } = mundo;
  liberarAlvo('alvo', an);
  cancelar(jogador);
  iniciarTarefa(jogador, { tipo: 'cacar', alvo: an, x: an.x, y: an.y, raio: an.raio });
}

export function atualizarAnimais(dt) {
  const { animais } = mundo;
  // Casais completos têm filhotes
  for (const e of Object.keys(ESPECIES)) {
    const c = casal(e);
    if (!c.f || !c.m) continue;
    if (qtdEspecie(e) >= limiteEspecie(e)) continue;
    c.f.cria += dt;
    if (c.f.cria >= TEMPO_CRIA_ANIMAL) {
      c.f.cria = 0;
      const pos = lugarLivrePerto(c.f.x, c.f.y, ESPECIES[e].raio + 8);
      const filhote = novoAnimal(e, Math.random() < 0.5 ? 'f' : 'm', pos.x, pos.y, false);
      filhote.mae = c.f;
      animais.push(filhote);
      textoFlutuante(c.f.x, c.f.y - 25, 'Nasceu um filhote!', '#ffe9b0');
      atualizarInventario();
    }
  }

  for (const an of animais) {
    const E = ESPECIES[an.especie];
    if (an.idade < TEMPO_CRESCER_ANIMAL) an.idade += dt;
    an.raio = E.raio * (animalAdulto(an) ? 1 : 0.6);
    if (sendoCacado(an)) continue; // fica parado

    if (!an.destino) {
      an.espera -= dt;
      if (an.espera <= 0) {
        const abrigo = abrigoDe(an.especie);
        let p;
        if (abrigo) {
          // com abrigo: passeia só dentro da cerca
          const m = abrigo.raio - an.raio - 4;
          p = { x: abrigo.x + (Math.random() * 2 - 1) * m, y: abrigo.y + (Math.random() * 2 - 1) * m };
        } else {
          // filhote fica perto da mãe
          const base = (!animalAdulto(an) && an.mae && animais.includes(an.mae)) ? an.mae : an;
          const ang = Math.random() * Math.PI * 2, d = 20 + Math.random() * 50;
          p = { x: base.x + Math.cos(ang) * d, y: base.y + Math.sin(ang) * d };
        }
        if (podeFicar(p.x, p.y, an.raio)) an.destino = p;
        an.espera = 2 + Math.random() * 3;
      }
      continue;
    }
    const vx = an.destino.x - an.x, vy = an.destino.y - an.y;
    if (Math.hypot(vx, vy) < 3) { an.destino = null; continue; }
    if (vx) an.dir = Math.sign(vx);
    if (!mover(an, vx, vy, dt)) an.destino = null;
  }
}
