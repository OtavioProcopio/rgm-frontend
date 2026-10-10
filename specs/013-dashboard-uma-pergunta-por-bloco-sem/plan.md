# Plano de implementação — Dashboard: uma pergunta por bloco, sem informação repetida e com indicadores que dizem algo

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/features/...`), conforme o
> Princípio 7. Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado
> tem em `app/src`. Não há `app/tests/bdd/`: cada cenário da spec vira um teste de módulo ou
> de componente com o nome do cenário (decisão do usuário, 2026-10-07). Nada é injetado por
> abstração neste projeto, então não há `app/interfaces/`.

> **Leitura do código e da API antes do plano (2026-10-09, `develop` @ `f8066d0`, backend
> `develop` @ `39ce64c`):**
> - O painel de solicitações (`SolicitacoesTab`, 418 linhas) faz **12 requisições**: métricas
>   globais, 4 contagens por tipo, 4 por prioridade (só em aberto), 2 de atrasadas (contagem e
>   as 5 primeiras) e o histórico. Mais de metade é para desenhar barras.
> - **O histórico não serve para "concluídas no período".** `ObterHistoricoMetricasUseCase`
>   agrupa pela **data de criação** (`findByCriadaEmBetween`): cada ponto diz "das
>   solicitações criadas neste dia, quantas estão abertas, concluídas e canceladas hoje".
>   Também arredonda `slaMediaHoras` para horas inteiras (0 h abaixo de uma hora). Para dias
>   até 30 devolve pontos diários; acima disso, semanais ("Sem 40").
> - **A listagem já sabe filtrar por data de conclusão:** `tipoData: 'CONCLUSAO'` com
>   `dataInicio`/`dataFim` (o quadro usa para as encerradas dos últimos 30 dias), e traz
>   `tempoResolucaoSegundos` em cada item. É a fonte certa de "concluídas no período" e do
>   tempo médio (ver decisões 1 e 2).
> - `atrasada=true` no backend (`Solicitacao#isAtrasada`) inclui concluída fora do prazo;
>   `emAberto=true` na mesma consulta deixa só as abertas. Em 2026-10-09 as duas dão 123.
> - A listagem devolve da mais antiga criada para a mais nova e **não aceita ordenação**; o
>   limite de página do projeto é 100 (`tests/unit/tamanhoDePagina.test.ts`).
> - Cada item da listagem traz `prazoLimite`, `atrasada`, `modeloCodigo`, `responsavelIds` e,
>   desde o backend `develop`, `responsaveis` (com nome). `situacaoDoPrazo` e
>   `formatarDuracao` (`lib/prazoSolicitacao.ts`, `shared/lib/duracao.ts`) já escrevem
>   "Atrasada há 2 d".
> - **O quadro Kanban só filtra por modelo e data.** A visão Lista tem filtros de status,
>   tipo e prioridade, mas não de atrasadas nem de "em aberto", e `SolicitacoesPage` só lê
>   `maquina` da URL. Para "Ver todas" e para o clique na distribuição (RF-03, RF-11) a
>   página precisa ler esses parâmetros e abrir a **Lista** já filtrada (decisão 5).
> - `ErrorState` e `EmptyState` não têm "Tentar novamente" nem ícone; `LoadingState` é só
>   texto. RF-15 pede "Tentar novamente" já aqui (decisão 8).
> - `animate-pulse` (pílula) e `animate-spin-slow` (ampulheta) são as duas animações
>   contínuas do painel (RNF-07).
> - A aba Modelos escreve duração com `formatDuracao` (arredonda para horas, origem do
>   "0h"); a aba Pessoal mostra os três indicadores e as duas listas mesmo vazias.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`.

## Decisões técnicas

| # | Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|---|
| 1 | Fonte de "concluídas no período" | Duas consultas à listagem (`status: CONCLUIDA`, `tipoData: CONCLUSAO`, `dataInicio`/`dataFim`), `size: 100`: uma do período atual, outra do anterior de mesmo tamanho. A contagem é `totalElements`. | Histórico (`/metricas/historico`) com o dobro do período. | O histórico agrupa por criação, não por conclusão, e para mais de 30 dias é semanal; não separa os dois períodos. Corrige a hipótese da spec (Esclarecimento 1): a variação continua só para concluídas e tempo médio, mas vem da listagem. |
| 2 | Tempo médio de resolução e variação | Média de `tempoResolucaoSegundos` dos itens das mesmas duas consultas. Se `totalElements` passar de 100, o indicador diz "média de 100 de N" (a API não ordena, e a amostra é a primeira página). | `slaMediaHoras` do histórico; `tempoMedioResolucaoSegundos` global das métricas. | O primeiro arredonda para horas e agrupa por criação; o segundo é de toda a vida do sistema e não tem período. Hoje há 34 concluídas no total, bem abaixo de 100. |
| 3 | Fila de atenção | Uma consulta `atrasada + emAberto`, `size: 100`, ordenada no cliente por `prazoLimite` crescente (a mais atrasada primeiro); mostra 5 e oferece "Ver todas" sem repetir o total (Esclarecimento 8: o total mora só no indicador "Em atraso"). | `size: 5` direto (sem ordenar); pedir ordenação ao backend. | Sem ordenação na API, os 5 primeiros seriam os mais antigos de criação, não os mais atrasados. Backend fora de escopo. Se passar de 100 atrasadas, "mais atrasada" vale entre as 100 mais antigas de criação (R2). A mesma consulta entrega o indicador "Em atraso" (`totalElements`), sem requisição extra. |
| 4 | Distribuição: de onde vêm os números | **Status** sai de `metricas.solicitacoesPorStatus` (A fazer, Em andamento, Em validação), sem requisição. **Tipo** e **prioridade** fazem 4 contagens cada (`emAberto`, `size: 1`), **só quando a pessoa escolhe a visão**. | Carregar as três de uma vez (8 contagens no carregamento); buscar todas as 522 abertas para contar no cliente. | Mantém RNF-03: no carregamento são 5 requisições (métricas, fila, duas de concluídas, histórico); a visão tipo soma 4, a prioridade soma 4 (máximo 13 depois de usar as duas, nunca no carregamento). |
| 5 | Destino de "Ver todas" e do clique na distribuição | `SolicitacoesPage` passa a ler da URL `status`, `tipo`, `prioridade`, `atrasada` e `emAberto` (validados contra os valores permitidos), além de `maquina`, e abre na visão **Lista** quando houver algum. `SolicitacaoFilters` mostra o que veio da URL como etiquetas removíveis ("Em atraso", "Em aberto") para o filtro não ser invisível. | Filtrar o Kanban (muda `KanbanBoard`, `useColunasDoQuadro` e a spec 014); abrir o quadro sem filtro. | A Lista já tem os filtros e a API já aceita todos. A spec 014 mexe no quadro e nos filtros (#146); aqui só se acrescenta a leitura da URL e as etiquetas. A spec diz "quadro de solicitações"; a tela de destino é a página Solicitações, na visão Lista. |
| 6 | Gráfico de tendência | Barras agrupadas feitas à mão (sem biblioteca): duas barras por ponto, "abertas" e "concluídas" **da série da API**, eixo vertical com 3 marcas, hoje destacado, valor ao focar ou passar o mouse, e legenda que diz o que cada série significa ("criadas neste dia que hoje estão abertas / concluídas"). Alternativa em texto: tabela dentro de `SecaoRecolhivel`. | Biblioteca de gráficos; manter a barra empilhada. | Não há biblioteca de gráficos no projeto (YAGNI); a barra empilhada de total é o que não deixa comparar. A legenda honesta evita ler a série de criação como se fosse de conclusão. |
| 7 | Período único | Estado `periodo` (7, 30 ou 90) em `DashboardPage`/`SolicitacoesTab`, passado por propriedade à faixa de indicadores e à tendência. Controle: novo `ControleSegmentado` compartilhado. | Contexto do React; estado na URL. | Um nível de propriedade basta (KISS). O mesmo controle serve à distribuição. |
| 8 | "Tentar novamente" | `ErrorState` ganha `onRetry` opcional (botão "Tentar novamente"); cada bloco passa o `refetch` do seu hook. O restante do #126 (esqueletos, toasts) fica para a spec 015. | Esperar a 015; refazer o erro só neste painel. | RF-15 exige agora; fazer no componente compartilhado evita a 015 refazer. |
| 9 | Compatibilidade com o backend em produção (Princípio 9) | A fila usa `responsaveis` (nome) quando vier; sem ele, mostra "N responsável(is)" a partir de `responsavelIds`, ou "Sem responsável". `atrasada`, `tipoData`, `prazoLimite`, `modeloCodigo` e `tempoResolucaoSegundos` já existem na v1.5.0 (conferido com `git grep` na tag). **`emAberto` não existe na v1.5.0**: entrou em `develop` no commit `d71fae4`. A fila, "Ver todas" e a distribuição por tipo e prioridade dependem dele, então a spec declara a ordem de publicação: **backend de `develop` primeiro** (como a spec 005 já fez). Com o backend v1.5.0 o filtro é ignorado e os números vêm maiores (inclui encerradas); não há como o cliente saber a versão do outro lado. | Exigir o campo novo sem declarar a ordem; descobrir a versão do backend. | Princípio 9 permite a dependência quando a spec declara a ordem de publicação (seção "Compatibilidade e ordem de publicação"). |
| 10 | Cor de estado | Três tons (`ok`, `atencao`, `ruim`) sempre com ícone e texto ("Em dia", "Atenção", "Ruim"). Em atraso: 0 = ok; até 10% das abertas = atenção; acima = ruim. Tempo médio: menor que o período anterior = ok; igual = neutro; maior = ruim. Abertas: neutro. Concluídas: variação positiva = ok. | Só cor. | RNF-05. Regras do Esclarecimento 2. |
| 11 | Topo | Título "Dashboard" e `AtualizadoEm` ("Atualizado às 13:09", do `dataUpdatedAt` mais recente entre métricas e fila). Saem a descrição com o total e a pílula animada. | Relógio que conta segundos. | RF-14, RNF-07: sem movimento contínuo e sem renderização a cada segundo. |
| 12 | Abas Modelos e Pessoal | Modelos: durações com `formatarDuracao` e "—" quando nula ou menor que 1 minuto, e sem o cartão "Total" repetido na lista; Pessoal: estado vazio com ação quando os três indicadores e as duas listas estão zerados. Sem redesenho. | Redesenhar as duas abas. | Escopo da spec (RF-19, RF-20; "Fora de escopo"). |
| 14 | Código do modelo na fila (RF-02) | `modeloCodigo` da listagem só vem preenchido em solicitação de **criação** (conferido na API em 2026-10-09: nulo em 100 de 100 atrasadas, que são reengenharia e reparo). Cada item visível da fila busca o modelo com `useModelo(modeloId)` (já usado por `SeletorDeModelo`), numa consulta por item, deduplicada por modelo; o código aparece quando chega e o item não espera por ele. | Pedir `modeloCodigo` para todos os tipos ao backend (fora de escopo desta spec); buscar todos os modelos. | A spec não abre issue de backend; são até 5 consultas pequenas, só dos itens que aparecem. |
| 13 | Requisições ao carregar | Os hooks usam `solicitacoesKeys.list(...)` (chave debaixo de `lists()`), para os eventos de tempo real que já invalidam as listas atualizarem a fila e as contagens. | Chaves próprias. | Reaproveita a atualização que já existe. |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Tabela de configuração (dados, não classes) | `lib/distribuicaoDoTrabalho.ts`: visões status, tipo e prioridade com ordem, rótulo e nome do parâmetro de URL | As três visões da distribuição diferem só em dados | Nenhum |

> **Considerados e recusados:** **Strategy** para as visões da distribuição (são três linhas
> de dados, uma classe por visão seria cerimônia); **Observer/Context** para o período (um
> nível de propriedade); **Facade** sobre as consultas do painel (cada hook já é a fachada
> do seu bloco); **Composite** para os blocos (a página só lista seções em ordem).

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/features/solicitacoes/lib/periodoDoPainel.ts` (períodos 7/30/90, intervalo atual e anterior truncados ao dia) | criar | `TST/features/solicitacoes/lib/periodoDoPainel.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/leituraDosIndicadores.ts` (variação, tons, "sem dados no período anterior", média com amostra) | criar | `TST/features/solicitacoes/lib/leituraDosIndicadores.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/filaDeAtencao.ts` (ordenar por atraso, limite de 5, responsáveis com reserva) | criar | `TST/features/solicitacoes/lib/filaDeAtencao.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/distribuicaoDoTrabalho.ts` (visões e `caminhoDoFiltro`) | criar | `TST/features/solicitacoes/lib/distribuicaoDoTrabalho.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/filtrosDaUrl.ts` (lê e valida `status`, `tipo`, `prioridade`, `atrasada`, `emAberto`, `maquina`) | criar | `TST/features/solicitacoes/lib/filtrosDaUrl.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/tendenciaDoPeriodo.ts` (escala e marcas do eixo, rótulo de cada ponto) | criar | `TST/features/solicitacoes/lib/tendenciaDoPeriodo.test.ts` |
| adaptador UI↔regra | `SRC/features/solicitacoes/hooks/useFilaDeAtencao.ts` | criar | `TST/features/solicitacoes/hooks/useFilaDeAtencao.test.tsx` |
| adaptador UI↔regra | `SRC/features/solicitacoes/hooks/useIndicadoresDoPeriodo.ts` (concluídas e tempo médio, atual e anterior) | criar | `TST/features/solicitacoes/hooks/useIndicadoresDoPeriodo.test.tsx` |
| adaptador UI↔regra | `SRC/features/solicitacoes/hooks/useDistribuicaoDoTrabalho.ts` (tipo e prioridade só quando a visão está ativa) | criar | `TST/features/solicitacoes/hooks/useDistribuicaoDoTrabalho.test.tsx` |
| adapters/presenters | `SRC/shared/components/ControleSegmentado/ControleSegmentado.tsx` | criar | `TST/shared/components/ControleSegmentado/ControleSegmentado.test.tsx` |
| adapters/presenters | `SRC/shared/components/ErrorState/ErrorState.tsx` (`onRetry`) | alterar | `TST/shared/components/ErrorState/ErrorState.test.tsx` |
| adapters/presenters | `SRC/shared/components/SecaoRecolhivel/SecaoRecolhivel.tsx` (propriedade opcional `abertaPorPadrao`; acrescentada na implementação: a tabela de valores da tendência abria aberta, com 31 linhas, e esticava o cartão) | alterar | `TST/shared/components/SecaoRecolhivel/SecaoRecolhivel.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/FilaDeAtencao.tsx` | criar | `TST/features/solicitacoes/components/FilaDeAtencao.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/FaixaDeIndicadores.tsx` | criar | `TST/features/solicitacoes/components/FaixaDeIndicadores.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/TendenciaDoPeriodo.tsx` (substitui `HistoricoChart`) | criar | `TST/features/solicitacoes/components/TendenciaDoPeriodo.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/HistoricoChart.tsx` | remover | remover `TST/features/solicitacoes/components/HistoricoChart.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/DistribuicaoDoTrabalho.tsx` | criar | `TST/features/solicitacoes/components/DistribuicaoDoTrabalho.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/AtualizadoEm.tsx` | criar | `TST/features/solicitacoes/components/AtualizadoEm.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/SolicitacaoFilters.tsx` (etiquetas dos filtros vindos da URL) | alterar | `TST/features/solicitacoes/components/SolicitacaoFilters.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/DashboardKpiCard.tsx` (propriedade opcional `leitura`) | alterar | `TST/features/solicitacoes/pages/DashboardKpiCard.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx` (vira composição dos blocos) | alterar | `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/DashboardPage.tsx` (topo, período, estados por bloco) | alterar | `TST/features/solicitacoes/pages/DashboardPage.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/ModelosTab.tsx` | alterar | `TST/features/solicitacoes/pages/ModelosTab.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/PessoalTab.tsx` | alterar | `TST/features/solicitacoes/pages/PessoalTab.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx` (lê a URL, abre na Lista) | alterar | `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` |
| infra | `SRC/app/providers/queryOptions.ts` (opções padrão das consultas: `retry`, `staleTime` de 30 s, `gcTime` de 5 min) | criar (emenda do plano em 2026-10-10: o teste da T018, "voltar a uma visão já carregada não refaz as chamadas", precisa da configuração real do provider e não de uma cópia) | importado por `TST/features/solicitacoes/hooks/useDistribuicaoDoTrabalho.test.tsx`; arquivo só de constante (não é regra de negócio, então o Princípio 10 não pede pasta medida); `app/providers/**` está em `coverage.exclude`, e por isso ele é medido por `make cover-arquivos`, não pelo `make cover` |
| infra | `SRC/app/providers/QueryProvider.tsx` | alterar (passa a importar as opções de `queryOptions.ts`; comportamento igual) | exercitado pelos testes que montam o provider |
| fora de `app/src` | `app/tests/e2e/dashboard.spec.ts` | alterar | rodado por `make e2e` |
| fora de `app/` | `openspec/README.md` | alterar (duas linhas na tabela "O que mudou depois da v1.5.0": `metricas-dashboard` e `solicitacoes-kanban`, Princípio 12) | — |

