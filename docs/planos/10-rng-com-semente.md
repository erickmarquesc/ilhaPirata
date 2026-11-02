# Plano 10 — Gerador aleatório com semente

> **Status:** aprovado e implementado em 2026-11-01, com as três recomendações. `grep -rn Math.random src/game` não acha nada; `npm test` passa: 428 testes em 7 arquivos, ~13 s.

## Problema

A engine sorteia com `Math.random`, que não tem semente. Um bug visto no jogo não pode ser repetido, e a simulação de [simulacao.test.js](../../src/game/__tests__/simulacao.test.js) só é estável porque o teste troca `Math.random` com `vi.spyOn` (gerador de [ajudantes.js](../../src/game/__tests__/ajudantes.js)). Fora do teste, nada garante que a mesma partida se repita.

Levantamento (`grep -o Math.random`): **45 usos em `src/`**, sem contar o teste.

| Arquivo | Usos | Para quê |
|---|---|---|
| [animais.js](../../src/game/animais.js) | 9 | espera inicial, espécie e sexo do animal pedido, sexo do filhote, passeio perto do curral ou solto, espera |
| [cardumes.js](../../src/game/cardumes.js) | 8 | posição do cardume (anel raso / mar profundo), direção, fase, mudança de rumo |
| [familia.js](../../src/game/familia.js) | 5 | passeio da família e espera |
| [fogueira.js](../../src/game/fogueira.js) | 5 | tempo entre pedidos, lugar de quem espera, quem pede, churrasco ou peixada |
| [arvores.js](../../src/game/arvores.js) | 3 | raio da árvore e lugar das árvores iniciais |
| [trigo.js](../../src/game/trigo.js) | 3 | ponto no campo e espera |
| [chuva.js](../../src/game/chuva.js) | 2 | onde nasce cada muda na chuva |
| [montes.js](../../src/game/montes.js) | 2 | lugar dos montes |
| [cabana.js](../../src/game/cabana.js) | 1 | espalhar quem sai da cabana |
| [Chuva.jsx](../../src/components/cena/Chuva.jsx) | 6 | pingos de chuva: posição, velocidade e volta ao topo |
| [Totem.jsx](../../src/components/cena/modelos/Totem.jsx) | 1 | fase da chama da tocha |

Total em `src/game/`: 38 em 9 arquivos. Nos componentes: 7 em 2 arquivos.

## Solução

### 1. `src/game/aleatorio.js` (novo)
- Mulberry32, sem dependência (o mesmo de `geradorComSemente` em ajudantes.js). O estado fica no módulo.
- `definirSemente(n)`: guarda `n >>> 0` como estado inicial.
- `sortear()`: número em [0, 1), no lugar de `Math.random()`.
- `entre(min, max)`: número em [min, max).
- `escolher(lista)`: um item da lista (`undefined` se vazia).
- `novaSemente()`: semente para quando `criarMundo` não recebe uma. Usa `Date.now() >>> 0`. Não usa `Math.random` (o grep tem que ficar vazio) nem `crypto` global (no Node 18, versão local, ele ainda não é global por padrão).

### 2. Troca em `src/game/`
Todos os 38 usos. Onde o padrão aparece, a troca simplifica:
- `min + Math.random() * (max - min)` e `a + Math.random() * b` → `entre(...)`. Ex.: `espera: entre(2, 5)`, `sortearEspera()` vira `entre(min, max)`.
- `lista[Math.floor(Math.random() * lista.length)]` → `escolher(lista)` (espécie em animais.js, quem pede em fogueira.js).
- `Math.random() < 0.5 ? 'f' : 'm'` → `escolher(['f', 'm'])`.
- O resto vira `sortear()`, sem mudar a conta.

A ordem dos sorteios dentro de cada função continua a mesma; o jogo não muda de comportamento, só passa a ter semente.

### 3. Componentes 3D: ficam com `Math.random`
Os dois casos são só visuais e não tocam no `mundo`:
- **Chuva.jsx** (6 usos): posição inicial, velocidade e volta ao topo de cada pingo. Onde a muda nasce é sorteado em `chuva.js`, que muda.
- **Totem.jsx** (1 uso): fase do balanço da chama de cada tocha.

Se usassem o gerador da engine, a renderização (que roda num ritmo diferente do jogo) gastaria números da sequência e quebraria a repetição. Por isso eles **não podem** usar `sortear()`.

### 4. `criarMundo(semente?)`
- `criarMundo(semente = novaSemente())`: chama `definirSemente(semente)` antes de tudo e guarda em `mundo.semente`.
- `semente` entra em `mundo` (com comentário) e em `limparMundo`.
- `relogioUI` (jogo.js) volta a 0 em `criarMundo`. Hoje ele passa de uma partida para a outra; não sorteia nada, mas decide em que quadro `validarPainel()` roda.

