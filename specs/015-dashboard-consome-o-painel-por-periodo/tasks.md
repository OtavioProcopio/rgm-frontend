# Tarefas — Dashboard sobre o painel por período e quadro ordenado pela API

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova. Caminhos relativos ao
> repositório `rgm-frontend`; o código fica sob `app/`.
>
> O frontend valida cenários de aceite com Vitest (unidade) e Playwright (`app/tests/e2e`);
> não há `app/tests/bdd` neste repositório (desvio herdado das specs anteriores).
>
> Nomes de teste novos: `deve <resultado> quando <condição>` (padrão do repositório), com
> `// Arrange`, `// Act`, `// Assert` e uma asserção. `make fmt` sempre com `CAMINHO=`.

## Fase 1 — Contrato e tabela de ordem

- [x] T001 Ler `hooks/useIndicadoresDoPeriodo.ts`, `lib/leituraDosIndicadores.ts`,
  `components/FaixaDeIndicadores.tsx`, `components/TendenciaDoPeriodo.tsx` e
  `components/KanbanColumn.tsx`; registrar na própria tarefa os nomes exatos que as tarefas
  seguintes usam e criar o espelho de teste que faltar.
  Nomes registrados: `useIndicadoresDoPeriodo(dias)` devolve `IndicadoresDoPeriodo`
  (`concluidas`, `tempoMedio` com `TempoMedio {segundos, amostra}`, `isLoading`, `isError`,
  `refetch`); `leituraDosIndicadores` exporta `LIMITE_DA_AMOSTRA`, `resumoDasPaginas`,
  `tempoMedioDeResolucao`, `variacaoDeConcluidas`, `leituraDoTempoMedio`; `FaixaDeIndicadores`
  (props `dias`, `metricas`, `metricasErro`, `onRetryMetricas`) usa `valorDoTempo` e
  `detalheDoTempo` locais ("média de N de M"); `TendenciaDoPeriodo({dias})` lê
  `useHistoricoMetricas(dias, modeloId?)` (`HistoricoMetricas`, `PontoDeSerie`) e
  `lib/tendenciaDoPeriodo` (`rotuloDoPonto`, `semMovimento`); `KanbanColumn` recebe `config`
  (`ColumnConfig.status`) e `aviso`; `filtrosDaColuna(status, quadro, inicioDos30Dias, page)`.
  Espelhos criados: `tests/unit/features/solicitacoes/api/solicitacoesApi.test.ts`,
  `lib/ordemDoQuadro.test.ts`, `hooks/usePainelPorPeriodo.test.tsx`,
  `hooks/useHistoricoMetricas.test.tsx`
- [x] T002 [P] Teste de `app/tests/unit/features/solicitacoes/lib/ordemDoQuadro.test.ts`: A_FAZER
  `criadaEm`/`desc` com texto; EM_ANDAMENTO e EM_VALIDACAO `prazoLimite`/`asc` com texto;
  CONCLUIDA e CANCELADA sem ordenação e sem texto
- [x] T003 [P] Teste de `app/tests/unit/features/solicitacoes/api/solicitacoesApi.test.ts`:
  `obterPainel(30)` chama `/solicitacoes/metricas/painel` com `dias`; `modeloId` só quando dado
- [x] T004 Implementar `app/src/features/solicitacoes/lib/ordemDoQuadro.ts`
- [x] T005 Implementar em `app/src/features/solicitacoes/types/solicitacaoTypes.ts` e
  `app/src/features/solicitacoes/api/solicitacoesApi.ts`: `sort`, `dir`, `PainelPorPeriodo` e
  `obterPainel`

## Fase 2 — Painel e fallback

- [x] T006 Teste de `app/tests/unit/features/solicitacoes/hooks/usePainelPorPeriodo.test.ts`:
  devolve os dados; `indisponivel` verdadeiro só com `ApiError` 404; erro 500 e erro de rede
  viram `isError` e `indisponivel` falso; `enabled` falso não chama a API
- [x] T007 Implementar `app/src/features/solicitacoes/hooks/usePainelPorPeriodo.ts`
- [x] T008 Teste de `app/tests/unit/features/solicitacoes/hooks/useIndicadoresDoPeriodo.test.ts`:
  com o painel, concluídas atual e anterior e tempo médio vêm dele e a listagem de concluídas
  não é chamada; com 404, usa as duas listagens como na spec 013; com 500, `isError`
- [x] T009 Teste de `app/tests/unit/features/solicitacoes/lib/leituraDosIndicadores.test.ts`:
  tempo médio em segundos vira o texto legível (1800 s = 30 min); nulo vira "sem dados"; nenhum
  texto "média de" aparece
- [x] T010 Implementar `hooks/useIndicadoresDoPeriodo.ts` e `lib/leituraDosIndicadores.ts`
  (T008 e T009 verdes)
- [x] T011 Teste de `components/FaixaDeIndicadores.test.tsx`: sem "média de 100 de"; variação
  contra o período anterior com 140 e 120; erro mostra "Tentar novamente"
