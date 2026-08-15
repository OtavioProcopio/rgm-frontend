# Maquinas Catalogo Specification

## Purpose

Tela administrativa (`/app/admin/maquinas`, GESTOR/ADMINISTRADOR) para manter
o catalogo de nomes de maquinas usado como origem de verdade no cadastro de
Modelos.

## Requirements

### Requirement: Cadastrar e renomear maquina
O sistema SHALL permitir cadastrar uma nova maquina informando apenas o nome,
e renomear uma maquina existente pelo mesmo formulario (reutilizado entre
"Nova" e "Editar").

#### Scenario: Cadastro
- **WHEN** um usuario com permissao informa um nome e salva
- **THEN** a maquina e criada ativa

#### Scenario: Renomear
- **WHEN** um usuario com permissao altera o nome de uma maquina existente
- **THEN** o novo nome e salvo

### Requirement: Ativar e desativar maquina
O sistema SHALL exibir, para cada maquina da tabela, a acao "Desativar" se
estiver ativa ou "Ativar" se estiver inativa (nunca ambas ao mesmo tempo).

#### Scenario: Desativar maquina ativa
- **WHEN** o usuario aciona "Desativar" em uma maquina ativa
- **THEN** a maquina passa a inativa e nao pode mais ser usada em novos
  cadastros/edicoes de Modelo

#### Scenario: Reativar maquina inativa
- **WHEN** o usuario aciona "Ativar" em uma maquina inativa
- **THEN** a maquina volta a ficar disponivel para uso em Modelos
