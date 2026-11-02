# Plano 3 — Fogueira sem travar e oferenda aos deuses

> **Status:** implementado em 2026-10-25; testado e aprovado no jogo em 2026-11-01. Nova regra do favor (15 s, sem acumular) implementada em 2026-11-01; testada e aprovada no jogo.

## Problema (o travamento)

Regras atuais em [src/game/fogueira.js](../../src/game/fogueira.js):

- O prato fica no espeto até o último pedaço ser comido. Enquanto houver comida, `podeCozinhar` devolve `false`.
- Quem pede um prato diferente do que está no espeto fica parado esperando (`pedirComida`).

**Travamento:** sobra 1 churrasco no espeto e todos querem peixada. Ninguém come o churrasco, ele nunca acaba, a peixada nunca pode ser feita, e a família fica parada para sempre. O jogador não tem como sair disso.

Agravante: os pedidos sorteiam 50/50 entre churrasco e peixada (`novoPedido`), mesmo quando o jogador não tem peixe nem jangada para pescar.

## Solução em 3 partes

### Parte A — A comida torra sozinha (regra automática)

Se **mais de 50% da família** está pedindo um prato diferente do que está no espeto, a comida começa a torrar.

- **Família** = esposa + filhos (todos os agentes menos o jogador).
- **Contagem** = pedidos ativos de quem já chegou na fogueira (`quem.acao`) e quer outro prato.
- Condição: `pedidosDiferentes > família / 2`.

Comportamento:
1. Quando a condição é atingida, começa um contador `torrando` (sugestão: 10 s).
2. Aparece um aviso: texto flutuante "O churrasco está torrando! 🔥" e fumaça escura no modelo da fogueira ([Fogueira.jsx](../../src/components/cena/modelos/Fogueira.jsx)).
3. Se a condição deixar de valer antes do fim (alguém comeu, alguém desistiu), o contador zera.
4. No fim do contador: `comida.servido = null`, texto "O churrasco torrou! Os pedaços se perderam", e os recursos gastos não voltam.
5. Com o espeto livre, o jogador pode cozinhar o prato pedido.

O estado novo fica em `mundo.comida.torrando` (segundos restantes ou `null`) e é atualizado em `atualizarPedidosDeComida`.

### Parte B — Oferecer o espeto aos deuses (ação manual)

No [PainelFogueira](../../src/components/paineis/PainelFogueira.jsx), quando há comida no espeto, aparece um botão novo:

> 🙏 **Oferecer aos deuses** — "Entrega o que sobrou no espeto"

- Esvazia o espeto na hora (`comida.servido = null`), sem esperar a Parte A.
- Efeito visual: `luzDivina` (já usado no totem) sobre a fogueira e o texto "Os deuses aceitaram a oferenda!".
- A oferenda dá o **Favor dos deuses** (ver Parte C): 15 s de troca 1 → 1 (decisão de 2026-11-01; antes era 1 favor por pedaço). É isso que diferencia oferecer de deixar torrar, porque oferecer rende algo e torrar não.

### Parte C — Troca com os deuses (escambo)

Seção nova no painel da fogueira: **"Troca com os deuses"**. O jogador entrega um recurso e recebe outro.

**Taxa base:** 2 → 1. Exemplo do pedido: 20 🪵 madeira → 10 🪨 pedra.

Como fica na tela:
- Duas listas, **Dar** e **Receber**, com os recursos de `ICONES`: madeira, pedra, tijolo, carne, peixe, trigo, sementes.
- Lotes fixos para manter simples: **10 / 50 / 100** do recurso dado.
- O botão mostra o resultado: `Dar 20 🪵 → Receber 10 🪨`.
- Desabilitado quando:
  - faltar o recurso;
  - os dois recursos forem iguais;
  - o resultado não couber no estoque (`cabeNoEstoque`).

**Favor dos deuses (liga B e C):** por 15 s depois da oferenda, todas as trocas saem 1 → 1 em vez de 2 → 1 (não acumula). Assim o espeto oferecido não é desperdiçado.

Onde fica o código:
- `trocarComDeuses(dar, receber, qtd)` em um arquivo novo `src/game/oferenda.js`, usando `gastarRecursos`, `ganhar` e `cabeNoEstoque` de [inventario.js](../../src/game/inventario.js).
- `TAXA_TROCA = 2` e `LOTES_TROCA = [10, 50, 100]` em [config.js](../../src/game/config.js).
- `mundo.favor` (segundos de favor que faltam) em [mundo.js](../../src/game/mundo.js), no estado inicial e no reinício.

**Isso também resolve a falta de peixe:** sem jangada, o jogador troca madeira por peixe e atende a peixada.

### Parte D — Pedidos mais justos (prevenção)

Em `novoPedido`, só sortear peixada se o jogador tem peixe **ou** já tem jangada; senão o pedido é churrasco. Isso evita pedidos impossíveis desde o começo.

## Ordem de execução
1. **Parte A**: tira o travamento com regra automática, e já resolve a imagem do bug.
2. **Parte B**: botão de oferecer o espeto.
3. **Parte C**: troca com os deuses, com o favor como bônus.
4. **Parte D**: ajuste do sorteio dos pedidos.
5. Atualizar o README e o [fluxograma](../fluxograma.html) com as regras novas.

## Testes
- Espeto com 1 churrasco e 4 de 6 familiares pedindo peixada: depois de 10 s o churrasco torra e o espeto fica livre.
- Durante a contagem, alguém pede churrasco e come o último pedaço: o espeto acaba normalmente e não aparece mensagem de "torrou".
- Oferecer: espeto vazio, favor por 15 s, luz divina; com o favor ativo o botão fica bloqueado.
- Trocar 20 madeira → 10 pedra; trocar com o favor ativo → 1:1 (várias trocas nos 15 s); tentar com estoque cheio → botão desabilitado.
- Sem jangada e sem peixe: ninguém pede peixada.

## Decisões tomadas (2026-11-01)
- **Torrar:** 10 s de aviso (`TEMPO_TORRAR`), como está.
- **"Mais da metade da família":** conta a família toda (Syrena e filhos, sem o Jones), como está.
- **Taxa:** 2 → 1 fixa para todos os recursos. Martelo batido por agora; pode mudar ao longo do jogo no futuro.
- **Favor dos deuses — mudou:** oferecer o espeto dá o favor por **15 s** (`TEMPO_FAVOR`), em vez de 1 favor por pedaço. Enquanto dura, toda troca no totem sai 1 → 1 (dá 10, ganha 10). Não acumula: com o favor ativo o botão de oferecer fica bloqueado. Depois dos 15 s volta a 2 → 1. Implementado em 2026-11-01 ([oferenda.js](../../src/game/oferenda.js), painéis da fogueira e do totem; testado e aprovado no jogo).
- **Onde:** oferenda na fogueira, troca no Totem da Vida, como está.
