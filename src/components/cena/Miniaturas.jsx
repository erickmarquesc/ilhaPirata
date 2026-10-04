import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { advance, createRoot, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTRUCOES } from '../../game/construcoes.js';
import { criarCanteiros } from '../../game/trigo.js';
import { MODELOS } from './modelos/Construcoes.jsx';

// ===================== Miniaturas das construções =====================
// Renderiza o modelo 3D de cada construção (por nível) uma única vez num canvas
// invisível e guarda como imagem, para usar nas cartas do menu.
// useMiniatura(tipo, nivel) devolve a URL da imagem (ou null enquanto gera).

const TAMANHO = 192;
const cache = new Map();      // chave → dataURL
const pedidos = [];           // fila de chaves para gerar
const pendentes = new Set();  // pedidas e ainda não prontas (evita pedir duas vezes)
const ouvintes = new Set();
let versao = 0;
let ocupado = false;
let raiz = null, canvas = null;

function avisar() { versao++; ouvintes.forEach(f => f()); }
function assinar(f) { ouvintes.add(f); return () => ouvintes.delete(f); }
function obterVersao() { return versao; }

// Campo de trigo de mentira, com canteiros em vários estágios, para a miniatura
function campoDeExemplo() {
  const est = { x: 0, y: 0, raio: CONSTRUCOES.campoTrigo.raio, nivel: 1 };
  est.canteiros = criarCanteiros(est);
  est.canteiros.forEach((k, i) => { k.estado = i % 3 === 0 ? 'crescendo' : 'maduro'; k.idade = 30; });
  return est;
}

// Enquadra o modelo: câmera de frente-direita-cima, cabendo inteiro na imagem
function Enquadrar({ children }) {
  const grupo = useRef();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const esfera = new THREE.Box3().setFromObject(grupo.current).getBoundingSphere(new THREE.Sphere());
    const dir = new THREE.Vector3(0.6, 0.7, 1).normalize();
    const dist = esfera.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.92;
    camera.position.copy(esfera.center).addScaledVector(dir, dist);
    camera.near = dist / 20; camera.far = dist * 10;
    camera.lookAt(esfera.center);
    camera.updateProjectionMatrix();
  });
  return <group ref={grupo}>{children}</group>;
}

function Retrato({ tipo, nivel }) {
  const Modelo = MODELOS[tipo];
  const est = tipo === 'campoTrigo' ? campoDeExemplo() : { nivel };
  return (
    <>
      <hemisphereLight args={['#fff6e6', '#6a5a40', 1.6]} />
      <directionalLight position={[60, 120, 80]} intensity={2.2} color="#fff1d6" />
      <Enquadrar>
        <Modelo est={est} />
      </Enquadrar>
    </>
  );
}

async function prepararRaiz() {
  if (raiz) return;
  canvas = document.createElement('canvas');
  canvas.width = canvas.height = TAMANHO;
  raiz = createRoot(canvas);
  await raiz.configure({
    size: { width: TAMANHO, height: TAMANHO, top: 0, left: 0 },
    dpr: 1,
    flat: true,
    frameloop: 'never',
    gl: { alpha: true, antialias: true, preserveDrawingBuffer: true },
    camera: { fov: 30 },
  });
}

const esperar = ms => new Promise(r => setTimeout(r, ms));

async function processarFila() {
  if (ocupado) return;
  ocupado = true;
  try {
    await prepararRaiz();
    while (pedidos.length) {
      const chave = pedidos.shift();
      const [tipo, nivel] = chave.split(':');
      raiz.render(<Retrato key={chave} tipo={tipo} nivel={Number(nivel)} />);
      await esperar(40);                         // deixa o React montar a cena
      for (let i = 0; i < 3; i++) advance(performance.now() + i * 16);
      cache.set(chave, canvas.toDataURL('image/png'));
      pendentes.delete(chave);
      avisar();
    }
  } finally {
    ocupado = false;
  }
}

export function useMiniatura(tipo, nivel = 1) {
  useSyncExternalStore(assinar, obterVersao);
  const chave = `${tipo}:${nivel}`;
  if (!cache.has(chave) && !pendentes.has(chave)) {
    pendentes.add(chave);
    pedidos.push(chave);
    queueMicrotask(processarFila);
  }
  return cache.get(chave) ?? null;
}
