import { createContext, useContext, useState } from 'react';
import { FASES, NOME_MAE, NOME_PAI } from '../game/config.js';
import { atividadeDe } from '../game/familia.js';
import { recursoPreferido } from '../game/montes.js';
import { abrirPainel } from '../game/ui.js';
import { useMundo } from '../hooks/useMundo.js';
import Moldura from './ui/Moldura.jsx';

// Árvore genealógica numa moldura de madeira e ouro (como Recursos e Construções):
// o casal em cima e os filhos pendurados numa corda dourada, em ordem de nascimento.
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
// Ligações em "corda" dourada, no tom das cantoneiras da moldura
const CORDA = 'bg-[#d9a441] shadow-[0_1px_0_#3b2210]';

function ArvoreFamilia({ children, titulo = 'Família' }) {
  const { ui } = useMundo();
  const [aberta, setAberta] = useState(true);
  return (
    <ArvoreContext.Provider value={{ selecionado: ui.painel?.alvo ?? (ui.painel?.tipo === 'esposa' ? 'esposa' : null) }}>
      <div className="pointer-events-auto max-w-[min(470px,calc(100vw_-_24px))] pt-3.5">
        <Moldura className={aberta ? '' : 'min-w-[220px] pb-1.5'}>
          <Moldura.Placa>{titulo}</Moldura.Placa>
          <Moldura.Acao onClick={() => setAberta(a => !a)}>{aberta ? 'Recolher' : 'Mostrar'}</Moldura.Acao>
          <Moldura.Corpo>
            {aberta && (
              // w-max + mx-auto: centraliza quando cabe e rola sem cortar quando a família cresce
              <div className="sem-barra overflow-x-auto pt-2 pb-1">
                <div className="mx-auto flex w-max flex-col items-center px-1">{children}</div>
              </div>
            )}
          </Moldura.Corpo>
        </Moldura>
      </div>
    </ArvoreContext.Provider>
  );
}

// Casal lado a lado com um coração no meio e a corda que desce para os filhos
function Casal({ children, comFilhos }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">{children}</div>
      {comFilhos && <span className={`h-3 w-[3px] rounded-full ${CORDA}`} />}
    </div>
  );
}

// Coração num medalhão de ouro entre o casal
function Coracao() {
  return (
    <span className="ouro flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[13px] leading-none text-[#c2185b] shadow-[0_2px_0_#3b2210]">
      ❤
    </span>
  );
}

// Filhos lado a lado, cada um pendurado na corda horizontal
function Filhos({ children }) {
  const lista = Array.isArray(children) ? children.flat().filter(Boolean) : [children];
  return (
    <div className="flex">
      {lista.map((filho, i) => {
        const unico = lista.length === 1;
        const horizontal = unico ? '' : i === 0 ? 'left-1/2 right-0' : i === lista.length - 1 ? 'left-0 right-1/2' : 'left-0 right-0';
        return (
          <div key={filho.key ?? i} className="relative flex flex-col items-center px-1 pt-3">
            {!unico && <span className={`absolute top-0 h-[3px] ${CORDA} ${horizontal}`} />}
            <span className={`absolute top-0 left-1/2 h-3 w-[3px] -translate-x-1/2 ${CORDA}`} />
            {filho}
          </div>
        );
      })}
    </div>
  );
}

