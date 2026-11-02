import { expect } from 'vitest';
import { ILHA, MUNDO, NOME_MAE } from '../config.js';
import { construirEm } from '../acoes.js';
import { novoAgente } from '../agentes.js';
import { CONSTRUCOES } from '../construcoes.js';
import { lugarLivrePerto, podeConstruirEm } from '../espaco.js';
import { estruturaDoTipo } from '../estruturas.js';
import { namorar } from '../familia.js';
import { cozinhar, podeCozinhar } from '../fogueira.js';
import { raioIlha } from '../ilha.js';
import { capacidadeDoEstoque, totalNoEstoque } from '../inventario.js';
import { clicar, passo, teclaPressionada } from '../jogo.js';
import { mundo } from '../mundo.js';
import { oferecerEspeto, podeOferecer } from '../oferenda.js';
import { PEDIDOS } from '../pedidos.js';
import { fecharConquista } from '../ui.js';

// ===================== Ajudantes dos testes =====================
// Quadro das simulações: 60 por segundo
export const DT = 1 / 60;

// Construção pronta no mapa, no mesmo formato que a obra cria (ver CONCLUIR.construir em tarefas.js)
export function colocarConstrucao(tipo, x, y, nivel = 1) {
  const c = CONSTRUCOES[tipo];
  const est = { tipo, x, y, raio: c.raio, nivel };
  if (c.area) {
    est.area = true;
    est.ocupa = c.raio * 1.42;
  }
  mundo.estruturas.push(est);
  return est;
}

// Forma no chão, igual à de espaco.js: área = quadrado (h), resto = círculo (r)
export function formaDe(tipo, x, y) {
  const c = CONSTRUCOES[tipo];
  return c.area ? { x, y, h: c.raio } : { x, y, r: c.raio };
}

// ===== Ilha povoada, montada pelas funções do próprio jogo =====
// As obras usam o modo dev só durante a montagem (ficam prontas quando o Jones chega, sem custo).
function construirPeloJogo(id, aleatorio) {
  mundo.dev = true;
  let p = null;
  for (let i = 0; i < 2000 && !p; i++) {
    const ang = aleatorio() * Math.PI * 2,
      d = aleatorio() * raioIlha(ang);
    const q = { x: ILHA.x + Math.cos(ang) * d, y: ILHA.y + Math.sin(ang) * d };
    if (podeConstruirEm(id, q)) p = q;
  }
  if (!p) throw new Error(`sem lugar para ${id}`);
  construirEm(id, p);
  for (let t = 0; t < 30 && !estruturaDoTipo(id); t += DT) {
    if (mundo.ui.conquista) fecharConquista();
    passo(DT);
  }
  if (mundo.ui.conquista) fecharConquista();
  mundo.dev = false;
  if (!estruturaDoTipo(id)) throw new Error(`${id} não ficou pronta`);
}
function pedir(id, custo) {
  Object.assign(mundo.inventario, custo);
  PEDIDOS[id].realizar(id);
}
// Filho já crescido, como nascerCrianca + virarAdolescente/virarAdulto (familia.js)
const FASES = { crianca: { raio: 7, velocidade: 100 }, adolescente: { raio: 9, velocidade: 140 }, adulto: { raio: 10, velocidade: 160 } };
function novoFilho(tipo) {
  mundo.contadorFilhos++;
  const totem = estruturaDoTipo('totem');
  const pos = lugarLivrePerto(totem.x, totem.y, 50);
  mundo.agentes.push(
    novoAgente(tipo, pos.x, pos.y, { ...FASES[tipo], nome: 'Filho ' + mundo.contadorFilhos, ordem: mundo.contadorFilhos, espera: 1 }),
  );
}
export function povoarIlha(aleatorio) {
  for (const id of ['totem', 'cabana', 'fogueira', 'campoTrigo', 'curral', 'moinho', 'jangada']) construirPeloJogo(id, aleatorio);
  pedir('esposa', { madeira: 40, sementes: 4 });
  for (let i = 0; i < 6; i++) pedir('animal', { madeira: 30, sementes: 2 }); // os 3 casais
  for (const tipo of ['adulto', 'adulto', 'adolescente', 'crianca']) novoFilho(tipo);
  mundo.esposa.gravidez = 20; // nasce um bebê durante a partida e os filhos mudam de fase
  mundo.comida.conhece = true; // a família já pede comida
  Object.assign(mundo.inventario, { madeira: 100, sementes: 30, carne: 100, peixe: 30, trigo: 10, sementesTrigo: 3, tijolo: 10, pedra: 10 });
  expect(mundo.esposa?.nome).toBe(NOME_MAE);
  expect(mundo.animais).toHaveLength(6);
}

// O Jones joga sozinho: toca em lugares sorteados e, de tempos em tempos, cozinha,
// oferece o espeto, embarca/desembarca, chama para namorar e pede chuva
export function jogadorAleatorio(aleatorio) {
  let proxima = 0,
    chuva = false;
  return t => {
    if (!chuva && t >= 120) {
      chuva = true;
      if (PEDIDOS.chuva.disponivel()) {
        mundo.inventario.madeira = Math.max(mundo.inventario.madeira, 20);
        mundo.inventario.sementes = Math.max(mundo.inventario.sementes, 2);
        if (totalNoEstoque() <= capacidadeDoEstoque()) PEDIDOS.chuva.realizar('chuva');
      }
    }
    if (t < proxima) return;
    proxima = t + 2 + aleatorio() * 3;
    const sorteio = aleatorio();
    if (sorteio < 0.08) teclaPressionada('e');
    else if (sorteio < 0.14) namorar();
    else if (sorteio < 0.2) {
      const prato = aleatorio() < 0.5 ? 'churrasco' : 'peixada';
      if (podeCozinhar(prato)) cozinhar(prato);
    } else if (sorteio < 0.24) {
      if (podeOferecer()) oferecerEspeto();
    } else if (sorteio < 0.4) clicar({ x: aleatorio() * MUNDO.w, y: aleatorio() * MUNDO.h });
    else {
      const ang = aleatorio() * Math.PI * 2,
        d = aleatorio() * raioIlha(ang);
      clicar({ x: ILHA.x + Math.cos(ang) * d, y: ILHA.y + Math.sin(ang) * d });
    }
  };
}
