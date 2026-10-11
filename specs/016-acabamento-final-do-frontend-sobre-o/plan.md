# Plano de implementação — Acabamento final do frontend sobre o backend v1.6

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> `SRC` = `app/src`, `TST` = `app/tests`. Base: `develop` do front (`105c27f`) e backend v1.6 já
> em `develop`. Publicação: back v1.6.0 e este front **juntos**, back primeiro; sem reserva para
> a v1.5.0 (decisão do usuário de 2026-10-11).

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Entrega | Quatro fases em branches empilhadas, um PR por fase (limpeza → quadro e triagem → tipos, busca e PDFs → gestão) | PR único | Diff revisável; a formatação em massa entra primeiro e não esconde mudança real |
| Formatação | `npx prettier --write` em commit **só dele**, sem outra mudança | Misturar com código | Pedido da #151 |
| Código sem uso | Remover o que a #151 listou, conferindo uso com busca e com `make validate` | Manter por precaução | RF-35 |
| Indicadores de gestão | Hook `useIndicadoresDeGestao(dias)` com uma consulta ao endpoint novo, habilitado só para gestor e administrador; blocos recebem o resultado por props | Uma consulta por bloco | RNF-01; falha de bloco independente via erro por bloco apresentado do mesmo dado |
| Leitura do prazo | Meta fixa (≥ 90% verde, 75–89 atenção, < 75 vermelho) em `lib/`, com texto | Variação contra o período anterior | O back não devolve o período anterior (decisão do usuário) |
| Gargalo em texto | Função pura em `lib/` que escolhe a etapa de maior mediana (empate: execução) e devolve frase | Calcular no JSX | Regra testável fora de `pages/` (Princípio 10) |
| Distribuição | Ler `emAbertoPorTipo` e `emAbertoPorPrioridade` das métricas (uma consulta); status já vem de `solicitacoesPorStatus` | 8 consultas por valor | RF-12 |
| Card | Card inteiro vira `Link`; o botão de avançar continua `button` com `stopPropagation`; modelo, máquina e iniciais dos responsáveis no rodapé | Manter "Ver" | RF-13, RF-15 |
| Modelo no card | `modeloCodigo` e `modeloMaquina` da listagem (o back os preenche) com `modeloVersao` | Buscar modelo por card | Já vem na resposta |
| Colunas no celular | `ControleSegmentado` com as cinco colunas (rótulo curto e contagem) | Rolagem horizontal | RF-16 |
| Encerradas | `sort=concluidaEm&dir=desc` nas colunas Concluída e Cancelada | Ordenar no cliente | RF-17 |
| Responsáveis | `GET /api/solicitacoes/responsaveis-disponiveis?busca=&page=&size=` com busca no servidor num seletor múltiplo novo; os escolhidos ficam em etiquetas removíveis | Estender o `Combobox` de valor único | O contrato do `Combobox` é de um valor; um componente `SeletorMultiplo` mantém o existente intacto |
| Prioridade na triagem | `ControleSegmentado` com 4 opções e o prazo de cada uma, vindo de um único arquivo de constantes (`lib/prazosDaPrioridade.ts`) | `select` nativo | RF-21 |
| Tipos | Pasta `features/admin/tiposModelo` espelhando `maquinas`; `tiposModeloApi` (lista pública e admin) | Reusar a de máquinas parametrizada | Mesmo formato, domínios diferentes; espelho é mais simples e igual ao padrão do repo |
| Rótulo do tipo | `rotulos.ts` mantém o mapa dos 5 antigos; `rotuloDoTipoDeModelo(nome)` cai no próprio nome | Chave fixa | RF-26 |
| Busca `q` | Campo na lista com debounce, mínimo 2 caracteres, na URL (`q`) junto dos filtros existentes | Só em memória | RF-29, RF-30 |
| PDFs | `exportar(filters)` passa a incluir `q`, `sort`, `dir` (os mesmos objetos da listagem); a exportação de modelos já repassa filtros | Gerar no cliente | RF-31, RF-32 |
| Aviso de corte (RF-33, desejável) | O aviso já está **dentro** do PDF; a tela não o lê | Ler o PDF no cliente | Fica registrado como não feito na convergência |

## Arquivos a criar ou alterar

