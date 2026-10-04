// Flâmula de tecido pendurada (botão), como as bandeirinhas dos menus de jogo.
// Ativa: desce um pouco e brilha. Desabilitada: desbotada.
const CORES = {
  verde: 'from-[#7ccf4a] to-[#3f8a24]',
  roxa: 'from-[#a67be0] to-[#5f3a9c]',
  vermelha: 'from-[#e8584a] to-[#9c2a22]',
};

export default function Flamula({ cor = 'verde', ativo = false, icone, rotulo, detalhe, className = '', ...props }) {
  return (
    <button
      type="button"
      className={[
        'group relative flex w-[92px] cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-white',
        'transition-transform duration-200 enabled:hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        ativo ? 'translate-y-1.5 drop-shadow-[0_0_8px_rgb(255_215_94/0.8)]' : 'drop-shadow-[0_3px_3px_rgb(0_0_0/0.45)]',
        className,
      ].join(' ')}
      {...props}
    >
      {/* barra de ouro de onde a flâmula pende */}
      <span className="ouro relative z-10 h-2 w-[86px] rounded-sm border" />
      <span
        className={`-mt-0.5 flex w-[80px] flex-col items-center bg-gradient-to-b pt-1.5 pb-4 ${CORES[cor]}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
      >
        <span className="text-lg leading-none">{icone}</span>
        <span className="texto-ouro mt-0.5 text-[13px] leading-tight">{rotulo}</span>
        {detalhe && <span className="text-[10px] leading-tight opacity-90">{detalhe}</span>}
      </span>
    </button>
  );
}
