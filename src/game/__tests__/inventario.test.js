import { beforeEach, describe, expect, it } from 'vitest';
import { ESTOQUE_BASE, ESTOQUE_POR_NIVEL_MOINHO, ILHA } from '../config.js';
import { cabeNoEstoque, capacidadeDoEstoque, gastarRecursos, ganhar, temRecursos, totalNoEstoque } from '../inventario.js';
import { limparMundo, mundo } from '../mundo.js';
import { colocarConstrucao } from './ajudantes.js';

beforeEach(() => limparMundo());

describe('ganhar', () => {
  it('soma ao recurso', () => {
    ganhar('madeira', 20);
    ganhar('madeira', 5);
    expect(mundo.inventario.madeira).toBe(25);
  });
  it('corta no limite do estoque', () => {
    mundo.inventario.pedra = ESTOQUE_BASE - 10;
    ganhar('madeira', 50);
    expect(mundo.inventario.madeira).toBe(10);
    expect(totalNoEstoque()).toBe(ESTOQUE_BASE);
  });
  it('com o estoque cheio não muda nada', () => {
    mundo.inventario.pedra = ESTOQUE_BASE;
    ganhar('madeira', 5);
    expect(mundo.inventario.madeira).toBe(0);
  });
  it('quantidade negativa tira (como ao plantar)', () => {
    mundo.inventario.sementes = 3;
    ganhar('sementes', -1);
    expect(mundo.inventario.sementes).toBe(2);
  });
});

describe('gastarRecursos e temRecursos', () => {
  it('um recurso', () => {
    mundo.inventario.madeira = 30;
    expect(temRecursos({ madeira: 30 })).toBe(true);
    expect(temRecursos({ madeira: 31 })).toBe(false);
    gastarRecursos({ madeira: 30 });
    expect(mundo.inventario.madeira).toBe(0);
  });
  it('vários recursos: precisa ter todos', () => {
    Object.assign(mundo.inventario, { madeira: 100, pedra: 5, tijolo: 0 });
    expect(temRecursos({ madeira: 60, pedra: 5 })).toBe(true);
    expect(temRecursos({ madeira: 60, pedra: 5, tijolo: 1 })).toBe(false);
    gastarRecursos({ madeira: 60, pedra: 5 });
    expect(mundo.inventario).toMatchObject({ madeira: 40, pedra: 0 });
  });
  it('custo vazio sempre dá', () => {
    expect(temRecursos({})).toBe(true);
  });
});

describe('cabeNoEstoque', () => {
  it('no limite exato cabe, acima não', () => {
    mundo.inventario.madeira = ESTOQUE_BASE - 10;
    expect(cabeNoEstoque(10)).toBe(true);
    expect(cabeNoEstoque(11)).toBe(false);
  });
  it('o moinho aumenta o estoque a cada nível', () => {
    colocarConstrucao('moinho', ILHA.x, ILHA.y, 2);
    expect(capacidadeDoEstoque()).toBe(ESTOQUE_BASE + 2 * ESTOQUE_POR_NIVEL_MOINHO);
    mundo.inventario.madeira = ESTOQUE_BASE;
    expect(cabeNoEstoque(2 * ESTOQUE_POR_NIVEL_MOINHO)).toBe(true);
    expect(cabeNoEstoque(2 * ESTOQUE_POR_NIVEL_MOINHO + 1)).toBe(false);
  });
});
