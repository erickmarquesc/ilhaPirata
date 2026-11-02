# Plano 6 — Pedido de chuva no Totem da Vida

> **Status:** implementado em 2026-11-01; testado e aprovado no jogo em 2026-11-01.

## Objetivo

Um terceiro pedido aos deuses, ao lado da esposa e do animal: **🌧️ Chuva**.

## Regras

- **Custo:** 20 🪵 + 2 🌱. Não dá para pedir de novo enquanto chove ("Já está chovendo").
- **Duração:** 60 s (`TEMPO_CHUVA`). No fim aparece "A chuva parou".
- **Plantas:** mudas de árvore e trigo crescem 3× mais rápido (`CRESCIMENTO_NA_CHUVA`).
- **Família:** ninguém trabalha. Syrena e os filhos param e entram na cabana até a chuva passar; sem cabana, esperam parados. A jangada dos filhos volta, ninguém ajuda em obras nem pede comida. Cuidar do bebê e namorar continuam. O Jones (jogador) continua trabalhando.
- **Árvores da chuva:** ao começar a chover brotam 5 mudas (`ARVORES_POR_CHUVA`) em lugares sorteados da grama. Tronco claro e copa redonda turquesa. Comparadas ao pinheiro levam o dobro (`FATOR_ARVORE_CHUVA`) para crescer (120 s) e para serrar (10 s) e dão o dobro: 40 🪵 + 4 🌱. Com o efeito da chuva, ficam adultas antes dela acabar.

## Onde

| O quê | Arquivo |
|---|---|
| Pedido | [pedidos.js](../../src/game/pedidos.js) |
| Chuva, ritmo das plantas e árvores que brotam | [chuva.js](../../src/game/chuva.js) |
| Tipos de árvore (`tempoCrescer`, `tempoSerrar`, `madeiraDe`, `sementesDe`) | [arvores.js](../../src/game/arvores.js) |
| Família na cabana (tarefa `abrigarNaCabana`) | [familia.js](../../src/game/familia.js), [cabana.js](../../src/game/cabana.js), [tarefas.js](../../src/game/tarefas.js) |
| Obras, pesca e comida bloqueadas na chuva | [estruturas.js](../../src/game/estruturas.js), [jangada.js](../../src/game/jangada.js), [fogueira.js](../../src/game/fogueira.js) |
| Pingos e sol mais fraco | [Chuva.jsx](../../src/components/cena/Chuva.jsx), [Camera.jsx](../../src/components/cena/Camera.jsx) |
| Modelo da árvore da chuva | [Natureza.jsx](../../src/components/cena/modelos/Natureza.jsx) |

## Teste

Pedir chuva com a família trabalhando: todos vão para a cabana, brotam 5 mudas turquesa e, quando a chuva para, todos voltam ao trabalho. Serrar uma árvore da chuva adulta: 10 s e +40 🪵 +4 🌱.