// Um membro da família: retrato num medalhão (aro na cor da fase), nome dourado e o que
// está fazendo. "alvo" é o que abre o painel ao tocar; "pendente" desenha tracejado;
// "selo" é um emblema pequeno no canto do retrato.
function Membro({ icone, nome, detalhe, aro = '#d9a441', fase, selo, alvo, aoTocar, pendente = false }) {
  const { selecionado } = useContext(ArvoreContext);
  const ativo = alvo && selecionado === alvo;
  const conteudo = (
    <>
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-xl leading-none ${pendente ? 'border-dashed bg-black/20' : 'medalhao'}`}
        style={{ borderColor: pendente ? '#d9a44180' : aro }}
      >
        <span className={pendente ? 'opacity-60' : 'drop-shadow-[0_1px_0_rgb(0_0_0/0.5)]'}>{icone}</span>
        {selo && (
          <span className="ouro absolute -right-1.5 -bottom-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[10px] leading-none shadow-[0_1px_0_#3b2210]">
            {selo}
          </span>
        )}
      </span>
      <span className="texto-ouro mt-1 text-[13px] leading-tight font-normal whitespace-nowrap">{nome}</span>
      {fase && (
        <span className="mt-0.5 rounded-full px-1.5 text-[9px] leading-[14px] font-semibold tracking-wide text-white uppercase shadow-[0_1px_0_#3b2210]" style={{ backgroundColor: aro }}>
          {fase}
        </span>
      )}
      {detalhe && <span className="mt-0.5 max-w-full truncate text-[10px] leading-tight text-[#f3dcae] opacity-85">{detalhe}</span>}
    </>
  );
  const classe = [
    'flex w-[80px] flex-col items-center rounded-lg border-2 px-1 pt-1.5 pb-1 text-center transition',
    pendente ? 'border-dashed border-[#d9a441]/50 bg-black/15' : 'carta-madeira border-[#9a7040]',
    ativo ? 'border-[#ffd75e] shadow-[0_0_0_2px_#ffd75e,0_0_12px_rgb(255_215_94/0.7)]' : '',
  ].join(' ');
  if (!aoTocar) return <div className={classe} title={detalhe}>{conteudo}</div>;
  return (
    <button
      type="button"
      onClick={aoTocar}
      title={detalhe}
      className={`${classe} cursor-pointer hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      {conteudo}
    </button>
  );
}

ArvoreFamilia.Casal = Casal;
ArvoreFamilia.Coracao = Coracao;
ArvoreFamilia.Filhos = Filhos;
ArvoreFamilia.Membro = Membro;

// Árvore montada a partir do mundo do jogo
const ARO_FASE = { crianca: '#4aa3d9', adolescente: '#2e9c84', adulto: '#2b5fa8' };
const NOME_FASE = { crianca: 'Criança', adolescente: 'Adolescente', adulto: 'Adulto' };
const SELO_RECURSO = { pedra: '🪨', barro: '🧱' };

export function FamiliaDoJogo() {
  const { agentes, esposa } = useMundo();
  const filhos = agentes.filter(a => FASES[a.tipo]);
  const bebe = esposa && esposa.cuidado > 0;
  const gravida = esposa && esposa.gravidez > 0;
  const temFilhos = filhos.length > 0 || bebe || gravida;

  return (
    <ArvoreFamilia>
      <ArvoreFamilia.Casal comFilhos={temFilhos}>
        <ArvoreFamilia.Membro icone="🧑‍🦰" nome={NOME_PAI} detalhe="Você" aro="#d9822b" />
        <ArvoreFamilia.Coracao />
        {esposa ? (
          <ArvoreFamilia.Membro
            icone="👩"
            nome={NOME_MAE}
            detalhe={atividadeDe(esposa)}
            aro="#e0609d"
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
              fase={NOME_FASE[f.tipo]}
              detalhe={atividadeDe(f)}
              aro={ARO_FASE[f.tipo]}
              selo={f.tipo === 'adulto' ? SELO_RECURSO[recursoPreferido(f)] : null}
              alvo={f}
              aoTocar={() => abrirPainel('filho', f)}
            />
          ))}
          {bebe && <ArvoreFamilia.Membro key="bebe" icone="👶" nome="Bebê" detalhe={`criança em ${Math.ceil(esposa.cuidado)}s`} aro="#f3dcae" />}
          {gravida && <ArvoreFamilia.Membro key="gravidez" icone="🤰" nome="A caminho" detalhe={`nasce em ${Math.ceil(esposa.gravidez)}s`} pendente />}
        </ArvoreFamilia.Filhos>
      )}
    </ArvoreFamilia>
  );
}

export default ArvoreFamilia;
