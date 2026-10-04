import { TEMPO_CRESCER_ANIMAL, TEMPO_CRIA_ANIMAL } from '../../game/config.js';
import { animalAdulto, cacar, cacavel, casal, iconeAnimal, nomeAnimal, qtdEspecie } from '../../game/animais.js';
import { abrigoDe, carneDe, limiteEspecie } from '../../game/estruturas.js';
import { useMundo } from '../../hooks/useMundo.js';
import Botao from '../ui/Botao.jsx';
import Painel from '../ui/Painel.jsx';

function InfoReprodutor({ animal }) {
  const c = casal(animal.especie);
  const limite = limiteEspecie(animal.especie);
  let extra;
  if (!(c.f && c.m)) extra = `Precisa de ${animal.sexo === 'f' ? 'um macho' : 'uma fêmea'} para ter filhotes.`;
  else if (qtdEspecie(animal.especie) >= limite) extra = `Limite de ${limite} atingido${abrigoDe(animal.especie) ? '' : '. Construa um abrigo para aumentar'}.`;
  else extra = `Próximo filhote em ${Math.ceil(TEMPO_CRIA_ANIMAL - c.f.cria)}s.`;
  return (
    <>
      <Painel.Texto>Casal da ilha, enviado pelos deuses. Não pode ser caçado.</Painel.Texto>
      <Painel.Texto>{extra}</Painel.Texto>
    </>
  );
}

export default function PainelAnimal({ alvo: animal }) {
  const { jogador } = useMundo();
  const cacando = jogador.tarefa?.alvo === animal;
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>{iconeAnimal(animal)} {nomeAnimal(animal)}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      {animal.reprodutor ? (
        <InfoReprodutor animal={animal} />
      ) : !animalAdulto(animal) ? (
        <Painel.Texto>Filhote. Vira adulto em {Math.ceil(TEMPO_CRESCER_ANIMAL - animal.idade)}s.</Painel.Texto>
      ) : (
        <Painel.Texto>
          Adulto. Pode ser caçado e rende {carneDe(animal.especie)} 🍖
          {abrigoDe(animal.especie) ? ' (dobro, protegido no abrigo)' : ''}.
        </Painel.Texto>
      )}
      {cacavel(animal) && (
        <Painel.Acoes>
          <Botao cor="amor" disabled={cacando} onClick={() => cacar(animal)}>
            {cacando ? '🏹 Caçando...' : '🏹 Caçar'}
          </Botao>
        </Painel.Acoes>
      )}
    </>
  );
}
