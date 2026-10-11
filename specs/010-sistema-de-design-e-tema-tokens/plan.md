# Plano de implementação — Sistema de design e tema: cores por papel, componentes base e tema que segue o sistema

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/features/...`), conforme o
> Princípio 7. Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado
> tem em `app/src`. Não há `app/tests/bdd/`: por decisão do usuário registrada na spec
> (Esclarecimentos, 2026-10-07), cada cenário vira um teste de módulo ou de componente com
> o nome do cenário.

> **Medição feita antes do plano (2026-10-07, `develop` @ `e9cbb6f`):** 1.763 usos de cor
> escrita direto (1.594 de famílias de cor e 169 de branco e preto) em 76 arquivos. Por
> área: solicitações 753 em 27 arquivos; administração de modelos 252 em 13; peças
> compartilhadas 196 em 14; administração de usuários 190 em 7; entrada e perfil 178 em 2;
> layouts 62 em 2; evidências 34 em 3; administração de máquinas 34 em 3; modelos 28 em 1;
> cartão da administração 18 em 1; rotas 18 em 3. Oito asserções de teste citam cor.

Prefixos: `SRC` = `app/src`, `TST` = `app/tests/unit`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde as cores por papel são definidas | em `SRC/styles/globals.css`: um bloco de valores para o tema claro (`:root`), um para o escuro (`.dark`) e um bloco `@theme` que expõe cada papel como cor do Tailwind | arquivo TypeScript de tokens; variáveis espalhadas por componente | o Tailwind 4 já lê cores de variáveis CSS; trocar um valor muda todos os usos sem tocar em tela (RF-01, RF-04, RNF-05) |
| Nomes dos papéis | em inglês, como as issues os nomeiam: `canvas`, `surface`, `surface-raised`, `surface-muted`, `line`, `line-strong`, `fg`, `fg-muted`, `accent`, `accent-hover`, `on-accent`, e para cada um de `danger`, `warning`, `success`, `info`: a cor cheia, `-soft` (fundo suave) e `-fg` (texto sobre o fundo suave) | nomes em português | são termos técnicos de estilo, não do domínio (Princípio 8); as issues #116 e #128 já usam `surface`, `border`, `accent`, `danger` |
| Como a tela usa um papel | pelas classes geradas a partir do papel (`bg-surface`, `text-fg-muted`, `border-line`, `bg-danger-soft`) | `style` com variável; classes utilitárias próprias | é o mecanismo do Tailwind; nenhuma classe nova é inventada |
| Fim das variantes `dark:` de cor | o valor do papel muda com o tema, então a tela escreve uma classe só | manter `dark:` com papéis | metade das 1.763 ocorrências é a versão escura da mesma cor; some junto |
| Paleta genérica | removida da configuração (`--color-*: initial` no `@theme`), ficando só os papéis, branco, preto e transparente | manter a paleta disponível | sem a paleta, uma cor genérica escrita por engano não gera estilo; soma-se à guarda de RNF-04 |
| Fim da troca de significado das cores genéricas | os blocos que redefinem `sky` e `slate` saem de `globals.css` | manter | é o item 2 do problema; os valores vão para os papéis `accent` e de superfície |
| Guarda contra regressão (RNF-04) | teste `TST/coresPorPapel.test.ts` que lê o código de produção e falha, apontando arquivo e classe, se achar cor de família genérica, `dark:` de cor ou cor em hexadecimal fora de `globals.css` | regra de ESLint própria; revisão manual | mesmo formato da guarda de tamanho de página da 005; roda no `make validate` e na CI |
| Migração por área com a guarda como teste | a guarda recebe a lista de áreas já migradas; cada tarefa de migração acrescenta a sua área, vê a guarda falhar com a lista dos arquivos e classes, migra e vê passar. Ao fim a lista é "tudo" | migrar tudo e ligar a guarda no final | dá a cada tarefa um teste que falha antes pelo motivo certo, e permite migrar áreas em paralelo sem conflito de arquivo |
| Tabela de conversão | uma tabela única "cor de hoje → papel" neste plano (seção **Conversão de cores**), seguida por todas as tarefas de migração | cada tarefa decidir | 11 áreas migradas em paralelo precisam chegar ao mesmo resultado |
| Contraste garantido na origem | função pura `contraste(corA, corB)` em `SRC/shared/lib/contraste.ts` e teste que lê os valores de `globals.css` e confere cada par texto/fundo dos dois temas contra 4,5:1 e 3:1 | só medir na tela | com as telas usando só os papéis, provar os pares de papéis prova as telas; a medição na tela fica como conferência (RNF-01, RNF-02) |
| Preferência de tema | `SRC/shared/lib/theme.ts` passa a guardar `system`, `light` ou `dark`; o tema efetivo é resolvido com a preferência do sistema quando a opção é `system` | guardar só o tema efetivo | RF-10 a RF-13 |
| Passagem única para Sistema | marca de versão no armazenamento (já existe, vai de `2` para `3`): sem a marca nova, `dark` guardado vira `system` e `light` é mantido; a marca é gravada em seguida | apagar tudo; manter | RF-14: o escuro foi imposto pela versão `2`; o claro só existe por escolha |
| Acompanhar o sistema | ouvinte da preferência do sistema, ativo só com a opção `system`, num hook `useTema` | consultar só ao carregar | RF-12 |
| Tema antes da primeira tela | trecho curto em `app/index.html`, no `<head>`, que aplica a classe do tema antes de o aplicativo carregar; um teste lê esse trecho e confere que ele decide igual a `theme.ts` nos mesmos casos | só `main.tsx` (hoje) | o fundo do corpo é pintado antes de o módulo carregar; sem o trecho há um quadro no tema errado (RF-16, RNF-09). O teste impede que as duas cópias da regra divirjam |
| Cor da barra do navegador | `applyTheme` atualiza `meta[name="theme-color"]` com o valor do papel `canvas` do tema em uso | valor fixo | RF-19 |
| Controle de tema | `ThemeToggle` vira um botão que abre um menu com três itens de escolha única (`menu` e `menuitemradio`), com setas, Enter, Esc e retorno do foco ao botão | três botões; alternância cíclica | resposta do usuário; RF-15 |
| Logo | componente `Logo` em `SRC/shared/components/Logo/`, com a placa definida por um papel próprio (`logo-plate`: transparente no claro, claro no escuro), usado pelo layout e pela tela de entrada | classe `dark:` no `<img>` | RF-17 sem variante `dark:`; um lugar só |
| Tela de entrada | o cartão passa a usar `surface` e os campos deixam de ter as cores desfeitas à mão | manter cartão branco | RF-18 |
| Selo | `SRC/shared/components/Badge/Badge.tsx` com `variant`: `neutral`, `accent`, `success`, `warning`, `danger`, `info`; os seis selos atuais passam a ser só o mapa "valor → variante e rótulo" | manter seis componentes com estilo próprio | RF-05 |
| Cartão | `SRC/shared/components/Card/Card.tsx` (superfície, borda, canto; `as` para a etiqueta) | classe utilitária | RF-06 |
| Tabela | `SRC/shared/components/Table/Table.tsx` com `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` e `TableCell`; a moldura rola na horizontal | componente de tabela por dados e colunas | as cinco tabelas têm células com conteúdo livre (menus, selos, botões de ordenar); peças de composição preservam isso (RF-07) |
| Sobreposições da galeria | `GaleriaModelo`, `GaleriaCarousel` e `ModeloFotoCapa` passam a abrir dentro do `Dialog` existente | manter as sobreposições próprias | RF-08; o `Dialog` já prende o foco, fecha com Esc e devolve o foco |
| Fundo do `Dialog` para foto | propriedade `aparencia` no `Dialog`: `painel` (padrão, como hoje) ou `imersivo` (fundo escuro em tela cheia, para foto) | segundo componente de diálogo | as fotos precisam de fundo escuro nos dois temas; o comportamento é o mesmo |
| Rótulos dos valores da API | `SRC/shared/lib/rotulos.ts` com um mapa por conjunto (status, tipo e prioridade da solicitação, perfil, tipo do modelo, tipo de evidência, tipo de atividade); os mapas espalhados passam a importar dele | manter os mapas nas features | RF-09, RNF-06 |
| Cabeçalhos das colunas | `kanbanColunas.ts` passa a dar a cada etapa um papel para o ponto de cor; cabeçalho e abas usam superfície neutra | manter fundo colorido | RF-20 |
| Tipo da solicitação | selo neutro com o ícone e o rótulo; indicadores do painel com fundo de superfície e cor só no ícone | manter | RF-22 |
| Cores de gráfico | `HistoricoChart` usa os papéis `accent`, `success`, `danger` e `fg-muted` | paleta própria de gráfico | não há requisito de paleta de dados; quatro séries cabem nos papéis |
| Verificação de RNF-07, RNF-08 e RNF-09 | roteiros de medição com API simulada (antes em `e9cbb6f`, depois na branch), em 1440 px e 390 px, nos dois temas; resultado na convergência | teste de unidade | jsdom não calcula layout nem pinta |

## Conversão de cores

Tabela única seguida por todas as tarefas de migração. À esquerda, o que a tela escreve
hoje (claro / escuro); à direita, a classe por papel. Opacidades (`/50`, `/60`) caem: o
papel já é a cor final.

| Uso | Hoje (claro / `dark:`) | Papel |
|---|---|---|
| Fundo da aplicação | `bg-slate-50` em layout / `bg-slate-900` | `bg-canvas` |
| Superfície (cartão, painel, campo) | `bg-white` / `bg-slate-800`, `bg-slate-900`, `bg-slate-950` | `bg-surface` |
| Superfície elevada (menu, diálogo, suspenso) | `bg-white` com sombra / `bg-slate-800`, `bg-slate-950` | `bg-surface-raised` |
| Superfície suave (cabeçalho de tabela, realce, botão secundário, passar o mouse) | `bg-slate-50`, `bg-slate-100`, `hover:bg-slate-100`, `hover:bg-slate-200` / `bg-slate-800`, `bg-slate-700`, `hover:bg-slate-700` | `bg-surface-muted` (e `hover:bg-surface-muted`) |
| Borda e divisória | `border-slate-100`, `border-slate-200`, `divide-slate-200` / `border-slate-700`, `divide-slate-700` | `border-line`, `divide-line` |
| Borda de campo | `border-gray-300`, `border-slate-300` / `border-slate-700` | `border-line-strong` |
| Texto principal | `text-slate-950`, `text-slate-900`, `text-slate-800`, `text-gray-950` / `text-white`, `text-slate-100` | `text-fg` |
| Texto secundário | `text-slate-700`, `text-slate-600`, `text-slate-500`, `text-slate-400` / `text-slate-200`, `text-slate-300`, `text-slate-400`, `text-slate-500` | `text-fg-muted` |
| Texto de exemplo em campo | `placeholder:text-gray-400` / `placeholder:text-slate-500` | `placeholder:text-fg-muted` |
| Destaque cheio (botão principal, item ativo) | `bg-sky-600`, `hover:bg-sky-700`, `bg-blue-600` / `bg-sky-500`, `hover:bg-sky-400` | `bg-accent`, `hover:bg-accent-hover` |
| Texto sobre destaque | `text-white` sobre azul | `text-on-accent` |
| Texto e ícone de destaque (link, valor em foco) | `text-sky-600`, `text-sky-700` / `text-sky-400`, `text-sky-300` | `text-accent` |
| Anel e borda de foco de campo | `focus:border-sky-600`, `focus:ring-sky-600/40` / `focus:border-sky-400` | `focus:border-accent`, `focus:ring-accent/40` |
| Informação: fundo suave e texto | `bg-sky-50`, `bg-sky-100` + `text-sky-700` / `bg-sky-950/30` + `text-sky-300` | `bg-info-soft`, `text-info-fg`, `border-info` |
| Sucesso | `bg-emerald-50`, `bg-emerald-100`, `bg-green-*` + `text-emerald-600/700/800` / `bg-emerald-950/30` + `text-emerald-300/400`; cheio `bg-emerald-600` | `bg-success-soft`, `text-success-fg`, `border-success`, cheio `bg-success` |
| Alerta | `bg-amber-50`, `bg-amber-100` + `text-amber-600/700/950` / `bg-amber-950/30` + `text-amber-100/300/400`; `orange-*` | `bg-warning-soft`, `text-warning-fg`, `border-warning`, cheio `bg-warning` |
| Perigo | `bg-red-50`, `bg-rose-*` + `text-red-600/700`, `text-rose-600` / `text-red-300/400`, `text-rose-400`; cheio `bg-red-600`, `hover:bg-red-700` | `bg-danger-soft`, `text-danger-fg`, `border-danger`, cheio `bg-danger`, `hover:bg-danger-hover` |
| Erro de campo | `border-red-500`, `text-red-600` / `border-red-400`, `text-red-400` | `border-danger`, `text-danger-fg` |
| Cores só decorativas (`violet`, `purple`, `indigo`, `teal`, `zinc`, degradês `from-`/`to-`) | várias | superfície neutra; se houver ícone, `text-accent` |
| Fundo de sobreposição de foto | `bg-black/80` | `bg-scrim` |
| Texto sobre foto ou sobre fundo cheio de papel | `text-white` | `text-on-accent` sobre `accent`; `text-on-solid` sobre `danger`, `success`, `warning` cheios e sobre `scrim` |

Regra para o que a tabela não cobre: escolher pelo **papel que o elemento cumpre**, nunca
pela cor mais parecida; na dúvida entre dois papéis de texto, `text-fg`. Caso sem papel
adequado não é resolvido criando papel na tarefa: a tarefa para e registra o caso no
`tasks.md` para decisão.

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

Considerados e recusados: **Strategy** para as variações do selo (é um mapa de variante
para classes); **Observer** próprio para a troca de tema (o ouvinte nativo da preferência
do sistema e o estado do hook bastam); **Abstract Factory** de tema (dois temas, valores em
CSS).

## Arquivos a criar ou alterar

### Parte 0 — Contrato de operação (decisão de processo registrada na spec)

| Arquivo | Ação |
|---|---|
| `Makefile` | alterar: alvos `fmt` (formatar, com caminho opcional), `test` passa a aceitar `CAMINHO=` e a rodar uma vez (`test-watch` guarda o modo interativo), `cover`, e `typecheck` passa a verificar de fato. Os alvos atuais (`format`, `test-run`, `coverage`, `validate`) continuam |
| `app/package.json` | alterar: script `typecheck` com o projeto certo; nenhum pacote novo |

### Parte 1 — Papéis de cor e guardas (RF-01, RF-04, RNF-01 a RNF-05)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/shared/lib/contraste.ts` | criar: `contraste`, `luminancia` | `TST/shared/lib/contraste.test.ts` (criar) |
| infra | `SRC/styles/globals.css` | alterar: papéis nos dois temas, `@theme`, remoção da paleta genérica e das redefinições de `sky` e `slate` | `TST/styles/papeisDeCor.test.ts` (criar): todo papel tem valor nos dois temas e uma definição só; pares texto/fundo cumprem 4,5:1 e 3:1 |
| — | `TST/coresPorPapel.test.ts` | criar: a guarda de cores, por área migrada | é o próprio teste |
| — | `TST/rotulosUnicos.test.ts` | criar: a guarda de rótulos (RNF-06), com as mesmas áreas e pendências da guarda de cores | é o próprio teste |

