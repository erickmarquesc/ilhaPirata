# Plano 2 — Preferência de recurso para filho adulto

> **Status:** implementado em 2026-10-25 (aguardando teste no jogo).

## Objetivo

Filhos adultos coletam nos montes de pedra e de barro (tijolo). Cada um passa a ter um recurso preferido:

| Filho adulto | Prioridade |
|---|---|
| 1º | Pedra 🪨 |
| 2º | Tijolo 🧱 (monte de barro) |

## Como funciona hoje

- `escolherTarefa` ([src/game/familia.js](../../src/game/familia.js)) chama `monteLivreParaColetar(a)`.
- `monteLivreParaColetar` ([src/game/montes.js](../../src/game/montes.js)) escolhe o monte livre **mais perto**, sem considerar o tipo. Com isso, o primeiro adulto pode ir para o barro e deixar a pedra parada.
- Um filho por monte (`trabalhadorDo`). `gerarMontes` cria um monte de cada tipo.
- A ordem de nascimento existe só em `mundo.contadorFilhos` e no nome. O agente não guarda o próprio número.

## Mudanças

### 1. Guardar a ordem do filho
- Em `nascerCrianca`, salvar `ordem: mundo.contadorFilhos` no agente.
- O nome já usa esse número, então não muda nada visível.

### 2. Definir o recurso preferido
- Função `recursoPreferido(a)` em `familia.js` ou `montes.js`:
  - pega os filhos adultos, ordenados por `ordem`;
  - posição 0 → `'pedra'`, posição 1 → `'barro'`;
  - posição 2 em diante → sem preferência (monte mais perto, como hoje).
- O critério é a **posição entre os adultos**, não o número absoluto de nascimento. Se o 1º filho estiver ocupado com outra coisa (por exemplo, embarcado), o próximo adulto não herda a pedra automaticamente; a preferência continua ligada a quem é o 1º adulto.

### 3. Escolher o monte respeitando a preferência
- `monteLivreParaColetar(a, preferido)`:
  1. se há um monte livre do tipo preferido, vai nele (mesmo que o outro esteja mais perto);
  2. senão (esgotado ou ocupado), pega o outro monte livre, para não ficar parado;
  3. quando o preferido voltar a ficar livre, o filho volta para ele ao terminar a coleta em andamento.
- No passo 3, `coletarUma` devolve a próxima coleta no mesmo monte. É preciso checar a preferência a cada unidade: se o filho está no monte "errado" e o preferido ficou livre, ele troca.

### 4. Evitar disputa entre os dois
- Como cada um prefere um tipo diferente, os dois não disputam o mesmo monte.
- Exemplo: o 2º adulto está no monte de pedra porque o barro estava esgotado. Quando o 1º adulto procurar tarefa, a pedra estará ocupada e ele cai no barro. Quando o barro recarregar, o 2º volta para o barro (passo 3) e o 1º volta para a pedra.

### 5. Texto no HUD (opcional)
- `atividadeDe` já mostra "Coletando pedra/barro". Nada obrigatório.
- Opcional: um ícone 🪨/🧱 ao lado do nome do filho indicando a preferência.

## Testes
- 1 filho adulto: vai sempre para a pedra; com a pedra esgotada, vai para o barro e volta quando a pedra recarregar.
- 2 filhos adultos: 1º na pedra, 2º no barro, mesmo que as distâncias favoreçam o contrário.
- 3º adulto: pega o monte livre restante ou segue para pesca/caça como hoje.
- Estoque cheio (`cabeNoEstoque`): ninguém coleta, como hoje.

## Decisões pendentes
- Com o preferido esgotado, o filho deve ir para o outro monte (proposta) ou esperar/fazer outra tarefa?
- O 3º adulto em diante fica sem preferência (proposta) ou alterna pedra/tijolo?
