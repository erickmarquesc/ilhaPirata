import * as THREE from 'three';
import { createContext, useContext } from 'react';

// Materiais compartilhados, com sombreamento facetado (visual low-poly)
const cache = new Map();
export function material(cor, fantasma = false, duplo = false) {
  const chave = cor + (fantasma ? ':f' : '') + (duplo ? ':d' : '');
  let m = cache.get(chave);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: cor, flatShading: true, roughness: 0.9, metalness: 0,
      transparent: fantasma, opacity: fantasma ? 0.45 : 1, depthWrite: !fantasma,
      side: duplo ? THREE.DoubleSide : THREE.FrontSide,
    });
    cache.set(chave, m);
  }
  return m;
}

// Dentro de <Fantasma> os modelos ficam translúcidos (prévia de construção)
const FantasmaContext = createContext(false);
export function Fantasma({ children }) {
  return <FantasmaContext.Provider value>{children}</FantasmaContext.Provider>;
}
export function useFantasma() {
  return useContext(FantasmaContext);
}
export function useMaterial() {
  const fantasma = useContext(FantasmaContext);
  return (cor, duplo = false) => material(cor, fantasma, duplo);
}
