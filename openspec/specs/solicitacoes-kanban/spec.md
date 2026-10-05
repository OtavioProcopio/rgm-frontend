# Solicitacoes Kanban Specification

## Purpose

Interface do fluxo Kanban: um quadro com colunas por status (A Fazer, Em
Andamento, Em Validacao, Concluida, Cancelada), navegavel por arrastar e
soltar ou pelos botoes de acao na pagina de detalhe. Ambas as superficies
compartilham os mesmos modais de transicao e as mesmas regras de autorizacao
do backend, espelhadas em `shared/lib/permissions.ts`.

## Requirements

### Requirement: Quadro Kanban com drag-and-drop
O sistema SHALL exibir os cards de solicitacao agrupados por status em
colunas, permitindo mover um card entre colunas por arrastar e soltar quando
a transicao e permitida ao perfil do usuario logado.

#### Scenario: Mover card para transicao valida e autorizada
- **WHEN** o usuario arrasta um card para uma coluna cuja transicao e valida
  e autorizada ao seu perfil
- **THEN** o modal correspondente a transicao (Triagem/Envio para
  Validacao/Devolucao/Encerramento) e aberto para completar os dados
  obrigatorios

#### Scenario: Soltar em coluna sem transicao valida
- **WHEN** o usuario solta o card em uma coluna cuja transicao nao e
  permitida pela maquina de estados
- **THEN** o drop e ignorado, sem abrir modal nem chamar a API

#### Scenario: Usuario sem autorizacao tenta mover
- **WHEN** um OPERADOR nao atribuido (ou sem permissao para aquela transicao
  especifica) solta o card em outra coluna
- **THEN** o drop e bloqueado no cliente antes de qualquer chamada a API

#### Scenario: OPERADOR sem nenhuma solicitacao atribuida
- **WHEN** o quadro Kanban carrega para um OPERADOR e a listagem (ja
  escopada pelo backend as solicitacoes atribuidas a ele) retorna vazia
