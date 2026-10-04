import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBrilho } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Cercados (galinheiro, curral, pasto) =====================
// A cerca evolui com o nível (igual nos três):
//   1 madeira · 2 pilares de pedra nos cantos · 3 mureta de pedra · 4 ripas pintadas de branco
//   5 lanternas acesas nos pilares
// Cada abrigo ainda ganha os próprios detalhes por nível (ver Galinheiro, Curral, Pasto).
// "h" é meio lado do quadrado; o fundo é -Z e a frente (virada para a câmera) é +Z.

const MADEIRA = '#8a6436', ESTACA = '#5a3a1c', PEDRA = '#a9aeb3', PEDRA_ESCURA = '#8c9298', BRANCO = '#efe9dc';
const OURO = '#f5c84c', FENO = '#e3c55a', FENO_FAIXA = '#b8962e', AGUA = '#4aa3d9', VERMELHO_CELEIRO = '#b8402e';

function pontoDaCerca(i, porLado, h) {
  const lado = Math.floor(i / porLado), f = (i % porLado) / porLado;
  if (lado === 0) return [-h + f * 2 * h, -h];
  if (lado === 1) return [h, -h + f * 2 * h];
  if (lado === 2) return [h - f * 2 * h, h];
  return [-h, h - f * 2 * h];
}

function Lanterna({ p }) {
  const luz = useBrilho('#ffcf6a', 1.6);
  return (
    <group position={p}>
      <Peca cor="#2a2a2a" p={[0, 0.3, 0]} s={[3, 0.6, 3]} sombra={false} />
      <mesh geometry={geoLuz} material={luz} position={[0, 2, 0]} scale={[1.1, 1.6, 1.1]} />
      <Peca geo="telhado" cor="#2a2a2a" p={[0, 4, 0]} s={[2.6, 1.6, 2.6]} sombra={false} />
    </group>
  );
}
const geoLuz = new THREE.IcosahedronGeometry(1, 0);

export function Cercado({ h, corChao, nivel = 1, progresso = 1, children }) {
  const porLado = Math.max(4, Math.round(h / 9)), total = porLado * 4;
  const visiveis = Math.min(Math.ceil(total * progresso), total);
  const estacas = Array.from({ length: visiveis + 1 }, (_, i) => pontoDaCerca(i % total, porLado, h));
  const pronto = progresso >= 1;
  const corRipa = nivel >= 4 ? BRANCO : MADEIRA;
  const cantos = [[-h, -h], [h, -h], [h, h], [-h, h]];
  return (
    <group>
      <Peca cor={corChao} p={[0, 0.4, 0]} s={[h * 2, 0.8, h * 2]} sombra={false} />
      {estacas.slice(0, visiveis).map(([x, z], i) => (
        <Peca key={i} cor={nivel >= 4 ? BRANCO : ESTACA} p={[x, 4, z]} s={[2.6, 8, 2.6]} />
      ))}
      {estacas.slice(1).map(([x2, z2], i) => {
        const [x1, z1] = estacas[i];
        const len = Math.hypot(x2 - x1, z2 - z1);
        return (
          <group key={i} position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} rotation={[0, -Math.atan2(z2 - z1, x2 - x1), 0]}>
            <Peca cor={corRipa} p={[0, 6.5, 0]} s={[len, 1.4, 1.2]} />
            {nivel >= 3
              ? <Peca cor={i % 2 ? PEDRA : PEDRA_ESCURA} p={[0, 1.6, 0]} s={[len + 0.4, 3.2, 3]} /> // mureta de pedra
              : <Peca cor={corRipa} p={[0, 3, 0]} s={[len, 1.4, 1.2]} />}
          </group>
        );
      })}
      {/* pilares de pedra nos cantos */}
      {pronto && nivel >= 2 && cantos.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Peca cor={PEDRA} p={[0, 5, 0]} s={[5, 10, 5]} />
          <Peca cor={PEDRA_ESCURA} p={[0, 10.5, 0]} s={[5.8, 1.2, 5.8]} />
          {nivel >= 5 && <Lanterna p={[0, 11, 0]} />}
        </group>
      ))}
      {children}
    </group>
  );
}

