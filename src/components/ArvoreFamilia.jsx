import { createContext, useContext, useState } from 'react';
import { FASES, NOME_MAE, NOME_PAI } from '../game/config.js';
import { atividadeDe } from '../game/familia.js';
import { abrirPainel } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';

// Árvore genealógica: o casal em cima e os filhos ligados por linhas, em ordem de nascimento.
//
// <ArvoreFamilia>
//   <ArvoreFamilia.Casal>
//     <ArvoreFamilia.Membro ... />  ❤  <ArvoreFamilia.Membro ... />
//   </ArvoreFamilia.Casal>
//   <ArvoreFamilia.Filhos>
//     <ArvoreFamilia.Membro ... />
//   </ArvoreFamilia.Filhos>
// </ArvoreFamilia>
const ArvoreContext = createContext(null);
const LINHA = 'border-white/35';

function ArvoreFamilia({ children, titulo = 'Família' }) {
  const { ui } = useMundo();
  const [aberta, setAberta] = useState(true);
  return (
    <ArvoreContext.Provider value={{ selecionado: ui.painel?.alvo ?? (ui.painel?.tipo === 'esposa' ? 'esposa' : null) }}>
      <section className="pointer-events-auto max-w-[min(470px,calc(100vw_-_24px))] rounded-lg bg-black/65 p-2">
        <header className="mb-1 flex items-center justify-between gap-3 px-0.5">
          <h2 className="m-0 text-[13px] font-semibold opacity-80">{titulo}</h2>
          <button
            type="button"
            onClick={() => setAberta(a => !a)}
            className="cursor-pointer rounded border-0 bg-white/10 px-1.5 py-0.5 text-[11px] text-white hover:bg-white/20"
          >
            {aberta ? 'Recolher' : 'Mostrar'}
          </button>
        </header>
        {aberta && (
          // w-max + mx-auto: centraliza quando cabe e rola sem cortar quando a família cresce
          <div className="overflow-x-auto pb-1">
            <div className="mx-auto flex w-max flex-col items-center px-1">{children}</div>
          </div>
        )}
      </section>
    </ArvoreContext.Provider>
  );
}

// Casal lado a lado com um coração no meio e a linha que desce para os filhos
function Casal({ children, comFilhos }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">{children}</div>
      {comFilhos && <span className={`h-3 border-l ${LINHA}`} />}
    </div>
  );
}

function Coracao() {
  return <span className="text-sm text-amor">❤</span>;
}

// Filhos lado a lado, cada um pendurado na linha horizontal
function Filhos({ children }) {
  const lista = Array.isArray(children) ? children.flat().filter(Boolean) : [children];
  return (
    <div className="flex">
      {lista.map((filho, i) => {
        const unico = lista.length === 1;
        const horizontal = unico ? '' : i === 0 ? 'left-1/2 right-0' : i === lista.length - 1 ? 'left-0 right-1/2' : 'left-0 right-0';
        return (
          <div key={filho.key ?? i} className="relative flex flex-col items-center px-1 pt-3">
            {!unico && <span className={`absolute top-0 border-t ${LINHA} ${horizontal}`} />}
            <span className={`absolute top-0 left-1/2 h-3 border-l ${LINHA}`} />
            {filho}
          </div>
        );
      })}
    </div>
  );
}

// Um membro da família. "alvo" é o que abre o painel ao tocar; "pendente" desenha tracejado.
function Membro({ icone, nome, detalhe, cor = 'border-white/30', alvo, aoTocar, pendente = false }) {
  const { selecionado } = useContext(ArvoreContext);
  const ativo = alvo && selecionado === alvo;
  const conteudo = (
    <>
      <span className="text-xl leading-none">{icone}</span>
      <span className="mt-0.5 text-[11px] leading-tight font-semibold whitespace-nowrap">{nome}</span>
      {detalhe && <span className="text-[10px] leading-tight whitespace-nowrap opacity-75">{detalhe}</span>}
    </>
  );
  const classe = [
    'flex w-[76px] flex-col items-center rounded-md border-2 px-1 py-1 text-center text-white',
    pendente ? 'border-dashed border-white/30 bg-transparent' : `${cor} bg-white/8`,
    ativo ? 'ring-2 ring-white' : '',
  ].join(' ');
  if (!aoTocar) return <div className={classe}>{conteudo}</div>;
  return (
    <button type="button" onClick={aoTocar} className={`${classe} cursor-pointer hover:bg-white/15`}>
      {conteudo}
    </button>
  );
}

ArvoreFamilia.Casal = Casal;
ArvoreFamilia.Coracao = Coracao;
ArvoreFamilia.Filhos = Filhos;
ArvoreFamilia.Membro = Membro;

// Árvore montada a partir do mundo do jogo
const COR_FASE = { crianca: 'border-[#4aa3d9]', adolescente: 'border-[#2e9c84]', adulto: 'border-[#2b5fa8]' };

export function FamiliaDoJogo() {
  const { agentes, esposa } = useMundo();
  const filhos = agentes.filter(a => FASES[a.tipo]);
  const bebe = esposa && esposa.cuidado > 0;
  const gravida = esposa && esposa.gravidez > 0;
  const temFilhos = filhos.length > 0 || bebe || gravida;

  return (
    <ArvoreFamilia>
      <ArvoreFamilia.Casal comFilhos={temFilhos}>
        <ArvoreFamilia.Membro icone="🧑‍🦰" nome={NOME_PAI} detalhe="Você" cor="border-[#d9822b]" />
        <ArvoreFamilia.Coracao />
        {esposa ? (
          <ArvoreFamilia.Membro
            icone="👩"
            nome={NOME_MAE}
            detalhe={atividadeDe(esposa)}
            cor="border-amor"
            alvo="esposa"
            aoTocar={() => abrirPainel('esposa')}
          />
        ) : (
          <ArvoreFamilia.Membro icone="❔" nome={NOME_MAE} detalhe="Peça no Totem" pendente />
        )}
      </ArvoreFamilia.Casal>
      {temFilhos && (
        <ArvoreFamilia.Filhos>
          {filhos.map(f => (
            <ArvoreFamilia.Membro
              key={f.nome}
              icone={FASES[f.tipo].icone}
              nome={f.nome}
              detalhe={atividadeDe(f)}
              cor={COR_FASE[f.tipo]}
              alvo={f}
              aoTocar={() => abrirPainel('filho', f)}
            />
          ))}
          {bebe && <ArvoreFamilia.Membro key="bebe" icone="👶" nome="Bebê" detalhe={`criança em ${Math.ceil(esposa.cuidado)}s`} cor="border-white/60" />}
          {gravida && <ArvoreFamilia.Membro key="gravidez" icone="🤰" nome="A caminho" detalhe={`nasce em ${Math.ceil(esposa.gravidez)}s`} pendente />}
        </ArvoreFamilia.Filhos>
      )}
    </ArvoreFamilia>
  );
}

export default ArvoreFamilia;
