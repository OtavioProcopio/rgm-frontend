# Galeria Modelo Specification

## Purpose

Interface de galeria de fotos do modelo: uma previa compacta na pagina de
detalhe, com um carrocel em tela cheia para navegar e gerenciar as fotos.
Gestao (adicionar/renomear/definir capa/remover) e restrita a
GESTOR/ADMINISTRADOR; qualquer usuario interno pode visualizar.

## Requirements

### Requirement: Previa compacta na pagina de detalhe
O sistema SHALL exibir, na pagina de detalhe do modelo, ate 4 miniaturas das
fotos da galeria; se houver mais de 4, a quarta miniatura exibe um overlay
"+N" com a quantidade restante. Um botao "Ver galeria completa" abre o
carrocel em tela cheia.

#### Scenario: Modelo com ate 4 fotos
- **WHEN** o modelo tem 1 a 4 fotos
- **THEN** todas sao exibidas como miniaturas, sem overlay

#### Scenario: Modelo com mais de 4 fotos
- **WHEN** o modelo tem mais de 4 fotos
- **THEN** as 3 primeiras aparecem normalmente e a 4ª miniatura exibe "+N"
  fotos restantes

#### Scenario: Modelo sem fotos
- **WHEN** o modelo nao tem nenhuma foto na galeria
- **THEN** a secao exibe um estado vazio, sem botao de galeria completa

### Requirement: Carrocel em tela cheia com gestao embutida
O sistema SHALL abrir, ao clicar em "Ver galeria completa" ou em qualquer
miniatura, um carrocel em tela cheia navegavel entre todas as fotos. Para
GESTOR/ADMINISTRADOR, as acoes de gerenciar (renomear, definir como capa,
remover) ficam disponiveis dentro do proprio carrocel, sem sair dele.

#### Scenario: Navegar entre fotos
- **WHEN** o usuario avanca/retrocede no carrocel
- **THEN** a foto exibida muda, mantendo a mesma janela aberta

#### Scenario: Definir foto como capa
- **WHEN** um GESTOR/ADMINISTRADOR marca a foto atual do carrocel como capa
- **THEN** ela passa a ser a foto principal exibida nas listagens, e a
  anterior deixa de ser principal

#### Scenario: Remover foto
- **WHEN** um GESTOR/ADMINISTRADOR remove a foto atual
- **THEN** um dialogo de confirmacao e exibido antes de excluir

#### Scenario: Visualizador sem permissao de gestao
- **WHEN** um usuario sem permissao de gestao abre o carrocel
- **THEN** apenas a navegacao fica disponivel, sem acoes de gerenciar

### Requirement: Adicionar foto
O sistema SHALL permitir que GESTOR/ADMINISTRADOR adicione uma nova foto a
galeria a partir da pagina de detalhe, exibindo uma pre-visualizacao antes do
envio e exigindo uma identificacao para a foto.

#### Scenario: Upload bem-sucedido
- **WHEN** o usuario seleciona uma imagem valida (JPEG/PNG/WEBP, ate 10 MB) e
  informa uma identificacao
- **THEN** a foto e enviada e passa a aparecer na galeria

#### Scenario: Arquivo invalido
- **WHEN** o arquivo excede 10 MB ou nao e um formato aceito
- **THEN** o sistema exibe uma mensagem de erro sem tentar o upload
