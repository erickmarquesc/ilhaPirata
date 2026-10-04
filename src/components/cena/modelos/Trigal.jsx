import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TEMPO_TRIGO_CRESCER } from '../../../game/config.js';
import { material } from '../materiais.jsx';
import Peca from '../Peca.jsx';

// ===================== Trigal =====================
// Cada canteiro tem 3 leiras de terra e 12 hastes de trigo (caule + espiga).
// As hastes são desenhadas com InstancedMesh: todas de um campo numa chamada só.

const LEIRAS = 3, POR_LEIRA = 4, POR_CANTEIRO = LEIRAS * POR_LEIRA;
const TERRA = '#6e4f28', LEIRA = '#5a3e1e';

const geoCaule = new THREE.CylinderGeometry(0.35, 0.45, 1, 5).translate(0, 0.5, 0); // base na origem
const geoEspiga = new THREE.IcosahedronGeometry(1, 0);
const branco = material('#ffffff'); // a cor vem de cada instância

// Cores conforme o crescimento: broto verde → verde-amarelado → dourado
const COR = {
  cauleNovo: new THREE.Color('#6fae3c'), cauleMaduro: new THREE.Color('#d2ac48'),
  espigaNova: new THREE.Color('#8cc456'), espigaMadura: new THREE.Color('#f0c43c'),
};
const cor = new THREE.Color();
const pai = new THREE.Object3D(), filho = new THREE.Object3D();
pai.add(filho);
const ESCONDIDO = new THREE.Matrix4().makeScale(0, 0, 0);

// Posições fixas das hastes dentro de um canteiro (sobre as leiras, com variação)
function layoutDoCanteiro(tam, semente) {
  const passoZ = tam / LEIRAS, passoX = (tam - 3) / POR_LEIRA;
  return Array.from({ length: POR_CANTEIRO }, (_, i) => {
    const l = Math.floor(i / POR_LEIRA), c = i % POR_LEIRA;
    const r = n => { const s = Math.sin((semente * 31 + i * 7 + n) * 12.9898) * 43758.5453; return s - Math.floor(s); };
    return {
      x: -tam / 2 + 1.5 + passoX * (c + 0.5) + (r(1) - 0.5) * 1.6,
      z: -tam / 2 + passoZ * (l + 0.5) + (r(2) - 0.5) * 1.2,
      alt: 0.8 + r(3) * 0.35,      // variação de altura
      giro: r(4) * Math.PI * 2,
      fase: r(5) * 6,
    };
  });
}

function Leiras({ k, x, z }) {
  const passoZ = k.tam / LEIRAS;
  return (
    <group position={[x, 0, z]}>
      <Peca cor={TERRA} p={[0, 1, 0]} s={[k.tam, 1.2, k.tam]} sombra={false} />
      {Array.from({ length: LEIRAS }, (_, l) => (
        <Peca key={l} cor={LEIRA} p={[0, 1.8, -k.tam / 2 + passoZ * (l + 0.5)]} s={[k.tam - 1.5, 1.1, passoZ * 0.55]} sombra={false} />
      ))}
    </group>
  );
}

export function Trigal({ est }) {
  const caules = useRef(), espigas = useRef();
  const total = est.canteiros.length * POR_CANTEIRO;
  const layouts = useMemo(() => est.canteiros.map((k, i) => layoutDoCanteiro(k.tam, i + 1)), [est]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mc = caules.current, me = espigas.current;
    if (!mc || !me) return;
    est.canteiros.forEach((k, ki) => {
      const cx = k.x - est.x, cz = k.y - est.y;
      const cresc = k.estado === 'maduro' ? 1 : k.estado === 'crescendo' ? Math.min(k.idade / TEMPO_TRIGO_CRESCER, 1) : 0;
      layouts[ki].forEach((h, hi) => {
        const i = ki * POR_CANTEIRO + hi;
        if (k.estado === 'vazio') { mc.setMatrixAt(i, ESCONDIDO); me.setMatrixAt(i, ESCONDIDO); return; }
        const altura = (2 + 11 * cresc) * h.alt;
        // vento: uma onda que atravessa o campo, mais forte nas hastes altas
        const vento = Math.sin(t * 1.6 + (cx + h.x) * 0.08 + h.fase * 0.3) * 0.07 * (0.3 + cresc);
        const curva = k.estado === 'maduro' ? 0.08 : 0; // espiga madura pesa e entorta
        pai.position.set(cx + h.x, 2.2, cz + h.z);
        pai.rotation.set(vento * 0.5, h.giro, vento + curva);
        // caule
        filho.position.set(0, 0, 0);
        filho.rotation.set(0, 0, 0);
        filho.scale.set(1, altura, 1);
        pai.updateMatrixWorld(true);
        mc.setMatrixAt(i, filho.matrixWorld);
        // espiga no alto do caule (some quando é só broto)
        const tamEspiga = Math.max(cresc - 0.25, 0) / 0.75;
        filho.position.set(0, altura + 1.6 * tamEspiga, 0);
        filho.rotation.set(0, 0, curva * 2);
        filho.scale.set(0.9 * tamEspiga + 0.001, 2.6 * tamEspiga + 0.001, 0.9 * tamEspiga + 0.001);
        pai.updateMatrixWorld(true);
        me.setMatrixAt(i, filho.matrixWorld);
        // cores
        mc.setColorAt(i, cor.copy(COR.cauleNovo).lerp(COR.cauleMaduro, Math.max(cresc - 0.5, 0) * 2));
        me.setColorAt(i, cor.copy(COR.espigaNova).lerp(COR.espigaMadura, Math.max(cresc - 0.4, 0) / 0.6));
      });
    });
    mc.instanceMatrix.needsUpdate = true;
    me.instanceMatrix.needsUpdate = true;
    if (mc.instanceColor) mc.instanceColor.needsUpdate = true;
    if (me.instanceColor) me.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {est.canteiros.map((k, i) => <Leiras key={i} k={k} x={k.x - est.x} z={k.y - est.y} />)}
      <instancedMesh ref={caules} args={[geoCaule, branco, total]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={espigas} args={[geoEspiga, branco, total]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}
