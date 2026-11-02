import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';
import { GEO } from './Peca.jsx';

// ===================== Disparos do barco pirata =====================
// Bolas de canhão, clarão e fumaça na boca do canhão e respingo onde a bola cai (ver canhoes.js).
// Tudo dura menos de um segundo: um conjunto fixo de malhas lê mundo.balas / mundo.estouros
// a cada quadro, sem esperar o React re-renderizar.
const MAX_BALAS = 24,
  MAX_ESTOUROS = 48;
const matBala = new THREE.MeshStandardMaterial({ color: '#1e1e1e', flatShading: true, roughness: 0.5, metalness: 0.4 });
const COR = { clarao: '#ffb347', fumaca: '#ddd8cc', agua: '#ffffff' };
const geoRespingo = new THREE.ConeGeometry(1, 1, 7, 1, true).translate(0, 0.5, 0); // coluna d'água, base na água

export default function Disparos() {
  const balas = useRef([]);
  const estouros = useRef([]);
  const mats = useMemo(
    () => Array.from({ length: MAX_ESTOUROS }, () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })),
    [],
  );

  useFrame(() => {
    balas.current.forEach((m, i) => {
      const b = mundo.balas[i];
      m.visible = !!b;
      if (b) m.position.set(b.x - ILHA.x, b.h, b.y - ILHA.y);
    });
    estouros.current.forEach((m, i) => {
      const e = mundo.estouros[i];
      m.visible = !!e;
      if (!e) return;
      const f = 1 - e.vida / e.duracao; // 0 → 1 ao longo da vida
      m.material.color.set(COR[e.tipo]);
      if (e.tipo === 'agua') {
        // sobe e desce, abrindo e sumindo
        m.geometry = geoRespingo;
        const larg = 2 + f * 4;
        m.scale.set(larg, Math.max(Math.sin(f * Math.PI) * 14, 0.01), larg);
        m.position.set(e.x - ILHA.x, e.h, e.y - ILHA.y);
        m.material.opacity = 0.85 * (1 - f);
      } else {
        // clarão: rápido e forte | fumaça: cresce, sobe um pouco e some
        m.geometry = GEO.bola;
        m.scale.setScalar(e.tipo === 'clarao' ? 2.5 + f * 2.5 : 2 + f * 6);
        m.position.set(e.x - ILHA.x, e.h + (e.tipo === 'fumaca' ? f * 6 : 0), e.y - ILHA.y);
        m.material.opacity = (e.tipo === 'clarao' ? 1 : 0.7) * (1 - f);
      }
    });
  });

  return (
    <>
      {Array.from({ length: MAX_BALAS }, (_, i) => (
        <mesh
          key={`b${i}`}
          ref={el => {
            balas.current[i] = el;
          }}
          geometry={GEO.bolaLisa}
          material={matBala}
          scale={1.3}
          visible={false}
          castShadow
        />
      ))}
      {mats.map((mat, i) => (
        <mesh
          key={`e${i}`}
          ref={el => {
            estouros.current[i] = el;
          }}
          geometry={GEO.bola}
          material={mat}
          visible={false}
        />
      ))}
    </>
  );
}
