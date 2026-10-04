import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBrilho, useMaterial } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Cabana do náufrago =====================
// Casinha torta de tábuas sobre um deck, telhado de duas águas irregular,
// porta torta, chaminé de cano e varandinha com poste de galho.
// Nível 1 é precária (tábuas faltando, janela tapada, telhado remendado com folhas).
// 2: acabamento, lanterna e chaminé de tijolos com fumaça · 3: pilares de pedra e bandeira ·
// 4: baú do tesouro · 5: mastro de vigia com cesto de gávea e luneta (bandeira no topo).
// Obra em etapas: deck → paredes → telhado → detalhes.

const TABUAS = ['#8b6a45', '#7a5a3a', '#9a7650', '#6e5236', '#a07a52'];
const TELHAS = ['#8a6a48', '#9c7a52', '#7a5a3a', '#a5845c'];
const ESCURO = '#2a1d14', CLARO = '#e0d6bf', VIDRO = '#3a4a52';

// Medidas (origem no centro do deck)
const PISO = 6.25;                     // topo do deck
const CASA = { x: 22, zFundo: -21, zFrente: 9 };
const PAREDE = 28, TOPO = PISO + PAREDE; // topo das paredes
const BEIRAL = 26, CUMEEIRA = 18;      // meio vão do telhado e altura até a cumeeira
const INCLINACAO = Math.atan2(CUMEEIRA, BEIRAL);
const ABA = Math.hypot(BEIRAL, CUMEEIRA);
const ALTURA_FRONTAO = CUMEEIRA * CASA.x / BEIRAL;

// número "aleatório" fixo, para as tábuas tortas serem sempre iguais
const r = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

// Frontão (triângulo de tábuas) da frente e do fundo
const geoFrontao = new THREE.ExtrudeGeometry(
  new THREE.Shape([new THREE.Vector2(-CASA.x, 0), new THREE.Vector2(CASA.x, 0), new THREE.Vector2(0, ALTURA_FRONTAO)]),
  { depth: 1.2, bevelEnabled: false },
);

// Estacas de madeira; a partir do nível 3, pilares de pedra
function Deck({ tabuas, pedra }) {
  return (
    <group>
      {[[-29, -23], [29, -23], [-29, 23], [29, 23], [0, 23], [0, -23]].map(([x, z], i) => (
        pedra
          ? <Peca key={i} geo="rocha" cor={i % 2 ? '#9aa0a6' : '#b3b9be'} p={[x, 2.2, z]} s={[3.4, 2.6, 3.4]} r={[0, i, 0]} />
          : <Peca key={i} geo="cilindro" cor="#5a3a1c" p={[x, 2, z]} s={[1.6, 4, 1.6]} />
      ))}
      {Array.from({ length: tabuas }, (_, i) => (
        <Peca key={i} cor={i % 2 ? '#9c7a52' : '#8a6a44'} p={[0, 5, -25 + (i + 0.5) * (50 / 6)]} s={[62, 2.5, 50 / 6 - 0.6]} />
      ))}
    </group>
  );
}

