import { DICAS } from '../game/config.js';
import { CONSTRUCOES } from '../game/construcoes.js';
import { useMundo } from '../hooks/useMundo.js';

// Dica de controles na parte de baixo da tela, conforme o modo atual
export default function Dica() {
  const { ui, jogador } = useMundo();
  const { tipo, construcao } = ui.modo;
  const texto = (tipo === 'construir' && CONSTRUCOES[construcao].dica) ||
    DICAS[tipo || (jogador.embarcado ? 'navegando' : 'normal')];
  return (
    <div className="pointer-events-none fixed bottom-[calc(12px_+_env(safe-area-inset-bottom,0px))] left-1/2 max-w-[calc(100%_-_24px)] -translate-x-1/2 rounded-md bg-black/45 px-3 py-1.5 text-center text-sm">
      {texto}
    </div>
  );
}
