# Plano 8 — Faixas do mar, mar profundo e cardumes grandes

> **Status:** implementado em 2026-11-01; testado e aprovado no jogo em 2026-11-01.

## Faixas, da costa para fora

| Faixa | Até (da costa) | Cor | Constante |
|---|---|---|---|
| Espuma | 7 | branca | `ESPUMA` |
| Mar raso | 48 | `#3d9ad6` | `FIM_DO_RASO` |
| Mar | 230 | `#2a7fc4` | `FIM_DO_MAR` |
| Mar profundo | borda do mapa | `#2068a6` (com faixa de transição de 14) | — |

Todas acompanham o contorno da ilha, inclusive os pedaços aterrados.

## Regras

- **Mar profundo:** só a jangada a partir do nível 4 (`NIVEL_MAR_PROFUNDO`) entra. Antes disso ela para na borda com o aviso "Mar profundo!". Se já estiver lá dentro (nível baixado no modo dev), pode sair.
- **Cardumes do mar:** até 4, nunca no raso nem no profundo, a pelo menos 5 (`FOLGA_CARDUME_RASO`) das duas bordas.
- **Cardumes grandes do mar profundo:** até 2 (`CARDUMES_PROFUNDOS_MAX`), inteiros no profundo, a pelo menos 5 da borda do mar. Valores em `PESCA_NO_PROFUNDO`:

  | | Mar | Mar profundo |
  |---|---|---|
  | Raio | 30 | 90 |
  | Pescas | 5 | 15 |
  | 🐟 por pesca | 2 | 4 |
  | Tempo por pesca | 4 s | 2 s |

- **Reposição:** um cardume a cada 20 s, primeiro os do mar, depois os do profundo.
- **Filhos:** com a jangada abaixo do nível 4, ignoram os cardumes do profundo.
- **Aterrar:** os cardumes que ficarem fora da faixa deles somem.

## Onde

- [config.js](../../src/game/config.js): constantes acima.
- [cardumes.js](../../src/game/cardumes.js): `cabeNaFaixa`, `pescaDe`, nascimento e movimento.
- [jangada.js](../../src/game/jangada.js): limite do mar profundo e pesca com os valores do cardume.
- [ilha.js](../../src/game/ilha.js): `noMarProfundo`.
- [Terreno.jsx](../../src/components/cena/Terreno.jsx), [Cena.jsx](../../src/components/cena/Cena.jsx), [Mar.jsx](../../src/components/cena/Mar.jsx): cores das faixas, fundo e cardumes grandes.

## Teste

Navegar com a jangada nível 1 para fora: ela para na borda do profundo com o aviso. Com nível 4, entra e pesca nos cardumes grandes (+4 🐟 a cada 2 s).