// Paredes de tábuas verticais. Na cabana precária algumas faltam e outras ficam curtas.
function Paredes({ visiveis, precaria }) {
  const tabuas = [];
  // frente (10 tábuas) e laterais (7 de cada lado)
  for (let i = 0; i < 10; i++) tabuas.push({ lado: 'frente', i });
  for (let i = 0; i < 7; i++) tabuas.push({ lado: 'esq', i }, { lado: 'dir', i });
  const faltando = precaria ? new Set(['frente-1', 'frente-8', 'esq-4', 'dir-2']) : new Set();
  return (
    <group>
      {visiveis >= tabuas.length / 2 && (
        <>
          <Peca cor={ESCURO} p={[0, PISO + PAREDE / 2 - 0.5, (CASA.zFundo + CASA.zFrente) / 2]} s={[CASA.x * 2 - 3, PAREDE - 1, 27]} sombra={false} />
          <Peca cor="#7a5a3a" p={[0, PISO + PAREDE / 2, CASA.zFundo]} s={[CASA.x * 2, PAREDE, 1.4]} />
        </>
      )}
      {tabuas.slice(0, visiveis).map(({ lado, i }, n) => {
        if (faltando.has(`${lado}-${i}`)) return null;
        const curta = precaria ? r(n + 3) * 4 : r(n + 3) * 1.2;
        const h = PAREDE - curta;
        const cor = TABUAS[Math.floor(r(n + 7) * TABUAS.length)];
        const torta = (r(n + 11) - 0.5) * (precaria ? 0.06 : 0.02);
        if (lado === 'frente') {
          const x = -CASA.x + 2.2 + i * 4.4;
          return <Peca key={n} cor={cor} p={[x, PISO + h / 2, CASA.zFrente]} s={[4.2, h, 1.4]} r={[0, 0, torta]} />;
        }
        const x = lado === 'esq' ? -CASA.x : CASA.x;
        const z = CASA.zFundo + 2.15 + i * 4.3;
        return <Peca key={n} cor={cor} p={[x, PISO + h / 2, z]} s={[1.4, h, 4.1]} r={[torta, 0, 0]} />;
      })}
      {/* quinas */}
      {visiveis > 0 && [-CASA.x, CASA.x].map(x => (
        <Peca key={x} cor="#5a3a1c" p={[x, PISO + PAREDE / 2, CASA.zFrente]} s={[2.2, PAREDE, 2.2]} />
      ))}
    </group>
  );
}

// Uma água do telhado: fileiras de telhas de madeira sobrepostas, meio tortas
function Agua({ lado, fileiras, precaria }) {
  const dir = lado === 'esq' ? 1 : -1; // sobe em direção ao centro
  const prof = 35, zMeio = (CASA.zFundo + CASA.zFrente) / 2 - 0.5;
  return Array.from({ length: fileiras }, (_, i) => {
    const s = ABA * (i + 0.5) / 4;
    const x = -dir * BEIRAL + dir * Math.cos(INCLINACAO) * s;
    const y = TOPO + Math.sin(INCLINACAO) * s + 0.8 + (3 - i) * 0.25;
    const n = i + (lado === 'esq' ? 0 : 10);
    const ondula = (r(n + 21) - 0.5) * (precaria ? 0.12 : 0.05);
    return (
      <Peca
        key={i}
        cor={TELHAS[Math.floor(r(n + 31) * TELHAS.length)]}
        p={[x, y, zMeio + (r(n + 41) - 0.5) * 2]}
        s={[ABA / 4 + 2, 1.6, prof + (r(n + 51) - 0.5) * 3]}
        r={[ondula, 0, dir * INCLINACAO + ondula]}
      />
    );
  });
}

function Telhado({ fileiras, precaria }) {
  const mat = useMaterial();
  return (
    <group>
      <mesh geometry={geoFrontao} material={mat('#8b6a45')} position={[0, TOPO, CASA.zFrente - 0.6]} castShadow />
      <mesh geometry={geoFrontao} material={mat('#7a5a3a')} position={[0, TOPO, CASA.zFundo - 0.6]} castShadow />
      <Agua lado="esq" fileiras={fileiras} precaria={precaria} />
      <Agua lado="dir" fileiras={fileiras} precaria={precaria} />
      {fileiras >= 4 && <Peca cor="#6b4a2e" p={[0, TOPO + CUMEEIRA + 1.2, -6.5]} s={[3, 2.4, 36]} r={[0.02, 0, precaria ? 0.05 : 0]} />}
      {fileiras >= 4 && precaria && (
        // remendos de folha de palmeira
        <>
          <Peca geo="bola" cor="#6f9a3a" p={[-10, TOPO + 12.5, 2]} s={[8, 1.6, 6]} r={[0, 0.4, INCLINACAO]} />
          <Peca geo="bola" cor="#5e8a32" p={[13, TOPO + 9.5, -12]} s={[7, 1.5, 5]} r={[0, -0.3, -INCLINACAO]} />
        </>
      )}
    </group>
  );
}

