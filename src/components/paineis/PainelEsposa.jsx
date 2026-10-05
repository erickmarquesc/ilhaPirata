import { cabanaDaFamilia } from '../../game/cabana.js';
import { NOME_MAE } from '../../game/config.js';
import { namorar, podeNamorar } from '../../game/familia.js';
import { useMundo } from '../../hooks/useMundo.js';
import Botao from '../ui/Botao.jsx';
import Painel from '../ui/Painel.jsx';

function statusDaEsposa(esposa, namorando) {
  if (namorando) return esposa.dentro ? '💕 Namorando na cabana...' : '💕 Indo para a cabana namorar...';
  if (esposa.descanso > 0) return `⏳ Trabalhando. Pode ter outro filho em ${Math.ceil(esposa.descanso)}s.`;
  if (esposa.cuidado > 0) return `🍼 Cuidando do bebê na cabana. Sai com ele já criança em ${Math.ceil(esposa.cuidado)}s.`;
  if (esposa.gravidez > 0) return `🤰 Grávida. O bebê nasce em ${Math.ceil(esposa.gravidez)}s. Ela continua trabalhando.`;
  return 'Trabalhando: corta árvores e planta sementes.';
}

export default function PainelEsposa() {
  const { esposa, jogador, agentes } = useMundo();
  const namorando = jogador.tarefa?.tipo === 'namorar';
  const filhos = agentes.filter(a => a.tipo === 'crianca' || a.tipo === 'adolescente').length + (esposa.cuidado > 0 ? 1 : 0);
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>👩 {NOME_MAE}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>{statusDaEsposa(esposa, namorando)}</Painel.Texto>
      <Painel.Texto>Filhos: {filhos}</Painel.Texto>
      {!cabanaDaFamilia() && <Painel.Texto>🛖 Construam a cabana para terem o primeiro filho.</Painel.Texto>}
      <Painel.Acoes>
        <Botao cor="amor" disabled={!podeNamorar() || namorando || !!jogador.embarcado} onClick={namorar}>
          💕 Namorar
          {!cabanaDaFamilia() && <Botao.Detalhe>Precisa da cabana</Botao.Detalhe>}
        </Botao>
      </Painel.Acoes>
    </>
  );
}
