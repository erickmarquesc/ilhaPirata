import {
  adultosLivres, desembarcar, irEmbarcar, jangadaLivre, jangadaNaAgua, podeDesembarcar, prepararJangada,
} from '../../game/jangada.js';
import { useMundo } from '../../hooks/useMundo.js';
import Botao from '../ui/Botao.jsx';
import Painel from '../ui/Painel.jsx';

function BotaoDesembarcar({ jangada }) {
  return (
    <Botao cor="amor" disabled={!podeDesembarcar(jangada)} onClick={desembarcar}>
      🏝️ Desembarcar (E)
    </Botao>
  );
}

function Conteudo({ jangada }) {
  const { jogador } = useMundo();
  prepararJangada(jangada);

  if (jogador.embarcado === jangada) {
    if (jangada.tripulacao.length < 2) {
      return (
        <>
          <Painel.Texto>Esperando o filho adulto embarcar...</Painel.Texto>
          <Painel.Acoes><BotaoDesembarcar jangada={jangada} /></Painel.Acoes>
        </>
      );
    }
    return (
      <>
        <Painel.Texto>Navegando com seu filho. Pare em cima de um cardume para pescar.</Painel.Texto>
        <Painel.Texto>
          {podeDesembarcar(jangada) ? 'Vocês estão perto da praia.' : 'Cheguem perto da praia para desembarcar.'}
        </Painel.Texto>
        <Painel.Acoes><BotaoDesembarcar jangada={jangada} /></Painel.Acoes>
      </>
    );
  }
  if (!jangadaNaAgua(jangada)) return <Painel.Texto>Sendo empurrada para a água...</Painel.Texto>;
  if (jangada.reservadaPor === 'filhos') {
    return <Painel.Texto>Os filhos adultos estão usando a jangada para pescar.</Painel.Texto>;
  }
  const temFilho = adultosLivres().length > 0;
  return (
    <>
      <Painel.Texto>
        {temFilho
          ? 'Pronta no mar. Você e um filho adulto embarcam juntos.'
          : 'A jangada só navega com dois adultos. Você precisa de um filho adulto para ir junto.'}
      </Painel.Texto>
      <Painel.Acoes>
        <Botao cor="amor" disabled={!temFilho || !jangadaLivre(jangada)} onClick={() => irEmbarcar(jangada)}>
          ⛵ Embarcar (E)
        </Botao>
      </Painel.Acoes>
    </>
  );
}

export default function PainelJangada({ alvo: jangada }) {
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>🛶 Jangada · nível {jangada.nivel}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Conteudo jangada={jangada} />
    </>
  );
}
