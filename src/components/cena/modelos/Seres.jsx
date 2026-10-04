import { animalAdulto } from '../../../game/animais.js';
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

// ===================== Animais =====================
// Modelo feito para raio 1 (quem chama escala pelo raio do animal). Frente virada para +X.
const CORES_ANIMAL = {
  ovelha:  { f: ['#f4f4ee', '#3a3a3a'], m: ['#d6cfbf', '#5a4a3a'] },
  vaca:    { f: ['#f5f5f5', '#f0d8d0'], m: ['#6b3e1e', '#55301a'] },
  galinha: { f: ['#fafafa', '#fafafa'], m: ['#c8642a', '#c8642a'] },
};

function Pernas({ cor }) {
  return [[0.6, 0.45], [0.6, -0.45], [-0.6, 0.45], [-0.6, -0.45]].map(([x, z]) => (
    <Peca key={`${x}${z}`} geo="cilindro" cor={cor} p={[x, 0.35, z]} s={[0.16, 0.7, 0.16]} />
  ));
}

function Chifres({ cor }) {
  return [-0.3, 0.3].map(z => (
    <Peca key={z} geo="cone" cor={cor} p={[1.25, 2.05, z]} s={[0.12, 0.5, 0.12]} r={[z > 0 ? 0.5 : -0.5, 0, -0.3]} />
  ));
}

export function Animal({ an }) {
  const [corpo, cabeca] = CORES_ANIMAL[an.especie][an.sexo];
  const macho = an.sexo === 'm';

  if (an.especie === 'galinha') {
    return (
      <group>
        <Peca geo="cilindro" cor="#f0b030" p={[0, 0.25, 0]} s={[0.1, 0.5, 0.1]} />
        <Peca geo="bola" cor={corpo} p={[0, 0.95, 0]} s={[0.95, 0.75, 0.7]} />
        {macho && <Peca geo="bola" cor="#1f5a3a" p={[-0.85, 1.45, 0]} s={[0.4, 0.75, 0.3]} r={[0, 0, 0.5]} />}
        <Peca geo="bola" cor={cabeca} p={[0.7, 1.6, 0]} s={0.5} />
        <Peca geo="bola" cor="#d62a2a" p={[0.7, 2.1, 0]} s={macho ? [0.35, 0.3, 0.12] : [0.2, 0.18, 0.1]} />
        <Peca geo="cone" cor="#f0b030" p={[1.25, 1.55, 0]} s={[0.15, 0.4, 0.15]} r={[0, 0, -Math.PI / 2]} />
      </group>
    );
  }

  return (
    <group>
      <Pernas cor={an.especie === 'vaca' ? '#4a3a30' : '#3a3a3a'} />
      <Peca geo="bola" cor={corpo} p={[0, 1.15, 0]} s={[1.3, 0.75, 0.8]} />
      {an.especie === 'ovelha' && [-0.55, 0, 0.55].map(x => (
        <Peca key={x} geo="bola" cor={corpo} p={[x, 1.65, 0]} s={0.5} />
      ))}
      {an.especie === 'vaca' && !macho && (
        <>
          <Peca geo="bola" cor="#2a2a2a" p={[-0.35, 1.25, 0.62]} s={[0.35, 0.3, 0.2]} sombra={false} />
          <Peca geo="bola" cor="#2a2a2a" p={[0.45, 1.05, -0.62]} s={[0.3, 0.25, 0.2]} sombra={false} />
        </>
      )}
      <Peca geo="bola" cor={cabeca} p={[1.2, 1.55, 0]} s={[0.55, 0.5, 0.45]} />
      {macho && animalAdulto(an) && <Chifres cor={an.especie === 'vaca' ? '#eeeeee' : '#a08a60'} />}
    </group>
  );
}
