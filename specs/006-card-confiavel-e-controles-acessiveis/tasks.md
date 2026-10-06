# Tarefas — Card confiável e controles acessíveis

> Ordem de dependência. `[P]` marca tarefa paralelizável. Teste vem antes da implementação
> que ele prova. As partes seguem a ordem da spec; dentro de cada uma, domínio antes de
> apresentação.

Prefixo: `SRC` = `app/src`.

## Parte 1 — Prazo do card

- [x] T001 Criar `SRC/features/solicitacoes/lib/prazoSolicitacao.test.ts`: um teste por cenário da spec, mais os limites de RF-03, RF-04 e RF-09
- [x] T002 Alterar `SRC/features/solicitacoes/types/solicitacaoTypes.ts` e criar `SRC/features/solicitacoes/lib/prazoSolicitacao.ts`
- [x] T003 Testes em `SRC/features/solicitacoes/components/KanbanCard.test.tsx`: selo de atrasada; concluída fora do prazo sem idade; cancelada sem selo
- [x] T004 Alterar `SRC/features/solicitacoes/components/KanbanCard.tsx`
- [x] T005 Alterar a legenda em `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx`

## Parte 2 — Card sem cortes

- [x] T007 Testes em `SRC/features/solicitacoes/components/KanbanCard.test.tsx`: o link aponta para o detalhe; clicar navega sem recarregar
- [x] T008 Alterar `SRC/features/solicitacoes/components/KanbanCard.tsx`
- [x] T009 Ajustar `KanbanColumn.test.tsx` e `KanbanBoard.test.tsx` para renderizar com roteador
- [x] T010 Medir RNF-03 nas quatro larguras e registrar na convergência

## Parte 3 — Toque e foco

- [x] T012 Testes em `SRC/shared/components/Button/Button.test.tsx`: altura padrão; tamanho compacto; variante de perigo
- [x] T013 Alterar `SRC/shared/components/Button/Button.tsx`
- [x] T014 [P] Testes e alteração de `Input`, `Select` e `Textarea`: erro associado; sem erro, nada associado
- [x] T015 [P] Alterar `SRC/shared/components/ConfirmDialog/ConfirmDialog.tsx` e o teste
- [x] T016 Alterar `SRC/styles/globals.css`: contorno de foco
- [x] T017 Testes e alteração de `SRC/features/solicitacoes/components/KanbanCard.tsx`: nome do botão de avançar; área de toque
- [x] T018 Medir RNF-04 e RNF-05 e registrar na convergência

## Parte 4 — Diálogo do quadro

