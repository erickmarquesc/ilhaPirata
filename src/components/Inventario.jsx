import { createContext, useContext } from 'react';
import { useMundo } from '../hooks/useMundo.js';
import { usePiscar } from '../hooks/usePiscar.js';
import Painel from './ui/Painel.jsx';

// <Inventario>
//   <Inventario.Item recurso="madeira" icone="🪵" rotulo="Madeira" />
//   <Inventario.Separador />
//   <Inventario.Item icone="👩" rotulo="Esposa" valor="sim" />
//   <Inventario.Rodape>...botões...</Inventario.Rodape>
// </Inventario>
const InventarioContext = createContext(null);

function Inventario({ children, titulo = 'Inventário' }) {
  const { inventario, ui } = useMundo();
  return (
    <InventarioContext.Provider value={{ inventario, piscar: ui.piscar }}>
      <Painel>
        <Painel.Cabecalho>
          <Painel.Titulo>{titulo}</Painel.Titulo>
        </Painel.Cabecalho>
        {children}
      </Painel>
    </InventarioContext.Provider>
  );
}

// Com "recurso" o valor vem do inventário e pisca quando muda; sem ele, usa "valor"
function Item({ recurso, icone, rotulo, valor }) {
  const { inventario, piscar } = useContext(InventarioContext);
  const destacado = usePiscar(recurso ? piscar[recurso] || 0 : 0);
  return (
    <div className="my-0.5 flex justify-between gap-4">
      <span>{icone} {rotulo}</span>
      <strong className={destacado ? 'text-ganho' : ''}>{recurso ? inventario[recurso] : valor}</strong>
    </div>
  );
}

function Separador() {
  return <div className="my-1.5 border-t border-white/20" />;
}

function Rodape({ children }) {
  return <div>{children}</div>;
}

Inventario.Item = Item;
Inventario.Separador = Separador;
Inventario.Rodape = Rodape;

export default Inventario;
