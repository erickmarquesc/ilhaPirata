import { ICONES } from '../../game/config.js';
import { useMundo } from '../../hooks/useMundo.js';

const NOMES = { madeira: 'Madeira', sementes: 'Sementes', carne: 'Carne', peixe: 'Peixe', trigo: 'Trigo', sementesTrigo: 'Sem. trigo', tijolo: 'Tijolo', pedra: 'Pedra' };

// Custo listado um embaixo do outro: ícone, nome e quantidade (vermelho quando falta).
// "requisitos" entram como linhas iguais (ex.: 🧑 Filho 1).
export default function ListaCusto({ custo, requisitos = [], escuro = false }) {
  const { inventario } = useMundo();
  const linhas = [
    ...Object.entries(custo).map(([r, q]) => ({
      chave: r, icone: ICONES[r].split(' ')[0], rotulo: NOMES[r] ?? r, qtd: q, ok: inventario[r] >= q,
      dica: `Você tem ${inventario[r]}`,
    })),
    ...requisitos,
  ];
  return (
    <ul className={`m-0 w-full list-none rounded-md p-1 ${escuro ? 'bg-black/10' : 'bg-black/30'}`}>
      {linhas.map(l => (
        <li key={l.chave} title={l.dica} className="flex items-center gap-1 text-[12px] leading-snug">
          <span className="w-4 text-center">{l.icone}</span>
          <span className="flex-1 truncate text-left opacity-90">{l.rotulo}</span>
          <strong className={`tabular-nums [font-family:var(--font-jogo)] font-normal ${l.ok ? '' : 'text-[#ff8a7a]'}`}>
            {l.qtd}
          </strong>
        </li>
      ))}
    </ul>
  );
}