### 5. Semente no painel Dev
Uma linha no topo do `PainelDev` ([Dev.jsx](../../src/components/Dev.jsx)): `Semente: 123456789`, em fonte mono e selecionável para copiar.

### 6. Testes
- **`aleatorio.test.js`** (novo): mesma semente → mesma sequência; `entre` dentro de [min, max); `escolher` só devolve itens da lista; `definirSemente` reinicia a sequência.
- **`determinismo.test.js`** (novo): cenário da ilha povoada (o que mais sorteia) por 2 minutos, duas vezes com a mesma semente → resumos iguais (`toEqual`); com outra semente → resumo diferente.
  - Resumo: inventário; contagens de agentes, animais, árvores, estruturas, cardumes e montes; posição de cada agente, animal e cardume arredondada a 0,01; `mundo.chuva`, `mundo.favor` e `mundo.contadorFilhos`.
  - Para isso, `povoarIlha`, `jogadorAleatorio` e os ajudantes de montagem saem de `simulacao.test.js` para `ajudantes.js`, sem mudar.
- **`simulacao.test.js`**: sai o `vi.spyOn(Math, 'random')`; passa a chamar `criarMundo(semente)`. O sorteio das jogadas do teste continua com `geradorComSemente` (sequência separada do jogo, para as jogadas não mudarem o que o jogo sorteia). O comentário que cita `Math.random` é reescrito.

## Onde

| O quê | Arquivo |
|---|---|
| Gerador | `src/game/aleatorio.js` (novo) |
| Troca dos sorteios | animais, arvores, cabana, cardumes, chuva, familia, fogueira, montes, trigo (`src/game/`) |
| Semente no mundo | [jogo.js](../../src/game/jogo.js), [mundo.js](../../src/game/mundo.js) |
| Painel | [Dev.jsx](../../src/components/Dev.jsx) |
| Testes | `aleatorio.test.js` e `determinismo.test.js` (novos), [simulacao.test.js](../../src/game/__tests__/simulacao.test.js), [ajudantes.js](../../src/game/__tests__/ajudantes.js) |

## Limite

No navegador, o `dt` de cada quadro vem do relógio do `requestAnimationFrame` e varia. A mesma semente dá o mesmo mapa inicial (árvores, montes, cardumes), mas a partida em si só se repete com `dt` fixo, como nos testes. Repetir uma partida jogada à mão pediria gravar o `dt` e as entradas de cada quadro; fica fora deste plano.

## Decisões tomadas (2026-11-01)

As três recomendações foram aprovadas e implementadas.

1. **Semente pela URL no modo dev.** Para repetir no navegador um mapa visto no painel: `main.jsx` lê `?semente=123` (só com `import.meta.env.DEV`) e passa para `criarMundo`. Recomendo incluir: são três linhas e fecham o ciclo "vi a semente → abro de novo com ela".
2. **Cenário do teste de determinismo.** Recomendo a ilha povoada com o jogador aleatório (exercita família, animais, fogueira, chuva e pesca). Alternativa: rodar também a ilha nova, sem jogadas (mais rápido, mas sorteia pouco além do mapa e dos cardumes).
3. **`geradorComSemente` em ajudantes.js.** Recomendo manter (o teste usa uma sequência própria para as jogadas), mas implementado com o mesmo mulberry32 de `aleatorio.js`, para não haver duas cópias do algoritmo: `aleatorio.js` exporta também `criarGerador(semente)`, usado pelo estado do módulo e pelo teste.

## Teste

- `grep -rn Math.random src/game` não acha nada (nem no teste).
- `npm test` verde, com os testes novos.
- `npm run build` continua passando.

## Como ficou

- **`aleatorio.js`:** `criarGerador`, `definirSemente`, `novaSemente`, `sortear`, `entre`, `escolher`. Os 38 sorteios foram trocados na mesma ordem; `sortearEspera()` (fogueira.js) virou `entre(...TEMPO_ENTRE_PEDIDOS)`.
- **`criarMundo(semente)`** guarda `mundo.semente` e zera `relogioUI`. No `npm run dev`, `?semente=123` na URL repete o mapa; o painel Dev mostra a semente (selecionável).
- **Testes:** `aleatorio.test.js` (5) e `determinismo.test.js` (3: semente guardada, mesma semente → mesmo mundo, outra semente → mundo diferente). `povoarIlha`, `jogadorAleatorio` e `DT` foram para `ajudantes.js`; `geradorComSemente` saiu, e os testes usam `criarGerador`.
- **O teste pega regressão:** com um `Math.random` posto de volta só por um momento em `passear` (familia.js), "mesma semente → mesmo mundo" falha.
- `npm run build` continua passando.
