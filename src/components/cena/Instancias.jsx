import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { material } from './materiais.jsx';

const auxiliar = new THREE.Object3D();
const cor = new THREE.Color();
const BRANCO = material('#ffffff'); // a cor vem de cada instância

// Várias cópias da mesma geometria desenhadas numa chamada só (InstancedMesh).
// itens: [{ p: [x, y, z], s: número ou [x, y, z], r: [x, y, z], cor }]
// Para objetos parados (enfeites); as matrizes só são refeitas quando "itens" muda.
export default function Instancias({ geometria, itens, sombra = false, ...props }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const mesh = ref.current;
    itens.forEach((it, i) => {
      auxiliar.position.set(...it.p);
      if (Array.isArray(it.s)) auxiliar.scale.set(...it.s); else auxiliar.scale.setScalar(it.s ?? 1);
      auxiliar.rotation.set(...(it.r ?? [0, 0, 0]));
      auxiliar.updateMatrix();
      mesh.setMatrixAt(i, auxiliar.matrix);
      mesh.setColorAt(i, cor.set(it.cor));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [itens]);
  if (!itens.length) return null;
  // remonta só quando a quantidade muda (raro: construir, expandir a ilha)
  return (
    <instancedMesh
      key={itens.length}
      ref={ref}
      args={[geometria, BRANCO, Math.max(itens.length, 1)]}
      castShadow={sombra}
      receiveShadow
      {...props}
    />
  );
}
