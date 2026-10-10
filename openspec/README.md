# openspec/ — registro histórico (congelado)

Esta pasta descreve o comportamento da interface **até a v1.5.0** e não recebe mais
alterações. O padrão de especificação do repositório é o Byte Union: funcionalidade nova
nasce em `specs/NNN-slug/` (spec, plan, checklists e tasks), conforme o Princípio 12 de
`.specify/project.md`.

- `specs/` — as 8 capacidades da interface na v1.5.0. Leia como ponto de partida; o que
  mudou depois está na tabela abaixo.
- `changes/archive/` — as 4 mudanças feitas em OpenSpec, todas entregues e sincronizadas.
  Não há mudança aberta.
- Os comandos `/opsx:*` e as skills `openspec-*` foram removidos de `.claude/`. O histórico
  segue recuperável pelo git.

## O que mudou depois da v1.5.0

Quando uma feature em `specs/` altera comportamento descrito aqui, vale a feature. A linha
entra nesta tabela na mesma entrega.

| Capacidade (`openspec/specs/`) | Feature que altera o comportamento |
|---|---|
| `solicitacoes-kanban` | `specs/001-responsaveis-disponiveis-fora-da-administracao` — o modal de triagem do quadro passa a listar responsáveis também para gestor |
| `solicitacoes-kanban` | `specs/002-acoes-da-solicitacao-reutilizaveis` — quadro e detalhe usam os mesmos formulários de ação; as ações oferecidas seguem `acoesPermitidas` da API quando ela informa; soltar um card em "Cancelada" abre o formulário de cancelamento |
| `evidencias` | `specs/003-falhas-visiveis-de-upload-e-exportacao` — evidência aceita JPEG, PNG, GIF, WebP, PDF e MP4 até 10 MB; foto que acompanha triagem, devolução ou abertura e falha gera aviso com "Tentar novamente"; a foto da conclusão é enviada antes de concluir |
| `solicitacoes-kanban`, `modelos`, `metricas-dashboard` | `specs/003-falhas-visiveis-de-upload-e-exportacao` — falha na exportação de PDF aparece junto do botão |
| `solicitacoes-kanban` | `specs/004-tempo-real-no-quadro-e-no` — o detalhe também ouve os eventos e se atualiza; comentário e anexo de outro usuário atualizam o histórico; formulário de ação aberto mostra "Atualizada por outro usuário"; o nginx repassa a rota de eventos sem buffer |
| `autenticacao` | `specs/009-sessao-mantida-na-troca-de-senha` — a troca da própria senha passa a guardar as credenciais novas devolvidas pela API e reabre a conexão de tempo real; quem troca continua na tela de perfil, sem voltar ao login |
| `solicitacoes-kanban` | `specs/009-sessao-mantida-na-troca-de-senha` — o quadro vazio do operador diz "Você ainda não abriu nem recebeu solicitações" e oferece "Nova solicitação"; com filtro sem resultado, diz "Nenhuma solicitação para este filtro" e oferece "Limpar filtro"; o card do operador mostra "Aberta por você" ou "Atribuída a você" |
| `solicitacoes-kanban` | `specs/005-paginacao-real-nas-listas` — cada coluna do quadro carrega 20 solicitações por vez, com "Carregar mais" e contador pelo total; sem período escolhido, Concluída e Cancelada mostram só os últimos 30 dias; os seletores de modelo buscam na API pelo código |
| `metricas-dashboard` | `specs/005-paginacao-real-nas-listas` — a aba pessoal lista só solicitações em aberto, 10 por página; a distribuição por prioridade e o painel de modelos usam contagens da API |
| `modelos` | `specs/005-paginacao-real-nas-listas` — o mini-painel da ficha do modelo usa o resumo da API: tempo de resolução a partir de 1 concluída e intervalo entre todas as solicitações do modelo (antes, 2 concluídas e só entre elas) |
| `autenticacao` | `specs/010-sistema-de-design-e-tema-tokens` — a tela de entrada segue o tema escolhido (cartão, campos e logo sobre placa clara no tema escuro); o controle de tema vira um menu com Sistema, Claro e Escuro, e quem tinha "escuro" guardado passa uma vez para Sistema |
| `solicitacoes-kanban` | `specs/010-sistema-de-design-e-tema-tokens` — cabeçalhos das colunas e abas do celular ficam neutros, com ponto de cor e o nome da etapa; só prioridade, prazo e status mantêm cor própria; tipo vira selo neutro com ícone e texto |
| `metricas-dashboard` | `specs/010-sistema-de-design-e-tema-tokens` — os indicadores do painel ficam neutros, com cor só no ícone; o perfil mostra o rótulo do perfil no selo, não o valor cru |
| `galeria-modelo` | `specs/010-sistema-de-design-e-tema-tokens` — galeria completa, carrossel, foto de capa ampliada e "Adicionar foto à galeria" abrem no mesmo diálogo modal das demais telas: foco preso, Esc fecha e o foco volta a quem abriu |
| `autenticacao` | `specs/011-navegacao-e-menus-que-recolhem` — nome, perfil por extenso, tema e "Sair" ficam num menu do usuário no cabeçalho; a barra lateral recolhe para ícones e lembra a escolha; no celular a navegação vira barra de abas na base |
| `solicitacoes-kanban` | `specs/011-navegacao-e-menus-que-recolhem` — "Exportar PDF" do quadro vai para o menu "Mais ações"; "Nova solicitação" é a ação principal; o conteúdo deixa de ficar dentro de um cartão com borda |
| `modelos` | `specs/011-navegacao-e-menus-que-recolhem` — na ficha do modelo, "Editar" é a ação principal e "Exportar PDF", "Ativar" e "Desativar" ficam em "Mais ações", com "Desativar" no fim e confirmado; na lista de modelos, "Novo modelo" é a principal e "Exportar PDF" vai ao menu; os filtros da lista de modelos e de usuários podem ser recolhidos |
| `modelos` | `specs/012-modelos-e-linha-do-tempo` — a ficha do modelo mostra a foto de capa grande ao lado da identificação, com miniaturas que trocam a foto e "Adicionar foto" junto delas; o conteúdo fica em duas abas, "Resumo" e "Histórico", e o histórico é uma linha do tempo única (eventos e solicitações, cada solicitação uma vez), do mais recente para o mais antigo; indicadores curtos aparecem em minutos e sem dado mostram "Sem dados ainda"; o cartão da lista de operação é um link inteiro, com a descrição como título e selo só para "Inativo" e "Pendência aberta" |
| `solicitacoes-kanban` | `specs/012-modelos-e-linha-do-tempo` — o detalhe da solicitação mostra prazo, responsáveis e quem abriu; tem uma ação principal por etapa ("Triar", "Enviar para validação", "Encerrar") e o resto em "Mais ações" (com "Editar" e "Cancelar"); o histórico é uma linha do tempo do mais recente para o mais antigo, agrupada por dia, com o campo de comentário junto dela; "Voltar" volta à tela de origem |
| `metricas-dashboard` | `specs/013-dashboard-uma-pergunta-por-bloco-sem` — a aba Solicitações abre com a fila de atenção (5 atrasadas em aberto, da mais atrasada para a menos, com "Ver todas") e segue com indicadores que têm leitura (bom, atenção ou ruim) e variação contra o período anterior, um período único para indicadores e gráfico de tendência, e uma única distribuição do trabalho aberto por status, tipo ou prioridade; nenhuma contagem aparece em mais de um bloco, cada bloco tem carregamento, vazio e erro próprios, o topo mostra a última atualização, e "Usuários" e "Modelos" saem do painel |
| `solicitacoes-kanban` | `specs/013-dashboard-uma-pergunta-por-bloco-sem` — "Ver todas" da fila de atenção e o clique na distribuição abrem a página de solicitações na visão Lista, já filtrada (atrasadas em aberto, ou status, tipo ou prioridade e em aberto), com o filtro visível e removível |
