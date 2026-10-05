# Tarefas — Ações da solicitação reutilizáveis

> Ordem de dependência. Teste vem antes da implementação que ele prova.

## Fase 1 — Domínio

- [ ] T001 Campo opcional `acoesPermitidas` em `app/src/features/solicitacoes/types/solicitacaoTypes.ts`
- [ ] T002 Teste da regra em `app/src/features/solicitacoes/lib/acoesSolicitacao.test.ts` (cenários "A API informa as ações", "A API não informa as ações", "Operador não responsável não move o card", "Operador que abriu cancela antes da triagem")
- [ ] T003 Implementar `app/src/features/solicitacoes/lib/acoesSolicitacao.ts`

## Fase 2 — Aplicação

- [ ] T004 [P] Teste e implementação de `app/src/features/solicitacoes/hooks/useAcoesPermitidas.ts`
- [ ] T005 [P] Teste e implementação de `app/src/features/solicitacoes/hooks/useExecutarAcao.ts` (cenário "Erro da API fica no formulário")
- [ ] T006 [P] `useAlterarResponsaveis.ts` invalida as listas; ajustar o teste existente

## Fase 3 — Adapters e infra

- [ ] T007 Testes e componentes de `app/src/features/solicitacoes/actions/`: `AcaoErro`, `TriarAction`, `EnviarValidacaoAction`, `DevolverAction`, `EncerrarAction`, `CancelarAction`, `ResponsaveisAction`
- [ ] T008 Teste e componente `app/src/features/solicitacoes/actions/AcaoSolicitacaoAtiva.tsx`
- [ ] T009 Teste e componente `app/src/features/solicitacoes/components/SolicitacaoAcoes.tsx` (cenários "A API informa as ações" e "Operador que abriu cancela antes da triagem", na tela)
- [ ] T010 Teste e componente `app/src/features/solicitacoes/components/SolicitacaoResumo.tsx`
- [ ] T011 `SolicitacaoDetalhePage.tsx` usa `SolicitacaoResumo` e `SolicitacaoAcoes`; ajustar `SolicitacaoDetalhePage.test.tsx`
- [ ] T012 `KanbanBoard.tsx` usa a regra, `kanbanColunas.ts` e `AcaoSolicitacaoAtiva`; ajustar `KanbanBoard.test.tsx` (cenários "Operador responsável envia para validação pelo quadro", "Operador não responsável não move o card", "Mesmo fluxo nos dois lugares")
- [ ] T013 Remover `useKanbanActions.ts` e `useKanbanActions.test.ts`

## Fase 4 — Integração

- [ ] T014 `features/*/actions` no mapa do Princípio 7 em `.specify/project.md`; linha em `openspec/README.md`
- [ ] T015 `make validate` verde; detalhe e quadro com no máximo 300 linhas (RNF-01)

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T007, T008, T011, T012 |
| RF-02 | T002, T003, T009 |
| RF-03 | T002, T003 |
| RF-04 | T003, T004, T011, T012 |
| RF-05 | T003, T012 |
| RF-06 | T005, T007 |
| RF-07 | T005, T006, T013 |
| RNF-01 | T010, T011, T012, T015 |
| RNF-02 | T002, T015 |
| RNF-03 | T011, T012, T015 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`.
