# Plano de implementação — Testes em app/tests espelhando o caminho

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Conflito com a constituição, resolvido por emenda:** o Princípio 7 diz que o teste fica
> ao lado do arquivo e proíbe criar `tests/unit` "enquanto a migração não for decidida numa
> spec própria". Esta é a spec própria. O plano inclui a emenda do Princípio 7 por
> `/bu:constitution`, antes de mover qualquer arquivo.

## Medição de partida (`develop`, 2026-10-06)

- 118 arquivos de teste em `app/src`, em 47 pastas; 1 em `app/nginxConf.test.ts`; 9 roteiros
  e 1 arquivo de apoio em `app/e2e`; 4 utilitários em `app/src/test-utils`, importados por
  46 arquivos.
- `make validate`: 119 arquivos e 777 testes passando; 99,71% de linhas.
- Nos testes: 172 referências relativas a outros módulos (importações e simulações de
  módulo), todas a reescrever.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Como mover | `git mv` de cada arquivo, por script único e descartável, fora do repositório | mover à mão; copiar e apagar | 132 arquivos; `git mv` preserva o histórico (RNF-04) e o script garante a mesma regra para todos |
| Caminho de destino | `app/src/<caminho>/X.test.tsx` → `app/tests/unit/<caminho>/X.test.tsx` | incluir `src` no espelho | decisão do usuário (RF-01) |
| Referências relativas dos testes | reescritas para o apelido `@/` (que já aponta para `app/src`), tanto em importação quanto em simulação de módulo e importação dinâmica | caminhos relativos novos (`../../../src/...`) | o apelido já é usado em todo o projeto; relativo atravessando `tests/unit` e `src` fica longo e quebra a cada mudança de pasta |
| Como reescrever | o mesmo script resolve cada caminho relativo contra a pasta antiga do teste e grava `@/<caminho dentro de src>` | editar à mão | 172 ocorrências; regra única |
| Utilitários de teste | `app/src/test-utils/*` → `app/tests/support/*`, com apelido novo `@tests/` apontando para `app/tests` | manter `@/test-utils`; importar por caminho relativo | o apelido `@/` é só de produção; `@tests/support/...` deixa claro que é código de teste |
| Teste do nginx | `app/nginxConf.test.ts` → `app/tests/unit/nginxConf.test.ts`, ajustando o caminho até `nginx.conf` | pasta de integração | decisão do usuário (RF-05) |
| Roteiros de ponta a ponta | `app/e2e/*` → `app/tests/e2e/*`; a configuração da ferramenta aponta para a pasta nova | — | decisão do usuário (RF-06) |
| Verificação de tipos dos testes | `tsconfig.app.json` passa a incluir `tests`, menos `tests/e2e` e o teste do nginx; `tsconfig.node.json` aponta o teste do nginx no lugar novo | um `tsconfig` só para testes | os testes já são verificados hoje pelo `tsconfig.app.json`, por estarem em `src`; manter a mesma cobertura de tipos com a menor mudança (RF-08). Os roteiros de ponta a ponta não são verificados hoje e continuam assim |
| Análise estática | `eslint .` já cobre `tests`; só a pasta ignorada muda de `e2e` para `tests/e2e` | — | RF-08 |
| Execução | o padrão de busca da ferramenta de teste já encontra `tests/unit/**`; só a exclusão muda de `e2e/**` para `tests/e2e/**` | declarar a lista de pastas | menor mudança |
| Cobertura | saem da lista de exclusões as linhas que só existiam por haver teste dentro de `src` (`src/**/*.test.*`, `src/**/*.spec.*`, `src/test-utils/**`); o resto da lista não muda | não mexer | as três linhas deixam de casar com qualquer arquivo; a lista de arquivos medidos fica igual (RF-09) |
| Imagem de produção | `.dockerignore` troca `app/e2e/` por `app/tests/e2e/`; os testes de unidade continuam no contexto, como hoje | ignorar `app/tests` inteiro | o build da imagem roda a verificação de tipos, que hoje inclui os testes; manter igual |
| Prova de RF-07 e RF-09 | comparar, antes e depois, a contagem de arquivos e de testes e a lista de arquivos do relatório de cobertura | conferir só "passou" | um teste que deixa de ser encontrado não falha: some |
| Prova de RF-08 | introduzir um erro de tipo num teste movido, rodar a validação, ver falhar e desfazer | confiar na configuração | o cenário da spec pede a falha observada |
| Prova de RF-10 | criar um teste novo com a ferramenta de escrita no caminho espelhado (aceito) e ao lado do código (recusado), e apagar | — | cenários da spec |
| Um commit de movimentação | mover e reescrever num commit; configuração e documentação noutro | tudo junto | o commit de movimentação fica só com renomeações, fácil de revisar |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

