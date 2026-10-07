# Tarefas — Paginação real nas listas

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova; quando teste e
> implementação estão na mesma tarefa, o teste é escrito primeiro.

> O repositório não tem `app/tests/bdd/` (ver `plan.md`): cada cenário da spec é um teste no
> arquivo indicado, com o nome do cenário.

> Checklist `checklists/requisitos.md`: o usuário aceitou a adequação da spec em 2026-10-07
> e mandou implementar ("vamos implementar a 005"), sem revisão item a item.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`.

## Fase 1 — Domínio

- [x] T001 Criar `TST/features/solicitacoes/lib/filtrosDaColuna.test.ts`: bloco de 20 na página pedida; status da coluna; modelo e período de criação repassados a toda coluna; Concluída e Cancelada sem período pedem data de conclusão a partir de 30 dias atrás; com período não pedem; colunas em aberto nunca pedem; `inicioDosUltimos30Dias` devolve o início do dia de 30 dias antes
- [x] T002 Alterar `SRC/features/solicitacoes/types/solicitacaoTypes.ts` (`emAberto`, `tipoData`, `dataInicio`, `dataFim`) e criar `SRC/features/solicitacoes/lib/filtrosDaColuna.ts`

## Fase 2 — Quadro em blocos

- [x] T003 Criar `TST/features/solicitacoes/hooks/useColunaDoQuadro.test.ts`: primeira carga pede 1 bloco de 20; devolve os cards e o total da API; `temMais` verdadeiro com mais páginas e falso na última; carregar mais pede a página seguinte e soma os cards; atualizar as listas refaz os 2 blocos carregados e mantém a quantidade; card repetido entre blocos aparece uma vez
- [x] T004 Alterar `SRC/features/solicitacoes/hooks/solicitacoesKeys.ts` (chave `coluna()`) e criar `SRC/features/solicitacoes/hooks/useColunaDoQuadro.ts`
- [x] T005 Testes e alteração de `SRC/features/solicitacoes/components/KanbanColumn.tsx`: contador mostra o `total` e não a quantidade de cards; "Carregar mais" aparece com `temMais`; não aparece sem; chama `onCarregarMais` uma vez; fica desabilitado com "Carregando..." durante a busca; mostra o aviso recebido ("últimos 30 dias") e não mostra sem ele
- [x] T006 Testes em `TST/features/solicitacoes/components/KanbanBoard.test.tsx`: abre com uma consulta por coluna; contador de cada coluna e das abas do celular com o total; "últimos 30 dias" em Concluída e Cancelada sem período e ausente com período; quadro vazio do operador só quando as cinco colunas responderam e somam zero; não aparece enquanto alguma carrega; operador com 1 solicitação vê as cinco colunas; erro de uma coluna mostra o erro do quadro. Ajustar os testes existentes do arquivo ao hook novo
- [x] T007 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`
- [x] T008 Remover `SRC/features/solicitacoes/hooks/useKanbanSolicitacoes.ts` e `SRC/features/solicitacoes/hooks/useDashboardData.ts`, e os testes dos dois em `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts` (o teste de RF-09 da feature 009 passa a usar `useColunaDoQuadro`)

## Fase 3 — Aba pessoal e painel

- [x] T009 [P] Testes e alteração de `SRC/features/solicitacoes/pages/PessoalTab.tsx`: as duas listas pedem `emAberto` com 10 por página; mostram 10 itens e a paginação com o total de páginas; "Próxima" pede a página seguinte só daquela lista; "Abertas por mim" e "Sou responsável" mostram o total em aberto. Ajustar os testes existentes do arquivo
- [x] T010 [P] Criar `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` e alterar `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx`: cada prioridade vem de uma contagem em aberto com `size` 1; a barra mostra o total da API; nenhuma consulta pede mais de 5 itens

## Fase 4 — Seletor de modelo

