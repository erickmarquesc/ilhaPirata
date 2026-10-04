// ===================== Estado do mundo =====================
// Todo o estado mutável do jogo fica neste objeto. A engine altera direto
// e avisa a interface (React) chamando notificar().
export const mundo = {
  inventario: null,
  arvores: [],
  estruturas: [],
  expansoes: [],     // pedaços de terra aterrados: { ang, alt, larg }
  montes: [],        // montes de barro e pedra: { tipo, x, y, raio, restante, recarga }
  agentes: [],
  jogador: null,
  esposa: null,
  contadorFilhos: 0,
  animais: [],
  cardumes: [],
  relogioCardume: 0,
  textos: [],
  efeitos: [],
  teclas: {},
  ponteiro: { x: -999, y: -999 },
  ui: null,
};

export function limparMundo() {
  Object.assign(mundo, {
    inventario: { madeira: 0, sementes: 0, carne: 0, peixe: 0, trigo: 0, sementesTrigo: 0, tijolo: 0, pedra: 0 },
    arvores: [],
    estruturas: [],
    expansoes: [],
    montes: [],
    agentes: [],
    jogador: null,
    esposa: null,
    contadorFilhos: 0,
    animais: [],
    cardumes: [],
    relogioCardume: 0,
    textos: [],
    efeitos: [],
    teclas: {},
    ponteiro: { x: -999, y: -999 },
    ui: {
      modo: { tipo: null, construcao: null },
      cartasAbertas: true, // cartas de construção (tecla C recolhe/mostra)
      painel: null,      // { tipo, alvo }
      piscar: {},        // recurso -> contador (cada ganho/gasto incrementa)
    },
  });
}

// ===================== Store (ponte com o React) =====================
let versao = 0;
const ouvintes = new Set();

export function notificar() {
  versao++;
  for (const f of ouvintes) f();
}
export function assinar(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}
export function obterVersao() {
  return versao;
}
