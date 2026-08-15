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
concluidas/taxa de sucesso das solicitacoes vinculadas), o historico de
eventos e a lista completa de solicitacoes vinculadas — acessivel tanto pela
listagem publica quanto pela area administrativa.

#### Scenario: Acesso ao detalhe
- **WHEN** qualquer usuario interno abre o detalhe de um modelo existente
- **THEN** todas as secoes acima sao exibidas, com as acoes de gestao
  (editar/desativar/gerenciar galeria) visiveis apenas para
  GESTOR/ADMINISTRADOR

### Requirement: Area administrativa restrita a GESTOR/ADMINISTRADOR
O sistema SHALL exibir as rotas de cadastro/edicao de modelo
(`/app/admin/modelos/novo`, `/app/admin/modelos/:id/editar`) apenas para
GESTOR/ADMINISTRADOR, bloqueando o acesso para os demais perfis.

#### Scenario: Cadastrar modelo
- **WHEN** um GESTOR/ADMINISTRADOR preenche codigo, descricao, maquina
  (selecionada do catalogo) e observacoes opcionais
- **THEN** o modelo e criado e o usuario e redirecionado ao seu detalhe

#### Scenario: Editar modelo
- **WHEN** um GESTOR/ADMINISTRADOR altera os dados de um modelo existente
- **THEN** as alteracoes sao salvas

#### Scenario: Ativar/desativar modelo
- **WHEN** um GESTOR/ADMINISTRADOR aciona ativar ou desativar no detalhe do
  modelo
- **THEN** um dialogo de confirmacao e exibido antes de aplicar a mudanca

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
