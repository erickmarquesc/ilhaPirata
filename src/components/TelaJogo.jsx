import { useEffect, useRef } from 'react';
import { redimensionar, telaParaMundo } from '../game/camera.js';
import { desenharCena } from '../game/desenho/cena.js';
import { clicar, moverPonteiro, passo } from '../game/jogo.js';

// Canvas do jogo: roda o loop (atualizar + desenhar) e repassa os toques para a engine
export default function TelaJogo() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const aoRedimensionar = () => redimensionar(canvas);
    aoRedimensionar();
    window.addEventListener('resize', aoRedimensionar);

    let ultimo = performance.now();
    let quadro;
    const loop = agora => {
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;
      passo(dt);
      desenharCena(ctx, canvas);
      quadro = requestAnimationFrame(loop);
    };
    quadro = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', aoRedimensionar);
    };
  }, []);

  const pontoDoEvento = e => telaParaMundo(ref.current, e.clientX, e.clientY);

  return (
    <canvas
      ref={ref}
      className="block h-full w-full"
      onPointerDown={e => clicar(pontoDoEvento(e))}
      onPointerMove={e => moverPonteiro(pontoDoEvento(e))}
    />
  );
}
