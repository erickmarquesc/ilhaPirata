import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { passo } from '../../game/jogo.js';
import Arvores from './Arvores.jsx';
import Camera from './Camera.jsx';
import Estruturas from './Estruturas.jsx';
import Montes from './Montes.jsx';
import { Cardumes, Efeitos } from './Mar.jsx';
import Previas from './Previas.jsx';
import Rotulos from './Rotulos.jsx';
import { Animais, Pessoas } from './Seres.jsx';
import Terreno from './Terreno.jsx';

// Avança o jogo a cada quadro (antes de qualquer outra coisa ler o mundo)
function Loop() {
  useFrame((_, dt) => passo(Math.min(dt, 0.05)));
  return null;
}

// Cena 3D do jogo + camada 2D de rótulos por cima
export default function Cena() {
  const rotulos = useRef(null);
  return (
    <div className="fixed inset-0">
      <Canvas shadows flat dpr={[1, 1.5]} camera={{ fov: 35, near: 5, far: 6000 }}>
        <Loop />
        <color attach="background" args={['#2a7fc4']} />
        <fog attach="fog" args={['#2a7fc4', 1400, 3200]} />
        <Camera />
        <Terreno />
        <Cardumes />
        <Arvores />
        <Montes />
        <Estruturas />
        <Pessoas />
        <Animais />
        <Efeitos />
        <Previas />
        <Rotulos canvasRef={rotulos} />
      </Canvas>
      <canvas ref={rotulos} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
