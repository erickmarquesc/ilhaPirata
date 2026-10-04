import { ICONES, MONTES, QTD_POR_MONTE } from '../../game/config.js';
import { trabalhadorDo } from '../../game/montes.js';
import Painel from '../ui/Painel.jsx';

export default function PainelMonte({ alvo: monte }) {
  const { nome, icone, recurso } = MONTES[monte.tipo];
  const trabalhador = trabalhadorDo(monte);
  const porcento = Math.round(monte.restante / QTD_POR_MONTE * 100);
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>{icone} {nome}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>
        {monte.restante > 0
          ? <>Restam <strong>{monte.restante}</strong> {ICONES[recurso]} ({porcento}%).</>
          : <>Esgotado. Volta a ter {QTD_POR_MONTE} {ICONES[recurso]} em <strong>{Math.ceil(monte.recarga)}s</strong>.</>}
      </Painel.Texto>
      <div className="my-1.5 h-2 overflow-hidden rounded bg-white/15">
        <div className="h-full bg-obra" style={{ width: `${porcento}%` }} />
      </div>
      <Painel.Texto>
        {trabalhador
          ? `⛏️ ${trabalhador.nome} está coletando, 1 por vez.`
          : monte.restante > 0
            ? 'Ninguém trabalhando. Um filho adulto livre vem coletar (só 1 por monte).'
            : 'Enquanto se recompõe, ninguém coleta aqui.'}
      </Painel.Texto>
    </>
  );
}