- **THEN** o sistema exibe uma mensagem dedicada ("Nenhuma solicitacao
  atribuida a voce") em vez do quadro de colunas vazias

#### Scenario: Filtro de periodo no quadro Kanban
- **WHEN** o usuario informa um periodo (data inicio/fim de criacao) na
  vista Kanban
- **THEN** apenas os cards criados dentro desse periodo sao exibidos nas
  colunas, e a data de abertura de cada card e exibida no proprio card

### Requirement: Atualizacoes em tempo real via SSE
O sistema SHALL manter uma conexao SSE (Server-Sent Events) autenticada
enquanto o usuario esta em telas que exibem solicitacoes (Kanban, Dashboard),
reconectando automaticamente com um token valido quando a conexao cai por
token expirado, e recriando a conexao quando o usuario logado muda.

#### Scenario: Token expira com a conexao aberta
- **WHEN** a conexao SSE cai porque o token usado para autentica-la expirou
  (resposta nao-2xx, sem retry automatico do browser)
- **THEN** o sistema renova o token e reabre a conexao automaticamente, sem
  exigir que o usuario recarregue a pagina

#### Scenario: Falha transitoria de rede
- **WHEN** a conexao cai por instabilidade de rede (nao por token expirado)
- **THEN** o sistema deixa a reconexao nativa do browser agir, sem forcar
  uma renovacao de token desnecessaria

#### Scenario: Troca de usuario logado
- **WHEN** o usuario faz logout e login com outra conta enquanto a tela
  esta aberta
- **THEN** a conexao antiga e fechada e uma nova e aberta com o token da
  nova sessao

### Requirement: Dashboard escopado por perfil
O sistema SHALL restringir, para o perfil OPERADOR, o Dashboard aos seus
proprios indicadores (aba "Pessoal") — as abas "Solicitacoes" e "Modelos"
exibem contadores agregados de todos os usuarios e nao sao mostradas nem
buscadas para esse perfil.

#### Scenario: OPERADOR abre o Dashboard
- **WHEN** um usuario com perfil OPERADOR acessa o Dashboard
- **THEN** apenas a aba "Pessoal" e exibida, e as metricas agregadas
  globais nao sao buscadas da API

#### Scenario: GESTOR/ADMINISTRADOR abre o Dashboard
- **WHEN** um usuario GESTOR ou ADMINISTRADOR acessa o Dashboard
- **THEN** as tres abas ("Solicitacoes", "Modelos", "Pessoal") ficam
  disponiveis normalmente

### Requirement: Acoes equivalentes na pagina de detalhe
O sistema SHALL oferecer, na pagina de detalhe da solicitacao, os mesmos
botoes de transicao disponiveis no quadro (Triar, Enviar para validacao,
Devolver, Encerrar/Concluir/Cancelar), visiveis apenas quando o usuario
logado tem permissao para aquela acao no status atual.

#### Scenario: Botoes visiveis conforme permissao
- **WHEN** a pagina de detalhe carrega para o usuario logado
- **THEN** apenas os botoes de transicao que ele esta autorizado a executar
  naquele status aparecem

### Requirement: Abrir solicitacao com foto opcional
O sistema SHALL permitir que qualquer usuario interno abra uma nova
solicitacao (titulo, descricao, tipo, modelo) e, opcionalmente, anexe uma
foto do problema logo em seguida — a criacao da solicitacao nunca e bloqueada
por falha no upload da foto.

Adicionalmente, o sistema SHALL oferecer a opcao de tipo CRIACAO apenas a
GESTOR/ADMINISTRADOR. Quando o tipo selecionado e CRIACAO, o formulario
SHALL substituir o campo de selecao de modelo existente por tres campos
condicionais — codigo, maquina (do catalogo) e observacoes — que descrevem
o modelo a ser criado ao final do fluxo.

#### Scenario: Abertura com foto
- **WHEN** o usuario preenche o formulario e anexa uma foto antes de enviar
- **THEN** a solicitacao e criada e, em seguida, a foto e enviada como
  evidencia do tipo ABERTURA

#### Scenario: Falha silenciosa no upload da foto
- **WHEN** a solicitacao e criada com sucesso mas o upload da foto falha
- **THEN** o usuario e levado ao detalhe da solicitacao normalmente (a falha
  e apenas logada, nao bloqueia o fluxo)

#### Scenario: OPERADOR nao ve a opcao de Criacao de modelo
- **WHEN** um OPERADOR abre o formulario de nova solicitacao
- **THEN** o seletor de tipo nao lista a opcao "Criacao de modelo"

#### Scenario: GESTOR/ADMINISTRADOR abre solicitacao de CRIACAO
- **WHEN** um GESTOR/ADMINISTRADOR seleciona o tipo "Criacao de modelo" no
  formulario
- **THEN** o campo de modelo existente e substituido por codigo, maquina e
  observacoes do modelo pretendido, e a solicitacao e criada sem `modeloId`

### Requirement: Cancelamento pelo proprio operador
O sistema SHALL exibir a opcao de cancelar apenas para o OPERADOR que abriu a
solicitacao, somente enquanto ela estiver em A_FAZER e sem nenhum responsavel
atribuido — replicando a mesma janela de oportunidade do backend.

#### Scenario: Condicoes atendidas
- **WHEN** o usuario logado e OPERADOR, abriu a solicitacao, ela esta em
  A_FAZER e nao tem responsavel
- **THEN** a acao de cancelar aparece disponivel para ele

#### Scenario: Qualquer condicao nao atendida
- **WHEN** qualquer uma das condicoes acima nao e verdadeira
- **THEN** a acao de cancelar nao aparece para aquele usuario (apenas
  GESTOR/ADMINISTRADOR mantem acesso a essa acao)

### Requirement: Comentarios e historico de atividades
O sistema SHALL exibir a timeline de atividades (mudancas de status,
comentarios, atribuicoes) da solicitacao, e permitir adicionar um novo
comentario quando o usuario tem permissao (autor, atribuido, ou
GESTOR/ADMINISTRADOR) e a solicitacao nao esta encerrada para OPERADOR.

#### Scenario: Adicionar comentario permitido
- **WHEN** um usuario com permissao envia um comentario nao vazio
- **THEN** o comentario aparece na timeline

### Requirement: Vista em lista e exportacao
O sistema SHALL oferecer, alem do quadro Kanban, uma vista em lista paginada
com filtros (status, modelo, maquina), e um botao de exportar PDF que
respeita os filtros aplicados. A vista em lista tambem SHALL poder ser
aberta diretamente ja filtrada por maquina via parametro de URL
(`?maquina=<nome>`), usado pelo link "Modelos por maquina" do Dashboard.

#### Scenario: Alternar para vista em lista
- **WHEN** o usuario alterna do quadro Kanban para a vista em lista
- **THEN** as mesmas solicitacoes sao exibidas paginadas, com filtros por
  status, modelo e maquina disponiveis

#### Scenario: Abrir lista pre-filtrada por maquina
- **WHEN** o usuario acessa `/app/solicitacoes?maquina=<nome>` (por exemplo,
  clicando numa linha da tabela "Modelos por maquina" no Dashboard)
- **THEN** a pagina abre diretamente na vista em lista, ja filtrada por
  aquela maquina

#### Scenario: Exportar PDF com filtros
- **WHEN** o usuario aciona "Exportar PDF" com filtros aplicados na lista
- **THEN** o PDF baixado reflete os mesmos filtros

### Requirement: Colunas do quadro se adaptam à largura da viewport
O sistema SHALL exibir as colunas do quadro Kanban desktop com largura
flexível dentro de um mínimo e máximo definidos, em vez de largura fixa,
de modo que as 5 colunas aproveitem a área de conteúdo disponível na tela
do usuário. A rolagem horizontal do quadro SHALL permanecer disponível
apenas como fallback, para viewports onde nem a largura mínima de cada
coluna cabe simultaneamente.

#### Scenario: Viewport de notebook comporta as 5 colunas sem rolagem
- **WHEN** a área de conteúdo disponível (descontando sidebar e paddings do
  layout) é suficiente para acomodar as 5 colunas na largura mínima
- **THEN** as colunas se expandem para preencher o espaço disponível e o
  quadro não exige rolagem horizontal para ver todas as colunas

#### Scenario: Viewport muito estreita ainda usa rolagem como fallback
- **WHEN** a área de conteúdo disponível é menor que a soma das larguras
  mínimas das 5 colunas
- **THEN** cada coluna mantém sua largura mínima e o quadro volta a exibir
  rolagem horizontal, como hoje

#### Scenario: Comportamento mobile inalterado
- **WHEN** o usuário acessa o quadro em uma viewport mobile (abaixo do
  breakpoint `lg`)
- **THEN** a visão continua sendo a de tabs + coluna única já existente,
  sem relação com a largura flexível das colunas do modo desktop

### Requirement: Card de rastreabilidade ou modelo pretendido no detalhe
O sistema SHALL exibir, na pagina de detalhe da solicitacao, um card com o
modelo vinculado (link para o detalhe do modelo) quando `modeloId` estiver
preenchido. Para uma solicitacao CRIACAO ainda sem `modeloId` (nao
concluida), o sistema SHALL exibir em seu lugar um card "Modelo pretendido"
com os dados carregados na abertura (codigo, maquina, observacoes) e um
aviso de que o modelo sera criado ao concluir.

#### Scenario: Solicitacao com modelo vinculado
- **WHEN** a solicitacao tem `modeloId` preenchido (qualquer tipo, incluindo
  CRIACAO ja concluida)
- **THEN** o card de rastreabilidade com link para o modelo e exibido

#### Scenario: CRIACAO ainda nao concluida
- **WHEN** a solicitacao e do tipo CRIACAO e ainda nao tem `modeloId`
- **THEN** o card "Modelo pretendido" e exibido com os dados informados na
  abertura, sem link (o modelo ainda nao existe)

#### Scenario: CRIACAO cancelada sem modelo
- **WHEN** uma solicitacao CRIACAO e cancelada antes de ser concluida
- **THEN** nem o card de rastreabilidade nem o card "Modelo pretendido" sao
  exibidos (a solicitacao e terminal e nao vai gerar modelo)

### Requirement: Tipo da solicitacao e somente leitura na edicao
O sistema SHALL exibir, no formulario de edicao de qualquer solicitacao
(titulo e descricao editaveis), o tipo apenas como texto informativo — sem
nenhum seletor que permita altera-lo, refletindo a imutabilidade do tipo
apos a abertura ja aplicada pelo backend.

#### Scenario: Formulario de edicao nao oferece trocar o tipo
- **WHEN** o usuario abre o formulario de edicao de qualquer solicitacao
- **THEN** nao ha nenhum seletor de tipo — apenas titulo e descricao sao
  editaveis, com o tipo exibido como texto somente leitura
