// Moldura de madeira com borda e cantoneiras de ouro, no estilo dos menus de jogo.
//
// <Moldura>
//   <Moldura.Placa>Recursos</Moldura.Placa>
//   <Moldura.Acao onClick={...}>Recolher</Moldura.Acao>
//   <Moldura.Corpo>...</Moldura.Corpo>
// </Moldura>
function Moldura({ children, className = '' }) {
  return (
    <section
      className={`madeira relative rounded-xl border-[3px] border-[#3b2210] px-2.5 pt-5 pb-2.5 shadow-[inset_0_0_0_2px_#e3ad45,inset_0_0_0_4px_#4a2a12,0_6px_14px_rgb(0_0_0/0.45)] ${className}`}
    >
      <Cantoneiras />
      {children}
    </section>
  );
}

// Cantoneiras douradas com rebite nos quatro cantos
function Cantoneiras() {
  const cantos = [
    'top-[-3px] left-[-3px] rounded-tl-xl border-t-[5px] border-l-[5px]',
    'top-[-3px] right-[-3px] rounded-tr-xl border-t-[5px] border-r-[5px]',
    'bottom-[-3px] left-[-3px] rounded-bl-xl border-b-[5px] border-l-[5px]',
    'bottom-[-3px] right-[-3px] rounded-br-xl border-b-[5px] border-r-[5px]',
  ];
  const rebites = ['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'];
  return (
    <>
      {cantos.map(c => <span key={c} className={`pointer-events-none absolute h-5 w-5 border-[#f0bd4e] drop-shadow-[0_1px_0_#5a2e0c] ${c}`} />)}
      {rebites.map(r => <span key={r} className={`ouro pointer-events-none absolute h-1.5 w-1.5 rounded-full border ${r}`} />)}
    </>
  );
}

// Placa de ouro com o título, presa no alto da moldura
function Placa({ children }) {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
      <h2 className="ouro texto-gravado m-0 rounded-md border-2 px-4 py-0.5 text-[15px] leading-tight tracking-wide whitespace-nowrap shadow-[0_2px_0_#5a2e0c,0_3px_6px_rgb(0_0_0/0.4)]">
        {children}
      </h2>
    </div>
  );
}

// Botãozinho de ouro no canto superior direito da moldura
function Acao({ children, ...props }) {
  return (
    <button
      type="button"
      className="ouro texto-gravado absolute top-1.5 right-2 z-10 cursor-pointer rounded border px-1.5 py-0 text-[11px] leading-snug shadow-[0_1px_0_#5a2e0c] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-white"
      {...props}
    >
      {children}
    </button>
  );
}

function Corpo({ children }) {
  return <div className="relative">{children}</div>;
}

Moldura.Placa = Placa;
Moldura.Acao = Acao;
Moldura.Corpo = Corpo;

export default Moldura;
