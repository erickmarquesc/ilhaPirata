import Dica from './components/Dica.jsx';
import { HudPadrao } from './components/Hud.jsx';
import PainelInteracao from './components/PainelInteracao.jsx';
import TelaJogo from './components/TelaJogo.jsx';
import { useTeclado } from './hooks/useTeclado.js';

export default function App() {
  useTeclado();
  return (
    <>
      <TelaJogo />
      <HudPadrao />
      <PainelInteracao />
      <Dica />
    </>
  );
}
