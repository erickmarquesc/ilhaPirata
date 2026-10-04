// ===================== Configuração =====================
export const MUNDO = { w: 1600, h: 1600 };
export const ILHA = { x: 800, y: 800, raio: 330 };
export const VELOCIDADE = 180;
export const TEMPO_SERRAR = 5;
export const TEMPO_PLANTAR = 2;
export const TEMPO_PLANTAR_CRIANCA = 3;
export const TEMPO_CRESCER = 60;
export const TEMPO_NAMORAR = 3;
export const TEMPO_GRAVIDEZ = 30;     // segundos até o bebê nascer
export const TEMPO_CUIDAR_BEBE = 60;  // segundos até o bebê virar criança
export const TEMPO_DESCANSO = 60;     // espera depois que o bebê vira criança para poder namorar de novo
export const MADEIRA_POR_ARVORE = 20;
export const SEMENTES_POR_ARVORE = 2;
export const DISTANCIA_MIN_ARVORES = 45;
export const DISTANCIA_MIN_CONSTRUCAO = 12; // folga mínima entre construções e entre construção e monte
export const RESERVA_SEMENTES = 4;    // a família não planta se isso deixar você com menos que isso
export const TEMPO_CACAR = 3;
export const TEMPO_EMPURRAR = 3;      // segundos empurrando a jangada para a água
export const VELOCIDADE_JANGADA = 120;    // velocidade navegando no mar
export const CARDUMES_MAX = 4;            // cardumes ao mesmo tempo no mar
export const PEIXES_POR_CARDUME = 5;      // quantas pescas cada cardume aguenta
export const TEMPO_PESCAR = 4;            // segundos por pesca
export const PEIXES_POR_PESCA = 2;        // um peixe para cada adulto na jangada
export const TEMPO_NOVO_CARDUME = 20;     // segundos para surgir um cardume novo
export const PESCAS_POR_VIAGEM = 3;       // filhos voltam depois de pescar isso
export const DESCANSO_VIAGEM = 30;        // segundos entre viagens dos filhos
export const TEMPO_CRIA_ANIMAL = 45;     // segundos entre filhotes de um casal
export const TEMPO_CRESCER_ANIMAL = 60;  // segundos para o filhote virar adulto
export const MAX_POR_ESPECIE = 6;        // limite de animais de cada espécie na ilha
export const MAX_COM_ABRIGO = 10;        // limite com galinheiro / curral / pasto
export const TEMPO_TRIGO_CRESCER = 45;   // segundos para o trigo amadurecer
export const TEMPO_PLANTAR_TRIGO = 1.5;
export const TEMPO_COLHER_TRIGO = 2;
export const TRIGO_POR_COLHEITA = 5;
export const SEMENTES_TRIGO_INICIAIS = 1;      // ganha ao construir o campo
export const SEMENTES_TRIGO_POR_COLHEITA = 2;  // cada canteiro colhido devolve 2 sementes
// Montes de barro e de pedra: filhos adultos coletam 1 unidade por vez, 1 filho por monte
export const QTD_POR_MONTE = 500;
export const TEMPO_COLETAR = 2;        // segundos por unidade
export const TEMPO_RECARGA_MONTE = 60; // monte esgotado volta a ter 500 depois disso
export const MONTES = {
  barro: { nome: 'Monte de barro', icone: '🟫', recurso: 'tijolo', raio: 20, acabou: 'O monte de barro esgotou!', voltou: 'O monte de barro voltou!' },
  pedra: { nome: 'Monte de pedra', icone: '🪨', recurso: 'pedra', raio: 20, acabou: 'O monte de pedra esgotou!', voltou: 'O monte de pedra voltou!' },
};

// Expansão da ilha: aterrar um pedaço de mar perto da costa
export const CUSTO_EXPANSAO = { madeira: 50 };
export const TEMPO_ATERRAR = 4;          // segundos aterrando
export const ALCANCE_EXPANSAO = 90;      // distância máxima da costa até o ponto clicado
export const LARGURA_EXPANSAO = 0.18;    // largura do pedaço de terra (em radianos)
export const ANEL_AREIA = 22; // distância da beira do mar até o meio da faixa de areia

// Espécies: f = fêmea, m = macho
export const ESPECIES = {
  ovelha:  { nome: { f: 'Ovelha', m: 'Carneiro' }, icone: { f: '🐑', m: '🐏' }, raio: 9,  carne: 15, velocidade: 40 },
  vaca:    { nome: { f: 'Vaca', m: 'Touro' },      icone: { f: '🐄', m: '🐂' }, raio: 13, carne: 30, velocidade: 30 },
  galinha: { nome: { f: 'Galinha', m: 'Galo' },    icone: { f: '🐔', m: '🐓' }, raio: 5,  carne: 5,  velocidade: 55 },
};

export const ICONES = { madeira: '🪵', sementes: '🌱', carne: '🍖', peixe: '🐟', trigo: '🌾', sementesTrigo: '🌾 sem.', tijolo: '🧱', pedra: '🪨' };

export const DICAS = {
  normal: 'Ande com setas / WASD ou tocando. Toque em árvores, construções, família ou animais.',
  plantar: 'Toque num lugar da grama para plantar. P ou Esc para sair.',
  construir: 'Toque num lugar da ilha para construir. Esc para cancelar.',
  expandir: 'Toque no mar, perto da praia, para aterrar um pedaço de terra. X ou Esc para sair.',
  navegando: 'Navegando: setas / WASD ou toque no mar. Pare em cima de um cardume para pescar. Perto da praia, E desembarca.',
};

export const FASES = {
  crianca:     { icone: '🧒', texto: 'Criança. Ajuda a mãe plantando sementes. Vira adolescente quando nascer o próximo irmão.' },
  adolescente: { icone: '🧑', texto: 'Adolescente. Caça animais adultos e, quando não há caça, corta árvores e planta sementes. Ajuda o pai a construir a jangada. Vira adulto quando nascer o próximo irmão.' },
  adulto:      { icone: '🧔', texto: 'Filho adulto. Sua obrigação é coletar barro e pedra nos montes (um filho por monte). Sem monte livre, caça, corta árvores e planta. Vai junto com o pai na jangada e, com outro irmão adulto, sai sozinho para pescar.' },
};

export const CORES_ACAO = { serrar: '#ffd34d', plantar: '#8fd16a', construir: '#e0a95a', namorar: '#f08bbd', cacar: '#e06a4a', evoluir: '#e0a95a', plantarTrigo: '#d8c060', colher: '#f0d050', aterrar: '#e8d08a', coletar: '#c8794a' };
export const NOMES_ACAO = { serrar: 'Serrando', plantar: 'Plantando', construir: 'Construindo', namorar: 'Namorando', cacar: 'Caçando', evoluir: 'Evoluindo', plantarTrigo: 'Plantando trigo', colher: 'Colhendo', aterrar: 'Aterrando', coletar: 'Coletando' };
