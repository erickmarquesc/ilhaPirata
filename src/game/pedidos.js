import { especiesIncompletas, pedirAnimal } from './animais.js';
import { pedirEsposa } from './familia.js';
import { mundo } from './mundo.js';

// Pedidos que podem ser feitos aos deuses no Totem da Vida
export const PEDIDOS = {
  esposa: {
    nome: 'Uma esposa', icone: '💍',
    custo: { madeira: 40, sementes: 4 },
    disponivel: () => !mundo.esposa,
    motivo: 'Você já tem uma esposa',
    realizar: pedirEsposa,
  },
  animal: {
    nome: 'Um animal', icone: '🐾',
    custo: { madeira: 30, sementes: 2 },
    disponivel: () => especiesIncompletas().length > 0,
    motivo: 'Todos os casais já estão completos',
    realizar: pedirAnimal,
  },
};
