# Tarefas — Testes em app/tests espelhando o caminho

> Ordem de dependência. Nenhuma tarefa é paralelizável: todas mexem na mesma árvore e nas
> mesmas configurações. Não há teste novo nem código de produção novo: a prova de cada
> tarefa é a suíte existente e as contagens da tarefa T001.

## Preparação

- [x] T001 Registrar a medição de partida na `develop`: `make validate`, contagem de arquivos e de testes, cobertura de linhas e lista de arquivos do relatório de cobertura (guardada fora do repositório)
- [x] T002 Emendar o Princípio 7 de `.specify/memory/constitution.md` por `/bu:constitution`: o teste mora em `app/tests/`, espelhando o caminho; sai a proibição de criar `tests/unit`

## Movimentação

- [x] T003 Mover `app/src/test-utils/*` para `app/tests/support/*` e trocar `@/test-utils/` por `@tests/support/` em todos os arquivos que importam
- [x] T004 Mover os 118 arquivos `app/src/**/*.test.{ts,tsx}` para `app/tests/unit/**`, espelhando o caminho dentro de `app/src`, e reescrever para `@/` toda referência relativa (importação, simulação de módulo, importação dinâmica)
- [x] T005 Mover `app/nginxConf.test.ts` para `app/tests/unit/nginxConf.test.ts` e ajustar o caminho até `nginx.conf`
- [x] T006 Mover `app/e2e/*` para `app/tests/e2e/*`

## Configuração

- [x] T007 Alterar `app/vitest.config.ts`: apelido `@tests`, exclusão de `tests/e2e/**` e retirada das três exclusões de cobertura que deixam de casar
- [x] T008 Alterar `app/tsconfig.app.json` (`include`, `exclude`, `paths`) e `app/tsconfig.node.json` (`include`)
- [x] T009 Alterar `app/eslint.config.js` (pasta ignorada), `app/playwright.config.ts` (pasta dos roteiros) e `.dockerignore`

## Verificação

- [x] T010 `make validate` e comparar com T001: mesma contagem de arquivos e de testes, mesma lista de arquivos medidos, cobertura de linhas com diferença de no máximo 0,01 ponto
- [x] T011 Conferir que não resta arquivo de teste fora de `app/tests/` e que todos os movidos são reconhecidos como renomeação
- [x] T012 Provar RF-08: introduzir um erro de tipo num teste movido, ver a validação falhar apontando o arquivo, desfazer
- [x] T013 Provar RF-10: criar um teste novo no caminho espelhado (a trava aceita) e ao lado do código (a trava recusa), e apagar
- [x] T014 Conferir que a ferramenta de ponta a ponta lista os 9 roteiros

## Documentação

- [x] T015 Atualizar `.specify/project.md`, `.specify/memory/as-is.md` e `docs/frontend-project.md` com o lugar novo dos testes

## Integração

- [x] T016 `make validate` verde

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

### Rodada 1 — 2026-10-06

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | 118 testes em `app/tests/unit/{app,features,shared}/**`, no caminho que tinham dentro de `app/src` |
| RF-02 | realizado | 0 arquivos `*.test.*` ou `*.spec.*` versionados fora de `app/tests/` |
| RF-03 | realizado | 133 movimentações, todas reconhecidas como renomeação, com o mesmo nome de arquivo |
| RF-04 | realizado | `app/tests/support/` com os 4 utilitários; `app/src/test-utils` não existe mais; 46 arquivos importam de `@tests/support/` |
| RF-05 | realizado | `app/tests/unit/nginxConf.test.ts` |
| RF-06 | realizado | `app/tests/e2e/` (9 roteiros e o apoio); `app/playwright.config.ts:7`; a ferramenta lista 48 testes em 9 arquivos |
| RF-07 | realizado | antes e depois: 119 arquivos e 777 testes passando, nenhum ignorado |
| RF-08 | realizado | `app/tsconfig.app.json` inclui `tests`; erro de tipo posto de propósito em `tests/unit/shared/lib/permissions.test.ts` foi acusado (`TS2322`) e desfeito; `make lint` cobre `tests` (só `tests/e2e` é ignorada, como `e2e` era) |
| RF-09 | realizado | lista de arquivos do relatório de cobertura idêntica antes e depois (43 arquivos) |
| RF-10 | realizado | a trava recusou um teste novo em `app/src/shared/lib/` e aceitou o mesmo teste em `app/tests/unit/shared/lib/`; o arquivo de prova foi apagado |
| RF-11 | realizado | Princípio 7 emendado em `.specify/project.md` (versão 2.0.0) e na constituição local; `.specify/memory/as-is.md`; `docs/frontend-project.md` |
| RNF-01 | realizado | 119 arquivos e 777 testes, antes e depois |
| RNF-02 | realizado | 99,71% de linhas, antes e depois |
| RNF-03 | realizado | 0 arquivos de teste fora de `app/tests/` |
| RNF-04 | realizado | 133 de 133 reconhecidos como renomeação; menor similaridade de 60% (`AcaoSolicitacaoAtiva.test.tsx`) |
| RNF-05 | realizado | `package.json` e `package-lock.json` sem alteração |
| RNF-06 | realizado | ver abaixo |

`make validate`: verde. Lint com 0 erros e 1 aviso que já existia (`NovaSolicitacaoPage.tsx:77`);
verificação de tipos sem erro; 119 arquivos e 777 testes passando; cobertura de 99,73% de
instruções, 99,41% de ramos, 100% de funções e 99,71% de linhas; build concluído.

Cenários de aceite: os onze foram conferidos por comando ou contagem, como o plano previa
(não há `app/tests/bdd/`).

Desvios e excesso:

- Nenhum arquivo de produção foi alterado.
- 353 referências relativas reescritas para `@/`, e não as 172 estimadas no plano: a
  estimativa contou só parte das formas de importação.
- Os roteiros de ponta a ponta foram só listados, não executados: exigem backend no ar.
- Os testes movidos continuam com nome e blocos antigos (fora de escopo na spec).
- A feature 007, em outra branch, ainda tem testes ao lado do código e os moverá ao ser retomada.

Veredito: convergido
Tarefas acrescentadas: nenhuma

