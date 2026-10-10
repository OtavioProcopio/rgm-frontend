# Tarefas — Dashboard: uma pergunta por bloco, sem informação repetida e com indicadores que dizem algo

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova: a tarefa de teste é
> escrita, rodada e vista falhar pelo motivo certo antes da tarefa de implementação.

> O repositório não tem `app/tests/bdd/`: pela decisão do usuário de 2026-10-07 (spec 010),
> cada cenário da spec é um teste no arquivo indicado, com o nome do cenário. A tabela
> **Cenários da spec × teste**, no fim, faz a correspondência.

> Checklists `checklists/requisitos.md` (21 itens), `checklists/acessibilidade.md` (11) e
> `checklists/desempenho.md` (6): o usuário os viu em 2026-10-09 e respondeu "Ok" às quatro
> propostas; as lacunas viraram requisitos e cenários na spec (Esclarecimento 7). **As caixas
> seguem sem marca**: o usuário não as marcou item a item, e o agente não as marca por ele.
> A nota do estado da revisão não foi gravada nos checklists (a edição foi recusada pelo
> usuário); o registro está no Esclarecimento 7 da `spec.md`.

> Regras de execução desta feature (memória do projeto): todo arquivo é criado e editado com
> Write e Edit (nunca script nem `cat >>` no shell); toda ferramenta roda por `make`;
> `make fmt` e `make lint` sempre com `CAMINHO=`; cada par de teste e implementação de uma
> fase `[P]` vai para um subagente `bu:developer`; o teste é visto falhar antes de
> implementar; nenhum pacote novo em `app/package.json`.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`. Toda ferramenta roda por `make`, na raiz do repositório.

## Fase 0 — Linha de base

- [x] T001 Roteiro de medição em `/root/rgm/evidencias/013-frontend/medir013.cjs` (backend real local e Vite): em 1440 × 900 e 390 × 844, grava a posição do primeiro item da fila de atenção em relação à dobra (RNF-01), o tempo até a fila e até os indicadores (RNF-02), o número de requisições da aba Solicitações ao carregar, contadas na rede do navegador (RNF-03), o contraste de texto e dos elementos gráficos nos dois temas (RNF-04), a área dos alvos de toque com ponteiro de toque (RNF-06), as animações contínuas em andamento (RNF-07), a altura dos blocos da mesma linha (RF-16) e a rolagem horizontal em 390 px (RF-17); roda em `f8066d0` (worktree com `node_modules` por link e `dist` próprio servido com proxy para o backend) e guarda o resultado "antes"

## Fase 1 — Domínio (regras puras)

- [x] T002 [P] Criar `TST/features/solicitacoes/lib/periodoDoPainel.test.ts`: `PERIODOS` é 7, 30 e 90; `intervalosDoPeriodo(dias, agora)` devolve o período atual (de `dias` dias antes de `agora` até `agora`) e o anterior (os `dias` dias antes do atual), ambos com o início truncado ao dia em UTC; o mesmo `agora` dentro do dia dá o mesmo resultado (estável para chave de consulta); 7, 30 e 90 dão intervalos de 7, 30 e 90 dias
- [x] T003 [P] Criar `SRC/features/solicitacoes/lib/periodoDoPainel.ts`
- [x] T004 [P] Criar `TST/features/solicitacoes/lib/leituraDosIndicadores.test.ts`: `variacaoDeConcluidas(atual, anterior)` dá percentual com 5 ou mais no período anterior ("+25%"), diferença absoluta com menos de 5 ("+3 contra o período anterior"), "sem dados no período anterior" com anterior 0 e nunca "0%" nem divisão por zero; `tomDoAtraso(atrasadas, abertas)` dá `ok` com 0, `atencao` até 10% das abertas (inclusive 10%) e `ruim` acima, e `ok` com 0 abertas; `tomDoTempoMedio(atual, anterior)` dá `ok` quando menor, `neutro` quando igual ou sem anterior e `ruim` quando maior; toda leitura leva um rótulo em texto ("Em dia", "Atenção", "Ruim"); `tempoMedioDeResolucao(itens, total)` faz a média em segundos ignorando itens sem `tempoResolucaoSegundos`, devolve a amostra `{ usados, total }` só quando `total` passa de 100 e nulo quando não há item
- [x] T005 [P] Criar `SRC/features/solicitacoes/lib/leituraDosIndicadores.ts`
- [x] T006 [P] Criar `TST/features/solicitacoes/lib/filaDeAtencao.test.ts`: `ordenarPorAtraso` põe o menor `prazoLimite` primeiro, deixa sem prazo no fim e mantém a ordem de chegada em empate; `LIMITE_DA_FILA` é 5; `itensDaFila(solicitacoes, agoraMs)` devolve no máximo 5 com título inteiro, `modeloId` (o código vem de `useModelo` no componente, porque `modeloCodigo` da listagem só é preenchido em solicitação de criação), etapa (rótulo do status) e o atraso escrito por `situacaoDoPrazo` ("Atrasada há 2 d"); `responsaveisEmTexto` junta os nomes de `responsaveis`, cai para "N responsável(is)" (singular com 1) quando a API só traz `responsavelIds` e dá "Sem responsável" quando não há nenhum; nenhum identificador aparece no texto
- [x] T007 [P] Criar `SRC/features/solicitacoes/lib/filaDeAtencao.ts`
- [x] T008 [P] Criar `TST/features/solicitacoes/lib/distribuicaoDoTrabalho.test.ts`: as visões são status, tipo e prioridade, nessa ordem, cada uma com rótulo e valores na ordem do domínio; a visão status só tem A fazer, Em andamento e Em validação; `caminhoDoFiltro(visao, valor)` devolve `/app/solicitacoes?emAberto=true&<param>=<valor>` com o valor codificado (`status`, `tipo` ou `prioridade`); `caminhoDasAtrasadas()` devolve `/app/solicitacoes?atrasada=true&emAberto=true`
- [x] T009 [P] Criar `SRC/features/solicitacoes/lib/distribuicaoDoTrabalho.ts`
- [x] T010 [P] Criar `TST/features/solicitacoes/lib/filtrosDaUrl.test.ts`: lê `status`, `tipo`, `prioridade`, `atrasada` (só `true`), `emAberto` (só `true`) e `maquina`; valor fora da lista permitida é ignorado e não sai no resultado; parâmetro desconhecido é ignorado; sem parâmetro devolve objeto vazio e `temFiltroDoPainel` falso; com qualquer um dos cinco (menos `maquina`) `temFiltroDoPainel` é verdadeiro
- [x] T011 [P] Criar `SRC/features/solicitacoes/lib/filtrosDaUrl.ts`
- [x] T012 [P] Criar `TST/features/solicitacoes/lib/tendenciaDoPeriodo.test.ts`: `marcasDoEixo(maximo)` devolve 3 marcas (0, meio e topo arredondado para cima a um valor redondo) e, com máximo 0, devolve o eixo de 0 a 1; `semMovimento(series)` é verdadeiro quando todos os pontos têm `abertas` e `concluidas` zerados e falso quando algum não tem; `ehHoje(indice, total)` é verdadeiro só no último ponto e `rotuloDoUltimoPonto(dias)` diz "Hoje" até 30 dias e "Esta semana" acima disso; `rotuloDoPonto(ponto)` escreve "09/10: 44 criadas, 33 ainda abertas, 5 concluídas" (a série é por data de criação)
- [x] T013 [P] Criar `SRC/features/solicitacoes/lib/tendenciaDoPeriodo.ts`

## Fase 2 — Hooks

- [x] T014 [P] Criar `TST/features/solicitacoes/hooks/useFilaDeAtencao.test.tsx`: chama `solicitacoesApi.listar` uma vez com `{ atrasada: true, emAberto: true, page: 0, size: 100 }`; devolve no máximo 5 itens ordenados por atraso e `total` com o `totalElements` real (130 com 100 carregados); expõe `isLoading`, `isError`, `refetch` e `dataUpdatedAt`; `enabled: false` não consulta; usa `solicitacoesKeys.list` (a chave fica debaixo de `lists()`)
- [x] T015 [P] Criar `SRC/features/solicitacoes/hooks/useFilaDeAtencao.ts`
- [x] T016 [P] Criar `TST/features/solicitacoes/hooks/useIndicadoresDoPeriodo.test.tsx`: faz duas chamadas a `listar` com `status: 'CONCLUIDA'`, `tipoData: 'CONCLUSAO'`, `size: 100` e os intervalos atual e anterior de `intervalosDoPeriodo`; devolve concluídas atual e anterior pelo `totalElements` e o tempo médio pela regra de `tempoMedioDeResolucao`; trocar o período refaz só estas duas chamadas; erro de uma consulta aparece em `isError` com `refetch` que refaz as duas
- [x] T017 [P] Criar `SRC/features/solicitacoes/hooks/useIndicadoresDoPeriodo.ts`
- [x] T018 [P] Criar `TST/features/solicitacoes/hooks/useDistribuicaoDoTrabalho.test.tsx`: na visão status devolve as contagens de `metricas.solicitacoesPorStatus` e não chama `listar`; na visão tipo faz 4 chamadas com `emAberto: true`, `size: 1` e cada tipo; na visão prioridade faz 4 com cada prioridade; visão inativa não consulta (`enabled`); voltar a uma visão já carregada não refaz as chamadas; erro expõe `isError` e `refetch`
- [x] T019 [P] Criar `SRC/features/solicitacoes/hooks/useDistribuicaoDoTrabalho.ts`

## Fase 3 — Peças compartilhadas

- [x] T020 [P] Criar `TST/shared/components/ControleSegmentado/ControleSegmentado.test.tsx`: `role="radiogroup"` com um `radio` por opção e `aria-checked` na escolhida; o rótulo da escolhida é texto visível (não só cor); clique e Enter/Espaço escolhem; setas movem e escolhem com volta nas pontas; alvo de toque com a classe de altura mínima de 44 px em ponteiro de toque
- [x] T021 [P] Criar `SRC/shared/components/ControleSegmentado/ControleSegmentado.tsx`
- [x] T022 [P] Alterar `TST/shared/components/ErrorState/ErrorState.test.tsx` (já existe; conferir os casos atuais antes e conferir por busca os testes de outras telas que dependem do `role` do bloco): sem `onRetry` não mostra botão; com `onRetry` mostra "Tentar novamente" e o clique chama a função uma vez; o bloco tem `role="alert"`; título e descrição continuam como hoje
- [x] T023 [P] Alterar `SRC/shared/components/ErrorState/ErrorState.tsx`: `onRetry` opcional e `role="alert"`
- [x] T024 [P] Alterar `TST/features/solicitacoes/pages/DashboardKpiCard.test.tsx`: sem `leitura` desenha como hoje; com `leitura` mostra o texto da leitura e um ícone do tom (`ok`, `atencao`, `ruim`, `neutro`), nunca só cor; o ícone decorativo não é anunciado
- [x] T025 [P] Alterar `SRC/features/solicitacoes/pages/DashboardKpiCard.tsx`: propriedade opcional `leitura` (`{ tom, texto }`)
- [x] T026 [P] Criar `TST/features/solicitacoes/components/AtualizadoEm.test.tsx`: mostra "Atualizado às 13:09" em pt-BR a partir do instante recebido, num `<time dateTime>`; instante 0 ou indefinido não mostra nada; não tem animação
- [x] T027 [P] Criar `SRC/features/solicitacoes/components/AtualizadoEm.tsx`

## Fase 4 — Blocos do painel

- [x] T028 [P] Criar `TST/features/solicitacoes/components/FilaDeAtencao.test.tsx` (cenários da spec: *Fila de atenção abre o painel*, *Fila vazia*, *Fila sem os nomes dos responsáveis*, *Mais de 100 atrasadas*): seção "Precisa de atenção" com a mais atrasada primeiro; cada item mostra título inteiro, responsáveis, etapa e "Atrasada há", e é link para `/app/solicitacoes/<id>`; o código do modelo vem de `modelosApi.buscarPorId` (um por modelo, deduplicado), aparece quando chega, não atrasa o item e some sem erro quando a consulta falha; o cabeçalho não repete o total de atrasadas (decisão 8 da spec: o número mora só no indicador "Em atraso") e "Ver todas" tem `href` de `caminhoDasAtrasadas`; vazio diz que nada está atrasado e o bloco não some; carregando anuncia por `role="status"`; erro mostra `ErrorState` com "Tentar novamente" que chama `refetch`
- [x] T029 [P] Criar `SRC/features/solicitacoes/components/FilaDeAtencao.tsx`
- [x] T030 [P] Criar `TST/features/solicitacoes/components/FaixaDeIndicadores.test.tsx` (cenários: *Indicador com leitura*, *Indicador sem período anterior*, *Pouco dado no período anterior*, *Mais de 100 concluídas no período*, *Falha nos indicadores ou na tendência*): quatro indicadores (abertas, em atraso, concluídas no período, tempo médio); concluídas e tempo médio com variação contra o período anterior; abertas e em atraso só com valor de agora e em atraso com tom pela regra de 10%; sem período anterior diz "sem dados no período anterior" e não mostra variação numérica; menos de 5 mostra a diferença absoluta; mais de 100 diz "média de 100 de N"; tempo médio nulo mostra "—"; erro mostra `ErrorState` com `refetch`
- [x] T031 [P] Criar `SRC/features/solicitacoes/components/FaixaDeIndicadores.tsx`
- [x] T032 [P] Criar `TST/features/solicitacoes/components/TendenciaDoPeriodo.test.tsx` (cenários: *Tendência legível*, *Tendência sem dados*): duas barras por ponto (abertas e concluídas da série), eixo com 3 marcas, último ponto marcado como hoje, valor de cada ponto por foco do teclado e por título; legenda diz "criadas neste dia que hoje estão abertas / concluídas"; `SecaoRecolhivel` "Ver valores em tabela" com os mesmos números; `role="img"` com rótulo resumido; sem movimento mostra "Nenhuma solicitação aberta ou concluída nos últimos 30 dias" com a mesma altura do gráfico; erro com "Tentar novamente"
- [x] T033 [P] Criar `SRC/features/solicitacoes/components/TendenciaDoPeriodo.tsx`
- [x] T034 [P] Criar `TST/features/solicitacoes/components/DistribuicaoDoTrabalho.test.tsx` (cenário *Distribuição única com filtro no quadro*): `ControleSegmentado` com Status, Tipo e Prioridade; cada parte é link com `href` de `caminhoDoFiltro`; a visão status não consulta; escolher Tipo ou Prioridade só então consulta; não há tabela por status nem três blocos; carregando e erro da visão com "Tentar novamente"
- [x] T035 [P] Criar `SRC/features/solicitacoes/components/DistribuicaoDoTrabalho.tsx`
- [x] T036 [P] Alterar `TST/features/solicitacoes/components/SolicitacaoFilters.test.tsx`: filtros que vieram da URL (`atrasada`, `emAberto`) aparecem como etiquetas "Em atraso" e "Em aberto"; remover a etiqueta tira o filtro e volta à página 0; sem filtro da URL não há etiqueta; os selects de status, tipo e prioridade continuam como hoje
- [x] T037 [P] Alterar `SRC/features/solicitacoes/components/SolicitacaoFilters.tsx`

## Fase 5 — Telas

- [x] T038 Alterar `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` (cenários: *Um período só para a tela*, *Cadastros fora do painel de solicitações*, *Nenhuma contagem repetida*, *Erro de um bloco não derruba os outros*, *Trocar o período não recarrega a fila*, *Blocos da mesma linha com a mesma altura*): ordem fila, indicadores, tendência, distribuição; um único `ControleSegmentado` de período (7, 30, 90) que muda faixa e tendência; trocar o período não chama `listar` da fila de novo; sem "Usuários", "Modelos", "Distribuição detalhada por status", "Acompanhamento Crítico" nem "Operação Saudável"; cada contagem em um só bloco; falha de um bloco deixa os outros; falha das métricas globais mostra o erro com "Tentar novamente" só na faixa (indicador "Abertas") e na distribuição por status, e a fila, as concluídas e a tendência continuam (R10 do plano); blocos da mesma linha com a classe de altura igual; sem `animate-pulse` nem `animate-spin-slow`
- [x] T039 Reescrever `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx` como composição de `FilaDeAtencao`, `FaixaDeIndicadores`, `TendenciaDoPeriodo` e `DistribuicaoDoTrabalho`, com o estado do período (remove `useDistribuicoes`, `BarRow`, a tabela e as constantes de cor que ficaram sem uso)
- [x] T040 Remover `SRC/features/solicitacoes/components/HistoricoChart.tsx` e `TST/features/solicitacoes/components/HistoricoChart.test.tsx` (substituídos por `TendenciaDoPeriodo`); conferir por busca que nada mais importa
- [x] T041 Alterar `TST/features/solicitacoes/pages/DashboardPage.test.tsx` (cenários: *Topo sem repetição*, *Operador não vê o agregado*, *Celular*, *Erro de um bloco não derruba os outros*): título "Dashboard" e `AtualizadoEm`, sem a descrição com o total e sem "Monitoramento em Tempo Real"; operador só vê "Pessoal" e não faz as consultas do agregado; gestor e administrador veem as três abas; falha das métricas não troca a aba inteira por um erro
- [x] T042 Alterar `SRC/features/solicitacoes/pages/DashboardPage.tsx`: topo sem pílula e sem descrição, `AtualizadoEm` com o `dataUpdatedAt` mais recente entre as métricas e a fila, erro por bloco no lugar do erro da aba
- [x] T043 [P] Alterar `TST/features/solicitacoes/pages/ModelosTab.test.tsx` (cenário *Aba Modelos sem valor vazio*): tempo médio e intervalo menores que 1 minuto ou nulos aparecem como "—" e nunca "0h"; durações escritas por `formatarDuracao`; o cartão "Total" não repete a contagem de outro bloco
- [x] T044 [P] Alterar `SRC/features/solicitacoes/pages/ModelosTab.tsx`
- [x] T045 [P] Alterar `TST/features/solicitacoes/pages/PessoalTab.test.tsx` (cenário *Aba Pessoal sem nada*): com os três indicadores e as duas listas zerados mostra `EmptyState` com a ação "Ver o quadro" e nenhum painel vazio; com dado mantém os indicadores e as listas como hoje
- [x] T046 [P] Alterar `SRC/features/solicitacoes/pages/PessoalTab.tsx`
- [x] T047 [P] Alterar `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` (cenário *Ver todas as atrasadas leva à lista filtrada*): com `?atrasada=true&emAberto=true` abre na visão Lista, chama `listar` com `atrasada` e `emAberto` e mostra as etiquetas; `?tipo=REPARO&emAberto=true` filtra por tipo; valor inválido na URL é ignorado; sem parâmetro abre no Kanban como hoje; `?maquina=` continua funcionando
- [x] T048 [P] Alterar `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`: lê a URL com `filtrosDaUrl` e abre na Lista quando há filtro do painel ou máquina

## Fase 6 — Integração e fechamento

- [x] T049 Alterar `app/tests/e2e/dashboard.spec.ts`: no lugar de "solicitações no total", "Lead time médio" e das quatro seções antigas, conferir a seção "Precisa de atenção", os quatro indicadores, o gráfico de tendência, a distribuição única e que "Ver todas" abre a lista filtrada; conferir por busca os outros roteiros de `app/tests/e2e/` que citam o painel (`solicitacao-criacao.spec.ts`, linha do teste "métricas do dashboard não quebram com CRIACAO sem modelo") e ajustar o que descreve o painel antigo
- [x] T050 [P] Conferir por busca em `app/README.md` e em `docs/` se algum texto descreve o painel antigo ("Monitoramento em Tempo Real", "Acompanhamento Crítico", "Lead time médio") e atualizar o que achar; se não houver, registrar na convergência
- [x] T051 Medição "depois" com `medir013.cjs` na branch e comparação com a T001: RNF-01, RNF-02, RNF-03 (5 requisições ao carregar, +4 por visão), RNF-04, RNF-06, RNF-07, RF-16 e RF-17, e as capturas do painel em 1440 × 900 e 390 × 844, claro e escuro, contra o backend real local, para enviar ao usuário
- [x] T052 Rodar a feature contra o backend de `develop` (ambiente local, ver a memória do ambiente de integração): fila com "Ver todas" abrindo a lista filtrada, troca de período, distribuição por tipo e prioridade, aba Pessoal vazia com usuário novo e a suíte `make e2e`; registrar na convergência
- [x] T053 `make cover-arquivos ARQUIVOS="<todos os arquivos de src/ alterados ou criados>"` com 95% em cada um (RNF-08) e `app/package.json` sem pacote novo
- [x] T054 `make validate` verde

## Cenários da spec × teste

| Cenário da spec | Teste |
|---|---|
| Fila de atenção abre o painel | `TST/features/solicitacoes/components/FilaDeAtencao.test.tsx` (T028) e `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` (T038, ordem) |
| Ver todas as atrasadas leva à lista filtrada | `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` (T047), T036 (etiquetas) e `app/tests/e2e/dashboard.spec.ts` (T049) |
| Fila sem os nomes dos responsáveis | T028 e `TST/features/solicitacoes/lib/filaDeAtencao.test.ts` (T006) |
| Fila vazia | T028 |
| Indicador com leitura | `TST/features/solicitacoes/components/FaixaDeIndicadores.test.tsx` (T030), `TST/features/solicitacoes/lib/leituraDosIndicadores.test.ts` (T004) e `TST/features/solicitacoes/pages/DashboardKpiCard.test.tsx` (T024) |
| Indicador sem período anterior | T030 e T004 |
| Um período só para a tela | T038 e `TST/shared/components/ControleSegmentado/ControleSegmentado.test.tsx` (T020) |
| Tendência legível | `TST/features/solicitacoes/components/TendenciaDoPeriodo.test.tsx` (T032) e `TST/features/solicitacoes/lib/tendenciaDoPeriodo.test.ts` (T012) |
| Tendência sem dados | T032 e T012 |
| Distribuição única com filtro na lista | `TST/features/solicitacoes/components/DistribuicaoDoTrabalho.test.tsx` (T034), `TST/features/solicitacoes/lib/distribuicaoDoTrabalho.test.ts` (T008) e T049 |
| Mais de 100 atrasadas | `TST/features/solicitacoes/hooks/useFilaDeAtencao.test.tsx` (T014) e T028 |
| Pouco dado no período anterior | T030 e T004 |
| Mais de 100 concluídas no período | `TST/features/solicitacoes/hooks/useIndicadoresDoPeriodo.test.tsx` (T016), T030 e T004 |
| Falha da fila de atenção | T028, T014 e `TST/shared/components/ErrorState/ErrorState.test.tsx` (T022) |
| Falha nos indicadores ou na tendência | T030, T032 e T016 |
| Trocar o período não recarrega a fila | T038 |
| Aba Modelos sem valor vazio | `TST/features/solicitacoes/pages/ModelosTab.test.tsx` (T043) |
| Aba Pessoal sem nada | `TST/features/solicitacoes/pages/PessoalTab.test.tsx` (T045) |
| Blocos da mesma linha com a mesma altura | só medição (T001 e T051): altura é estilo e o jsdom não faz layout, então a T060 retirou o teste de classe (`h-full`); a regressão aparece na medição |
| Cadastros fora do painel de solicitações | T038 |
| Nenhuma contagem repetida | T038 |
| Erro de um bloco não derruba os outros | T038 e `TST/features/solicitacoes/pages/DashboardPage.test.tsx` (T041) |
| Operador não vê o agregado | T041 |
| Celular | T038 (ordem dos blocos, em `SolicitacoesTab.test.tsx`) e medição (T051: dobra e rolagem horizontal em 390 px; o jsdom não tem viewport) |
| Topo sem repetição | T041 e `TST/features/solicitacoes/components/AtualizadoEm.test.tsx` (T026) |

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T006, T007, T014, T015, T028, T029, T038, T039 |
| RF-02 | T006, T007, T028, T029 |
| RF-03 | T008, T009, T010, T011, T028, T029, T036, T037, T047, T048, T049 |
| RF-04 | T028, T029 |
| RF-05 | T004, T005, T016, T017, T024, T025, T030, T031 |
| RF-06 | T004, T005, T030, T031 |
| RF-07 | T002, T003, T020, T021, T038, T039 |
| RF-08 | T012, T013, T032, T033 |
| RF-09 | T012, T013, T032, T033 |
| RF-10 | T008, T009, T018, T019, T034, T035 |
| RF-11 | T008, T009, T010, T011, T034, T035, T047, T048 |
| RF-12 | T038, T039 |
| RF-13 | T038, T039 |
| RF-14 | T026, T027, T041, T042 |
| RF-15 | T022, T023, T028, T029, T030, T031, T032, T033, T034, T035, T038, T039, T041, T042 |
| RF-16 | T001, T038, T039, T051 |
| RF-17 | T001, T041, T042, T051 |
| RF-18 | T041, T042 |
| RF-19 | T043, T044 |
| RF-20 | T045, T046 |
| RNF-01 | T001, T051 |
| RNF-02 | T001, T051 |
| RNF-03 | T018, T019, T001, T051 |
| RNF-04 | T001, T051 |
| RNF-05 | T020, T021, T024, T025, T028, T030, T032, T034 |
| RNF-06 | T020, T021, T001, T051 |
| RNF-07 | T038, T039, T042, T001, T051 |
| RNF-08 | T053 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-09

Caminhos relativos a `app/`. Medições de `/root/rgm/evidencias/013-frontend/antes.json` e `depois.json` (backend real local, Vite em `localhost:5173`, 583 solicitações).

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 fila primeiro, em aberto, mais atrasada primeiro | realizado | `src/features/solicitacoes/pages/SolicitacoesTab.tsx:31` (a fila é o primeiro bloco), `lib/filaDeAtencao.ts:34` (`ordenarPorAtraso`), `hooks/useFilaDeAtencao.ts:19` (`atrasada` + `emAberto`) |
| RF-02 item com título inteiro, modelo, responsáveis, etapa, atraso, link | realizado | `components/FilaDeAtencao.tsx` (`useModelo`, linha 5), `lib/filaDeAtencao.ts:44` ("Sem responsável"); `FilaDeAtencao.test.tsx` |
| RF-03 5 itens, total real e "Ver todas" para a lista filtrada | realizado | `lib/filaDeAtencao.ts:6`, `components/FilaDeAtencao.tsx:85,90`, `pages/SolicitacoesPage.tsx:22` (`lerFiltrosDaUrl`), `components/SolicitacaoFilters.tsx:42` (etiqueta removível); e2e "mostra e remove os filtros" |
| RF-04 fila vazia explicada | realizado | `components/FilaDeAtencao.tsx:45` ("Nada atrasado") |
| RF-05 quatro indicadores com leitura | realizado | `components/FaixaDeIndicadores.tsx:64..124`, `lib/leituraDosIndicadores.ts:29` |
| RF-06 sem período anterior, nunca "0%" | realizado | `lib/leituraDosIndicadores.ts:16` |
| RF-07 um só período para a tela, dito por texto | realizado | `pages/SolicitacoesTab.tsx:3` (`ControleSegmentado`), `ControleSegmentado.tsx` ("(selecionada)"); a fila não recebe `dias` |
| RF-08 tendência legível, eixo, valores, hoje, legenda, tabela | realizado | `components/TendenciaDoPeriodo.tsx` (`marcasDoEixo`, `role="tooltip"` linha 134, tabela fechada por padrão linha 204) |
| RF-09 tendência vazia explicada, mesma altura | realizado | `components/TendenciaDoPeriodo.tsx:193` (`h-44`) |
| RF-10 uma só distribuição do trabalho em aberto | realizado | `components/DistribuicaoDoTrabalho.tsx:119`, `hooks/useDistribuicaoDoTrabalho.ts:34` (status sem requisição) |
| RF-11 clique abre a lista filtrada | realizado | `components/DistribuicaoDoTrabalho.tsx:11` (`caminhoDoFiltro`); e2e "abre a lista filtrada" |
| RF-12 sem "Usuários" e "Modelos" no painel | realizado | `pages/SolicitacoesTab.tsx` (só os quatro blocos); e2e "exibe os quatro indicadores... e não os de cadastro" |
| RF-13 nenhuma contagem em mais de um bloco | **parcial** | O total de abertas deixou de repetir (removido da distribuição). **Mas o número de atrasadas aparece na fila ("125 atrasadas", `FilaDeAtencao.tsx:85`) e no indicador "Em atraso" (`FaixaDeIndicadores.tsx:87`)**: RF-03 exige o total na fila e RF-05 exige o indicador, e RF-13 proíbe a repetição. Contradição da spec; decisão do usuário (T055) |
| RF-14 topo sem repetição, hora da atualização | realizado | `pages/DashboardPage.tsx:7`, `components/AtualizadoEm.tsx:23`; sem a pílula nem a descrição com o total |
| RF-15 estado por bloco, erro isolado, "Tentar novamente" | realizado | `shared/components/ErrorState/ErrorState.tsx:15,20`, `FilaDeAtencao.tsx:64`; testes de erro por bloco em `SolicitacoesTab.test.tsx` |
| RF-16 blocos da mesma linha com a mesma altura | realizado | `pages/SolicitacoesTab.tsx:13` (`h-full`); medido no desktop: 0 grades desiguais em 2 |
| RF-17 celular: fila na primeira dobra, ordem, sem rolagem horizontal | realizado | medido em 390 × 844: primeiro item termina em 544 px de 844; `rolagemHorizontal` falso |
| RF-18 operador só vê "Pessoal" | realizado | `pages/DashboardPage.tsx:24,25`; `DashboardPage.test.tsx` (operador não faz as consultas do agregado) |
| RF-19 aba Modelos sem "0h" | realizado | `pages/ModelosTab.tsx:41,225` (`duracaoOuTraco`) |
| RF-20 aba Pessoal sem painel vazio | realizado | `pages/PessoalTab.tsx:108,159` (`PessoalVazia`) |
| RNF-01 fila acima da dobra | realizado | 1140 → 374 px (900) no desktop; 2299 → 544 px (844) no celular |
| RNF-02 tempos de carga | **parcial** | rede ociosa em 1,9 a 3,2 s no Vite de desenvolvimento (limite 3 s); uma das quatro medições passou de 3 s (3208 ms, desktop claro). Não medido no build de produção |
| RNF-03 no máximo 10 requisições ao carregar | realizado | 12 → 9 (5 do painel + 4 de `GET /modelos/{id}` da fila) |
| RNF-04 contraste | realizado | 0 de 79 textos abaixo do mínimo, nos dois temas (os elementos gráficos não foram medidos por script) |
| RNF-05 teclado e leitor de tela | realizado | testes de `ControleSegmentado`, `TendenciaDoPeriodo`, `FilaDeAtencao`, `ErrorState` (`role="alert"`) e `role="status"` nos carregamentos; não houve teste com leitor de tela real |
| RNF-06 alvo de toque de 44 px | realizado | 0 alvos abaixo de 44 px em 390 px com ponteiro de toque (a medição achou "Ver todas" com 20 px; corrigido) |
| RNF-07 sem animação contínua | realizado | 1 → 0 animações em andamento |
| RNF-08 cobertura de 95% por arquivo | realizado | 24 arquivos de produção: statements 100%, funções 100%, linhas 100%, ramos 99,51% |

Cenários da spec: os 25 têm teste (tabela *Cenários da spec × teste*) e todos passam.

`make validate` (saída real, 2026-10-09): lint sem erro e **1 aviso** (`NovaSolicitacaoPage.tsx:82`, arquivo não tocado por esta feature); typecheck sem erro; `Test Files 192 passed (192)` e `Tests 2968 passed (2968)`; cobertura global `Statements 99.89%`, `Branches 99.71%`, `Functions 100%`, `Lines 99.87%`; build `built in 1.59s`; `EXIT=0`. `make e2e` na suíte inteira contra o backend real: **53 passaram e 1 falhou**, `evidencias.spec.ts:78` ("uploader não aparece para OPERADOR não-responsável e não-autor"), que já falhava antes e é a issue #138 (spec 015); os 8 do dashboard passam.

Excesso e desvios registrados:
- `shared/components/SecaoRecolhivel/SecaoRecolhivel.tsx` ganhou `abertaPorPadrao`; não estava no plano (a captura mostrou a tabela de 31 linhas aberta esticando o cartão). Já acrescentado ao plano.
- `hooks/useDistribuicaoDoTrabalho.ts` define `staleTime` de 60 s e `gcTime` de 300 s nas contagens de tipo e prioridade: decisão do subagente, que nenhum requisito pediu. Alternar entre visões não refaz as contagens por 1 minuto; a invalidação das listas continua valendo.
- `ErrorState` ganhou `role="alert"` em todas as telas que o usam (por RNF-05); a suíte inteira passou sem ajuste de outro teste.
- Dois ajustes de fluxo: a T040 foi feita depois da T042 (o `DashboardPage` ainda importava o `HistoricoChart`); o `SolicitacaoFilters` e o `PessoalTab`/`ModelosTab` receberam testes para código antigo sem cobertura, porque a regra de 95% vale para o arquivo inteiro.
- A nota de revisão dos checklists não foi gravada neles (edição recusada pelo usuário); o registro está no Esclarecimento 7 da spec.

Veredito: **não convergido** (uma pendência que só o usuário resolve: RF-13 × RF-03, e duas ressalvas de medição, RNF-02 e RNF-05).
Tarefas acrescentadas: T055.

### Rodada 2 — 2026-10-09

Depois da decisão do usuário sobre a T055 (opção a, Esclarecimento 8 da spec).

| Requisito | Estado | Evidência |
|---|---|---|
| RF-03 5 itens, sem repetir o total, "Ver todas" para a lista filtrada | realizado | `src/features/solicitacoes/components/FilaDeAtencao.tsx` (`Cabecalho` sem total, só `Ver todas`); `FilaDeAtencao.test.tsx` ("deve não dizer o total de atrasadas quando o total é 130" e "...é 1") |
| RF-13 nenhuma contagem em mais de um bloco | realizado | o total de atrasadas só existe no indicador "Em atraso" (`FaixaDeIndicadores.tsx:87`); o de abertas só em "Abertas"; `SolicitacoesTab.test.tsx` confere cada contagem uma única vez |
| Demais RF-01 a RF-20 e RNF-01, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 | realizado | sem mudança desde a rodada 1; a mudança desta rodada só retirou um texto da fila |
| RNF-02 tempos de carga | parcial | igual à rodada 1: medido no Vite de desenvolvimento, uma de quatro medições em 3,2 s (limite 3 s); não medido no build de produção |
| RNF-05 teclado e leitor de tela | parcial | igual à rodada 1: testes de teclado e `aria`, sem leitor de tela real |

Cenários da spec: os 25 continuam com teste; os dois alterados (*Fila de atenção abre o painel* e *Mais de 100 atrasadas*) foram reescritos na spec e nos testes e passam.

`make validate` (saída real, 2026-10-09): lint sem erro e 1 aviso (`NovaSolicitacaoPage.tsx`, não tocado); typecheck sem erro; `Test Files 192 passed (192)` e `Tests 2969 passed (2969)`; cobertura global `Statements 99.89%`, `Branches 99.71%`, `Functions 100%`, `Lines 99.87%`; `built in 1.47s`; `EXIT=0`.

Excesso: nenhum novo. Os da rodada 1 continuam registrados.

Veredito: convergido, com duas ressalvas de medição (RNF-02 e RNF-05) que o usuário precisa aceitar ou mandar medir melhor.
Tarefas acrescentadas: nenhuma.

## Tarefas da convergência

- [x] T055 Decisão do usuário sobre RF-13 × RF-03: o número de atrasadas aparece na fila ("125 atrasadas") e no indicador "Em atraso". Opções: (a) tirar o total do cabeçalho da fila e deixar só "Ver todas", mantendo o indicador (a spec RF-03 pede o total na fila); (b) manter o total na fila e trocar o indicador "Em atraso" por um que não repita o número (por exemplo, só a leitura "Ruim · 24% das abertas"); (c) aceitar a repetição e emendar o RF-13 na spec. Depois da escolha: alterar `spec.md` (se for o caso), o teste e o componente correspondentes, e rodar `make validate`

### Achados do `/bu:review` de 2026-10-10 (parecer REPROVADO)

Decisão do usuário (2026-10-10): corrigir tudo do padrão `/bu:`; o achado 11 (paradas de Tab no gráfico) e o 9 (observação) ficam fora. Cada tarefa [P] mexe em arquivos próprios, sem sobreposição. Em cada uma de teste: Arrange, Act e Assert sem outros comentários, uma verificação por teste, consulta por papel ou texto acessível e não por classe CSS.

- [x] T056 [P] Achado 1: `leituraDosIndicadores.ts` devolve "Infinity%" quando `abertas === 0` e `atrasadas > 0`. Teste primeiro: o teste de `leituraDosIndicadores.test.ts` ("deve ser ruim quando há atrasadas e nenhuma aberta") passa a verificar o `texto` e falha; depois corrigir. Aproveitar o mesmo arquivo para os achados 5 e 6 (tautologia do limite 100, comentário de bloco, `// Arrange / Act` fundido) em `leituraDosIndicadores.test.ts`, `filaDeAtencao.test.ts` e `tendenciaDoPeriodo.test.ts`
- [x] T057 Achado 2: acrescentar a linha da feature 013 em `openspec/README.md` (`metricas-dashboard` e `solicitacoes-kanban`) e corrigir a decisão do `plan.md:106`, que dizia "não alterar"
- [x] T058 Achado 7: trocar a atribuição a ferramenta de IA em `spec.md` (Esclarecimentos 1 e 7) por "agente de especificação"; varrer `plan.md`, `tasks.md` e `checklists/` por outra menção a Claude ou IA
- [x] T059 [P] Achados 3, 4, 5 e 6 em `FilaDeAtencao.test.tsx`: dividir os testes de 2 a 4 verificações, trocar a consulta por classe CSS por papel ou texto, trocar a regex frouxa de `:306` por uma que pegue qualquer grafia do total, retirar a asserção sobre a fixture, ajustar blocos
- [x] T060 [P] Achados 3, 4 e 5 em `SolicitacoesTab.test.tsx` e `DashboardPage.test.tsx`: dividir os testes de 3 verificações, trocar `h-full` e `grid-cols-1` por consulta acessível, esperar a resposta antes de verificar a ausência de "Atualizado às", tirar o teste "celular" que copia a ordem de blocos
- [x] T061 [P] Achados 4 e 6 em `FaixaDeIndicadores.test.tsx` e `SecaoRecolhivel.test.tsx`: trocar `.rounded-xl`, `grid-cols-*`, `.sr-only` e `col-span-2` por consulta acessível, acrescentar o bloco Arrange onde falta, e corrigir o Act que é só consulta
- [x] T062 [P] Achados 3, 5, 6 e 10 nos hooks: `useIndicadoresDoPeriodo.test.tsx` (separar chamadas e retorno), `useFilaDeAtencao.test.tsx` (retirar "deve devolver void" e a asserção `dataUpdatedAt > 0` que não prova o instante), e `useDistribuicaoDoTrabalho.ts` sem `staleTime` e `gcTime` que nenhum requisito pede (com o teste correspondente)
- [x] T063 [P] Achado 8: `TendenciaDoPeriodo.tsx` (`GrupoDoPonto`, `Grafico`, `TabelaDeValores`, `CartaoDaTendencia`), `ControleSegmentado.tsx` e `useIndicadoresDoPeriodo.ts` com funções de 4 a 20 linhas, sem mudar comportamento; os testes existentes seguem verdes
- [x] T064 `make cover-arquivos` com todos os arquivos de `src/` e `tests/` tocados em T056 a T063, 95% em cada um (uma única execução, sem outra em paralelo)
- [x] T065 `make validate` verde
- [x] T066 `/bu:review` de novo; só `/bu:deliver` com parecer APROVADO. Resultado em 2026-10-10: **REPROVADO** (gates verdes; achados 1 a 8 abaixo, tarefas T067 a T073)

