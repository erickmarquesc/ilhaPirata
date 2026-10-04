import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { animalAdulto } from '../../game/animais.js';
import { ILHA } from '../../game/config.js';
import { mundo } from '../../game/mundo.js';
import { aoTocarEntidade } from './clique.js';
import { alturaDoChao } from './coords.js';
import { material } from './materiais.jsx';

// ===================== Animais simplificados (longe da câmera) =====================
// Corpo, cabeça e pernas desenhados com InstancedMesh: todos os animais distantes
// em 3 chamadas de desenho, não importa quantos sejam. Os de perto usam AnimalAnimado.

const CAPACIDADE = 400;
const geoCorpo = new THREE.IcosahedronGeometry(1, 1);
const geoPernas = new THREE.BoxGeometry(1, 1, 1);
const BRANCO = material('#ffffff');

// Proporções (em raios) e cores de cada espécie, parecidas com o modelo completo
const FORMA = {
  ovelha:  { corpo: [0.95, 0.75, 0.75], yCorpo: 0.98, cabeca: 0.45, cab: [0.95, 1.3], pernas: [0.9, 0.6, 0.6] },
  vaca:    { corpo: [1.0, 0.6, 0.6], yCorpo: 1.05, cabeca: 0.5, cab: [1.05, 1.45], pernas: [1.0, 0.68, 0.64] },
  galinha: { corpo: [0.72, 0.62, 0.6], yCorpo: 0.85, cabeca: 0.42, cab: [0.48, 1.45], pernas: [0.12, 0.45, 0.32] },
};
function cores(an) {
  const filhote = !animalAdulto(an), macho = an.sexo === 'm';
  if (an.especie === 'ovelha') return [filhote ? '#fbf8f0' : macho ? '#e9e1cf' : '#f6f4ee', macho ? '#5a4a3a' : '#4a4040', '#3a3434'];
  if (an.especie === 'vaca') { const pelo = macho ? '#7a4a2a' : '#f7f5f0'; return [pelo, pelo, '#4a3a30']; }
  const pena = filhote ? '#ffe27a' : macho ? '#c8642a' : '#fbfbf7';
  return [pena, pena, '#f0a030'];
}

const pai = new THREE.Object3D(), filho = new THREE.Object3D();
pai.add(filho);
const cor = new THREE.Color();

export default function AnimaisSimples({ detalhados }) {
  const corpos = useRef(), cabecas = useRef(), pernas = useRef();
  const lista = useRef([]); // índice da instância → animal (para o clique)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mc = corpos.current, mh = cabecas.current, mp = pernas.current;
    let n = 0;
    for (const an of mundo.animais) {
      if (detalhados.current.has(an) || n >= CAPACIDADE) continue;
      const f = FORMA[an.especie], r = an.raio;
      const andando = (an.vel || 0) > 2 ? 1 : 0;
      const pulo = Math.abs(Math.sin(t * 10 + n)) * 0.05 * r * andando;
      pai.position.set(an.x - ILHA.x, alturaDoChao(an.x, an.y) + pulo, an.y - ILHA.y);
      pai.rotation.set(0, -(an.rumo ?? (an.dir > 0 ? 0 : Math.PI)), 0);
      pai.scale.setScalar(r);
      const [cCorpo, cCabeca, cPernas] = cores(an);
      const filhote = !animalAdulto(an) ? 1.25 : 1;

      filho.position.set(0, f.yCorpo, 0); filho.scale.set(...f.corpo); filho.rotation.set(0, 0, 0);
      pai.updateMatrixWorld(true); mc.setMatrixAt(n, filho.matrixWorld); mc.setColorAt(n, cor.set(cCorpo));

      filho.position.set(f.cab[0], f.cab[1], 0); filho.scale.setScalar(f.cabeca * filhote);
      pai.updateMatrixWorld(true); mh.setMatrixAt(n, filho.matrixWorld); mh.setColorAt(n, cor.set(cCabeca));

      filho.position.set(0, f.pernas[1] / 2, 0); filho.scale.set(...f.pernas);
      pai.updateMatrixWorld(true); mp.setMatrixAt(n, filho.matrixWorld); mp.setColorAt(n, cor.set(cPernas));

      lista.current[n] = an;
      n++;
    }
    for (const m of [mc, mh, mp]) {
      m.count = n;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  });

  const tocar = e => {
    const an = lista.current[e.instanceId];
    if (an) aoTocarEntidade(e, an.x, an.y);
  };
  const malha = (ref, geo, sombra) => (
    <instancedMesh ref={ref} args={[geo, BRANCO, CAPACIDADE]} castShadow={sombra} receiveShadow frustumCulled={false} onPointerDown={tocar} />
  );
  return (
    <>
      {malha(corpos, geoCorpo, true)}
      {malha(cabecas, geoCorpo, true)}
      {malha(pernas, geoPernas, false)}
    </>
  );
}