### Parte 2 — Tema (RF-10 a RF-19)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/shared/lib/theme.ts` | alterar: preferência de três opções, resolução, passagem única, `theme-color` | `TST/shared/lib/theme.test.ts` |
| presenters | `SRC/shared/hooks/useTema.ts` | criar: preferência atual, troca e ouvinte do sistema | `TST/shared/hooks/useTema.test.ts` (criar) |
| infra | `app/index.html` | alterar: trecho que aplica o tema antes do carregamento | `TST/temaInicial.test.ts` (criar): o trecho decide igual a `theme.ts` |
| presenters | `SRC/shared/components/ThemeToggle/ThemeToggle.tsx` | alterar: botão com menu de três opções | `TST/shared/components/ThemeToggle/ThemeToggle.test.tsx` |
| presenters | `SRC/shared/components/Logo/Logo.tsx` | criar | `TST/shared/components/Logo/Logo.test.tsx` (criar) |
| presenters | `SRC/app/layouts/AppLayout.tsx`, `SRC/app/layouts/PublicLayout.tsx` | alterar: `Logo`, papéis | `TST/app/layouts/*.test.tsx` |
| presenters | `SRC/features/auth/pages/LoginPage.tsx` | alterar: `Logo`, cartão e campos no tema | `TST/features/auth/pages/LoginPage.test.tsx` |

