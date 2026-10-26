import { useEffect, useRef } from 'react';
import { CONSTRUCOES } from '../game/construcoes.js';
import { fecharConquista } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import { useMiniatura } from './cena/Miniaturas.jsx';

// ===================== Construção concluída =====================
// Placa pirata de madeira que aparece quando uma construção fica pronta: tábuas com moldura
// de troncos amarrados com corda, caveira de bandana com sabre e duas bandeiras pretas no
// topo, placa "Construído!" com botões redondos, o modelo 3D da construção num quadro,
// para que serve e o que dá para fazer (em tábuas escuras, como botões de menu).
// O jogo fica pausado enquanto está aberto (ver jogo.js). OK, X, Enter, Espaço ou Esc fecham.
//
// A arte de cima fica num SVG (viewBox 340 x 150) por trás e outro pela frente da placa,
// que começa em y = 150 (espaçador com a mesma proporção); a placa do título fica
// no tronco de cima e a caveira apoiada sobre ela.

const CONTORNO = '#3b2210', OURO_ESCURO = '#8a5414', OSSO = '#f1e6cc';

function Gradientes() {
  return (
    <defs>
      <linearGradient id="cq-ouro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff0a8" />
        <stop offset="0.4" stopColor="#f5c84c" />
        <stop offset="0.75" stopColor="#d99a2b" />
        <stop offset="1" stopColor="#b07216" />
      </linearGradient>
      <linearGradient id="cq-lamina" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9aa6b0" />
        <stop offset="0.5" stopColor="#f4f8fb" />
        <stop offset="1" stopColor="#b8c3cc" />
      </linearGradient>
      <linearGradient id="cq-mastro" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4e2b13" />
        <stop offset="0.45" stopColor="#a06a35" />
        <stop offset="1" stopColor="#4e2b13" />
      </linearGradient>
      <radialGradient id="cq-cranio" cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset="0.6" stopColor={OSSO} />
        <stop offset="1" stopColor="#c9b48a" />
      </radialGradient>
      <linearGradient id="cq-bandana" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8463a" />
        <stop offset="1" stopColor="#a51d16" />
      </linearGradient>
      <linearGradient id="cq-pano" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3f4a" />
        <stop offset="1" stopColor="#15181e" />
      </linearGradient>
    </defs>
  );
}

// Sabre apontando para cima, com o cabo na origem
function Sabre({ transform }) {
  return (
    <g transform={transform}>
      <path d="M-4 -2 L-5 -95 Q-3 -128 10 -140 Q6 -110 5 -2 Z" fill="url(#cq-lamina)" stroke="#5f6b75" strokeWidth="1.2" />
      <path d="M0 -6 L-1 -100 Q0 -122 7 -133" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
      <path d="M-15 -3 Q0 7 15 -3 L15 2 Q0 12 -15 2 Z" fill="url(#cq-ouro)" stroke={OURO_ESCURO} strokeWidth="1" />
      <path d="M12 0 Q22 14 6 28" fill="none" stroke="url(#cq-ouro)" strokeWidth="3" />
      <rect x="-3.5" y="2" width="7" height="24" rx="2" fill="#6b3a1a" stroke={CONTORNO} strokeWidth="1" />
      <circle cy="29" r="4.5" fill="url(#cq-ouro)" stroke={OURO_ESCURO} strokeWidth="1" />
    </g>
  );
}

