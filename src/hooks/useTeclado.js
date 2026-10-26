import { useEffect } from 'react';
import { teclaPressionada, teclaSolta } from '../game/jogo.js';

export function useTeclado() {
  useEffect(() => {
    const aoPressionar = e => {
      // Espaço e setas não devem rolar a página nem apertar o botão em foco
      if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
      teclaPressionada(e.key);
    };
    const aoSoltar = e => teclaSolta(e.key);
    window.addEventListener('keydown', aoPressionar);
    window.addEventListener('keyup', aoSoltar);
    return () => {
      window.removeEventListener('keydown', aoPressionar);
      window.removeEventListener('keyup', aoSoltar);
    };
  }, []);
}
