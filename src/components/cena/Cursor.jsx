import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { adulta } from '../../game/arvores.js';
import { mundo } from '../../game/mundo.js';

// ===================== Cursor do mouse =====================
// Passando o mouse por uma árvore adulta (que dá para cortar), o cursor vira um machado.
// As árvores avisam pelo onPointerOver/Out (ver Arvores.jsx) e aqui, a cada quadro,
// o cursor do canvas é trocado só quando muda.
const svg = (corpo, hx, hy) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${corpo}</svg>`)}") ${hx} ${hy}, pointer`;

// Machado inclinado: cabo de madeira e lâmina de ferro, com contorno escuro para aparecer em qualquer fundo.
// O ponto do clique fica no fio da lâmina.
const MACHADO = svg(`
  <g transform="rotate(35 16 16)" stroke="#2a1608" stroke-linejoin="round">
    <rect x="14.2" y="5" width="3.6" height="25" rx="1.6" fill="#a8692f" stroke-width="1.4"/>
    <path d="M17.8 4.5 L21.5 5.5 L21.5 11 L17.8 12 Z" fill="#8b8f96" stroke-width="1.4"/>
    <path d="M14.2 4.5 L8.5 2 Q4 8 8.5 14.5 L14.2 12 Z" fill="#c9ced6" stroke-width="1.4"/>
    <path d="M8.2 3.2 Q5 8 8.2 13.4" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  </g>`, 12, 4);

// Árvore com o mouse em cima agora (as árvores escrevem aqui)
export const sobMouse = { arvore: null };

export function cursorDoMomento() {
  const t = sobMouse.arvore;
  if (!t || mundo.ui.modo.tipo || mundo.jogador.embarcado) return 'auto';
  if (!mundo.arvores.includes(t) || !adulta(t)) return 'auto';
  return MACHADO;
}

export default function Cursor() {
  const { gl } = useThree();
  const atual = useRef('');
  useEffect(() => () => { gl.domElement.style.cursor = ''; }, [gl]);
  useFrame(() => {
    // o navegador reescreve o valor do style, então compara com o último que pusemos
    const cursor = cursorDoMomento();
    if (atual.current !== cursor) gl.domElement.style.cursor = atual.current = cursor;
  });
  return null;
}
