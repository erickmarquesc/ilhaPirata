import Peca from '../Peca.jsx';

// ===================== Montes de recursos =====================
// Modelos feitos para raio 20; quem chama escala conforme o que resta no monte.

// Monte de barro com uns tijolos já moldados ao lado
export function MonteBarro() {
  return (
    <group>
      <Peca geo="bola" cor="#9c5530" p={[0, 3, 0]} s={[20, 9, 17]} />
      <Peca geo="bola" cor="#b0663a" p={[-6, 8, -2]} s={[11, 8, 10]} r={[0, 0.6, 0]} />
      <Peca geo="bola" cor="#8a4a28" p={[7, 7, 3]} s={[9, 6, 8]} r={[0, 1.2, 0]} />
      <Peca geo="bola" cor="#c27a48" p={[1, 12, 0]} s={[6, 5, 6]} />
      {/* tijolos empilhados */}
      <group position={[16, 0, 12]} rotation={[0, -0.4, 0]}>
        {[[-3, 1.2, 0], [3, 1.2, 0], [0, 3.6, 0]].map((p, i) => (
          <Peca key={i} cor={i === 2 ? '#c4553a' : '#b84a2e'} p={p} s={[5.6, 2.4, 3]} />
        ))}
      </group>
    </group>
  );
}

// Pilha de pedras de vários tamanhos
const PEDRAS = [
  [0, 6, 0, 13, '#9aa0a6', 0.3], [-10, 4, 4, 8, '#b8bec4', 1.1], [10, 4, -3, 9, '#7d848b', 2],
  [4, 3.5, 11, 6, '#aab0b6', 0.7], [-7, 3, -10, 7, '#8c9298', 2.6], [2, 13, -2, 7, '#c3c9ce', 1.7],
];
export function MontePedra() {
  return (
    <group>
      {PEDRAS.map(([x, y, z, t, cor, giro], i) => (
        <Peca key={i} geo="rocha" cor={cor} p={[x, y, z]} s={[t, t * 0.8, t]} r={[0.2, giro, 0.1]} />
      ))}
    </group>
  );
}

export const MODELOS_MONTE = { barro: MonteBarro, pedra: MontePedra };
