import { Children, createContext, isValidElement, useContext } from 'react';
import { useMundo } from '../hooks/useMundo.js';
import { usePiscar } from '../hooks/usePiscar.js';
import Moldura from './ui/Moldura.jsx';

// Recursos em medalhões dentro de uma moldura de madeira e ouro.
// O rodapé (ferramentas) fica pendurado embaixo da moldura, como flâmulas.
//
// <Inventario>
//   <Inventario.Grade>
//     <Inventario.Item recurso="madeira" icone="🪵" rotulo="Madeira" />
//     <Inventario.Item icone="🐾" rotulo="Animais" valor={9} />
//   </Inventario.Grade>
//   <Inventario.Rodape>...flâmulas...</Inventario.Rodape>
// </Inventario>
const InventarioContext = createContext(null);

function Inventario({ children, titulo = 'Recursos' }) {
  const { inventario, ui } = useMundo();
  const lista = Children.toArray(children);
  const rodape = lista.filter(c => isValidElement(c) && c.type === Rodape);
  const resto = lista.filter(c => !(isValidElement(c) && c.type === Rodape));
  return (
    <InventarioContext.Provider value={{ inventario, piscar: ui.piscar }}>
      <div className="flex w-[244px] flex-col items-center">
        <Moldura className="w-full">
          <Moldura.Placa>{titulo}</Moldura.Placa>
          <Moldura.Corpo>{resto}</Moldura.Corpo>
        </Moldura>
        {rodape}
      </div>
    </InventarioContext.Provider>
  );
}

function Grade({ children }) {
  return <div className="grid grid-cols-3 gap-1.5">{children}</div>;
}

// Com "recurso" o valor vem do inventário e o medalhão brilha quando muda; sem ele, usa "valor"
function Item({ recurso, icone, rotulo, valor }) {
  const { inventario, piscar } = useContext(InventarioContext);
  const destacado = usePiscar(recurso ? piscar[recurso] || 0 : 0);
  const quantidade = recurso ? inventario[recurso] : valor;
  return (
    <div
      title={rotulo}
      className={`medalhao flex flex-col items-center rounded-lg px-1 pt-1 pb-0.5 transition duration-300 ${destacado ? 'scale-105 shadow-[0_0_10px_rgb(255_215_94/0.9)]' : ''}`}
    >
      <span className="text-base leading-none drop-shadow-[0_1px_0_rgb(0_0_0/0.5)]">{icone}</span>
      <strong className={`texto-ouro text-[17px] leading-tight font-normal tabular-nums ${destacado ? 'text-white' : ''}`}>{quantidade}</strong>
      <span className="w-full truncate text-center text-[10px] leading-tight text-[#f3dcae] opacity-80">{rotulo}</span>
    </div>
  );
}

// Fica pendurado embaixo da moldura (atrás da borda)
function Rodape({ children }) {
  return <div className="-mt-1 flex justify-center gap-3">{children}</div>;
}

Inventario.Grade = Grade;
Inventario.Item = Item;
Inventario.Rodape = Rodape;

export default Inventario;
