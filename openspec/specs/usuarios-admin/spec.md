# Usuarios Admin Specification

## Purpose

Tela administrativa (`/app/admin/usuarios`, exclusiva de ADMINISTRADOR) para
cadastrar e gerenciar usuarios internos e prestadores externos, espelhando as
regras de negocio do backend.

## Requirements

### Requirement: Formulario unico com comportamento condicional por perfil
O sistema SHALL exibir um unico formulario de cadastro com um seletor de
perfil (Administrador/Gestor/Operador/Externo). Ao selecionar "Externo", os
campos de e-mail e senha SHALL ser ocultados e limpos, substituidos por um
aviso explicando que prestador externo nao acessa o sistema.

#### Scenario: Selecionar perfil Externo
- **WHEN** o usuario alterna o seletor de perfil para "Externo"
- **THEN** os campos de e-mail e senha somem do formulario e seus valores sao
  limpos

#### Scenario: Selecionar perfil interno
- **WHEN** o usuario alterna de volta para Administrador/Gestor/Operador
- **THEN** os campos de e-mail e senha reaparecem

### Requirement: Edicao de usuario respeita o perfil EXTERNO
O sistema SHALL exibir o perfil e o status como somente-leitura na tela de
edicao, e desabilitar o campo de e-mail quando o usuario editado for
EXTERNO (nao possui e-mail).

#### Scenario: Editar usuario interno
- **WHEN** um ADMINISTRADOR edita nome/e-mail de um usuario interno
- **THEN** os campos ficam editaveis normalmente

#### Scenario: Editar usuario externo
- **WHEN** o usuario sendo editado tem perfil EXTERNO
- **THEN** o campo de e-mail fica desabilitado e um aviso informa que o
  backend pode recusar a edicao por este fluxo

### Requirement: Acesso restrito a ADMINISTRADOR
O sistema SHALL exibir a rota de gestao de usuarios apenas para perfil
ADMINISTRADOR, ocultando o item de menu e bloqueando a rota para os demais
perfis.

#### Scenario: Perfil sem acesso tenta abrir a rota
- **WHEN** um usuario GESTOR, OPERADOR ou EXTERNO acessa `/app/admin/usuarios`
  diretamente pela URL
- **THEN** o sistema exibe "Acesso negado" em vez da listagem de usuarios
