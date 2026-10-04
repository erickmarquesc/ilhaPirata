import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CORES_ACAO, ICONES, ILHA, MONTES, NOMES_ACAO, TEMPO_PESCAR } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { crescimento } from '../../game/arvores.js';
import { filhosParaNivel, filhosQuePodemAjudar, nivelAlvoDaObra } from '../../game/estruturas.js';
import { mundo } from '../../game/mundo.js';
import { ajudantesTrabalhando, precisaAjuda } from '../../game/tarefas.js';
import { escalaDoMonte } from './Montes.jsx';

// Desenha num canvas 2D por cima da cena: rótulos, barras de progresso e textos flutuantes.
// Cada item tem uma posição no mundo (x, altura, y) que é projetada na tela a cada quadro.
const v = new THREE.Vector3();

function rotulo(ctx, x, y, msg, cor = '#fff') {
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const w = ctx.measureText(msg).width + 10;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - 12, w, 16, 4); ctx.fill();
  ctx.fillStyle = cor;
  ctx.fillText(msg, x, y);
}
function barra(ctx, cx, y, larg, alt, prog, cor) {
  const x = cx - larg / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 2, y - 2, larg + 4, alt + 4);
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, larg * Math.min(prog, 1), alt);
}

// Altura (no 3D) de onde fica a barra de cada tarefa
function alturaDaBarra(t) {
  if (t.tipo === 'serrar') return 40 * (t.raio / 16) + 6;
  if (t.tipo === 'construir' || t.tipo === 'evoluir') return CONSTRUCOES[t.construcao].altura + 6;
  return 34;
}

function desenhar(ctx, proj) {
  const { estruturas, agentes, arvores, textos, jogador, esposa } = mundo;

  // Árvores crescendo
  for (const t of arvores) {
    const c = crescimento(t);
    if (c >= 1) continue;
    const p = proj(t.x, 0, t.y);
    if (p) barra(ctx, p.x, p.y + 8, 30, 4, c, '#8fd16a');
  }

  // Montes: quanto ainda resta
  for (const m of mundo.montes) {
    const p = proj(m.x, 22 * escalaDoMonte(m) + 4, m.y);
    if (!p) continue;
    if (m.restante > 0) rotulo(ctx, p.x, p.y, ICONES[MONTES[m.tipo].recurso] + ' ' + m.restante, '#f0d8c0');
    else rotulo(ctx, p.x, p.y, '⏳ volta em ' + Math.ceil(m.recarga) + 's', '#e8e8e8');
  }

  // Construções: nível e avisos da jangada
  for (const s of estruturas) {
    const base = proj(s.x, 0, s.area ? s.y + s.raio : s.y);
    if (base) rotulo(ctx, base.x, base.y + 18, 'Nv ' + s.nivel, '#ffe9b0');
    if (s.tipo !== 'jangada') continue;
    const topo = proj(s.x, 60, s.y);
    if (!topo) continue;
    if (s.empurrar !== undefined && s.empurrar < 1) rotulo(ctx, topo.x, topo.y, 'Empurrando para a água...', '#c8e8ff');
    else if (s.pesca > 0) {
      barra(ctx, topo.x, topo.y, 44, 5, s.pesca / TEMPO_PESCAR, '#7ec8f0');
      rotulo(ctx, topo.x, topo.y - 8, '🎣 Pescando...', '#c8e8ff');
    } else if (s.estoqueCheio) {
      rotulo(ctx, topo.x, topo.y, 'Estoque cheio! Não dá para pescar', '#ffb0a0');
    } else if (s.tripulacao && s.tripulacao.length === 1) {
      rotulo(ctx, topo.x, topo.y, 'Esperando o segundo adulto...', '#ffe9b0');
    }
  }

  // Esposa: gravidez, bebê, descanso
  if (esposa) {
    const p = proj(esposa.x, 30, esposa.y);
    if (p) {
      if (esposa.gravidez > 0) rotulo(ctx, p.x, p.y, '🤰 ' + Math.ceil(esposa.gravidez) + 's', '#ffc0dd');
      if (esposa.cuidado > 0) rotulo(ctx, p.x, p.y, '🍼 ' + Math.ceil(esposa.cuidado) + 's', '#c8e8ff');
      if (esposa.descanso > 0) rotulo(ctx, p.x, p.y, '⏳ ' + Math.ceil(esposa.descanso) + 's', '#e8e8e8');
    }
  }

  // Barras de ação
  for (const a of agentes) {
    if (!a.acao) continue;
    const t = a.acao.tarefa;
    if (t.tipo === 'esperarNaCabana' || t.tipo === 'cuidarNaCabana') continue; // sem barra: o tempo aparece no rótulo da esposa
    if (t.tipo === 'ajudar') {
      const p = proj(a.x, 30, a.y);
      if (p) rotulo(ctx, p.x, p.y, '🔨 ajudando', '#ffe9b0');
      continue;
    }
    if (precisaAjuda(t) && !ajudantesTrabalhando(t)) {
      const p = proj(t.x, alturaDaBarra(t), t.y);
      const n = filhosParaNivel(t.construcao, nivelAlvoDaObra(t));
      const adultos = !!CONSTRUCOES[t.construcao].soAdultos;
      const quem = adultos ? (n > 1 ? `${n} filhos adultos` : 'um filho adulto') : (n > 1 ? `${n} filhos adolescentes ou adultos` : 'um filho adolescente ou adulto');
      const msg = filhosQuePodemAjudar(t.construcao) >= n
        ? (n > 1 ? `Esperando os ${n} filhos chegarem para ajudar...` : 'Esperando o filho chegar para ajudar...')
        : `Precisa de ${quem}`;
      if (p) rotulo(ctx, p.x, p.y, msg, '#ffe9b0');
      continue;
    }
    const namorar = t.tipo === 'namorar';
    const p = namorar ? proj((a.x + t.x) / 2, 36, (a.y + t.y) / 2) : proj(t.x, alturaDaBarra(t), t.y);
    if (!p) continue;
    const pequeno = a !== jogador;
    barra(ctx, p.x, p.y, pequeno ? 40 : 60, pequeno ? 5 : 8, a.acao.tempo / a.acao.duracao, CORES_ACAO[t.tipo]);
    if (!pequeno) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(NOMES_ACAO[t.tipo] + '... ' + Math.ceil(a.acao.duracao - a.acao.tempo) + 's', p.x, p.y - 6);
    }
    if (namorar) {
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('💕', p.x, p.y - 24 + Math.sin(performance.now() / 200) * 4);
    }
  }

  // Textos flutuantes (+20 madeira, avisos...)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  for (const t of textos) {
    const p = proj(t.x, 24, t.y);
    if (!p) continue;
    ctx.globalAlpha = Math.max(t.vida / 1.6, 0);
    ctx.strokeText(t.msg, p.x, p.y);
    ctx.fillStyle = t.cor;
    ctx.fillText(t.msg, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

export default function Rotulos({ canvasRef }) {
  useFrame(({ camera, size, viewport }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = viewport.dpr;
    const w = Math.round(size.width * dpr), h = Math.round(size.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const proj = (x, altura, y) => {
      v.set(x - ILHA.x, altura, y - ILHA.y).project(camera);
      if (v.z > 1) return null; // atrás da câmera
      return { x: (v.x + 1) / 2 * size.width, y: (1 - v.y) / 2 * size.height };
    };
    desenhar(ctx, proj);
  });
  return null;
}
