# Plano de implementação — Paginação real nas listas

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/features/...`), conforme o
> Princípio 7. Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado
> tem em `app/src`. Não há `app/tests/bdd/` nem alvo `make bdd` (desvio herdado): cada
> cenário da spec vira um teste de módulo ou de componente, no arquivo indicado.

> **Contrato conferido no backend de `develop` em 2026-10-07:** `GET /api/solicitacoes`
> aceita `emAberto`, `tipoData` (`CRIACAO` ou `CONCLUSAO`), `dataInicio` e `dataFim`, e
> devolve em ordem crescente de criação; `GET /api/modelos` aceita `codigo`;
> `GET /api/modelos/resumo` devolve `total`, `ativos`, `inativos`, `comPendenciaAberta` e
> `porMaquina`; `GET /api/modelos/{id}/solicitacoes/resumo` devolve `total`, `emAberto`,
> `concluidas`, `canceladas`, `tempoMedioResolucaoSegundos` e `intervaloMedioSegundos`.

Prefixos: `SRC` = `app/src`, `TST` = `app/tests/unit`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Carga das colunas | uma consulta paginada acumulativa por coluna (`useInfiniteQuery`), 20 por bloco, num hook `useColunaDoQuadro(status, filtros)` | uma consulta só com tudo (hoje, 200 itens); cinco consultas comuns com página manual | a biblioteca já guarda os blocos e, ao invalidar, busca de novo todos os blocos carregados: RF-01, RF-02, RF-12 e RF-15 saem do mecanismo, sem código de junção |
| Chave das colunas | `solicitacoesKeys.coluna(filtros)`, debaixo de `lists()` | chave fora de `lists()` | toda ação e todo evento de tempo real já invalidam `lists()`; a coluna entra nisso sem mudar os 9 hooks de ação nem o hook de eventos |
| Filtros de cada coluna | função pura `filtrosDaColuna(status, { modeloId, criadaEmInicio, criadaEmFim }, inicioDosUltimos30Dias)` em `lib/` | montar dentro do hook | a regra dos 30 dias (RF-04, RF-05) precisa de teste e de medição de cobertura (Princípio 10) |
| "Últimos 30 dias" | para Concluída e Cancelada, sem período escolhido: `tipoData=CONCLUSAO` e `dataInicio` = início do dia de 30 dias atrás; com período escolhido, só o período, como nas outras colunas | filtrar no cliente | RF-04, RF-05 |
| Instante dos 30 dias | calculado uma vez ao montar o quadro e truncado para o início do dia | calcular a cada desenho | a data entra na chave da consulta; se mudasse a cada desenho, a coluna buscaria sem parar |
| Contador da coluna | `totalElements` do primeiro bloco | quantidade de cards carregados | RF-03; a faixa de abas do celular usa o mesmo total |
| "Carregar mais" | botão no fim da coluna, visível enquanto houver próximo bloco, desabilitado e com "Carregando..." durante a busca | rolagem infinita automática | fora de escopo na spec; RF-02 |
| Quadro vazio do operador | só depois de as cinco colunas responderem, com a soma dos totais igual a zero; enquanto alguma carrega, vale o estado de carregamento | decidir pela primeira coluna que responder | RF-16 |
| Erro de uma coluna | qualquer coluna com erro mostra o erro do quadro, como hoje | erro por coluna | mantém o comportamento atual; estados por coluna ficam para a #126 |
| Hook antigo do quadro | `useKanbanSolicitacoes` é removido; `useDashboardData`, que só ele usava e que nenhuma tela usa, é removido junto | manter com `size` menor | RNF-03: não pode sobrar `size` 200 em código de produção; código sem uso não fica |
| Aba pessoal | duas consultas com `emAberto=true`, 10 por página, cada lista com sua página e o componente `Pagination` existente | carregar 100 e filtrar na tela (hoje) | RF-07 |
| Indicadores da aba pessoal | "Abertas por mim" e "Sou responsável" passam a ser o `totalElements` das duas consultas em aberto; "Concluídas por mim" continua na contagem por status | manter as quatro contagens auxiliares | duas chamadas a menos; o número é o mesmo |
| Seletor de modelo | `Combobox` ganha modo de busca externa: `onSearchChange` (quem usa busca na API) e `selectedOption` (rótulo do valor escolhido, mesmo fora das opções). Sem as duas propriedades, segue filtrando as opções recebidas, como hoje | componente novo de busca | um componente só; os usos atuais não mudam (RF-08, RF-09) |
| Busca de modelo | hook `useBuscaDeModelos(termo)`: espera 300 ms com o `useDebounce` existente e consulta `GET /modelos` com `codigo`, `ativo=true`, 20 itens | buscar a cada tecla | RNF-02; RF-08 |
| Modelo já selecionado | o rótulo vem de `useModelo(id)`; a lista de opções não precisa contê-lo | incluir o selecionado na busca | RF-09; cobre também a abertura com `?modeloId=` na URL |
| Filtro de modelo da lista | troca o `select` com 100 modelos pelo mesmo `Combobox` com busca | manter o `select` | RF-08 |
| Prioridades do painel | quatro contagens (`emAberto=true`, `prioridade`, `size=1`), lendo `totalElements` | somar itens de três listas de 1000 (hoje) | RF-10 |
| Painel de modelos | `GET /modelos/resumo` num hook `useResumoDeModelos`; saem as quatro consultas atuais | — | RF-13 |
| Mini-painel da ficha | `GET /modelos/{id}/solicitacoes/resumo` num hook `useResumoDasSolicitacoesDoModelo`; o cálculo local de tempos sai | — | RF-14 |
| Tempos do mini-painel | passam a ser os da API: tempo de resolução a partir de 1 concluída e intervalo entre todas as solicitações do modelo (hoje a tela exige 2 concluídas e mede só entre elas) | manter o cálculo local | é a regra do ranking e da ficha em PDF, decidida na especificação 007 do backend; sem a lista, a tela não tem como calcular |
| Histórico da ficha do modelo | continua com os 50 mais antigos, como hoje | paginar | não é pedido; `size` 50 respeita RF-11 |
| Responsáveis | `useResponsaveisDisponiveis` continua com 100 | — | fora de escopo na spec |
| Área de toque | "Carregar mais" usa o `Button` existente, que já tem altura mínima de toque; `Pagination` e `Combobox` já foram medidos na 007 | — | RNF-04; conferido por medição na convergência |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

Considerados e recusados: **Strategy** para os filtros por coluna (são duas regras e uma
condição); **Facade** sobre as cinco consultas do quadro (o quadro precisa de cada coluna em
separado para o contador e o "Carregar mais").

## Arquivos a criar ou alterar

### Parte 1 — Quadro em blocos (RF-01 a RF-06, RF-12, RF-15, RF-16, RNF-01)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/features/solicitacoes/types/solicitacaoTypes.ts` | alterar: `emAberto`, `tipoData`, `dataInicio`, `dataFim` em `SolicitacoesFilters` | — (só tipos) |
| core/domain | `SRC/features/solicitacoes/lib/filtrosDaColuna.ts` | criar: `filtrosDaColuna`, `inicioDosUltimos30Dias`, `TAMANHO_DO_BLOCO` | `TST/features/solicitacoes/lib/filtrosDaColuna.test.ts` (criar) |
| presenters | `SRC/features/solicitacoes/hooks/solicitacoesKeys.ts` | alterar: chave `coluna()` | `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts` |
| presenters | `SRC/features/solicitacoes/hooks/useColunaDoQuadro.ts` | criar | `TST/features/solicitacoes/hooks/useColunaDoQuadro.test.ts` (criar) |
| presenters | `SRC/features/solicitacoes/hooks/useKanbanSolicitacoes.ts`, `useDashboardData.ts` | remover | retirar os testes dos dois de `solicitacoesHooks.test.ts` |
| presenters | `SRC/features/solicitacoes/components/KanbanColumn.tsx` | alterar: `total`, `temMais`, `carregandoMais`, `onCarregarMais`, `aviso` | `TST/features/solicitacoes/components/KanbanColumn.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/KanbanBoard.tsx` | alterar: cinco colunas com `useColunaDoQuadro`, totais, quadro vazio do operador pela soma | `TST/features/solicitacoes/components/KanbanBoard.test.tsx` |