## Cobertura dos requisitos

| Requisito | Onde é atendido |
|---|---|
| RF-01, RF-02, RF-04 | `FilaDeAtencao`, `useFilaDeAtencao`, `filaDeAtencao.ts` |
| RF-03 | `FilaDeAtencao` ("Ver todas"), `filtrosDaUrl.ts`, `SolicitacoesPage`, `SolicitacaoFilters` |
| RF-05, RF-06 | `FaixaDeIndicadores`, `DashboardKpiCard`, `useIndicadoresDoPeriodo`, `leituraDosIndicadores.ts` |
| RF-07 | `periodoDoPainel.ts`, `ControleSegmentado`, `SolicitacoesTab` |
| RF-08, RF-09 | `TendenciaDoPeriodo`, `tendenciaDoPeriodo.ts` |
| RF-10, RF-11 | `DistribuicaoDoTrabalho`, `distribuicaoDoTrabalho.ts`, `useDistribuicaoDoTrabalho`, `filtrosDaUrl.ts` |
| RF-12, RF-13 | `SolicitacoesTab` (sai "Usuários", "Modelos", a tabela e as três listas de barras) |
| RF-14 | `DashboardPage`, `AtualizadoEm` |
| RF-15 | cada bloco com `LoadingState`, `EmptyState` e `ErrorState` com `onRetry` |
| RF-16, RF-17 | grade de `SolicitacoesTab` (blocos da mesma linha com `h-full`; ordem das perguntas no celular) |
| RF-18 | `DashboardPage` (operador só vê "Pessoal"; mantido) |
| RF-19 | `ModelosTab` |
| RF-20 | `PessoalTab` |
| RNF-01 a RNF-07 | medidos no roteiro de capturas e nos testes de componente (ver Contrato entre camadas) |
| RNF-08 | `make cover-arquivos` |

