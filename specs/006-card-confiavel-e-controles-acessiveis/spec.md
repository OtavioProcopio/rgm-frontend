# Especificação — Card confiável e controles acessíveis

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#119, #120, #125 e #124, saídas da verificação do
frontend de 2026-10-06 (leitura de código e capturas de tela com dados de exemplo). O
usuário pediu as quatro numa especificação só.

## Problema

O card do quadro informa o prazo errado e corta o próprio conteúdo, e os controles da
aplicação são difíceis de acertar com o dedo, de enxergar pelo teclado e de fechar quando
abrem em camada. São quatro partes:

### Prazo do card (OtavioProcopio/rgm-frontend#119)

O card do quadro calcula o prazo de SLA por conta própria: usa horas fixas por prioridade e
conta a partir da última atualização da solicitação. A API calcula a partir da abertura e
já informa, em toda solicitação, o prazo-limite e se ela está atrasada. O resultado:

1. Qualquer edição ou comentário reinicia o selo do card.
2. O card mostra "63%" enquanto a API e o filtro "atrasadas" dizem que a solicitação está
   atrasada.
3. Solicitações concluídas e canceladas continuam exibindo alerta de SLA, e a idade em dias
   segue crescendo em vermelho.
4. No painel, o indicador "Em atraso" conta pelo SLA da API, mas a legenda diz "abertos há
   +7 dias".

**Objetivo:** O card e o painel dizem sobre o prazo exatamente o que a API diz, em todos os status.

### Card sem cortes (OtavioProcopio/rgm-frontend#120)

1. Com as cinco colunas visíveis numa tela de 1440 px, o conteúdo do card passa da largura
   dele: a idade em dias e o botão "Ver" aparecem cortados. Conferido em captura de tela
   em 2026-10-06.
2. Abrir um card pelo "Ver" recarrega a aplicação inteira: todas as consultas são refeitas
   e a conexão de tempo real é reaberta.

**Objetivo:** Todo o conteúdo do card é legível em qualquer largura de tela suportada, e abrir um card é
uma navegação interna, sem recarga.

### Toque e foco (OtavioProcopio/rgm-frontend#125)

1. Os botões têm 36 px de altura; os do card do quadro, cerca de 24 px. O sistema é usado
   de pé, no chão de fábrica, pelo celular. As diretrizes de interface da Apple pedem área
   de toque mínima de 44 por 44 pontos, e a lei de Fitts explica o porquê: alvo pequeno e
   colado em outro alvo gera toque errado.
2. Só o botão principal mostra onde está o foco do teclado. Botões secundários, itens de
   navegação, abas do quadro e links do card não mostram nada: não dá para operar a tela
   pelo teclado sabendo onde se está.
3. A mensagem de erro de um campo não é associada ao campo: leitor de tela anuncia o campo
   sem dizer o que há de errado.

**Objetivo:** Todo controle é fácil de acertar com o dedo, mostra o foco do teclado e anuncia o próprio
erro.

### Diálogo do quadro (OtavioProcopio/rgm-frontend#124)

No quadro, as ações de uma solicitação (triar, enviar para validação, devolver, encerrar,
cancelar) abrem numa camada sobre a tela que só parece um diálogo:

1. Não é anunciada como diálogo e não tem nome.
2. O foco do teclado continua na página de trás: Tab percorre o quadro escondido.
3. Não fecha com Esc nem ao clicar fora; a única saída é o botão "Cancelar" do formulário.
4. A página de trás continua rolando.
5. Ao fechar, o foco se perde.

A terceira heurística de Nielsen (controle e liberdade do usuário) pede uma saída de
emergência clara para quem abriu algo por engano.

**Objetivo:** A camada de ação do quadro se comporta como um diálogo modal de verdade, para teclado,
leitor de tela e toque.

## Objetivo

O quadro diz a verdade sobre o prazo e é legível em qualquer tela, e todo controle é fácil
de tocar, mostra o foco do teclado e pode ser fechado sem executar nada. Nenhuma tela muda
de aparência além do necessário para isso.

