import {
  ILHA, MADEIRA_POR_ARVORE, SEMENTES_POR_ARVORE, SEMENTES_TRIGO_INICIAIS, SEMENTES_TRIGO_POR_COLHEITA,
  TEMPO_CACAR, TEMPO_COLHER_TRIGO, TEMPO_GRAVIDEZ, TEMPO_NAMORAR, TEMPO_PLANTAR, TEMPO_PLANTAR_CRIANCA,
  TEMPO_ATERRAR, TEMPO_COLETAR, TEMPO_PLANTAR_TRIGO, TEMPO_SERRAR, TRIGO_POR_COLHEITA,
} from './config.js';
import { CONSTRUCOES } from './construcoes.js';
import { cancelar, pertoDe } from './agentes.js';
import { entrarNaCabana, sairDaCabana, sairSemMotivo } from './cabana.js';
import { novaArvore, removerArvores } from './arvores.js';
import { arvoresAfetadas, motivoNaoPlantar, podeConstruirEm } from './espaco.js';
import {
  carneDe, custoEvolucao, filhosParaNivel, nivelAlvoDaObra, podeAjudarObra, requisitosDaConstrucao, tempoDoNivel,
} from './estruturas.js';
import { textoFlutuante } from './efeitos.js';
import { concluirAterro } from './expansao.js';
import { coletarUma } from './montes.js';
import { raioIlha } from './ilha.js';
import { cabeNoEstoque, gastarRecursos, ganhar, temRecursos } from './inventario.js';
import { embarcar, jangadaNaAgua, navegar } from './jangada.js';
import { podeNamorar } from './familia.js';
import { mover, proximoPonto } from './movimento.js';
import { criarCanteiros } from './trigo.js';
import { mundo } from './mundo.js';
import { atualizarInventario } from './ui.js';

// ===================== Tarefas =====================
export function iniciarTarefa(a, tarefa) {
  a.tarefa = tarefa;
  if (pertoDe(a, tarefa.x, tarefa.y, tarefa.raio)) comecarAcao(a);
  else a.destino = { x: tarefa.x, y: tarefa.y };
  if (a === mundo.jogador && precisaAjuda(tarefa)) chamarAjudante(tarefa);
}

// ===== Filhos ajudando nas obras =====
// Algumas obras pedem 1 ou mais filhos (adolescentes ou adultos) ajudando.
// A obra só avança quando todos os ajudantes necessários estão trabalhando nela.
function ajudantesNecessarios(t) {
  if (t.tipo !== 'construir' && t.tipo !== 'evoluir') return 0;
  return filhosParaNivel(t.construcao, nivelAlvoDaObra(t));
}
export function precisaAjuda(t) { return ajudantesNecessarios(t) > 0; }
function ajudantesValidos(t) {
  return (t.ajudantes || []).filter(aj => mundo.agentes.includes(aj) && aj.tarefa && aj.tarefa.obra === t);
}
export function ajudantesTrabalhando(t) {
  return ajudantesValidos(t).filter(aj => aj.acao).length >= ajudantesNecessarios(t);
}
function chamarAjudante(t) {
  t.ajudantes = ajudantesValidos(t);
  let faltam = ajudantesNecessarios(t) - t.ajudantes.length;
  while (faltam > 0) {
    let melhor = null, dist = Infinity;
    for (const ag of mundo.agentes) {
      if (!podeAjudarObra(ag, t.construcao) || t.ajudantes.includes(ag) || (ag.tarefa && ag.tarefa.tipo === 'embarcar')) continue;
      const d = Math.hypot(ag.x - t.x, ag.y - t.y);
      if (d < dist) { dist = d; melhor = ag; }
    }
    if (!melhor) return;
    cancelar(melhor);
    t.ajudantes.push(melhor);
    // cada ajudante fica num lado da obra
    const ang = t.ajudantes.length * 2.1;
    iniciarTarefa(melhor, { tipo: 'ajudar', obra: t, x: t.x + Math.cos(ang) * 6, y: t.y + Math.sin(ang) * 6, raio: t.raio });
    faltam--;
  }
}