- [x] T011 Testes e alteração de `SRC/shared/components/Combobox/Combobox.tsx`: com `onSearchChange`, digitar avisa o termo e as opções recebidas não são filtradas na tela; com `selectedOption`, o campo mostra o rótulo dele mesmo fora das opções; fechar sem escolher mantém o selecionado; `loading` mostra "Buscando..."; sem as propriedades novas o comportamento atual se mantém
- [x] T012 Criar `TST/features/admin/modelos/hooks/useBuscaDeModelos.test.ts` e `SRC/features/admin/modelos/hooks/useBuscaDeModelos.ts`: não busca antes de 300 ms da última tecla; busca por `codigo`, só ativos, 20 itens; termo vazio busca os 20 primeiros
- [x] T013 Criar `TST/features/solicitacoes/components/SeletorDeModelo.test.tsx` e `SRC/features/solicitacoes/components/SeletorDeModelo.tsx`: opções vêm da busca; o modelo selecionado aparece mesmo fora da busca atual; escolher chama `onChange` com o id; limpar chama com vazio
- [x] T014 [P] Testes e alteração de `SRC/features/solicitacoes/pages/NovaSolicitacaoPage.tsx`: usa o seletor com busca; não pede mais de 20 modelos; abre com o modelo da URL selecionado
- [x] T015 [P] Testes e alteração de `SRC/features/solicitacoes/components/SolicitacaoFilters.tsx`: filtro de modelo com busca; escolher um modelo filtra a lista e volta à primeira página; limpar remove o filtro

## Fase 5 — Resumos de modelos

- [x] T016 Alterar `SRC/features/admin/modelos/types/modeloTypes.ts`, `SRC/features/admin/modelos/api/modelosApi.ts` e `SRC/features/admin/modelos/hooks/modelosKeys.ts`; criar `SRC/features/admin/modelos/hooks/useResumoDeModelos.ts` e `SRC/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo.ts`, cada um com o teste espelhado (o segundo mudou de pasta na implementação; ver `plan.md`): cada hook chama o endpoint uma vez e devolve o resumo; o da ficha não busca sem id
- [x] T017 [P] Testes e alteração de `SRC/features/solicitacoes/pages/ModelosTab.tsx`: total, ativos, inativos, com pendência e quantidade por máquina vêm do resumo; a tela não lista modelos para contar
- [x] T018 [P] Testes e alteração de `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx`: total, abertas, concluídas, taxa de sucesso e os dois tempos vêm do resumo; tempo ausente mostra "—"; a tela só pede as 50 solicitações do histórico

## Fase 6 — Integração e fechamento

- [x] T019 Criar `TST/tamanhoDePagina.test.ts`: nenhum `size` literal acima de 100 nem calculado em `app/src` (RNF-03, RF-11)
- [x] T020 Acrescentar as linhas desta feature à tabela de `openspec/README.md`
- [x] T021 Rodar a feature contra o backend de `develop`: carga inicial do quadro com 5 listagens de 20 (RNF-01); coluna com 45 mostra 20, depois 40 (cenários da spec); encerradas de 10 e de 60 dias; busca de modelo; área de toque e foco de "Carregar mais", paginação e seletor em 390 px (RNF-04). Registrar na convergência
- [x] T022 Cobertura dos arquivos medidos em 95% ou mais (`make coverage`) e `package.json` sem dependência nova. **Medido só em `lib/filtrosDaColuna.ts` e `shared/components/Combobox/Combobox.tsx`, os dois em 100%**: hooks, componentes de feature e páginas alterados estão fora da medição por `app/vitest.config.ts` desde antes desta feature; têm teste espelhado, sem número de cobertura
- [x] T023 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001, T002, T003, T004, T006, T007 |
| RF-02 | T003, T004, T005, T007 |
| RF-03 | T005, T006, T007 |
| RF-04 | T001, T002, T005, T006, T007 |
| RF-05 | T001, T002, T006 |
| RF-06 | T001, T002 |
| RF-07 | T009 |
| RF-08 | T011, T012, T013, T014, T015 |
| RF-09 | T011, T013, T014 |
| RF-10 | T010 |
| RF-11 | T008, T019 |
| RF-12 | T003, T004 |
| RF-13 | T016, T017 |
| RF-14 | T016, T018 |
| RF-15 | T003, T004 |
| RF-16 | T006, T007 |
| RNF-01 | T006, T021 |
| RNF-02 | T012 |
| RNF-03 | T008, T019 |
| RNF-04 | T021 |
| RNF-05 | T022 |

### Cenários da spec × teste

| Cenário | Tarefa |
|---|---|
| Coluna carrega em blocos | T003, T006, T021 |
| Carregar mais | T003, T005, T021 |
| Fim da coluna | T003, T005 |
| Encerradas dos últimos 30 dias | T001, T006, T021 |
| Período escolhido vale para as encerradas | T001, T006 |
| Aba pessoal paginada | T009 |
| Buscar modelo pelo código | T012, T013, T021 |
| Modelo selecionado permanece visível | T011, T013 |
| Ação mantém o que foi carregado | T003 |
| Reconexão mantém o que foi carregado | T003 |
| Quadro vazio do operador só depois de carregar | T006 |
| Operador com solicitação em uma coluna só | T006 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-07