## Fora de escopo

- Redesenho do card (OtavioProcopio/rgm-frontend#129).
- Mudar a regra de SLA ou os prazos por prioridade, que são do backend.
- Mostrar prazo no detalhe da solicitação (OtavioProcopio/rgm-frontend#130).
- Mudar o que o card mostra ou tornar o card inteiro clicável
  (OtavioProcopio/rgm-frontend#129).
- Redesenho de navegação, tema e cores (OtavioProcopio/rgm-frontend#127 e #128).
- Estados de carregamento, vazio e erro (OtavioProcopio/rgm-frontend#126).
- Levar o mesmo diálogo para as ações do detalhe da solicitação e para o `ConfirmDialog`
  (continua em OtavioProcopio/rgm-frontend#124; esta feature entrega o componente e o
  quadro).
- Mudar os formulários das ações.
- Animações de entrada e saída.

## Personas e cenários de uso

- **Gestor** olha o quadro para saber o que está perto de vencer e o que já venceu.
- **Operador** vê no card quanto tempo ainda tem.
- **Gestor** acompanha o quadro num monitor de 1366 a 1920 px com as cinco colunas.
- **Operador** abre e move solicitações pelo celular, com uma mão.
- **Gestor** percorre formulários com Tab no computador.
- **Usuário de leitor de tela** preenche um formulário com erro.
- **Gestor** arrasta um card para outra coluna por engano e quer desistir.
- **Usuário de teclado** tria uma solicitação sem usar o mouse.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O selo de prazo do card deve usar só o prazo-limite e a indicação de atraso informados pela API | obrigatório |
| RF-02 | Solicitação em aberto e atrasada deve mostrar "Atrasada há" seguido do tempo decorrido desde o prazo | obrigatório |
| RF-03 | Solicitação em aberto e dentro do prazo deve mostrar "Vence em" seguido do tempo restante, a partir do momento em que metade do prazo já passou; antes disso, nenhum selo | obrigatório |
| RF-04 | O selo "Vence em" deve ganhar destaque de atenção quando restar um quarto do prazo ou menos | obrigatório |
| RF-05 | Solicitação concluída deve mostrar "No prazo" ou "Fora do prazo", conforme a API | obrigatório |
| RF-06 | Solicitação cancelada, ou sem prazo informado pela API, não deve mostrar selo de prazo | obrigatório |
| RF-07 | A idade em dias só deve aparecer em solicitações em aberto | obrigatório |
| RF-08 | A legenda do indicador "Em atraso" do painel deve dizer que a contagem é de solicitações fora do prazo de SLA | obrigatório |
| RF-09 | O tempo deve ser escrito em minutos abaixo de 1 hora, em horas abaixo de 48 horas e em dias a partir daí | obrigatório |
| RF-10 | Nenhum texto, selo ou botão do card deve ficar cortado pela borda do card | obrigatório |
| RF-11 | Quando não couberem numa linha, os elementos do cabeçalho e do rodapé do card devem passar para a linha de baixo | obrigatório |
| RF-12 | Abrir a solicitação pelo card não deve recarregar a aplicação | obrigatório |
| RF-13 | O link do card deve continuar abrindo em nova aba pelo gesto padrão do navegador | obrigatório |
| RF-14 | Todo botão padrão da aplicação deve ter no mínimo 44 px de altura | obrigatório |
| RF-15 | Os controles do card do quadro (abrir e avançar etapa) devem ter área de toque de no mínimo 44 por 44 px em telas de toque | obrigatório |
| RF-16 | Todo botão, link, item de navegação e aba deve mostrar um contorno visível ao receber foco pelo teclado, nos temas claro e escuro | obrigatório |
| RF-17 | O contorno de foco não deve aparecer ao clicar com o mouse ou tocar | obrigatório |
| RF-18 | Todo campo de formulário com erro deve estar associado à sua mensagem de erro, de modo que tecnologia assistiva leia a mensagem junto com o campo | obrigatório |
| RF-19 | O botão de avançar etapa do card deve ter nome acessível que diga a ação | obrigatório |
| RF-20 | Deve existir uma variação de botão para ação destrutiva, visualmente distinta da principal | obrigatório |
| RF-21 | A camada de ação deve ser anunciada como diálogo modal, com um nome que diga a ação e a solicitação | obrigatório |
| RF-22 | Ao abrir, o foco deve ir para dentro do diálogo | obrigatório |
| RF-23 | Com o diálogo aberto, Tab e Shift+Tab devem circular só entre os controles do diálogo | obrigatório |
| RF-24 | Esc deve fechar o diálogo sem executar a ação | obrigatório |
| RF-25 | Clicar ou tocar fora do diálogo deve fechá-lo sem executar a ação | obrigatório |
| RF-26 | Enquanto o diálogo estiver aberto, a página de trás não deve rolar | obrigatório |
| RF-27 | Ao fechar, o foco deve voltar ao elemento que estava com foco antes de abrir | obrigatório |
| RF-28 | No celular o diálogo deve subir da base da tela e ocupar a largura toda; em telas maiores, ficar centralizado | obrigatório |
| RF-29 | O conteúdo do diálogo mais alto que a tela deve rolar dentro do diálogo | obrigatório |
| RF-30 | Enquanto uma ação estiver sendo enviada, Esc e o clique fora não devem fechar o diálogo | desejável |

Partes: RF-01 a RF-09, prazo do card; RF-10 a RF-13, card sem cortes; RF-14 a RF-20, toque
e foco; RF-21 a RF-30, diálogo do quadro.

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Uma fonte só para o prazo | 0 constantes de horas de SLA no frontend |
| RNF-02 | Cobertura da regra | 100% de linha no módulo que decide o selo |
| RNF-03 | Larguras suportadas | 0 elementos do card com conteúdo mais largo que o card em 1024, 1280, 1440 e 1920 px, com 5 colunas |
| RNF-04 | Área de toque | 0 controles interativos com menos de 44 px em qualquer dimensão nas telas de quadro, detalhe e nova solicitação, em 390 px de largura com ponteiro de toque |
| RNF-05 | Contraste do contorno de foco | no mínimo 3:1 contra o fundo, nos dois temas |
| RNF-06 | Cobertura do componente de diálogo | no mínimo 95% de linha |
| RNF-07 | Dependências | 0 dependências novas |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Card confiável e controles acessíveis

  # Prazo do card

  Cenário: Atrasada em aberto
    Dado uma solicitação em andamento cujo prazo-limite venceu há 5 horas
    Quando vejo o card
    Então o selo diz "Atrasada há 5 h"

  Cenário: Perto de vencer
    Dado uma solicitação em andamento aberta há 20 horas com prazo de 24 horas
    Quando vejo o card
    Então o selo diz "Vence em 4 h" com destaque de atenção

  Cenário: Longe de vencer
    Dado uma solicitação em andamento aberta há 2 horas com prazo de 24 horas
    Quando vejo o card
    Então não há selo de prazo

  Cenário: Edição não reinicia o prazo
    Dado uma solicitação atrasada que acabou de ser editada
    Quando vejo o card
    Então o selo continua dizendo que ela está atrasada

  Cenário: Concluída fora do prazo
    Dado uma solicitação concluída que a API marca como atrasada
    Quando vejo o card
    Então o selo diz "Fora do prazo"
    E a idade em dias não aparece

  Cenário: Cancelada
    Dado uma solicitação cancelada com prioridade
    Quando vejo o card
    Então não há selo de prazo nem idade em dias

  Cenário: Sem triagem
    Dado uma solicitação em "A Fazer" sem prioridade
    Quando vejo o card
    Então não há selo de prazo

  # Card sem cortes

  Cenário: Cinco colunas em 1440 px
    Dado o quadro com solicitações nas cinco colunas numa tela de 1440 px
    Quando vejo os cards
    Então nenhum conteúdo passa da largura do card

  Cenário: Abrir pelo card
    Dado o quadro carregado
    Quando abro uma solicitação pelo card
    Então vejo o detalhe sem a aplicação recarregar

  Cenário: Endereço do link
    Dado um card do quadro
    Quando inspeciono o link de abrir
    Então ele aponta para o endereço do detalhe daquela solicitação

  # Toque e foco

  Cenário: Botão padrão
    Dado qualquer botão padrão da aplicação
    Quando meço a altura
    Então ela é de pelo menos 44 px

  Cenário: Foco pelo teclado em botão secundário
    Dado um botão secundário
    Quando chego nele com a tecla Tab
    Então vejo um contorno ao redor do botão

  Cenário: Campo com erro
    Dado um campo de formulário com mensagem de erro
    Quando a tecnologia assistiva lê o campo
    Então ela lê também a mensagem de erro

  Cenário: Campo sem erro
    Dado um campo de formulário sem erro
    Quando a tecnologia assistiva lê o campo
    Então nenhuma mensagem de erro é associada

  Cenário: Ação destrutiva
    Dado um botão de ação destrutiva
    Quando o comparo com o botão principal
    Então a cor dele é a de perigo

  # Diálogo do quadro

  Cenário: Anunciado como diálogo
    Dado o quadro com uma solicitação em "A Fazer"
    Quando abro a triagem dela
    Então existe um diálogo modal cujo nome cita a solicitação

  Cenário: Foco entra no diálogo
    Dado o diálogo de triagem aberto
    Então o foco está dentro do diálogo

  Cenário: Tab não sai do diálogo
    Dado o diálogo aberto com o foco no último controle
    Quando aperto Tab
    Então o foco vai para o primeiro controle do diálogo

  Cenário: Shift+Tab no primeiro controle
    Dado o diálogo aberto com o foco no primeiro controle
    Quando aperto Shift+Tab
    Então o foco vai para o último controle do diálogo

  Cenário: Esc fecha
    Dado o diálogo aberto
    Quando aperto Esc
    Então o diálogo fecha
    E nenhuma ação é enviada

  Cenário: Clique fora fecha
    Dado o diálogo aberto
    Quando clico fora dele
    Então o diálogo fecha

  Cenário: Clique dentro não fecha
    Dado o diálogo aberto
    Quando clico dentro dele
    Então o diálogo continua aberto

  Cenário: Foco volta
    Dado que abri o diálogo a partir do botão de avançar de um card
    Quando fecho o diálogo
    Então o foco volta para aquele botão

  Cenário: Página de trás parada
    Dado o diálogo aberto
    Então a página de trás não rola
    E volta a rolar quando o diálogo fecha
```

## Ambiguidades

Nenhuma em aberto. Decisões do agente, registradas em 2026-10-06:

- **Prazo do card:** Decisões do agente, registradas em 2026-10-06: - **Quando o selo aparece:** mantida a regra de hoje (a partir de metade do prazo), para o quadro não ganhar um selo em cada card. - **Resposta sem os campos de prazo** (evento de tempo real ou backend antigo): o card fica sem selo, em vez de calcular por conta própria.
- **Toque e foco:** Decisão do agente em 2026-10-06: o botão compacto (36 px) continua existindo como opção explícita para tabelas densas no computador; o padrão passa a ser 44 px.
- **Diálogo do quadro:** Decisão do agente em 2026-10-06: RF-30 fica para a continuação da issue, porque exige que cada ação informe ao diálogo que está enviando.
- **Uma especificação para as quatro issues:** pedido do usuário em 2026-10-06.

## Métricas de sucesso

- Card, filtro "atrasadas" e painel concordam para a mesma solicitação.
- Captura de tela do quadro em 1440 px sem conteúdo cortado.
- Percorrer quadro, detalhe e nova solicitação só com Tab, vendo o foco em todos os passos.
- Triar uma solicitação do quadro do começo ao fim só com o teclado.
