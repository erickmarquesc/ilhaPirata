import { animalAdulto } from '../animais.js';
import { circulo, rotulo } from './primitivas.js';

// ===================== Pessoas =====================
export function desenharAgente(ctx, a) {
  const { x, y, raio: r } = a;
  if (a.tipo === 'jogador') {
    circulo(ctx, x, y, r, '#d9822b');
    circulo(ctx, x, y - r, r * 0.6, '#f2c79a');
  } else if (a.tipo === 'esposa') {
    const barriga = a.gravidez > 0 ? 1.25 : 1;
    circulo(ctx, x, y, r * barriga, '#b5508a');
    circulo(ctx, x, y - r - 1, r * 0.75, '#5a3418');   // cabelo
    circulo(ctx, x, y - r, r * 0.6, '#f2c79a');
    if (a.cuidado > 0) {                                // bebê no colo
      circulo(ctx, x + r, y - 2, 5, '#ffffff');
      circulo(ctx, x + r, y - 4, 3, '#f2c79a');
    }
    if (a.gravidez > 0) rotulo(ctx, x, y - r * 2 - 6, '🤰 ' + Math.ceil(a.gravidez) + 's', '#ffc0dd');
    if (a.cuidado > 0) rotulo(ctx, x, y - r * 2 - 6, '🍼 ' + Math.ceil(a.cuidado) + 's', '#c8e8ff');
    if (a.descanso > 0) rotulo(ctx, x, y - r * 2 - 6, '⏳ ' + Math.ceil(a.descanso) + 's', '#e8e8e8');
  } else if (a.tipo === 'adulto') {
    circulo(ctx, x, y, r, '#2b5fa8');
    circulo(ctx, x, y - r, r * 0.6, '#f2c79a');
    circulo(ctx, x, y - r * 0.55, r * 0.35, '#6b4423'); // barba
  } else if (a.tipo === 'adolescente') {
    circulo(ctx, x, y, r, '#2e9c84');
    circulo(ctx, x, y - r, r * 0.62, '#f2c79a');
  } else if (a.tipo === 'crianca') {
    circulo(ctx, x, y, r, '#4aa3d9');
    circulo(ctx, x, y - r, r * 0.65, '#f2c79a');
  }
}

// ===================== Animais =====================
const CORES_ANIMAL = {
  ovelha:  { f: ['#f4f4ee', '#3a3a3a'], m: ['#d6cfbf', '#5a4a3a'] },
  vaca:    { f: ['#f5f5f5', '#f0d8d0'], m: ['#6b3e1e', '#55301a'] },
  galinha: { f: ['#fafafa', '#fafafa'], m: ['#c8642a', '#c8642a'] },
};

export function desenharAnimal(ctx, an) {
  const r = an.raio, x = an.x, y = an.y, d = an.dir;
  const corpoY = y - r * 0.6;
  const cores = CORES_ANIMAL[an.especie][an.sexo];
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.1, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  if (an.especie === 'galinha' && an.sexo === 'm') {   // rabo do galo
    ctx.fillStyle = '#1f5a3a';
    ctx.beginPath(); ctx.ellipse(x - d * r * 1.1, corpoY - r * 0.5, r * 0.5, r * 0.9, -d * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  // corpo
  ctx.fillStyle = cores[0];
  ctx.beginPath(); ctx.ellipse(x, corpoY, r * 1.25, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  if (an.especie === 'vaca' && an.sexo === 'f') {       // manchas
    circulo(ctx, x - r * 0.4, corpoY - r * 0.2, r * 0.3, '#2a2a2a');
    circulo(ctx, x + r * 0.5, corpoY + r * 0.2, r * 0.25, '#2a2a2a');
  }
  if (an.especie === 'ovelha') {                       // lã
    for (let i = -1; i <= 1; i++) circulo(ctx, x + i * r * 0.6, corpoY - r * 0.55, r * 0.4, cores[0]);
  }
  // cabeça
  const hx = x + d * r * 1.15, hy = corpoY - r * 0.4;
  const hr = an.especie === 'galinha' ? r * 0.55 : r * 0.5;
  circulo(ctx, hx, hy, hr, cores[1]);
  if (an.especie === 'galinha') {                       // crista e bico
    circulo(ctx, hx, hy - hr, an.sexo === 'm' ? hr * 0.7 : hr * 0.4, '#d62a2a');
    ctx.fillStyle = '#f0b030';
    ctx.beginPath(); ctx.moveTo(hx + d * hr, hy - 1); ctx.lineTo(hx + d * hr * 1.8, hy); ctx.lineTo(hx + d * hr, hy + 1.5); ctx.fill();
  }
  if (an.sexo === 'm' && an.especie !== 'galinha' && animalAdulto(an)) { // chifres
    ctx.strokeStyle = an.especie === 'vaca' ? '#eeeeee' : '#a08a60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx - hr * 0.5, hy - hr * 0.6); ctx.lineTo(hx - hr * 0.9, hy - hr * 1.4);
    ctx.moveTo(hx + hr * 0.5, hy - hr * 0.6); ctx.lineTo(hx + hr * 0.9, hy - hr * 1.4);
    ctx.stroke();
  }
}