### Parte 3 — Peças base (RF-02, RF-05 a RF-09)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| presenters | `SRC/shared/components/Badge/Badge.tsx` | criar | `TST/shared/components/Badge/Badge.test.tsx` (criar) |
| presenters | `SRC/shared/components/Card/Card.tsx` | criar | `TST/shared/components/Card/Card.test.tsx` (criar) |
| presenters | `SRC/shared/components/Table/Table.tsx` | criar | `TST/shared/components/Table/Table.test.tsx` (criar) |
| core/domain | `SRC/shared/lib/rotulos.ts` | criar | `TST/shared/lib/rotulos.test.ts` (criar) |
| presenters | `SRC/shared/components/Dialog/Dialog.tsx` | alterar: `aparencia` | `TST/shared/components/Dialog/Dialog.test.tsx` |
| presenters | as 14 peças de `SRC/shared/components/` (Button, Input, Textarea, Select, Combobox, Dialog, ConfirmDialog, Pagination, PageHeader, EmptyState, ErrorState, LoadingState, ExportarPdfButton, ThemeToggle) | alterar: só papéis | teste de cada uma em `TST/shared/components/`; guarda com a área `shared/components` |

### Parte 4 — Migração das telas (RF-03, RF-20 a RF-23)

Cada linha é uma área, com arquivos que nenhuma outra linha toca; os layouts e a tela de
entrada (Parte 2) formam mais uma área, `layouts-e-entrada`. Para cada área há uma tarefa de
teste (apaga a pendência da guarda, ajusta os testes espelhados e os vê falhar) e, depois,
uma de migração. Em todas: trocar as cores
pela tabela de conversão, adotar `Badge`, `Card` e `Table` onde houver selo, moldura de
cartão ou tabela, e importar rótulos de `rotulos.ts`. O teste é a guarda com a área
acrescentada, mais os testes espelhados dos arquivos, ajustados onde citam cor.

