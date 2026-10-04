import { DICAS } from '../game/config.js';
import { CONSTRUCOES } from '../game/construcoes.js';
import { useMundo } from '../hooks/useMundo.js';

// Dica de controles no topo da tela, entre o painel de recursos e o painel de interação
export default function Dica() {
  const { ui, jogador } = useMundo();
  const { tipo, construcao } = ui.modo;
  const texto = (tipo === 'construir' && CONSTRUCOES[construcao].dica) ||
    DICAS[tipo || (jogador.embarcado ? 'navegando' : 'normal')];
  return (
    <div className="pointer-events-none fixed top-[calc(12px_+_env(safe-area-inset-top,0px))] left-1/2 max-w-[min(520px,calc(100%_-_560px))] -translate-x-1/2 rounded-md bg-black/45 px-3 py-1.5 text-center text-[13px] max-md:hidden">
      {texto}
    </div>
  );
}