function Porta({ precaria }) {
  const z = CASA.zFrente + 0.9;
  return (
    <group position={[5, PISO, z]} rotation={[0, 0, 0.05]}>
      {!precaria && <Peca cor={CLARO} p={[0, 10.2, -0.3]} s={[13, 21, 0.6]} />}
      <Peca cor={precaria ? '#7a5a3a' : '#c8643a'} p={[0, 9.5, 0]} s={[10.5, 19, 1]} />
      {precaria ? (
        [-2.6, 2.6].map(x => <Peca key={x} cor="#5a4028" p={[x, 9.5, 0.6]} s={[0.6, 18, 0.4]} sombra={false} />)
      ) : (
        <>
          <Peca cor={CLARO} p={[0, 14.5, 0.6]} s={[4.4, 4.4, 0.4]} sombra={false} />
          <Peca cor={VIDRO} p={[0, 14.5, 0.8]} s={[3.2, 3.2, 0.4]} sombra={false} />
        </>
      )}
      <Peca geo="bola" cor="#2a2a2a" p={[3.5, 9, 0.8]} s={0.8} sombra={false} />
    </group>
  );
}

function Janela({ precaria }) {
  const p = [-11, 20, CASA.zFrente + 0.9];
  if (precaria) {
    return (
      <group position={p}>
        <Peca cor={ESCURO} s={[8, 7, 0.6]} sombra={false} />
        <Peca cor="#9c7a52" p={[0, 0, 0.5]} s={[11, 1.6, 0.8]} r={[0, 0, 0.6]} />
        <Peca cor="#8a6a44" p={[0, 0, 0.7]} s={[11, 1.6, 0.8]} r={[0, 0, -0.6]} />
      </group>
    );
  }
  return (
    <group position={p} rotation={[0, 0, -0.04]}>
      <Peca cor={CLARO} s={[9.5, 8.5, 0.8]} />
      <Peca cor={VIDRO} p={[0, 0, 0.3]} s={[7, 6, 0.6]} sombra={false} />
      <Peca cor={CLARO} p={[0, 0, 0.6]} s={[0.7, 6, 0.4]} sombra={false} />
      <Peca cor={CLARO} p={[0, 0, 0.6]} s={[7, 0.7, 0.4]} sombra={false} />
    </group>
  );
}

// Janelinha em losango no frontão
function JanelaLosango() {
  return (
    <group position={[0, TOPO + 7, CASA.zFrente + 0.9]} rotation={[0, 0, Math.PI / 4 + 0.08]}>
      <Peca cor={CLARO} s={[6, 6, 0.8]} />
      <Peca cor={VIDRO} p={[0, 0, 0.3]} s={[4.2, 4.2, 0.6]} sombra={false} />
    </group>
  );
}

const BASE_CHAMINE = [12, TOPO + CUMEEIRA * (1 - 12 / BEIRAL) - 1, -10];

// Nível 1: cano de metal torto. Nível 2+: chaminé de tijolos soltando fumaça.
function Chamine({ tijolo }) {
  if (!tijolo) {
    return (
      <group position={BASE_CHAMINE} rotation={[0, 0, -0.1]}>
        <Peca geo="cilindro" cor="#555a5e" p={[0, 8, 0]} s={[2, 16, 2]} />
        <Peca geo="cilindro" cor="#3e4245" p={[0, 13, 0]} s={[2.3, 1, 2.3]} />
        <Peca geo="cone" cor="#3e4245" p={[0, 17.5, 0]} s={[3.6, 3, 3.6]} />
      </group>
    );
  }
  return (
    <group position={BASE_CHAMINE}>
      {Array.from({ length: 6 }, (_, i) => (
        <Peca key={i} cor={i % 2 ? '#a8452e' : '#b85538'} p={[0, 1.5 + i * 2.6, 0]} s={[7, 2.4, 7]} r={[0, i % 2 ? 0.04 : -0.04, 0]} />
      ))}
      <Peca cor="#7a3020" p={[0, 17, 0]} s={[8.2, 1.6, 8.2]} />
      <Fumaca />
    </group>
  );
}

