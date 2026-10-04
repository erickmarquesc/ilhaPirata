import { Children, createContext, isValidElement, useContext } from 'react';
import { useMundo } from '../hooks/useMundo.js';
import { usePiscar } from '../hooks/usePiscar.js';
import { capacidadeDoEstoque, totalNoEstoque } from '../game/inventario.js';
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

// Barra do estoque: soma de todos os recursos / capacidade (o moinho aumenta)
function Estoque() {
  useMundo();
  const total = totalNoEstoque(), capacidade = capacidadeDoEstoque();
  const fracao = Math.min(total / capacidade, 1);
  const cheio = total >= capacidade;
  const cor = cheio ? 'from-[#e8584a] to-[#9c2a22]' : fracao > 0.85 ? 'from-[#f0a040] to-[#b0601a]' : 'from-[#ffe58a] to-[#c9851e]';
  return (
    <div className="mt-2" title="Soma de todos os recursos. Construa e evolua o moinho para guardar mais.">
      <div className="mb-0.5 flex items-baseline justify-between px-0.5 text-[11px] text-[#f3dcae]">
        <span>📦 Estoque{cheio && <strong className="ml-1 text-[#ff8a7a]">cheio!</strong>}</span>
        <span className="texto-ouro text-[13px] font-normal tabular-nums">{total} / {capacidade}</span>
      </div>
      <div className="medalhao h-3 overflow-hidden rounded-full p-0.5">
        <div className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-300 ${cor}`} style={{ width: `${fracao * 100}%` }} />
      </div>
    </div>
  );
}

// Fica pendurado embaixo da moldura (atrás da borda)
function Rodape({ children }) {
  return <div className="-mt-1 flex justify-center gap-3">{children}</div>;
}

Inventario.Grade = Grade;
Inventario.Estoque = Estoque;
Inventario.Item = Item;
Inventario.Rodape = Rodape;

export default Inventario;
