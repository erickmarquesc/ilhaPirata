import { MUNDO } from './config.js';

// ===================== Câmera =====================
// Ajusta o mundo (1000x1000) para caber inteiro no canvas, centralizado.
export const camera = { escala: 1, offX: 0, offY: 0 };

export function redimensionar(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  camera.escala = Math.min(canvas.width / MUNDO.w, canvas.height / MUNDO.h);
  camera.offX = (canvas.width - MUNDO.w * camera.escala) / 2;
  camera.offY = (canvas.height - MUNDO.h * camera.escala) / 2;
}

export function telaParaMundo(canvas, cx, cy) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const px = (cx - rect.left) * dpr, py = (cy - rect.top) * dpr;
  return { x: (px - camera.offX) / camera.escala, y: (py - camera.offY) / camera.escala };
}