### Parte 2 — Aba pessoal e painel (RF-07, RF-10)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| presenters | `SRC/features/solicitacoes/pages/PessoalTab.tsx` | alterar: listas em aberto, 10 por página, com paginação | `TST/features/solicitacoes/pages/PessoalTab.test.tsx` |
| presenters | `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx` | alterar: prioridades por contagem | `TST/features/solicitacoes/pages/DashboardPage.test.tsx` e teste novo `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` |

### Parte 3 — Seletor de modelo (RF-08, RF-09, RNF-02)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| presenters | `SRC/shared/components/Combobox/Combobox.tsx` | alterar: `onSearchChange`, `selectedOption`, `loading` | `TST/shared/components/Combobox/Combobox.test.tsx` |
| presenters | `SRC/features/admin/modelos/hooks/useBuscaDeModelos.ts` | criar | `TST/features/admin/modelos/hooks/useBuscaDeModelos.test.ts` (criar) |
| presenters | `SRC/features/solicitacoes/components/SeletorDeModelo.tsx` | criar: `Combobox` ligado à busca e ao modelo selecionado, usado pelos dois lugares | `TST/features/solicitacoes/components/SeletorDeModelo.test.tsx` (criar) |
| presenters | `SRC/features/solicitacoes/pages/NovaSolicitacaoPage.tsx` | alterar: usa `SeletorDeModelo` | `TST/features/solicitacoes/pages/NovaSolicitacaoPage.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/SolicitacaoFilters.tsx` | alterar: usa `SeletorDeModelo` | `TST/features/solicitacoes/components/SolicitacaoFilters.test.tsx` |

