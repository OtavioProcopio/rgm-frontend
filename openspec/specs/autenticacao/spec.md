# Autenticacao Specification

## Purpose

Interface de login/logout, renovacao transparente de sessao e autogestao de
senha, alem do controle de acesso as rotas com base no perfil do usuario
autenticado (`shared/lib/permissions.ts`).

## Requirements

### Requirement: Tela de login
O sistema SHALL exibir um formulario de login (email + senha) e redirecionar
para a rota padrao do perfil apos autenticacao bem-sucedida.

#### Scenario: Login bem-sucedido
- **WHEN** o usuario informa credenciais validas
- **THEN** o token e persistido e o usuario e redirecionado para
  `/app/admin` (ADMINISTRADOR) ou `/app/solicitacoes` (demais perfis)

#### Scenario: Credenciais invalidas
- **WHEN** a API retorna 401
- **THEN** a tela exibe "E-mail ou senha inválidos." sem navegar

#### Scenario: Falha de rede/servidor
- **WHEN** a chamada de login falha por outro motivo
- **THEN** a tela exibe uma mensagem generica de erro, mantendo o formulario

### Requirement: Rotas protegidas por autenticacao e perfil
O sistema SHALL bloquear o acesso a qualquer rota de `/app/*` para usuarios
nao autenticados, redirecionando para `/login`. Rotas administrativas SHALL
exigir tambem que o perfil do usuario esteja na lista de perfis permitidos da
rota.

#### Scenario: Usuario nao autenticado
- **WHEN** um usuario sem sessao valida acessa qualquer rota `/app/*`
- **THEN** e redirecionado para `/login`

#### Scenario: Perfil sem permissao para a rota
- **WHEN** um usuario autenticado acessa uma rota cujo perfil nao esta na
  lista de perfis permitidos (ex.: OPERADOR em `/app/admin/usuarios`)
- **THEN** a tela exibe "Acesso negado" em vez do conteudo da rota

### Requirement: Renovacao automatica de sessao
O sistema SHALL renovar automaticamente o access token expirado usando o
refresh token, de forma transparente para o usuario, sem exigir novo login
enquanto o refresh token for valido.

#### Scenario: Access token expirado, refresh valido
- **WHEN** uma chamada de API retorna 401 por token expirado e existe um
  refresh token valido
- **THEN** o cliente HTTP renova o par de tokens e repete a chamada original
  automaticamente

#### Scenario: Refresh invalido ou expirado
- **WHEN** a renovacao falha (refresh invalido/expirado)
- **THEN** o usuario e deslogado e redirecionado para `/login`

### Requirement: Pagina de perfil
O sistema SHALL exibir os dados do usuario logado (nome, email, perfil,
status, data de criacao) e permitir alterar a propria senha informando a
senha atual e a nova senha (com confirmacao).

#### Scenario: Troca de senha bem-sucedida
- **WHEN** o usuario informa a senha atual correta e uma nova senha valida
  (confirmacao identica)
- **THEN** a tela exibe "Senha alterada com sucesso!" e limpa o formulario

#### Scenario: Senha atual incorreta
- **WHEN** a API rejeita por senha atual incorreta
- **THEN** a tela exibe "Senha atual incorreta." sem limpar o formulario

#### Scenario: Confirmacao nao confere
- **WHEN** "Nova Senha" e "Confirmar Nova Senha" sao diferentes
- **THEN** a validacao do formulario impede o envio antes de chamar a API
