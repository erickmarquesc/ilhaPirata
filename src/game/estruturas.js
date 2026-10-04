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
export function limiteEspecie(e) { return abrigoDe(e) ? MAX_COM_ABRIGO : MAX_POR_ESPECIE; }
export function carneDe(e) { return ESPECIES[e].carne * (abrigoDe(e) ? 2 : 1); }

// ===================== Níveis das construções =====================
// Cada evolução custa o dobro do nível anterior: nível 2 = 2x, nível 3 = 4x, nível 4 = 8x...
export function custoEvolucao(s) {
  const base = CONSTRUCOES[s.tipo].custo, fator = Math.pow(2, s.nivel);
  return Object.fromEntries(Object.entries(base).map(([r, q]) => [r, q * fator]));
}
export function emObra(id) {
  const t = mundo.jogador.tarefa;
  return !!t && (t.tipo === 'construir' || t.tipo === 'evoluir') && t.construcao === id;
}

// ===================== Requisitos =====================
export function podeAjudarObra(a) { return (a.tipo === 'adolescente' || a.tipo === 'adulto') && !a.embarcado; }
export function temAdolescente() { return mundo.agentes.some(podeAjudarObra); }
export function requisitosOk(id) { return requisitosDaConstrucao(id).every(r => r.ok); }

// Para evoluir qualquer construção ao nível N, o Totem da Vida precisa estar no nível N
export function nivelDoTotem() { return estruturaDoTipo('totem')?.nivel ?? 0; }

// Requisitos da obra (além dos recursos), no mesmo formato de uma linha de custo.
// Construir: só o filho ajudante (jangada). Evoluir: também o nível do totem.
export function requisitosDaConstrucao(id) {
  const lista = [];
  const existente = estruturaDoTipo(id);
  if (existente && id !== 'totem') {
    const alvo = existente.nivel + 1;
    lista.push({ chave: 'totem', icone: '🗿', rotulo: 'Totem nível', qtd: alvo, ok: nivelDoTotem() >= alvo, dica: `Evolua o Totem da Vida para o nível ${alvo} primeiro` });
  }
  if (CONSTRUCOES[id].precisaAdolescente) {
    lista.push({ chave: 'filho', icone: '🧑', rotulo: 'Filho', qtd: 1, ok: temAdolescente(), dica: 'Filho adolescente ou adulto para ajudar na obra' });
  }
  return lista;
}
