import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ILHA } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { estaNoMar } from '../../game/jangada.js';
import { useMundo } from '../../hooks/useMundo.js';
import { aoTocarEntidade } from './clique.js';
import { ALTURA, alturaDoChao, idDe, paraCena } from './coords.js';
import { MODELOS } from './modelos/Construcoes.jsx';
import Peca from './Peca.jsx';

// Construção pronta. A jangada se move (empurrada para a água, navegando) e balança no mar.
// memo: o modelo só é refeito quando o nível muda (o resto anima no useFrame).
const Estrutura = memo(function Estrutura({ s }) {
  const ref = useRef();
  const ondinha = useRef();
  const c = CONSTRUCOES[s.tipo];
  const Modelo = MODELOS[s.tipo];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const noMar = estaNoMar(s);
    const h = noMar ? ALTURA.agua + Math.sin(t * 2) * 1.2 : alturaDoChao(s.x, s.y);
    ref.current.position.set(s.x - ILHA.x, h, s.y - ILHA.y);
    ref.current.rotation.z = noMar ? Math.sin(t * 1.6) * 0.03 : 0;
    if (ondinha.current) {
      ondinha.current.visible = noMar;
      const r = 34 + (t * 8) % 10;
      ondinha.current.scale.set(r, 1, r * 0.6);
      ondinha.current.position.set(s.x - ILHA.x, 0.5, s.y - ILHA.y);
    }
  });
  return (
    <>
      <group ref={ref} onPointerDown={c.area ? undefined : e => aoTocarEntidade(e, s.x, s.y)}>
        <Modelo est={s} />
      </group>
      {s.tipo === 'jangada' && <Peca ref={ondinha} geo="anel" cor="#ffffff" sombra={false} />}
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
