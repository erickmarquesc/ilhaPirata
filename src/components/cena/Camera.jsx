import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';
import { gestos } from './gestos.js';

const INCLINACAO = THREE.MathUtils.degToRad(52); // ângulo da câmera em relação ao chão
const ZOOM_MIN = 160, ZOOM_MAX = 1500, ZOOM_INICIAL = 620;

// Câmera que acompanha o jogador, com zoom na roda do mouse ou pinça.
// A luz do sol acompanha junto, para as sombras valerem perto de onde se está olhando.
export default function Camera() {
  const { camera, gl } = useThree();
  const distancia = useRef(ZOOM_INICIAL);
  const alvo = useRef(null);
  const sol = useRef(), alvoDoSol = useRef();

  // ----- Zoom: roda do mouse e pinça com dois dedos -----
  useEffect(() => {
    const el = gl.domElement;
    const zoom = fator => {
      distancia.current = THREE.MathUtils.clamp(distancia.current * fator, ZOOM_MIN, ZOOM_MAX);
    };
    const aoRolar = e => { e.preventDefault(); zoom(Math.exp(e.deltaY * 0.001)); };
    const toques = new Map();
    let distAnterior = 0;
    const separacao = () => { const [a, b] = [...toques.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    const aoTocar = e => {
      toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (toques.size === 2) { gestos.pincando = true; distAnterior = separacao(); }
    };
    const aoMover = e => {
      if (!toques.has(e.pointerId)) return;
      toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (toques.size === 2) {
        const d = separacao();
        if (distAnterior > 0) zoom(distAnterior / d);
        distAnterior = d;
      }
    };
    const aoSoltar = e => {
      toques.delete(e.pointerId);
      if (toques.size === 0) gestos.pincando = false;
    };
    el.addEventListener('wheel', aoRolar, { passive: false });
    el.addEventListener('pointerdown', aoTocar);
    el.addEventListener('pointermove', aoMover);
    el.addEventListener('pointerup', aoSoltar);
    el.addEventListener('pointercancel', aoSoltar);
    return () => {
      el.removeEventListener('wheel', aoRolar);
      el.removeEventListener('pointerdown', aoTocar);
      el.removeEventListener('pointermove', aoMover);
      el.removeEventListener('pointerup', aoSoltar);
      el.removeEventListener('pointercancel', aoSoltar);
    };
  }, [gl]);

  useEffect(() => { sol.current.target = alvoDoSol.current; }, []);

  useFrame((_, dt) => {
    const { jogador } = mundo;
    const destino = new THREE.Vector3(jogador.x - ILHA.x, 0, jogador.y - ILHA.y);
    if (!alvo.current) alvo.current = destino.clone();
    alvo.current.lerp(destino, 1 - Math.exp(-dt * 4)); // segue suavemente
    const d = distancia.current, a = alvo.current;
    camera.position.set(a.x, a.y + d * Math.sin(INCLINACAO), a.z + d * Math.cos(INCLINACAO));
    camera.lookAt(a);

    // sol e área de sombra acompanham a câmera
    sol.current.position.set(a.x + 260, 480, a.z + 160);
    alvoDoSol.current.position.copy(a);
    const cam = sol.current.shadow.camera, alcance = Math.max(250, d * 0.9);
    if (cam.right !== alcance) {
      cam.left = -alcance; cam.right = alcance; cam.top = alcance; cam.bottom = -alcance;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <>
      <hemisphereLight args={['#eaf6ff', '#6a8f4a', 1.1]} />
      <directionalLight
        ref={sol}
        color="#fff1d6"
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={1500}
        shadow-bias={-0.0004}
        shadow-normalBias={0.6}
      />
      <object3D ref={alvoDoSol} />
    </>
  );
}
