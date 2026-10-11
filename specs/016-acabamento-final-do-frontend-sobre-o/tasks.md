# Tarefas — Acabamento final do frontend sobre o backend v1.6

> Ordem de dependência; teste antes da implementação. Nenhuma tarefa é `[P]` (arquivos
> compartilhados entre as fases). Uma branch empilhada e um PR por fase.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Limpeza e formatação (RF-34 a RF-37)

- [ ] T001 Formatar: `npx prettier --write` nos 57 arquivos de `--list-different`, em um commit só de formatação
- [ ] T002 Remover `SRC/App.tsx`, `SRC/shared/types/api.ts` e a dependência `@testing-library/jest-dom`
- [ ] T003 Remover `useLogin.ts` e o teste (conferir o fluxo de login com a busca de uso e o e2e)
- [ ] T004 Remover `canViewModelos` e `rotuloDoTipoDeEvidencia` com seus testes; mover `contraste.ts` para `TST/support/`; remover os 3 aliases do `Makefile`
- [ ] T005 Nomes de teste sem condição (6 arquivos da #151) renomeados
- [ ] T006 Extrair `temFiltroAtivo` e `semNada` para `lib/` com teste; mover `KPICard` para `components/`
- [ ] T007 `make validate` verde (lint, tipos, cobertura, build)

## Fase 2 — Quadro e triagem (RF-13 a RF-22)

- [ ] T008 Teste e `lib/iniciaisDosResponsaveis.ts`
- [ ] T009 Teste e alteração de `KanbanCard.tsx`: card clicável, modelo e máquina, responsáveis, prazo; avançar fora do link
- [ ] T010 Teste e alteração de `filtrosDaColuna.ts`: encerradas por `concluidaEm`
- [ ] T011 Teste e alteração de `KanbanBoard.tsx`: controle de colunas no celular com rótulo curto e contagem
- [ ] T012 Teste e `lib/prazosDaPrioridade.ts`
- [ ] T013 Teste e `shared/components/SeletorMultiplo/SeletorMultiplo.tsx`
- [ ] T014 Teste e `api/responsaveisDisponiveisApi.ts` + `useResponsaveisDisponiveis` (busca no servidor)
- [ ] T015 Teste e alteração de `TriagemModal.tsx` e `AlterarResponsaveisModal.tsx`
- [ ] T016 Teste e alteração de `acoesSolicitacao.ts` (troca de responsáveis só depois da triagem)
- [ ] T017 E2E do quadro e da triagem; `make validate` verde

## Fase 3 — Tipos de modelo, busca e PDFs (RF-23 a RF-33)

- [ ] T018 `features/admin/tiposModelo` (types, schema, api, hooks, componentes, páginas) com testes
- [ ] T019 Rotas, link no painel do administrador e permissão
- [ ] T020 `ModeloForm` e `ModelosTable` com o catálogo; `rotuloDoTipoDeModelo` com fallback
- [ ] T021 Busca `q` na lista (campo, URL, mínimo 2 caracteres) com testes
- [ ] T022 Exportação da lista repassando filtros, busca e ordem; exportação de modelos e ranking
- [ ] T023 E2E de tipos, busca e exportação; `make validate` verde

## Fase 4 — Dashboard de gestão (RF-01 a RF-12)

- [ ] T024 Tipos e `solicitacoesApi.indicadoresDeGestao`; `useIndicadoresDeGestao` (só gestor e administrador)
- [ ] T025 Teste e `lib/leituraDoPrazo.ts` e `lib/gargaloDasEtapas.ts`
- [ ] T026 Blocos de prazo, resolução, backlog, etapas e devolução com testes
- [ ] T027 Blocos por máquina, reincidentes e carga por responsável, com atalho para a lista filtrada
- [ ] T028 `DashboardPage` com os blocos, erro por bloco e distribuição por tipo e prioridade em uma consulta
- [ ] T029 E2E do dashboard de gestão; `make validate` e e2e inteiro verdes

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 a RF-03 | T024, T025, T026 |
| RF-04 a RF-06 | T026 |
| RF-07 a RF-09 | T027 |
| RF-10, RF-11 | T024, T028 |
| RF-12 | T028 |
| RF-13 a RF-15 | T008, T009 |
| RF-16 | T011 |
| RF-17 | T010 |
| RF-18 | T009 |
| RF-19, RF-20 | T013, T014, T015 |
| RF-21 | T012, T015 |
| RF-22 | T016 |
| RF-23 a RF-28 | T018, T019, T020 |
| RF-29, RF-30 | T021 |
| RF-31, RF-32 | T022 |
| RF-33 | não feito (aviso está dentro do PDF) |
| RF-34 a RF-37 | T001 a T007 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`.
