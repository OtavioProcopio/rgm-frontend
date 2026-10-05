# Tarefas — Tempo real no quadro e no detalhe

> Ordem de dependência. Teste vem antes da implementação que ele prova.

## Fase 1 — Domínio

- [ ] T001 Teste e implementação de `app/src/features/solicitacoes/lib/eventosSolicitacao.ts` (RF-05, RF-09)

## Fase 2 — Aplicação

- [ ] T002 Chave `atualizacao(id)` em `solicitacoesKeys.ts`; dublê `app/src/test-utils/mockEventSource.ts`
- [ ] T003 `useSolicitacaoEvents.ts`: detalhe, atividades, evidências e marca; testes novos em `useSolicitacaoEvents.test.ts` (cenários "Quadro reage a mudança de outro usuário", "Detalhe reage a mudança de outro usuário", "Comentário de outro usuário", "Solicitação nova aparece no quadro")
- [ ] T004 `useExecutarAcao.ts` devolve `atualizadaPorOutro`; testes

## Fase 3 — Adapters e infra

- [ ] T005 [P] `nginx.conf`: rota de eventos sem buffer e com 1 hora de leitura; teste `app/src/shared/config/nginxConf.test.ts` (RF-01 a RF-03, RNF-01, RNF-02)
- [ ] T006 `AcaoAvisos.tsx` no lugar de `AcaoErro.tsx`; ações passam `atualizadaPorOutro`; testes em `SolicitacaoAcoes.test.tsx` (cenários "Formulário aberto não é atropelado" e "Evento de outra solicitação não avisa")
- [ ] T007 `SolicitacaoDetalhePage.tsx` chama `useSolicitacaoEvents()`; teste

## Fase 4 — Integração

- [ ] T008 Linha em `openspec/README.md`
- [ ] T009 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01, RF-02, RF-03 | T005 |
| RF-04 | T003 |
| RF-05 | T001, T003, T007 |
| RF-06 | T003 |
| RF-07 | T003, T004, T006 |
| RF-08 | T001, T003 |
| RF-09 | T001, T003 |
| RNF-01, RNF-02 | T005 |
| RNF-03 | T001, T003 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`.
