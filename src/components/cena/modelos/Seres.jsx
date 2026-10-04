import Peca from '../Peca.jsx';

// ===================== Pessoas =====================
// Modelo feito para raio 10; quem chama aplica a escala (raio / 10).
// Frente virada para +Z.
const PELE = '#f2c79a';
const ROUPA = { jogador: '#d9822b', esposa: '#b5508a', adulto: '#2b5fa8', adolescente: '#2e9c84', crianca: '#4aa3d9' };

export function Pessoa({ a }) {
  const gravida = a.tipo === 'esposa' && a.gravidez > 0;
  const comBebe = a.tipo === 'esposa' && a.cuidado > 0;
  return (
    <group>
      <Peca geo="tronco" cor="#4a3426" p={[0, 3, 0]} s={[5, 6, 4]} />
      <Peca geo="tronco" cor={ROUPA[a.tipo]} p={[0, 11, 0]} s={[6, 10, 5]} />
      {gravida && <Peca geo="bola" cor={ROUPA.esposa} p={[0, 9.5, 3.5]} s={4.2} />}
      <Peca geo="bola" cor={PELE} p={[0, 20, 0]} s={5} />
      <Peca cor="#2a1a10" p={[-1.8, 20.6, 4.4]} s={[1, 1.4, 0.6]} sombra={false} />
      <Peca cor="#2a1a10" p={[1.8, 20.6, 4.4]} s={[1, 1.4, 0.6]} sombra={false} />
      {a.tipo === 'jogador' && (
        <>
          <Peca geo="cilindro" cor="#e6c56a" p={[0, 23.5, 0]} s={[8.5, 0.8, 8.5]} />
          <Peca geo="cone" cor="#e6c56a" p={[0, 26.5, 0]} s={[4.5, 5, 4.5]} />
        </>
      )}
      {a.tipo === 'esposa' && <Peca geo="bola" cor="#5a3418" p={[0, 22, -1.5]} s={[5.4, 4.6, 5]} />}
      {a.tipo === 'adulto' && <Peca geo="bola" cor="#6b4423" p={[0, 17.5, 2.8]} s={[3.6, 3, 2.4]} />}
      {a.tipo !== 'esposa' && a.tipo !== 'jogador' && <Peca geo="bola" cor="#6b4423" p={[0, 23, -0.8]} s={[4.8, 2.6, 4.6]} />}
      {comBebe && (
        <group position={[6, 12, 2]}>
          <Peca geo="bola" cor="#ffffff" s={3.2} />
          <Peca geo="bola" cor={PELE} p={[0, 2.8, 0]} s={2} />
        </group>
      )}
    </group>
  );
}