// Fumacinha subindo e sumindo
function Fumaca() {
  const bolas = useRef([]);
  useFrame(({ clock }) => {
    bolas.current.forEach((b, i) => {
      if (!b) return;
      const f = (clock.elapsedTime * 0.35 + i / 3) % 1;
      b.position.set(Math.sin(f * 4 + i) * 2, 19 + f * 22, -f * 3);
      b.scale.setScalar(1.6 + f * 3.4);
      b.material.opacity = 0.55 * (1 - f);
    });
  });
  return [0, 1, 2].map(i => (
    <mesh key={i} ref={el => { bolas.current[i] = el; }} geometry={geoFumaca}>
      <meshStandardMaterial color="#d8d8d8" transparent depthWrite={false} flatShading />
    </mesh>
  ));
}
const geoFumaca = new THREE.IcosahedronGeometry(1, 0);

// Varandinha: cobertura sobre a porta apoiada num galho torto, degraus e barril
function Varanda() {
  return (
    <group>
      {/* pequena cobertura logo acima da porta */}
      <Peca cor="#7a5a3a" p={[5, PISO + 23.5, 12.2]} s={[16, 1.2, 5.5]} r={[0.45, 0, 0.06]} />
      <Peca geo="cilindro" cor="#6b4a2e" p={[12.6, PISO + 6, 14.6]} s={[1.1, 12, 1.1]} r={[0, 0, 0.1]} />
      <Peca geo="cilindro" cor="#6b4a2e" p={[12.2, PISO + 17, 14.3]} s={[1, 11, 1]} r={[0.1, 0, -0.14]} />
      <Peca cor="#8a6a44" p={[5, 3, 27.5]} s={[14, 2, 5]} />
      <Peca cor="#7a5a3a" p={[5, 1, 31]} s={[14, 2, 4]} />
      <group position={[-22, PISO, 18]}>
        <Peca geo="cilindro" cor="#8a5a30" p={[0, 4.5, 0]} s={[4.2, 9, 4.2]} />
        {[2, 7].map(y => <Peca key={y} geo="cilindro" cor="#3a2a1a" p={[0, y, 0]} s={[4.45, 0.8, 4.45]} sombra={false} />)}
      </group>
    </group>
  );
}

function Lanterna() {
  const luz = useBrilho('#ffcf6a', 1.5);
  return (
    <group position={[-3, PISO + 19, CASA.zFrente + 2]}>
      <Peca cor="#2a2a2a" p={[0, 4, -1]} s={[0.6, 3, 2.5]} sombra={false} />
      <Peca cor="#2a2a2a" s={[3.6, 0.6, 3.6]} p={[0, 2.6, 0]} sombra={false} />
      <mesh geometry={geoLuz} material={luz} scale={[1.4, 2, 1.4]} />
      <Peca cor="#2a2a2a" s={[3.6, 0.6, 3.6]} p={[0, -2.2, 0]} sombra={false} />
    </group>
  );
}
const geoLuz = new THREE.IcosahedronGeometry(1, 0);

// Bandeira pirata no alto do telhado
function Bandeira() {
  const y = TOPO + CUMEEIRA + 2;
  return (
    <group position={[0, y, CASA.zFrente - 1]}>
      <Peca geo="cilindro" cor="#4a3426" p={[0, 11, 0]} s={[0.6, 22, 0.6]} />
      <Pano />
    </group>
  );
}
// Pano preto com caveira e ossos cruzados
function Pano({ p = [6.6, 18, 0] }) {
  return (
    <group position={p} rotation={[0, -0.25, 0]}>
      <Peca cor="#1a1a1a" s={[12, 8, 0.4]} />
      <Peca geo="bola" cor="#f2f2f2" p={[0, 0.8, 0.4]} s={1.6} sombra={false} />
      <Peca cor="#f2f2f2" p={[0, -1.6, 0.4]} s={[5, 0.7, 0.3]} r={[0, 0, 0.6]} sombra={false} />
      <Peca cor="#f2f2f2" p={[0, -1.6, 0.4]} s={[5, 0.7, 0.3]} r={[0, 0, -0.6]} sombra={false} />
    </group>
  );
}

