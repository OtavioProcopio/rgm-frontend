# Modelos Specification

## Purpose

Consulta e gestao de Modelos. Qualquer usuario interno pode navegar e
consultar modelos (`/app/modelos`); GESTOR/ADMINISTRADOR tem, adicionalmente,
uma area de gestao completa (`/app/admin/modelos`) para cadastrar, editar,
ativar/desativar e exportar relatorios.

## Requirements

### Requirement: Listagem publica de modelos
O sistema SHALL exibir, para qualquer usuario interno autenticado, uma
listagem paginada e filtravel de modelos (codigo, maquina, descricao, ativo),
cada card mostrando a foto de capa quando existir.

#### Scenario: Listagem sem filtros
- **WHEN** um usuario interno acessa `/app/modelos`
- **THEN** o sistema exibe a primeira pagina de modelos ativos e inativos
  paginada

### Requirement: Detalhe do modelo
O sistema SHALL exibir, na pagina de detalhe de um modelo, seus dados
cadastrais, a galeria de fotos, um dashboard consolidado (total/abertas/
concluidas/taxa de sucesso/tempo medio de resolucao/intervalo medio entre
solicitacoes) das solicitacoes vinculadas, o historico de eventos e a lista
completa de solicitacoes vinculadas — acessivel tanto pela listagem publica
quanto pela area administrativa. As metricas de tempo sao calculadas no
cliente a partir das solicitacoes ja carregadas na pagina, sem chamada de API
adicional.

#### Scenario: Acesso ao detalhe
- **WHEN** qualquer usuario interno abre o detalhe de um modelo existente
- **THEN** todas as secoes acima sao exibidas, com as acoes de gestao
  (editar/desativar/gerenciar galeria) visiveis apenas para
  GESTOR/ADMINISTRADOR

#### Scenario: Modelo com 2 ou mais solicitacoes concluidas
- **WHEN** o modelo tem 2 ou mais solicitacoes concluidas entre as
  carregadas na pagina
- **THEN** o dashboard exibe o tempo medio de resolucao e o intervalo medio
  entre solicitacoes

#### Scenario: Modelo com menos de 2 solicitacoes concluidas
- **WHEN** o modelo tem menos de 2 solicitacoes concluidas entre as
  carregadas na pagina
- **THEN** os KPIs de tempo exibem um estado vazio ("—"), sem erro

### Requirement: Area administrativa restrita a GESTOR/ADMINISTRADOR
O sistema SHALL exibir as rotas de cadastro/edicao de modelo
(`/app/admin/modelos/novo`, `/app/admin/modelos/:id/editar`) apenas para
GESTOR/ADMINISTRADOR, bloqueando o acesso para os demais perfis.

#### Scenario: Cadastrar modelo
- **WHEN** um GESTOR/ADMINISTRADOR preenche codigo, descricao, maquina
  (selecionada do catalogo) e observacoes opcionais
- **THEN** o modelo e criado e o usuario passa a ver, na mesma pagina, a
  secao de galeria daquele modelo recem-criado, podendo adicionar fotos
  antes de seguir para o detalhe

#### Scenario: Editar modelo
- **WHEN** um GESTOR/ADMINISTRADOR altera os dados de um modelo existente
- **THEN** as alteracoes sao salvas

#### Scenario: Ativar/desativar modelo
- **WHEN** um GESTOR/ADMINISTRADOR aciona ativar ou desativar no detalhe do
  modelo
- **THEN** um dialogo de confirmacao e exibido antes de aplicar a mudanca

#### Scenario: Adicionar fotos logo apos o cadastro
- **WHEN** o modelo acabou de ser criado e a secao de galeria e exibida
- **THEN** o usuario pode adicionar 0..N fotos usando o mesmo fluxo de
  galeria do detalhe do modelo, sem que isso seja obrigatorio

#### Scenario: Seguir sem adicionar fotos
- **WHEN** o usuario aciona a navegacao para o detalhe do modelo sem ter
  adicionado nenhuma foto
- **THEN** o sistema permite normalmente, sem bloquear nem exigir fotos

### Requirement: Exportacao de relatorios PDF
O sistema SHALL oferecer, tanto na listagem quanto no detalhe do modelo, um
botao "Exportar PDF" que baixa o relatorio correspondente (lista filtrada ou
ficha do modelo) gerado pelo backend.

#### Scenario: Exportar lista
- **WHEN** o usuario aciona "Exportar PDF" na listagem, com filtros aplicados
- **THEN** um PDF com os mesmos filtros e baixado

#### Scenario: Exportar ficha
- **WHEN** o usuario aciona "Exportar PDF" no detalhe de um modelo
- **THEN** a ficha completa daquele modelo e baixada em PDF