### Parte 4 — Resumos de modelos (RF-13, RF-14)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/features/admin/modelos/types/modeloTypes.ts` | alterar: `ResumoDeModelos`, `ResumoDasSolicitacoesDoModelo` | — (só tipos) |
| clients | `SRC/features/admin/modelos/api/modelosApi.ts` | alterar: `obterResumo`, `obterResumoDasSolicitacoes` | — (fora da medição; coberto pelos hooks) |
| presenters | `SRC/features/admin/modelos/hooks/modelosKeys.ts` | alterar: chaves `resumo()` e `resumoDasSolicitacoes(id)` | pelos testes dos hooks |
| presenters | `SRC/features/admin/modelos/hooks/useResumoDeModelos.ts`, `useResumoDasSolicitacoesDoModelo.ts` | criar | `TST/features/admin/modelos/hooks/resumosDeModelos.test.ts` (criar) |
| presenters | `SRC/features/solicitacoes/pages/ModelosTab.tsx` | alterar: usa o resumo | `TST/features/solicitacoes/pages/ModelosTab.test.tsx` |
| presenters | `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx` | alterar: mini-painel pelo resumo; sai o cálculo local | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` |

### Fechamento (RF-11, RNF-03, RNF-04, RNF-05)

| Arquivo | Ação |
|---|---|
| `TST/tamanhoDePagina.test.ts` | criar: percorre `app/src` e falha se algum `size:` literal passar de 100 ou usar `Math.max(` (RNF-03) |
| `openspec/README.md` | acrescentar as linhas desta feature (quadro, painel, modelos) |

### Rastreabilidade

| Requisito | Onde |
|---|---|
| RF-01, RF-02, RNF-01 | `useColunaDoQuadro`, `KanbanColumn`, `KanbanBoard` |
| RF-03 | `KanbanColumn` (`total`), `KanbanBoard` (abas do celular) |
| RF-04, RF-05, RF-06 | `filtrosDaColuna`, aviso na `KanbanColumn` |
| RF-07 | `PessoalTab` |
| RF-08, RF-09, RNF-02 | `Combobox`, `useBuscaDeModelos`, `SeletorDeModelo`, `NovaSolicitacaoPage`, `SolicitacaoFilters` |
| RF-10 | `SolicitacoesTab` |
| RF-11, RNF-03 | remoção de `useKanbanSolicitacoes` e `useDashboardData`; `tamanhoDePagina.test.ts` |
| RF-12, RF-15 | chave `coluna()` debaixo de `lists()`; testes de `useColunaDoQuadro` |
| RF-13 | `useResumoDeModelos`, `ModelosTab` |
| RF-14 | `useResumoDasSolicitacoesDoModelo`, `ModeloDetalhePage` |
| RF-16 | `KanbanBoard` |
| RNF-04 | medição na convergência |
| RNF-05 | `make coverage`, nos arquivos que o projeto mede |

## Contrato entre camadas

- `SolicitacoesPage` → `KanbanBoard` (filtros). O quadro calcula uma vez o início dos últimos
  30 dias e chama `useColunaDoQuadro` para cada um dos cinco status; cada chamada monta os
  filtros com `filtrosDaColuna` e devolve cards, total, se há mais e a função de carregar
  mais. O quadro repassa isso a cada `KanbanColumn`.
- Ação sobre um card e evento de tempo real invalidam `solicitacoesKeys.lists()`; as cinco
  colunas buscam de novo os blocos que já tinham.
- `NovaSolicitacaoPage` e `SolicitacaoFilters` → `SeletorDeModelo` → `useBuscaDeModelos`
  (opções) e `useModelo` (rótulo do selecionado) → `Combobox`.
- `ModelosTab` → `useResumoDeModelos`; `ModeloDetalhePage` →
  `useResumoDasSolicitacoesDoModelo`. Erro de qualquer um aparece no estado de erro que a
  tela já tem.

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| nenhuma nova | — | — | — |

## Impacto no contrato de operação

Nenhum. Sem alvo novo no `Makefile`, sem serviço novo, sem variável de ambiente nova.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Card muda de coluna entre a busca de um bloco e a do seguinte, e aparece repetido ou some até a próxima atualização | média | toda ação e todo evento refazem os blocos carregados; o quadro remove ids repetidos dentro da coluna |
| Refazer muitos blocos a cada evento de tempo real (coluna com 10 blocos = 10 chamadas) | baixa | blocos só crescem por ação do usuário; Concluída e Cancelada ficam limitadas a 30 dias. Se pesar, a #89 do backend limita o tamanho e o quadro pode reduzir os blocos refeitos |
| Publicar com backend v1.5.0: `emAberto` e `tipoData=CONCLUSAO` para canceladas são ignorados, e os dois resumos não existem | baixa | ordem de publicação da spec: backend antes, na v1.6.0; nota no PR |
| Os tempos do mini-painel mudam de valor para modelos com 1 concluída ou com solicitações não concluídas | alta, esperado | decisão registrada na spec; nota no PR e linha no `openspec/README.md` |
| Arrastar um card para uma coluna que ainda não carregou todos os blocos | baixa | a ação independe do que está carregado; depois dela a coluna de destino é refeita |
| Ordem crescente de criação deixa os cards mais novos no fim da coluna, atrás do "Carregar mais" | média | é a ordem atual da API; mudar a ordem não é pedido aqui. Registrar na convergência para a #129 (card e quadro) |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | só alvos existentes do `Makefile` da raiz; nenhum alvo novo |
| 2 Arquitetura limpa | regra de filtros em `lib/`; componente fala com hook; API só pelos arquivos `*Api.ts` |
| 3 Testes provam a entrega | todo arquivo criado ou alterado tem teste espelhado na tabela; um comportamento por teste, Arrange/Act/Assert, `deve ... quando ...` |
| 4 Simplicidade defensável | nenhum padrão; o mecanismo de blocos é o da biblioteca já usada; dois hooks sem uso são removidos |
| 5 Autoria | commits e PR sem crédito a ferramenta de IA |
| 6 Idioma | artefatos e textos de tela em português |
| 7 Mapa de pastas do legado | nada fora do layout existente; testes em `app/tests/unit` espelhados; páginas novas não importam `*Api.ts` (a `PessoalTab` e a `SolicitacoesTab`, que já importam, não ganham import novo) |
| 8 Linguagem ubíqua | `emAberto`, `tipoData`, `porMaquina`, `comPendenciaAberta` espelham a API |
| 9 Compatibilidade com a v1.5.0 | a spec declara a ordem de publicação (backend antes); sem comportamento de reserva |
| 10 Cobertura não regride | a regra nova mora em `lib/`; nenhuma exclusão acrescentada |
| 11 Padrão de teste no que for tocado | testes novos e alterados seguem o Princípio 3 |
| 12 Uma fonte de especificação | tudo em `specs/005-...`; `openspec/` só ganha linhas na tabela do README |
