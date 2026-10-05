## ADDED Requirements

### Requirement: Colunas do quadro se adaptam à largura da viewport
O sistema SHALL exibir as colunas do quadro Kanban desktop com largura
flexível dentro de um mínimo e máximo definidos, em vez de largura fixa,
de modo que as 5 colunas aproveitem a área de conteúdo disponível na tela
do usuário. A rolagem horizontal do quadro SHALL permanecer disponível
apenas como fallback, para viewports onde nem a largura mínima de cada
coluna cabe simultaneamente.

#### Scenario: Viewport de notebook comporta as 5 colunas sem rolagem
- **WHEN** a área de conteúdo disponível (descontando sidebar e paddings do
  layout) é suficiente para acomodar as 5 colunas na largura mínima
- **THEN** as colunas se expandem para preencher o espaço disponível e o
  quadro não exige rolagem horizontal para ver todas as colunas

#### Scenario: Viewport muito estreita ainda usa rolagem como fallback
- **WHEN** a área de conteúdo disponível é menor que a soma das larguras
  mínimas das 5 colunas
- **THEN** cada coluna mantém sua largura mínima e o quadro volta a exibir
  rolagem horizontal, como hoje

#### Scenario: Comportamento mobile inalterado
- **WHEN** o usuário acessa o quadro em uma viewport mobile (abaixo do
  breakpoint `lg`)
- **THEN** a visão continua sendo a de tabs + coluna única já existente,
  sem relação com a largura flexível das colunas do modo desktop
