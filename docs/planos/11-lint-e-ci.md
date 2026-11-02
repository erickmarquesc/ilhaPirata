# Plano 11 — ESLint, Prettier e CI

> **Status:** aprovado e implementado em 2026-11-02, com as três recomendações. `lint` (0 erros, 57 avisos), `format:check`, `test` (428 testes) e `build` passam localmente. Ver "Como ficou" sobre o Node 18.

## Problema

O projeto não tem linter, formatador nem CI. O estilo é mantido à mão, e nada confere, num push ou num PR, se os testes (plano 9) passam e se o build sai.

## Levantamento (medido antes de escrever o plano)

Rodei as ferramentas numa pasta temporária, fora do repositório; nada no projeto mudou.

### Estilo atual (`src/`, 102 arquivos)
- Aspas simples: 593 imports com `'`, nenhum com `"`. Em JSX, os atributos usam `"` (723 casos), que é o padrão do Prettier (`jsxSingleQuote: false`).
- Ponto e vírgula em todo lugar; indentação de 2 espaços; sem tabs.
- Largura das linhas: mediana 36, p90 89, **p99 144**, máx. 280. 545 linhas passam de 100 colunas e 233 passam de 120.
- Arrow de um parâmetro sem parênteses (`o => ...`): 278 casos, nenhum `(o) => ...`.

### Largura do Prettier: linhas do código atual que mudam
Com `singleQuote`, `semi` e `arrowParens: "avoid"`:

| `printWidth` | Linhas removidas | Linhas inseridas |
|---|---|---|
| 120 | 919 | 2923 |
| 130 | 876 | 2585 |
| 140 | 873 | 2375 |
| **150** | **861** | **2151** |
| 160 | 875 | 2054 |

**150** é o mínimo de linhas mexidas: a partir de 160, o Prettier começa a juntar linhas que hoje estão quebradas. `arrowParens: "avoid"` mexe em ~100 linhas a menos que `"always"`. `trailingComma` `all` ou `es5` dá quase o mesmo resultado (2 linhas de diferença); fico com o padrão (`all`).

Mesmo com a melhor configuração, umas 860 linhas mudam. O motivo são escolhas do código atual que o Prettier não aceita de jeito nenhum: várias instruções numa linha (`filho.position.set(...); filho.scale.set(...);`), `const a = ..., b = ...;`, chaves de objeto alinhadas com espaços (`ovelha:  { ... }`), `if (...) { ...; return ...; }` em uma linha e JSX longo. Por isso a formatação vai num commit separado, listado em `.git-blame-ignore-revs`.