- [x] T020 Teste e implementação de `rotuloDaAcao` em `SRC/features/solicitacoes/lib/acoesSolicitacao.ts`
- [x] T021 Criar `SRC/shared/components/Dialog/Dialog.test.tsx`: um teste por cenário da spec
- [x] T022 Criar `SRC/shared/components/Dialog/Dialog.tsx`
- [x] T023 Testes em `SRC/features/solicitacoes/components/KanbanBoard.test.tsx`: a ação abre num diálogo com nome; Esc fecha
- [x] T024 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`

## Integração

- [x] T026 Capturas de tela antes e depois das telas de quadro, detalhe e nova solicitação (1440 px e 390 px, claro e escuro)
- [x] T027 `make validate` verde

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

### Rodada 1 — 2026-10-06

Medições feitas com a aplicação rodando contra API simulada (script de captura), sem backend real.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `lib/prazoSolicitacao.ts:22-42` usa só `prazoLimite` e `atrasada`; `KanbanCard.tsx:175` |
| RF-02 | realizado | `prazoSolicitacao.ts:33`; teste "Atrasada há 5 h" em `prazoSolicitacao.test.ts` e `KanbanCard.test.tsx` |
| RF-03 | realizado | `prazoSolicitacao.ts:38` |
| RF-04 | realizado | `prazoSolicitacao.ts:40` |
| RF-05 | realizado | `prazoSolicitacao.ts:26-28` |
| RF-06 | realizado | `prazoSolicitacao.ts:24` |
| RF-07 | realizado | `prazoSolicitacao.ts:46-49`; `KanbanCard.tsx:151` |
| RF-08 | realizado | `pages/SolicitacoesTab.tsx:232` |
| RF-09 | realizado | `prazoSolicitacao.ts:12-16` |
| RF-10, RF-11 | realizado | `KanbanCard.tsx:133,168-169`; medição de RNF-03 |
| RF-12, RF-13 | realizado | `KanbanCard.tsx:195` (`Link`); testes de endereço e de navegação em `KanbanCard.test.tsx` |
| RF-14 | realizado | `Button.tsx:23` |
| RF-15 | realizado | `KanbanCard.tsx:97`; medição de RNF-04 |
| RF-16 | realizado | `styles/globals.css:63-70`; medição de RNF-05 |
| RF-17 | realizado | `:focus-visible` em `globals.css:63`; medido: botão focado por clique do mouse fica com `outline-style: none`, nos dois temas |
| RF-18 | realizado | `Input.tsx:29`, `Select.tsx:40`, `Textarea.tsx:25`, `Combobox.tsx` (`aria-describedby`); testes ao lado de cada um |
| RF-19 | realizado | `KanbanCard.tsx:182`; nome vem de `rotuloDaAcao` (`acoesSolicitacao.ts:116`) |
| RF-20 | realizado | `Button.tsx:30`; `ConfirmDialog.tsx` usa a variante |
| RF-21 | realizado | `Dialog.tsx:74-76`; `KanbanBoard.tsx:181-182`; medido: nome "Triar: Trinca na caixa de macho do tambor" |
| RF-22 | realizado | `Dialog.tsx:32` |
| RF-23 | realizado | `Dialog.tsx:45-61` |
| RF-24 | realizado | `Dialog.tsx:40-43` |
| RF-25 | realizado | `Dialog.tsx:67-69` |
| RF-26 | realizado | `Dialog.tsx:31,34` |
| RF-27 | realizado | `Dialog.tsx:35`; medido: após Esc o foco volta ao botão "Triar" do card |
| RF-28 | realizado | `Dialog.tsx:66,78`; medido: em 390 px, largura 390 e colado na base; em 1440 px, 448 px centralizado |
| RF-29 | realizado | `Dialog.tsx:78` (`max-h-dvh overflow-y-auto`); sem medição com conteúdo mais alto que a tela |
| RF-30 | ausente | fora desta entrega (decisão na spec) |
| RNF-01 | realizado | busca por constantes de horas de SLA em `app/src`: 0 ocorrências |
| RNF-02 | realizado | `prazoSolicitacao.ts` com 100% de linha no relatório de cobertura |
| RNF-03 | realizado | 0 elementos fora ou cortados em 12 cards, em 1024, 1280, 1440 e 1920 px |
| RNF-04 | realizado | 0 controles abaixo de 44 px em quadro (24 controles), detalhe (16) e nova solicitação (14), em 390 px com ponteiro de toque |
| RNF-05 | realizado | contraste do contorno: 5,17:1 no tema claro; 7,42:1 e 6,03:1 no escuro |
| RNF-06 | realizado | `Dialog.tsx` com 100% de linha |
| RNF-07 | realizado | `package.json` e `package-lock.json` sem alteração |

`make validate`: verde. Lint com 0 erros e 1 aviso que já existia (`NovaSolicitacaoPage.tsx:77`,
`react-hooks/incompatible-library`); 119 arquivos e 777 testes passando; cobertura de 99,73%
de instruções, 99,41% de ramos, 100% de funções e 99,71% de linhas; build concluído.

Cenários de aceite: todos têm teste de módulo ou de componente, exceto os três que dependem de
layout (cinco colunas em 1440 px, altura do botão em px, contorno visível com Tab), provados
por medição nesta rodada.

Desvios e excesso:

- T009 não exigiu mudança: `KanbanColumn.test.tsx` e `KanbanBoard.test.tsx` simulam o
  componente filho e não renderizam o `Link`.
- Arquivos alterados que o plano não listava, para RNF-04 fechar em zero:
  `app/layouts/AppLayout.tsx`, `shared/components/ThemeToggle/ThemeToggle.tsx`,
  `features/solicitacoes/pages/SolicitacoesPage.tsx`,
  `features/solicitacoes/components/SolicitacaoResumo.tsx` e
  `shared/components/Combobox/Combobox.tsx` (este também para RF-18). Só área de toque em
  ponteiro de toque; no computador nada muda.
- Excesso, sem requisito: textos secundários do card um tom mais escuros (data, "Sem
  prioridade", idade) e anel de foco de `Input`, `Select` e `Textarea` na cor de destaque;
  o link "Ver" do card ganhou nome acessível com o título da solicitação.
- Não verificado: backend real, leitor de tela e aparelho físico.

Veredito: convergido
Tarefas acrescentadas: nenhuma
