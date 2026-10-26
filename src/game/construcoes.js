import { dentroDaIlha } from './ilha.js';

// ===================== Construções =====================
// O visual 3D de cada uma fica em src/components/cena/modelos
//
// descricao: para que serve. uso: o que o jogador pode fazer com ela (aparece no
// aviso de construção concluída, ver components/Conquista.jsx).
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

// Jangada → barco pirata no nível 5
const NIVEIS_JANGADA = [
  { custo: { madeira: 600 }, tempo: 60, filhos: 1 },
  { custo: { madeira: 400, pedra: 40, tijolo: 40, peixe: 30 }, tempo: 75, filhos: 1 },
  { custo: { madeira: 450, pedra: 80, tijolo: 60, carne: 40 }, tempo: 90, filhos: 1 },
  { custo: { madeira: 500, pedra: 100, tijolo: 100, trigo: 40 }, tempo: 105, filhos: 2 },
  { custo: { madeira: 600, pedra: 120, tijolo: 150, trigo: 60, peixe: 50 }, tempo: 120, filhos: 2 },
];

const NIVEIS_CABANA = [
  { custo: { madeira: 300 } },
  { custo: { madeira: 370, tijolo: 20 } },
  { custo: { madeira: 400, tijolo: 24, pedra: 10 } },
  { custo: { madeira: 430, tijolo: 30, pedra: 24 } },
  { custo: { madeira: 500, tijolo: 50, pedra: 35 }, filhos: 1 },
];

// Fogueira: "consumo" é quanto de carne (churrasco) ou peixe (peixada) cada prato gasta
const NIVEIS_FOGUEIRA = [
  { custo: { madeira: 120 }, consumo: 95 },
  { custo: { madeira: 150, pedra: 20 }, consumo: 85 },
  { custo: { madeira: 180, pedra: 40, tijolo: 20 }, consumo: 75 },
  { custo: { madeira: 220, pedra: 60, tijolo: 40 }, consumo: 65 },
  { custo: { madeira: 260, pedra: 80, tijolo: 60 }, consumo: 55, filhos: 1 },
];

export const CONSTRUCOES = {
  totem: {
    nome: 'Totem da Vida', icone: '🗿',
    niveis: NIVEIS_TOTEM,
    custo: NIVEIS_TOTEM[0].custo,
    tempo: 8, raio: 16,
    largura: 70, altura: 95,      // área clicável / altura do modelo
    concluido: 'Totem da Vida construído!',
    descricao: 'O coração da ilha: aqui os deuses ouvem os seus pedidos.',
    uso: [
      'Toque no totem e faça uma oferenda para pedir uma esposa ou animais',
      'O nível do totem libera o mesmo nível em todas as outras construções',
    ],
  },
  cabana: {
    nome: 'Cabana', icone: '🛖',
    niveis: NIVEIS_CABANA,
    custo: NIVEIS_CABANA[0].custo,
    tempo: 15, raio: 30,
    largura: 66, altura: 75,
    concluido: 'Cabana construída!',
    descricao: 'O primeiro lar da família na ilha.',
    uso: [
      'Com a esposa, toque nela e chame para namorar: assim nascem os filhos',
      'A esposa cuida do bebê aqui dentro até ele virar criança',
    ],
  },
  jangada: {
    nome: 'Jangada', icone: '🛶',
    niveis: NIVEIS_JANGADA,
    custo: NIVEIS_JANGADA[0].custo,
    tempo: NIVEIS_JANGADA[0].tempo, raio: 22,
    largura: 60, altura: 62,
    concluido: 'Jangada construída!',
    descricao: 'Leva a família para pescar. Evolui até virar um barco pirata no nível 5.',
    uso: [
      'Ela é empurrada para o mar assim que fica pronta',
      'Perto dela, aperte E: embarque com um filho adulto e toque no mar para navegar',
      'Pare em cima de um cardume para pescar 🐟',
      'Dois filhos adultos também saem sozinhos para pescar',
    ],
    dica: 'A jangada só pode ser construída na areia, perto do mar. Esc para cancelar.',
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
    uso: [
      'O estoque já cresceu: agora cabem mais recursos 📦',
      'Evolua com 3 filhos adultos ajudando para guardar ainda mais',
    ],
  },
  fogueira: {
    nome: 'Fogueira', icone: '🔥',
    niveis: NIVEIS_FOGUEIRA,
    custo: NIVEIS_FOGUEIRA[0].custo,
    tempo: 10, raio: 14,
    largura: 40, altura: 30,
    concluido: 'Fogueira acesa!',
    descricao: 'Jones faz churrasco com carne e peixada com peixe. Cada nível gasta menos por prato.',
    uso: [
      'Toque na fogueira para fazer churrasco 🍖 ou peixada 🐟',
      'Cada prato fica no espeto e rende 5 pedaços para a família',
      'Depois do 1º churrasco, a família vem até aqui pedir comida',
    ],
  },
  // Abrigos de animais: área cercada (não bloqueia a passagem das pessoas)
  galinheiro: {
    nome: 'Galinheiro', icone: '🐔',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 34, area: true, largura: 68, altura: 34, abrigo: 'galinha',
    concluido: 'Galinheiro construído!',
    uso: [
      'Agora cabem até 10 galinhas na ilha',
      'Cada galinha caçada dá o dobro de carne 🍖',
      'Evolua para caber ainda mais galinhas',
    ],
    descricao: 'Protege as galinhas e o galo: mais galinhas a cada nível e o dobro de carne por animal.',
  },
  curral: {
    nome: 'Curral', icone: '🐑',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 44, area: true, largura: 88, altura: 44, abrigo: 'ovelha',
    concluido: 'Curral construído!',
    uso: [
      'Agora cabem até 10 ovelhas na ilha',
      'Cada ovelha caçada dá o dobro de carne 🍖',
      'Evolua para caber ainda mais ovelhas',
    ],
    descricao: 'Protege as ovelhas e o carneiro: mais ovelhas a cada nível e o dobro de carne por animal.',
  },
  pasto: {
    nome: 'Pasto', icone: '🐄',
    niveis: NIVEIS_ABRIGO,
    custo: NIVEIS_ABRIGO[0].custo,
    tempo: NIVEIS_ABRIGO[0].tempo, raio: 56, area: true, largura: 112, altura: 56, abrigo: 'vaca',
    concluido: 'Pasto construído!',
    uso: [
      'Agora cabem até 10 vacas na ilha',
      'Cada vaca caçada dá o dobro de carne 🍖',
      'Evolua para caber ainda mais vacas',
    ],
    descricao: 'Protege as vacas e o touro: mais vacas a cada nível e o dobro de carne por animal.',
  },
  campoTrigo: {
    nome: 'Campo de trigo', icone: '🌾',
    custo: { madeira: 100 },
    tempo: 10, raio: 46, area: true, largura: 92, altura: 46,
    concluido: 'Campo de trigo pronto!',
    descricao: 'Área demarcada: o trigo só pode ser plantado aqui dentro.',
    uso: [
      'Toque num canteiro vazio para plantar trigo 🌾',
      'As crianças passam a cuidar do campo: plantam e colhem sozinhas',
      'Cada canteiro maduro rende 5 🌾 e devolve 2 sementes',
    ],
  },
};
