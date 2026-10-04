import { CUSTO_EXPANSAO } from '../game/config.js';
import { temRecursos } from '../game/inventario.js';
import { alternarExpandir, alternarPlantar } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import { FamiliaDoJogo } from './ArvoreFamilia.jsx';
import CartasConstrucao from './CartasConstrucao.jsx';
import Inventario from './Inventario.jsx';
import Custo from './ui/Custo.jsx';
import Flamula from './ui/Flamula.jsx';

// Coluna à esquerda: recursos em cima, família no meio, construções embaixo.
//
// <Hud>
//   <Hud.Topo>...</Hud.Topo>
//   <Hud.Meio>...</Hud.Meio>
//   <Hud.Base>...</Hud.Base>
// </Hud>
function Hud({ children }) {
  return (
    <div className="pointer-events-none fixed top-[calc(12px_+_env(safe-area-inset-top,0px))] bottom-[calc(12px_+_env(safe-area-inset-bottom,0px))] left-3 flex flex-col items-start gap-2">
      {children}
    </div>
  );
}
function Topo({ children }) {
  return <div className="pointer-events-auto shrink-0">{children}</div>;
}
// O meio ocupa o espaço que sobra e centraliza a árvore entre os dois menus
function Meio({ children }) {
  return <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">{children}</div>;
}
function Base({ children }) {
  return <div className="shrink-0">{children}</div>;
}

function BotaoPlantar() {
  const { ui, inventario } = useMundo();
  const plantando = ui.modo.tipo === 'plantar';
  return (
    <Flamula
      cor="verde"
      ativo={plantando}
      disabled={inventario.sementes <= 0}
      onClick={alternarPlantar}
      icone="🌱"
      rotulo={plantando ? 'Plantando' : 'Plantar'}
      detalhe="tecla P"
    />
  );
}

function BotaoExpandir() {
  const { ui, jogador } = useMundo();
  const expandindo = ui.modo.tipo === 'expandir';
  return (
    <Flamula
      cor="roxa"
      ativo={expandindo}
      disabled={!temRecursos(CUSTO_EXPANSAO) || !!jogador.embarcado}
      onClick={alternarExpandir}
      icone="🏝️"
      rotulo={expandindo ? 'Expandindo' : 'Expandir'}
      detalhe={<>X · <Custo custo={CUSTO_EXPANSAO} /></>}
    />
  );
}

Hud.Topo = Topo;
Hud.Meio = Meio;
Hud.Base = Base;
Hud.BotaoPlantar = BotaoPlantar;
Hud.BotaoExpandir = BotaoExpandir;

// HUD padrão do jogo, montado com as peças acima
export function HudPadrao() {
  const { animais } = useMundo();
  return (
    <Hud>
      <Hud.Topo>
        <Inventario>
          <Inventario.Grade>
            <Inventario.Item recurso="madeira" icone="🪵" rotulo="Madeira" />
            <Inventario.Item recurso="sementes" icone="🌱" rotulo="Sementes" />
            <Inventario.Item recurso="tijolo" icone="🧱" rotulo="Tijolo" />
            <Inventario.Item recurso="pedra" icone="🪨" rotulo="Pedra" />
            <Inventario.Item recurso="carne" icone="🍖" rotulo="Carne" />
            <Inventario.Item recurso="peixe" icone="🐟" rotulo="Peixe" />
            <Inventario.Item recurso="trigo" icone="🌾" rotulo="Trigo" />
            <Inventario.Item recurso="sementesTrigo" icone="🌾" rotulo="Sem. de trigo" />
            <Inventario.Item icone="🐾" rotulo="Animais" valor={animais.length} />
          </Inventario.Grade>
          <Inventario.Estoque />
          <Inventario.Rodape>
            <Hud.BotaoPlantar />
            <Hud.BotaoExpandir />
          </Inventario.Rodape>
        </Inventario>
      </Hud.Topo>
      <Hud.Meio>
        <FamiliaDoJogo />
      </Hud.Meio>
      <Hud.Base>
        <CartasConstrucao />
      </Hud.Base>
    </Hud>
  );
}

export default Hud;
