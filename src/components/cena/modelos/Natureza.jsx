import { forwardRef } from 'react';
import { material } from '../materiais.jsx';
import { GEO } from '../Peca.jsx';

// ===================== Pinheiro =====================
// Modelo feito para raio 16. As copas ficam acessíveis pelo ref para trocar a cor
// (muda nova, árvore alvo do jogador).
export const COR_COPA = { adulta: ['#2f7a2e', '#3f9a3a'], nova: ['#6fbf4a', '#86d15c'], alvo: ['#4aa83f', '#5cc24e'] };

export const Pinheiro = forwardRef(function Pinheiro(_, copasRef) {
  const [escura, clara] = COR_COPA.adulta;
  const camadas = [
    { r: 13, h: 15, y: 13, cor: escura },
    { r: 10, h: 13, y: 21, cor: clara },
    { r: 6.5, h: 11, y: 28, cor: escura },
  ];
  return (
    <group>
      <mesh geometry={GEO.cilindro} material={material('#6b4423')} position={[0, 4, 0]} scale={[2.2, 8, 2.2]} castShadow />
      {camadas.map((c, i) => (
        <mesh
          key={i}
          ref={el => { if (copasRef) copasRef.current[i] = el; }}
          geometry={GEO.cone}
          material={material(c.cor)}
          position={[0, c.y, 0]}
          scale={[c.r, c.h, c.r]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
});

// ===================== Árvore da chuva =====================
// Nasce quando chove: tronco alto e copa redonda em bolas azul-turquesa (bem diferente do pinheiro).
// Também feita para raio 16, com as copas no ref como o pinheiro.
export const COR_COPA_CHUVA = { adulta: ['#1f7f8a', '#3fb5b0'], nova: ['#7fd8d0', '#a3eade'], alvo: ['#2f9fa8', '#5ad3ca'] };

export const ArvoreDaChuva = forwardRef(function ArvoreDaChuva(_, copasRef) {
  const [escura, clara] = COR_COPA_CHUVA.adulta;
  const bolas = [
    { p: [0, 25, 0], r: 11, cor: escura },
    { p: [-8, 21, 3], r: 7.5, cor: clara },
    { p: [7, 22, -3], r: 8, cor: escura },
    { p: [1, 32, -1], r: 6.5, cor: clara },
  ];
  return (
    <group>
      <mesh geometry={GEO.tronco} material={material('#d8cfc0')} position={[0, 8, 0]} scale={[2.4, 16, 2.4]} castShadow />
      <mesh geometry={GEO.tronco} material={material('#d8cfc0')} position={[-4, 17, 1.5]} rotation={[0, 0, 0.7]} scale={[1, 9, 1]} castShadow />
      <mesh geometry={GEO.tronco} material={material('#d8cfc0')} position={[3.5, 17, -1.5]} rotation={[0, 0, -0.6]} scale={[1, 8, 1]} castShadow />
      {bolas.map((b, i) => (
        <mesh
          key={i}
          ref={el => { if (copasRef) copasRef.current[i] = el; }}
          geometry={GEO.bolaLisa}
          material={material(b.cor)}
          position={b.p}
          scale={b.r}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
});
