## MODIFIED Requirements

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

## ADDED Requirements

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
