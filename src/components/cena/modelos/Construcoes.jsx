import { Cabana } from './Cabana.jsx';
import { Cercado, MODELOS_CERCADO } from './Cercados.jsx';
import { Jangada } from './Embarcacoes.jsx';
import { Moinho } from './Moinho.jsx';
import { Totem } from './Totem.jsx';
import { Trigal } from './Trigal.jsx';

// Todos os modelos recebem "progresso" (0..1) para mostrar a obra subindo.
// A origem é o centro da base; +Z aponta para a câmera.

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
