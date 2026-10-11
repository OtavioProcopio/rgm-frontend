# Tarefas — Responsáveis disponíveis fora da administração

> Ordem de dependência. Teste vem antes da implementação que ele prova.

## Fase 1 — Domínio

- [x] T001 Teste de `filtrarResponsaveisDisponiveis` em `app/src/features/admin/usuarios/lib/responsaveisDisponiveis.test.ts` (cenário "Lista só com quem pode ser responsável")
- [x] T002 Implementar `app/src/features/admin/usuarios/lib/responsaveisDisponiveis.ts`

## Fase 2 — Aplicação

- [x] T003 Teste do hook em `app/src/features/admin/usuarios/hooks/useResponsaveisDisponiveis.test.ts` (cenários "Operador não busca a lista" e gestor busca)
- [x] T004 Implementar `app/src/features/admin/usuarios/hooks/useResponsaveisDisponiveis.ts`

## Fase 3 — Adapters e infra

- [x] T005 Usar o hook em `app/src/features/solicitacoes/components/KanbanBoard.tsx` e ajustar `KanbanBoard.test.tsx` (cenário "Gestor tria pelo quadro")
- [x] T006 Usar o hook em `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` e ajustar `SolicitacaoDetalhePage.test.tsx` (cenário "Mesma lista no detalhe")

## Fase 4 — Integração

- [x] T007 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001, T002 |
| RF-02 | T005, T006 |
| RF-03 | T003, T004 |
| RF-04 | T005, T006 |
| RNF-01 | T004 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`.
