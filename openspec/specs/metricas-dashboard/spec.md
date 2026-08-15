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

### Requirement: Ranking de modelos por tempo na aba Modelos do Dashboard
O sistema SHALL exibir, na aba "Modelos" do Dashboard, uma tabela paginada
com o ranking de modelos por tempo medio de resolucao e intervalo medio
entre solicitacoes, permitindo alternar a ordenacao entre as duas metricas
(ascendente/descendente), e oferecer um botao para exportar o ranking em PDF
respeitando a ordenacao atual.

#### Scenario: Carregar ranking
- **WHEN** o usuario abre a aba Modelos do Dashboard
- **THEN** a tabela de ranking carrega a primeira pagina, ordenada por tempo
  medio de resolucao descendente por padrao

#### Scenario: Alternar ordenacao
- **WHEN** o usuario clica no cabecalho de "Intervalo medio entre
  solicitacoes"
- **THEN** a tabela recarrega ordenada por aquela metrica

#### Scenario: Navegar paginas
- **WHEN** o usuario avanca para a proxima pagina do ranking
- **THEN** a tabela exibe os proximos modelos, mantendo a ordenacao ativa

#### Scenario: Exportar ranking em PDF
- **WHEN** o usuario aciona "Exportar PDF" com uma ordenacao ativa
- **THEN** o PDF baixado reflete a mesma ordenacao

#### Scenario: Nenhum modelo com dados suficientes
- **WHEN** nenhum modelo do sistema tem solicitacoes concluidas
- **THEN** a tabela exibe um estado vazio, sem erro