### Achados do `/bu:review` de 2026-10-10, segunda rodada (parecer REPROVADO)

Mesma regra da primeira rodada: o achado de Tab (gráfico) segue fora. Cada tarefa [P] tem arquivos próprios.

- [x] T067 [P] Achado 1 e 7: em `FilaDeAtencao.test.tsx`, o teste "deve mostrar a fila quando Tentar novamente é acionado" (~514-526) procura "Ver todas", que existe em qualquer estado, e passa com `onRetry` quebrado; "deve mostrar a região ... quando a fila carrega" (~65-74) e o `findByRole('region')` de ~76-86 também não esperam dado. Cada um deve esperar um elemento que só existe depois do dado (título de item da lista). Em `FilaDeAtencao.tsx`, `Conteudo` (26 linhas) fica em até 20
- [x] T068 [P] Achados 2, 7 e 8: em `SolicitacoesTab.test.tsx` (~268-282) o cenário "Nenhuma contagem repetida" compara o texto exato "17" e não pega "17 atrasadas" no cabeçalho da fila; deve falhar se o total aparecer em qualquer redação fora do indicador. Funções acima de 20 linhas em `SolicitacoesTab.tsx` (:15, 38 linhas) e `DashboardPage.tsx` (:22, 46 linhas) passam a 20 ou menos. Remover o texto de preenchimento "Indicadores e tendência" (`SolicitacoesTab.tsx:23`) e o teste dele (`SolicitacoesTab.test.tsx:142`)
- [x] T069 [P] Achado 3 (bug): `SolicitacoesPage.tsx:161-163` mostra "Nenhuma solicitação cadastrada ainda." quando a lista abre filtrada por `atrasada`, `emAberto`, `tipo`, `prioridade` ou `maquina` e vem vazia. Teste primeiro em `SolicitacoesPage.test.tsx` (um por filtro), vê-lo falhar, depois corrigir para a mensagem de filtro sem resultado
- [x] T070 [P] Achados 4, 5 e 7 nos hooks: `useDistribuicaoDoTrabalho.test.tsx` ganha o teste que a T018 exige ("voltar a uma visão já carregada não refaz as chamadas"), sem depender de `staleTime` global (se o hook não garante isso, a T018 volta a pedir a opção, e a decisão é registrada no plano); dividir os testes de várias verificações (:132, :146, :160, :213, :225) e remover o de `refetch` que testa função vazia (:110-119); `useIndicadoresDoPeriodo.test.tsx` (:70, :143, :168, :216) e `useFilaDeAtencao.test.tsx` (:127, :372-382 redundante) idem; `useFilaDeAtencao.ts:25` (25 linhas) em até 20; tipagem explícita de retorno em `useConcluidasDoIntervalo` e `useContagens`
- [x] T071 [P] Achados 5, 6 e 7 nos componentes: trocar consulta por classe CSS por papel ou texto acessível (ou remover o teste de puro estilo) em `AtualizadoEm.test.tsx` (:62, :74), `DistribuicaoDoTrabalho.test.tsx` (:220-264, com o `every` que passa com lista vazia; :283 dividir), `TendenciaDoPeriodo.test.tsx` (:99, :130, :353), `PessoalTab.test.tsx` (:465, :478) e `DashboardKpiCard.test.tsx` (:52); funções acima de 20 linhas em `FaixaDeIndicadores.tsx` (:73, :134) e `DistribuicaoDoTrabalho.tsx` (:51, :109)
- [x] T072 Achado 8: nome do teste `app/tests/e2e/dashboard.spec.ts:34` diz "para a faixa e a tendência" e só confere a faixa (conferir também a tendência, ou ajustar o nome); comentário de `validate` no `Makefile` diz "coverage 85%" e o limite real é 95%
- [x] T073 `make cover-arquivos` (uma execução, todos os arquivos de `src/` tocados em T067 a T071), depois `make validate`, depois `/bu:review`; só `/bu:deliver` com parecer APROVADO. Em 2026-10-10: cobertura por arquivo com 26 arquivos, `Statements 100%`, `Branches 99,51%`, `Functions 100%`, `Lines 100%`; `make validate` com `Test Files 192 passed`, `Tests 2949 passed`, global `99,89% / 99,71% / 100% / 99,87%`, `EXIT=0`. Pendente: o `/bu:review` seguinte (T074)
- [x] T074 `/bu:review` da terceira rodada; só `/bu:deliver` com parecer APROVADO. Resultado em 2026-10-10: **REPROVADO** (achados 1 a 6 abaixo, tarefas T075 a T081)

