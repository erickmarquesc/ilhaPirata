import { useMemo } from 'react';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { clicar, moverPonteiro } from '../../game/jogo.js';
import { dentroDaIlha, raioIlha } from '../../game/ilha.js';
import { useMundo } from '../../hooks/useMundo.js';
import { ALTURA, RECUO_GRAMA, doMundo, formaIlha } from './coords.js';
import { gestos } from './gestos.js';
import { material } from './materiais.jsx';
import { GEO } from './Peca.jsx';

// Forma no plano XY → deitada no chão (Y do shape vira Z da cena; a extrusão desce).
// Formas planas ficam com a face para baixo, por isso usam material de dois lados.
const DEITAR = [Math.PI / 2, 0, 0];

function extrudar(forma, profundidade) {
  return new THREE.ExtrudeGeometry(forma, { depth: profundidade, bevelEnabled: false, curveSegments: 1 });
}

// Rochas decorativas no raso, em volta da ilha (sempre as mesmas)
const ROCHAS = Array.from({ length: 34 }, (_, i) => {
  const ang = i * 2.399 + Math.sin(i * 7.1) * 0.3;
  return { ang, fora: 14 + ((i * 37) % 23), tam: 4 + ((i * 53) % 7), giro: i * 1.3 };
});

// Tufos de capim e arbustos espalhados pela grama (só enfeite)
const aleatorio = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const TUFOS = Array.from({ length: 160 }, (_, i) => ({
  ang: aleatorio(i + 1) * Math.PI * 2, dist: Math.sqrt(aleatorio(i + 500)) * 0.95,
  tam: 2.5 + aleatorio(i + 900) * 4, arbusto: aleatorio(i + 1300) < 0.2, giro: i,
}));
function Tufos({ estruturas, qtdExpansoes }) {
  const lista = useMemo(() => TUFOS.flatMap(t => {
    const r = (raioIlha(t.ang) - RECUO_GRAMA - 10) * t.dist;
    const x = ILHA.x + Math.cos(t.ang) * r, y = ILHA.y + Math.sin(t.ang) * r;
    // não nasce dentro de construções
    if (estruturas.some(s => Math.abs(s.x - x) < s.raio + 6 && Math.abs(s.y - y) < s.raio + 6)) return [];
    return [{ ...t, X: x - ILHA.x, Z: y - ILHA.y }];
  }), [estruturas.length, qtdExpansoes]); // eslint-disable-line react-hooks/exhaustive-deps
  return lista.map((t, i) => (
    <mesh
      key={i}
      geometry={t.arbusto ? GEO.bola : GEO.cone}
      material={material(t.arbusto ? '#4f9e3a' : i % 2 ? '#62b345' : '#8fd45f')}
      position={[t.X, ALTURA.grama + (t.arbusto ? t.tam * 0.5 : t.tam * 0.6), t.Z]}
      scale={t.arbusto ? [t.tam * 1.4, t.tam, t.tam * 1.4] : [t.tam * 0.45, t.tam * 1.2, t.tam * 0.45]}
      rotation={[0, t.giro, 0]}
      castShadow={t.arbusto}
      receiveShadow
    />
  ));
}

export default function Terreno() {
  const { expansoes, estruturas } = useMundo();
  const qtdExpansoes = expansoes.length;

  // Refaz as geometrias só quando a ilha muda de forma (expansão)
  const geo = useMemo(() => ({
    areia: extrudar(formaIlha(0), 14),
    grama: extrudar(formaIlha(RECUO_GRAMA), 1.5),
    espuma: new THREE.ShapeGeometry(formaIlha(-7, 0)),
    raso: new THREE.ShapeGeometry(formaIlha(-48, -7)),
  }), [qtdExpansoes]); // eslint-disable-line react-hooks/exhaustive-deps

  const rochas = useMemo(() => ROCHAS.map(r => {
    const dist = raioIlha(r.ang) + r.fora;
    const x = ILHA.x + Math.cos(r.ang) * dist, y = ILHA.y + Math.sin(r.ang) * dist;
    return { ...r, X: x - ILHA.x, Z: y - ILHA.y, visivel: !dentroDaIlha(x, y, -r.tam) };
  }), [qtdExpansoes]); // eslint-disable-line react-hooks/exhaustive-deps

  const pontoDoEvento = e => doMundo(e.point.x, e.point.z);

  return (
    <group>
      {/* mar */}
      <mesh geometry={GEO.quadrado} material={material('#2a7fc4')} scale={[8000, 1, 8000]} position={[0, -0.2, 0]} receiveShadow />
      <mesh geometry={geo.raso} material={material('#3d9ad6', false, true)} rotation={DEITAR} position={[0, 0.05, 0]} receiveShadow />
      <mesh geometry={geo.espuma} material={material('#f4fbff', false, true)} rotation={DEITAR} position={[0, 0.3, 0]} />
      {/* areia e grama */}
      <mesh geometry={geo.areia} material={material('#ecd193')} rotation={DEITAR} position={[0, ALTURA.areia, 0]} receiveShadow />
      <mesh geometry={geo.grama} material={material('#78c454')} rotation={DEITAR} position={[0, ALTURA.grama, 0]} receiveShadow />
      <Tufos estruturas={estruturas} qtdExpansoes={qtdExpansoes} />
      {rochas.filter(r => r.visivel).map((r, i) => (
        <mesh
          key={i}
          geometry={GEO.rocha}
          material={material(i % 3 ? '#e4e8ec' : '#c9d0d6')}
          position={[r.X, r.tam * 0.25, r.Z]}
          scale={[r.tam, r.tam * 0.7, r.tam]}
          rotation={[0, r.giro, 0]}
          castShadow
          receiveShadow
        />
      ))}
      {/* plano invisível que recebe os toques no chão e no mar */}
      <mesh
        geometry={GEO.quadrado}
        scale={[8000, 1, 8000]}
        position={[0, ALTURA.grama, 0]}
        onPointerDown={e => { if (e.nativeEvent.button > 0 || gestos.pincando) return; clicar(pontoDoEvento(e)); }}
        onPointerMove={e => moverPonteiro(pontoDoEvento(e))}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
