import { ALCANCE_EXPANSAO, CUSTO_EXPANSAO, ILHA, LARGURA_EXPANSAO, MUNDO } from './config.js';
import { textoFlutuante } from './efeitos.js';
import { dentroDaIlha, pontoTerraPerto, raioIlha } from './ilha.js';
import { gastarRecursos, temRecursos } from './inventario.js';
import { mundo } from './mundo.js';

// ===================== Expansão da ilha =====================
// Tocar no mar perto da costa aterra um pedaço de terra ali.
// Devolve a expansão que seria feita no ponto p, ou null se não der.
export function expansaoPara(p) {
  const dx = p.x - ILHA.x, dy = p.y - ILHA.y;
  const ang = Math.atan2(dy, dx), dist = Math.hypot(dx, dy);
  const costa = raioIlha(ang);
  if (dist <= costa || dist - costa > ALCANCE_EXPANSAO) return null; // já é terra ou longe demais
  const nova = { ang, alt: dist - costa + 30, larg: LARGURA_EXPANSAO };
  // a costa nova não pode sair do mapa
  const r = raioIlha(ang, [nova]);
  const px = ILHA.x + Math.cos(ang) * r, py = ILHA.y + Math.sin(ang) * r;
  if (px < 30 || py < 30 || px > MUNDO.w - 30 || py > MUNDO.h - 30) return null;
  // não pode enterrar a jangada que está no mar
  for (const s of mundo.estruturas) {
    if (!s.area && !dentroDaIlha(s.x, s.y) && dentroDaIlha(s.x, s.y, -s.raio, [nova])) return null;
  }
  return nova;
}

// Onde o jogador fica trabalhando: na praia, de frente para o ponto
export function tarefaAterrar(p) {
  const pos = pontoTerraPerto(p.x, p.y);
  return { tipo: 'aterrar', ponto: { x: p.x, y: p.y }, x: pos.x, y: pos.y, raio: 6 };
}

export function concluirAterro(t) {
  const nova = expansaoPara(t.ponto);
  if (!temRecursos(CUSTO_EXPANSAO)) { textoFlutuante(t.x, t.y - 20, 'Recursos insuficientes', '#ffb0a0'); return; }
  if (!nova) { textoFlutuante(t.x, t.y - 20, 'Não dá para aterrar aqui', '#ffb0a0'); return; }
  gastarRecursos(CUSTO_EXPANSAO);
  mundo.expansoes.push(nova);
  // cardumes que ficaram em terra somem (outros aparecem com o tempo)
  mundo.cardumes = mundo.cardumes.filter(c => !dentroDaIlha(c.x, c.y, -c.raio));
  textoFlutuante(t.ponto.x, t.ponto.y - 10, 'Terra nova! 🏝️', '#f5e6a0');
}
