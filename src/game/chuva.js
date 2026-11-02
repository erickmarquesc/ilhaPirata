import { ARVORES_POR_CHUVA, CRESCIMENTO_NA_CHUVA, ILHA, TEMPO_CHUVA } from './config.js';
import { sortear } from './aleatorio.js';
import { novaArvore } from './arvores.js';
import { luzDivina, textoFlutuante } from './efeitos.js';
import { podePlantarEm } from './espaco.js';
import { estruturaDoTipo } from './estruturas.js';
import { raioIlha } from './ilha.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { mundo } from './mundo.js';
import { PEDIDOS } from './pedidos.js';
import { atualizarInventario, fecharPainel } from './ui.js';

// ===================== Chuva =====================
// Pedida no Totem da Vida: por TEMPO_CHUVA segundos árvores e trigo crescem mais rápido,
// a família se abriga na cabana (ver familia.js) e brotam mudas de árvores da chuva.
export function chovendo() { return mundo.chuva > 0; }
// Quanto o crescimento das plantas anda por segundo (1 = normal)
export function ritmoDasPlantas() { return chovendo() ? CRESCIMENTO_NA_CHUVA : 1; }

export function pedirChuva(id) {
  const p = PEDIDOS[id];
  const totem = estruturaDoTipo('totem');
  if (!totem || !p.disponivel() || !temRecursos(p.custo)) return;
  gastarRecursos(p.custo);
  mundo.chuva = TEMPO_CHUVA;
  brotarArvoresDaChuva();
  luzDivina(totem.x, totem.y);
  textoFlutuante(totem.x, totem.y - 90, 'Os deuses mandaram chuva! 🌧️', '#cfe8ff');
  atualizarInventario();
  fecharPainel();
}

// Mudas de árvore da chuva em lugares sorteados da grama
function brotarArvoresDaChuva() {
  let brotaram = 0;
  for (let i = 0; i < 400 && brotaram < ARVORES_POR_CHUVA; i++) {
    const ang = sortear() * Math.PI * 2, d = Math.sqrt(sortear()) * raioIlha(ang);
    const p = { x: ILHA.x + Math.cos(ang) * d, y: ILHA.y + Math.sin(ang) * d };
    if (!podePlantarEm(p)) continue;
    mundo.arvores.push(novaArvore(p.x, p.y, false, 'chuva'));
    textoFlutuante(p.x, p.y - 20, '🌱', '#9ff0e0');
    brotaram++;
  }
}

export function atualizarChuva(dt) {
  if (!chovendo()) return;
  mundo.chuva = Math.max(mundo.chuva - dt, 0);
  if (!chovendo()) textoFlutuante(mundo.jogador.x, mundo.jogador.y - 40, 'A chuva parou', '#cfe8ff');
}
