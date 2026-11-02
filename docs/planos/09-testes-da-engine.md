# Plano 9 — Testes automatizados da engine

> **Status:** aprovado e implementado em 2026-11-01, com as três recomendações. `npm test` passa: 420 testes em 5 arquivos, ~13 s. Nenhum bug encontrado; nenhum arquivo do jogo mudou.

## Problema

A engine em [src/game/](../../src/game/) não tem nenhum teste. Hoje, para conferir uma regra (passagem entre construções, rede de segurança, estoque), é preciso abrir o jogo e testar na mão, como nos planos 1 a 8. Uma mudança numa constante de [config.js](../../src/game/config.js) pode quebrar a passagem entre duas construções, e ninguém percebe até travar no jogo.

A engine é JavaScript puro, sem React e sem `window`/`document`. Todo o estado fica em `mundo` ([mundo.js](../../src/game/mundo.js)), e `limparMundo()` o zera. Por isso dá para testar tudo no Node, sem navegador.

## Solução

### 1. Vitest
- `vitest` **^3.2** como devDependency. A 3.x aceita Node 18 (`engines` do projeto, e o Node local é 18.20) e Vite 6. A 4.x e a 5.x pedem Node 20+.
- Scripts: `"test": "vitest run"` e `"test:watch": "vitest"`.
- Em [vite.config.js](../../vite.config.js): `test: { environment: 'node', include: ['src/game/__tests__/**/*.test.js'] }`.
- `import.meta.env.DEV` vale `true` no Vitest, mas `mundo.dev` começa `false`, então o modo dev ([dev.js](../../src/game/dev.js)) fica desligado nos testes.

### 2. Testes de unidade (`src/game/__tests__/`, `limparMundo()` no `beforeEach`)

**`espaco.test.js`**
- `folgaEntre`: círculo-círculo, quadrado-quadrado, círculo-quadrado (de lado e na diagonal da quina), e folga negativa quando se sobrepõem.
- `podeFicar`: livre no meio da ilha; bloqueado no miolo da árvore, no miolo da construção e no monte; livre dentro de uma área (`area: true`); bloqueado fora da ilha.
- `podeConstruirEm`: pode com folga exata `DISTANCIA_MIN_CONSTRUCAO`, não pode com um pouco menos; idem para monte; não pode no mar; jangada só na areia (`local`).
- `motivoNaoPlantar`: um caso para cada motivo (fora da grama, perto de árvore, perto de construção, perto do monte) e `null` quando pode.
- `saidaDaBorda`: `null` fora da borda e dentro de área; aponta para fora do centro dentro da borda; nunca maior que a largura da borda.

**`passagem.test.js`** (regra do plano 1 e do comentário em `config.js`)
- Os pares saem de `CONSTRUCOES`, todas as combinações de dois tipos diferentes, sem lista escrita à mão. Hoje são 9 tipos, ou seja, 36 pares.
- Cada par é posto no meio da ilha, alinhado no eixo x, a exatamente `DISTANCIA_MIN_CONSTRUCAO` de folga (pela `folgaEntre`).
- Um personagem (raio 10, o maior pé) sai de 80 acima do vão e anda reto para baixo com `mover()`.
- Confere: passou para o outro lado em até 2 s, **sem a rede de segurança** (`fantasma` nunca ligou) e sem nunca pisar no miolo de nenhuma das duas.
- Conferência extra, sem simular: `distância entre centros − mioloA − mioloB ≥ 2 × pé`.

**`movimento.test.js`**
- **Contorna árvore:** árvore adulta no meio do caminho reto; `mover()` chega ao destino sem atravessar o tronco e sem usar a rede de segurança.
- **Rede de segurança:** personagem preso num círculo fechado de árvores. Antes de `TEMPO_TRAVADO` continua dentro; logo depois, `fantasma` liga e ele sai.
- **Nunca entra no mar:** andando da praia para o mar por 5 s, e também preso perto da costa com a rede ligada; em todos os quadros `dentroDaIlha(x, y, raio)`.

