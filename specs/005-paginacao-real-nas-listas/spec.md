# Especificação — Paginação real nas listas

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#114 (prioridade alta). É pré-requisito de
OtavioProcopio/rgm-backend#89, que vai limitar o tamanho máximo de página na API.

## Problema

Várias telas pedem "tudo de uma vez" à API, com um tamanho de página alto:

- o quadro busca 200 solicitações numa única chamada, de todos os status;
- o painel busca até 1000 solicitações por status em aberto, só para contar prioridades;
- a abertura de solicitação busca até 1000 modelos para o seletor;
- o filtro de solicitações busca 100 modelos;
- a aba pessoal busca 100 solicitações por lista.

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
| RF-12 | Uma ação sobre um card, ou um evento de tempo real, deve atualizar as colunas afetadas mantendo os blocos já carregados | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Carga inicial do quadro | no máximo 5 requisições de listagem (uma por coluna), cada uma com 20 itens |
| RNF-02 | Busca de modelo | a busca só é disparada 300 ms depois da última tecla |
| RNF-03 | Tamanho de página | maior `size` enviado à API em todo o código de produção: 100 |

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
- **Usuários:** mantida a lista de até 100 ativos (opção dada pela própria issue); busca por
  nome fica para uma issue de backend.
- **Tamanho dos blocos:** 20 no quadro (issue); 10 na aba pessoal e 20 opções no seletor,
  definidos aqui por serem listas curtas de consulta.

## Métricas de sucesso

- A rgm-backend#89 pode limitar `size` a 100 sem quebrar nenhuma tela.
- O quadro abre com 5 requisições pequenas, qualquer que seja o volume de dados.