Caminhos relativos a `app/src/`; testes em `app/tests/unit/`, no caminho espelhado. "Medição
real" é o roteiro `/root/rgm/evidencias/integracao-2026-10-07/integra005.cjs`, com frontend
e backend de `develop` no ar e banco PostgreSQL de desenvolvimento.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `features/solicitacoes/lib/filtrosDaColuna.ts:32` (bloco de 20); `features/solicitacoes/hooks/useColunaDoQuadro.ts:41`. Medição real: coluna com 232 mostra 20 cards |
| RF-02 | realizado | `useColunaDoQuadro.ts:52` (página seguinte); `features/solicitacoes/components/KanbanColumn.tsx:144` ("Carregar mais (20 de 232)"). Medição real: 20, depois 40 |
| RF-03 | realizado | `KanbanColumn.tsx:79` e `KanbanBoard.tsx:151` (abas do celular) mostram o total da API. Medição real: contador igual ao total da API |
| RF-04 | realizado | `filtrosDaColuna.ts:18`; aviso em `KanbanBoard.tsx:133`. Medição real: concluída há 10 dias aparece, a de 60 não, e a coluna diz "Últimos 30 dias" |
| RF-05 | realizado | mesma função: com período, sem `tipoData` nem `dataInicio`. Medição real: com período de 70 a 55 dias atrás, a de 60 dias aparece e o aviso some |
| RF-06 | realizado | `filtrosDaColuna` repassa modelo e período às cinco colunas; teste por coluna |
| RF-07 | realizado | `features/solicitacoes/pages/PessoalTab.tsx:114`. Medição real: 10 de 25, "Página 1 de 3", maior tamanho pedido 10 |
| RF-08 | realizado | `shared/components/Combobox/Combobox.tsx:24`; `features/admin/modelos/hooks/useBuscaDeModelos.ts:15`; `features/solicitacoes/components/SeletorDeModelo.tsx`. Medição real: 1 busca para 10 teclas, `size=20`, 10 opções |
| RF-09 | realizado | `SeletorDeModelo.tsx:42` (rótulo vem de `useModelo`). Medição real: abrir com `?modeloId=` mostra o modelo, que não estava entre as 20 primeiras opções |
| RF-10 | realizado | `features/solicitacoes/pages/SolicitacoesTab.tsx:49`. Medição real: 4 contagens em aberto, maior tamanho pedido 5 |
| RF-11 | realizado | maior `size` em `app/src`: 100 (`useResponsaveisDisponiveis`, mantido pela spec). Medição real em 12 telas: maior tamanho pedido 50 |
| RF-12 | realizado | chave da coluna debaixo de `lists()` (`features/solicitacoes/hooks/solicitacoesKeys.ts:11`). Medição real: cancelar um card com 40 carregados mantém 40 na tela e o contador cai de 232 para 231, por evento de tempo real |
| RF-13 | realizado | `features/solicitacoes/pages/ModelosTab.tsx:27`. Medição real: total igual ao da API, 0 listagens de modelos |
| RF-14 | realizado | `features/admin/modelos/pages/ModeloDetalhePage.tsx:42`. Medição real: total e abertas iguais aos da API, só 50 solicitações pedidas (histórico) |
| RF-15 | realizado | a reconexão invalida `lists()` (feature 007) e a coluna refaz os blocos carregados; provado no teste do hook ("deve buscar de novo os dois blocos carregados..."). Não medido com queda de conexão real |
| RF-16 | realizado | `KanbanBoard.tsx:109`: soma dos totais, depois de todas as colunas responderem; testes de carregamento e de coluna única |
| RNF-01 | realizado | medição real: 5 listagens na abertura do quadro, uma por status, todas `page=0&size=20` |
| RNF-02 | realizado | `useBuscaDeModelos.ts` com espera de 300 ms; testes em 299 ms e 300 ms |
| RNF-03 | realizado | `tests/unit/tamanhoDePagina.test.ts` confere números e constantes; maior valor 100 |
| RNF-04 | realizado | medição real em 390 px com toque: "Carregar mais" 296x44, "Próxima" 96x44, "Anterior" 97x44, campo do seletor 316x44, opção 314x83; foco de "Carregar mais" com contorno sólido de 2 px. Contraste do contorno não medido |
| RNF-05 | parcial | medido só em `lib/filtrosDaColuna.ts` e `shared/components/Combobox/Combobox.tsx`, os dois em 100%. Hooks, componentes de feature e páginas alterados estão fora da medição por `app/vitest.config.ts` desde antes desta feature |