### Achados do `/bu:review` de 2026-10-10, terceira rodada (parecer REPROVADO)

- Origem do achado 1: um `make fmt` sem caminho reformatou 51 arquivos alheios à feature (a memória do projeto já avisava). A prova de que eram só formatação foi `prettier(HEAD) == arquivo`; foram revertidos com `git restore`.

- [x] T075 Achado 1: reverter os arquivos tocados só por formatação (13 + 21 + 17, todos conferidos contra `prettier(HEAD)`). Sobraram só arquivos com conteúdo da feature
- [x] T076 [P] Achado 2: restaurar, a partir do `HEAD`, os testes da spec 010 que a T071 removeu sem que a 013 tocasse o comportamento: o bloco de cores e fundo de `DashboardKpiCard.test.tsx` (`it.each(VARIACOES)`, moldura de link, valor, rótulo e detalhe) e `emoldurar a lista com a peça de cartão` e o aviso de lista vazia de `PessoalTab.test.tsx`; manter as adições da 013; se algum deixar de valer por mudança legítima da 013, remover só esse e dizer por quê
- [x] T077 [P] Achados 4 e 6: `SolicitacoesPage.test.tsx` (:399, :418, :484 e o `describe` "filtros vindos da URL") com Arrange, Act e Assert reais e uma verificação por teste; extrair o que a 013 acrescentou em `SolicitacoesPage.tsx` (leitura da URL) e em `SolicitacaoFilters.tsx` (etiquetas, 37 linhas) para funções ou componentes de até 20 linhas, sem refatorar o restante legado
- [x] T078 [P] Achado 5: `ControleSegmentado.test.tsx` (:37, :74, :97), `useFilaDeAtencao.test.tsx` (:138, nome não confere com o que verifica) e `useDistribuicaoDoTrabalho.test.tsx` (:125 `toMatchObject` com três propriedades; :245 expectativa dentro do Arrange)
- [x] T079 Achado 3: `FilaDeAtencao.test.tsx:129` ("título inteiro") só prova que o título foi renderizado, porque o jsdom não mede quebra de linha; renomear para o que verifica e registrar que a quebra do RF-02 é verificada por medição (T051), não por teste de unidade
- [x] T080 Achado 1 (plano): acrescentar à tabela do `plan.md` `app/src/app/providers/QueryProvider.tsx` e `queryOptions.ts` (as opções padrão das consultas passam a ser importadas pelo teste da T018, em vez de copiadas)
- [x] T081 `make cover-arquivos` com **todos** os arquivos de `src/` do diff real (`git diff` e não rastreados, sem filtro de pasta) e `make validate`. Em 2026-10-10: 26 arquivos, `Statements 100%`, `Branches 99,51%`, `Functions 100%`, `Lines 100%` (piores: `SolicitacaoFilters.tsx` 97,36% e `ModelosTab.tsx` 97,91% de ramos), `EXIT=0`; `make validate` com `Test Files 192 passed`, `Tests 3006 passed`, lint sem erro e 1 aviso preexistente, global `99,89% / 99,71% / 100% / 99,87%`, build ok, `EXIT=0`; nenhum arquivo fora do escopo alterado (conferido contra `prettier(HEAD)`)
- [x] T082 `/bu:review` da quarta rodada. Resultado em 2026-10-10: **REPROVADO** (gate verde; achados 1 a 6 abaixo, tarefas T083 a T089)

