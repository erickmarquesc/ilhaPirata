import { describe, expect, it } from 'vitest';
import { criarGerador, definirSemente, entre, escolher, sortear } from '../aleatorio.js';

const amostra = (f, n = 1000) => Array.from({ length: n }, f);

describe('aleatorio', () => {
  it('a mesma semente dá a mesma sequência', () => {
    expect(amostra(criarGerador(7), 50)).toEqual(amostra(criarGerador(7), 50));
    expect(amostra(criarGerador(7), 50)).not.toEqual(amostra(criarGerador(8), 50));
  });

  it('definirSemente reinicia a sequência de sortear()', () => {
    definirSemente(123);
    const a = amostra(sortear, 20);
    definirSemente(123);
    expect(amostra(sortear, 20)).toEqual(a);
  });

  it('sortear() fica em [0, 1)', () => {
    definirSemente(1);
    for (const v of amostra(sortear)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('entre(min, max) fica em [min, max)', () => {
    definirSemente(2);
    for (const v of amostra(() => entre(-3, 5))) {
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThan(5);
    }
  });

  it('escolher(lista) só devolve itens da lista e alcança todos', () => {
    definirSemente(3);
    const lista = ['a', 'b', 'c'];
    const vistos = new Set(amostra(() => escolher(lista)));
    expect([...vistos].sort()).toEqual(lista);
    expect(escolher([])).toBeUndefined();
  });
});