Veredito: convergido

Tarefas acrescentadas: nenhuma

- **`make validate`:** verde. Lint com 0 erros e 1 aviso em `NovaSolicitacaoPage.tsx`, linha
  que esta feature não alterou; 137 arquivos de teste, 1213 testes; cobertura do conjunto
  medido de 99,76% de linha; build ok. Tipos conferidos à parte com
  `tsc --noEmit -p tsconfig.app.json`, sem erros.
- **Medição real:** 14 de 14 verificações passaram, repetidas depois das correções da
  revisão.
- **`/bu:review`:** reprovou a primeira entrega com 12 achados, corrigidos no commit
  `d128aaf`. Três eram defeitos: a lista da aba pessoal ficava vazia e sem paginação quando
  a página aberta deixava de existir; erro ou carregamento do resumo do modelo apareciam
  como indicadores zerados; e uma falha ao buscar um bloco seguinte trocava o quadro
  inteiro pela tela de erro. Os demais eram testes que passavam com a implementação errada,
  `useColunasDoQuadro` sem teste, testes antigos tocados fora do padrão, a guarda de
  tamanho de página que não enxergava constantes, e um arquivo de estado de ferramenta
  versionado por engano (`app/.claude/.bu-state.json`, retirado e ignorado). A revisão não
  foi rodada de novo depois das correções.
- **Mudou em relação ao plano** (plano e tarefas atualizados): o hook do resumo das
  solicitações do modelo foi para `features/solicitacoes/hooks`, com chave debaixo das
  listas de solicitações, para ser atualizado pelas mesmas ações e eventos; falha em
  "Carregar mais" passou a ser tratada na coluna.
- **Excesso, fora do que os requisitos pedem:**
  - Aviso e nova tentativa na coluna quando "Carregar mais" falha.
  - Mensagens de carregamento e de erro no mini-painel da ficha do modelo.
  - A aba pessoal volta sozinha para a última página existente.
  - Remoção de `useKanbanSolicitacoes` e de `useDashboardData`, este sem uso em tela
    nenhuma.
- **Mudança de comportamento a avisar:** os dois tempos do mini-painel do modelo passam a
  ser os da API (resolução a partir de 1 concluída; intervalo entre todas as solicitações).
- **Em aberto, para decisão do usuário:**
  - Operador que só tem encerradas há mais de 30 dias vê "Você ainda não abriu nem recebeu
    solicitações" (registrado na spec).
  - A API devolve da mais antiga para a mais nova: numa coluna com mais de 20, as
    solicitações novas ficam depois do "Carregar mais". Vale para a issue do card e do
    quadro (#129) ou para um parâmetro de ordenação no backend.
- **Desvios do processo:**
  - Sem cenários em `app/tests/bdd` (desvio herdado).
  - Checklist não revisto item a item; o usuário mandou implementar.
  - Tarefas `[P]` executadas em sequência, sem subagentes.
  - Teste e implementação escritos juntos; os testes não foram vistos falhando antes do
    código.
  - Parte das edições em arquivos existentes foi feita por script no shell, sem passar pela
    trava de estrutura do plugin.
  - `vitest` e `tsc` chamados direto para rodar só os arquivos alterados durante a
    implementação; o veredito final veio de `make validate`.
- **Não verificado:** reconexão do tempo real com colunas em blocos contra o backend real;
  contraste do contorno de foco; a suíte e2e do repositório não foi rodada de novo depois
  desta feature.

### Rodada 2 — 2026-10-07

Depois da rodada 1, a suíte e2e do repositório foi rodada contra o backend de `develop`
(`app/tests/e2e`, 48 roteiros), o que a rodada 1 registrava como não verificado.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-08 | realizado | o roteiro "lista solicitações contém a criada" (`app/tests/e2e/kanban.spec.ts`) usava o `select` de modelo do filtro, que esta feature trocou pelo seletor com busca. O roteiro foi atualizado para digitar o código e escolher o modelo, e passa |

Veredito: convergido

Tarefas acrescentadas: nenhuma

- **Suíte e2e:** 47 de 48 passam. O que falha é `evidencias.spec.ts:78`, já registrado na
  issue #138 (roteiro desatualizado pela regra de visibilidade do operador), sem relação com
  esta feature.
- **`make validate`** não foi rodado de novo: a única mudança depois da rodada 1 foi no
  roteiro e2e, que o `make validate` não executa. Tipos conferidos com `tsc`; o ESLint do
  projeto ignora a pasta `tests/e2e`, então o arquivo não passou por lint.
