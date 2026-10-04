import { ILHA } from '../config.js';
import { crescimento } from '../arvores.js';
import { raioIlha } from '../ilha.js';
import { mundo } from '../mundo.js';
import { circulo } from './primitivas.js';

// ===================== Ilha =====================
function contornoIlha(ctx, recuo) {
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = i / 120 * Math.PI * 2, r = raioIlha(a) - recuo;
    const x = ILHA.x + Math.cos(a) * r, y = ILHA.y + Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
}
export function desenharIlha(ctx) {
  ctx.fillStyle = '#e8d08a'; contornoIlha(ctx, 0);  ctx.fill();
  ctx.fillStyle = '#5a9e3c'; contornoIlha(ctx, 45); ctx.fill();
}

// ===================== Árvores =====================
export function desenharArvore(ctx, t) {
  const { agentes, jogador } = mundo;
  const c = crescimento(t), tam = 0.3 + 0.7 * c;
  const sendoSerrada = agentes.some(a => a.acao && a.acao.tarefa.arvore === t);
  const balanco = sendoSerrada ? Math.sin(performance.now() / 60) * 2 : 0;
  if (c < 1) circulo(ctx, t.x, t.y, t.raio, '#7a5a32');
  circulo(ctx, t.x, t.y, t.raio * 0.6 * tam, '#6b4423');
  const alvo = jogador.tarefa && jogador.tarefa.arvore === t;
  circulo(ctx, t.x + balanco, t.y - t.raio * 0.9 * tam, t.raio * 1.6 * tam, c < 1 ? '#6fbf4a' : (alvo ? '#3d8a30' : '#2f6b25'));
  if (c < 1) {
    const larg = 30, x = t.x - larg / 2, y = t.y + t.raio + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y, larg, 4);
    ctx.fillStyle = '#8fd16a'; ctx.fillRect(x, y, larg * c, 4);
  }
}

// ===================== Cardumes =====================
export function desenharCardume(ctx, c) {
  const qtd = c.peixes + 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(c.x, c.y, c.raio, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < qtd; i++) {
    const a = c.fase * 0.8 + i / qtd * Math.PI * 2;
    const r = c.raio * (0.35 + 0.5 * ((i * 37) % 10) / 10);
    const x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = 'rgba(20,50,80,0.75)';
    ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-8, -2.5); ctx.lineTo(-8, 2.5); ctx.fill();
    ctx.restore();
  }
}
