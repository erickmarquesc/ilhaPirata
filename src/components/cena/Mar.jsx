import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';
import { useMundo } from '../../hooks/useMundo.js';
import { idDe } from './coords.js';
import { GEO } from './Peca.jsx';

// ===================== Cardumes =====================
// Peixinho low-poly: corpo oval, rabo em leque, nadadeira nas costas e olhos.
// Tudo numa geometria só (com cor por vértice: o olho fica escuro, o resto pega a cor do peixe).
const MAX_PEIXES = 8;
const CORES_PEIXE = ['#f2a03d', '#e9e4cf', '#f7c948', '#ef7f4a'];

function parte(geo, cor) {
  const g = geo.toNonIndexed();
  const c = new THREE.Color(cor);
  const cores = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < cores.length; i += 3) { cores[i] = c.r; cores[i + 1] = c.g; cores[i + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  g.deleteAttribute('uv');
  return g;
}
const geoPeixe = mergeGeometries([
  parte(new THREE.IcosahedronGeometry(1, 1).scale(3.8, 1.6, 1.3), '#ffffff'),                                        // corpo
  parte(new THREE.ConeGeometry(1.9, 3.2, 3).rotateZ(-Math.PI / 2).scale(1, 1, 0.3).translate(-4.8, 0, 0), '#ffffff'), // rabo
  parte(new THREE.ConeGeometry(0.9, 1.8, 3).scale(1, 1, 0.3).rotateZ(0.5).translate(0, 1.7, 0), '#ffffff'),           // nadadeira
  parte(new THREE.IcosahedronGeometry(0.3, 0).translate(2.5, 0.4, 0.95), '#1a1a1a'),                                   // olhos
  parte(new THREE.IcosahedronGeometry(0.3, 0).translate(2.5, 0.4, -0.95), '#1a1a1a'),
]);
const matsPeixe = CORES_PEIXE.map(cor => new THREE.MeshStandardMaterial({ color: cor, vertexColors: true, flatShading: true, roughness: 0.6 }));
const geoAnelCardume = new THREE.RingGeometry(0.96, 1, 48).rotateX(-Math.PI / 2);
const matAnelCardume = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.16, depthWrite: false });

const Cardume = memo(function Cardume({ c }) {
  const peixes = useRef([]);
  const anel = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const qtd = c.peixes + 3;
    anel.current.position.set(c.x - ILHA.x, 0.3, c.y - ILHA.y);
    anel.current.scale.setScalar(c.raio * (1 + Math.sin(t * 1.5) * 0.04));
    peixes.current.forEach((m, i) => {
      if (!m) return;
      m.visible = i < qtd;
      const a = c.fase * 0.8 + i / qtd * Math.PI * 2;
      const r = c.raio * (0.35 + 0.5 * ((i * 37) % 10) / 10);
      // nada em círculo, virado para onde vai, com o corpo balançando
      const rumo = -Math.atan2(Math.cos(a) * 0.8, -Math.sin(a));
      m.position.set(c.x - ILHA.x + Math.cos(a) * r, 0.6, c.y - ILHA.y + Math.sin(a) * r * 0.8);
      m.rotation.set(0, rumo + Math.sin(t * 12 + i * 1.7) * 0.25, 0);
      // de vez em quando o primeiro peixe dá um pulo fora d'água
      if (i === 0) {
        const p = (t * 0.17 + c.x * 0.01) % 1;
        if (p < 0.1) {
          const f = p / 0.1;
          m.position.y = 0.6 + Math.sin(f * Math.PI) * 10;
          m.rotation.z = Math.cos(f * Math.PI) * 0.9;
        } else m.rotation.z = 0;
      }
    });
  });
  return (
    <>
      <mesh ref={anel} geometry={geoAnelCardume} material={matAnelCardume} />
      {Array.from({ length: MAX_PEIXES }, (_, i) => (
        <mesh key={i} ref={el => { peixes.current[i] = el; }} geometry={geoPeixe} material={matsPeixe[i % matsPeixe.length]} castShadow />
      ))}
    </>
  );
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
