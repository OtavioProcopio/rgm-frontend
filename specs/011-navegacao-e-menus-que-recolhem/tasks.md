# Tarefas — Navegação e menus que recolhem: barra lateral recolhível, "Mais ações" e seções recolhíveis

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova: a tarefa de teste é
> escrita, rodada e vista falhar pelo motivo certo antes da tarefa de implementação.

> O repositório não tem `app/tests/bdd/`: pela decisão do usuário de 2026-10-07 (spec 010),
> cada cenário da spec é um teste no arquivo indicado, com o nome do cenário. A tabela
> **Cenários da spec × teste**, no fim, faz a correspondência.

> Os checklists de requisitos e de acessibilidade **não foram feitos** nesta feature: o
> usuário pediu para pular direto à implementação em 2026-10-08. Registrado aqui para o
> `/bu:converge` e o `/bu:review`.

> A confirmação das duas decisões do plano (principal do quadro e da lista de modelos;
> logo na barra recolhida) não veio antes das tarefas. Seguem como no plano e ficam
> abertas na convergência (R1 e R3).

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`. Toda ferramenta roda por `make`, na raiz do repositório. Cada par
"teste + implementação" de uma fase `[P]` vai para um subagente só.

## Fase 0 — Linha de base

- [ ] T001 Roteiro de medição em `/root/rgm/evidencias/011-frontend/medir011.cjs` (API simulada, fora do repositório): por tela, em 1440 px, 390 px e 360 px, nos dois temas, grava níveis de moldura (RNF-03), largura da barra lateral (RNF-05), destinos visíveis e altura da barra de abas (RNF-06), tamanho dos controles em 390 px com toque (RNF-01), botões no cabeçalho (RNF-04) e capturas. Roda em `5e1f29d` (worktree com `node_modules` por link) e guarda o resultado "antes"

## Fase 1 — Domínio

- [ ] T002 [P] Criar `TST/shared/lib/preferenciaDeInterface.test.ts`: lê o valor guardado; devolve o padrão quando a chave não existe; devolve o padrão quando o armazenamento lança; grava e lê de volta; gravar não lança quando o armazenamento lança
- [ ] T003 [P] Criar `SRC/shared/lib/preferenciaDeInterface.ts`
- [ ] T004 [P] Criar `TST/shared/lib/navegacao.test.ts`: destinos de cada perfil (administrador 5, gestor 3, operador e externo conforme hoje), na ordem de hoje, com o mesmo `to` e `end` de `AppLayout.tsx` em `5e1f29d`; nenhum perfil ganha nem perde destino (RNF-13); nenhum perfil passa de 5
- [ ] T005 [P] Criar `SRC/shared/lib/navegacao.ts`
- [ ] T006 [P] Criar `TST/shared/lib/resumoDeFiltros.test.ts`: zero filtros dá "Filtros"; um dá "Filtros · 1 ativo"; dois dão "Filtros · 2 ativos"
- [ ] T007 [P] Criar `SRC/shared/lib/resumoDeFiltros.ts`

## Fase 2 — Hooks

- [ ] T008 [P] Criar `TST/shared/hooks/usePreferenciaGuardada.test.ts`: o primeiro valor devolvido já é o guardado (sem quadro com o padrão); sem valor guardado devolve o padrão; trocar o valor grava e atualiza; armazenamento indisponível não lança
- [ ] T009 [P] Criar `SRC/shared/hooks/usePreferenciaGuardada.ts`
- [ ] T010 [P] Criar `TST/shared/hooks/useExportarPdf.test.ts`: `exportando` fica verdadeiro durante a busca e falso depois; baixa o arquivo com o nome dado; a falha vira `erro` com `mensagemDeFalhaNaExportacao`; nova tentativa limpa o erro
- [ ] T011 [P] Criar `SRC/shared/hooks/useExportarPdf.ts`

## Fase 3 — Peças compartilhadas

- [ ] T012 Criar `TST/shared/components/Menu/Menu.test.tsx`: o botão anuncia `aria-haspopup="menu"` e `aria-expanded`; abre por clique e foca o primeiro item; seta para baixo e para cima percorrem com volta ao fim; Home e End; Enter e Espaço escolhem e fecham; Esc fecha e devolve o foco ao botão; Tab fecha; clique fora fecha; `MenuLink` navega e fecha; `MenuItem` de escolha única marca `aria-checked`; item `perigo` usa cor de perigo; item desabilitado não é escolhido; alvo de toque de 44 px (`pointer-coarse:min-h-11`); sem animação com `motion-reduce`
- [ ] T013 Criar `SRC/shared/components/Menu/Menu.tsx` (com `MenuItem`, `MenuLink`, `MenuSeparator`, `MenuTitulo`)
- [ ] T014 [P] Alterar `TST/shared/components/ThemeToggle/ThemeToggle.test.tsx` só se algo que o teste afirma sobre o DOM mudar; a regra é: **todos os testes atuais passam sem alteração** com o `Menu` novo (R4)
- [ ] T015 [P] Alterar `SRC/shared/components/ThemeToggle/ThemeToggle.tsx` para usar o `Menu`
- [ ] T016 [P] Alterar `TST/shared/components/PageHeader/PageHeader.test.tsx`: sem `maisAcoes` nenhum botão "Mais ações"; com um item aparece o botão; o menu lista as ações com texto e ícone; a ação `perigo` é a última, depois de um separador; escolher chama `onSelect`; item com `to` navega; desabilitada não executa
- [ ] T017 [P] Alterar `SRC/shared/components/PageHeader/PageHeader.tsx`
- [ ] T018 [P] Criar `TST/shared/components/SecaoRecolhivel/SecaoRecolhivel.test.tsx`: aberta por padrão; o título é um botão com `aria-expanded` e `aria-controls`; clicar e Enter recolhem; fechada mostra o resumo e aberta não; o conteúdo continua montado e com `hidden` quando fechado; o estado vale numa nova montagem (`rgm.secao.<id>`); o primeiro `render` já está no estado guardado; dois ids guardam estados separados
- [ ] T019 [P] Criar `SRC/shared/components/SecaoRecolhivel/SecaoRecolhivel.tsx`
- [ ] T020 [P] Alterar `TST/shared/components/ExportarPdfButton/ExportarPdfButton.test.tsx`: todos os testes atuais passam sem alteração com o hook
- [ ] T021 [P] Alterar `SRC/shared/components/ExportarPdfButton/ExportarPdfButton.tsx` para usar `useExportarPdf`

## Fase 4 — Layout

- [ ] T022 [P] Criar `TST/app/layouts/MenuDoUsuario.test.tsx`: o botão abre um menu com nome, perfil por extenso ("Administrador"), "Meu perfil", três opções de tema com a ativa marcada e "Sair"; escolher tema aplica e fecha; "Sair" chama `logout`; Esc e foco de volta ao botão; sem usuário não quebra
- [ ] T023 [P] Criar `SRC/app/layouts/MenuDoUsuario.tsx`
- [ ] T024 [P] Criar `TST/app/layouts/BarraLateral.test.tsx`: expandida por padrão; o botão anuncia `aria-expanded` e muda o rótulo ("Recolher menu lateral" / "Expandir menu lateral"); recolher esconde o texto dos destinos mas mantém o nome acessível; a etiqueta aparece com o foco e com o ponteiro; o destino da rota atual continua marcado; Enter recolhe e o foco fica no botão; nenhum atalho fora do botão recolhe; o primeiro `render` já está no estado guardado; guarda o estado; coluna de 72 px recolhida e 280 px expandida; transição com `motion-reduce`
- [ ] T025 [P] Criar `SRC/app/layouts/BarraLateral.tsx`
- [ ] T026 [P] Criar `TST/app/layouts/BarraDeAbas.test.tsx`: mostra todos os destinos do perfil com ícone e rótulo; administrador vê 5 e operador só os dele; a largura se divide entre os destinos; fica fixa na base com a área segura; cada aba tem 44 px ou mais
- [ ] T027 [P] Criar `SRC/app/layouts/BarraDeAbas.tsx`
- [ ] T028 Alterar `TST/app/layouts/AppLayout.test.tsx`: não existe a faixa de navegação que rola; a identificação do portal aparece uma vez; o cabeçalho não mostra nome, tema e "Sair" soltos; o `main` não tem borda nem sombra; o fim do conteúdo ganha espaço da barra de abas no celular; a barra lateral recolhida muda a coluna; os testes que citam o logo, o aviso de falta de atualização e a conexão de tempo real seguem passando
- [ ] T029 Alterar `SRC/app/layouts/AppLayout.tsx` para usar `BarraLateral`, `BarraDeAbas`, `MenuDoUsuario` e `destinosDeNavegacao`, sem o cartão em volta do conteúdo
- [ ] T030 Alterar `TST/temaInicial.test.ts` (asserção: `app/index.html` declara `viewport-fit=cover`) e `app/index.html`

## Fase 5 — Telas

- [ ] T031 [P] Alterar `TST/features/admin/modelos/components/ModelosFilters.test.tsx` e `SRC/features/admin/modelos/components/ModelosFilters.tsx`: a faixa vira `SecaoRecolhivel` com id próprio; o resumo conta código, descrição, máquina e status preenchidos; fechada, os filtros preenchidos continuam valendo
- [ ] T032 [P] Alterar `TST/features/admin/usuarios/components/UsuariosFilters.test.tsx` e `SRC/features/admin/usuarios/components/UsuariosFilters.tsx`: o mesmo, com perfil e situação
- [ ] T033 [P] Alterar `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` e `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx`: principal "Editar"; "Exportar PDF" e "Desativar" (ou "Ativar") em "Mais ações", "Desativar" no fim e em perigo; "Desativar" abre a confirmação e só desativa ao confirmar; cancelar não desativa; "Ativar" confirma; falha de exportação aparece junto do cabeçalho
- [ ] T034 [P] Alterar `TST/features/admin/modelos/pages/ModelosPage.test.tsx` e `SRC/features/admin/modelos/pages/ModelosPage.tsx`: principal "Novo modelo"; "Exportar PDF" em "Mais ações"; exporta com os filtros atuais
- [ ] T035 [P] Alterar `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` e `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`: principal "Nova solicitação" (quando pode criar); "Exportar PDF" em "Mais ações"; o alternador Kanban/Lista continua fora do menu; sem permissão de criar, "Mais ações" fica sozinho
- [ ] T036 [P] Alterar `TST/features/admin/usuarios/pages/UsuariosPage.test.tsx`, `TST/features/admin/maquinas/pages/MaquinasPage.test.tsx`, `TST/features/admin/modelos/pages/EditarModeloPage.test.tsx` e `TST/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx`: acrescentam um teste cada de que o cabeçalho não mostra "Mais ações" (um comando só, ou Salvar e Cancelar)
- [ ] T037 Conferir RF-09: busca no código de produção por texto de perfil em maiúsculas (`uppercase` perto de `rotuloDoPerfil` ou de `perfil`) e ajuste em `SRC/features/auth/pages/PerfilPage.tsx` e demais achados, com teste do arquivo tocado

## Fase 6 — Integração

- [ ] T038 [P] Alterar `app/tests/e2e/auth.spec.ts`: sair passa pelo menu do usuário
- [ ] T039 [P] Alterar `app/tests/e2e/admin.spec.ts`: desativar e exportar passam por "Mais ações"
- [ ] T040 [P] Alterar `app/tests/e2e/kanban.spec.ts` e `app/tests/e2e/kanban-responsivo.spec.ts`: a navegação no celular usa a barra de abas; exportar do quadro passa por "Mais ações"
- [ ] T041 [P] Acrescentar a linha desta feature à tabela de `openspec/README.md`
- [ ] T042 Medição "depois" com `/root/rgm/evidencias/011-frontend/medir011.cjs` na branch: RNF-01, RNF-03 a RNF-08, capturas das 16 telas nos dois temas e do celular; comparar com T001; registrar na convergência
- [ ] T043 Rodar a feature contra o backend de `develop` (ambiente local): barra lateral, barra de abas, menu do usuário, "Mais ações" na ficha, filtros recolhíveis, e a suíte `make e2e`. Registrar na convergência
- [ ] T044 `make cover` com os arquivos alterados em 95% ou mais (RNF-10) e `app/package.json` sem pacote novo (RNF-11)
- [ ] T045 `make validate` verde

## Cenários da spec × teste

| Cenário da spec | Teste |
|---|---|
| Recolher a barra lateral no computador | `TST/app/layouts/BarraLateral.test.tsx` (T024) |
| Rótulo do destino com a barra recolhida | `TST/app/layouts/BarraLateral.test.tsx` (T024) |
| Recolher e expandir por teclado | `TST/app/layouts/BarraLateral.test.tsx` (T024) |
| A escolha da barra vale na visita seguinte | `TST/app/layouts/BarraLateral.test.tsx` (T024) e `TST/shared/hooks/usePreferenciaGuardada.test.ts` (T008) |
| Primeira visita | `TST/app/layouts/BarraLateral.test.tsx` (T024) |
| Barra de abas na base | `TST/app/layouts/BarraDeAbas.test.tsx` (T026) e `TST/app/layouts/AppLayout.test.tsx` (T028) |
| Barra de abas não cobre o conteúdo | `TST/app/layouts/AppLayout.test.tsx` (T028) e medição (T042) |
| Barra de abas com poucos destinos | `TST/app/layouts/BarraDeAbas.test.tsx` (T026) e `TST/shared/lib/navegacao.test.ts` (T004) |
| Menu do usuário reúne os controles soltos | `TST/app/layouts/MenuDoUsuario.test.tsx` (T022) e `TST/app/layouts/AppLayout.test.tsx` (T028) |
| Perfil por extenso | `TST/app/layouts/MenuDoUsuario.test.tsx` (T022) e T037 |
| Menu do usuário por teclado | `TST/shared/components/Menu/Menu.test.tsx` (T012) e `TST/app/layouts/MenuDoUsuario.test.tsx` (T022) |
| Cabeçalho sem texto repetido | `TST/app/layouts/AppLayout.test.tsx` (T028) |
| Conteúdo sobre o fundo | `TST/app/layouts/AppLayout.test.tsx` (T028) e medição de moldura (T042) |
| Ação principal e menu | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` (T033) |
| Sair só no menu do usuário | `TST/app/layouts/AppLayout.test.tsx` (T028) e `TST/app/layouts/MenuDoUsuario.test.tsx` (T022) |
| Filtros recolhíveis só nas listas definidas | T031, T032 e T035 |
| Uma ação só | T036 e `TST/shared/components/PageHeader/PageHeader.test.tsx` (T016) |
| Ação destrutiva no fim e confirmada | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` (T033) |
| Ação destrutiva separada das outras | `TST/shared/components/PageHeader/PageHeader.test.tsx` (T016) |
| Menu "Mais ações" por teclado | `TST/shared/components/Menu/Menu.test.tsx` (T012) e T016 |
| Leitor de tela anuncia o menu | `TST/shared/components/Menu/Menu.test.tsx` (T012) |
| Recolher uma seção | `TST/shared/components/SecaoRecolhivel/SecaoRecolhivel.test.tsx` (T018) |
| Resumo de filtros | `TST/shared/lib/resumoDeFiltros.test.ts` (T006) e T031 |
| A escolha da seção vale na visita seguinte | `TST/shared/components/SecaoRecolhivel/SecaoRecolhivel.test.tsx` (T018) |
| Filtro escondido continua valendo | T031 e T032 |
| Redução de movimento | T012, T024 |
| Alvos de toque | T012, T026 e medição (T042) |

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T024, T025, T028, T029 |
| RF-02 | T002, T003, T008, T009, T024, T025 |
| RF-03 | T024, T025, T028, T029 |
| RF-04 | T008, T009, T024, T025 |
| RF-05 | T004, T005, T026, T027, T028, T029 |
| RF-06 | T026, T027, T028, T029, T030, T042 |
| RF-07 | T028, T029 |
| RF-08 | T012, T013, T022, T023, T028, T029 |
| RF-09 | T022, T023, T037 |
| RF-10 | T028, T029 |
| RF-11 | T028, T029, T042 |
| RF-12 | T010, T011, T016, T017, T020, T021, T033, T034, T035, T036 |
| RF-13 | T016, T017, T033 |
| RF-14 | T012, T013, T014, T015, T016, T022 |
| RF-15 | T006, T007, T018, T019 |
| RF-16 | T008, T009, T018, T019 |
| RF-17 | T031, T032, T035 |
| RNF-01 | T012, T026, T042 |
| RNF-02 | T042 |
| RNF-03 | T001, T029, T042 |
| RNF-04 | T001, T016, T033, T034, T035, T042 |
| RNF-05 | T024, T025, T042 |
| RNF-06 | T026, T027, T042 |
| RNF-07 | T008, T009, T018, T019, T024, T042 |
| RNF-08 | T012, T024, T042 |
| RNF-09 | T012, T013, T042 |
| RNF-10 | T044 |
| RNF-11 | T044 |
| RNF-12 | T043, T044 |
| RNF-13 | T004, T005 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
