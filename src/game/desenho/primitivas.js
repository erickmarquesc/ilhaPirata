// ===================== Primitivas de desenho =====================
export function circulo(ctx, x, y, r, cor) {
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function rotulo(ctx, x, y, msg, cor = '#fff') {
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const w = ctx.measureText(msg).width + 8;
  ctx.fillRect(x - w / 2, y - 11, w, 14);
  ctx.fillStyle = cor;
  ctx.fillText(msg, x, y);
}

export function barraProgresso(ctx, x, y, larg, alt, prog, cor) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 2, y - 2, larg + 4, alt + 4);
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, larg * prog, alt);
}
