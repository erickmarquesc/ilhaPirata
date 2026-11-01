import { CANHOES, GRAVIDADE_BALA, RECARGA_CANHOES, SUBIDA_BALA, VELOCIDADE_BALA } from './config.js';
import { estruturaDoTipo } from './estruturas.js';
import { dentroDaIlha } from './ilha.js';
import { jangadaNaAgua } from './jangada.js';
import { mundo } from './mundo.js';

// ===================== Canhões do barco pirata =====================
// Só efeito visual: com o Jones a bordo do barco no nível 5, Espaço dispara os 6 canhões juntos.
// mundo.balas: { x, y, h, vx, vy, vh } (h = altura acima da água)
// mundo.estouros: { tipo: 'clarao' | 'fumaca' | 'agua', x, y, h, vida, duracao }
const DURACAO = { clarao: 0.15, fumaca: 1.1, agua: 0.8 };
const ALTURA_CHAO = 3; // bola que cai na ilha para um pouco acima da água

function estouro(tipo, x, y, h) {
  mundo.estouros.push({ tipo, x, y, h, vida: DURACAO[tipo], duracao: DURACAO[tipo] });
}

export function podeDisparar() {
  const est = mundo.jogador.embarcado;
  return !!est && est.nivel >= 5 && jangadaNaAgua(est);
}

// Devolve true se o Jones está no barco pirata (mesmo recarregando), para o Espaço não mexer na câmera
export function dispararCanhoes() {
  if (!podeDisparar()) return false;
  const est = mundo.jogador.embarcado;
  if (est.recargaCanhoes > 0) return true;
  est.recargaCanhoes = RECARGA_CANHOES;
  // proa na direção (cos, −sin) do rumo; cada lado (l = ±1) sai perpendicular a ela
  const ang = est.rumoVisual ?? 0, c = Math.cos(ang), s = Math.sin(ang);
  for (const l of [-1, 1]) {
    for (const cx of CANHOES.xs) {
      const x = est.x + cx * c + l * CANHOES.boca * s;
      const y = est.y - cx * s + l * CANHOES.boca * c;
      mundo.balas.push({ x, y, h: CANHOES.altura, vx: l * s * VELOCIDADE_BALA, vy: l * c * VELOCIDADE_BALA, vh: SUBIDA_BALA });
      estouro('clarao', x, y, CANHOES.altura);
      estouro('fumaca', x, y, CANHOES.altura);
    }
  }
  return true;
}

export function atualizarCanhoes(dt) {
  const est = estruturaDoTipo('jangada');
  if (est?.recargaCanhoes > 0) est.recargaCanhoes -= dt;

  const { balas, estouros } = mundo;
  for (const b of balas) {
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.vh -= GRAVIDADE_BALA * dt; b.h += b.vh * dt;
    const naIlha = dentroDaIlha(b.x, b.y);
    if (b.h <= (naIlha ? ALTURA_CHAO : 0)) {
      b.caiu = true;
      if (naIlha) estouro('fumaca', b.x, b.y, ALTURA_CHAO); // poeira na areia
      else estouro('agua', b.x, b.y, 0);
    }
  }
  for (let i = balas.length - 1; i >= 0; i--) if (balas[i].caiu) balas.splice(i, 1);
  for (const e of estouros) e.vida -= dt;
  for (let i = estouros.length - 1; i >= 0; i--) if (estouros[i].vida <= 0) estouros.splice(i, 1);
}
