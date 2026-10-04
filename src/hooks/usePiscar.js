import { useEffect, useRef, useState } from 'react';

// Fica true por alguns instantes sempre que o contador muda
export function usePiscar(contador, duracao = 600) {
  const [ativo, setAtivo] = useState(false);
  const anterior = useRef(contador);
  useEffect(() => {
    if (contador === anterior.current) return;
    anterior.current = contador;
    setAtivo(true);
    const t = setTimeout(() => setAtivo(false), duracao);
    return () => clearTimeout(t);
  }, [contador, duracao]);
  return ativo;
}
