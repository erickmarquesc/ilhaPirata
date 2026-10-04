import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { arvoresAfetadas, podeConstruirEm, podePlantarEm } from '../../game/espaco.js';
import { expansaoPara } from '../../game/expansao.js';
import { mundo } from '../../game/mundo.js';
import { useMundo } from '../../hooks/useMundo.js';
import { ALTURA, alturaDoChao, formaExpansao } from './coords.js';
import { Fantasma, material } from './materiais.jsx';
import { MODELOS } from './modelos/Construcoes.jsx';
import { GEO } from './Peca.jsx';

const OK = '#b4ff8c', ERRO = '#ff7864', AREIA = '#f1dc9e';

// Material translúcido, um por cor
const translucidos = new Map();
function translucido(cor, opacidade = 0.35) {
  const chave = cor + opacidade;
  if (!translucidos.has(chave)) {
    translucidos.set(chave, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: opacidade, depthWrite: false, side: THREE.DoubleSide }));
  }
  return translucidos.get(chave);
}

function posicionar(obj, x, y, h = alturaDoChao(x, y) + 0.4) {
  obj.position.set(x - ILHA.x, h, y - ILHA.y);
}

// ===================== Plantar =====================
function PreviaPlantar() {
  const disco = useRef();
  useFrame(() => {
    const p = mundo.ponteiro;
    disco.current.material = translucido(podePlantarEm(p) ? OK : ERRO, 0.45);
    posicionar(disco.current, p.x, p.y);
  });
  return <mesh ref={disco} geometry={GEO.disco} scale={16} />;
}

// ===================== Construir =====================
const MAX_X = 12;
function PreviaConstruir({ id }) {
  const c = CONSTRUCOES[id];
  const Modelo = MODELOS[id];
  const grupo = useRef(), base = useRef(), xis = useRef([]);
  useFrame(() => {
    const p = mundo.ponteiro;
    base.current.material = translucido(podeConstruirEm(id, p) ? OK : ERRO, 0.4);
    posicionar(grupo.current, p.x, p.y, alturaDoChao(p.x, p.y));
    // marca em vermelho as árvores que vão ser derrubadas
    const afetadas = arvoresAfetadas(id, p);
    xis.current.forEach((m, i) => {
      const t = afetadas[i];
      m.visible = !!t;
      if (t) posicionar(m, t.x, t.y, alturaDoChao(t.x, t.y) + 40 * (t.raio / 16));
    });
  });
  return (
    <>
      <group ref={grupo}>
        <mesh ref={base} geometry={c.area ? GEO.quadrado : GEO.disco} scale={c.area ? c.raio * 2 : c.raio} position={[0, 0.5, 0]} />
        <Fantasma><Modelo /></Fantasma>
      </group>
      {Array.from({ length: MAX_X }, (_, i) => (
        <group key={i} ref={el => { xis.current[i] = el; }}>
          <mesh geometry={GEO.caixa} material={material(ERRO)} scale={[18, 3, 3]} rotation={[0, 0, Math.PI / 4]} />
          <mesh geometry={GEO.caixa} material={material(ERRO)} scale={[18, 3, 3]} rotation={[0, 0, -Math.PI / 4]} />
        </group>
      ))}
    </>
  );
}

// ===================== Expandir a ilha =====================
// Mostra só o pedaço de terra novo
function PreviaExpandir() {
  const terra = useRef(), aviso = useRef();
  const ultima = useRef(null);
  const vazia = useMemo(() => new THREE.BufferGeometry(), []);
  useEffect(() => () => terra.current?.geometry.dispose(), []);
  useFrame(() => {
    const p = mundo.ponteiro;
    const nova = expansaoPara(p);
    aviso.current.visible = !nova;
    terra.current.visible = !!nova;
    if (!nova) { posicionar(aviso.current, p.x, p.y); return; }
    const u = ultima.current;
    if (u && Math.abs(u.ang - nova.ang) < 0.005 && Math.abs(u.alt - nova.alt) < 1) return;
    ultima.current = nova;
    terra.current.geometry.dispose();
    terra.current.geometry = new THREE.ShapeGeometry(formaExpansao(nova));
  });
  return (
    <>
      <mesh ref={terra} geometry={vazia} material={translucido(AREIA, 0.7)} rotation={[Math.PI / 2, 0, 0]} position={[0, ALTURA.areia + 0.3, 0]} />
      <mesh ref={aviso} geometry={GEO.anel} material={translucido(ERRO, 0.9)} scale={12} />
    </>
  );
}

// ===================== Marcadores do jogador =====================
// Destino do toque, lugar de plantio/obra e ponto de aterro
function Marcadores() {
  const destino = useRef(), alvo = useRef();
  useFrame(() => {
    const { jogador } = mundo;
    const d = jogador.destino;
    destino.current.visible = !!d && !jogador.tarefa && !jogador.embarcado;
    if (destino.current.visible) posicionar(destino.current, d.x, d.y);
    const t = jogador.tarefa;
    const ponto = t && t.tipo === 'aterrar' ? { ...t.ponto, raio: 10 }
      : t && (t.tipo === 'plantar' || t.tipo === 'construir') && !jogador.acao ? t : null;
    alvo.current.visible = !!ponto;
    if (ponto) {
      posicionar(alvo.current, ponto.x, ponto.y);
      alvo.current.scale.setScalar(ponto.raio);
    }
  });
  return (
    <>
      <mesh ref={destino} geometry={GEO.anel} material={translucido('#ffffff', 0.7)} scale={8} />
      <mesh ref={alvo} geometry={GEO.anel} material={translucido('#ffffff', 0.85)} />
    </>
  );
}

export default function Previas() {
  const { ui, jogador } = useMundo();
  const { tipo, construcao } = ui.modo;
  const mostrar = !jogador.acao;
  const previa = useMemo(() => {
    if (tipo === 'plantar') return <PreviaPlantar />;
    if (tipo === 'construir') return <PreviaConstruir key={construcao} id={construcao} />;
    if (tipo === 'expandir') return <PreviaExpandir />;
    return null;
  }, [tipo, construcao]);
  return (
    <>
      {mostrar && previa}
      <Marcadores />
    </>
  );
}
