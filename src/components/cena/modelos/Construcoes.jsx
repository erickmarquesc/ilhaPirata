import * as THREE from 'three';
import { useMaterial } from '../materiais.jsx';
import Peca from '../Peca.jsx';
import { Cabana } from './Cabana.jsx';
import { Cercado, MODELOS_CERCADO } from './Cercados.jsx';
import { Moinho } from './Moinho.jsx';
import { Totem } from './Totem.jsx';
import { Trigal } from './Trigal.jsx';

// Todos os modelos recebem "progresso" (0..1) para mostrar a obra subindo.
// A origem é o centro da base; +Z aponta para a câmera.

// ===================== Jangada =====================
const formaVela = new THREE.Shape([new THREE.Vector2(2, 42), new THREE.Vector2(24, 14), new THREE.Vector2(2, 10)]);
const geoVela = new THREE.ShapeGeometry(formaVela);

// Troncos lado a lado, amarras, depois mastro e vela
export function Jangada({ progresso = 1 }) {
  const mat = useMaterial();
  const troncos = 6;
  const pTroncos = Math.min(progresso / 0.7, 1);
  const visiveis = Math.ceil(troncos * pTroncos);
  const pMastro = progresso > 0.7 ? Math.min((progresso - 0.7) / 0.3, 1) : 0;
  return (
    <group>
      {Array.from({ length: visiveis }, (_, i) => (
        <Peca key={i} geo="cilindro" cor={i % 2 ? '#a06a35' : '#8b5a2b'} p={[0, 2.4, -11 + i * 4.4]} s={[2.3, 54, 2.3]} r={[0, 0, Math.PI / 2]} />
      ))}
      {pTroncos >= 1 && [-19, 19].map(x => (
        <Peca key={x} cor="#d9c38a" p={[x, 4.6, 0]} s={[1.6, 1, 27]} sombra={false} />
      ))}
      {pMastro > 0 && <Peca geo="cilindro" cor="#5a3a1c" p={[0, 4 + 22 * pMastro, 0]} s={[1.4, 44 * pMastro, 1.4]} />}
      {pMastro >= 1 && (
        <mesh geometry={geoVela} material={mat('#efe6cf', true)} position={[0, 4, 0]} castShadow />
      )}
    </group>
  );
}

// ===================== Campo de trigo =====================
export function CampoTrigo({ progresso = 1, est = null }) {
  return (
    <Cercado h={46} corChao="#8a6a3a" progresso={progresso}>
      {est && progresso >= 1 && <Trigal est={est} />}
    </Cercado>
  );
}

// Qual modelo usar para cada tipo de construção
export const MODELOS = {
  totem: Totem,
  cabana: Cabana,
  jangada: Jangada,
  moinho: Moinho,
  ...MODELOS_CERCADO,
  campoTrigo: CampoTrigo,
};