// Nível 5: mastro de vigia atrás da casa, com cesto de gávea, luneta e a bandeira no topo
function MastroDeVigia() {
  const alto = 78;
  return (
    <group position={[-17, PISO, -17]}>
      <Peca geo="cilindro" cor="#5a3a1c" p={[0, alto / 2, 0]} s={[1.6, alto, 1.6]} />
      {/* escadinha de corda */}
      {Array.from({ length: 9 }, (_, i) => (
        <Peca key={i} cor="#d9c38a" p={[0, 8 + i * 6.5, 2]} s={[4, 0.5, 0.5]} sombra={false} />
      ))}
      {/* cesto de gávea */}
      <group position={[0, alto - 8, 0]}>
        <Peca geo="cilindro" cor="#8a5a30" p={[0, 0, 0]} s={[6, 6, 6]} />
        {[-1.5, 1.5].map(y => <Peca key={y} geo="cilindro" cor="#3a2a1a" p={[0, y, 0]} s={[6.2, 0.6, 6.2]} sombra={false} />)}
        <Peca geo="cilindro" cor="#c9a24a" p={[5, 4, 2]} s={[0.7, 6, 0.7]} r={[0, 0, -1.1]} />
      </group>
      <Pano p={[6.6, alto + 2, 0]} />
    </group>
  );
}

function Bau() {
  const ouro = useBrilho('#ffd76a', 1.1);
  return (
    <group position={[-12, PISO, 19]} rotation={[0, 0.35, 0]}>
      <Peca cor="#7a4a24" p={[0, 2.5, 0]} s={[9, 5, 6]} />
      <Peca cor="#8b5a2b" p={[0, 6, -0.6]} s={[9.2, 2, 6.2]} r={[-0.5, 0, 0]} />
      {[-3, 3].map(x => <Peca key={x} cor="#e6b84a" p={[x, 3, 0]} s={[0.8, 5.2, 6.2]} sombra={false} />)}
      {[[-1.5, 0], [1, 0.8], [0, -0.6]].map(([x, z], i) => (
        <mesh key={i} geometry={geoLuz} material={ouro} position={[x, 5.6, z]} scale={1.1} />
      ))}
    </group>
  );
}

export function Cabana({ progresso = 1, est = null }) {
  const nivel = est?.nivel ?? 1;
  const precaria = nivel <= 1;
  const etapa = (ini, fim) => THREE.MathUtils.clamp((progresso - ini) / (fim - ini), 0, 1);
  const tabuasDeck = Math.ceil(6 * etapa(0, 0.2));
  const tabuasParede = Math.ceil(24 * etapa(0.2, 0.6));
  const fileiras = Math.ceil(4 * etapa(0.6, 0.9));
  const detalhes = progresso >= 0.9;
  return (
    // a cabana precária fica levemente torta
    <group rotation={[0, 0, precaria ? 0.03 : 0.01]}>
      <Deck tabuas={Math.max(tabuasDeck, 1)} pedra={nivel >= 3} />
      <Paredes visiveis={tabuasParede} precaria={precaria} />
      {fileiras > 0 && <Telhado fileiras={fileiras} precaria={precaria} />}
      {detalhes && (
        <>
          <Porta precaria={precaria} />
          <Janela precaria={precaria} />
          {!precaria && <JanelaLosango />}
          <Chamine tijolo={nivel >= 2} />
          <Varanda />
          {nivel >= 2 && <Lanterna />}
          {nivel >= 3 && nivel < 5 && <Bandeira />}
          {nivel >= 4 && <Bau />}
          {nivel >= 5 && <MastroDeVigia />}
        </>
      )}
    </group>
  );
}
