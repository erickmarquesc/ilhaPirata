import { useSyncExternalStore } from 'react';
import { assinar, mundo, obterVersao } from '../game/mundo.js';

// Re-renderiza o componente sempre que a engine chamar notificar()
export function useMundo() {
  useSyncExternalStore(assinar, obterVersao);
  return mundo;
}
