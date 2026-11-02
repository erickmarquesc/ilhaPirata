# Plano 7 — Cursor de machado nas árvores

> **Status:** implementado em 2026-11-01; testado e aprovado no jogo em 2026-11-01.

## Objetivo

Com o mouse em cima de uma árvore que dá para cortar, o cursor vira um 🪓 machado.

## Regras

- Aparece em árvore **adulta** (pinheiro ou árvore da chuva).
- Não aparece em muda crescendo, com um modo ativo (plantar, construir, expandir) nem navegando, porque aí o clique não corta.
- O ponto do clique fica no fio da lâmina.

## Onde

- [Cursor.jsx](../../src/components/cena/Cursor.jsx): desenho do machado (SVG) e a regra; troca o cursor do canvas só quando muda.
- [Arvores.jsx](../../src/components/cena/Arvores.jsx): cada árvore avisa quando o mouse entra e sai (`onPointerOver` / `onPointerOut`).

## Ideias para depois

Outros cursores no mesmo arquivo: espada nos animais, picareta nos montes, mão nas construções.
