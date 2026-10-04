import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFantasma } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Totem da Vida =====================
// Totem entalhado em madeira com pintura ritual: urso, águia, rosto sereno e,
// no topo, o pássaro-trovão de asas abertas. Um orbe dourado flutua acima (os deuses).
// A obra sobe em etapas: base → rostos → topo → orbe.

const MADEIRA = '#8b5a2b', MADEIRA_CLARA = '#a06a35', MADEIRA_ESCURA = '#5a3a1c', ENTALHE = '#2a1a10';
const VERMELHO = '#b5442e', TURQUESA = '#2f8f8a', AMARELO = '#e6b84a', OSSO = '#efe6cf';

const geoAnel = new THREE.TorusGeometry(9, 0.6, 6, 32);

// Materiais que brilham (fogo, orbe). Na prévia de construção ficam translúcidos.
function useBrilho(cor, intensidade) {
  const fantasma = useFantasma();
  return useMemo(() => new THREE.MeshStandardMaterial({
    color: cor, emissive: cor, emissiveIntensity: intensidade, flatShading: true,
    transparent: fantasma, opacity: fantasma ? 0.45 : 1, depthWrite: !fantasma,
  }), [cor, intensidade, fantasma]);
}

// Peça presa num ponto e girada (bicos, penas): o filho fica deslocado ao longo do eixo Y local
function Apontada({ p, r, comprimento, children }) {
  return (
    <group position={p} rotation={r}>
      <group position={[0, comprimento / 2, 0]}>{children}</group>
    </group>
  );
}

function Base() {
  return (
    <>
      <Peca geo="octogono" cor={MADEIRA_ESCURA} p={[0, 1.2, 0]} s={[22, 2.4, 22]} />
      <Peca geo="octogono" cor="#7a4a24" p={[0, 3.6, 0]} s={[16, 2.4, 16]} />
      {/* faixa pintada no degrau */}
      <Peca geo="octogono" cor={VERMELHO} p={[0, 1.2, 0]} s={[22.4, 0.9, 22.4]} sombra={false} />
    </>
  );
}

function Tocha({ x, z }) {
  const chama = useRef();
  const fogo = useBrilho('#ffb347', 1.6);
  const fase = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 9 + fase;
    chama.current.scale.set(2.2 + Math.sin(t) * 0.3, 3.4 + Math.sin(t * 1.7) * 0.6, 2.2 + Math.cos(t) * 0.3);
  });
  return (
    <group position={[x, 0, z]}>
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, 8, 0]} s={[1.1, 16, 1.1]} />
      <Peca geo="cone" cor="#4a3426" p={[0, 17, 0]} s={[2.6, 3, 2.6]} r={[Math.PI, 0, 0]} />
      <mesh ref={chama} geometry={geoChama} material={fogo} position={[0, 20, 0]} />
    </group>
  );
}
const geoChama = new THREE.ConeGeometry(1, 1, 5);

// Rosto de baixo: urso com dentes
function Urso() {
  return (
    <group>
      <Peca geo="octogono" cor={MADEIRA} p={[0, 16, 0]} s={[11, 20, 11]} />
      <Peca cor={MADEIRA_ESCURA} p={[0, 22.5, 10.4]} s={[16, 2.5, 2]} />
      {[-4.5, 4.5].map(x => (
        <group key={x}>
          <Peca cor={TURQUESA} p={[x, 19, 10.4]} s={[5, 4, 1]} sombra={false} />
          <Peca cor={ENTALHE} p={[x, 19, 10.9]} s={[2, 2, 1]} sombra={false} />
          <Peca cor={MADEIRA_CLARA} p={[x * 2.1, 25.5, 0]} s={[4, 5, 4]} />
        </group>
      ))}
      <Peca cor="#6b4423" p={[0, 15.5, 11]} s={[4, 4, 4]} />
      <Peca cor={ENTALHE} p={[0, 10.5, 10.4]} s={[12, 3.4, 1]} sombra={false} />
      {[-4.2, -1.4, 1.4, 4.2].map(x => (
        <Peca key={x} cor={OSSO} p={[x, 11.6, 10.8]} s={[1.6, 1.6, 1]} sombra={false} />
      ))}
    </group>
  );
}

// Rosto do meio: águia de bico curvo
function Aguia() {
  return (
    <group>
      <Peca geo="octogono" cor={MADEIRA_CLARA} p={[0, 35, 0]} s={[10, 18, 10]} />
      {[-4, 4].map(x => (
        <group key={x}>
          <Peca geo="bola" cor={OSSO} p={[x, 38, 9.2]} s={2.4} sombra={false} />
          <Peca geo="bola" cor={ENTALHE} p={[x, 38, 11.2]} s={1.1} sombra={false} />
          <Peca cor={VERMELHO} p={[x, 41.2, 9.6]} s={[6, 1.2, 1]} r={[0, 0, x > 0 ? -0.3 : 0.3]} sombra={false} />
          <Peca cor="#7a4a24" p={[x * 2.6, 35, 0]} s={[3, 10, 6]} />
        </group>
      ))}
      <Apontada p={[0, 35, 9]} r={[Math.PI / 2 + 0.5, 0, 0]} comprimento={10}>
        <Peca geo="cone" cor={AMARELO} s={[3, 10, 3]} />
      </Apontada>
    </group>
  );
}

