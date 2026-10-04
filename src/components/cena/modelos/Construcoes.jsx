import * as THREE from 'three';
import { useMaterial } from '../materiais.jsx';
import Peca from '../Peca.jsx';
import { Cabana } from './Cabana.jsx';
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

// ===================== Cercados (galinheiro, curral, pasto) =====================
function pontoDaCerca(i, porLado, h) {
  const lado = Math.floor(i / porLado), f = (i % porLado) / porLado;
  if (lado === 0) return [-h + f * 2 * h, -h];
  if (lado === 1) return [h, -h + f * 2 * h];
  if (lado === 2) return [h - f * 2 * h, h];
  return [-h, h - f * 2 * h];
}

export function Cercado({ h, corChao, detalhe = null, progresso = 1, children }) {
  const porLado = Math.max(4, Math.round(h / 9)), total = porLado * 4;
  const visiveis = Math.min(Math.ceil(total * progresso), total);
  const estacas = Array.from({ length: visiveis + 1 }, (_, i) => pontoDaCerca(i % total, porLado, h));
  return (
    <group>
      <Peca cor={corChao} p={[0, 0.4, 0]} s={[h * 2, 0.8, h * 2]} sombra={false} />
      {estacas.slice(0, visiveis).map(([x, z], i) => (
        <Peca key={i} cor="#5a3a1c" p={[x, 4, z]} s={[2.6, 8, 2.6]} />
      ))}
      {estacas.slice(1).map(([x2, z2], i) => {
        const [x1, z1] = estacas[i];
        const len = Math.hypot(x2 - x1, z2 - z1);
        return (
          <group key={i} position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} rotation={[0, -Math.atan2(z2 - z1, x2 - x1), 0]}>
            <Peca cor="#8a6436" p={[0, 6, 0]} s={[len, 1.4, 1.2]} />
            <Peca cor="#8a6436" p={[0, 3, 0]} s={[len, 1.4, 1.2]} />
          </group>
        );
      })}
      {progresso >= 1 && detalhe === 'casinha' && (
        <group position={[0, 0, -h + 12]}>
          <Peca cor="#9a6532" p={[0, 6, 0]} s={[20, 12, 14]} />
          <Peca geo="telhado" cor="#c0392b" p={[0, 17, 0]} s={[17, 10, 13]} />
        </group>
      )}
      {progresso >= 1 && detalhe === 'cocho' && (
        <group position={[0, 0, h - 12]}>
          <Peca cor="#6b4423" p={[0, 2.5, 0]} s={[24, 5, 7]} />
          <Peca cor="#d9c050" p={[0, 5.2, 0]} s={[20, 0.6, 4.5]} sombra={false} />
        </group>
      )}
      {children}
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
  galinheiro: props => <Cercado h={34} corChao="#b89a62" detalhe="casinha" {...props} />,
  curral: props => <Cercado h={44} corChao="#a88a55" detalhe="cocho" {...props} />,
  pasto: props => <Cercado h={56} corChao="#7fbf55" detalhe="cocho" {...props} />,
  campoTrigo: CampoTrigo,
};
