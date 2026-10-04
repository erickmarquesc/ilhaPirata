import { CORES_ACAO, NOMES_ACAO, TEMPO_PESCAR } from '../config.js';
import { CONSTRUCOES } from '../construcoes.js';
import { camera } from '../camera.js';
import { arvoresAfetadas, podeConstruirEm, podePlantarEm } from '../espaco.js';
import { temAdolescente } from '../estruturas.js';
import { estaNoMar } from '../jangada.js';
import { mundo } from '../mundo.js';
import { ajudanteTrabalhando, precisaAjuda } from '../tarefas.js';
import { desenharArvore, desenharCardume, desenharIlha } from './natureza.js';
import { desenharAgente, desenharAnimal } from './personagens.js';
import { barraProgresso, rotulo } from './primitivas.js';

// ===================== Obra em andamento =====================
function obraAtual() {
  const a = mundo.jogador.acao;
  if (!a || a.tarefa.tipo !== 'construir') return null;
  return { a, t: a.tarefa };
}
function desenharObra(ctx, o) {
  CONSTRUCOES[o.t.construcao].desenhar(ctx, o.t.x, o.t.y, o.a.tempo / o.a.duracao);
}

// ===================== Construções de pé (com y-sort) =====================
function desenharEstrutura(ctx, s) {
  const c = CONSTRUCOES[s.tipo];
  if (estaNoMar(s)) {
    const tempo = performance.now() / 1000;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    const r = 34 + (tempo * 8) % 10;
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, r, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    const balanco = Math.sin(tempo * 2) * 1.5;
    c.desenhar(ctx, s.x, s.y + balanco);
    // Tripulação em pé no convés
    (s.tripulacao || []).forEach((m, i) => desenharAgente(ctx, { ...m, x: s.x - 18 + i * 13, y: s.y + balanco - 1 }));
    if (s.pesca > 0) {
      const larg = 44, bx = s.x - larg / 2, by = s.y - 66;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx - 2, by - 2, larg + 4, 9);
      ctx.fillStyle = '#7ec8f0'; ctx.fillRect(bx, by, larg * (s.pesca / TEMPO_PESCAR), 5);
      rotulo(ctx, s.x, by - 5, '🎣 Pescando...', '#c8e8ff');
    } else if (s.tripulacao && s.tripulacao.length === 1) {
      rotulo(ctx, s.x, s.y - 66, 'Esperando o segundo adulto...', '#ffe9b0');
    }
  } else {
    c.desenhar(ctx, s.x, s.y);
  }
  if (s.empurrar !== undefined && s.empurrar < 1) rotulo(ctx, s.x, s.y - 70, 'Empurrando para a água...', '#c8e8ff');
  rotulo(ctx, s.x, s.y + 20, 'Nv ' + s.nivel, '#ffe9b0');
}

// ===================== Barras de ação =====================
function desenharBarraAcao(ctx, a) {
  if (!a.acao) return;
  const t = a.acao.tarefa;
  if (t.tipo === 'ajudar') {
    rotulo(ctx, a.x, a.y - a.raio * 2 - 6, '🔨 ajudando', '#ffe9b0');
    return;
  }
  if (precisaAjuda(t) && !ajudanteTrabalhando(t)) {
    const msg = temAdolescente() ? 'Esperando o filho chegar para ajudar...' : 'Precisa de um filho adolescente ou adulto';
    rotulo(ctx, t.x, t.y - CONSTRUCOES[t.construcao].altura - 16, msg, '#ffe9b0');
    return;
  }
  const pequeno = a !== mundo.jogador;
  const larg = pequeno ? 40 : 60, alt = pequeno ? 5 : 8;
  let cx = t.x, y = t.y - 34;
  if (t.tipo === 'serrar') y = t.y - t.raio * 2.8 - 14;
  if (t.tipo === 'construir' || t.tipo === 'evoluir') y = t.y - CONSTRUCOES[t.construcao].altura - 16;
  if (t.tipo === 'namorar') { cx = (a.x + t.x) / 2; y = Math.min(a.y, t.y) - 40; }
  const prog = Math.min(a.acao.tempo / a.acao.duracao, 1);
  barraProgresso(ctx, cx - larg / 2, y, larg, alt, prog, CORES_ACAO[t.tipo]);
  if (!pequeno) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(NOMES_ACAO[t.tipo] + '... ' + Math.ceil(a.acao.duracao - a.acao.tempo) + 's', cx, y - 5);
  }
  if (t.tipo === 'namorar') {
    ctx.font = '16px system-ui, sans-serif';
    const b = Math.sin(performance.now() / 200) * 4;
    ctx.fillText('💕', cx, y - 22 + b);
  }
}