function duracaoDe(a, t) {
  switch (t.tipo) {
    case 'serrar': return TEMPO_SERRAR;
    case 'plantar': return a.tipo === 'crianca' ? TEMPO_PLANTAR_CRIANCA : TEMPO_PLANTAR;
    case 'namorar': return TEMPO_NAMORAR;
    case 'cacar': return TEMPO_CACAR;
    case 'ajudar': return Infinity; // fica ajudando até a obra acabar
    case 'esperarNaCabana': return Infinity; // até o namoro acabar
    case 'cuidarNaCabana': return Infinity;  // até o bebê virar criança
    case 'embarcar': return 0.3;
    case 'plantarTrigo': return TEMPO_PLANTAR_TRIGO;
    case 'colher': return TEMPO_COLHER_TRIGO;
    case 'aterrar': return TEMPO_ATERRAR;
    case 'coletar': return TEMPO_COLETAR;
    default: return tempoDoNivel(t.construcao, nivelAlvoDaObra(t)); // construir / evoluir
  }
}
function comecarAcao(a) {
  a.destino = null;
  a.acao = { tarefa: a.tarefa, tempo: 0, duracao: duracaoDe(a, a.tarefa) };
}
// Quanto uma tarefa vai render no estoque (para só começar se couber tudo)
export function rendimentoDe(t) {
  switch (t.tipo) {
    case 'serrar': return MADEIRA_POR_ARVORE + SEMENTES_POR_ARVORE;
    case 'cacar': return carneDe(t.alvo.especie);
    case 'coletar': return 1;
    case 'colher': return TRIGO_POR_COLHEITA + SEMENTES_TRIGO_POR_COLHEITA;
    default: return 0;
  }
}
function semEspaco(t) { const r = rendimentoDe(t); return r > 0 && !cabeNoEstoque(r); }

function tarefaValida(a) {
  const t = a.tarefa;
  if (!t) return true;
  if (semEspaco(t)) return false; // estoque cheio: a coleta fica bloqueada
  const { arvores, animais, estruturas, inventario, jogador } = mundo;
  switch (t.tipo) {
    case 'serrar': return arvores.includes(t.arvore);
    case 'namorar': return podeNamorar() || !!a.dentro; // depois de entrar, segue até o fim
    case 'esperarNaCabana': return mundo.jogador.tarefa?.tipo === 'namorar';
    case 'cuidarNaCabana': return !!mundo.esposa && mundo.esposa.cuidado > 0;
    case 'cacar': return animais.includes(t.alvo);
    case 'evoluir': return estruturas.includes(t.estrutura);
    case 'ajudar': return jogador.tarefa === t.obra;
    case 'plantarTrigo': return t.canteiro.estado === 'vazio' && inventario.sementesTrigo > 0;
    case 'colher': return t.canteiro.estado === 'maduro';
    case 'coletar': return t.monte.restante > 0;
    case 'embarcar': return estruturas.includes(t.estrutura) && jangadaNaAgua(t.estrutura) && !!t.estrutura.reservadaPor && t.estrutura.tripulacao.length < 2;
    default: return true;
  }
}

