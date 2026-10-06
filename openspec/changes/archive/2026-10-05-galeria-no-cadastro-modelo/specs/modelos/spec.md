## MODIFIED Requirements

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
