# Tarefas — Testes em app/tests espelhando o caminho

> Ordem de dependência. Nenhuma tarefa é paralelizável: todas mexem na mesma árvore e nas
> mesmas configurações. Não há teste novo nem código de produção novo: a prova de cada
> tarefa é a suíte existente e as contagens da tarefa T001.

## Preparação

- [ ] T001 Registrar a medição de partida na `develop`: `make validate`, contagem de arquivos e de testes, cobertura de linhas e lista de arquivos do relatório de cobertura (guardada fora do repositório)
- [ ] T002 Emendar o Princípio 7 de `.specify/memory/constitution.md` por `/bu:constitution`: o teste mora em `app/tests/`, espelhando o caminho; sai a proibição de criar `tests/unit`

## Movimentação

- [ ] T003 Mover `app/src/test-utils/*` para `app/tests/support/*` e trocar `@/test-utils/` por `@tests/support/` em todos os arquivos que importam
- [ ] T004 Mover os 118 arquivos `app/src/**/*.test.{ts,tsx}` para `app/tests/unit/**`, espelhando o caminho dentro de `app/src`, e reescrever para `@/` toda referência relativa (importação, simulação de módulo, importação dinâmica)
- [ ] T005 Mover `app/nginxConf.test.ts` para `app/tests/unit/nginxConf.test.ts` e ajustar o caminho até `nginx.conf`
- [ ] T006 Mover `app/e2e/*` para `app/tests/e2e/*`

## Configuração

- [ ] T007 Alterar `app/vitest.config.ts`: apelido `@tests`, exclusão de `tests/e2e/**` e retirada das três exclusões de cobertura que deixam de casar
- [ ] T008 Alterar `app/tsconfig.app.json` (`include`, `exclude`, `paths`) e `app/tsconfig.node.json` (`include`)
- [ ] T009 Alterar `app/eslint.config.js` (pasta ignorada), `app/playwright.config.ts` (pasta dos roteiros) e `.dockerignore`

## Verificação

- [ ] T010 `make validate` e comparar com T001: mesma contagem de arquivos e de testes, mesma lista de arquivos medidos, cobertura de linhas com diferença de no máximo 0,01 ponto
- [ ] T011 Conferir que não resta arquivo de teste fora de `app/tests/` e que todos os movidos são reconhecidos como renomeação
- [ ] T012 Provar RF-08: introduzir um erro de tipo num teste movido, ver a validação falhar apontando o arquivo, desfazer
- [ ] T013 Provar RF-10: criar um teste novo no caminho espelhado (a trava aceita) e ao lado do código (a trava recusa), e apagar
- [ ] T014 Conferir que a ferramenta de ponta a ponta lista os 9 roteiros

## Documentação

- [ ] T015 Atualizar `.specify/project.md`, `.specify/memory/as-is.md` e `docs/frontend-project.md` com o lugar novo dos testes

## Integração

- [ ] T016 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01, RF-02, RF-03 | T004, T011 |
| RF-04 | T003 |
| RF-05 | T005 |
| RF-06 | T006, T009, T014 |
| RF-07 | T001, T010 |
| RF-08 | T008, T009, T012 |
| RF-09 | T001, T007, T010 |
| RF-10 | T002, T013 |
| RF-11 | T002, T015 |
| RNF-01, RNF-02 | T001, T010 |
| RNF-03, RNF-04 | T011 |
| RNF-05, RNF-06 | T016 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
