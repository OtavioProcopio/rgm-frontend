# Tarefas — Sistema de design e tema: cores por papel, componentes base e tema que segue o sistema

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova: a tarefa de teste é
> escrita, rodada e vista falhar pelo motivo certo antes da tarefa de implementação.

> O repositório não tem `app/tests/bdd/`: por decisão do usuário registrada na spec
> (Esclarecimentos, 2026-10-07), cada cenário é um teste no arquivo indicado, com o nome do
> cenário. A tabela **Cenários da spec × teste**, no fim, faz a correspondência.

> Checklists `checklists/requisitos.md` (16 itens) e `checklists/acessibilidade.md` (13
> itens) aprovados pelo usuário em 2026-10-07.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`. Toda ferramenta roda por `make`, na raiz do repositório.

**Como a guarda serve de teste para a migração.** `TST/coresPorPapel.test.ts` confere, área
por área, que nenhum arquivo de produção escreve cor fora dos papéis. Uma área só é
conferida quando o seu arquivo de pendência (`TST/coresPorPapel.pendentes/<área>.txt`)
deixa de existir. A tarefa de teste de cada área apaga a pendência e vê a guarda falhar com
a lista de arquivos e trechos; a tarefa de migração troca as cores até a guarda passar.
Cada área tem o seu arquivo de pendência, então tarefas paralelas não tocam o mesmo
arquivo.

## Fase 0 — Contrato de operação

- [ ] T001 Alterar `Makefile` e `app/package.json`: alvo `fmt` (formata, aceita `CAMINHO=`), `test` roda uma vez e aceita `CAMINHO=` (o modo interativo vai para `test-watch`), alvo `cover`, e `typecheck` passa a verificar os arquivos de `app/tsconfig.app.json`. Os alvos `format`, `test-run`, `coverage`, `check` e `validate` continuam com o mesmo efeito. Pronto quando `make test CAMINHO=tests/unit/shared/lib` roda só essa pasta, `make typecheck` falha com um erro de tipo plantado e removido em seguida, e `make validate` passa

## Fase 1 — Domínio

- [ ] T002 Criar `TST/shared/lib/contraste.test.ts`: preto sobre branco dá 21:1; branco sobre branco dá 1:1; a ordem das cores não muda o resultado; um par conhecido de 4,5:1 fica na fronteira; cor em hexadecimal de 3 e de 6 dígitos; cor inválida lança erro
- [ ] T003 Criar `SRC/shared/lib/contraste.ts`
- [ ] T004 Criar `TST/shared/lib/rotulos.test.ts`: cada valor de status, tipo e prioridade da solicitação, perfil, tipo do modelo, tipo de evidência e tipo de atividade tem rótulo; nenhum rótulo é vazio; os rótulos dos cenários "Um rótulo por valor da API" (Em validação, Criação de modelo, Alta, Gestor)
- [ ] T005 Criar `SRC/shared/lib/rotulos.ts`
- [ ] T006 Testes em `TST/shared/lib/theme.test.ts`: sem nada guardado a preferência é `system`; `system` resolve para claro ou escuro conforme o sistema; `light` e `dark` não seguem o sistema; "escuro" da versão antiga vira `system` uma vez; depois da passagem, escolher `dark` é mantido; "claro" da versão antiga é mantido; aplicar o tema põe ou tira a classe do documento; aplicar o tema atualiza a cor da barra do navegador; a preferência escolhida é guardada
- [ ] T007 Alterar `SRC/shared/lib/theme.ts`

## Fase 2 — Papéis de cor e guardas

- [ ] T008 Criar `TST/styles/papeisDeCor.test.ts`: todo papel da lista do plano tem valor no tema claro e no escuro; nenhum papel é definido mais de uma vez por tema; cada par texto/fundo (`fg`, `fg-muted` e `accent` sobre `canvas`, `surface`, `surface-raised` e `surface-muted`; `on-accent` sobre `accent`; `on-solid` sobre `danger`, `success` e `warning`; `*-fg` sobre o `*-soft` correspondente) tem no mínimo 4,5:1 nos dois temas; `line-strong` e o contorno de foco têm no mínimo 3:1 sobre as superfícies; `logo-plate` é transparente no claro
- [ ] T009 Alterar `SRC/styles/globals.css`: valores dos papéis nos dois temas e bloco `@theme` que os expõe. A paleta genérica e as redefinições de `sky` e `slate` continuam nesta tarefa, para as telas ainda não migradas (saem em T053)
- [ ] T010 Criar `TST/coresPorPapel.test.ts` e a pasta `TST/coresPorPapel.pendentes/` com um arquivo por área (`pecas-base`, `layouts-e-entrada`, `area-a` a `area-h`): a guarda acha cor de família genérica, variante `dark:` de cor e cor em hexadecimal; aponta arquivo e trecho; não confere área com pendência; todo arquivo de produção que não pertence a nenhuma das áreas é conferido desde já (hoje nenhum deles escreve cor). Pronto quando passa com todas as áreas pendentes e falha ao apagar uma pendência qualquer (reposta em seguida)

## Fase 3 — Tema e peças base

- [ ] T011 Criar `TST/shared/hooks/useTema.test.ts`: devolve a preferência guardada; trocar a preferência aplica o tema e guarda; com `system`, mudança do sistema troca o tema sem recarregar; com `light`, mudança do sistema não troca; ao desmontar deixa de ouvir o sistema
- [ ] T012 Criar `SRC/shared/hooks/useTema.ts`
- [ ] T013 Criar `TST/temaInicial.test.ts`: o trecho de `app/index.html` aplica a classe do tema escuro nos mesmos casos em que `theme.ts` resolve escuro (sem nada guardado e sistema escuro; `dark` guardado; "escuro" antigo com sistema escuro) e não aplica nos demais; o trecho vem antes de qualquer folha de estilo ou módulo
- [ ] T014 Alterar `app/index.html` e `SRC/main.tsx`
- [ ] T015 Testes em `TST/shared/components/ThemeToggle/ThemeToggle.test.tsx`: o botão abre um menu com "Sistema", "Claro" e "Escuro"; a opção ativa está marcada; escolher uma opção troca o tema e fecha o menu; setas movem entre as opções; Enter escolhe; Esc fecha e devolve o foco ao botão; clique fora fecha; o botão informa a opção ativa no nome acessível; área de toque de 44 px
- [ ] T016 Alterar `SRC/shared/components/ThemeToggle/ThemeToggle.tsx`
- [ ] T017 Criar `TST/shared/components/Logo/Logo.test.tsx`: imagem com o nome "RGM Auto Parts"; a placa usa o papel `logo-plate`; aceita tamanho
- [ ] T018 Criar `SRC/shared/components/Logo/Logo.tsx`
- [ ] T019 Criar `TST/shared/components/Badge/Badge.test.tsx`: cada uma das seis variações usa o fundo e o texto do seu papel; mostra o texto recebido; aceita ícone; sem variação informada é neutro
- [ ] T020 Criar `SRC/shared/components/Badge/Badge.tsx`
- [ ] T021 Criar `TST/shared/components/Card/Card.test.tsx`: superfície, borda e canto pelos papéis; mostra o conteúdo; aceita a etiqueta e classes extras
- [ ] T022 Criar `SRC/shared/components/Card/Card.tsx`
- [ ] T023 Criar `TST/shared/components/Table/Table.test.tsx`: é uma tabela com cabeçalho e linhas acessíveis por papel; a moldura rola na horizontal; cabeçalho com superfície suave; divisórias pelo papel de borda
- [ ] T024 Criar `SRC/shared/components/Table/Table.tsx`
- [ ] T025 Testes em `TST/shared/components/Dialog/Dialog.test.tsx`: aparência `imersivo` usa o fundo de sobreposição de foto e ocupa a tela; sem a propriedade o painel é o de hoje; foco preso, Esc e retorno do foco valem nas duas aparências
- [ ] T026 Alterar `SRC/shared/components/Dialog/Dialog.tsx`: propriedade `aparencia`
- [ ] T027 Apagar `TST/coresPorPapel.pendentes/pecas-base.txt`, ver a guarda falhar e ajustar, para o resultado esperado, os testes de `TST/shared/components/` que citam cor (Button, ConfirmDialog e os demais que a guarda apontar)
- [ ] T028 Migrar para os papéis as peças de `SRC/shared/components/`: Button, Input, Textarea, Select, Combobox, Dialog, ConfirmDialog, Pagination, PageHeader, EmptyState, ErrorState, LoadingState, ExportarPdfButton e ThemeToggle

## Fase 4 — Testes das telas

Em todas as tarefas desta fase: apagar a pendência da área, rodar a guarda e vê-la falhar
com a lista de arquivos e trechos; escrever ou ajustar, nos testes espelhados dos arquivos
da área, o que a migração precisa provar (listado em cada tarefa) e o que hoje cita cor;
ver esses testes falharem pelo motivo certo. Nenhum arquivo de `app/src` é alterado aqui.

- [ ] T029 [P] Testes da área `layouts-e-entrada` (`TST/app/layouts/`, `TST/features/auth/pages/LoginPage.test.tsx`): o logo aparece na barra lateral e na tela de entrada; o controle de tema aparece nos dois; a tela de entrada não desfaz as cores dos campos; o cartão da entrada usa a superfície do tema
- [ ] T030 [P] Testes da área `area-a`, quadro e card (`TST/features/solicitacoes/components/` de `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `SolicitacaoCard`, `SolicitacaoStatusBadge`, `SolicitacaoPrioridadeBadge`): os cinco cabeçalhos têm o mesmo fundo neutro, o nome da etapa e um ponto de cor; as abas do celular idem; selo de status na variação do papel (cinco status); selo de prioridade com texto; selo de tipo neutro com ícone e texto (quatro tipos); selo de prazo com texto; "Sem prioridade" usa o texto secundário
- [ ] T031 [P] Testes da área `area-b`, detalhe e ações (`TST/features/solicitacoes/components/` de `SolicitacaoResumo`, `SolicitacaoTimeline`, `SolicitacaoAcoes`, `AvisoSemAtualizacao`, `HistoricoChart`, `SeletorDeModelo`, `SolicitacaoFilters` e dos cinco `*Modal`; `TST/features/solicitacoes/actions/`): rótulos de status, tipo e prioridade vindos de `rotulos.ts` no resumo, no histórico e nos filtros
- [ ] T032 [P] Testes da área `area-c`, páginas de solicitações (`TST/features/solicitacoes/pages/` de `SolicitacoesPage`, `SolicitacaoDetalhePage`, `NovaSolicitacaoPage`, `DashboardPage`, `PessoalTab`): as molduras de cartão usam a peça de cartão
- [ ] T033 [P] Testes da área `area-d`, painel (`TST/features/solicitacoes/pages/` de `SolicitacoesTab`, `ModelosTab`; criar o de `DashboardKpiCard`): todos os indicadores têm o mesmo fundo neutro e cor só no ícone; as duas tabelas usam a peça de tabela
- [ ] T034 [P] Testes da área `area-e`, administração de modelos (`TST/features/admin/modelos/`): galeria completa, carrossel e foto de capa ampliada abrem como diálogo modal, com foco dentro, Tab preso, Esc fechando e foco de volta a quem abriu; a tabela usa a peça de tabela; selo de situação do modelo pelo papel
- [ ] T035 [P] Testes da área `area-f`, administração de usuários (`TST/features/admin/usuarios/`): selo de perfil e de situação pela peça de selo; rótulo de perfil vindo de `rotulos.ts` no selo, no filtro e no formulário; a tabela rola na horizontal dentro da moldura
- [ ] T036 [P] Testes da área `area-g`, máquinas, cartão da administração e modelos (`TST/features/admin/maquinas/`, `TST/features/admin/pages/`, `TST/features/modelos/`; criar `TST/features/admin/components/AdminCard.test.tsx`, que não existe): a tabela usa a peça de tabela; selo de situação da máquina pelo papel; o cartão da administração usa a peça de cartão
- [ ] T037 [P] Testes da área `area-h`, perfil, evidências e rotas (`TST/features/auth/pages/PerfilPage.test.tsx`, `TST/features/evidencias/`, `TST/app/routes/`): os avisos de sucesso e de erro da troca de senha usam os papéis de sucesso e de perigo, com texto

