import * as THREE from 'three';
import { ILHA } from '../../game/config.js';
import { dentroDaIlha, raioIlha } from '../../game/ilha.js';

// Mundo do jogo (x, y) → cena 3D (X, altura, Z). O centro da ilha fica na origem.
export const ALTURA = { agua: 0, areia: 2, grama: 3.5 };
export const RECUO_GRAMA = 45;

export function paraCena(x, y, h = 0) { return [x - ILHA.x, h, y - ILHA.y]; }
export function doMundo(X, Z) { return { x: X + ILHA.x, y: Z + ILHA.y }; }

// Altura do chão num ponto do mundo (mar, areia ou grama)
export function alturaDoChao(x, y) {
  if (dentroDaIlha(x, y, RECUO_GRAMA)) return ALTURA.grama;
  if (dentroDaIlha(x, y)) return ALTURA.areia;
  return ALTURA.agua;
}

// Contorno da ilha como THREE.Shape (no plano X/Z, ver Terreno)
export function contornoIlha(recuo, extras = [], passos = 240) {
  const pts = [];
  for (let i = 0; i < passos; i++) {
    const a = i / passos * Math.PI * 2, r = raioIlha(a, extras) - recuo;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
}
export function formaIlha(recuo, buraco = null, extras = []) {
  const forma = new THREE.Shape(contornoIlha(recuo, extras));
  if (buraco !== null) forma.holes.push(new THREE.Path(contornoIlha(buraco)));
  return forma;
}

// Só a faixa de terra que uma expansão acrescenta: costa nova por fora, costa atual por dentro
export function formaExpansao(nova, passos = 48) {
  const pts = [];
  const abertura = nova.larg * 3;
  for (let i = 0; i <= passos; i++) {
    const a = nova.ang - abertura + 2 * abertura * i / passos, r = raioIlha(a, [nova]);
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  for (let i = passos; i >= 0; i--) {
    const a = nova.ang - abertura + 2 * abertura * i / passos, r = raioIlha(a) - 1;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return new THREE.Shape(pts);
}

// Id estável para objetos do mundo (usado como key no React)
const ids = new WeakMap();
let proximoId = 0;
export function idDe(obj) {
  let id = ids.get(obj);
  if (!id) { id = ++proximoId; ids.set(obj, id); }
  return id;
}