### ESLint
Com a configuração proposta abaixo:
- **1 erro**: `mundo` importado e não usado em [cabana.js:4](../../src/game/cabana.js#L4). A correção é apagar o import; a lógica não muda.
- **32 avisos `import/no-cycle`**. O ciclo não é só `tarefas.js` ↔ `familia.js`: passa por `chuva`, `pedidos`, `animais`, `estruturas`, `inventario`, `ilha`, `espaco`, `jangada`, `trigo`, `fogueira`, `ui` e outros de `src/game/`. Fica como aviso, como pedido; o plano que resolver o ciclo vai ter mais trabalho do que parece.
- **25 avisos `react-refresh/only-export-components`**: arquivos que exportam componentes e também constantes ou funções (`materiais.jsx`, `Peca.jsx`, `modelos/*.jsx`...). Ficam como aviso; só afetam o recarregamento rápido do Vite no `npm run dev`.

## Solução

### 1. ESLint 9, `eslint.config.js` (flat config)
Dependências de desenvolvimento: `eslint@9`, `@eslint/js@9`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-react`, `eslint-plugin-import`.

- Ignora `dist/`.
- `**/*.{js,jsx}`: `ecmaVersion: 'latest'`, módulos, JSX ligado, globais do navegador.
- `vite.config.js` e `src/game/__tests__/`: globais do Node (os testes já importam `describe`/`it` do `vitest`; não precisam de globais do Vitest).
- Regras:
  - `js.configs.recommended`.
  - `react-hooks/rules-of-hooks`: erro; `react-hooks/exhaustive-deps`: aviso (decisão 1).
  - `react-refresh/only-export-components`: aviso, com `allowConstantExport: true`.
  - `react/jsx-uses-vars`: erro. É a única regra do `eslint-plugin-react`. Sem ela, o `no-unused-vars` não enxerga uso em JSX e acusa **178 falsos erros** (todo componente importado e usado só como `<Componente />`).
  - `import/no-cycle`: aviso, com o resolvedor do Node entendendo `.js` e `.jsx`.
- Sem `eslint-config-prettier`: no ESLint 9 as regras recomendadas não tratam de formatação, e nenhum dos plugins acima também trata, então não há conflito.

### 2. Prettier
`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "printWidth": 150,
  "arrowParens": "avoid"
}
```

`semi: true`, `tabWidth: 2` e `trailingComma: "all"` já são o padrão e ficam de fora.

`.prettierignore`: `dist`, `package-lock.json` e `docs/` (decisão 2).

### 3. Scripts no `package.json`
- `"lint": "eslint ."`
- `"format": "prettier --write ."`
- `"format:check": "prettier --check ."`

O `lint` passa com avisos (sem `--max-warnings 0`): os 32 ciclos e os 25 avisos do react-refresh não derrubam o CI.

### 4. `.github/workflows/ci.yml`
- Gatilhos: `push` na `main` e `pull_request`.
- Um job em `ubuntu-latest`: `actions/checkout@v4`, `actions/setup-node@v4` com `node-version: 20` e `cache: npm`, e depois `npm ci` → `npm run lint` → `npm run format:check` → `npm test` → `npm run build`.
- `@tailwindcss/oxide-linux-x64-gnu` (em `optionalDependencies`) é o binário certo para esse runner.
- Validação: confiro o YAML com o `actionlint` (binário baixado na pasta temporária) e, se der, rodo o workflow num push do branch.

### 5. Commits, nesta ordem
1. **Configuração**: dependências, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, scripts e `ci.yml`.
2. **Formatação**: só `npm run format`, mais nada. Confiro que `npm test` e `npm run build` continuam passando.
3. **`.git-blame-ignore-revs`** com o hash do commit 2, a correção de `cabana.js` e este plano atualizado. Para o `git blame` local usar o arquivo: `git config blame.ignoreRevsFile .git-blame-ignore-revs` (o GitHub já lê sozinho).

Atenção: o hash só vale se o PR for mesclado com merge commit, como o PR #4. Com squash ou rebase, o commit de formatação some e o arquivo fica apontando para um hash que não existe.

## Onde

| O quê | Arquivo |
|---|---|
| ESLint | `eslint.config.js` (novo) |
| Prettier | `.prettierrc.json`, `.prettierignore` (novos) |
| Scripts e dependências | [package.json](../../package.json), `package-lock.json` |
| CI | `.github/workflows/ci.yml` (novo) |
| Blame | `.git-blame-ignore-revs` (novo) |
| Erro de lint | [cabana.js](../../src/game/cabana.js) |
| Formatação | `src/**/*.{js,jsx,css}`, `index.html`, `vite.config.js` |

## Decisões tomadas (2026-11-02)

As três recomendações foram aprovadas e implementadas.

1. **Regras do `eslint-plugin-react-hooks`.** A versão atual (7.x) traz no `recommended` as regras do React Compiler. Elas dão **15 erros** em código 3D que é normal no react-three-fiber: `Math.random` no render (`Chuva.jsx`, `Totem.jsx`), mudar material, câmera ou `gl` dentro do `useFrame` (`Chuva`, `Cursor`, `Mar`, `Miniaturas`) e ler ref no render (`AnimalAnimado`, `Seres`). Corrigir mudaria a lógica desses componentes, e o projeto não usa o React Compiler. **Recomendo** ligar só as duas regras clássicas (`rules-of-hooks` e `exhaustive-deps`). Alternativa: `recommended` completo, com as regras do Compiler como aviso.
2. **Prettier em `docs/`.** Nos planos, ele realinha as tabelas Markdown (20 linhas só no plano 10) e reescreve `docs/fluxograma.html`. **Recomendo** ignorar `docs/`: os planos são registro histórico e o diff de formatação ali não ajuda ninguém. Alternativa: formatar tudo.
3. **Node local.** O seu Node é 18.20.8; o ESLint 9 pede ≥ 18.18, então funciona. O CI usa 20, como pedido. **Recomendo** só mudar `engines.node` para `>=18.18`, sem `.nvmrc`. Alternativa: subir para 20 em todo lugar (`engines` e `.nvmrc`).

## Teste

- `npm run lint`: 0 erros (avisos de ciclo e react-refresh são esperados).
- `npm run format:check`: tudo formatado.
- `npm test`: os mesmos 428 testes passando.
- `npm run build`: sai sem erro.
- `ci.yml` passa no `actionlint`.
- O commit de formatação não muda comportamento: o `dist/` gerado pelo `npm run build` antes e depois dele é igual byte a byte (o minificador descarta espaços e quebras de linha). Se não for igual, investigo antes de seguir.

## Como ficou

- Commits: configuração (`4573cef`), formatação (`b80f582`, em `.git-blame-ignore-revs`) e este fechamento.
- Formatação: 86 arquivos, +2250/−898. O JS e o CSS do `dist/` ficaram iguais byte a byte; a única diferença foi `<!DOCTYPE html>` → `<!doctype html>` no `index.html`.
- Lint: o único erro era o import de `mundo` não usado em `cabana.js`, removido.
- A formatação quebrou dois `useMemo` de [Terreno.jsx](../../src/components/cena/Terreno.jsx) em várias linhas, e o `// eslint-disable-line react-hooks/exhaustive-deps` foi parar na linha do `);`, longe da lista de dependências (+4 avisos). O comentário voltou para a linha `[qtdExpansoes],`; o lint fica em 0 erros e 57 avisos.
- Workflow: o YAML foi conferido (gatilhos, Node 20, passos na ordem). O `actionlint` não rodou: baixar e executar o binário foi bloqueado no ambiente local. A validação final é o primeiro run no GitHub.
- **Node 18 local e Tailwind.** `@tailwindcss/oxide-linux-x64-gnu@4.3.3` declara `engines.node >= 20`. Com Node 18, o `npm ci` (e o `npm i`, mesmo com `--force`) pula essa dependência opcional e o `build` falha com "Cannot find native binding". Antes funcionava porque o binário já estava no `node_modules`. No CI (Node 20) não acontece. Para restaurar localmente, o pacote foi extraído à mão de `npm pack` (integridade igual à do lockfile). Ou seja: na prática o projeto já pede Node 20, e `engines.node >=18.18` (decisão 3) não descreve isso; subir para 20 em todo lugar fica como sugestão para um próximo passo.