### Fase 1 — Limpeza (RF-34 a RF-37)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| todos | os 57 arquivos que `prettier --list-different` aponta | formatar (commit só de formatação) | `make validate` |
| src | `SRC/App.tsx`, `SRC/shared/types/api.ts` | remover | — |
| deps | `@testing-library/jest-dom` em `app/package.json` | remover (sem uso) | `make validate` |
| src | `SRC/features/auth/hooks/useLogin.ts` e `TST/unit/features/auth/hooks/useLogin.test.ts*` | remover (nenhuma tela usa) | login e2e |
| src | `canViewModelos` em `SRC/shared/lib/permissions.ts`; `rotuloDoTipoDeEvidencia` em `SRC/shared/lib/rotulos.ts` | remover com os testes | cobertura |
| src | `SRC/shared/lib/contraste.ts` | mover para `TST/support/` (só o teste de tokens usa) | teste de tokens |
| Makefile | aliases `format`, `test-run`, `coverage` | remover | — |
| src/tests | nomes de teste sem condição (6 arquivos da #151); `temFiltroAtivo` e `semNada` para `lib/`; `KPICard` para `components/`; `queryOptions.ts` decidido | alterar | testes dos arquivos |

### Fase 2 — Quadro e triagem (RF-13 a RF-22)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| components | `SRC/features/solicitacoes/components/KanbanCard.tsx` | alterar (card clicável, modelo, máquina, responsáveis, prazo) | `KanbanCard.test.tsx` |
| lib | `SRC/features/solicitacoes/lib/iniciaisDosResponsaveis.ts` | criar | teste espelhado |
| components | `SRC/features/solicitacoes/components/KanbanBoard.tsx` e `KanbanColumn.tsx` | alterar (controle de colunas no celular; ordem de encerradas) | testes dos dois |
| lib | `SRC/features/solicitacoes/lib/filtrosDaColuna.ts` | alterar (`sort=concluidaEm` nas encerradas) | `filtrosDaColuna.test.ts` |
| shared | `SRC/shared/components/SeletorMultiplo/SeletorMultiplo.tsx` | criar | teste espelhado |
| api | `SRC/features/solicitacoes/api/responsaveisDisponiveisApi.ts` e `hooks/useResponsaveisDisponiveis.ts` (busca no servidor) | criar | testes |
| lib | `SRC/features/solicitacoes/lib/prazosDaPrioridade.ts` | criar | teste |
| components | `TriagemModal.tsx` e `AlterarResponsaveisModal.tsx` | alterar | testes dos dois |
| lib | `acoesSolicitacao.ts` | alterar (sem "alterar responsáveis" em A Fazer, conforme `acoesPermitidas`) | teste |

### Fase 3 — Tipos, busca e PDFs (RF-23 a RF-33)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| feature | `SRC/features/admin/tiposModelo/**` (api, types, schemas, hooks, components, pages, lib/messages) | criar, espelhando `maquinas` | testes espelhados |
| app | `SRC/app/router.tsx` e `SRC/features/admin/pages/AdminDashboardPage.tsx` | alterar (rotas e link) | `router`/página |
| modelos | `SRC/features/admin/modelos/components/ModeloForm.tsx`, `schemas/modeloSchema.ts`, `types/modeloTypes.ts`, `components/ModelosTable.tsx` | alterar (tipo do catálogo) | testes |
| shared | `SRC/shared/lib/rotulos.ts` | alterar (`rotuloDoTipoDeModelo`) | teste |
| solicitações | `SolicitacoesPage.tsx`, `components/SolicitacaoFilters.tsx`, `lib/filtrosDaUrl.ts`, `types/solicitacaoTypes.ts`, `api/solicitacoesApi.ts` | alterar (`q`, exportar com busca e ordem) | testes |

### Fase 4 — Dashboard de gestão (RF-01 a RF-12)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| api/types | `solicitacoesApi.ts`, `solicitacaoTypes.ts` (`IndicadoresDeGestao`) | alterar | testes |
| hooks | `SRC/features/solicitacoes/hooks/useIndicadoresDeGestao.ts` | criar | teste |
| lib | `SRC/features/solicitacoes/lib/leituraDoPrazo.ts`, `gargaloDasEtapas.ts` | criar | testes |
| components | `BlocoPrazoCumprido`, `BlocoTempoDeResolucao`, `BlocoIdadeDoBacklog`, `BlocoOndeOTempoSePerde`, `BlocoPorMaquina`, `BlocoReincidentes`, `BlocoCargaPorResponsavel` em `SRC/features/solicitacoes/components/gestao/` | criar | um teste cada |
| pages | `DashboardPage.tsx` (e `useDistribuicaoDoTrabalho.ts`) | alterar | testes |
| e2e | `TST/e2e/dashboard.spec.ts`, `kanban.spec.ts`, `tipos-modelo.spec.ts` | alterar/criar | Playwright |

## Dependências externas

Nenhuma nova; remove `@testing-library/jest-dom`.

## Impacto no contrato de operação

Nenhum alvo novo. `make fmt` sem `CAMINHO` só no commit de formatação da Fase 1 (regra do repo).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Formatação em massa conflita com a Fase 2 | média | Fase 1 é mergeada primeiro; fases empilhadas |
| Remover `useLogin` quebra algo | baixa | busca de uso + e2e de login |
| Card clicável quebra arrastar | média | `draggable` permanece no `Card`; teste de arrastar |
| `Link` aninhado com botão | média | botão fora do `Link`, posicionado sobre ele; teste de foco e de clique |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Tudo via `make`; sem alvo novo |
| Arquitetura limpa | Regras em `lib/` com teste; `pages/` só compõe |
| Testes provam a entrega | Cada arquivo novo com teste espelhado; nome "deve … quando …"; AAA |
| Simplicidade defensável | Um componente novo compartilhado (`SeletorMultiplo`); sem biblioteca nova |
| Autoria | Sem trailer de IA nos commits |
| Idioma | Português nos artefatos; identificadores de domínio em português |
| P7 a P12 | Mapa de pastas respeitado; compat. declarada (publicação conjunta); cobertura por arquivo ≥ 95%; uma fonte de especificação |
