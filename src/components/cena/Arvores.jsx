import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { crescimento } from '../../game/arvores.js';
import { mundo } from '../../game/mundo.js';
import { useMundo } from '../../hooks/useMundo.js';
import { aoTocarEntidade } from './clique.js';
import { sobMouse } from './Cursor.jsx';
import { alturaDoChao, idDe, paraCena } from './coords.js';
import { material } from './materiais.jsx';
import { ArvoreDaChuva, COR_COPA, COR_COPA_CHUVA, Pinheiro } from './modelos/Natureza.jsx';

const Arvore = memo(function Arvore({ t }) {
  const grupo = useRef();
  const copas = useRef([]);
  const giro = useMemo(() => (idDe(t) * 2.399) % (Math.PI * 2), [t]);
  const daChuva = t.tipo === 'chuva';
  const paleta = daChuva ? COR_COPA_CHUVA : COR_COPA;

  useFrame(({ clock }) => {
    const c = crescimento(t);
    const g = grupo.current;
    g.scale.setScalar((0.3 + 0.7 * c) * t.raio / 16);
    const serrando = mundo.agentes.some(a => a.acao && a.acao.tarefa.arvore === t);
    g.rotation.z = serrando ? Math.sin(clock.elapsedTime * 16) * 0.06 : 0;
    const alvo = mundo.jogador.tarefa && mundo.jogador.tarefa.arvore === t;
    const cores = c < 1 ? paleta.nova : alvo ? paleta.alvo : paleta.adulta;
    copas.current.forEach((m, i) => { if (m) m.material = material(cores[i % 2]); });
  });

  return (
    <group
      ref={grupo}
      position={paraCena(t.x, t.y, alturaDoChao(t.x, t.y))}
      rotation={[0, giro, 0]}
      onPointerDown={e => aoTocarEntidade(e, t.x, t.y)}
      onPointerOver={e => { e.stopPropagation(); sobMouse.arvore = t; }}
      onPointerOut={() => { if (sobMouse.arvore === t) sobMouse.arvore = null; }}
    >
      {daChuva ? <ArvoreDaChuva ref={copas} /> : <Pinheiro ref={copas} />}
    </group>
  );
});

export default function Arvores() {
  const { arvores } = useMundo();
  return arvores.map(t => <Arvore key={idDe(t)} t={t} />);
}
