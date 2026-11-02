import { afterEach, describe, expect, it, vi } from 'vitest';
import { ILHA, MUNDO, NOME_MAE } from '../config.js';
import { construirEm } from '../acoes.js';
import { novoAgente } from '../agentes.js';
import { lugarLivrePerto, podeConstruirEm } from '../espaco.js';
import { estruturaDoTipo } from '../estruturas.js';
import { namorar } from '../familia.js';
import { cozinhar, podeCozinhar } from '../fogueira.js';
import { dentroDaIlha, raioIlha } from '../ilha.js';
import { capacidadeDoEstoque, totalNoEstoque } from '../inventario.js';
import { clicar, criarMundo, passo, teclaPressionada } from '../jogo.js';
import { mundo } from '../mundo.js';
import { oferecerEspeto, podeOferecer } from '../oferenda.js';
import { PEDIDOS } from '../pedidos.js';
import { fecharConquista } from '../ui.js';
import { geradorComSemente } from './ajudantes.js';

// ===================== Simulação headless =====================
// 5 minutos de jogo a 60 quadros por segundo, conferindo as invariantes a cada quadro.
// Math.random usa um gerador com semente: a falha diz a semente e o segundo, para repetir.
const DT = 1 / 60;
const DURACAO = 5 * 60;
const SEMENTES = [1, 42, 2026];

afterEach(() => { vi.restoreAllMocks(); mundo.dev = false; });

function usarSemente(semente) {
  const aleatorio = geradorComSemente(semente);
  vi.spyOn(Math, 'random').mockImplementation(aleatorio);
  return aleatorio;
}

// Devolve o primeiro problema encontrado no quadro, ou null
function violacao() {
  const pos = o => Number.isFinite(o.x) && Number.isFinite(o.y);
  for (const a of mundo.agentes) {
    if (!pos(a)) return `${a.nome ?? a.tipo} com posição inválida (${a.x}, ${a.y})`;
    if (!a.embarcado && !dentroDaIlha(a.x, a.y)) return `${a.nome ?? a.tipo} fora da ilha em (${a.x.toFixed(1)}, ${a.y.toFixed(1)})`;
  }
  for (const an of mundo.animais) {
    if (!pos(an)) return `animal ${an.especie} com posição inválida (${an.x}, ${an.y})`;
    if (!dentroDaIlha(an.x, an.y)) return `animal ${an.especie} fora da ilha em (${an.x.toFixed(1)}, ${an.y.toFixed(1)})`;
  }
  for (const s of mundo.estruturas) if (!pos(s)) return `construção ${s.tipo} com posição inválida (${s.x}, ${s.y})`;
  for (const c of mundo.cardumes) if (!pos(c)) return `cardume com posição inválida (${c.x}, ${c.y})`;
  for (const [r, q] of Object.entries(mundo.inventario)) {
    if (!Number.isFinite(q) || q < 0) return `inventário ${r} = ${q}`;
  }
  if (totalNoEstoque() > capacidadeDoEstoque()) return `estoque ${totalNoEstoque()} acima da capacidade ${capacidadeDoEstoque()}`;
  return null;
}

// Roda a partida; "jogada(t)" é chamada a cada quadro antes do passo
function simular(semente, jogada = () => {}) {
  for (let i = 0; i < DURACAO / DT; i++) {
    const t = i * DT;
    jogada(t);
    if (mundo.ui.conquista) fecharConquista(); // com o aviso aberto o jogo fica pausado
    passo(DT);
    const erro = violacao();
    if (erro) throw new Error(`semente ${semente}, ${t.toFixed(2)} s: ${erro}`);
  }
}

// ===== Ilha povoada, montada pelas funções do próprio jogo =====
// As obras usam o modo dev só durante a montagem (ficam prontas quando o Jones chega, sem custo).
function construirPeloJogo(id, aleatorio) {
  mundo.dev = true;
  let p = null;
  for (let i = 0; i < 2000 && !p; i++) {
    const ang = aleatorio() * Math.PI * 2, d = aleatorio() * raioIlha(ang);
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
  mundo.agentes.push(novoAgente(tipo, pos.x, pos.y, { ...FASES[tipo], nome: 'Filho ' + mundo.contadorFilhos, ordem: mundo.contadorFilhos, espera: 1 }));
}
function povoarIlha(aleatorio) {
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
function jogadorAleatorio(aleatorio) {
  let proxima = 0, chuva = false;
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
    else if (sorteio < 0.2) { const prato = aleatorio() < 0.5 ? 'churrasco' : 'peixada'; if (podeCozinhar(prato)) cozinhar(prato); }
    else if (sorteio < 0.24) { if (podeOferecer()) oferecerEspeto(); }
    else if (sorteio < 0.4) clicar({ x: aleatorio() * MUNDO.w, y: aleatorio() * MUNDO.h });
    else {
      const ang = aleatorio() * Math.PI * 2, d = aleatorio() * raioIlha(ang);
      clicar({ x: ILHA.x + Math.cos(ang) * d, y: ILHA.y + Math.sin(ang) * d });
    }
  };
}

describe('simulação de 5 minutos', () => {
  it.each(SEMENTES)('ilha nova, sem jogadas (semente %i)', semente => {
    usarSemente(semente);
    criarMundo();
    simular(semente);
  }, 60000);

  it.each(SEMENTES)('ilha povoada, jogador aleatório (semente %i)', semente => {
    const aleatorio = usarSemente(semente);
    criarMundo();
    povoarIlha(aleatorio);
    expect(violacao()).toBeNull();
    simular(semente, jogadorAleatorio(aleatorio));
  }, 60000);
});
