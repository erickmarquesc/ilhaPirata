import { fecharPainel, painelValido } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import PainelAnimal from './paineis/PainelAnimal.jsx';
import PainelCampo from './paineis/PainelCampo.jsx';
import PainelEsposa from './paineis/PainelEsposa.jsx';
import PainelEstrutura from './paineis/PainelEstrutura.jsx';
import PainelFilho from './paineis/PainelFilho.jsx';
import PainelJangada from './paineis/PainelJangada.jsx';
import PainelTotem from './paineis/PainelTotem.jsx';
import Painel from './ui/Painel.jsx';

// Qual conteúdo mostrar para cada tipo de painel (mundo.ui.painel.tipo)
const PAINEIS = {
  totem: PainelTotem,
  esposa: PainelEsposa,
  filho: PainelFilho,
  animal: PainelAnimal,
  campo: PainelCampo,
  jangada: PainelJangada,
  estrutura: PainelEstrutura,
};

// Painel à direita que aparece ao tocar em algo do mundo
export default function PainelInteracao() {
  const { ui } = useMundo();
  if (!painelValido(ui.painel)) return null;
  const Conteudo = PAINEIS[ui.painel.tipo];
  return (
    <Painel
      destaque
      onFechar={fecharPainel}
      className="fixed top-[calc(12px_+_env(safe-area-inset-top,0px))] right-3 w-[min(260px,calc(100%_-_226px))] min-w-[170px]"
    >
      <Conteudo alvo={ui.painel.alvo} />
    </Painel>
  );
}