**`inventario.test.js`**
- `ganhar`: soma; corta no limite do estoque; não faz nada com estoque cheio; quantidade negativa tira (usado em `plantarTrigo`).
- `gastarRecursos` e `temRecursos` com um e com vários recursos.
- `cabeNoEstoque`: no limite exato, acima dele, e com moinho (+150 por nível).

### 3. Simulação headless (`simulacao.test.js`)
- `criarMundo()` e depois `passo(1/60)` por 5 minutos de jogo (18.000 quadros).
- `Math.random` trocado por um gerador com semente (só no teste), rodando 3 sementes. Se falhar, a mensagem diz a semente e o segundo, para repetir.
- Se um aviso de construção abrir (`mundo.ui.conquista`), o teste fecha, senão o jogo fica pausado.
- Invariantes conferidas a cada quadro:
  - nenhum agente fora da ilha, a não ser embarcado;
  - nenhum recurso negativo e a soma nunca acima de `capacidadeDoEstoque()`;
  - nenhum `NaN` em `x`/`y` de agentes, animais, construções e cardumes.

## Onde

| O quê | Arquivo |
|---|---|
| Dependência e scripts | [package.json](../../package.json) |
| Configuração do Vitest | [vite.config.js](../../vite.config.js) |
| Testes | `src/game/__tests__/` (novo): `espaco`, `passagem`, `movimento`, `inventario`, `simulacao` |
| Gerador com semente e ajudantes (colocar construção, andar até) | `src/game/__tests__/ajudantes.js` (novo) |

Nenhum arquivo do jogo muda. Se um teste revelar um bug, eu paro e descrevo antes de corrigir.

## Decisões tomadas (2026-11-01)

As três recomendações foram aprovadas e implementadas.

1. **Simulação com a família.** Só com `criarMundo()`, o Jones fica parado: não há esposa, filhos nem animais, e a simulação testa pouco. Proposta: além do cenário pedido, um segundo cenário "ilha povoada", montado pelas funções do próprio jogo: totem e cabana prontos, recursos, `pedirEsposa`, `pedirAnimal` e filhos de cada fase, com o Jones recebendo `clicar()` num ponto sorteado a cada poucos segundos. Os mesmos 5 minutos e as mesmas invariantes.
2. **Montes na regra de passagem.** O plano 1 diz que os montes também cabem na regra (`DISTANCIA_MIN_CONSTRUCAO` vale entre construção e monte). Proposta: incluir os pares construção × monte, gerados de `MONTES`.
3. **Animais nas invariantes.** Eles usam o mesmo `mover()`. Proposta: conferir também "nenhum animal fora da ilha".

## Como ficou

| Arquivo | Testes |
|---|---|
| `espaco.test.js` | 23 |
| `inventario.test.js` | 9 |
| `passagem.test.js` | 378: 36 pares de construções + 18 construção × monte; 7 conferências por par (folga exata, vão para pessoa e para vaca, travessia reta e diagonal com os dois raios) |
| `movimento.test.js` | 4 |
| `simulacao.test.js` | 6: os dois cenários × sementes 1, 42 e 2026 |

- **Vitest 3.2.7.** O raio da maior pessoa (10) e o do maior animal (vaca, 13) saem de `ESPECIES`, não de uma lista à mão.
- **O teste de passagem pega regressão:** com `FATOR_MIOLO = 1` e `DISTANCIA_MIN_CONSTRUCAO = 4` (só por um momento, depois desfeito), 106 testes falham.
- **Ilha povoada:** as obras são feitas pelo próprio jogo (`construirEm` + `passo`), em modo dev só durante a montagem: totem, cabana, fogueira, campo de trigo, curral, moinho e jangada. Depois, esposa grávida, 3 casais de animais e 4 filhos (2 adultos, 1 adolescente, 1 criança). O Jones toca em pontos sorteados, cozinha, oferece o espeto, embarca, namora e pede chuva no minuto 2.
- **O que a ilha povoada exercita (conferido uma vez com uma sonda temporária):** nascimento e mudança de fase dos filhos, pesca na jangada, chuva com a família na cabana, pedidos de comida, caça, coleta nos montes, colheita de trigo e estoque cheio.

## Teste

`npm test` passa (420 testes, ~13 s) e `npm run build` continua igual (os testes não entram no build).
