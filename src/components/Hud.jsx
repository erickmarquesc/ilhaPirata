import { resumoFilhos } from '../game/familia.js';
import { CUSTO_EXPANSAO } from '../game/config.js';
import { temRecursos } from '../game/inventario.js';
import { abrirMenu, alternarExpandir, alternarPlantar } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import Inventario from './Inventario.jsx';
import MenuConstrucoes from './MenuConstrucoes.jsx';
import Botao from './ui/Botao.jsx';
import Custo from './ui/Custo.jsx';

// Coluna fixa à esquerda: inventário, ações rápidas e menu de construções
function Hud({ children }) {
  return (
    <div className="fixed top-[calc(12px_+_env(safe-area-inset-top,0px))] left-3 flex w-[190px] flex-col gap-2">
      {children}
    </div>
  );
}

function textoFilhos() {
  const { adultos, adolescentes, criancas, bebe } = resumoFilhos();
  const partes = [];
  if (adultos) partes.push(adultos + ' 🧔');
  if (adolescentes) partes.push(adolescentes + ' 🧑');
  if (criancas) partes.push(criancas + ' 🧒');
  if (bebe) partes.push('1 👶');
  return partes.length ? partes.join(' ') : '0';
}

function BotaoPlantar() {
  const { ui, inventario } = useMundo();
  const plantando = ui.modo.tipo === 'plantar';
  return (
    <Botao cor="planta" ativo={plantando} disabled={inventario.sementes <= 0} onClick={alternarPlantar}>
      {plantando ? '🌱 Plantando... (P)' : '🌱 Plantar (P)'}
    </Botao>
  );
}

function BotaoExpandir() {
  const { ui, jogador } = useMundo();
  const expandindo = ui.modo.tipo === 'expandir';
  return (
    <Botao
      cor="areia"
      ativo={expandindo}
      disabled={!temRecursos(CUSTO_EXPANSAO) || !!jogador.embarcado}
      onClick={alternarExpandir}
    >
      {expandindo ? '🏝️ Expandindo... (X)' : '🏝️ Expandir ilha (X)'}
      <Botao.Detalhe><Custo custo={CUSTO_EXPANSAO} /></Botao.Detalhe>
    </Botao>
  );
}

function BotaoConstrucoes() {
  const { ui } = useMundo();
  return (
    <Botao cor="obra" ativo={ui.menuAberto} onClick={() => abrirMenu()}>
      🔨 Construções (C)
    </Botao>
  );
}

// HUD padrão do jogo, montado com as peças acima
export function HudPadrao() {
  const { esposa, animais } = useMundo();
  return (
    <Hud>
      <Inventario>
        <Inventario.Item recurso="madeira" icone="🪵" rotulo="Madeira" />
        <Inventario.Item recurso="sementes" icone="🌱" rotulo="Sementes" />
        <Inventario.Item recurso="carne" icone="🍖" rotulo="Carne" />
        <Inventario.Item recurso="peixe" icone="🐟" rotulo="Peixe" />
        <Inventario.Item recurso="trigo" icone="🌾" rotulo="Trigo" />
        <Inventario.Item recurso="sementesTrigo" icone="🌾" rotulo="Sementes de trigo" />
        <Inventario.Item recurso="tijolo" icone="🧱" rotulo="Tijolo" />
        <Inventario.Item recurso="pedra" icone="🪨" rotulo="Pedra" />
        <Inventario.Separador />
        <Inventario.Item icone="👩" rotulo="Esposa" valor={esposa ? 'sim' : '—'} />
        <Inventario.Item icone="🧒" rotulo="Filhos" valor={textoFilhos()} />
        <Inventario.Item icone="🐾" rotulo="Animais" valor={animais.length} />
        <Inventario.Rodape>
          <Hud.BotaoPlantar />
          <Hud.BotaoExpandir />
          <Hud.BotaoConstrucoes />
        </Inventario.Rodape>
      </Inventario>
      <MenuConstrucoes />
    </Hud>
  );
}

Hud.BotaoPlantar = BotaoPlantar;
Hud.BotaoExpandir = BotaoExpandir;
Hud.BotaoConstrucoes = BotaoConstrucoes;

export default Hud;