| Área | Arquivos de produção | Particularidades |
|---|---|---|
| A — quadro e card | `SRC/features/solicitacoes/components/`: `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `kanbanColunas.ts`, `SolicitacaoCard`, `SolicitacaoStatusBadge`, `SolicitacaoPrioridadeBadge` | RF-20 (cabeçalho neutro com ponto), RF-21, RF-22 (tipo neutro; status pelo papel) |
| B — detalhe e ações | `SRC/features/solicitacoes/components/`: `SolicitacaoResumo`, `SolicitacaoTimeline`, `SolicitacaoAcoes`, `AvisoSemAtualizacao`, `HistoricoChart`, `SeletorDeModelo`, `SolicitacaoFilters`, os cinco `*Modal`; `SRC/features/solicitacoes/actions/`; `SRC/features/solicitacoes/lib/solicitacaoMessages.ts` | cores do gráfico pelos papéis; os rótulos de `solicitacaoMessages.ts` passam a vir de `rotulos.ts` |
| C — páginas de solicitações | `SRC/features/solicitacoes/pages/`: `SolicitacoesPage`, `SolicitacaoDetalhePage`, `NovaSolicitacaoPage`, `DashboardPage`, `PessoalTab` | — |
| D — painel | `SRC/features/solicitacoes/pages/`: `SolicitacoesTab`, `ModelosTab`, `DashboardKpiCard` | RF-22 (indicadores neutros, cor no ícone); duas tabelas |
| E — administração de modelos | `SRC/features/admin/modelos/` (13 arquivos) | RF-08 (três sobreposições no `Dialog`); uma tabela |
| F — administração de usuários | `SRC/features/admin/usuarios/` (7 arquivos) | uma tabela; dois selos |
| G — máquinas, cartão da administração e modelos | `SRC/features/admin/maquinas/`, `SRC/features/admin/components/`, `SRC/features/admin/pages/`, `SRC/features/modelos/` | uma tabela; um selo |
| H — perfil, evidências e rotas | `SRC/features/auth/pages/PerfilPage.tsx`, `SRC/features/evidencias/`, `SRC/app/routes/` | `PerfilPage` é o arquivo com mais cores (152) |

### Fechamento

| Arquivo | Ação |
|---|---|
| `TST/coresPorPapel.test.ts` | a lista de áreas vira "todo o código de produção" |
| `openspec/README.md` | linhas desta feature (tema, quadro, galeria) |
| roteiros em `/root/rgm/evidencias/010-frontend/` | medição de contraste, disposição, toque, foco e tema sem piscar, antes e depois |

### Rastreabilidade

| Requisito | Onde |
|---|---|
| RF-01, RF-04, RNF-05 | `globals.css`, `papeisDeCor.test.ts` |
| RF-02 | Parte 3, peças de `shared/components` |
| RF-03, RNF-03, RNF-04 | Parte 4, `coresPorPapel.test.ts` |
| RF-05 | `Badge` e os seis selos (áreas A, E, F, G) |
| RF-06 | `Card` (áreas A a H) |
| RF-07 | `Table` (áreas D, E, F, G) |
| RF-08 | `Dialog` com `aparencia`, área E |
| RF-09, RNF-06 | `rotulos.ts` e seus usos |
| RF-10 a RF-14 | `theme.ts`, `useTema` |
| RF-15 | `ThemeToggle` |
| RF-16, RNF-09 | `index.html`, `temaInicial.test.ts`, medição |
| RF-17 | `Logo` |
| RF-18 | `LoginPage` |
| RF-19 | `theme.ts` (`theme-color`) |
| RF-20, RF-21, RF-22 | áreas A e D |
| RF-23 | testes de selo e de card: todo selo tem texto |
| RNF-01, RNF-02 | `contraste.ts`, `papeisDeCor.test.ts`, medição |
| RNF-07, RNF-08, RNF-10 | medição antes e depois |
| RNF-11 | `make cover` |
| RNF-12 | `package.json` sem pacote novo |
| RNF-13 | nenhuma chamada de API alterada |

## Contrato entre camadas

- `globals.css` define os papéis; componentes e telas só usam as classes dos papéis.
- `theme.ts` (regra pura mais leitura e escrita do armazenamento e da classe do documento)
  é usado por `useTema`, por `main.tsx` na partida e, em cópia mínima conferida por teste,
  pelo trecho de `index.html`.
- `ThemeToggle` → `useTema`. Layouts e tela de entrada → `ThemeToggle` e `Logo`.
- Selos de feature → `Badge` (aparência) e `rotulos.ts` (texto). Telas → `Card`, `Table`.
- `GaleriaModelo`, `GaleriaCarousel`, `ModeloFotoCapa` → `Dialog`.

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| nenhuma nova | — | — | — |

## Impacto no contrato de operação

O `Makefile` da raiz ganha os alvos `fmt`, `cover` e `test-watch`; `test` passa a rodar uma
vez e a aceitar `CAMINHO=`; `typecheck` passa a verificar os arquivos do projeto. Os alvos
atuais continuam com o mesmo nome e efeito, e `make validate` segue sendo o que a CI roda.
Os alvos rodam na máquina; o serviço `dev` em container e os alvos `it` e `bdd` ficam para
uma feature de contrato (decisão do usuário, 2026-10-07).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Migração em paralelo converte a mesma cor para papéis diferentes em áreas diferentes | média | tabela de conversão única; regra de parar e registrar o caso sem papel; `/bu:review` confere amostra por área |
| Papel de texto secundário único deixa textos que hoje são bem claros (cinza 400) mais escuros, ou os que eram escuros (cinza 700) mais claros | alta, esperado | é o que o contraste mínimo exige; a hierarquia passa a ser de dois níveis de texto; registrar nas capturas da convergência |
| Remover a paleta genérica quebra um estilo que a guarda não enxerga (classe montada por concatenação) | baixa | a guarda procura o nome da família em qualquer texto do arquivo, não só classes completas; conferência visual nas capturas |
| Disposição muda por causa de `Card` e `Table` (preenchimento, canto) | média | as peças nascem com as medidas mais comuns de hoje e aceitam `className`; RNF-07 medido antes e depois, com limite de 2 px |
| Trecho de tema em `index.html` diverge de `theme.ts` | média | teste que executa o trecho e compara com `theme.ts` em todos os casos |
| Testes existentes que citam cor (8 asserções) ou classe trocada quebram | alta | cada tarefa ajusta os testes do arquivo que toca, no padrão do Princípio 11 |
| Feature grande num PR só (76 arquivos) | alta | commits por parte e por área; áreas independentes; a guarda permite parar entre áreas com `develop` íntegro |
| Usuário estranha a passagem para Sistema | baixa | acontece uma vez e segue a preferência que ele já tem no aparelho; nota no PR |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | a Parte 0 cria os alvos que faltavam; toda verificação da implementação passa por `make` |
| 2 Arquitetura limpa | regra pura em `shared/lib` (contraste, tema, rótulos); componente fala com hook; nenhum acesso à API novo |
| 3 Testes provam a entrega | todo arquivo criado tem teste espelhado; a migração tem a guarda como teste que falha antes; um comportamento por teste, Arrange/Act/Assert, `deve ... quando ...` |
| 4 Simplicidade defensável | nenhum padrão; papéis em CSS, três peças de composição, um mapa de rótulos |
| 5 Autoria | commits e PR sem crédito a ferramenta de IA |
| 6 Idioma | artefatos e textos de tela em português; nomes de papéis e de peças em inglês, como termos técnicos |
| 7 Mapa de pastas do legado | nada fora do layout existente; testes em `app/tests/unit` espelhados; nenhuma pasta Byte Union criada |
| 8 Linguagem ubíqua | os valores da API não mudam de nome; `rotulos.ts` só reúne os textos |
| 9 Compatibilidade com a v1.5.0 | nenhuma mudança de contrato com a API |
| 10 Cobertura não regride | regras novas em `shared/lib`, medidas; nenhuma exclusão acrescentada |
| 11 Padrão de teste no que for tocado | todo teste novo ou alterado segue o Princípio 3 |
| 12 Uma fonte de especificação | tudo em `specs/010-...`; `openspec/` só ganha linhas na tabela do README |
