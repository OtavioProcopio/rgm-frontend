# Especificação — Paginação real nas listas

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#114 (prioridade alta). É pré-requisito de
OtavioProcopio/rgm-backend#89, que vai limitar o tamanho máximo de página na API.

Escrita em 2026-10-05 e ainda não implementada (sem plano nem tarefas). Revista em
2026-10-07 contra o código de `develop`; o que mudou está na seção
**Adequação de 2026-10-07**, no fim.

## Problema

Várias telas pedem "tudo de uma vez" à API, com um tamanho de página alto:

- o quadro busca 200 solicitações numa única chamada, de todos os status;
- o painel busca até 1000 solicitações por status em aberto, só para contar prioridades;
- a abertura de solicitação busca até 1000 modelos para o seletor;
- o filtro de solicitações busca 100 modelos;
- a aba pessoal busca 100 solicitações por lista;
- o painel de modelos busca todos os modelos (tamanho de página igual ao total) para contar
  pendências e modelos por máquina;
- a ficha do modelo busca todas as solicitações dele para montar o mini-painel.

Conferido de novo em 2026-10-07: as sete buscas continuam como descrito.

Com pouco volume funciona. Conforme os dados crescem, a tela fica lenta e, pior, o que passa
do limite **some sem aviso**: um card além do 200º não aparece no quadro, um modelo além do
100º não aparece no filtro. Quando o backend passar a recusar páginas grandes, essas telas
quebram.

## Objetivo

Nenhuma tela depende de trazer a lista inteira. O usuário sempre consegue chegar a qualquer
item, carregando mais ou buscando, e sabe quando há mais do que está vendo.

## Fora de escopo

- Busca de usuário por nome: a lista de responsáveis continua com os 100 primeiros ativos
  (decisão da issue; ver Ambiguidades).
