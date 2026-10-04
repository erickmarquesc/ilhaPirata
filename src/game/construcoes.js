import { dentroDaIlha } from './ilha.js';
import {
  desenharTotem, desenharCabana, desenharJangada, desenharCercado, desenharCampoTrigo,
} from './desenho/construcoes.js';

// ===================== Construções =====================
// desenhar(ctx, x, y, progresso, alpha, estrutura)
export const CONSTRUCOES = {
  totem: {
    nome: 'Totem da Vida', icone: '🗿',
    custo: { madeira: 60, sementes: 4 },
    tempo: 8, raio: 16,
    largura: 36, altura: 75,      // área clicável / altura do desenho
    concluido: 'Totem da Vida construído!',
    desenhar: desenharTotem,
  },
  cabana: {
    nome: 'Cabana', icone: '🛖',
    custo: { madeira: 300 },
    tempo: 15, raio: 30,
    largura: 76, altura: 70,
    concluido: 'Cabana construída!',
    descricao: 'O primeiro lar da família na ilha.',
    desenhar: desenharCabana,
  },
  jangada: {
    nome: 'Jangada', icone: '🛶',
    custo: { madeira: 600 },
    tempo: 60, raio: 22,
    largura: 60, altura: 62,
    concluido: 'Jangada construída!',
    descricao: 'Uma jangada de troncos na beira do mar.',
    dica: 'A jangada só pode ser construída na areia, perto do mar. Esc para cancelar.',
    precisaAdolescente: true,   // um filho adolescente ajuda o pai na obra
    vaiParaAgua: true,          // depois de pronta é empurrada para o mar
    // só na faixa de areia, colada na água
    local: p => dentroDaIlha(p.x, p.y, 4) && !dentroDaIlha(p.x, p.y, 48),
    desenhar: desenharJangada,
  },
  // Abrigos de animais: área cercada (não bloqueia a passagem das pessoas)
  galinheiro: {
    nome: 'Galinheiro', icone: '🐔',
    custo: { madeira: 150 },
    tempo: 12, raio: 34, area: true, largura: 68, altura: 34, abrigo: 'galinha',
    concluido: 'Galinheiro construído!',
    descricao: 'Protege as galinhas e o galo. Limite de 10 galinhas e o dobro de carne por animal.',
    desenhar: (ctx, x, y, p, a) => desenharCercado(ctx, x, y, 34, '#b89a62', 'casinha', p, a),
  },
  curral: {
    nome: 'Curral', icone: '🐑',
    custo: { madeira: 250 },
    tempo: 15, raio: 44, area: true, largura: 88, altura: 44, abrigo: 'ovelha',
    concluido: 'Curral construído!',
    descricao: 'Protege as ovelhas e o carneiro. Limite de 10 ovelhas e o dobro de carne por animal.',
    desenhar: (ctx, x, y, p, a) => desenharCercado(ctx, x, y, 44, '#a88a55', 'cocho', p, a),
  },
  pasto: {
    nome: 'Pasto', icone: '🐄',
    custo: { madeira: 350 },
    tempo: 20, raio: 56, area: true, largura: 112, altura: 56, abrigo: 'vaca',
    concluido: 'Pasto construído!',
    descricao: 'Protege as vacas e o touro. Limite de 10 vacas e o dobro de carne por animal.',
    desenhar: (ctx, x, y, p, a) => desenharCercado(ctx, x, y, 56, '#7fbf55', 'cocho', p, a),
  },
  campoTrigo: {
    nome: 'Campo de trigo', icone: '🌾',
    custo: { madeira: 100 },
    tempo: 10, raio: 46, area: true, largura: 92, altura: 46,
    concluido: 'Campo de trigo pronto!',
    descricao: 'Área demarcada: o trigo só pode ser plantado aqui dentro.',
    desenhar: desenharCampoTrigo,
  },
};
