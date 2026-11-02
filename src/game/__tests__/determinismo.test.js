import { afterEach, describe, expect, it } from 'vitest';
import { criarGerador } from '../aleatorio.js';
import { criarMundo, passo } from '../jogo.js';
import { mundo } from '../mundo.js';
import { fecharConquista } from '../ui.js';
import { DT, jogadorAleatorio, povoarIlha } from './ajudantes.js';

// ===================== Determinismo =====================
// Ilha povoada com o jogador aleatório por 2 minutos: a mesma semente tem que
// terminar com o mesmo mundo, e outra semente, com um mundo diferente.
const DURACAO = 2 * 60;

afterEach(() => {
  mundo.dev = false;
});

const r = v => Math.round(v * 100) / 100;
const lugar = o => [r(o.x), r(o.y)];

function resumo() {
  return {
    inventario: { ...mundo.inventario },
    contagens: {
      agentes: mundo.agentes.length,
      animais: mundo.animais.length,
      arvores: mundo.arvores.length,
      estruturas: mundo.estruturas.length,
      cardumes: mundo.cardumes.length,
      montes: mundo.montes.length,
    },
    agentes: mundo.agentes.map(a => [a.nome ?? a.tipo, ...lugar(a)]),
    animais: mundo.animais.map(an => [an.especie, an.sexo, ...lugar(an)]),
    cardumes: mundo.cardumes.map(lugar),
    arvores: mundo.arvores.map(lugar),
    chuva: r(mundo.chuva),
    favor: r(mundo.favor),
    filhos: mundo.contadorFilhos,
  };
}

function partida(semente) {
  const aleatorio = criarGerador(semente); // jogadas do teste, separadas dos sorteios do jogo
  criarMundo(semente);
  povoarIlha(aleatorio);
  const jogada = jogadorAleatorio(aleatorio);
  for (let i = 0; i < DURACAO / DT; i++) {
    jogada(i * DT);
    if (mundo.ui.conquista) fecharConquista();
    passo(DT);
  }
  return resumo();
}

describe('determinismo', () => {
  it('a semente fica em mundo.semente', () => {
    criarMundo(42);
    expect(mundo.semente).toBe(42);
    criarMundo();
    expect(Number.isInteger(mundo.semente)).toBe(true);
  });

  it('a mesma semente termina com o mesmo mundo', () => {
    expect(partida(42)).toEqual(partida(42));
  }, 60000);

  it('outra semente termina com um mundo diferente', () => {
    expect(partida(42)).not.toEqual(partida(43));
  }, 60000);
});