// ===== Conclusão de cada tipo de tarefa =====
// Pode devolver a próxima tarefa do mesmo agente (ex.: continuar coletando no monte)
const CONCLUIR = {
  serrar(a, t) {
    if (!mundo.arvores.includes(t.arvore)) return;
    removerArvores([t.arvore]);
    ganhar('madeira', MADEIRA_POR_ARVORE);
    ganhar('sementes', SEMENTES_POR_ARVORE);
    textoFlutuante(t.x, t.y - 30, '+' + MADEIRA_POR_ARVORE + ' 🪵  +' + SEMENTES_POR_ARVORE + ' 🌱');
    if (a.tipo === 'esposa' || a.tipo === 'adolescente' || a.tipo === 'adulto') a.plantarProximo = true;
  },
  plantar(a, t) {
    const motivo = mundo.inventario.sementes > 0 ? motivoNaoPlantar(t) : 'Sem sementes';
    if (!motivo) {
      mundo.arvores.push(novaArvore(t.x, t.y, false));
      ganhar('sementes', -1);
      textoFlutuante(t.x, t.y - 20, '-1 🌱', '#c8f0b0');
    } else if (a === mundo.jogador) {
      textoFlutuante(t.x, t.y - 20, motivo, '#ffb0a0');
    }
  },
  construir(a, t) {
    const c = CONSTRUCOES[t.construcao];
    if (!temRecursos(c.custo)) { textoFlutuante(t.x, t.y - 20, 'Recursos insuficientes', '#ffb0a0'); return; }
    if (!podeConstruirEm(t.construcao, t)) { textoFlutuante(t.x, t.y - 20, 'Não dá para construir aqui', '#ffb0a0'); return; }
    gastarRecursos(c.custo);
    // derruba as árvores do terreno, sem ganhar madeira nem sementes
    const derrubadas = arvoresAfetadas(t.construcao, t);
    if (derrubadas.length) {
      removerArvores(derrubadas);
      textoFlutuante(t.x, t.y + 10, derrubadas.length + (derrubadas.length > 1 ? ' árvores derrubadas' : ' árvore derrubada'), '#e0c090');
    }
    const est = { tipo: t.construcao, x: t.x, y: t.y, raio: c.raio, nivel: 1 };
    if (c.area) { est.area = true; est.ocupa = c.raio * 1.42; }
    if (t.construcao === 'campoTrigo') {
      est.canteiros = criarCanteiros(est);
      ganhar('sementesTrigo', SEMENTES_TRIGO_INICIAIS);
      textoFlutuante(t.x, t.y + 14, '+' + SEMENTES_TRIGO_INICIAIS + ' semente de trigo', '#f5e6a0');
    }
    if (c.vaiParaAgua) {
      // direção: do centro da ilha para fora, até sair da areia
      const ang = Math.atan2(t.y - ILHA.y, t.x - ILHA.x);
      const dist = raioIlha(ang) + c.raio + 14;
      est.praia = { x: t.x, y: t.y };
      est.agua = { x: ILHA.x + Math.cos(ang) * dist, y: ILHA.y + Math.sin(ang) * dist };
      est.empurrar = 0;
    }
    mundo.estruturas.push(est);
    textoFlutuante(t.x, t.y - c.altura - 20, c.concluido);
  },
  evoluir(a, t) {
    const est = t.estrutura, c = CONSTRUCOES[est.tipo];
    const custo = custoEvolucao(est);
    if (!custo) return; // já está no nível máximo
    if (!mundo.estruturas.includes(est) || !temRecursos(custo)) {
      textoFlutuante(t.x, t.y - 20, 'Recursos insuficientes', '#ffb0a0');
      return;
    }
    const totem = requisitosDaConstrucao(est.tipo).find(r => r.chave === 'totem' && !r.ok);
    if (totem) { textoFlutuante(t.x, t.y - 20, totem.dica, '#ffb0a0'); return; }
    gastarRecursos(custo);
    est.nivel += 1;
    textoFlutuante(t.x, t.y - c.altura - 20, `${c.nome} evoluiu para o nível ${est.nivel}!`);
  },
  plantarTrigo(a, t) {
    if (t.canteiro.estado !== 'vazio' || mundo.inventario.sementesTrigo <= 0) return;
    ganhar('sementesTrigo', -1);
    t.canteiro.estado = 'crescendo'; t.canteiro.idade = 0;
  },
  colher(a, t) {
    if (t.canteiro.estado !== 'maduro') return;
    t.canteiro.estado = 'vazio'; t.canteiro.idade = 0;
    ganhar('trigo', TRIGO_POR_COLHEITA);
    ganhar('sementesTrigo', SEMENTES_TRIGO_POR_COLHEITA);
    textoFlutuante(t.x, t.y - 15, '+' + TRIGO_POR_COLHEITA + ' 🌾  +' + SEMENTES_TRIGO_POR_COLHEITA + ' sementes');
  },
  cacar(a, t) {
    const an = t.alvo;
    const i = mundo.animais.indexOf(an);
    if (i < 0) return;
    mundo.animais.splice(i, 1);
    const carne = carneDe(an.especie);
    ganhar('carne', carne);
    textoFlutuante(an.x, an.y - 25, '+' + carne + ' 🍖');
  },
  coletar(a, t) {
    return coletarUma(t.monte);
  },
  aterrar(a, t) {
    concluirAterro(t);
  },
  namorar(a) {
    // os dois saem da cabana e ela já sai grávida
    const { esposa } = mundo;
    sairDaCabana(a, -8);
    cancelar(esposa);
    sairDaCabana(esposa, 8);
    esposa.gravidez = TEMPO_GRAVIDEZ;
    textoFlutuante(esposa.x, esposa.y - 40, 'Ela está grávida! 🤰', '#ffc0dd');
  },
};

