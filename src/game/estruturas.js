import { CONSTRUCOES } from './construcoes.js';
import { ESPECIES, MAX_COM_ABRIGO, MAX_POR_ESPECIE } from './config.js';
import { mundo } from './mundo.js';

// ===================== Estruturas =====================
export function estruturaDoTipo(id) { return mundo.estruturas.find(s => s.tipo === id); }
export function dentroDaArea(s, x, y) { return Math.abs(x - s.x) < s.raio && Math.abs(y - s.y) < s.raio; }
export function estruturaEm(p) {
  // construções "de pé" têm prioridade sobre áreas no chão
  return mundo.estruturas.find(s => {
    const c = CONSTRUCOES[s.tipo];
    return !c.area && Math.abs(p.x - s.x) < c.largura / 2 && p.y < s.y + 10 && p.y > s.y - c.altura;
  }) || mundo.estruturas.find(s => CONSTRUCOES[s.tipo].area && dentroDaArea(s, p.x, p.y));
}
export function abrigoDe(especie) {
  return mundo.estruturas.find(s => CONSTRUCOES[s.tipo].abrigo === especie);
}
// Sem abrigo: limite fixo. Com abrigo: o limite do nível dele (tabela de níveis)
export function limiteEspecie(e) {
  const abrigo = abrigoDe(e);
  if (!abrigo) return MAX_POR_ESPECIE;
  return limiteDoAbrigo(abrigo.tipo, abrigo.nivel);
}
export function limiteDoAbrigo(id, nivel) {
  const c = CONSTRUCOES[id];
  return (c.niveis && linhaDoNivel(c, nivel).limite) ?? MAX_COM_ABRIGO;
}
export function carneDe(e) { return ESPECIES[e].carne * (abrigoDe(e) ? 2 : 1); }

// ===================== Níveis das construções =====================
// Com tabela de níveis, o custo vem dela. Sem tabela, cada evolução custa o dobro
// do nível anterior: nível 2 = 2x, nível 3 = 4x, nível 4 = 8x...
// O Totem da Vida limita todas as construções: o nível máximo é o tamanho da tabela dele
export function nivelMaximo() { return CONSTRUCOES.totem.niveis.length; }
export function noNivelMaximo(s) { return s.nivel >= nivelMaximo(); }

// Linha da tabela para um nível. Além da tabela: o último nível, com custo dobrando
// e, se tiver tempo, mais 20s por nível.
export function linhaDoNivel(c, nivel) {
  const tabela = c.niveis;
  if (nivel <= tabela.length) return tabela[nivel - 1];
  const extra = nivel - tabela.length, ultima = tabela[tabela.length - 1], fator = Math.pow(2, extra);
  return {
    ...ultima,
    custo: Object.fromEntries(Object.entries(ultima.custo).map(([r, q]) => [r, q * fator])),
    ...(ultima.tempo !== undefined && { tempo: ultima.tempo + 20 * extra }),
  };
}

// Duração da obra para chegar a um nível
export function tempoDoNivel(id, nivel) {
  const c = CONSTRUCOES[id];
  return (c.niveis && linhaDoNivel(c, nivel).tempo) ?? c.tempo;
}

// Custo para ir ao próximo nível (null: já está no máximo)
export function custoEvolucao(s) {
  if (noNivelMaximo(s)) return null;
  const c = CONSTRUCOES[s.tipo];
  if (c.niveis) return linhaDoNivel(c, s.nivel + 1).custo;
  const fator = Math.pow(2, s.nivel);
  return Object.fromEntries(Object.entries(c.custo).map(([r, q]) => [r, q * fator]));
}
// Quantos filhos precisam ajudar na obra para chegar a esse nível
export function filhosParaNivel(id, nivel) {
  const c = CONSTRUCOES[id];
  if (c.niveis) return linhaDoNivel(c, nivel).filhos ?? 0;
  return c.precisaAdolescente ? 1 : 0;
}
// Nível que a obra do jogador (construir/evoluir) vai alcançar
export function nivelAlvoDaObra(t) {
  return t.tipo === 'evoluir' ? t.estrutura.nivel + 1 : 1;
}
export function emObra(id) {
  const t = mundo.jogador.tarefa;
  return !!t && (t.tipo === 'construir' || t.tipo === 'evoluir') && t.construcao === id;
}

// ===================== Requisitos =====================
// Quem pode ajudar numa obra: filho adolescente ou adulto (ou só adulto, se a construção pedir)
export function podeAjudarObra(a, id = null) {
  if (a.embarcado) return false;
  if (id && CONSTRUCOES[id].soAdultos) return a.tipo === 'adulto';
  return a.tipo === 'adolescente' || a.tipo === 'adulto';
}
export function filhosQuePodemAjudar(id = null) { return mundo.agentes.filter(a => podeAjudarObra(a, id)).length; }
export function temAdolescente() { return filhosQuePodemAjudar() > 0; }
export function requisitosOk(id) { return requisitosDaConstrucao(id).every(r => r.ok); }

// Para evoluir qualquer construção ao nível N, o Totem da Vida precisa estar no nível N
export function nivelDoTotem() { return estruturaDoTipo('totem')?.nivel ?? 0; }

// Requisitos da obra (além dos recursos), no mesmo formato de uma linha de custo.
// Construir: só o filho ajudante (jangada). Evoluir: também o nível do totem.
export function requisitosDaConstrucao(id) {
  const lista = [];
  const existente = estruturaDoTipo(id);
  if (existente && noNivelMaximo(existente)) return lista;
  if (existente && id !== 'totem') {
    const alvo = existente.nivel + 1;
    lista.push({ chave: 'totem', icone: '🗿', rotulo: 'Totem nível', qtd: alvo, ok: nivelDoTotem() >= alvo, dica: `Evolua o Totem da Vida para o nível ${alvo} primeiro` });
  }
  const filhos = filhosParaNivel(id, existente ? existente.nivel + 1 : 1);
  if (filhos > 0) {
    const adultos = !!CONSTRUCOES[id].soAdultos;
    lista.push({
      chave: 'filho', icone: adultos ? '🧔' : '🧑',
      rotulo: (filhos > 1 ? 'Filhos' : 'Filho') + (adultos ? (filhos > 1 ? ' adultos' : ' adulto') : ''),
      qtd: filhos, ok: filhosQuePodemAjudar(id) >= filhos,
      dica: adultos ? `${filhos} filho(s) adulto(s) para ajudar na obra` : `${filhos} filho(s) adolescente(s) ou adulto(s) para ajudar na obra`,
    });
  }
  return lista;
}
