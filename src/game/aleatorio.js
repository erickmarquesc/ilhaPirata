// ===================== Sorteios com semente =====================
// Todo sorteio da engine passa por aqui, nunca pelo sorteio do JavaScript: a mesma semente,
// com o mesmo dt e as mesmas entradas, repete a mesma partida.
// Os componentes 3D sorteiam por conta própria só o que é visual (pingos, chamas).

// Mulberry32: gerador pequeno de 32 bits
export function criarGerador(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let gerador = criarGerador(novaSemente());

// Semente para quando a partida não recebe uma
export function novaSemente() {
  return Date.now() >>> 0;
}

export function definirSemente(n) {
  gerador = criarGerador(n);
}

// Número em [0, 1)
export function sortear() {
  return gerador();
}
// Número em [min, max)
export function entre(min, max) {
  return min + gerador() * (max - min);
}
// Um item da lista (undefined se vazia)
export function escolher(lista) {
  return lista[Math.floor(gerador() * lista.length)];
}
