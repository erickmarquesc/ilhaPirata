import { temRecursos } from '../../game/inventario.js';
import { PEDIDOS } from '../../game/pedidos.js';
import Botao from '../ui/Botao.jsx';
import Custo from '../ui/Custo.jsx';
import Painel from '../ui/Painel.jsx';

export default function PainelTotem({ alvo }) {
  return (
    <>
      <Painel.Cabecalho>
        <Painel.Titulo>🗿 Totem da Vida · nível {alvo?.nivel ?? 1}</Painel.Titulo>
        <Painel.Fechar />
      </Painel.Cabecalho>
      <Painel.Texto>Faça uma oferenda e peça algo aos deuses.</Painel.Texto>
      <Painel.Acoes>
        {Object.entries(PEDIDOS).map(([id, p]) => {
          const ok = p.disponivel();
          return (
            <Botao key={id} cor="amor" disabled={!ok || !temRecursos(p.custo)} onClick={() => p.realizar(id)}>
              {p.icone} {p.nome}
              <Botao.Detalhe>{ok ? <Custo custo={p.custo} /> : p.motivo}</Botao.Detalhe>
            </Botao>
          );
        })}
      </Painel.Acoes>
    </>
  );
}
