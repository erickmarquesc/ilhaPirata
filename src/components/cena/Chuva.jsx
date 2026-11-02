import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';

// ===================== Chuva =====================
// Pingos como riscos caindo numa caixa em volta de onde a câmera olha (ver chuva.js).
// Um LineSegments só, atualizado a cada quadro; entra e sai suave com a intensidade.
const PINGOS = 1500;
const LARGURA = 1200,
  ALTURA = 500,
  QUEDA = 520,
  COMPRIMENTO = 14;
const VENTO = 0.18; // inclinação dos pingos

// Intensidade suave da chuva (0 → 1), compartilhada com a luz da câmera
export const clima = { chuva: 0 };

export default function Chuva() {
  const linhas = useRef();
  const { geo, mat, pingos } = useMemo(() => {
    const pingos = Array.from({ length: PINGOS }, () => ({
      x: (Math.random() - 0.5) * LARGURA,
      z: (Math.random() - 0.5) * LARGURA,
      y: Math.random() * ALTURA,
      v: QUEDA * (0.8 + Math.random() * 0.4),
    }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PINGOS * 6), 3));
    const mat = new THREE.LineBasicMaterial({ color: '#d8e8f5', transparent: true, opacity: 0, depthWrite: false });
    return { geo, mat, pingos };
  }, []);

  useFrame((_, dt) => {
    const alvo = mundo.chuva > 0 ? 1 : 0;
    clima.chuva += (alvo - clima.chuva) * (1 - Math.exp(-dt * 0.8));
    const visivel = clima.chuva > 0.01;
    linhas.current.visible = visivel;
    if (!visivel) return;
    mat.opacity = clima.chuva * 0.55;

    const foco = mundo.visao ?? mundo.jogador;
    const cx = foco.x - ILHA.x,
      cz = foco.y - ILHA.y;
    const pos = geo.attributes.position.array;
    pingos.forEach((p, i) => {
      p.y -= p.v * dt;
      p.x += p.v * VENTO * dt;
      if (p.y < 0) {
        p.y += ALTURA;
        p.x = (Math.random() - 0.5) * LARGURA;
        p.z = (Math.random() - 0.5) * LARGURA;
      }
      if (p.x > LARGURA / 2) p.x -= LARGURA; // o vento leva para fora: volta do outro lado
      // a caixa acompanha o foco
      const x = cx + p.x,
        z = cz + p.z;
      const k = i * 6;
      pos[k] = x;
      pos[k + 1] = p.y;
      pos[k + 2] = z;
      pos[k + 3] = x - COMPRIMENTO * VENTO;
      pos[k + 4] = p.y + COMPRIMENTO;
      pos[k + 5] = z;
    });
    geo.attributes.position.needsUpdate = true;
  });

  return <lineSegments ref={linhas} geometry={geo} material={mat} frustumCulled={false} />;
}