- [x] T012 Implementar `components/FaixaDeIndicadores.tsx` (T011 verde)
- [x] T013 Teste de `hooks/solicitacoesHooks.test.ts` (ou o espelho de `useHistoricoMetricas`):
  a série vem do painel (criadas e concluídas por dia) e, com 404, do histórico como antes
- [x] T014 Teste de `components/TendenciaDoPeriodo.test.tsx`: mostra criadas e concluídas cada
  uma no seu dia; legenda atualizada
- [x] T015 Implementar `hooks/useHistoricoMetricas.ts` e `components/TendenciaDoPeriodo.tsx`
  (T013 e T014 verdes)

## Fase 3 — Fila e quadro

- [x] T016 Teste de `hooks/useFilaDeAtencao.test.ts`: a consulta leva `sort=prazoLimite`,
  `dir=asc`, `atrasada` e `emAberto`; o total é o `totalElements`; a ordenação no cliente
  continua e é idempotente
- [x] T017 Implementar `hooks/useFilaDeAtencao.ts` (T016 verde)
- [x] T018 Teste de `lib/filtrosDaColuna.test.ts`: o bloco de cada status leva o `sort` e o `dir`
  da tabela; com período escolhido, continua levando
- [x] T019 Implementar `lib/filtrosDaColuna.ts` (T018 verde)
- [x] T020 Teste de `components/KanbanColumn.test.tsx`: cabeçalho mostra o texto da ordem de cada
  status e convive com "Últimos 30 dias"
- [x] T021 Implementar `components/KanbanColumn.tsx` (T020 verde)

## Fase 5 — Login (RF-13 a RF-17, #131) — executar antes da Fase 4

- [x] T027 Teste de `app/tests/unit/shared/lib/produto.test.ts` e ajuste de
  `tests/unit/features/auth/pages/LoginPage.test.tsx`, `Logo.test.tsx`, `AppLayout.test.tsx` e
  `BarraLateral.test.tsx` para "Rei Auto Parts"
- [x] T028 Implementar `src/shared/lib/produto.ts` e usar em `LoginPage.tsx`, `Logo.tsx`,
  `AppLayout.tsx` e `index.html`
- [x] T029 [P] Teste de `tests/unit/shared/components/CampoDeSenha/CampoDeSenha.test.tsx`
  (mostrar e ocultar, `aria-pressed`, nome acessível)
- [x] T030 [P] Teste de `tests/unit/features/auth/lib/mensagemDoLogin.test.ts` (401, 429, erro de
  rede, desconhecido)
- [x] T031 Implementar `CampoDeSenha.tsx` e `features/auth/lib/mensagemDoLogin.ts`
- [x] T032 Teste e implementação de `LoginPage.tsx`: exemplo neutro, foco no e-mail, `enterKeyHint`,
  título e subtítulo, tema, mensagens por tipo de falha

## Fase 6 — Retorno do sistema (RF-18 a RF-23, #126) — executar antes da Fase 4

- [x] T033 Teste e implementação de `Toast/ToastProvider.tsx` (região `aria-live="polite"`,
  some em 4 s com relógio falso, `motion-reduce`) e montagem nos provedores do app
- [x] T034 Teste e implementação de `Skeleton.tsx` e `LoadingState.tsx` (`role="status"`, texto
  oculto) e do esqueleto de cartões no `KanbanBoard`
- [x] T035 Teste e implementação de `EmptyState.tsx` (ícone, ação) e `ErrorState.tsx`
  (`role="alert"`)
- [x] T036 Teste e implementação de `onRetry` nas telas de erro de carregamento (lista, detalhe,
  dashboard, administração)
- [x] T037 Teste e implementação do toast de sucesso em triar, comentar, anexar, salvar edição e
  criar usuário
- [x] T038 Teste e implementação do erro de ação dentro do diálogo/junto do botão, sem sumir
- [x] T039 e2e em `tests/e2e/auth.spec.ts`: 401, 429 (interceptado) e rede (abortada) mostram
  mensagens diferentes

## Fase 4 — Integração

- [x] T022 e2e em `app/tests/e2e/kanban.spec.ts`: a solicitação recém-aberta aparece no primeiro
  bloco de A Fazer com mais de 20 em A Fazer, contra o backend de `develop`
- [x] T023 e2e em `app/tests/e2e/dashboard.spec.ts`: a aba Solicitações mostra indicadores do
  painel; com a rota do painel respondendo 404 (interceptada pelo teste), mostra os da spec 013;
  conta as requisições de dados (RNF-01)
