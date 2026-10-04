import { TEMPO_TRIGO_CRESCER } from '../config.js';

// ===================== Desenho das construções =====================
// Todas recebem (ctx, x, y, progresso da obra 0..1, alpha)

export function desenharTotem(ctx, x, y, progresso = 1, alpha = 1) {
  ctx.globalAlpha = alpha;
  const larg = 22, altBloco = 16, blocos = 4;
  const visiveis = Math.ceil(blocos * progresso);
  ctx.fillStyle = '#5a3a1c';
  ctx.beginPath(); ctx.ellipse(x, y, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
  const cores = ['#8b5a2b', '#a06a35', '#8b5a2b', '#a06a35'];
  for (let i = 0; i < visiveis; i++) {
    const by = y - (i + 1) * altBloco;
    ctx.fillStyle = cores[i];
    ctx.fillRect(x - larg / 2, by, larg, altBloco);
    ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - larg / 2, by, larg, altBloco);
    ctx.fillStyle = '#3a220e';
    ctx.fillRect(x - 6, by + 4, 4, 3);
    ctx.fillRect(x + 2, by + 4, 4, 3);
    ctx.fillRect(x - 5, by + 10, 10, 2);
  }
  if (progresso >= 1) {
    const ty = y - blocos * altBloco;
    ctx.fillStyle = '#c47f3d';
    ctx.beginPath();
    ctx.moveTo(x - larg / 2, ty + 6); ctx.lineTo(x - larg / 2 - 14, ty - 2); ctx.lineTo(x - larg / 2, ty + 12);
    ctx.moveTo(x + larg / 2, ty + 6); ctx.lineTo(x + larg / 2 + 14, ty - 2); ctx.lineTo(x + larg / 2, ty + 12);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Cabana: paredes de troncos sobem primeiro, depois o telhado de palha
export function desenharCabana(ctx, x, y, progresso = 1, alpha = 1) {
  ctx.globalAlpha = alpha;
  const larg = 64, altParede = 30, altTelhado = 34;
  const esq = x - larg / 2;
  // chão
  ctx.fillStyle = '#7a5a32';
  ctx.beginPath(); ctx.ellipse(x, y, larg / 2 + 6, 10, 0, 0, Math.PI * 2); ctx.fill();
  // paredes (5 troncos)
  const troncos = 5, altTronco = altParede / troncos;
  const pParede = Math.min(progresso / 0.65, 1);
  const visiveis = Math.ceil(troncos * pParede);
  for (let i = 0; i < visiveis; i++) {
    const ty = y - (i + 1) * altTronco;
    ctx.fillStyle = i % 2 ? '#9a6532' : '#875627';
    ctx.fillRect(esq, ty, larg, altTronco);
    ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 1;
    ctx.strokeRect(esq, ty, larg, altTronco);
  }
  // porta
  if (pParede >= 1) {
    ctx.fillStyle = '#3a220e';
    ctx.fillRect(x - 7, y - 20, 14, 20);
  }
  // telhado
  if (progresso > 0.65) {
    const pTelhado = Math.min((progresso - 0.65) / 0.35, 1);
    const topo = y - altParede;
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.moveTo(esq - 8, topo);
    ctx.lineTo(x + larg / 2 + 8, topo);
    ctx.lineTo(x, topo - altTelhado * pTelhado);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a6a24'; ctx.lineWidth = 1.5; ctx.stroke();
    if (pTelhado >= 1) {
      ctx.strokeStyle = 'rgba(138,106,36,0.6)'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const yy = topo - altTelhado * i / 4, meia = (larg / 2 + 8) * (1 - i / 4);
        ctx.beginPath(); ctx.moveTo(x - meia, yy); ctx.lineTo(x + meia, yy); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// Jangada: troncos lado a lado, amarras, depois mastro e vela
export function desenharJangada(ctx, x, y, progresso = 1, alpha = 1) {
  ctx.globalAlpha = alpha;
  const larg = 54, alt = 26, troncos = 6;
  const esq = x - larg / 2, topo = y - alt / 2;
  // sombra na água/areia
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(x, y + 4, larg / 2 + 4, alt / 2 + 2, 0, 0, Math.PI * 2); ctx.fill();
  // troncos aparecem um a um nos primeiros 70%
  const pTroncos = Math.min(progresso / 0.7, 1);
  const visiveis = Math.ceil(troncos * pTroncos);
  const altTronco = alt / troncos;
  for (let i = 0; i < visiveis; i++) {
    const ty = topo + i * altTronco;
    ctx.fillStyle = i % 2 ? '#a06a35' : '#8b5a2b';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(esq, ty, larg, altTronco, altTronco / 2) : ctx.rect(esq, ty, larg, altTronco);
    ctx.fill();
    ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  // amarras de corda
  if (pTroncos >= 1) {
    ctx.strokeStyle = '#d9c38a'; ctx.lineWidth = 2;
    for (const fx of [esq + 8, x + larg / 2 - 8]) {
      ctx.beginPath(); ctx.moveTo(fx, topo); ctx.lineTo(fx, topo + alt); ctx.stroke();
    }
  }
  // mastro e vela nos últimos 30%
  if (progresso > 0.7) {
    const pMastro = Math.min((progresso - 0.7) / 0.3, 1);
    const altMastro = 44 * pMastro;
    ctx.strokeStyle = '#5a3a1c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - altMastro); ctx.stroke();
    if (pMastro >= 1) {
      ctx.fillStyle = '#efe6cf';
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 42); ctx.lineTo(x + 22, y - 14); ctx.lineTo(x + 2, y - 10);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b8ab88'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// Área cercada quadrada: chão, cerca de estacas e um detalhe no meio
export function desenharCercado(ctx, x, y, h, corChao, detalhe, progresso = 1, alpha = 1) {
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = corChao;
  ctx.fillRect(x - h, y - h, h * 2, h * 2);
  ctx.globalAlpha = alpha;
  // estacas ao redor, aparecendo conforme a obra avança
  const porLado = Math.max(4, Math.round(h / 9)), total = porLado * 4;
  const visiveis = Math.ceil(total * progresso);
  const ponto = i => {
    const lado = Math.floor(i / porLado), f = (i % porLado) / porLado;
    if (lado === 0) return [x - h + f * 2 * h, y - h];
    if (lado === 1) return [x + h, y - h + f * 2 * h];
    if (lado === 2) return [x + h - f * 2 * h, y + h];
    return [x - h, y + h - f * 2 * h];
  };
  ctx.strokeStyle = '#7a5428'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= Math.min(visiveis, total); i++) {
    const [px, py] = ponto(i % total);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  // deixa uma porteira aberta no meio do lado de baixo
  ctx.stroke();
  for (let i = 0; i < visiveis; i++) {
    const [px, py] = ponto(i);
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(px - 2, py - 4, 4, 6);
  }
  if (progresso >= 1) {
    if (detalhe === 'casinha') {
      ctx.fillStyle = '#9a6532'; ctx.fillRect(x - 10, y - h + 6, 20, 14);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.moveTo(x - 13, y - h + 7); ctx.lineTo(x + 13, y - h + 7); ctx.lineTo(x, y - h - 2); ctx.fill();
    } else if (detalhe === 'cocho') {
      ctx.fillStyle = '#6b4423'; ctx.fillRect(x - 12, y + h - 14, 24, 7);
      ctx.fillStyle = '#d9c050'; ctx.fillRect(x - 10, y + h - 13, 20, 4);
    }
  }
  ctx.globalAlpha = 1;
}

export function desenharCampoTrigo(ctx, x, y, progresso = 1, alpha = 1, est = null) {
  const h = 46;
  desenharCercado(ctx, x, y, h, '#8a6a3a', null, progresso, alpha);
  if (!est || progresso < 1) return;
  ctx.globalAlpha = alpha;
  for (const k of est.canteiros) {
    const meia = k.tam / 2;
    ctx.fillStyle = '#6e4f28';
    ctx.fillRect(k.x - meia, k.y - meia, k.tam, k.tam);
    if (k.estado === 'vazio') continue;
    const cresc = k.estado === 'maduro' ? 1 : Math.min(k.idade / TEMPO_TRIGO_CRESCER, 1);
    ctx.strokeStyle = k.estado === 'maduro' ? '#f0c840' : '#7cbf4a';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const px = k.x - meia + 3 + i * (k.tam - 6) / 2, py = k.y - meia + 4 + j * (k.tam - 6) / 2;
      ctx.beginPath(); ctx.moveTo(px, py + 2); ctx.lineTo(px, py + 2 - 7 * (0.3 + 0.7 * cresc)); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
