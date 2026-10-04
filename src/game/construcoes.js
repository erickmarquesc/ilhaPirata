import { dentroDaIlha } from './ilha.js';

// ===================== Construções =====================
// O visual 3D de cada uma fica em src/components/cena/modelos
//
// niveis (opcional): tabela com o custo de cada nível; o 1º é o da construção.
// "filhos" pede filhos ajudando na obra daquele nível; "tempo" é a duração da obra
// (sem ele, usa o "tempo" da construção); "limite" é quantos animais o abrigo comporta.
// O nível máximo de TODAS as construções é o nível máximo do Totem da Vida (tamanho da
// tabela dele). Se o totem passar da tabela de outra construção, o custo dos níveis
// que faltam é o do último nível dobrando a cada nível. Sem tabela, cada evolução custa
// o dobro da anterior.
const NIVEIS_TOTEM = [
  { custo: { madeira: 60, sementes: 4 } },
  { custo: { madeira: 100, sementes: 20 } },
  { custo: { madeira: 180, sementes: 24 } },
  { custo: { madeira: 200, sementes: 30 } },
  { custo: { madeira: 230, sementes: 50 }, filhos: 1 },
];

// Galinheiro, curral e pasto usam a mesma tabela (limite = animais daquela espécie).
// Obra: 20s para construir e +20s a cada evolução.
const NIVEIS_ABRIGO = [
  { custo: { madeira: 160, sementes: 4 }, limite: 10, tempo: 20 },
  { custo: { madeira: 190, carne: 20, pedra: 5 }, limite: 15, tempo: 40 },
  { custo: { madeira: 210, carne: 20, pedra: 15 }, limite: 20, tempo: 60 },
  { custo: { madeira: 250, carne: 30, pedra: 25 }, limite: 30, tempo: 80, filhos: 1 },
  { custo: { madeira: 300, carne: 80, pedra: 40, tijolo: 25 }, limite: 50, tempo: 100, filhos: 2 },
];

// Moinho: aumenta o estoque (+150 por nível). Toda obra pede 3 filhos adultos.
const NIVEIS_MOINHO = [
  { custo: { madeira: 200, pedra: 40 }, tempo: 30, filhos: 3 },
  { custo: { madeira: 250, pedra: 60, tijolo: 40 }, tempo: 45, filhos: 3 },
  { custo: { madeira: 300, pedra: 90, tijolo: 70 }, tempo: 60, filhos: 3 },
  { custo: { madeira: 350, pedra: 120, tijolo: 100, trigo: 30 }, tempo: 75, filhos: 3 },
  { custo: { madeira: 400, pedra: 150, tijolo: 130, trigo: 60 }, tempo: 90, filhos: 3 },
];

const NIVEIS_CABANA = [
  { custo: { madeira: 300 } },
  { custo: { madeira: 370, tijolo: 20 } },
  { custo: { madeira: 400, tijolo: 24, pedra: 10 } },
  { custo: { madeira: 430, tijolo: 30, pedra: 24 } },
  { custo: { madeira: 500, tijolo: 50, pedra: 35 }, filhos: 1 },
];

export const CONSTRUCOES = {
  totem: {
    nome: 'Totem da Vida', icone: '🗿',
    niveis: NIVEIS_TOTEM,
    custo: NIVEIS_TOTEM[0].custo,
    tempo: 8, raio: 16,
    largura: 70, altura: 95,      // área clicável / altura do modelo
    concluido: 'Totem da Vida construído!',
  },
  cabana: {
    nome: 'Cabana', icone: '🛖',
    niveis: NIVEIS_CABANA,
    custo: NIVEIS_CABANA[0].custo,
    tempo: 15, raio: 30,
    largura: 66, altura: 75,
    concluido: 'Cabana construída!',
    descricao: 'O primeiro lar da família na ilha.',
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
  },
  moinho: {
    nome: 'Moinho', icone: '🌬️',
    niveis: NIVEIS_MOINHO,
    custo: NIVEIS_MOINHO[0].custo,
    tempo: NIVEIS_MOINHO[0].tempo, raio: 24,
    largura: 56, altura: 95,
    soAdultos: true,            // só filhos adultos ajudam na obra
    concluido: 'Moinho construído! O estoque aumentou.',
    descricao: 'Guarda os recursos da família: cada nível aumenta o estoque em 150.',
  },
  // Abrigos de animais: área cercada (não bloqueia a passagem das pessoas)
  galinheiro: {
    nome: 'Galinheiro', icone: '🐔',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 34, area: true, largura: 68, altura: 34, abrigo: 'galinha',
    concluido: 'Galinheiro construído!',
    descricao: 'Protege as galinhas e o galo: mais galinhas a cada nível e o dobro de carne por animal.',
  },
  curral: {
    nome: 'Curral', icone: '🐑',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 44, area: true, largura: 88, altura: 44, abrigo: 'ovelha',
    concluido: 'Curral construído!',
    descricao: 'Protege as ovelhas e o carneiro: mais ovelhas a cada nível e o dobro de carne por animal.',
  },
  pasto: {
    nome: 'Pasto', icone: '🐄',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 56, area: true, largura: 112, altura: 56, abrigo: 'vaca',
    concluido: 'Pasto construído!',
    descricao: 'Protege as vacas e o touro: mais vacas a cada nível e o dobro de carne por animal.',
  },
  campoTrigo: {
    nome: 'Campo de trigo', icone: '🌾',
    custo: { madeira: 100 },
    tempo: 10, raio: 46, area: true, largura: 92, altura: 46,
    concluido: 'Campo de trigo pronto!',
    descricao: 'Área demarcada: o trigo só pode ser plantado aqui dentro.',
  },
};
