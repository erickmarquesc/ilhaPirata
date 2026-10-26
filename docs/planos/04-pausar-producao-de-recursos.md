# Plano 4 — Pausar a produção automática de recursos

> **Status:** fase 1 implementada em 2026-10-25 (aguardando teste no jogo). Decidido: controle no medalhão do inventário; com madeira pausada a família continua plantando. Fase 2 (metas) adiada: decidir depois de testar a pausa manual.

## Objetivo

O jogador pode pausar a produção automática de um recurso. Exemplo: com carne de sobra, ele pausa a caça e os filhos param de caçar. A mesma regra vale para todos os recursos que a família produz sozinha.

A pausa vale **só para a família**. O jogador continua podendo caçar, cortar e pescar manualmente.

## O que a família produz hoje

Tudo sai de `escolherTarefa` em [src/game/familia.js](../../src/game/familia.js):

| Recurso | Quem produz | Onde está a decisão |
|---|---|---|
| 🍖 Carne | Adolescentes e adultos caçam | `escolherTarefa` → `presaMaisProxima` |
| 🐟 Peixe | Dois adultos saem de jangada | `tentarViagemDePesca` ([jangada.js](../../src/game/jangada.js)) |
| 🪵 Madeira (+ 🌱 sementes) | Esposa, adolescentes e adultos cortam árvores | `escolherTarefa` → `arvoreMaisProxima` |
| 🪨 Pedra | Adultos no monte de pedra | `monteLivreParaColetar` / `coletarUma` ([montes.js](../../src/game/montes.js)) |
| 🧱 Tijolo | Adultos no monte de barro | idem |
| 🌾 Trigo (+ sementes de trigo) | Crianças no campo | `cuidarDoCampo` ([trigo.js](../../src/game/trigo.js)) |

Sementes e sementes de trigo vêm junto com madeira e trigo, então não têm pausa própria.

## Como fica para o jogador

**Tocar no medalhão do recurso no inventário pausa ou retoma.**

- Medalhão pausado: fica apagado, com um selo ⏸ no canto e "Pausado" no lugar do rótulo.
- Texto flutuante e aviso: "Caça pausada 🍖" / "Caça retomada 🍖".
- O título (tooltip) explica: "Toque para pausar a produção da família".
- Só os 6 recursos da tabela podem ser pausados. Sementes, sementes de trigo e animais não reagem ao toque.

A pausa fica no inventário porque é onde o jogador percebe que tem recurso demais. Não precisa de um menu novo.

## Regras

1. **Estado:** `mundo.pausas = { carne, peixe, madeira, pedra, tijolo, trigo }`, todos `false` no começo (em [mundo.js](../../src/game/mundo.js), no estado inicial e no reinício).
2. **Funções** num arquivo novo `src/game/pausas.js`: `pausado(recurso)` e `alternarPausa(recurso)`.
3. **Onde a pausa é checada:**
   - **Caça:** `escolherTarefa` pula a caça se `pausado('carne')`.
   - **Pesca:** `tentarViagemDePesca` não começa uma viagem se `pausado('peixe')`. Viagem já em andamento termina a pesca atual e volta.
   - **Madeira:** `escolherTarefa` pula o corte se `pausado('madeira')`. Plantar continua (gasta sementes, não produz recurso).
   - **Pedra / tijolo:** `monteLivreParaColetar` ignora montes de recurso pausado. Isso combina com o plano 2: com a pedra pausada, o 1º adulto vai para o barro.
   - **Trigo:** `cuidarDoCampo` não colhe nem planta se `pausado('trigo')`. A criança só passeia pelo campo.
4. **Tarefa em andamento:** termina a unidade atual e para. Na coleta, `coletarUma` devolve `null` se o recurso foi pausado.
5. **Sem nada para fazer:** o filho passeia, como já acontece hoje com o estoque cheio.
6. **Fora da pausa:** obras (ajudar), cabana, pedidos de comida e as ordens do jogador continuam funcionando.

## Mostrar o que está acontecendo

- `atividadeDe` (aparece na árvore da família): quem está parado por causa da pausa mostra "Descansando".
- Painel do filho: uma linha "Produção pausada: 🍖 🐟" quando houver pausas.

## Fase 2 (opcional): pausa automática por meta

Cada recurso pode ter uma **meta**, por exemplo "parar quando chegar a 300".

- A família para sozinha ao atingir a meta e volta abaixo de 80% dela.
- Na tela: segurar o dedo no medalhão (ou clique direito) abre um seletor com Sem meta / 100 / 300 / 500.
- Só vale fazer se a pausa manual (fase 1) se mostrar trabalhosa no dia a dia.

## Ordem de execução

1. `pausas.js` + estado em `mundo.js`.
2. Checagens em `familia.js`, `montes.js`, `jangada.js` e `trigo.js`.
3. Medalhão do inventário clicável, com o visual de pausado ([Inventario.jsx](../../src/components/Inventario.jsx)).
4. "Descansando" na árvore da família e linha no painel do filho.
5. Atualizar o [fluxograma](../fluxograma.html).

## Testes

- Pausar carne: ninguém começa caça nova. Quem estava caçando termina o animal atual. O jogador ainda consegue caçar.
- Pausar pedra com 2 adultos: o 1º vai para o barro e o 2º, sem monte livre, faz outra coisa.
- Pausar peixe durante uma viagem: a jangada volta depois da pesca atual.
- Pausar trigo: crianças passeiam no campo e não colhem.
- Pausar tudo: a família passeia, e obras e pedidos de comida continuam.
- Retomar: a família volta a produzir na próxima decisão.

## Decisões pendentes

- **Onde fica o controle:** tocar no medalhão do inventário (proposta) ou um painel "Produção" separado?
- **Madeira pausada:** a família também para de plantar, ou continua plantando (proposta)?
- **Fase 2 (metas):** entra agora ou só depois de testar a pausa manual?
