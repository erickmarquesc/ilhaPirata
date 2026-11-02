# Ilha do Náufrago

Jogo de sobrevivência numa ilha, em 3D low-poly, feito com **Vite + React + Tailwind CSS +
React Three Fiber (three.js)**.
📖 **Documentação:** [docs/fluxograma.html](docs/fluxograma.html) — fluxograma de recursos, personagens, fluxos e tempos do jogo (abra no navegador).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

🛠️ **Modo dev:** no `npm run dev` aparece um botão **dev** no canto inferior direito.
Ligado, todas as construções ficam liberadas: não gastam recursos, não pedem filhos
nem o nível do totem e ficam prontas assim que o Jones chega. O painel também troca o
nível de cada construção já construída (ou de todas de uma vez). No `npm run build` o
botão não existe.

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
│   ├── agentes.js        # base dos personagens: posição, destino, tarefa e ação
│   ├── familia.js        # esposa, filhos e a IA da família
│   ├── cabana.js         # dentro da cabana: namorar e cuidar do bebê
│   ├── montes.js         # montes de barro e pedra (500 unidades, recarga em 60 s)
│   ├── jangada.js        # embarque, pesca, empurrar para a água e rumo do barco (rumoVisual)
│   ├── arvores.js        # pinheiros e árvores da chuva (2× tempo e 2× recursos)
│   ├── animais.js, trigo.js, cardumes.js
│   ├── fogueira.js       # churrasco/peixada e pedidos de comida da família
│   ├── chuva.js          # chuva pedida no totem: plantas crescem 3× mais rápido, família na cabana, brotam árvores da chuva
│   ├── oferenda.js       # oferecer o espeto aos deuses (fogueira) e trocar recursos (totem)
│   ├── pausas.js         # pausar/retomar a produção da família por recurso
│   ├── canhoes.js        # canhões do barco pirata (Espaço, só efeito visual)
│   ├── ilha.js, espaco.js, movimento.js, estruturas.js, inventario.js
│   ├── efeitos.js        # textos flutuantes e luz divina
│   ├── dev.js            # modo dev: obras sem custo/requisitos e troca de nível (só no npm run dev)
│   ├── ui.js             # modo plantar/construir, menu, painel aberto e aviso de conquista
│   └── expansao.js       # aterrar o mar para aumentar a ilha
├── hooks/                # useMundo (store → React), useTeclado, usePiscar
└── components/
    ├── ui/               # Painel, Botao (compound components), Custo, ListaCusto,
    │                     # Moldura (moldura de madeira), Flamula (botão bandeirinha)
    ├── Hud.jsx           # <Hud> + .Topo / .Meio / .Base, HudPadrao (layout da esquerda)
    ├── Inventario.jsx    # recursos em fichas: <Inventario> + .Grade / .Item / .Rodape
    ├── ArvoreFamilia.jsx # árvore genealógica: .Casal / .Coracao / .Filhos / .Membro
    ├── CartasConstrucao.jsx # cartas de construção que brilham quando dá para construir/evoluir
    ├── PainelInteracao.jsx  # escolhe o painel pelo tipo
    ├── paineis/          # Totem, Esposa, Filho, Animal, Campo, Jangada, Fogueira, Monte, Estrutura
    ├── Conquista.jsx     # aviso de construção concluída (placa pirata; pausa o jogo)
    ├── Dica.jsx          # dica de controles no topo da tela
    ├── Dev.jsx           # botão "dev" no canto inferior direito (só no npm run dev)
    └── cena/             # tudo que é 3D
        ├── Cena.jsx      # <Canvas>, loop do jogo e ordem da cena
        ├── Camera.jsx    # segue o Jones, câmera livre (setas/WASD, Espaço volta; no barco pirata, Espaço atira),
        │                 # zoom (roda/pinça), sol e sombras
        ├── Terreno.jsx   # mar, raso, espuma, areia, grama, rochas, tufos
        ├── Cursor.jsx    # cursor de machado sobre árvore adulta
        ├── Arvores.jsx, Estruturas.jsx, Montes.jsx, Mar.jsx (cardumes, luz divina)
        ├── Disparos.jsx  # bolas de canhão, clarão, fumaça e respingo
        ├── Chuva.jsx     # pingos caindo em volta da câmera e o sol escurecendo
        ├── Seres.jsx     # pessoas e animais (perto: AnimalAnimado; longe: AnimaisSimples)
        ├── Previas.jsx   # prévias de plantar/construir/expandir e marcadores
        ├── Rotulos.jsx   # camada 2D por cima: níveis, barras e textos flutuantes
        ├── Miniaturas.jsx   # imagens dos modelos 3D para as cartas e a placa de conquista
        ├── Instancias.jsx   # várias cópias numa chamada só (InstancedMesh)
        ├── Peca.jsx, materiais.jsx # primitivas low-poly e materiais compartilhados
        ├── coords.js     # mundo (x, y) ↔ cena 3D, altura do chão, contorno da ilha
        ├── clique.js, gestos.js # toque em objetos e estado da pinça
        └── modelos/      # Totem, Cabana, Moinho, Fogueira, Embarcacoes (jangada → barco pirata),
                          # Cercados, Construcoes (campo de trigo), Trigal, Montes,
                          # Natureza (pinheiro, árvore da chuva), Seres (pessoa), Animais
```

📋 **Planos:** [docs/planos/](docs/planos/) guarda o plano de cada mudança, com status no topo.

**Fluxo:** a engine altera `mundo` e chama `notificar()`; os componentes leem
`mundo` via `useMundo()` (`useSyncExternalStore`). A interface é atualizada nos
eventos e 4x por segundo. Na cena 3D, cada objeto lê a posição do mundo a cada
quadro (`useFrame`), então o movimento é suave sem re-renderizar o React.