## Fase 5 — Migração das telas

Em todas as tarefas desta fase: trocar as cores pela tabela **Conversão de cores** do plano;
usar `Badge`, `Card` e `Table` onde houver selo, moldura de cartão ou tabela; importar
rótulos de `SRC/shared/lib/rotulos.ts`; terminar com a guarda e os testes da área verdes.
Caso sem papel adequado é registrado na seção **Casos sem papel adequado**, sem criar papel.

- [ ] T038 [P] Migrar a área `layouts-e-entrada`: `SRC/app/layouts/AppLayout.tsx`, `SRC/app/layouts/PublicLayout.tsx` e `SRC/features/auth/pages/LoginPage.tsx`, com `Logo` e o controle de tema
- [ ] T039 [P] Migrar a área `area-a`: em `SRC/features/solicitacoes/components/`, `KanbanBoard.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`, `kanbanColunas.ts`, `SolicitacaoCard.tsx`, `SolicitacaoStatusBadge.tsx`, `SolicitacaoPrioridadeBadge.tsx`
- [ ] T040 [P] Migrar a área `area-b`: em `SRC/features/solicitacoes/components/`, `SolicitacaoResumo.tsx`, `SolicitacaoTimeline.tsx`, `SolicitacaoAcoes.tsx`, `AvisoSemAtualizacao.tsx`, `HistoricoChart.tsx`, `SeletorDeModelo.tsx`, `SolicitacaoFilters.tsx`, `TriagemModal.tsx`, `DevolucaoModal.tsx`, `EncerramentoModal.tsx`, `EnviarValidacaoModal.tsx`, `AlterarResponsaveisModal.tsx`; todos os arquivos de `SRC/features/solicitacoes/actions/`; e `SRC/features/solicitacoes/lib/solicitacaoMessages.ts`, que passa a reexportar os rótulos de `rotulos.ts`
- [ ] T041 [P] Migrar a área `area-c`: em `SRC/features/solicitacoes/pages/`, `SolicitacoesPage.tsx`, `SolicitacaoDetalhePage.tsx`, `NovaSolicitacaoPage.tsx`, `DashboardPage.tsx`, `PessoalTab.tsx`
- [ ] T042 [P] Migrar a área `area-d`: em `SRC/features/solicitacoes/pages/`, `SolicitacoesTab.tsx`, `ModelosTab.tsx`, `DashboardKpiCard.tsx`
- [ ] T043 [P] Migrar a área `area-e`: todos os arquivos de `SRC/features/admin/modelos/components/` e `SRC/features/admin/modelos/pages/`, com as três sobreposições de foto dentro do `Dialog`
- [ ] T044 [P] Migrar a área `area-f`: todos os arquivos de `SRC/features/admin/usuarios/components/` e `SRC/features/admin/usuarios/pages/`
- [ ] T045 [P] Migrar a área `area-g`: `SRC/features/admin/maquinas/`, `SRC/features/admin/components/`, `SRC/features/admin/pages/` e `SRC/features/modelos/`
- [ ] T046 [P] Migrar a área `area-h`: `SRC/features/auth/pages/PerfilPage.tsx`, `SRC/features/evidencias/` e `SRC/app/routes/`

