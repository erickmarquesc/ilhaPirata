# Plano 1 — Refatoração da física (passagem entre construções)

> **Status:** itens 1, 2, 4 e 5 implementados em 2026-10-25; testado e aprovado no jogo em 2026-11-01. Item 3 (borda macia) implementado em 2026-11-01; testado e aprovado no jogo. Item 6 (overlay) fica para depois.

## Problema

Quando duas construções ficam perto, o personagem não consegue passar entre elas e fica preso.

- `podeFicar` ([src/game/espaco.js](../../src/game/espaco.js)) bloqueia quando a distância ao centro é menor que `s.raio + raio do personagem`: raio cheio da construção mais o raio cheio da pessoa (10).
- `DISTANCIA_MIN_CONSTRUCAO = 12` ([src/game/config.js](../../src/game/config.js)) é a folga mínima entre as bordas de duas construções.
- Para passar, o personagem precisa de 2 × 10 = 20 de espaço, mas o jogo deixa construir com só 12. Duas construções vizinhas viram uma parede.
- As árvores não têm esse problema: `colisaoArvore` usa só o miolo do tronco (35%) e o pé do personagem (40%).

## Solução

### 1. Separar ocupação de colisão
- **Ocupação** = o `raio` de hoje. Continua valendo para construir, plantar e interagir (`pertoDe`).
- **Miolo** = `raio × FATOR_MIOLO` (sugestão: 0,6). É só ele que bloqueia quem anda.
- Campo opcional `miolo` em [src/game/construcoes.js](../../src/game/construcoes.js) para construções que precisem de um valor próprio (por exemplo, a cabana).
- O personagem colide pelo **pé**: `min(raio, 10) × 0,4` ≈ 4, igual às árvores.

### 2. Garantir a passagem por regra
Regra a documentar em `config.js`:

```
DISTANCIA_MIN_CONSTRUCAO + (1 − FATOR_MIOLO) × (rA + rB) ≥ 2 × pé + margem
```

Par mais apertado (fogueira 14 + totem 16, fator 0,6): folga real = 12 + 0,4 × 30 = 24, contra 8 necessários. Os montes (`0,8 / 0,5`) também cabem na regra.

### 3. Borda macia ("um pouco por cima") — implementado em 2026-11-01
- O miolo bloqueia como hoje.
- Na faixa entre o miolo e o raio cheio, o personagem pode entrar, mas é empurrado de leve para fora a cada quadro, em `mover` ([src/game/movimento.js](../../src/game/movimento.js)).
- Resultado: ele raspa na quina e escorrega, em vez de parar.
- **Como ficou:** `saidaDaBorda` ([espaco.js](../../src/game/espaco.js)) diz quanto e para onde sair; `escorregarDaBorda` ([movimento.js](../../src/game/movimento.js)) empurra a `EMPURRAO_BORDA` = 70 por segundo, só depois de andar e só se o lugar novo estiver livre (nunca para outro obstáculo nem para o mar). Com a rede de segurança ligada, não empurra. Vale para pessoas e animais.
- **Teste (simulação):** no vão entre fogueira e totem encostados o personagem passa no mesmo tempo; rente à cabana fica 15 longe do miolo (antes 10); de frente contra a cabana contorna em 1,73 s (antes 1,67) e nunca precisou atravessar por cima.

### 4. Rede de segurança contra travar
- Contar o tempo seguido em que `mover` devolve `false`.
- Depois de ~1,5 s, ignorar as construções (nunca o mar) até sair, como o modo `preso` já faz hoje.

### 5. Rota coerente com a colisão
- `custoSegmento` ([src/game/movimento.js](../../src/game/movimento.js)) usa `s.raio + 12` e soma +400.
- Isso faz a rota contornar pela praia mesmo quando há passagem.
- Passar a usar o mesmo miolo da colisão.

### 6. Overlay de depuração — opcional
Uma tecla que desenha no chão o miolo, o raio cheio e o pé de cada personagem, para calibrar o fator olhando o modelo 3D.

## O que não muda
- As regras de construir e de plantar continuam com a ocupação cheia.
- Os abrigos (`area: true`) continuam sem bloquear.
- Os animais usam `podeFicar` e ganham a mesma melhora.

## Ordem de execução
1. Itens 1, 2, 4 e 5 (poucas linhas em `espaco.js`, `movimento.js` e `config.js`).
2. Testar no jogo: construir fogueira, totem e cabana encostados e atravessar entre eles.
3. Borda macia (item 3): feita em 2026-11-01. Overlay (item 6): fica para depois.

## Decisões tomadas (2026-11-01)
- **`FATOR_MIOLO`:** valor único 0,6 para todas as construções. O campo `miolo` por construção continua disponível, só para quando alguma precisar.
- **Borda macia:** sim. Miolo menor + borda macia (item 3) para o personagem andar bem perto das construções.
- **Rede de segurança:** pode atravessar construções e árvores, nunca o mar.
