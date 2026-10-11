# Tarefas — Acabamento final do frontend sobre o backend v1.6

> Ordem de dependência; teste antes da implementação. Nenhuma tarefa é `[P]` (arquivos
> compartilhados entre as fases). Uma branch empilhada e um PR por fase.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Limpeza e formatação (RF-34 a RF-37)

- [x] T001 Formatar: `npx prettier --write` nos 57 arquivos de `--list-different`, em um commit só de formatação
- [x] T002 Remover `SRC/App.tsx`, `SRC/shared/types/api.ts` e a dependência `@testing-library/jest-dom`
- [x] T003 Remover `useLogin.ts` e o teste (conferir o fluxo de login com a busca de uso e o e2e)
- [x] T004 Remover `canViewModelos` e `rotuloDoTipoDeEvidencia` com seus testes; mover `contraste.ts` para `TST/support/`; remover os 3 aliases do `Makefile`
- [x] T005 Nomes de teste sem condição (6 arquivos da #151) renomeados
- [x] T006 Extrair `temFiltroAtivo` e `semNada` para `lib/` com teste; mover `KPICard` para `components/`
- [x] T007 `make validate` verde (lint, tipos, cobertura, build)

## Fase 2 — Quadro e triagem (RF-13 a RF-22)

- [x] T008 Teste e `lib/iniciaisDosResponsaveis.ts`
- [x] T009 Teste e alteração de `KanbanCard.tsx`: card clicável, modelo e máquina, responsáveis, prazo; avançar fora do link
- [x] T010 Teste e alteração de `filtrosDaColuna.ts`: encerradas por `concluidaEm`
- [x] T011 Teste e alteração de `KanbanBoard.tsx`: controle de colunas no celular com rótulo curto e contagem
- [x] T012 Teste e `lib/prazosDaPrioridade.ts`
- [x] T013 Teste e `shared/components/SeletorMultiplo/SeletorMultiplo.tsx`
- [x] T014 Teste e `api/responsaveisDisponiveisApi.ts` + `useResponsaveisDisponiveis` (busca no servidor)
- [x] T015 Teste e alteração de `TriagemModal.tsx` e `AlterarResponsaveisModal.tsx`
- [x] T016 Teste e alteração de `acoesSolicitacao.ts` (troca de responsáveis só depois da triagem)
- [x] T017 E2E do quadro e da triagem; `make validate` verde

## Fase 3 — Tipos de modelo, busca e PDFs (RF-23 a RF-33)

- [ ] T018 `features/admin/tiposModelo` (types, schema, api, hooks, componentes, páginas) com testes
- [ ] T019 Rotas, link no painel do administrador e permissão
- [ ] T020 `ModeloForm` e `ModelosTable` com o catálogo; `rotuloDoTipoDeModelo` com fallback
- [ ] T021 Busca `q` na lista (campo, URL, mínimo 2 caracteres) com testes
- [ ] T022 Exportação da lista repassando filtros, busca e ordem; exportação de modelos e ranking
- [ ] T023 E2E de tipos, busca e exportação; `make validate` verde

## Fase 4 — Dashboard de gestão (RF-01 a RF-12)

- [x] T024 Tipos e `solicitacoesApi.indicadoresDeGestao`; `useIndicadoresDeGestao` (só gestor e administrador)
- [x] T025 Teste e `lib/leituraDoPrazo.ts` e `lib/gargaloDasEtapas.ts`
- [x] T026 Blocos de prazo, resolução, backlog, etapas e devolução com testes
- [x] T027 Blocos por máquina, reincidentes e carga por responsável, com atalho para a lista filtrada
- [x] T028 `DashboardPage` com os blocos, erro por bloco e distribuição por tipo e prioridade em uma consulta
- [x] T029 E2E do dashboard de gestão; `make validate` e e2e inteiro verdes

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

### Rodada 1 — 2026-10-11

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01, RF-02 | realizado | `components/gestao/BlocoDePrazo.tsx`, `lib/leituraDoPrazo.ts` (90/75, sem base → texto); `IndicadoresDeGestao.test.tsx` |
| RF-03 | realizado | `components/gestao/BlocoDeResolucao.tsx` (mediana, p90 e quantidade) |
| RF-04 | parcial | faixas levam à lista filtrada (`lib/caminhosDaGestao.ts`, `filtrosDaUrl.ts` aceita `criadaEmInicio/Fim`); "sem responsável" é só número, porque o backend não tem filtro para isso |
| RF-05, RF-06 | realizado | `BlocoDeEtapas.tsx`, `lib/gargaloDasEtapas.ts` (etapa sem dado = "sem dados"; devolução "N de M") |
| RF-07, RF-08, RF-09 | realizado | `BlocoPorMaquina.tsx`, `BlocoDeReincidentes.tsx`, `BlocoDeCarga.tsx` com aviso de soma; links por `maquina`, `modeloId`, `responsavelId` |
| RF-10 | parcial | os blocos novos saem de uma única requisição: carregando, erro com "Tentar novamente" e o resto do dashboard de pé; o erro é do conjunto, não de cada bloco |
| RF-11 | realizado | `useIndicadoresDeGestao` só habilita para gestor/administrador; teste do operador |
| RF-12 | realizado | `useDistribuicaoDoTrabalho` lê `emAbertoPorTipo/Prioridade` das métricas (0 requisições extras); "Sem prioridade" sem link |
| RF-13 a RF-22 | realizado | PR #158 (fase 2) |
| RF-23 a RF-32 | realizado | PR #159 (fase 3) |
| RF-33 | não feito (decisão) | o aviso de corte fica dentro do PDF; registrado na spec |
| RF-34, RF-35 | realizado | PR #157 (fase 1) |
| RF-36 | parcial | nomes de teste, regra fora de `pages/` e pastas feitos na fase 1; limite de tamanho de função só conferido nos arquivos que esta spec tocou |
| RF-37 | realizado | build de produção em `vite preview`, 5 medidas até o último bloco de gestão: 249 a 412 ms (limite 3 s) |
| RNF-01 | realizado | 1 requisição nova (`/metricas/gestao`); a distribuição saiu de 8 para 0; e2e limita a 4 requisições de dados |
| RNF-03 | parcial | título, texto de leitura e alvo de toque `pointer-coarse:min-h-11` nos blocos; sem varredura de acessibilidade nova |
| RNF-04 | realizado | `make validate`: 3458 testes, 0 falhas, cobertura 99,9% |
| RNF-05 | não verificado | blocos usam só os tokens de tema existentes; claro e escuro não foram conferidos na tela |

Validação: `make validate` verde (3458 testes) e e2e inteiro verde (70 passaram, 2 ignorados).
Veredito: não convergido (RF-04, RF-10, RF-36, RNF-03 parciais; RNF-05 sem verificação)
Tarefas acrescentadas: nenhuma — as pendências dependem de decisão ou de backend (filtro "sem responsável"), e não de código desta spec.