function concluirAcao(a) {
  const t = a.acao.tarefa;
  if (t.tipo === 'embarcar') {
    embarcar(a, t.estrutura);
    atualizarInventario();
    return;
  }
  const proxima = CONCLUIR[t.tipo]?.(a, t);
  cancelar(a);
  if (proxima) iniciarTarefa(a, proxima);
  atualizarInventario();
}

// Executa tarefa/ação/movimento de qualquer personagem. dx/dy = entrada manual (só do jogador)
export function executar(a, dt, dx = 0, dy = 0) {
  if (a.embarcado) { if (a === mundo.jogador) navegar(dt, dx, dy); return; }
  if (!tarefaValida(a)) {
    if (a === mundo.jogador && a.tarefa && semEspaco(a.tarefa)) {
      textoFlutuante(a.x, a.y - 30, 'Estoque cheio! Gaste recursos ou melhore o moinho', '#ffb0a0');
    }
    cancelar(a);
  }
  sairSemMotivo(a);

  if (a.acao) {
    const t = a.acao.tarefa;
    if (t.tipo === 'namorar' && !a.dentro) {
      // só entram quando a esposa também chegou na porta
      const esposa = mundo.esposa;
      if (esposa?.acao?.tarefa.tipo !== 'esperarNaCabana') return;
      entrarNaCabana(a, t.cabana);
      entrarNaCabana(esposa, t.cabana);
    }
    if (t.tipo === 'cuidarNaCabana' && !a.dentro) entrarNaCabana(a, t.cabana);
    if (precisaAjuda(t) && !ajudantesTrabalhando(t)) {
      chamarAjudante(t);   // garante que alguém está vindo
      return;              // espera o adolescente chegar
    }
    a.acao.tempo += dt;
    if (a.acao.tempo >= a.acao.duracao) concluirAcao(a);
    return;
  }
  const t = a.tarefa;
  if (t && t.alvo) { t.x = t.alvo.x; t.y = t.alvo.y; a.destino = { x: t.x, y: t.y }; } // alvo que se move
  if (t && pertoDe(a, t.x, t.y, t.raio)) { comecarAcao(a); return; }

  if (!dx && !dy && a.destino) {
    const alvo = proximoPonto(a);
    const vx = alvo.x - a.x, vy = alvo.y - a.y;
    if (alvo === a.destino && Math.hypot(vx, vy) < 4) { a.destino = null; a.rota = null; }
    else { dx = vx; dy = vy; }
  }
  if ((dx || dy) && !mover(a, dx, dy, dt)) {
    cancelar(a);
    a.espera = 0.8;
  }
}