- Rolagem infinita automática; carregar mais é uma ação do usuário.
- Mudar os indicadores do painel além de como são contados.
- O limite de tamanho de página no backend (OtavioProcopio/rgm-backend#89).
- O texto do quadro vazio do operador e a marca de relação no card (especificação 009,
  OtavioProcopio/rgm-frontend#122). Esta feature só mantém os dois funcionando com a
  carga por coluna (RF-16).
- Redesenho do card, do detalhe e dos estados de carregamento (#126, #129, #130).

## Personas e cenários de uso

- **Gestor** usa o quadro o dia inteiro, com dezenas de cards em andamento e um histórico de
  concluídas que cresce para sempre.
- **Operador** abre a aba pessoal para ver o que abriu e o que está com ele.
- **Qualquer usuário** escolhe um modelo, entre centenas, ao abrir uma solicitação ou ao
  filtrar a listagem.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Cada coluna do quadro deve carregar as solicitações do seu status em blocos de 20 | obrigatório |
| RF-02 | Enquanto houver mais solicitações numa coluna, ela deve oferecer "Carregar mais" | obrigatório |
| RF-03 | O contador de cada coluna deve mostrar o total de solicitações daquele status, não a quantidade carregada | obrigatório |
| RF-04 | Sem filtro de período, as colunas Concluída e Cancelada devem mostrar apenas as encerradas nos últimos 30 dias, e a coluna deve dizer isso | obrigatório |
| RF-05 | Com filtro de período informado, as colunas Concluída e Cancelada devem seguir o período escolhido, sem o limite de 30 dias | obrigatório |
| RF-06 | O filtro de modelo e o de período do quadro devem continuar valendo em todas as colunas | obrigatório |
| RF-07 | As duas listas da aba pessoal ("abertas por mim" e "sob minha responsabilidade") devem mostrar só solicitações em aberto, paginadas, 10 por página | obrigatório |
| RF-08 | Os seletores de modelo (abertura de solicitação e filtro da listagem) devem buscar na API pelo código, conforme o usuário digita, e mostrar no máximo 20 opções por busca | obrigatório |
| RF-09 | O seletor de modelo deve continuar mostrando o modelo já selecionado, mesmo que ele não esteja entre as opções da busca atual | obrigatório |
| RF-10 | A distribuição por prioridade do painel deve ser contada pela API, não somando itens trazidos para a tela | obrigatório |
| RF-11 | Nenhuma tela deve pedir mais de 100 itens por página à API | obrigatório |
| RF-13 | O painel de modelos deve receber da API as contagens (total, ativos, inativos, com pendência aberta e por máquina), sem trazer a lista de modelos | obrigatório |
| RF-14 | O mini-painel da ficha do modelo deve receber da API o resumo das solicitações do modelo (total, abertas, concluídas, tempo médio de resolução e intervalo médio entre solicitações), sem trazer a lista de solicitações | obrigatório |
| RF-12 | Uma ação sobre um card, ou um evento de tempo real, deve atualizar as colunas afetadas mantendo os blocos já carregados | obrigatório |
| RF-15 | Quando a conexão de tempo real volta depois de uma queda, o quadro deve se atualizar mantendo, em cada coluna, a quantidade de blocos já carregada (acrescentado em 2026-10-07; a atualização na reconexão veio da especificação 007) | obrigatório |
| RF-16 | O quadro vazio do operador (especificação 009) deve aparecer quando o total de todas as colunas for zero, e não enquanto alguma coluna ainda estiver carregando (acrescentado em 2026-10-07) | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Carga inicial do quadro | no máximo 5 requisições de listagem (uma por coluna), cada uma com 20 itens |
| RNF-02 | Busca de modelo | a busca só é disparada 300 ms depois da última tecla |
| RNF-03 | Tamanho de página | maior `size` enviado à API em todo o código de produção: 100 |
| RNF-04 | Área de toque e foco dos controles novos ("Carregar mais", paginação da aba pessoal, seletor de modelo) | no mínimo 44 px em cada dimensão em 390 px de largura, e contorno de foco com contraste de 3:1 nos dois temas (critério das especificações 006 e 007; acrescentado em 2026-10-07) |
| RNF-05 | Cobertura | no mínimo 95% de linha em cada arquivo alterado (acrescentado em 2026-10-07) |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Paginação real nas listas

  Cenário: Coluna carrega em blocos
    Dado que existem 45 solicitações em "Em Andamento"
    Quando abro o quadro
    Então a coluna "Em Andamento" mostra 20 cards
    E o contador da coluna mostra 45
    E vejo "Carregar mais" na coluna

  Cenário: Carregar mais
    Dado que a coluna "Em Andamento" mostra 20 de 45 cards
    Quando aciono "Carregar mais"
    Então a coluna mostra 40 cards

  Cenário: Fim da coluna
    Dado que a coluna "Em Andamento" mostra todos os seus cards
    Então não vejo "Carregar mais" nessa coluna

  Cenário: Encerradas dos últimos 30 dias
    Dado que existe uma solicitação concluída há 10 dias e outra concluída há 60 dias
    E o filtro de período está vazio
    Quando abro o quadro
    Então a coluna "Concluída" mostra a de 10 dias
    E a coluna indica "últimos 30 dias"
    Mas não mostra a de 60 dias

  Cenário: Período escolhido vale para as encerradas
    Dado que existe uma solicitação concluída há 60 dias
    Quando informo um período que inclui essa data
    Então a coluna "Concluída" mostra essa solicitação
    Mas a coluna não indica "últimos 30 dias"

  Cenário: Aba pessoal paginada
    Dado que abri 25 solicitações que continuam em aberto e 40 já encerradas
    Quando abro a aba pessoal
    Então "abertas por mim" mostra 10 solicitações, todas em aberto
    E a paginação indica 3 páginas

  Cenário: Buscar modelo pelo código
    Dado que existem 300 modelos ativos
    Quando digito "MD-12" no seletor de modelo
    Então as opções são os modelos cujo código contém "MD-12"
    Mas a tela não busca os 300 modelos

  Cenário: Modelo selecionado permanece visível
    Dado que selecionei o modelo "MD-120"
    Quando digito outra busca no seletor e fecho sem escolher
    Então o seletor continua mostrando "MD-120"

  Cenário: Ação mantém o que foi carregado
    Dado que a coluna "Em Andamento" mostra 40 cards
    Quando envio um deles para validação
    Então a coluna "Em Andamento" mostra 39 cards
    E o card aparece em "Em Validação"

  Cenário: Reconexão mantém o que foi carregado
    Dado que a coluna "Em Andamento" mostra 40 cards
    E a conexão de tempo real caiu
    Quando a conexão volta
    Então a coluna "Em Andamento" continua mostrando 40 cards, já atualizados

  Cenário: Quadro vazio do operador só depois de carregar
    Dado que sou operador e não abri nem recebi nenhuma solicitação
    Quando abro o quadro
    Então vejo o quadro vazio do operador depois que todas as colunas responderam
    Mas não o vejo enquanto alguma coluna ainda carrega

  Cenário: Operador com solicitação em uma coluna só
    Dado que sou operador e tenho 1 solicitação em "A Fazer" e nenhuma nas outras colunas
    Quando abro o quadro
    Então vejo as cinco colunas
    Mas não vejo o quadro vazio do operador
```

## Ambiguidades

Nenhuma em aberto. Decisões registradas em 2026-10-05:

- **Solicitações antigas nas colunas encerradas:** valem os últimos 30 dias só enquanto o
  filtro de período estiver vazio; com período informado, as colunas seguem o período
  (resposta do usuário).
- **Aba pessoal "em aberto":** a API filtra um status por vez. O backend ganha um filtro de
  "em aberto" na listagem, entregue junto com a rgm-backend#89, e a aba pessoal usa esse
  filtro (resposta do usuário). **Ordem de publicação:** o backend com o filtro precisa
  estar no ar antes deste frontend; com backend v1.5.0 o filtro é ignorado e as listas
  mostrariam também as encerradas. Os dois saem juntos na v1.6.0.
- **Canceladas nos últimos 30 dias:** conferido no backend em 2026-10-05, o filtro por data
  de conclusão olha só a data em que a solicitação foi concluída, e canceladas não têm
  essa data. O backend passa a considerar a data de cancelamento nesse filtro, na mesma
  entrega da rgm-backend#89; mesma ordem de publicação. Com backend v1.5.0 a coluna
  Cancelada ficaria vazia sem filtro de período.
- **Contagem por prioridade do painel:** usa o mesmo filtro de "em aberto" com o filtro de
  prioridade e lê só o total; mesma ordem de publicação.
- **Painel de modelos e mini-painel da ficha do modelo** (a issue não lista; achados em
  2026-10-05): as duas telas pedem a lista inteira e quebrariam com o limite da
  rgm-backend#89. Decisão do usuário em 2026-10-05: o backend ganha endpoints agregados e
  as telas passam a usá-los (RF-13, RF-14). Mesma ordem de publicação: backend antes.
- **Contrato com o backend:** esta feature depende de quatro adições na API, todas a
  especificar no `rgm-backend` antes da implementação daqui: filtro "em aberto" na
  listagem de solicitações; data de cancelamento considerada no filtro por data de
  encerramento; resumo de modelos; resumo das solicitações de um modelo. O limite de
  `size` (rgm-backend#89) só entra depois que este frontend estiver pronto.
- **Usuários:** mantida a lista de até 100 ativos (opção dada pela própria issue); busca por
  nome fica para uma issue de backend.
- **Tamanho dos blocos:** 20 no quadro (issue); 10 na aba pessoal e 20 opções no seletor,
  definidos aqui por serem listas curtas de consulta.

## Adequação de 2026-10-07

A especificação ficou parada enquanto as features 006, 007 e 008 e três PRs do backend eram
entregues. O que mudou em volta dela:

- **Contrato com o backend, entregue.** As quatro adições de que esta feature depende estão
  em `develop` do backend desde 2026-10-06 (OtavioProcopio/rgm-backend#95, especificação 007
  de lá): filtro `emAberto` na listagem de solicitações e no relatório; data de cancelamento
  considerada no filtro por data de encerramento; resumo de modelos; resumo das solicitações
  de um modelo. Elas saíram num PR próprio, antes da rgm-backend#89, e não junto com ela
  como as decisões de 2026-10-05 previam. A rgm-backend#89 continua aberta, esperando este
  frontend.
- **Ordem de publicação, mantida.** Nenhuma dessas adições existe na v1.5.0 em produção. O
  backend vai ao ar antes, na v1.6.0.
- **Visibilidade do operador.** Desde OtavioProcopio/rgm-backend#112 o operador recebe as
  solicitações que abriu, além das atribuídas. Nada muda nos requisitos daqui: "abertas por
  mim" (RF-07) passa a ter mais itens, o que reforça a paginação. A especificação 009 troca
  o texto do quadro vazio do operador e marca a relação no card; daí o RF-16.
- **Tempo real que se recupera** (especificação 007). A aplicação agora busca tudo de novo
  quando a conexão volta. Com colunas carregadas em blocos, isso não pode devolver cada
  coluna ao primeiro bloco; daí o RF-15.
- **Toque e foco** (especificações 006 e 007). O critério de 44 px e de foco visível vale
  para a aplicação inteira; os controles que esta feature cria entram nele (RNF-04).
- **Testes** (especificação 008). Os testes desta feature nascem em `app/tests/unit`, no
  caminho espelhado, e os roteiros de ponta a ponta em `app/tests/e2e`.
- **Diálogos** (especificações 006 e 007). As ações do card abrem no diálogo modal; o RF-12
  vale para a ação confirmada nele.

Pendente para seguir: o checklist de requisitos ainda não foi revisto; faltam `/bu:plan`,
`/bu:checklist`, `/bu:tasks` e `/bu:analyze`. RF-15, RF-16, RNF-04 e RNF-05 foram
acrescentados nesta revisão e precisam do aceite do usuário.

## Métricas de sucesso

- A rgm-backend#89 pode limitar `size` a 100 sem quebrar nenhuma tela.
- O quadro abre com 5 requisições pequenas, qualquer que seja o volume de dados.