// Bandeira preta de caveira num mastro inclinado, tremulando. lado = -1 (esquerda) ou 1
function Bandeira({ x, lado }) {
  const s = lado; // o pano vai para fora
  const pano = o => `M0 0 C${s * 22} ${-6 + o} ${s * 40} ${8 - o} ${s * 66} ${2 + o} L${s * 64} ${46 + o} C${s * 40} ${52 - o} ${s * 22} ${38 + o} 0 44`;
  return (
    <g transform={`translate(${x} 150) rotate(${-lado * 14})`}>
      <rect x="-3.5" y="-146" width="7" height="150" rx="3" fill="url(#cq-mastro)" stroke={CONTORNO} strokeWidth="1.2" />
      <circle cx="0" cy="-148" r="5" fill="url(#cq-ouro)" stroke={OURO_ESCURO} strokeWidth="1" />
      <g transform="translate(0 -140)">
        <path d={pano(0)} fill="url(#cq-pano)" stroke="#0b0c10" strokeWidth="1.5" strokeLinejoin="round">
          <animate attributeName="d" dur="1.6s" repeatCount="indefinite" values={`${pano(0)};${pano(4)};${pano(0)}`} />
        </path>
        {/* caveirinha com ossos cruzados */}
        <g transform={`translate(${s * 33} 22)`} fill="#f4efe4">
          <g stroke="#f4efe4" strokeWidth="3" strokeLinecap="round">
            <path d="M-11 4 L11 14" />
            <path d="M11 4 L-11 14" />
          </g>
          <circle cy="-1" r="8" />
          <rect x="-4.5" y="4" width="9" height="5" rx="1.5" />
          <circle cx="-3" cy="-1" r="2.3" fill="#15181e" />
          <circle cx="3" cy="-1" r="2.3" fill="#15181e" />
        </g>
      </g>
    </g>
  );
}

// Atrás da placa: bandeiras e o sabre
function ArteDeTras() {
  return (
    <svg viewBox="0 0 340 150" className="pointer-events-none absolute top-0 left-0 z-0 w-full overflow-visible" aria-hidden>
      <Gradientes />
      <Bandeira x={78} lado={-1} />
      <Bandeira x={262} lado={1} />
      <Sabre transform="translate(240 112) rotate(-72) scale(1.3)" />
    </svg>
  );
}

// Na frente: caveira com bandana vermelha e brinco de ouro
function Caveira() {
  return (
    <svg viewBox="0 0 340 150" className="pointer-events-none absolute top-0 left-0 z-20 w-full overflow-visible" aria-hidden>
      <g transform="translate(0 -10)">
        {/* sombra */}
        <ellipse cx="170" cy="128" rx="42" ry="6" fill="#000" opacity="0.25" />
        {/* crânio e maxilar */}
        <path d="M128 76 C126 36 214 36 212 76 C212 92 204 100 198 104 L196 116 L144 116 L142 104 C136 100 128 92 128 76 Z" fill="url(#cq-cranio)" stroke={CONTORNO} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M146 112 L148 128 C160 133 180 133 192 128 L194 112 Z" fill="url(#cq-cranio)" stroke={CONTORNO} strokeWidth="2.5" strokeLinejoin="round" />
        {/* dentes */}
        <path d="M148 113 L192 113 M155 110 L155 124 M162 110 L162 127 M170 110 L170 128 M178 110 L178 127 M185 110 L185 124" stroke={CONTORNO} strokeWidth="1.5" />
        {/* olhos e nariz */}
        <ellipse cx="153" cy="84" rx="11" ry="12" fill="#2a1a10" />
        <ellipse cx="187" cy="84" rx="11" ry="12" fill="#2a1a10" />
        <circle cx="156" cy="81" r="2.2" fill="#ffcf6a" opacity="0.9" />
        <circle cx="190" cy="81" r="2.2" fill="#ffcf6a" opacity="0.9" />
        <path d="M170 94 L164 104 Q170 107 176 104 Z" fill="#2a1a10" />
        {/* rachadura */}
        <path d="M196 62 L190 70 L194 74" fill="none" stroke={CONTORNO} strokeWidth="1.3" />
        {/* bandana com bolinhas e nó do lado */}
        <path d="M126 70 C126 30 214 30 214 70 C196 60 144 60 126 70 Z" fill="url(#cq-bandana)" stroke={CONTORNO} strokeWidth="2.5" strokeLinejoin="round" />
        {[[146, 50], [166, 42], [188, 46], [204, 58], [136, 62], [176, 56], [156, 58]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="#ffe9e0" opacity="0.9" />
        ))}
        <path d="M210 60 C222 56 228 62 224 70 C218 72 212 68 210 60 Z" fill="url(#cq-bandana)" stroke={CONTORNO} strokeWidth="2" />
        <path d="M222 66 C236 70 240 82 244 92 C234 88 226 80 220 70 Z" fill="#c8302a" stroke={CONTORNO} strokeWidth="2" strokeLinejoin="round" />
        <path d="M224 62 C238 58 248 64 256 72 C244 74 232 70 224 66 Z" fill="#c8302a" stroke={CONTORNO} strokeWidth="2" strokeLinejoin="round" />
        {/* brinco de ouro */}
        <circle cx="129" cy="98" r="7" fill="none" stroke={OURO_ESCURO} strokeWidth="4.5" />
        <circle cx="129" cy="98" r="7" fill="none" stroke="url(#cq-ouro)" strokeWidth="3" />
      </g>
    </svg>
  );
}

