# Metricas Dashboard Specification

## Purpose

Paineis de indicadores em tres pontos: o Dashboard principal
(`/app/dashboard`, com abas Solicitacoes/Modelos/Pessoal e um grafico
historico), um resumo compacto na pagina de Perfil, e o painel administrativo
(`/app/admin`) com atalhos para as areas de gestao.

## Requirements

### Requirement: Dashboard com abas e monitoramento em tempo real
O sistema SHALL exibir o Dashboard com tres abas (Solicitacoes, Modelos,
Pessoal), atualizando os dados de solicitacoes em tempo real via eventos do
servidor, sem exigir reload manual da pagina.

#### Scenario: Aba Solicitacoes
- **WHEN** a aba Solicitacoes esta ativa
- **THEN** o sistema exibe os KPIs consolidados e o grafico historico de
  solicitacoes

#### Scenario: Evento em tempo real chega
- **WHEN** uma solicitacao muda de status em outra sessao enquanto o
  dashboard esta aberto
- **THEN** os dados do quadro Kanban subjacente sao atualizados sem reload

#### Scenario: Falha ao carregar metricas
- **WHEN** a chamada de metricas ou de solicitacoes falha
- **THEN** o sistema exibe um estado de erro no lugar dos KPIs

### Requirement: Resumo de indicadores na pagina de Perfil
O sistema SHALL exibir, na pagina de Perfil, um resumo compacto (total de
modelos, total de solicitacoes, abertas/pendentes, tempo medio de resolucao)
sempre que as metricas estiverem disponiveis.

#### Scenario: Metricas disponiveis
- **WHEN** a chamada de metricas retorna com sucesso
- **THEN** o resumo aparece abaixo do formulario de alteracao de senha

### Requirement: Painel administrativo com atalhos
O sistema SHALL exibir, em `/app/admin`, cartoes de atalho para Usuarios,
Modelos e Maquinas, visivel apenas para ADMINISTRADOR.

#### Scenario: Acesso de administrador
- **WHEN** um ADMINISTRADOR acessa `/app/admin`
- **THEN** os cartoes de Usuarios, Modelos e Maquinas sao exibidos, cada um
  levando a sua respectiva area de gestao
