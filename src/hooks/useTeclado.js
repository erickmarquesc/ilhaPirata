import { useEffect } from 'react';
import { teclaPressionada, teclaSolta } from '../game/jogo.js';

export function useTeclado() {
  useEffect(() => {
    const aoPressionar = e => teclaPressionada(e.key);
    const aoSoltar = e => teclaSolta(e.key);
    window.addEventListener('keydown', aoPressionar);
    window.addEventListener('keyup', aoSoltar);
    return () => {
      window.removeEventListener('keydown', aoPressionar);
      window.removeEventListener('keyup', aoSoltar);
    };
  }, []);
}
