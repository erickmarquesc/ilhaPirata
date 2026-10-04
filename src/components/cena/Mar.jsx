import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';
import { useMundo } from '../../hooks/useMundo.js';
import { idDe } from './coords.js';
import { material } from './materiais.jsx';
import { GEO } from './Peca.jsx';

// ===================== Cardumes =====================
const MAX_PEIXES = 8;
const geoPeixe = new THREE.ConeGeometry(1.6, 8, 4).rotateX(Math.PI / 2);

const Cardume = memo(function Cardume({ c }) {
  const peixes = useRef([]);
  useFrame(() => {
    const qtd = c.peixes + 3;
    peixes.current.forEach((m, i) => {
      if (!m) return;
      m.visible = i < qtd;
      const a = c.fase * 0.8 + i / qtd * Math.PI * 2;
      const r = c.raio * (0.35 + 0.5 * ((i * 37) % 10) / 10);
      m.position.set(c.x - ILHA.x + Math.cos(a) * r, 0.4, c.y - ILHA.y + Math.sin(a) * r * 0.8);
      m.rotation.y = -a; // nadando em círculo
    });
  });
  return Array.from({ length: MAX_PEIXES }, (_, i) => (
    <mesh key={i} ref={el => { peixes.current[i] = el; }} geometry={geoPeixe} material={material('#1b4a72')} />
  ));
});

export function Cardumes() {
  const { cardumes } = useMundo();
  return cardumes.map(c => <Cardume key={idDe(c)} c={c} />);
}

// ===================== Luz divina =====================
function Luz({ f }) {
  const ref = useRef();
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff5b4', transparent: true, depthWrite: false }), []);
  useFrame(() => { mat.opacity = Math.max(f.vida / 1.8, 0) * 0.55; });
  return <mesh ref={ref} geometry={GEO.cilindro} material={mat} position={[f.x - ILHA.x, 200, f.y - ILHA.y]} scale={[20, 400, 20]} />;
}

export function Efeitos() {
  useMundo();
  return mundo.efeitos.map(f => <Luz key={idDe(f)} f={f} />);
}
