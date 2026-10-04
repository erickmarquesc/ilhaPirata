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
