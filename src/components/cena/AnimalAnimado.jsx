import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { animalAdulto } from '../../game/animais.js';
import { ESPECIES, ILHA } from '../../game/config.js';
import { aoTocarEntidade } from './clique.js';
import { alturaDoChao, idDe } from './coords.js';
import { MODELOS_ANIMAL } from './modelos/Animais.jsx';

const angulo = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const suave = (atual, alvo, dt, rapidez) => atual + (alvo - atual) * Math.min(1, dt * rapidez);

// Animal com animação procedural:
// andando → passos (diagonais nos quadrúpedes, alternados na galinha), corpo balançando
//           e inclinando nas curvas; parado → pasta / bica o chão e olha em volta;
// sempre → respira, pisca e balança o rabo.
export default function AnimalAnimado({ an }) {
  const grupo = useRef();
  const rig = useRef({}).current;
  const bipede = an.especie === 'galinha';
  const filhote = !animalAdulto(an);
  const Modelo = MODELOS_ANIMAL[an.especie];
  const semente = useMemo(() => (idDe(an) * 1.618) % 10, [an]);
  const estado = useRef({ px: an.x, py: an.y, vel: 0, fase: 0, yaw: null, inclina: 0, base: {} });

  useFrame(({ clock }, dt) => {
    const g = grupo.current;
    if (!g || dt <= 0) return;
    const s = estado.current;
    const t = clock.elapsedTime + semente;

    // velocidade real (suavizada) a partir do deslocamento no quadro
    const v = Math.hypot(an.x - s.px, an.y - s.py) / dt;
    s.px = an.x; s.py = an.y;
    s.vel = suave(s.vel, v, dt, 8);
    const andando = Math.min(s.vel / (ESPECIES[an.especie].velocidade * 0.6), 1);
    s.fase += dt * (bipede ? 14 : 7) * Math.min(1, s.vel / 8);

    // direção: segue o rumo da engine, virando suave; inclina o corpo para dentro da curva
    const rumo = an.rumo ?? (an.dir > 0 ? 0 : Math.PI);
    const alvoYaw = -rumo;
    if (s.yaw === null) s.yaw = alvoYaw;
    const giro = angulo(alvoYaw, s.yaw);
    s.yaw += giro * Math.min(1, dt * 10);
    s.inclina = suave(s.inclina, giro * 0.6 * andando, dt, 6);

    const pulo = bipede ? Math.abs(Math.sin(s.fase)) * 0.06 : Math.abs(Math.sin(s.fase)) * 0.05;
    g.position.set(an.x - ILHA.x, alturaDoChao(an.x, an.y) + pulo * andando * an.raio, an.y - ILHA.y);
    g.rotation.y = s.yaw;
    g.scale.setScalar(an.raio);

    const { corpo, cabeca, cauda, pernas = [], asas = [], olhos = [] } = rig;
    // guarda a posição original da cabeça (de novo se o modelo trocar: filhote → adulto)
    if (cabeca && s.base.obj !== cabeca) s.base = { obj: cabeca, cabeca: cabeca.position.clone() };

    // pernas
    pernas.forEach((p, i) => {
      if (!p) return;
      const defasagem = bipede ? i * Math.PI : (i === 0 || i === 3 ? 0 : Math.PI); // diagonais juntas
      p.rotation.z = Math.sin(s.fase + defasagem) * (bipede ? 0.7 : 0.55) * andando;
    });

    // corpo: respira, balança no passo, inclina na curva (a galinha ginga de lado)
    if (corpo) {
      corpo.scale.y = 1 + Math.sin(t * 2.2) * 0.025;
      corpo.rotation.x = (bipede ? Math.sin(s.fase) * 0.16 : Math.sin(s.fase * 2) * 0.03) * andando + s.inclina * 0.3;
      corpo.rotation.z = Math.sin(s.fase * 2) * 0.03 * andando;
    }

    // cabeça
    if (cabeca) {
      const b = s.base.cabeca;
      const parado = 1 - andando;
      if (bipede) {
        // bica o chão de vez em quando; andando, a cabeça vai e volta
        const bicando = Math.sin(t * 0.8) > 0.45 ? Math.abs(Math.sin(t * 13)) : 0;
        cabeca.rotation.z = -1.0 * bicando * parado;
        cabeca.position.x = b.x + Math.sin(s.fase * 2) * 0.07 * andando;
        cabeca.rotation.y = Math.sin(t * 0.9) * 0.5 * parado * (1 - bicando);
      } else {
        // pasta (baixa a cabeça) e olha em volta quando parado; acena no passo
        const pastando = Math.min(Math.max((Math.sin(t * 0.35) - 0.4) * 3, 0), 1) * parado;
        cabeca.rotation.z = suave(cabeca.rotation.z, -0.95 * pastando + Math.sin(s.fase * 2) * 0.06 * andando, dt, 4);
        cabeca.position.y = b.y - pastando * 0.25;
        cabeca.rotation.y = Math.sin(t * 0.5) * 0.4 * parado * (1 - pastando);
      }
    }

    // rabo
    if (cauda) {
      if (an.especie === 'vaca') cauda.rotation.x = Math.sin(t * 1.6) * 0.35;
      else cauda.rotation.y = Math.sin(t * (an.especie === 'ovelha' ? 6 : 3)) * 0.35;
    }

    // asas batem quando a galinha anda rápido
    asas.forEach((a, i) => { if (a) a.rotation.x = (i ? -1 : 1) * (0.15 + Math.abs(Math.sin(t * 18)) * 0.5) * andando * andando; });

    // piscar
    const piscando = (t * 0.27) % 1 < 0.035;
    olhos.forEach(o => { if (o) o.scale.y = piscando ? 0.12 : 1; });
  });

  return (
    <group ref={grupo} onPointerDown={e => aoTocarEntidade(e, an.x, an.y)}>
      <Modelo key={filhote ? 'filhote' : 'adulto'} an={an} rig={rig} filhote={filhote} />
    </group>
  );
}