// ===================== Prévia de plantio / construção =====================
function desenharPrevia(ctx) {
  const { jogador, ponteiro, ui } = mundo;
  if (jogador.acao) return;
  if (ui.modo.tipo === 'plantar') {
    const ok = podePlantarEm(ponteiro);
    ctx.strokeStyle = ok ? 'rgba(160,255,120,0.9)' : 'rgba(255,120,100,0.9)';
    ctx.fillStyle = ok ? 'rgba(160,255,120,0.25)' : 'rgba(255,120,100,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ponteiro.x, ponteiro.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  if (ui.modo.tipo === 'construir') {
    const id = ui.modo.construcao;
    const c = CONSTRUCOES[id];
    const ok = podeConstruirEm(id, ponteiro);
    ctx.strokeStyle = ok ? 'rgba(255,220,140,0.9)' : 'rgba(255,120,100,0.9)';
    ctx.fillStyle = ok ? 'rgba(255,220,140,0.25)' : 'rgba(255,120,100,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (c.area) ctx.rect(ponteiro.x - c.raio, ponteiro.y - c.raio, c.raio * 2, c.raio * 2);
    else ctx.arc(ponteiro.x, ponteiro.y, c.raio, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    c.desenhar(ctx, ponteiro.x, ponteiro.y, 1, 0.5);
    // marca em vermelho as árvores que vão ser derrubadas
    for (const t of arvoresAfetadas(id, ponteiro)) {
      ctx.strokeStyle = 'rgba(255,90,70,0.95)'; ctx.lineWidth = 2.5;
      const cy = t.y - t.raio * 0.9;
      ctx.beginPath();
      ctx.moveTo(t.x - 8, cy - 8); ctx.lineTo(t.x + 8, cy + 8);
      ctx.moveTo(t.x + 8, cy - 8); ctx.lineTo(t.x - 8, cy + 8);
      ctx.stroke();
    }
  }
}

// ===================== Efeitos =====================
function desenharEfeitos(ctx) {
  for (const f of mundo.efeitos) {
    ctx.globalAlpha = Math.max(f.vida / 1.8, 0) * 0.7;
    const g = ctx.createLinearGradient(0, 0, 0, f.y);
    g.addColorStop(0, 'rgba(255,245,180,0)');
    g.addColorStop(1, 'rgba(255,245,180,1)');
    ctx.fillStyle = g;
    ctx.fillRect(f.x - 22, 0, 44, f.y + 6);
  }
  ctx.globalAlpha = 1;
}
function desenharTextos(ctx) {
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px system-ui, sans-serif';
  for (const t of mundo.textos) {
    ctx.globalAlpha = Math.max(t.vida / 1.6, 0);
    ctx.fillStyle = t.cor;
    ctx.fillText(t.msg, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

// Marca o destino do jogador e o lugar de plantio/obra
function desenharMarcadores(ctx) {
  const { jogador } = mundo;
  if (jogador.destino && !jogador.tarefa) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(jogador.destino.x, jogador.destino.y, 8, 0, Math.PI * 2); ctx.stroke();
  }
  const tf = jogador.tarefa;
  if (tf && (tf.tipo === 'plantar' || tf.tipo === 'construir') && !jogador.acao) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tf.x, tf.y, tf.raio, 0, Math.PI * 2); ctx.stroke();
  }
}

// ===================== Cena completa =====================
export function desenharCena(ctx, canvas) {
  const { arvores, estruturas, agentes, animais, cardumes } = mundo;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1f6fa8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(camera.escala, 0, 0, camera.escala, camera.offX, camera.offY);

  for (const c of cardumes) desenharCardume(ctx, c);
  desenharIlha(ctx);

  // Áreas no chão (cercados, campo de trigo) ficam por baixo de tudo
  for (const s of estruturas) {
    if (!s.area) continue;
    CONSTRUCOES[s.tipo].desenhar(ctx, s.x, s.y, 1, 1, s);
    rotulo(ctx, s.x, s.y + s.raio + 14, 'Nv ' + s.nivel, '#ffe9b0');
  }
  const obra = obraAtual();
  const obraDePe = obra && !CONSTRUCOES[obra.t.construcao].area;
  if (obra && !obraDePe) desenharObra(ctx, obra);

  desenharMarcadores(ctx);

  // Objetos de pé, ordenados pelo y (quem está mais embaixo aparece na frente)
  const objetos = [
    ...arvores.map(t => ({ y: t.y, f: () => desenharArvore(ctx, t) })),
    ...estruturas.filter(s => !s.area).map(s => ({ y: s.y, f: () => desenharEstrutura(ctx, s) })),
    ...agentes.filter(a => !a.embarcado).map(a => ({ y: a.y, f: () => desenharAgente(ctx, a) })),
    ...animais.map(an => ({ y: an.y, f: () => desenharAnimal(ctx, an) })),
  ];
  if (obraDePe) objetos.push({ y: obra.t.y, f: () => desenharObra(ctx, obra) });
  objetos.sort((a, b) => a.y - b.y).forEach(o => o.f());

  desenharEfeitos(ctx);
  desenharPrevia(ctx);
  for (const a of agentes) desenharBarraAcao(ctx, a);
  desenharTextos(ctx);
}