- [x] T024 `openspec/README.md`: linha da spec 015 (Princípio 12)
- [x] T025 `make cover-arquivos` com os arquivos tocados (≥ 95% por arquivo)
- [x] T026 `make validate` verde e e2e inteiro contra o backend de `develop`

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T006, T007, T008, T010, T011, T012 |
| RF-02 | T009, T010, T011, T012 |
| RF-03 | T013, T014, T015 |
| RF-04 | T016, T017 |
| RF-05 | T002, T004, T018, T019, T022 |
| RF-06 | T002, T004, T018, T019, T020, T021 |
| RF-07 | T006, T007, T008, T010, T013, T023 |
| RF-08 | T006, T007, T008, T011 |
| RF-09 | T016, T018, T022 |
| RF-10 | T023 |
| RF-11 | T006, T023 |
| RF-12 | T001 (a distribuição não é alterada) |
| RNF-01 | T023 |
| RNF-02 | T025 |
| RNF-03 | T008, T013, T023 |
| RNF-04 | T026 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-11
| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 a RF-03 (indicadores e tendência do painel) | realizado | `hooks/usePainelPorPeriodo.ts`, `useIndicadoresDoPeriodo.ts`, `lib/leituraDosIndicadores.ts`, `components/TendenciaDoPeriodo.tsx`; e2e `dashboard.spec.ts` |
| RF-04 a RF-06, RF-09 (fila e quadro ordenados pela API) | realizado | `lib/ordemDoQuadro.ts`, `lib/filtrosDaColuna.ts`, `components/KanbanColumn.tsx`; e2e `kanban.spec.ts` (22 em A fazer, a nova no 1º bloco) |
| RF-07, RF-08 (404 cai na spec 013; outro erro mostra "Tentar novamente") | realizado | e2e `dashboard.spec.ts` (rota interceptada com 404 e 500) |
| RF-10, RNF-01 (≤ 3 requisições de dados) | realizado | e2e `dashboard.spec.ts`: fila, painel e métricas gerais = 3 |
| RF-11 (operador não aciona o painel) | realizado | `usePainelPorPeriodo.ts` não consulta para o perfil OPERADOR; teste em `usePainelPorPeriodo.test.tsx`; a aba também não monta (`DashboardPage.test.tsx`) |
| RF-12 (distribuição inalterada) | realizado | `DistribuicaoDoTrabalho.tsx` sem mudança de fonte |
| RF-13 (nome "Rei Auto Parts") | realizado | `shared/lib/produto.ts`, `Logo.tsx`, `AppLayout.tsx`, `index.html`, `site.webmanifest` |
| RF-14 a RF-16 (login: exemplo neutro, foco, teclado, mostrar senha, título) | realizado | `LoginPage.tsx`, `CampoDeSenha.tsx`; RF-16 "segue o tema": mesmos tokens do `Card`/`Input`, medição visual fica com o usuário |
| RF-17 (mensagens por falha) | realizado | `features/auth/lib/mensagemDoLogin.ts`; e2e `auth.spec.ts` (401, 429, rede) |
| RF-18 (esqueleto anunciado) | realizado | `Skeleton.tsx`, `LoadingState.tsx` (`role="status"`), `EsqueletoDoQuadro.tsx` |
| RF-19 (nova tentativa) | realizado | `onRetry` em todas as telas de erro de carregamento; um teste por tela |
| RF-20 (vazio com ícone) | realizado | `EmptyState.tsx` (ícone padrão e `icone`); ação já existia onde faz sentido |
| RF-21 (aviso de sucesso em 4 s) | realizado | `Toast/ToastProvider.tsx`; triar, comentar, anexar, editar, criar usuário |
| RF-22 (erro junto do formulário, não some) | realizado | comentário e anexo com erro local e texto preservado (`ComentarioForm`); ações no diálogo (`AcaoAvisos`) |
| RF-23 (menos movimento) | realizado | `motion-safe:animate-pulse`, `motion-reduce:transition-none` |
| RNF-02 (≥ 95% por arquivo) | realizado | `make cover-arquivos`: linhas 100% nos arquivos tocados |
| RNF-03 (backend v1.5.0) | realizado | testes de 404 do painel e `sort` ignorado |
| RNF-04 (validação) | realizado | `make validate`: exit 0, 204 arquivos, 3313 testes, lint 0 erros (1 aviso antigo em `NovaSolicitacaoPage`), tipos e build ok; e2e inteiro: 63 passou, 2 ignorados |

Excesso registrado:
- O aviso de sucesso também cobre devolver, encerrar, cancelar, enviar para validação e alterar responsáveis (RF-21 lista só cinco ações). Mesmo ponto único (`useExecutarAcao`), sem custo extra; mantido por consistência.
- Testes e remoção de guardas mortas em `UsuariosPage` e `EditarMaquinaPage`, e testes de ações de páginas de administração, para cumprir RNF-02 nos arquivos tocados.
- Estado "vazio com ação" não ganhou ação nova em nenhuma tela.

Ressalvas: o 429 do login é decidido pelo status; "tema escuro/claro" do login e o toast no celular de 390 px dependem de olhar na tela.

Veredito: convergido
Tarefas acrescentadas: nenhuma

Correções da revisão (mesma rodada): o 404 do painel deixou de ser retentado (vira resultado vazio e cai direto no plano da spec 013, com teste); o painel não é consultado para o operador, que passou a ter teste; nomes de teste sem "quando" corrigidos. O rótulo da ordem fica na zona da coluna, logo abaixo do cabeçalho, não dentro dele.