// ===================== Peças dos abrigos =====================
function Fardo({ p, r = 0 }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Peca cor={FENO} p={[0, 3, 0]} s={[10, 6, 7]} />
      {[-2.5, 2.5].map(x => <Peca key={x} cor={FENO_FAIXA} p={[x, 3, 0]} s={[0.8, 6.2, 7.2]} sombra={false} />)}
    </group>
  );
}
function Cocho({ p, largura = 24 }) {
  return (
    <group position={p}>
      <Peca cor="#6b4423" p={[0, 2.5, 0]} s={[largura, 5, 7]} />
      <Peca cor="#d9c050" p={[0, 5.2, 0]} s={[largura - 4, 0.6, 4.5]} sombra={false} />
    </group>
  );
}
function Bebedouro({ p, largura = 16 }) {
  return (
    <group position={p}>
      <Peca cor="#7a5a3a" p={[0, 2, 0]} s={[largura, 4, 6]} />
      <Peca cor={AGUA} p={[0, 4.1, 0]} s={[largura - 2, 0.4, 4.4]} sombra={false} />
    </group>
  );
}
function Celeiro({ p, escala = 1 }) {
  return (
    <group position={p} scale={escala}>
      <Peca cor={VERMELHO_CELEIRO} p={[0, 8, 0]} s={[26, 16, 18]} />
      <Peca geo="telhado" cor="#5a3a2a" p={[0, 21, 0]} s={[22, 10, 16]} />
      {/* porta branca com X */}
      <Peca cor={BRANCO} p={[0, 6, 9.2]} s={[10, 12, 0.6]} sombra={false} />
      <Peca cor={VERMELHO_CELEIRO} p={[0, 6, 9.5]} s={[8.4, 10.4, 0.4]} sombra={false} />
      {[0.88, -0.88].map(r => <Peca key={r} cor={BRANCO} p={[0, 6, 9.8]} s={[1, 13, 0.3]} r={[0, 0, r]} sombra={false} />)}
      <Peca cor={BRANCO} p={[0, 14.5, 9.2]} s={[5, 3, 0.6]} sombra={false} />
    </group>
  );
}

// ===================== Galinheiro =====================
// 1 casinha · 2 poleiro · 3 ninhos com ovos · 4 galinheiro elevado com rampa · 5 cata-vento dourado e comedouro
function Casinha() {
  return (
    <group position={[0, 0, -34 + 12]}>
      <Peca cor="#9a6532" p={[0, 6, 0]} s={[20, 12, 14]} />
      <Peca geo="telhado" cor="#c0392b" p={[0, 17, 0]} s={[17, 10, 13]} />
      <Peca cor="#3a220e" p={[0, 3.5, 7.2]} s={[5, 6, 0.6]} sombra={false} />
    </group>
  );
}
function GalinheiroElevado({ cataVento }) {
  return (
    <group position={[-6, 0, -34 + 13]}>
      {[[-10, -6], [10, -6], [-10, 6], [10, 6]].map(([x, z]) => <Peca key={`${x}${z}`} cor={ESTACA} p={[x, 3.5, z]} s={[2, 7, 2]} />)}
      <Peca cor="#9a6532" p={[0, 14, 0]} s={[24, 14, 15]} />
      <Peca geo="telhado" cor="#c0392b" p={[0, 27, 0]} s={[20, 11, 14]} />
      <Peca cor="#3a220e" p={[6, 11, 7.8]} s={[5, 6, 0.6]} sombra={false} />
      <Peca cor="#e0d6bf" p={[-6, 16, 7.8]} s={[5, 4, 0.6]} sombra={false} />
      {/* rampa com degraus */}
      <group position={[6, 4.2, 14]} rotation={[0.62, 0, 0]}>
        <Peca cor={MADEIRA} s={[5, 0.8, 14]} />
        {[-4, 0, 4].map(z => <Peca key={z} cor={ESTACA} p={[0, 0.6, z]} s={[5, 0.5, 0.6]} sombra={false} />)}
      </group>
      {cataVento && <CataVento p={[0, 33, 0]} />}
    </group>
  );
}
function CataVento({ p }) {
  const seta = useRef();
  useFrame(({ clock }) => { seta.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 1.2; });
  return (
    <group position={p}>
      <Peca geo="cilindro" cor="#3a3a3a" p={[0, 5, 0]} s={[0.4, 10, 0.4]} sombra={false} />
      <group ref={seta} position={[0, 9, 0]}>
        <Peca cor={OURO} s={[9, 0.6, 0.6]} />
        <Peca geo="cone" cor={OURO} p={[5, 0, 0]} s={[1.2, 2.4, 1.2]} r={[0, 0, -Math.PI / 2]} />
        {/* galo dourado */}
        <Peca geo="bola" cor={OURO} p={[-1, 2.6, 0]} s={[2.4, 2, 0.6]} />
        <Peca geo="bola" cor={OURO} p={[0.8, 4.2, 0]} s={[1.1, 1.1, 0.6]} />
        <Peca geo="cone" cor={OURO} p={[-3.4, 3.6, 0]} s={[1.2, 2.6, 0.5]} r={[0, 0, 0.6]} />
      </group>
    </group>
  );
}
function Poleiro() {
  return (
    <group position={[-22, 0, 6]}>
      {[-6, 6].map(z => <Peca key={z} cor={ESTACA} p={[0, 5, z]} s={[1.6, 10, 1.6]} />)}
      <Peca geo="cilindro" cor={MADEIRA} p={[0, 9, 0]} s={[0.9, 14, 0.9]} r={[Math.PI / 2, 0, 0]} />
      <Peca geo="cilindro" cor={MADEIRA} p={[0, 5.5, 0]} s={[0.9, 14, 0.9]} r={[Math.PI / 2, 0, 0]} />
    </group>
  );
}
function Ninhos() {
  return (
    <group position={[18, 0, 14]}>
      {[-7, 0, 7].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <Peca cor="#8a6436" p={[0, 1.8, 0]} s={[6, 3.6, 6]} />
          <Peca cor="#d9c38a" p={[0, 3.7, 0]} s={[5, 0.6, 5]} sombra={false} />
          {Array.from({ length: 1 + (i % 2) }, (_, k) => (
            <Peca key={k} geo="bolaLisa" cor="#fff8ec" p={[k * 1.4 - 0.7 * (i % 2), 4.6, 0]} s={[0.9, 1.15, 0.9]} sombra={false} />
          ))}
        </group>
      ))}
    </group>
  );
}
function Galinheiro({ nivel = 1, progresso = 1 }) {
  const pronto = progresso >= 1;
  return (
    <Cercado h={34} corChao="#b89a62" nivel={nivel} progresso={progresso}>
      {pronto && (nivel >= 4 ? <GalinheiroElevado cataVento={nivel >= 5} /> : <Casinha />)}
      {pronto && nivel >= 2 && <Poleiro />}
      {pronto && nivel >= 3 && <Ninhos />}
      {pronto && nivel >= 5 && <Cocho p={[12, 0, -6]} largura={14} />}
    </Cercado>
  );
}

