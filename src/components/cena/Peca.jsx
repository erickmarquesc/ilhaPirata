import * as THREE from 'three';
import { useMaterial } from './materiais.jsx';

// Geometrias unitárias compartilhadas; o tamanho vem do scale
export const GEO = {
  caixa: new THREE.BoxGeometry(1, 1, 1),
  cilindro: new THREE.CylinderGeometry(1, 1, 1, 7),
  octogono: new THREE.CylinderGeometry(1, 1, 1, 8).rotateY(Math.PI / 8), // face reta virada para +Z
  tronco: new THREE.CylinderGeometry(0.8, 1, 1, 6),
  cone: new THREE.ConeGeometry(1, 1, 7),
  telhado: new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4), // pirâmide de base quadrada
  bola: new THREE.IcosahedronGeometry(1, 0),
  bolaLisa: new THREE.IcosahedronGeometry(1, 1),
  rocha: new THREE.DodecahedronGeometry(1, 0),
  anel: new THREE.RingGeometry(0.8, 1, 32).rotateX(-Math.PI / 2),
  disco: new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2),
  quadrado: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
};

// Uma peça low-poly: <Peca geo="caixa" cor="#a06a35" p={[x, y, z]} s={[w, h, d]} />
export default function Peca({ geo = 'caixa', cor, p = [0, 0, 0], s = 1, r = [0, 0, 0], sombra = true, ...props }) {
  const mat = useMaterial();
  return (
    <mesh
      geometry={GEO[geo]}
      material={mat(cor)}
      position={p}
      scale={s}
      rotation={r}
      castShadow={sombra}
      receiveShadow
      {...props}
    />
  );
}
