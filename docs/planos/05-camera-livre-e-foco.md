# Plano 5 — Câmera volta ao Jones ao clicar

> **Status:** implementado em 2026-10-26 (aguardando teste no jogo).

## Problema

As setas soltam a câmera (`mundo.visao`), e ela só volta a seguir o Jones com o Espaço. Clicar na tela manda o Jones andar, mas a câmera fica parada onde as setas deixaram.

## O que muda

- **As setas continuam iguais:** movem a câmera livremente pelo mapa, sem mexer no Jones.
- **Clicar para o Jones se mover:** a câmera volta a segui-lo, deslizando até ele. A volta suave já existe hoje.

## Como

Em [src/game/jogo.js](../../src/game/jogo.js), na função `clicar`, chamar `centralizarCamera()` (que faz `mundo.visao = null`) nos pontos em que o Jones recebe uma ordem de se mover:

- clique no chão (`jogador.destino = p`);
- clique numa árvore para cortar;
- toque no mar com o Jones embarcado;
- clique nos modos plantar, expandir e construir.

Clicar numa pessoa, num animal ou numa construção só abre o painel e não mexe na câmera.

O Espaço continua funcionando como hoje. A dica e o fluxograma passam a dizer "tocar no chão volta a seguir o Jones".

## Teste

Mover a câmera com as setas, clicar no chão: o Jones anda e a câmera desliza até ele.