## Contrato entre camadas

- **Página → hooks → API.** `SolicitacoesTab` não chama `*Api.ts`: cada bloco usa um hook
  (`useFilaDeAtencao`, `useIndicadoresDoPeriodo`, `useDistribuicaoDoTrabalho`, `useMetricas`,
  `useHistoricoMetricas`), e os hooks chamam `solicitacoesApi`. Nenhuma chamada nova de
  `fetch` fora de `shared/api/httpClient.ts`.
- **Estado por bloco.** Cada hook devolve `isLoading`, `isError` e `refetch`; o bloco decide
  entre carregando, vazio, erro com "Tentar novamente" e conteúdo. O erro de um bloco não
  passa por cima do outro: `DashboardPage` deixa de trocar a aba inteira por um erro.
- **Regra em `lib/`.** Ordenar, calcular variação, escolher tom e montar o caminho do filtro
  são funções puras testadas sem renderizar. Os componentes só desenham o que a regra manda.
- **URL como contrato entre telas.** O painel monta `/app/solicitacoes?...` com
  `caminhoDoFiltro` e `SolicitacoesPage` lê com `filtrosDaUrl`; valor desconhecido na URL é
  ignorado (nunca vai para a API).
- **Erro de requisição.** Mensagem própria do bloco ("Não foi possível carregar a fila de
  atenção"); a mensagem crua da API não aparece (o resto é a spec 015).

### Orçamento de requisições (RNF-03)

| Momento | Requisições | Quais |
|---|---|---|
| Carregamento da aba Solicitações | 5, mais até 5 do código do modelo da fila (10 no máximo, menos se os itens repetem o modelo) | métricas; atrasadas em aberto (fila e indicador); concluídas do período atual; concluídas do período anterior; histórico; `GET /modelos/{id}` de cada item visível da fila |
| Escolher "Tipo" na distribuição | +4 | uma contagem por tipo, em aberto |
| Escolher "Prioridade" na distribuição | +4 | uma contagem por prioridade, em aberto |
| Trocar o período | 3 | concluídas atual, concluídas anterior, histórico |

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| Nenhuma nova | — | O gráfico é feito à mão e o controle segmentado é componente do projeto | — |
| API do backend (`/solicitacoes`, `/solicitacoes/metricas`, `/solicitacoes/metricas/historico`) | v1.5.0 (produção) e `develop` | Dados do painel | `vi.spyOn(solicitacoesApi, ...)` nos testes de hook e de página; Playwright com o backend local nos e2e |

## Impacto no contrato de operação

Nenhum alvo novo. Tudo roda por `make test`, `make cover-arquivos`, `make lint`, `make fmt`,
`make e2e` e `make validate`. As capturas (1440 × 900 e 390 × 844, claro e escuro, contra o
backend real local) saem de um roteiro Playwright fora dos repositórios, em
`/root/rgm/evidencias/013-frontend/`, como nas specs anteriores.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| **R1.** A hipótese da spec de que o histórico alimenta a variação não se sustenta (agrupa por criação, arredonda em horas) | confirmada | Decisões 1 e 2: concluídas e tempo médio vêm da listagem por data de conclusão. A spec não muda de intenção: continua variação só para concluídas e tempo médio. Registrado aqui antes de implementar |
| **R2.** Sem ordenação na API, "mais atrasada primeiro" só é exata até 100 atrasadas; acima disso vale entre as 100 mais antigas de criação | média (hoje 123 em dados de teste; fábrica real tende a menos) | A tela mostra o total real ("Ver todas (N)"); se o uso pedir, abrir issue de backend para ordenar por prazo |
| **R3.** Tempo médio de uma amostra de 100 quando houver mais concluídas no período | baixa hoje (34 concluídas), cresce com o uso | O indicador declara "média de 100 de N"; ordenação por conclusão fica como issue de backend |
| **R4.** `SolicitacoesPage` e `SolicitacaoFilters` mudam aqui e na spec 014 (#146) | média | Aqui só entram a leitura da URL e as etiquetas, em trechos separados; a 014 parte de `develop` com esta spec já mesclada |
| **R5.** Testes atuais de `SolicitacoesTab`, `DashboardPage`, `HistoricoChart` e e2e do dashboard descrevem o painel antigo | alta | As tarefas listam cada teste afetado antes de apagar código; os e2e passam a procurar a fila e os indicadores novos |
| **R6.** Gráfico à mão sem eixo acessível | média | Tabela de valores em `SecaoRecolhivel`, `role="img"` com rótulo resumido e valores por foco de teclado; verificado por teste de componente |
| **R11.** Orçamento de requisições sem folga: 5 do painel mais até 5 do código do modelo = 10, o limite do RNF-03 | média | Consultas deduplicadas por modelo; as do código do modelo não bloqueiam a fila; o roteiro de medição (T051) conta e falha acima de 10; se estourar, o código do modelo vira "ver ficha" sem consulta |
| **R9.** Backend v1.5.0 em produção ignora `emAberto`: a fila pode listar atrasada já concluída e as contagens incluem encerradas | alta se o frontend for publicado antes do backend | Ordem de publicação declarada na spec: backend de `develop` primeiro; registrar na entrega (`/bu:deliver`) e no roteiro de release |
| **R10.** Se as métricas globais falham, a faixa (indicador "Abertas") e a distribuição por status ficam sem dado | média | Cada um dos dois blocos mostra o seu erro com "Tentar novamente" ligado ao `refetch` das métricas; fila, concluídas e tendência continuam |
| **R7.** Backend em produção (v1.5.0) sem `responsaveis` | média | Reserva da decisão 9, coberta por teste |
| **R8.** Variação sobre período anterior com poucos dados engana ("+300%" sobre 1 solicitação) | média | Abaixo de 5 concluídas no período anterior, a leitura mostra a diferença absoluta ("+3 contra o período anterior") em vez de percentual |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | Tudo por `make`; nenhum alvo novo; capturas por roteiro fora dos repositórios |
| 2 Arquitetura limpa | Camadas pelo mapa do Princípio 7: regra pura em `lib/`, consulta em `hooks/`, desenho em `components/` e `pages/`; sem `core`/`adapters` novos |
| 3 Testes provam a entrega | Todo arquivo de produção tem teste espelhado em `app/tests/unit`; teste atômico `deve ... quando ...`, AAA, mocks por `vi.spyOn` tipado; cenários da spec viram testes de módulo/componente; cobertura mínima de 95% por arquivo alterado via `make cover-arquivos` |
| 4 Simplicidade defensável | Sem biblioteca nova; tabela de configuração no lugar de Strategy; um nível de propriedade no lugar de contexto; padrões recusados registrados |
| 5 Autoria | Commits, PR e issues sem crédito a ferramenta de IA |
| 6 Idioma | Artefatos em português; cenários em DADO/QUANDO/ENTÃO/MAS; identificadores de código seguem o padrão do projeto |
| 7 Mapa de pastas do legado | Código em `features/solicitacoes/{lib,hooks,components,pages}` e `shared/components`; testes em `app/tests/unit` espelhados; nada de `fetch` fora do `httpClient`; componente novo fala com hook, não com `*Api.ts` |
| 8 Linguagem ubíqua | Nomes de domínio em português (`filaDeAtencao`, `distribuicaoDoTrabalho`, `periodoDoPainel`); termos técnicos em inglês (`hook`, `Page`) |
| 9 Compatibilidade com o backend em produção | `emAberto` só existe depois da v1.5.0, então a spec declara a ordem de publicação (backend primeiro, R9); os demais campos e filtros são da v1.5.0; `responsaveis` com reserva (decisão 9); a regra de permissão do painel continua no cliente só como esconder, e a API recusa o resto |
