import { createContext, useContext } from 'react';

// Caixa escura semitransparente usada no HUD e no painel de interação.
//
// <Painel onFechar={...}>
//   <Painel.Cabecalho>
//     <Painel.Titulo>Título</Painel.Titulo>
//     <Painel.Fechar />
//   </Painel.Cabecalho>
//   <Painel.Texto>...</Painel.Texto>
//   <Painel.Acoes>...</Painel.Acoes>
// </Painel>
const PainelContext = createContext({ onFechar: null, destaque: false });

function Painel({ children, onFechar = null, destaque = false, className = '', ...props }) {
  return (
    <PainelContext.Provider value={{ onFechar, destaque }}>
      <section className={`rounded-md bg-black/65 px-3 py-2 ${className}`} {...props}>
        {children}
      </section>
    </PainelContext.Provider>
  );
}

function Cabecalho({ children }) {
  return <header className="mb-1 flex items-center justify-between gap-2">{children}</header>;
}

function Titulo({ children }) {
  const { destaque } = useContext(PainelContext);
  return (
    <h2 className={`m-0 font-semibold ${destaque ? 'text-base' : 'text-[13px] opacity-80'}`}>
      {children}
    </h2>
  );
}

function Fechar() {
  const { onFechar } = useContext(PainelContext);
  if (!onFechar) return null;
  return (
    <button
      type="button"
      aria-label="Fechar"
      onClick={onFechar}
      className="cursor-pointer border-0 bg-transparent px-1 text-lg leading-none text-white"
    >
      ×
    </button>
  );
}

function Texto({ children }) {
  return <p className="my-1 text-sm leading-snug">{children}</p>;
}

function Acoes({ children }) {
  return <div>{children}</div>;
}

Painel.Cabecalho = Cabecalho;
Painel.Titulo = Titulo;
Painel.Fechar = Fechar;
Painel.Texto = Texto;
Painel.Acoes = Acoes;

export default Painel;