// Tronco da moldura (horizontal ou vertical), com pontas arredondadas
function Tronco({ className, vertical = false }) {
  const grad = vertical
    ? 'bg-[linear-gradient(90deg,#4e2b13_0%,#9a6436_35%,#b07a44_50%,#7a4a24_75%,#4e2b13_100%)]'
    : 'bg-[linear-gradient(180deg,#b07a44_0%,#9a6436_30%,#7a4a24_70%,#4e2b13_100%)]';
  return <span className={`pointer-events-none absolute rounded-full border-2 border-[#3b2210] shadow-[0_3px_4px_rgb(0_0_0/0.45)] ${grad} ${className}`} />;
}

// Amarração de corda
function Corda({ className }) {
  return <span className={`conquista-corda pointer-events-none absolute z-10 h-[30px] w-[18px] rounded-[5px] border border-[#6b4a1e] ${className}`} />;
}

// Botão redondo de madeira com aro dourado (como os da placa do menu)
function BotaoRedondo({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={[
        'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[3px] border-[#3b2210]',
        'bg-[radial-gradient(circle_at_40%_30%,#d08a48,#8a4f22_70%)] text-[17px] text-[#ffe6b8] shadow-[inset_0_0_0_2px_#e3ad45,0_2px_0_#3b2210]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

// Faíscas douradas piscando em volta
const FAISCAS = [
  { l: '2%', t: '30%', s: 14, d: 0 }, { l: '92%', t: '26%', s: 18, d: 0.6 }, { l: '-3%', t: '62%', s: 12, d: 1.1 },
  { l: '97%', t: '58%', s: 14, d: 0.3 }, { l: '8%', t: '92%', s: 16, d: 0.9 }, { l: '88%', t: '90%', s: 12, d: 1.4 },
];
function Faiscas() {
  return FAISCAS.map((f, i) => (
    <span
      key={i}
      className="conquista-faisca pointer-events-none absolute z-30 bg-[#fff2b0] shadow-[0_0_8px_#ffd75e]"
      style={{
        left: f.l, top: f.t, width: f.s, height: f.s, animationDelay: `${f.d}s`,
        clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
      }}
    />
  ));
}

// Tábua escura (como os botões PLAY / HELP do modelo)
const TABUA_ESCURA = 'rounded-lg border-2 border-[#3b2210] bg-[linear-gradient(180deg,#8a4f26,#5c3016)] shadow-[inset_0_1px_0_rgb(255_210_160/0.35),inset_0_-2px_0_rgb(0_0_0/0.3),0_2px_0_rgb(59_34_16/0.8)]';
const TEXTO_CREME = 'text-[#ffe6b8] [font-family:var(--font-jogo)] [text-shadow:0_2px_0_#3b2210]';

export default function Conquista() {
  const { ui } = useMundo();
  const id = ui.conquista?.construcao;
  const imagem = useMiniatura(id ?? 'totem', 1);
  const ok = useRef();
  useEffect(() => { if (id) ok.current?.focus({ preventScroll: true }); }, [id]);
  if (!id) return null;
  const c = CONSTRUCOES[id];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conquista-titulo"
      className="conquista-fundo fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgb(40_60_40/0.55),rgb(8_14_10/0.82)_70%)] px-4 py-3"
    >
      <div className="conquista-raios" />
      <div className="max-h-full w-full overflow-y-auto py-2">
        <div className="conquista-entrada relative mx-auto w-[min(340px,100%)]">
          <div className="aspect-[340/150]" /> {/* espaço até o topo da placa (y = 150) */}
          <ArteDeTras />
          <Faiscas />

          {/* placa de tábuas com moldura de troncos */}
          <div className="relative z-10 mx-[14px] mb-4">
            <Tronco vertical className="top-1 -bottom-1 -left-[10px] w-[18px]" />
            <Tronco vertical className="top-1 -bottom-1 -right-[10px] w-[18px]" />
            <div className="conquista-tabuas relative rounded-[14px] border-[3px] border-[#3b2210] px-4 pt-10 pb-6 text-center shadow-[inset_0_0_0_2px_rgb(255_200_140/0.25),inset_0_0_18px_rgb(60_25_5/0.55),0_10px_16px_rgb(0_0_0/0.5)]">
              {/* placa do título com os botões redondos */}
              <div className="absolute -top-[22px] right-[-6px] left-[-6px] h-[46px]">
                <Tronco className="top-[8px] right-0 left-0 h-[22px]" />
                <Corda className="-top-1 left-[16%]" />
                <Corda className="-top-1 right-[16%]" />
                <div className="conquista-placa absolute top-0 left-1/2 z-10 flex h-[44px] w-[62%] -translate-x-1/2 items-center justify-center rounded-[10px] border-[3px] border-[#3b2210]">
                  <h2 id="conquista-titulo" className={`m-0 text-[21px] leading-none font-normal tracking-wide ${TEXTO_CREME}`}>CONSTRUÍDO!</h2>
                </div>
                <BotaoRedondo className="left-[2px] cursor-default" tabIndex={-1} aria-hidden>{c.icone}</BotaoRedondo>
                <BotaoRedondo className="right-[2px] [font-family:var(--font-jogo)]" onClick={fecharConquista} aria-label="Fechar">✕</BotaoRedondo>
              </div>

              {/* quadro com o modelo 3D */}
              <div className="mx-auto mt-1 flex h-[104px] w-[104px] items-center justify-center rounded-xl border-[3px] border-[#3b2210] bg-[radial-gradient(circle_at_50%_40%,#6b3f1f,#2e180a_80%)] shadow-[inset_0_0_0_2px_#e3ad45,inset_0_4px_8px_rgb(0_0_0/0.6),0_3px_0_#3b2210]">
                {imagem
                  ? <img src={imagem} alt="" draggable={false} className="h-[88px] w-[88px] object-contain drop-shadow-[0_3px_2px_rgb(0_0_0/0.5)]" />
                  : <span className="text-[40px]">{c.icone}</span>}
              </div>

              <p className={`m-0 mt-2.5 text-[14px] ${TEXTO_CREME}`}>Você construiu:</p>
              <p className="texto-ouro m-0 text-[24px] leading-tight">{c.nome}</p>
              <p className="m-0 mt-1 text-[13px] leading-snug font-semibold text-[#3b1e08] [text-shadow:0_1px_0_rgb(255_220_170/0.5)]">{c.descricao}</p>

              {c.uso?.length > 0 && (
                <>
                  <p className={`m-0 mt-2.5 text-[14px] ${TEXTO_CREME}`}>O que você pode fazer</p>
                  <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0 text-left">
                    {c.uso.map(u => (
                      <li key={u} className={`flex gap-1.5 px-2.5 py-1.5 text-[12.5px] leading-snug text-[#ffe6b8] ${TABUA_ESCURA}`}>
                        <span className="shrink-0 text-[#f0bd4e]">⚓</span>
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                ref={ok}
                type="button"
                onClick={fecharConquista}
                className={[
                  'conquista-botao mx-auto mt-3.5 block w-[56%] cursor-pointer py-1.5 text-[22px]',
                  TABUA_ESCURA, TEXTO_CREME,
                  'outline-offset-2 transition-transform hover:scale-105 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white',
                ].join(' ')}
              >
                OK
              </button>
            </div>
            {/* tronco de baixo com amarrações */}
            <Tronco className="-bottom-[12px] -left-[14px] -right-[14px] h-[22px]" />
            <Corda className="-bottom-[16px] left-[6%]" />
            <Corda className="-bottom-[16px] right-[6%]" />
          </div>

          <Caveira />
        </div>
      </div>
    </div>
  );
}
