import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ILHA } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { estaNoMar } from '../../game/jangada.js';
import { useMundo } from '../../hooks/useMundo.js';
import { aoTocarEntidade } from './clique.js';
import { ALTURA, alturaDoChao, idDe, paraCena } from './coords.js';
import { MODELOS } from './modelos/Construcoes.jsx';
import * as THREE from 'three';

// Marola fina e translúcida em volta do barco
const geoMarola = new THREE.RingGeometry(0.93, 1, 40).rotateX(-Math.PI / 2);
const matMarola = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false });

// Construção pronta. A jangada se move (empurrada para a água, navegando) e balança no mar.
// memo: o modelo só é refeito quando o nível muda (o resto anima no useFrame).
const Estrutura = memo(function Estrutura({ s }) {
  const ref = useRef();
  const ondinha = useRef();
  const anterior = useRef({ x: s.x, y: s.y });
  const c = CONSTRUCOES[s.tipo];
  const Modelo = MODELOS[s.tipo];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const noMar = estaNoMar(s);
    const h = noMar ? ALTURA.agua + Math.sin(t * 2) * 1.2 : alturaDoChao(s.x, s.y);
    ref.current.position.set(s.x - ILHA.x, h, s.y - ILHA.y);
    if (s.tipo === 'jangada') {
      // o barco vira (suave) para o rumo em que navega; a tripulação usa s.rumoVisual
      const dx = s.x - anterior.current.x, dy = s.y - anterior.current.y;
      anterior.current = { x: s.x, y: s.y };
      if (s.rumoVisual === undefined) s.rumoVisual = 0;
      if (Math.hypot(dx, dy) > 0.05) {
        const alvo = -Math.atan2(dy, dx);
        s.rumoVisual += Math.atan2(Math.sin(alvo - s.rumoVisual), Math.cos(alvo - s.rumoVisual)) * 0.08;
      }
      ref.current.rotation.order = 'YXZ'; // gira no rumo e depois balança de lado
      ref.current.rotation.y = s.rumoVisual;
    }
    // balança no mar (de lado, em relação ao barco)
    ref.current.rotation.x = noMar ? Math.sin(t * 1.6) * 0.03 : 0;
    if (ondinha.current) {
      ondinha.current.visible = noMar;
      const r = 34 + (s.nivel - 1) * 9 + (t * 8) % 10;
      ondinha.current.scale.set(r, 1, r * 0.6);
      ondinha.current.rotation.y = s.rumoVisual ?? 0; // a marola acompanha o comprimento do barco
      ondinha.current.position.set(s.x - ILHA.x, 0.5, s.y - ILHA.y);
    }
  });
  return (
    <>
      <group ref={ref} onPointerDown={c.area ? undefined : e => aoTocarEntidade(e, s.x, s.y)}>
        <Modelo est={s} />
      </group>
      {s.tipo === 'jangada' && <mesh ref={ondinha} geometry={geoMarola} material={matMarola} />}
    </>
  );
});

// Obra do jogador em andamento: o modelo vai aparecendo conforme o progresso
function Obra() {
  const { jogador } = useMundo();
  const a = jogador.acao;
  if (!a || a.tarefa.tipo !== 'construir') return null;
  const t = a.tarefa;
  const Modelo = MODELOS[t.construcao];
  return (
    <group position={paraCena(t.x, t.y, alturaDoChao(t.x, t.y))}>
      <Modelo progresso={Math.min(a.tempo / a.duracao, 1)} />
    </group>
  );
}

export default function Estruturas() {
  const { estruturas } = useMundo();
  return (
    <>
      {estruturas.map(s => <Estrutura key={idDe(s)} s={s} nivel={s.nivel} />)}
      <Obra />
    </>
  );
}
