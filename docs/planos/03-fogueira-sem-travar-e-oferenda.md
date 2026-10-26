# Plano 3 — Fogueira sem travar e oferenda aos deuses

> **Status:** implementado em 2026-10-25 (aguardando teste no jogo).

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
- Os pedaços entregues viram **Favor dos deuses** (ver Parte C): cada pedaço = 1 favor. É isso que diferencia oferecer de deixar torrar, porque oferecer rende algo e torrar não.

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

**Favor dos deuses (opcional, liga B e C):** cada favor melhora a taxa de uma troca, de 2 → 1 para 1 → 1. Assim o espeto oferecido não é desperdiçado.

Onde fica o código:
- `trocarComDeuses(dar, receber, qtd)` em um arquivo novo `src/game/oferenda.js`, usando `gastarRecursos`, `ganhar` e `cabeNoEstoque` de [inventario.js](../../src/game/inventario.js).
- `TAXA_TROCA = 2` e `LOTES_TROCA = [10, 50, 100]` em [config.js](../../src/game/config.js).
- `mundo.favor` (número) em [mundo.js](../../src/game/mundo.js), no estado inicial e no reinício.

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
- Oferecer com 3 pedaços: espeto vazio, +3 favor, luz divina.
- Trocar 20 madeira → 10 pedra; trocar com favor → 1:1; tentar com estoque cheio → botão desabilitado.
- Sem jangada e sem peixe: ninguém pede peixada.

## Decisões pendentes
- **Torrar:** 10 s de aviso está bom, ou deve ser imediato?
- **"50% da família":** contar a família toda (proposta) ou só quem está na fogueira?
- **Taxa:** 2 → 1 fixa para tudo, ou cada recurso com um valor próprio (pedra e tijolo mais caros que madeira)?
- **Favor dos deuses:** entra agora, ou a oferenda só limpa o espeto?
- **Onde trocar:** só na fogueira (proposta), ou também no totem, que já é o lugar dos deuses?