// ===================== Curral (ovelhas) =====================
// 1 cocho · 2 fardos de feno · 3 abrigo de teto inclinado · 4 bebedouro · 5 celeiro vermelho
function AbrigoInclinado() {
  return (
    <group position={[-20, 0, -44 + 12]}>
      {[-12, 12].map(x => <Peca key={x} cor={ESTACA} p={[x, 7, 8]} s={[1.8, 14, 1.8]} />)}
      {[-12, 12].map(x => <Peca key={`f${x}`} cor={ESTACA} p={[x, 5, -6]} s={[1.8, 10, 1.8]} />)}
      <Peca cor="#7a5a3a" p={[0, 12.5, 1]} s={[28, 1.4, 18]} r={[-0.15, 0, 0]} />
    </group>
  );
}
function Curral({ nivel = 1, progresso = 1 }) {
  const pronto = progresso >= 1;
  return (
    <Cercado h={44} corChao="#a88a55" nivel={nivel} progresso={progresso}>
      {pronto && <Cocho p={[0, 0, 44 - 12]} />}
      {pronto && nivel >= 2 && <><Fardo p={[28, 0, 20]} r={0.3} /><Fardo p={[30, 0, 6]} r={-0.2} /></>}
      {pronto && nivel >= 3 && nivel < 5 && <AbrigoInclinado />}
      {pronto && nivel >= 4 && <Bebedouro p={[-26, 0, 22]} />}
      {pronto && nivel >= 5 && <Celeiro p={[-16, 0, -44 + 14]} escala={0.9} />}
    </Cercado>
  );
}

// ===================== Pasto (vacas) =====================
// 1 cocho · 2 fardos de feno · 3 bebedouro · 4 celeiro vermelho · 5 moinho de vento
function Moinho({ p }) {
  const pas = useRef();
  useFrame((_, dt) => { pas.current.rotation.z += dt * 1.2; });
  return (
    <group position={p}>
      <Peca geo="tronco" cor="#e8dcc0" p={[0, 16, 0]} s={[5, 32, 5]} />
      <Peca geo="telhado" cor="#5a3a2a" p={[0, 35, 0]} s={[6, 6, 6]} />
      <group ref={pas} position={[0, 30, 5.5]}>
        <Peca geo="cilindro" cor="#4a3426" s={[1.4, 2, 1.4]} r={[Math.PI / 2, 0, 0]} />
        {[0, 1, 2, 3].map(i => (
          <group key={i} rotation={[0, 0, i * Math.PI / 2]}>
            <Peca cor="#8a6a44" p={[0, 8, 0]} s={[1, 15, 0.5]} />
            <Peca cor="#f2ead6" p={[1.8, 9, 0]} s={[3, 11, 0.3]} sombra={false} />
          </group>
        ))}
      </group>
    </group>
  );
}
function Pasto({ nivel = 1, progresso = 1 }) {
  const pronto = progresso >= 1;
  return (
    <Cercado h={56} corChao="#7fbf55" nivel={nivel} progresso={progresso}>
      {pronto && <Cocho p={[0, 0, 56 - 12]} />}
      {pronto && nivel >= 2 && <><Fardo p={[38, 0, 30]} r={0.2} /><Fardo p={[38, 0, 18]} r={-0.1} /><Fardo p={[38, 6, 24]} r={0.05} /></>}
      {pronto && nivel >= 3 && <Bebedouro p={[-36, 0, 30]} largura={20} />}
      {pronto && nivel >= 4 && <Celeiro p={[-22, 0, -56 + 15]} />}
      {pronto && nivel >= 5 && <Moinho p={[30, 0, -56 + 14]} />}
    </Cercado>
  );
}

// Modelos registrados em Construcoes.jsx (recebem est com o nível)
export const MODELOS_CERCADO = {
  galinheiro: ({ est, ...p }) => <Galinheiro nivel={est?.nivel ?? 1} {...p} />,
  curral: ({ est, ...p }) => <Curral nivel={est?.nivel ?? 1} {...p} />,
  pasto: ({ est, ...p }) => <Pasto nivel={est?.nivel ?? 1} {...p} />,
};
