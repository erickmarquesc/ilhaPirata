# Ilha do Náufrago

Jogo de sobrevivência numa ilha, em 3D low-poly, feito com **Vite + React + Tailwind CSS +
React Three Fiber (three.js)**.
O arquivo original de página única está em `jogo-pirata.html`, como referência.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

> Tailwind 4 pede Node 20+. Em Node 18 funciona porque o binário nativo
> (`@tailwindcss/oxide-linux-x64-gnu`) está em `optionalDependencies`.

## Estrutura

```
src/
├── game/                 # engine pura (sem React)
│   ├── mundo.js          # estado único do jogo + store (notificar/assinar)
│   ├── config.js         # constantes, espécies, textos
│   ├── construcoes.js    # catálogo de construções
│   ├── pedidos.js        # pedidos do Totem da Vida
│   ├── jogo.js           # criarMundo, passo (loop), entrada (clique/teclas)
│   ├── acoes.js          # ações disparadas pela interface (evoluir, construir)
│   ├── tarefas.js        # tarefas/ações dos personagens
│   ├── familia.js        # esposa, filhos e a IA da família
│   ├── animais.js, trigo.js, jangada.js, cardumes.js, arvores.js
│   ├── ilha.js, espaco.js, movimento.js, estruturas.js, inventario.js
│   ├── ui.js             # modo plantar/construir, menu e painel aberto
│   └── expansao.js       # aterrar o mar para aumentar a ilha
├── hooks/                # useMundo (store → React), useTeclado, usePiscar
└── components/
    ├── ui/               # Painel, Botao (compound components), Custo
    ├── Inventario.jsx    # <Inventario> + .Item / .Separador / .Rodape
    ├── MenuConstrucoes.jsx  # <MenuConstrucoes> + .Item / .Requisito
    ├── Hud.jsx           # <Hud> + .BotaoPlantar / .BotaoConstrucoes, HudPadrao
    ├── PainelInteracao.jsx  # escolhe o painel pelo tipo
    ├── paineis/          # Totem, Esposa, Filho, Animal, Campo, Jangada, Estrutura
    ├── Dica.jsx
    └── cena/             # tudo que é 3D
        ├── Cena.jsx      # <Canvas>, loop do jogo e ordem da cena
        ├── Camera.jsx    # segue o jogador, zoom (roda/pinça), sol e sombras
        ├── Terreno.jsx   # mar, raso, espuma, areia, grama, rochas, tufos
        ├── Arvores.jsx, Seres.jsx, Estruturas.jsx, Mar.jsx (cardumes, luz divina)
        ├── Previas.jsx   # prévias de plantar/construir/expandir e marcadores
        ├── Rotulos.jsx   # camada 2D por cima: níveis, barras e textos flutuantes
        ├── Peca.jsx      # primitivas low-poly compartilhadas
        └── modelos/      # Totem, Cabana, Jangada, Cercado, CampoTrigo, Pessoa, Animal, Pinheiro
```

**Fluxo:** a engine altera `mundo` e chama `notificar()`; os componentes leem
`mundo` via `useMundo()` (`useSyncExternalStore`). A interface é atualizada nos
eventos e 4x por segundo. Na cena 3D, cada objeto lê a posição do mundo a cada
quadro (`useFrame`), então o movimento é suave sem re-renderizar o React.