## Fase 6 — Integração e fechamento

- [ ] T047 Teste em `TST/coresPorPapel.test.ts`: sem a pasta de pendências, a guarda confere todo o código de produção; uma cor genérica plantada num texto de exemplo é apontada com o arquivo
- [ ] T048 Remover `TST/coresPorPapel.pendentes/` (deve estar vazia) e simplificar `TST/coresPorPapel.test.ts` para conferir todo o código de produção
- [ ] T049 Teste em `TST/shared/lib/rotulos.test.ts`: nenhum rótulo de valor da API é definido no código de produção fora de `SRC/shared/lib/rotulos.ts` (RNF-06)
- [ ] T050 Corrigir o que T049 apontar, nos arquivos indicados por ele
- [ ] T051 Teste em `TST/styles/papeisDeCor.test.ts`: só os papéis, branco, preto e transparente existem como cor; não há redefinição de `sky` nem de `slate`
- [ ] T052 Acrescentar as linhas desta feature à tabela de `openspec/README.md`
- [ ] T053 Alterar `SRC/styles/globals.css`: remover a paleta genérica do `@theme` e as redefinições de `sky` e `slate`
- [ ] T054 Medição com API simulada, antes (`e9cbb6f`) e depois, em `/root/rgm/evidencias/010-frontend/`: contraste de todo texto, borda de campo e contorno de foco nas 16 telas, nos dois temas (RNF-01, RNF-02); posição e tamanho dos controles em 1440 px e 390 px (RNF-07); área de toque e foco em 390 px (RNF-08); cinco carregamentos por tema sem quadro no tema errado (RNF-09); tempo de troca de tema (RNF-10); capturas das 16 telas nos dois temas. Registrar na convergência
- [ ] T055 Rodar a feature contra o backend de `develop`: entrada, quadro, detalhe, painel e administração nos dois temas, e a suíte `app/tests/e2e`. Registrar na convergência
- [ ] T056 `make cover` com os arquivos medidos em 95% ou mais (RNF-11) e `app/package.json` sem pacote novo (RNF-12)
- [ ] T057 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T008, T009 |
| RF-02 | T027, T028 |
| RF-03 | T010, T029 a T048 |
| RF-04 | T008, T009, T051, T053 |
| RF-05 | T019, T020, T030, T034, T035, T036, T039, T043, T044, T045 |
| RF-06 | T021, T022, T032, T041 e as demais migrações |
| RF-07 | T023, T024, T033, T034, T035, T036, T042 a T045 |
| RF-08 | T025, T026, T034, T043 |
| RF-09 | T004, T005, T031, T035, T040, T044, T049, T050 |
| RF-10 | T006, T007, T015, T016 |
| RF-11 | T006, T007 |
| RF-12 | T011, T012 |
| RF-13 | T006, T007, T011, T012 |
| RF-14 | T006, T007, T013, T014 |
| RF-15 | T015, T016, T029, T038 |
| RF-16 | T013, T014, T054 |
| RF-17 | T008, T017, T018, T029, T038 |
| RF-18 | T029, T038 |
| RF-19 | T006, T007 |
| RF-20 | T030, T039 |
| RF-21 | T030, T039 |
| RF-22 | T030, T033, T039, T042 |
| RF-23 | T019, T030 |
| RNF-01 | T002, T003, T008, T054 |
| RNF-02 | T008, T054 |
| RNF-03 | T047, T048 |
| RNF-04 | T010, T047, T048 |
| RNF-05 | T008, T051, T053 |
| RNF-06 | T049, T050 |
| RNF-07 | T054 |
| RNF-08 | T015, T054 |
| RNF-09 | T013, T054 |
| RNF-10 | T054 |
| RNF-11 | T056 |
| RNF-12 | T056 |
| RNF-13 | T055 |

