# Tarefas — Falhas visíveis de upload e exportação

> Ordem de dependência. Teste vem antes da implementação que ele prova.

## Fase 1 — Domínio

- [x] T001 [P] Teste e implementação de `app/src/shared/lib/arquivoPermitido.ts` (cenários "Arquivo grande demais", "Tipo não aceito", "Vídeo aceito")
- [x] T002 [P] Teste e implementação de `app/src/shared/lib/exportacao.ts`
- [x] T003 [P] `acaoFeitaSemFoto` e `mensagemFotoNaoEnviadaAntes` em `app/src/features/solicitacoes/lib/solicitacaoMessages.ts`, com teste

## Fase 2 — Aplicação

- [x] T004 Teste e implementação de `app/src/features/evidencias/hooks/useAnexoComAviso.ts` (cenário "Nova tentativa dá certo")
- [x] T005 `app/src/features/solicitacoes/hooks/useExecutarAcao.ts`: aviso no lugar do `console.error`, `anexarAntes`; ajustar o teste (cenários "Conclusão com foto", "Foto da conclusão falha")

## Fase 3 — Adapters e infra

- [x] T006 [P] Teste e componente `app/src/features/evidencias/components/AvisoFotoNaoEnviada.tsx`
- [x] T007 [P] `EvidenciaUploader.tsx` usa `validarArquivo`; ajustar o teste
- [x] T008 [P] `AdicionarFotoGaleriaForm.tsx` usa `validarArquivo`; ajustar o teste
- [x] T009 `TriarAction`, `DevolverAction` e `EncerrarAction` mostram o aviso; conclusão envia a foto antes; ajustar os testes (cenário "Triagem feita, foto não enviada")
- [x] T010 `SolicitacaoAcoes.tsx` e `SolicitacaoDetalhePage.tsx`: ação aberta sobrevive à mudança de status; teste
- [x] T011 `NovaSolicitacaoPage.tsx`: aviso, sem navegação automática, `validarArquivo`, sem `evidenciasApi`; ajustar o teste (cenário "Abertura com foto que falha")
- [x] T012 Teste e componente `app/src/shared/components/ExportarPdfButton/ExportarPdfButton.tsx` (cenário "Exportação falha")
- [x] T013 `SolicitacoesPage.tsx`, `ModelosTab.tsx`, `ModelosPage.tsx` e `ModeloDetalhePage.tsx` usam `ExportarPdfButton`; ajustar os testes

## Fase 4 — Integração

- [x] T014 Nenhum `console.error` de upload ou exportação em `app/src` (RF-09); linha em `openspec/README.md`
- [x] T015 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T003, T005, T009, T011 |
| RF-02 | T004, T006 |
| RF-03 | T006 |
| RF-04 | T009, T010, T011 |
| RF-05 | T004, T006 |
| RF-06 | T001, T007 |
| RF-07 | T001, T007, T008, T011 |
| RF-08 | T002, T012, T013 |
| RF-09 | T005, T011, T013, T014 |
| RF-10 | T005, T009 |
| RF-11 | T005 |
| RNF-01 | T006, T012 |
| RNF-02 | T001, T015 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`.
