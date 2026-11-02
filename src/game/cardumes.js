import {
  CARDUMES_MAX,
  CARDUMES_PROFUNDOS_MAX,
  FIM_DO_MAR,
  FIM_DO_RASO,
  FOLGA_CARDUME_RASO,
  ILHA,
  MUNDO,
  PESCA_NO_MAR,
  PESCA_NO_PROFUNDO,
  TEMPO_NOVO_CARDUME,
} from './config.js';
import { entre, sortear } from './aleatorio.js';
import { dentroDaIlha, raioIlha } from './ilha.js';
import { mundo } from './mundo.js';

// ===================== Cardumes =====================
// Dois tipos: os do mar (entre o raso e o mar profundo) e os do mar profundo,
// 3x maiores, com mais peixe e pesca mais rápida (c.profundo, ver PESCA_NO_PROFUNDO).
export function pescaDe(c) {
  return c.profundo ? PESCA_NO_PROFUNDO : PESCA_NO_MAR;
}

// O cardume inteiro (peixes e o anel, que pulsa até 4% maior) fica na faixa dele, a pelo menos
// FOLGA_CARDUME_RASO das bordas (raso e mar profundo; o do profundo, só da borda do mar), e dentro do mapa.
// Testa o centro e 24 pontos da borda, porque a costa é ondulada.
export function cabeNaFaixa(x, y, raio, profundo) {
  const r = raio * 1.05;
  if (x < r || y < r || x > MUNDO.w - r || y > MUNDO.h - r) return false;
  const dentro = -((profundo ? FIM_DO_MAR : FIM_DO_RASO) + FOLGA_CARDUME_RASO); // não pode encostar daqui para dentro
  const fora = profundo ? null : -(FIM_DO_MAR - FOLGA_CARDUME_RASO); // nem passar daqui para fora
  if (dentroDaIlha(x, y, dentro - r)) return false;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2,
      bx = x + Math.cos(a) * r,
      by = y + Math.sin(a) * r;
    if (dentroDaIlha(bx, by, dentro)) return false;
    if (fora !== null && !dentroDaIlha(bx, by, fora)) return false;
  }
  return true;
}
export function cardumeNoLugar(c) {
  return cabeNaFaixa(c.x, c.y, c.raio, c.profundo);
}

function lugarNoMar(raio) {
  const ang = sortear() * Math.PI * 2;
  const folga = FOLGA_CARDUME_RASO + raio * 1.05;
  const min = raioIlha(ang) + FIM_DO_RASO + folga,
    max = raioIlha(ang) + FIM_DO_MAR - folga;
  const d = entre(min, max);
  return { x: ILHA.x + Math.cos(ang) * d, y: ILHA.y + Math.sin(ang) * d };
}
// O mar profundo vai até a borda do mapa: sorteia qualquer ponto e confere
function lugarNoProfundo(raio) {
  const r = raio * 1.05;
  return { x: entre(r, MUNDO.w - r), y: entre(r, MUNDO.h - r) };
}

export function novoCardume(profundo = false) {
  const { cardumes } = mundo;
  const pesca = profundo ? PESCA_NO_PROFUNDO : PESCA_NO_MAR;
  for (let i = 0; i < 200; i++) {
    const { x, y } = profundo ? lugarNoProfundo(pesca.raio) : lugarNoMar(pesca.raio);
    if (!cabeNaFaixa(x, y, pesca.raio, profundo)) continue;
    if (cardumes.some(c => Math.hypot(c.x - x, c.y - y) < c.raio + pesca.raio + 50)) continue;
    cardumes.push({ x, y, profundo, raio: pesca.raio, peixes: pesca.pescas, dir: sortear() * Math.PI * 2, fase: sortear() * 10 });
    return;
  }
}
export function cardumeSob(est) {
  return mundo.cardumes.find(c => c.peixes > 0 && Math.hypot(c.x - est.x, c.y - est.y) < c.raio + est.raio);
}
// comProfundos: false para a jangada que ainda não entra no mar profundo
export function cardumeMaisProximo(est, comProfundos = true) {
  let melhor = null,
    dist = Infinity;
  for (const c of mundo.cardumes) {
    if (c.peixes <= 0 || (c.profundo && !comProfundos)) continue;
    const d = Math.hypot(c.x - est.x, c.y - est.y);
    if (d < dist) {
      dist = d;
      melhor = c;
    }
  }
  return melhor;
}
export function removerCardume(c) {
  mundo.cardumes.splice(mundo.cardumes.indexOf(c), 1);
}
export function atualizarCardumes(dt) {
  for (const c of mundo.cardumes) {
    c.fase += dt;
    if (c.parado > 0) {
      c.parado -= dt;
      continue;
    }
    if (sortear() < dt * 0.3) c.dir += entre(-0.75, 0.75);
    const nx = c.x + Math.cos(c.dir) * 4 * dt,
      ny = c.y + Math.sin(c.dir) * 4 * dt;
    if (cabeNaFaixa(nx, ny, c.raio, c.profundo)) {
      c.x = nx;
      c.y = ny;
    } else c.dir += Math.PI; // bateu na borda: meia-volta
  }
  // Repõe um cardume por vez, no relógio: primeiro os do mar, depois os do profundo
  const doMar = mundo.cardumes.filter(c => !c.profundo).length;
  const profundos = mundo.cardumes.length - doMar;
  if (doMar < CARDUMES_MAX || profundos < CARDUMES_PROFUNDOS_MAX) {
    mundo.relogioCardume += dt;
    if (mundo.relogioCardume >= TEMPO_NOVO_CARDUME) {
      mundo.relogioCardume = 0;
      novoCardume(doMar >= CARDUMES_MAX);
    }
  }
}
