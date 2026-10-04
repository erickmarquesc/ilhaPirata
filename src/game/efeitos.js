import { mundo } from './mundo.js';

// ===================== Efeitos visuais =====================
export function textoFlutuante(x, y, msg, cor = '#ffe27a') { mundo.textos.push({ x, y, msg, cor, vida: 1.6 }); }
export function luzDivina(x, y) { mundo.efeitos.push({ x, y, vida: 1.8 }); }

export function atualizarEfeitos(dt) {
  const { textos, efeitos } = mundo;
  for (const t of textos) { t.vida -= dt; t.y -= 30 * dt; }
  for (let i = textos.length - 1; i >= 0; i--) if (textos[i].vida <= 0) textos.splice(i, 1);
  for (const f of efeitos) f.vida -= dt;
  for (let i = efeitos.length - 1; i >= 0; i--) if (efeitos[i].vida <= 0) efeitos.splice(i, 1);
}
