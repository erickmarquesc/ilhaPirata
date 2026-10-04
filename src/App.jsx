import Cena from './components/cena/Cena.jsx';
import Dica from './components/Dica.jsx';
import { HudPadrao } from './components/Hud.jsx';
import PainelInteracao from './components/PainelInteracao.jsx';
import { useTeclado } from './hooks/useTeclado.js';

export default function App() {
  useTeclado();
  return (
    <>
      <Cena />
      <HudPadrao />
      <PainelInteracao />
      <Dica />
    </>
  );
}