### Cenários da spec × teste

| Cenário | Tarefa do teste |
|---|---|
| Peça base usa cor por papel | T027 |
| Trocar o valor de um papel muda todos os usos | T008, T051 |
| Selos usam a mesma peça | T019, T030, T034, T035 |
| Tabela em tela estreita | T023, T035 |
| Galeria de fotos abre como diálogo modal | T034 |
| Esc fecha a foto ampliada e devolve o foco | T025, T034 |
| Um rótulo por valor da API | T004, T035, T049 |
| Primeira visita segue o sistema | T006, T013 |
| Sistema muda com a aplicação aberta | T011 |
| Escolha explícita não segue o sistema | T006, T011 |
| Escolha vale na visita seguinte | T006 |
| Tema certo desde a primeira tela | T013, T054 |
| Controle de tema por teclado | T015 |
| Logo legível nos dois temas | T008, T017, T054 |
| Tela de entrada segue o tema | T029 |
| Barra do navegador acompanha o tema | T006 |
| Cabeçalhos das colunas são neutros | T030 |
| Prioridade e prazo são o destaque de cor do card | T030 |
| Informação não depende só de cor | T019, T030 |
| Texto legível | T008, T054 |
| "Sem prioridade" legível | T008, T030 |
| Nenhuma tela escreve cor | T047 |
| Cor nova fora do conjunto é barrada | T010, T047 |
| Quem tinha o escuro imposto passa para Sistema | T006, T013 |
| A passagem para Sistema acontece uma vez só | T006 |
| Quem escolheu o claro continua no claro | T006 |
| Menu de tema mostra as três opções | T015 |
| Menu de tema fecha com Esc | T015 |
| Logo sobre placa clara no tema escuro | T008, T017 |
| Status mantém cor pelo papel | T030 |
| Tipo da solicitação é neutro | T030 |
| Indicadores do painel são neutros | T033 |

## Casos sem papel adequado

> Registrados pelas tarefas de migração, para decisão. Vazio até a Fase 5.

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
