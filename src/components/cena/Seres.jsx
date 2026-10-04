import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ILHA } from '../../game/config.js';
import { useMundo } from '../../hooks/useMundo.js';
import { aoTocarEntidade } from './clique.js';
import { ALTURA, alturaDoChao, idDe } from './coords.js';
import AnimalAnimado from './AnimalAnimado.jsx';
import { Pessoa } from './modelos/Seres.jsx';

// Atualiza posição e direção de um grupo a partir do objeto do mundo, a cada quadro
function useSegue(obj, opcoes = {}) {
  const ref = useRef();
  const anterior = useRef({ x: obj.x, y: obj.y });
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    let { x, y } = obj, h;
    if (obj.embarcado) {
      // em pé no convés da jangada
      const est = obj.embarcado, i = est.tripulacao.indexOf(obj);
      x = est.x - 12 + i * 22; y = est.y + 2;
      h = ALTURA.agua + 5 + Math.sin(clock.elapsedTime * 2) * 1.5;
    } else {
      h = alturaDoChao(x, y);
    }
    const dx = x - anterior.current.x, dy = y - anterior.current.y;
    const andando = Math.hypot(dx, dy) > 0.05;
    if (opcoes.virar) opcoes.virar(g, dx, dy, andando);
    // pulinho ao andar
    const pulo = andando && opcoes.pular ? Math.abs(Math.sin(clock.elapsedTime * 14)) * opcoes.pular : 0;
    g.position.set(x - ILHA.x, h + pulo, y - ILHA.y);
    g.visible = !obj.dentro; // dentro da cabana não aparece
    anterior.current = { x, y };
  });
  return ref;
}

function virarPessoa(g, dx, dy, andando) {
  if (!andando) return;
  const alvo = Math.atan2(dx, dy);
  const dif = Math.atan2(Math.sin(alvo - g.rotation.y), Math.cos(alvo - g.rotation.y));
  g.rotation.y += dif * 0.25;
}

function PessoaNaCena({ a, eJogador }) {
  const ref = useSegue(a, { virar: virarPessoa, pular: 1.5 });
  return (
    <group ref={ref} onPointerDown={eJogador ? undefined : e => { if (!a.dentro) aoTocarEntidade(e, a.x, a.y); }}>
      <group scale={a.raio / 10}>
        <Pessoa a={a} />
      </group>
    </group>
  );
}

export function Pessoas() {
  const { agentes, jogador } = useMundo();
  return agentes.map(a => <PessoaNaCena key={idDe(a)} a={a} eJogador={a === jogador} />);
}

export function Animais() {
  const { animais } = useMundo();
  return animais.map(an => <AnimalAnimado key={idDe(an)} an={an} />);
}
