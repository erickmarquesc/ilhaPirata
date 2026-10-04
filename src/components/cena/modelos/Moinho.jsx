import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBrilho } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Moinho =====================
// Torre de madeira com telhado cônico e pás que giram (mais rápido nos níveis altos).
// 1 pás de ripas · 2 base de pedra e janelinha · 3 sacos de farinha e carrinho ·
// 4 pás com velas de pano e varanda · 5 cúpula dourada, flâmula e lanternas.
// Obra em etapas: base → torre → telhado → pás.

const MADEIRA = '#8b6a45', MADEIRA_ESCURA = '#5a3a1c', TELHADO = '#6e3f22', PEDRA = '#a9aeb3', PANO = '#f2ead6', OURO = '#f5c84c';
const ALTURA_TORRE = 46, EIXO = [0, 50, 13];

function Pas({ nivel }) {
  const giro = useRef();
  useFrame((_, dt) => { giro.current.rotation.z += dt * (0.6 + nivel * 0.15); });
  return (
    <group position={EIXO}>
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, 0, -2]} s={[1.6, 6, 1.6]} r={[Math.PI / 2, 0, 0]} />
      <group ref={giro}>
        <Peca geo="bola" cor={MADEIRA_ESCURA} s={2.4} />
        {[0, 1, 2, 3].map(i => (
          <group key={i} rotation={[0, 0, i * Math.PI / 2 + 0.3]}>
            <Peca cor={MADEIRA_ESCURA} p={[0, 15, 0]} s={[1.2, 28, 0.8]} />
            {nivel >= 4 ? (
              <Peca cor={PANO} p={[3.2, 17, 0.3]} s={[5.4, 22, 0.3]} sombra={false} /> // vela de pano
            ) : (
              [8, 13, 18, 23].map(y => <Peca key={y} cor={MADEIRA} p={[2.6, y, 0.3]} s={[5, 0.8, 0.4]} sombra={false} />) // ripas
            )}
            {nivel >= 5 && <Peca cor={OURO} p={[0, 29.5, 0]} s={[1.8, 1.4, 1]} sombra={false} />}
          </group>
        ))}
      </group>
    </group>
  );
}

function Lanterna({ p }) {
  const luz = useBrilho('#ffcf6a', 1.6);
  return (
    <group position={p}>
      <Peca cor="#2a2a2a" s={[2.6, 0.5, 2.6]} sombra={false} />
      <mesh geometry={geoLuz} material={luz} position={[0, 1.8, 0]} scale={[1, 1.5, 1]} />
      <Peca geo="telhado" cor="#2a2a2a" p={[0, 3.6, 0]} s={[2.2, 1.4, 2.2]} sombra={false} />
    </group>
  );
}
const geoLuz = new THREE.IcosahedronGeometry(1, 0);

function Saco({ p, r = 0 }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Peca geo="bolaLisa" cor="#efe6d2" p={[0, 3, 0]} s={[3.2, 3.4, 2.6]} />
      <Peca cor="#c9b48a" p={[0, 6.2, 0]} s={[1.6, 1, 1.6]} sombra={false} />
    </group>
  );
}

export function Moinho({ progresso = 1, est = null }) {
  const nivel = est?.nivel ?? 1;
  const pTorre = Math.min(Math.max((progresso - 0.15) / 0.5, 0), 1);
  const telhado = progresso >= 0.7;
  const pas = progresso >= 0.9;
  const pronto = progresso >= 1;
  const alturaTorre = ALTURA_TORRE * pTorre;
  return (
    <group>
      {/* base */}
      <Peca geo="octogono" cor={nivel >= 2 ? PEDRA : MADEIRA_ESCURA} p={[0, 2, 0]} s={[19, 4, 19]} />
      {nivel >= 2 && <Peca geo="octogono" cor="#8c9298" p={[0, 4.4, 0]} s={[17.5, 0.8, 17.5]} sombra={false} />}
      {/* torre de tábuas, mais fina em cima */}
      {pTorre > 0 && (
        <group>
          <Peca geo="tronco" cor={MADEIRA} p={[0, 4 + alturaTorre / 2, 0]} s={[13, alturaTorre, 13]} />
          {[0.25, 0.5, 0.75].filter(f => f <= pTorre).map(f => (
            <Peca key={f} geo="tronco" cor={MADEIRA_ESCURA} p={[0, 4 + ALTURA_TORRE * f, 0]} s={[13.4 - f * 2.6, 1, 13.4 - f * 2.6]} sombra={false} />
          ))}
        </group>
      )}
      {pTorre >= 1 && (
        <>
          {/* porta e janelinhas */}
          <Peca cor={MADEIRA_ESCURA} p={[0, 10, 12.4]} s={[7, 12, 1]} />
          <Peca cor="#3a220e" p={[0, 9.5, 12.8]} s={[5.4, 10.4, 0.6]} sombra={false} />
          {nivel >= 2 && <Peca cor="#3a4a52" p={[0, 30, 11.4]} s={[4, 4, 0.8]} sombra={false} />}
          {nivel >= 4 && (
            // varanda em volta da torre
            <group position={[0, 36, 0]}>
              <Peca geo="octogono" cor={MADEIRA_ESCURA} s={[14.5, 1, 14.5]} />
              <Peca geo="octogono" cor={MADEIRA} p={[0, 3, 0]} s={[14.6, 0.6, 14.6]} sombra={false} />
            </group>
          )}
        </>
      )}
      {telhado && (
        <group position={[0, 4 + ALTURA_TORRE, 0]}>
          <Peca geo="cone" cor={nivel >= 5 ? OURO : TELHADO} p={[0, 7, 0]} s={[12, 14, 12]} />
          {nivel >= 5 && (
            <group position={[0, 14, 0]}>
              <Peca geo="cilindro" cor="#3a3a3a" p={[0, 5, 0]} s={[0.4, 10, 0.4]} sombra={false} />
              <Peca cor="#c0392b" p={[3, 8.5, 0]} s={[6, 3.4, 0.3]} sombra={false} />
            </group>
          )}
        </group>
      )}
      {pas && <Pas nivel={nivel} />}
      {pronto && nivel >= 3 && (
        <group>
          <Saco p={[-13, 0, 11]} r={0.3} />
          <Saco p={[-17, 0, 6]} r={-0.4} />
          <Saco p={[-14.5, 4.5, 8.5]} r={0.1} />
          {/* carrinho de mão */}
          <group position={[15, 0, 11]} rotation={[0, -0.5, 0]}>
            <Peca cor={MADEIRA} p={[0, 3.5, 0]} s={[7, 3, 5]} />
            <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[4.5, 1.8, 0]} s={[1.8, 0.8, 1.8]} r={[Math.PI / 2, 0, 0]} />
            {[-1.8, 1.8].map(z => <Peca key={z} cor={MADEIRA_ESCURA} p={[-5.5, 3.5, z]} s={[5, 0.6, 0.6]} sombra={false} />)}
          </group>
        </group>
      )}
      {pronto && nivel >= 5 && <><Lanterna p={[-6, 4.4, 14]} /><Lanterna p={[6, 4.4, 14]} /></>}
    </group>
  );
}
