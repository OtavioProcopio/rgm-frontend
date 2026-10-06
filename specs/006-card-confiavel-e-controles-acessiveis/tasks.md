# Tarefas — Card confiável e controles acessíveis

> Ordem de dependência. `[P]` marca tarefa paralelizável. Teste vem antes da implementação
> que ele prova. As partes seguem a ordem da spec; dentro de cada uma, domínio antes de
> apresentação.

Prefixo: `SRC` = `app/src`.

## Parte 1 — Prazo do card

- [ ] T001 Criar `SRC/features/solicitacoes/lib/prazoSolicitacao.test.ts`: um teste por cenário da spec, mais os limites de RF-03, RF-04 e RF-09
- [ ] T002 Alterar `SRC/features/solicitacoes/types/solicitacaoTypes.ts` e criar `SRC/features/solicitacoes/lib/prazoSolicitacao.ts`
- [ ] T003 Testes em `SRC/features/solicitacoes/components/KanbanCard.test.tsx`: selo de atrasada; concluída fora do prazo sem idade; cancelada sem selo
- [ ] T004 Alterar `SRC/features/solicitacoes/components/KanbanCard.tsx`
- [ ] T005 Alterar a legenda em `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx`

## Parte 2 — Card sem cortes

- [ ] T007 Testes em `SRC/features/solicitacoes/components/KanbanCard.test.tsx`: o link aponta para o detalhe; clicar navega sem recarregar
- [ ] T008 Alterar `SRC/features/solicitacoes/components/KanbanCard.tsx`
- [ ] T009 Ajustar `KanbanColumn.test.tsx` e `KanbanBoard.test.tsx` para renderizar com roteador
- [ ] T010 Medir RNF-03 nas quatro larguras e registrar na convergência

## Parte 3 — Toque e foco

- [ ] T012 Testes em `SRC/shared/components/Button/Button.test.tsx`: altura padrão; tamanho compacto; variante de perigo
- [ ] T013 Alterar `SRC/shared/components/Button/Button.tsx`
- [ ] T014 [P] Testes e alteração de `Input`, `Select` e `Textarea`: erro associado; sem erro, nada associado
- [ ] T015 [P] Alterar `SRC/shared/components/ConfirmDialog/ConfirmDialog.tsx` e o teste
- [ ] T016 Alterar `SRC/styles/globals.css`: contorno de foco
- [ ] T017 Testes e alteração de `SRC/features/solicitacoes/components/KanbanCard.tsx`: nome do botão de avançar; área de toque
- [ ] T018 Medir RNF-04 e RNF-05 e registrar na convergência

## Parte 4 — Diálogo do quadro

- [ ] T020 Teste e implementação de `rotuloDaAcao` em `SRC/features/solicitacoes/lib/acoesSolicitacao.ts`
- [ ] T021 Criar `SRC/shared/components/Dialog/Dialog.test.tsx`: um teste por cenário da spec
- [ ] T022 Criar `SRC/shared/components/Dialog/Dialog.tsx`
- [ ] T023 Testes em `SRC/features/solicitacoes/components/KanbanBoard.test.tsx`: a ação abre num diálogo com nome; Esc fecha
- [ ] T024 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`

## Integração

- [ ] T026 Capturas de tela antes e depois das telas de quadro, detalhe e nova solicitação (1440 px e 390 px, claro e escuro)
- [ ] T027 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 a RF-07, RF-09 | T001, T002, T003, T004 |
| RF-08 | T005 |
| RNF-01 | T004 |
| RNF-02 | T001, T027 |
| RF-10, RF-11 | T008, T010 |
| RF-12, RF-13 | T007, T008 |
| RNF-03 | T010 |
| RF-14, RF-20 | T012, T013, T015 |
| RF-15, RF-19 | T017 |
| RF-16, RF-17 | T016, T018 |
| RF-18 | T014 |
| RNF-04, RNF-05 | T018 |
| RF-21 | T020, T021, T022, T023, T024 |
| RF-22 a RF-29 | T021, T022 |
| RF-30 | fora desta entrega |
| RNF-06 | T021, T027 |
| RNF-07 | T022 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