## Arquivos a criar ou alterar

Nenhum arquivo de produção muda. Não há teste novo: a prova é a própria suíte.

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| governança | `.specify/memory/constitution.md` | emendar o Princípio 7 por `/bu:constitution` | — |
| governança | `.specify/project.md`, `.specify/memory/as-is.md`, `docs/frontend-project.md` | alterar: lugar dos testes | — |
| testes | `app/src/**/*.test.{ts,tsx}` (118) | mover para `app/tests/unit/**`, reescrevendo as referências relativas | a suíte |
| testes | `app/nginxConf.test.ts` | mover para `app/tests/unit/nginxConf.test.ts` | a suíte |
| testes | `app/src/test-utils/*` (4) | mover para `app/tests/support/*` | a suíte |
| testes | `app/e2e/*` (10) | mover para `app/tests/e2e/*` | listagem da ferramenta |
| configuração | `app/vitest.config.ts` | alterar: apelido `@tests`, exclusão de `tests/e2e/**`, três exclusões de cobertura a menos | a suíte e o relatório |
| configuração | `app/vite.config.ts` | conferir se precisa do apelido `@tests` (só se algo de produção o usasse; não deve) | build |
| configuração | `app/tsconfig.app.json`, `app/tsconfig.node.json` | alterar: `include`, `exclude` e `paths` | `tsc -b` |
| configuração | `app/eslint.config.js` | alterar: pasta ignorada | `make lint` |
| configuração | `app/playwright.config.ts` | alterar: pasta dos roteiros | listagem |
| configuração | `.dockerignore` | alterar: pasta ignorada | — |

## Contrato entre camadas

- Teste importa produção por `@/...` e utilitário de teste por `@tests/support/...`.
- Produção nunca importa de `@tests/`.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum alvo novo. `make test-run`, `make coverage` e `make validate` continuam com os mesmos
comandos; só as pastas que eles encontram mudam.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Simulação de módulo com caminho reescrito não casar com o módulo que a produção importa | média | A ferramenta resolve os dois para o mesmo arquivo; a suíte inteira roda depois e a contagem de testes é comparada |
| Teste que lê arquivo por caminho relativo ao próprio lugar quebrar | baixa | Só o teste do nginx faz isso; ajustado na movimentação |
| Roteiros de ponta a ponta não podem ser executados aqui (exigem backend no ar) | certa | Conferir só que a ferramenta lista os 9; registrar na convergência |
| Arquivo movido com muitas linhas de importação alteradas deixar de ser reconhecido como renomeação | baixa | Medir com o controle de versão; se houver, registrar quais |
| A branch da feature 007 tem cinco testes ao lado do código e conflita ao ser atualizada | certa | Fora desta feature; a 007 move os próprios testes ao ser retomada, com a mesma regra |
| PRs abertos do dependabot ou de outra pessoa que toquem testes conflitarem | baixa | Conferir os PRs abertos antes de abrir este |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Validação por `make validate`; nenhum alvo novo |
| Arquitetura limpa | Nenhum arquivo de produção muda; produção não importa de teste |
| Testes provam a entrega | Mesmos 777 testes, com contagem e cobertura comparadas antes e depois |
| Simplicidade defensável | Nenhuma dependência nova; um apelido novo, só para testes |
| Autoria | Commits e PR só com o autor do `git config` |
| Idioma | Artefatos em português |
| Mapa de pastas do legado (7) | Emendado por `/bu:constitution` nesta feature: o teste passa a morar em `app/tests/` |
| Cobertura não regride (10) | Limite intocado; mesma lista de arquivos medidos |
| Padrão de teste vale para o que for tocado (11) | Mover não é tocar o conteúdo: nome e blocos dos testes antigos ficam como estão (fora de escopo na spec) |
| Uma fonte de especificação (12) | Spec, plano, checklist e tarefas em `specs/008-*`, pelas skills `/bu:` |
