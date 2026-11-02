import { afterEach, describe, expect, it } from 'vitest';
import { dentroDaIlha } from '../ilha.js';
import { capacidadeDoEstoque, totalNoEstoque } from '../inventario.js';
import { criarGerador } from '../aleatorio.js';
import { criarMundo, passo } from '../jogo.js';
import { mundo } from '../mundo.js';
import { fecharConquista } from '../ui.js';
import { DT, jogadorAleatorio, povoarIlha } from './ajudantes.js';

// ===================== Simulação headless =====================
// 5 minutos de jogo a 60 quadros por segundo, conferindo as invariantes a cada quadro.
// A partida usa a semente (criarMundo) e as jogadas do teste têm um gerador próprio com a
// mesma semente: a falha diz a semente e o segundo, para repetir.
const DURACAO = 5 * 60;
const SEMENTES = [1, 42, 2026];

afterEach(() => {
  mundo.dev = false;
});

// Devolve o primeiro problema encontrado no quadro, ou null
function violacao() {
  const pos = o => Number.isFinite(o.x) && Number.isFinite(o.y);
  for (const a of mundo.agentes) {
    if (!pos(a)) return `${a.nome ?? a.tipo} com posição inválida (${a.x}, ${a.y})`;
    if (!a.embarcado && !dentroDaIlha(a.x, a.y)) return `${a.nome ?? a.tipo} fora da ilha em (${a.x.toFixed(1)}, ${a.y.toFixed(1)})`;
  }
  for (const an of mundo.animais) {
    if (!pos(an)) return `animal ${an.especie} com posição inválida (${an.x}, ${an.y})`;
    if (!dentroDaIlha(an.x, an.y)) return `animal ${an.especie} fora da ilha em (${an.x.toFixed(1)}, ${an.y.toFixed(1)})`;
  }
  for (const s of mundo.estruturas) if (!pos(s)) return `construção ${s.tipo} com posição inválida (${s.x}, ${s.y})`;
  for (const c of mundo.cardumes) if (!pos(c)) return `cardume com posição inválida (${c.x}, ${c.y})`;
  for (const [r, q] of Object.entries(mundo.inventario)) {
    if (!Number.isFinite(q) || q < 0) return `inventário ${r} = ${q}`;
  }
  if (totalNoEstoque() > capacidadeDoEstoque()) return `estoque ${totalNoEstoque()} acima da capacidade ${capacidadeDoEstoque()}`;
  return null;
}

// Roda a partida; "jogada(t)" é chamada a cada quadro antes do passo
function simular(semente, jogada = () => {}) {
  for (let i = 0; i < DURACAO / DT; i++) {
    const t = i * DT;
    jogada(t);
    if (mundo.ui.conquista) fecharConquista(); // com o aviso aberto o jogo fica pausado
    passo(DT);
    const erro = violacao();
    if (erro) throw new Error(`semente ${semente}, ${t.toFixed(2)} s: ${erro}`);
  }
}

describe('simulação de 5 minutos', () => {
  it.each(SEMENTES)(
    'ilha nova, sem jogadas (semente %i)',
    semente => {
      criarMundo(semente);
      simular(semente);
    },
    60000,
  );

  it.each(SEMENTES)(
    'ilha povoada, jogador aleatório (semente %i)',
    semente => {
      const aleatorio = criarGerador(semente); // jogadas do teste, separadas dos sorteios do jogo
      criarMundo(semente);
      povoarIlha(aleatorio);
      expect(violacao()).toBeNull();
      simular(semente, jogadorAleatorio(aleatorio));
    },
    60000,
  );
});
