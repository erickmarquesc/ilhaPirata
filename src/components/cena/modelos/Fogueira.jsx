import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PEDACOS_POR_PRATO } from '../../../game/config.js';
import { mundo } from '../../../game/mundo.js';
import { useBrilho } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Fogueira =====================
// Roda de pedras, lenha cruzada, chamas que tremulam e um espeto apoiado em duas forquilhas.
// Enquanto Jones cozinha, a carne (churrasco) ou o peixe (peixada) gira no espeto; pronto,
// o prato fica no espeto e vai diminuindo a cada pedaço comido.
// 1 roda de pedras e espeto · 2 tronco para sentar e lenha empilhada · 3 grelha de ferro ·
// 4 base de pedra e caldeirão · 5 churrasqueira de tijolo com chaminé e espeto dourado.
// Obra em etapas: pedras → lenha → espeto → fogo.

const MADEIRA = '#8b6a45', MADEIRA_ESCURA = '#5a3a1c', PEDRA = '#9aa0a6', PEDRA_ESCURA = '#6f757b';
const FERRO = '#3a3a3a', TIJOLO = '#a5532f', OURO = '#f5c84c', CARNE = '#8a3b22', PEIXE = '#7fa8c0';

const geoChama = new THREE.ConeGeometry(1, 1, 5);
const ALTURA_ESPETO = 13;

function Chamas({ nivel }) {
  const grupo = useRef();
  const laranja = useBrilho('#ff7a1a', 1.8);
  const amarelo = useBrilho('#ffd34d', 2.2);
  const escala = 1 + (nivel - 1) * 0.08;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    grupo.current.children.forEach((m, i) => {
      const f = 1 + Math.sin(t * 9 + i * 2.1) * 0.15 + Math.sin(t * 13 + i) * 0.08;
      m.scale.set(m.userData.l, m.userData.a * f, m.userData.l);
    });
  });
  const chamas = [
    { p: [0, 4.5, 0], l: 3.2, a: 9, mat: laranja },
    { p: [-1.8, 3.5, 1], l: 2.2, a: 6, mat: laranja },
    { p: [1.9, 3.5, -0.8], l: 2.2, a: 6.5, mat: laranja },
    { p: [0.3, 4, 0.6], l: 1.6, a: 6, mat: amarelo },
  ];
  return (
    <group ref={grupo} scale={escala}>
      {chamas.map((c, i) => (
        <mesh key={i} geometry={geoChama} material={c.mat} position={c.p} scale={[c.l, c.a, c.l]} userData={{ l: c.l, a: c.a }} />
      ))}
    </group>
  );
}

// Carne ou peixe no espeto: gira enquanto Jones cozinha nesta fogueira e, pronto,
// fica parado e menor a cada pedaço comido
function Comida({ est }) {
  const giro = useRef(), carne = useRef(), peixe = useRef();
  useFrame((_, dt) => {
    const t = mundo.jogador?.acao?.tarefa;
    const cozinhando = !!est && t?.tipo === 'cozinhar' && t.estrutura === est;
    const servido = est ? mundo.comida?.servido : null;
    const prato = cozinhando ? t.prato : servido?.prato;
    giro.current.visible = !!prato;
    if (!prato) return;
    carne.current.visible = prato === 'churrasco';
    peixe.current.visible = prato === 'peixada';
    if (cozinhando) giro.current.rotation.x += dt * 2.5;
    giro.current.scale.setScalar(cozinhando ? 1 : 0.45 + 0.55 * servido.pedacos / PEDACOS_POR_PRATO);
  });
  return (
    <group ref={giro} position={[0, ALTURA_ESPETO, 0]} visible={false}>
      <group ref={carne}>
        <Peca geo="bola" cor={CARNE} s={[4, 2.6, 2.6]} />
        <Peca geo="bola" cor="#6a2a16" p={[-3.2, 0, 0]} s={[2, 2, 2]} />
      </group>
      <group ref={peixe}>
        <Peca geo="bola" cor={PEIXE} s={[4.2, 1.8, 1.2]} />
        <Peca geo="cone" cor={PEIXE} p={[5, 0, 0]} s={[1.6, 2.4, 0.6]} r={[0, 0, -Math.PI / 2]} />
      </group>
    </group>
  );
}

function Forquilha({ x }) {
  return (
    <group position={[x, 0, 0]}>
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, ALTURA_ESPETO / 2, 0]} s={[0.7, ALTURA_ESPETO, 0.7]} />
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, ALTURA_ESPETO + 1, 0.9]} s={[0.4, 2.6, 0.4]} r={[0.5, 0, 0]} />
      <Peca geo="cilindro" cor={MADEIRA_ESCURA} p={[0, ALTURA_ESPETO + 1, -0.9]} s={[0.4, 2.6, 0.4]} r={[-0.5, 0, 0]} />
    </group>
  );
}

