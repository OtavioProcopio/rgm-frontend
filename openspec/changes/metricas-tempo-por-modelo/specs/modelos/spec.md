## MODIFIED Requirements

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