### Achados do `/bu:review` de 2026-10-10, quarta rodada (parecer REPROVADO)

Bloqueiam: 1, 2 e 3. Entram na mesma rodada: 4 e 5. Do achado 6 só o que é de teste novo; mover `KPICard` de `pages/` para `components/` e trocar `vi.spyOn` por `vi.mock` ficam como dívida registrada (o primeiro mexe em arquivo da spec 010 e o segundo é o padrão de todo o repositório).

- [x] T083 [P] Achado 1: `DashboardKpiCard.test.tsx:242` ("deve mostrar o texto da leitura quando o tom é $tom") só confere texto; nenhum teste prova o ícone e a cor de cada tom (`TONS` em `DashboardKpiCard.tsx:28-33`), então "Em dia" em vermelho ou "Ruim" com check verde passa. Teste primeiro: um teste por tom que afirma o ícone e a classe de cor daquele tom (neste arquivo as classes já são contrato, como nos testes restaurados da 010), e prova por mutação (trocar o mapa, ver falhar, restaurar). Aproveitar para dar `// Arrange` aos testes NOVOS da 013 neste arquivo (não tocar nos restaurados da 010)
- [x] T084 [P] Achados 2 e 3 em componentes: `DistribuicaoDoTrabalho.test.tsx` (12 de 23 sem `// Arrange`) e `TendenciaDoPeriodo.test.tsx` (16 de 28 sem); `TendenciaDoPeriodo.test.tsx` usa `rotuloDoPonto(PRIMEIRO)` como oráculo do `aria-label`: passar a afirmar o texto esperado literal
- [x] T085 [P] Achados 2 e 3 em páginas: `DashboardPage.test.tsx` (:374-384 o nome diz "tendência sem a mensagem de erro do painel" e afirma outra coisa; :224 duas expectativas; :275 três mocks), `PessoalTab.test.tsx` e `SolicitacoesTab.test.tsx` (só os testes novos da 013, sem `// Arrange`), `ErrorState.test.tsx:78` (repete o teste de :44)
- [x] T086 Achados 3 e 4: mover a agregação de `hooks/useDistribuicaoDoTrabalho.ts` (`partesPorStatus`, `partesPorConsulta`, ~29-62) e de `hooks/useIndicadoresDoPeriodo.ts` (`resumoDasPaginas`, ~46-55) para `lib/` (pasta medida pelo `cover`, Princípio 10), com teste de unidade espelhado e o hook só orquestrando; e `useDistribuicaoDoTrabalho.test.tsx:163` passa a afirmar `size: 1` (hoje só conta 4 chamadas)
- [x] T087 Achado 5: corrigir no `plan.md` a linha de `queryOptions.ts`: `app/providers/**` está em `coverage.exclude`; o arquivo é constante e não regra, e é medido por `make cover-arquivos`, não pelo `make cover`
- [x] T088 `make cover-arquivos` com todos os arquivos de `src/` do diff real (inclusive os `lib/` novos da T086), `make validate`, e conferir contra `prettier(HEAD)` que não voltou ruído de formatação. Em 2026-10-10: nenhum arquivo de formatação pura nem fora do escopo; 26 arquivos, `Statements 100%`, `Branches 99,51%`, `Functions 100%`, `Lines 100%`, `EXIT=0`; `make validate` com `Test Files 192 passed`, `Tests 3033 passed`, lint sem erro e 1 aviso preexistente, global `99,89% / 99,72% / 100% / 99,87%`, build ok, `EXIT=0`
- [x] T089 `/bu:review` da quinta rodada. Resultado em 2026-10-10: **REPROVADO**, gate verde (`make validate` com `EXIT=0`, 3033 testes; `cover-arquivos` em 28 arquivos, todos acima de 95%). Nenhum bug de comportamento e nenhuma violação de regra explícita do projeto; restam itens de qualidade de teste e de organização:
  1. `FilaDeAtencao.test.tsx:324` "item sem código quando a busca do modelo falha": afirma ausência de `MOD-001` com a busca rejeitada, o que vale para qualquer implementação (sempre verde); falta afirmar que item e título seguem visíveis
  2. `FilaDeAtencao.test.tsx:340` "fila sem alerta quando a busca falha": afirma a ausência do alerta antes de a rejeição chegar ao React; falta esperar a falha assentar
  3. `tasks.md:124` e `:129`: a tabela "Cenários × teste" aponta para testes de altura (RF-16) e de ordem no celular que a T060 removeu; ou se escreve o teste ou a tabela passa a dizer que só a medição cobre
  4. `TendenciaDoPeriodo.test.tsx:362` "explicar o vazio": a asserção do `textContent` é verdadeira por construção
  5. Nomes sem a condição ("deve ... quando ...") em 18 testes novos de `lib/` e hooks
  6. `DashboardKpiCard.test.tsx:266-310`: classe de cor e de ícone (contradiz a T083, que foi exigida na rodada anterior)
  7. `temFiltroAtivo` (`SolicitacoesPage.tsx`) e `semNada` (`PessoalTab.tsx`) são regra em `pages/`, fora do `make cover`
  8. `SolicitacoesPage` (156 linhas) e `SolicitacaoFilters` (112) seguem longas (legado, só se extraiu o que a 013 acrescentou)
  9. `queryOptions.ts` extraído para o teste importar (contradiz a decisão da T080, que o plano já registra)
  10. `tasks.md` T028 ainda cita "123 atrasadas" no cabeçalho da fila (removido pela decisão 8 da spec)
  Decisão do usuário (2026-10-10): corrigir os itens baratos (1, 2, 3, 4 e 10) e entregar; 5 a 9 ficam como dívida na issue #151 (junto com o `make fmt`, o código sem uso e a nova versão em produção). Feito: 1 e 2 reescritos com espera da falha e prova por mutação (alerta na falha e código fixo, cada um pego pelo teste certo e restaurado); 3 com a tabela corrigida para dizer que altura e celular dependem de medição; 4 trocado pela prova de que o aviso mora no cartão "Tendência"; 10 corrigido. `make validate` final em 2026-10-10: `Test Files 192 passed`, `Tests 3034 passed`, lint sem erro e 1 aviso preexistente, global `99,89% / 99,72% / 100% / 99,87%`, build ok, `EXIT=0`; nenhum arquivo de formatação pura nem fora do escopo
  Observação: os itens 6 e 9 e a parte de altura/celular do 3 pedem o contrário do que rodadas anteriores do mesmo review exigiram (T060, T080, T083), então uma sexta rodada tende a não convergir. Decisão de entregar com estes itens como dívida registrada fica com o usuário