// Rosto de cima: sereno, olhos fechados e marcas pintadas
function Sereno() {
  return (
    <group>
      <Peca geo="octogono" cor={MADEIRA} p={[0, 52, 0]} s={[9.5, 16, 9.5]} />
      {[-3.5, 3.5].map(x => (
        <group key={x}>
          <Peca cor={ENTALHE} p={[x, 54, 9.1]} s={[5, 1, 1]} sombra={false} />
          <Peca cor={TURQUESA} p={[x * 1.75, 51, 9]} s={[2, 3.4, 1]} sombra={false} />
        </group>
      ))}
      <Peca cor={VERMELHO} p={[0, 48.5, 9.1]} s={[5, 1.2, 1]} sombra={false} />
    </group>
  );
}

// Faixas pintadas entre os rostos
function Faixas({ rostos }) {
  return [[26, VERMELHO, 11.6], [44, TURQUESA, 10.6], [60, AMARELO, 10.1]].slice(0, rostos).map(([y, cor, r]) => (
    <Peca key={y} geo="octogono" cor={cor} p={[0, y, 0]} s={[r, 1.6, r]} />
  ));
}

// Uma asa: penas em leque, pontas pintadas
function Asa({ lado, dourada }) {
  const penas = [32, 27, 22, 17];
  return (
    <group position={[lado * 7, 64, -1]} rotation={[0, 0, lado * 0.28]}>
      {penas.map((L, i) => (
        <group key={i} rotation={[0, 0, lado * -0.2 * i]}>
          <Peca cor={i % 2 ? MADEIRA_CLARA : MADEIRA} p={[lado * L / 2, -i * 2, -i * 0.6]} s={[L, 4.5, 2]} />
          <Peca cor={dourada ? AMARELO : i % 2 ? TURQUESA : VERMELHO} p={[lado * (L - 2.5), -i * 2, -i * 0.6 + 0.4]} s={[5, 4.7, 2.2]} sombra={false} />
        </group>
      ))}
    </group>
  );
}

// Topo: cabeça do pássaro-trovão
function PassaroTrovao({ nivel }) {
  return (
    <group>
      <Peca geo="octogono" cor={MADEIRA_CLARA} p={[0, 66, 0]} s={[8.5, 12, 8.5]} />
      {[-3.5, 3.5].map(x => (
        <group key={x}>
          <Peca cor={AMARELO} p={[x, 67.5, 8.1]} s={[4, 4, 1]} sombra={false} />
          <Peca cor={ENTALHE} p={[x, 67.5, 8.6]} s={[1.8, 1.8, 1]} sombra={false} />
        </group>
      ))}
      <Apontada p={[0, 64.5, 7.5]} r={[Math.PI / 2 + 0.75, 0, 0]} comprimento={13}>
        <Peca geo="cone" cor={AMARELO} s={[3.2, 13, 3.2]} />
      </Apontada>
      {[[-3, VERMELHO, 0.35], [0, TURQUESA, 0], [3, VERMELHO, -0.35]].map(([x, cor, rz]) => (
        <Apontada key={x} p={[x, 72, -1]} r={[-0.35, 0, rz]} comprimento={9}>
          <Peca geo="cone" cor={cor} s={[1.7, 9, 1.7]} />
        </Apontada>
      ))}
      {nivel >= 4 && [0, 1, 2, 3, 4, 5].map(i => {
        const a = i / 6 * Math.PI * 2;
        return <Peca key={i} geo="cone" cor={AMARELO} p={[Math.cos(a) * 7, 74.5, Math.sin(a) * 7]} s={[1.4, 4, 1.4]} />;
      })}
      <Asa lado={-1} dourada={nivel >= 2} />
      <Asa lado={1} dourada={nivel >= 2} />
    </group>
  );
}

// Orbe dos deuses flutuando acima do totem
function Orbe({ nivel }) {
  const grupo = useRef();
  const ouro = useBrilho('#ffd76a', 1.3);
  const anel = useBrilho('#ffe9a8', 0.9);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    grupo.current.position.y = 92 + Math.sin(t * 1.5) * 2;
    grupo.current.rotation.y = t * 0.8;
  });
  return (
    <group ref={grupo}>
      <mesh geometry={geoOrbe} material={ouro} scale={4.2} />
      <mesh geometry={geoAnel} material={anel} rotation={[Math.PI / 2.4, 0, 0]} />
      {nivel >= 3 && <mesh geometry={geoAnel} material={anel} rotation={[Math.PI / 2, 0.9, 0]} scale={1.3} />}
    </group>
  );
}
const geoOrbe = new THREE.IcosahedronGeometry(1, 1);

export function Totem({ progresso = 1, est = null }) {
  const nivel = est?.nivel ?? 1;
  // etapas da obra
  const rostos = progresso < 0.15 ? 0 : Math.min(Math.ceil((progresso - 0.15) / 0.7 * 3), 3);
  const topo = progresso >= 0.85;
  const pronto = progresso >= 1;
  return (
    <group>
      <Base />
      {rostos >= 1 && <Urso />}
      {rostos >= 2 && <Aguia />}
      {rostos >= 3 && <Sereno />}
      <Faixas rostos={rostos} />
      {topo && <PassaroTrovao nivel={nivel} />}
      {pronto && (
        <>
          <Tocha x={-17} z={13} />
          <Tocha x={17} z={13} />
          <Orbe nivel={nivel} />
        </>
      )}
    </group>
  );
}
