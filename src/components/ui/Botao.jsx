// Botão com borda colorida; quando "ativo" fica preenchido com a cor.
//
// <Botao cor="obra" ativo={...} onClick={...}>
//   <Botao.Nome>🛖 Cabana</Botao.Nome>
//   <Botao.Detalhe>300 🪵</Botao.Detalhe>
//   <Botao.Detalhe falta>Precisa de um filho</Botao.Detalhe>
// </Botao>
const CORES = {
  planta: { borda: 'border-planta', fundo: 'bg-planta' },
  obra: { borda: 'border-obra', fundo: 'bg-obra' },
  amor: { borda: 'border-amor', fundo: 'bg-amor' },
};

function Botao({ cor = 'planta', ativo = false, className = '', children, ...props }) {
  const { borda, fundo } = CORES[cor];
  return (
    <button
      type="button"
      className={[
        'mt-1.5 block w-full cursor-pointer rounded-md border-2 px-2 py-1.5 text-left text-sm',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        borda,
        ativo ? `${fundo} font-semibold text-[#1b1b1b]` : 'bg-transparent text-white',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

function Nome({ children }) {
  return <span className="block font-semibold">{children}</span>;
}

function Detalhe({ children, falta = false }) {
  return <span className={`block text-[13px] opacity-90 ${falta ? 'text-falta' : ''}`}>{children}</span>;
}

Botao.Nome = Nome;
Botao.Detalhe = Detalhe;

export default Botao;
