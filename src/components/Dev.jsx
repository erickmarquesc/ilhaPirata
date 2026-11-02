import { CONSTRUCOES } from '../game/construcoes.js';
import { alternarDev, definirNivel, definirNivelDeTodas } from '../game/dev.js';
import { estruturaDoTipo, nivelMaximo } from '../game/estruturas.js';
import { useMundo } from '../hooks/useMundo.js';
import Painel from './ui/Painel.jsx';

// Botão "dev" no canto inferior direito (só no npm run dev, ver game/dev.js).
// Ligado: obras liberadas, sem custo e na hora, e o painel troca o nível das construções.
function BotaoNivel({ ativo, desabilitado, onClick, children }) {
  return (
    <button
      type="button"
      disabled={desabilitado}
      onClick={onClick}
      className={[
        'h-6 w-6 cursor-pointer rounded border text-xs disabled:cursor-not-allowed disabled:opacity-30',
        ativo ? 'border-obra bg-obra font-semibold text-[#1b1b1b]' : 'border-white/40 bg-transparent text-white',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Niveis({ atual, onEscolher, desabilitado = false }) {
  return (
    <span className="flex gap-1">
      {Array.from({ length: nivelMaximo() }, (_, i) => i + 1).map(n => (
        <BotaoNivel key={n} ativo={atual === n} desabilitado={desabilitado} onClick={() => onEscolher(n)}>{n}</BotaoNivel>
      ))}
    </span>
  );
}

function PainelDev({ semente }) {
  return (
    <Painel className="mb-2 w-[290px]">
      <Painel.Cabecalho><Painel.Titulo>🛠️ Modo dev</Painel.Titulo></Painel.Cabecalho>
      <Painel.Texto>Obras liberadas: sem custo, sem filhos, sem totem e prontas na hora.</Painel.Texto>
      <div className="mt-1 text-[13px]" title="Abra com ?semente=… para repetir este mapa">
        Semente: <span className="font-mono select-all">{semente}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-b border-white/20 pb-2 text-[13px]">
        <span className="font-semibold">Todas</span>
        <Niveis atual={null} onEscolher={definirNivelDeTodas} />
      </div>
      {Object.entries(CONSTRUCOES).map(([id, c]) => {
        const est = estruturaDoTipo(id);
        return (
          <div key={id} className="mt-1.5 flex items-center justify-between gap-2 text-[13px]">
            <span className={est ? '' : 'opacity-50'} title={est ? '' : 'Construa primeiro (pela carta)'}>
              {c.icone} {c.nome}
            </span>
            <Niveis atual={est?.nivel} desabilitado={!est} onEscolher={n => definirNivel(id, n)} />
          </div>
        );
      })}
    </Painel>
  );
}

export default function Dev() {
  const { dev, semente } = useMundo();
  if (!import.meta.env.DEV) return null;
  return (
    <div className="pointer-events-auto fixed right-3 bottom-[calc(12px_+_env(safe-area-inset-bottom,0px))] z-40 flex flex-col items-end">
      {dev && <PainelDev semente={semente} />}
      <button
        type="button"
        onClick={alternarDev}
        className={[
          'cursor-pointer rounded-md border-2 px-3 py-1 font-mono text-sm',
          dev ? 'border-obra bg-obra font-semibold text-[#1b1b1b]' : 'border-white/50 bg-black/65 text-white',
        ].join(' ')}
      >
        dev
      </button>
    </div>
  );
}