export function Fogueira({ progresso = 1, est = null }) {
  const nivel = est?.nivel ?? 1;
  const lenha = progresso >= 0.4;
  const espeto = progresso >= 0.7;
  const pronto = progresso >= 1;
  const qtdPedras = 10;
  return (
    <group>
      {/* base de pedra lisa */}
      {nivel >= 4 && <Peca geo="octogono" cor={PEDRA_ESCURA} p={[0, 0.6, 0]} s={[13, 1.2, 13]} />}
      {/* roda de pedras (dupla a partir do nível 2) */}
      {Array.from({ length: qtdPedras }, (_, i) => {
        const a = i / qtdPedras * Math.PI * 2;
        return <Peca key={i} geo="rocha" cor={i % 2 ? PEDRA : PEDRA_ESCURA} p={[Math.cos(a) * 8, 1.4, Math.sin(a) * 8]} s={[2.2, 1.8, 2]} r={[0, a, 0]} />;
      })}
      {nivel >= 2 && Array.from({ length: 14 }, (_, i) => {
        const a = (i + 0.5) / 14 * Math.PI * 2;
        return <Peca key={i} geo="rocha" cor={PEDRA_ESCURA} p={[Math.cos(a) * 10.5, 1, Math.sin(a) * 10.5]} s={[1.8, 1.3, 1.6]} r={[0, a, 0]} sombra={false} />;
      })}
      {/* lenha cruzada e brasa */}
      {lenha && (
        <group position={[0, 1.4, 0]}>
          {[0, 1, 2, 3].map(i => (
            <group key={i} rotation={[0, i * Math.PI / 4, 0]}>
              <Peca geo="cilindro" cor={i % 2 ? MADEIRA : MADEIRA_ESCURA} p={[0, 0.6 + i * 0.5, 0]} s={[0.9, 10, 0.9]} r={[Math.PI / 2, 0, 0]} />
            </group>
          ))}
          <Peca geo="disco" cor="#2a1a10" p={[0, 0.1, 0]} s={6} sombra={false} />
        </group>
      )}
      {/* espeto */}
      {espeto && (
        <>
          <Forquilha x={-10} />
          <Forquilha x={10} />
          <Peca geo="cilindro" cor={nivel >= 5 ? OURO : FERRO} p={[0, ALTURA_ESPETO, 0]} s={[0.35, 22, 0.35]} r={[0, 0, Math.PI / 2]} sombra={false} />
          <Comida est={est} />
        </>
      )}
      {/* grelha de ferro sobre o fogo */}
      {pronto && nivel >= 3 && (
        <group position={[0, 7, 0]}>
          {[-4, -2, 0, 2, 4].map(z => <Peca key={z} cor={FERRO} p={[0, 0, z]} s={[11, 0.3, 0.3]} sombra={false} />)}
          {[-5.5, 5.5].map(x => <Peca key={x} cor={FERRO} p={[x, 0, 0]} s={[0.4, 0.4, 10]} sombra={false} />)}
          {[[-5.5, -4], [5.5, -4], [-5.5, 4], [5.5, 4]].map(([x, z]) => (
            <Peca key={`${x}${z}`} cor={FERRO} p={[x, -2.8, z]} s={[0.4, 5.6, 0.4]} sombra={false} />
          ))}
        </group>
      )}
      {pronto && <Chamas nivel={nivel} />}
      {/* tronco para sentar e lenha empilhada */}
      {pronto && nivel >= 2 && (
        <>
          <Peca geo="cilindro" cor={MADEIRA} p={[0, 2, -15]} s={[2, 14, 2]} r={[0, 0, Math.PI / 2]} />
          <group position={[-15, 0, 7]}>
            {[[0, 1, 0], [2.2, 1, 0], [1.1, 2.9, 0]].map((p, i) => (
              <Peca key={i} geo="cilindro" cor={i === 2 ? MADEIRA_ESCURA : MADEIRA} p={p} s={[1, 6, 1]} r={[Math.PI / 2, 0, 0]} />
            ))}
          </group>
        </>
      )}
      {/* caldeirão da peixada */}
      {pronto && nivel >= 4 && (
        <group position={[15, 0, 4]}>
          <Peca geo="bolaLisa" cor={FERRO} p={[0, 3, 0]} s={[3.6, 3, 3.6]} />
          <Peca geo="disco" cor="#c9a24a" p={[0, 5.2, 0]} s={2.6} sombra={false} />
          <Peca geo="rosca" cor={FERRO} p={[0, 5.4, 0]} s={[2.8, 2.8, 2.8]} r={[Math.PI / 2, 0, 0]} sombra={false} />
        </group>
      )}
      {/* churrasqueira de tijolo com chaminé, atrás do fogo */}
      {pronto && nivel >= 5 && (
        <group position={[0, 0, -11]}>
          <Peca cor={TIJOLO} p={[0, 6, 0]} s={[20, 12, 3]} />
          <Peca cor="#8a4326" p={[0, 12.4, 0]} s={[21, 0.8, 3.6]} sombra={false} />
          <Peca cor={TIJOLO} p={[7, 18, 0]} s={[4, 12, 3]} />
          <Peca cor="#8a4326" p={[7, 24.4, 0]} s={[5, 1, 4]} sombra={false} />
          <Peca cor={OURO} p={[0, 9, 1.6]} s={[6, 1, 0.3]} sombra={false} />
        </group>
      )}
    </group>
  );
}
