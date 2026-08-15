## ADDED Requirements

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
