# Especificação — Dashboard: uma pergunta por bloco, sem informação repetida e com indicadores que dizem algo

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#144, escrita em 2026-10-08 depois da análise de
usabilidade (capturas em `/root/rgm/evidencias/analise-ux-2026-10-08/`). É a **spec 013**,
primeira da fila de entrega visual (013 dashboard, 014 quadro e card, 015 retorno do sistema,
016 login e triagem). Usa o que as specs 010 (sistema de design e tema) e 011 (navegação e
seções recolhíveis) entregaram. O usuário precisa de um front operacional, fácil e rápido
para a fábrica.

## Problema

Medição de 2026-10-09, em `develop` (`f8066d0`), com 583 solicitações, 249 modelos e 123
usuários, nos perfis administrador e operador.

1. **A mesma contagem aparece três vezes** na aba Solicitações: nos cartões de topo, na tabela
   "Distribuição detalhada por status" e nas barras "Distribuição por status".
2. **Indicadores que não são de solicitação** ("Usuários 123", "Modelos 249") disputam espaço
   com os de operação. São cadastros e já têm tela na administração.
3. **Número sem leitura:** "Em atraso 123" e "Lead time médio 4,2h" não dizem se está bom ou
   ruim: não há comparação com o período anterior, meta nem cor de estado. "Total" e
   "Concluídas" são acumulados de toda a vida do sistema e não mudam o suficiente para
   orientar o dia.
4. **O que é urgente fica escondido.** "Acompanhamento Crítico" é a informação mais acionável
   e fica na terceira coluna, abaixo da dobra no celular, com título truncado, sem
   responsável nem modelo e com a mesma etiqueta "Nd abertas" em todas as linhas. Mostra só
   as 5 primeiras de 123 atrasadas, sem dizer que há mais nem como ver o resto.
5. **Cartões com alturas diferentes** na mesma linha deixam vazio grande abaixo da coluna da
   esquerda.
6. **O topo repete contexto** ("Painel administrativo" na barra lateral, "Dashboard" no título,
   "583 solicitações no total" na descrição) e a pílula "Monitoramento em Tempo Real" pisca o
   tempo todo sem dizer o que é monitorado nem quando foi a última atualização.
7. **Abas com pouco conteúdo:** "Modelos por máquina" tem uma linha, o ranking mostra "0h" em
   quase todos; "Pessoal" mostra "Sou responsável 0" ao lado de um painel vazio.
8. **O histórico de solicitações está certo, mas não se lê:** a API devolve dados (em 7 dias,
   437, 96 e 44 solicitações por dia), porém as barras empilhadas sem eixo, sem valor e sem
   destaque do dia de hoje não deixam ver tendência; abertas e concluídas não são comparáveis
   lado a lado. (A hipótese da #144 de "gráfico vazio por defeito" não se confirmou: era
   efeito da escala.)

**Custo de não resolver:** o gestor abre o painel e não sabe, de relance, o que precisa de
ação agora, se a operação melhorou ou piorou, nem para onde ir em seguida. Gasta tempo
lendo três vezes a mesma contagem.

## Objetivo

Depois desta entrega o painel responde, nesta ordem, uma pergunta por bloco:

1. **"O que precisa de mim agora?"**: fila de atenção no topo com as solicitações atrasadas e
   paradas, cada uma com título inteiro, responsável, modelo, tempo de atraso e acesso direto
   à solicitação.
2. **"Como estamos?"**: faixa de poucos indicadores de solicitação, cada um com leitura
   (comparação com o período anterior ou meta) e cor de estado, com o período escolhido uma
   única vez para a tela inteira.
3. **"Para onde vai?"**: um gráfico de tendência de abertas contra concluídas, legível, com
   estado vazio explicado.
4. **"Onde está o trabalho?"**: uma única visão de distribuição, com alternância entre status,
   tipo e prioridade; clicar numa parte abre a lista de solicitações já filtrada.

Nenhuma contagem aparece em mais de um bloco da mesma aba. Usuários e modelos saem do painel
de solicitações.

## Compatibilidade e ordem de publicação

O filtro "em aberto" (`emAberto`) da listagem **não existe no backend v1.5.0 em produção**;
entrou depois, em `develop` (commit `d71fae4`, "filtro em aberto, canceladas por data e
resumos agregados"). A fila de atenção, "Ver todas" e a distribuição por tipo e prioridade
dependem dele. Pelo Princípio 9, esta spec declara a ordem: **o backend de `develop` é
publicado antes deste frontend** (a mesma ordem que a spec 005 já declarou para o mesmo
filtro). Com o backend v1.5.0 o filtro é ignorado: a fila pode incluir atrasadas já
concluídas e as contagens por tipo e prioridade incluem as encerradas. O painel continua
funcionando, com números maiores que os reais; não há reserva melhor, porque o cliente não
sabe qual versão do backend está do outro lado.

## Fora de escopo

- Novos endpoints ou parâmetros no backend. A spec usa o que a API entrega hoje (métricas
  globais, histórico por período, listagem de solicitações com filtros e prazo). Se a leitura
  de algum indicador exigir dado que a API não entrega, o indicador é removido ou simplificado
  (ver Ambiguidades), não se abre issue de backend nesta spec.
- Mudanças nas abas **Modelos** e **Pessoal** além do que for necessário para não repetir
  informação e para os estados de carregamento, vazio e erro do bloco. O redesenho delas fica
  para depois, se o uso pedir.
- Toasts e avisos de ação (spec 015, #126). Aqui só os estados de carregamento, vazio e erro
  de cada bloco, com o que já existe no sistema de design.
- Exportação de relatório em PDF e telas de administração de usuários e modelos.
- Metas de atraso configuráveis pelo usuário.
- Atualização em tempo real do painel por eventos (continua como está; só o texto do
  indicador muda).

## Personas e cenários de uso

- **Gestor / administrador**, no começo do turno, no PC da fábrica (1440 × 900) ou no
  celular (390 × 844): abre o painel para saber o que está atrasado e de quem é, se a
  operação está melhor ou pior que na semana passada, e ir direto à solicitação ou à
  lista filtrada.
- **Operador:** entra direto na aba "Pessoal" (o que é dele). Não vê indicadores agregados
  de outros responsáveis (regra atual, mantida).

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A aba Solicitações deve abrir com a **fila de atenção** acima de qualquer indicador ou gráfico: solicitações **em aberto** e atrasadas (SLA vencido, critério do backend), da mais atrasada para a menos atrasada. Só atrasadas nesta spec; "paradas" fica para depois. A API não ordena e limita a consulta a 100: com mais de 100 atrasadas, "mais atrasada" vale entre as 100 mais antigas de criação, e a tela mostra o total real. | obrigatório |
| RF-02 | Cada item da fila deve mostrar o título inteiro (quebrando em até duas linhas), o código do modelo, os responsáveis pelo nome (ou "Sem responsável"; se a API não trouxer os nomes, mostra quantos são), a etapa e o tempo de atraso ("atrasada há 2 d"), e ser um link para a solicitação. | obrigatório |
| RF-03 | A fila deve mostrar **5 itens** e **não repetir o total de atrasadas** (o total mora só no indicador "Em atraso", por RF-13), com uma ação "Ver todas" que abre a página de solicitações, na visão Lista, filtrada por atrasadas em aberto, com o filtro visível e removível. | obrigatório |
| RF-04 | A fila vazia deve dizer que nada está atrasado, em vez de esconder o bloco. | obrigatório |
| RF-05 | Deve haver uma **faixa de indicadores** de solicitação (abertas, em atraso, concluídas no período, tempo médio de resolução), cada um com o valor, a unidade e uma leitura. **Concluídas no período** e **tempo médio de resolução** mostram a variação contra o período anterior de mesmo tamanho; **abertas** e **em atraso** mostram o valor de agora (a API não guarda série passada deles). Cor de estado: em atraso, 0 é bom, até 10% das abertas é atenção e acima disso é ruim; tempo médio é melhor, igual ou pior que o período anterior; abertas é neutro. O estado nunca depende só da cor. Concluídas e tempo médio vêm da data de conclusão. Com menos de 5 concluídas no período anterior, a leitura mostra a diferença absoluta ("+3 contra o período anterior") e não o percentual. Com mais de 100 concluídas no período, o tempo médio diz "média de 100 de N". | obrigatório |
| RF-06 | O indicador que não tiver como ser comparado (sem período anterior, sem dado) deve dizer isso ("sem dados no período anterior") em vez de mostrar 0 ou 0%. | obrigatório |
| RF-07 | O **período** (7, 30 ou 90 dias) deve ser escolhido uma única vez, num controle do topo da aba, e valer para a faixa de indicadores e para o gráfico de tendência; a opção escolhida é dita por texto, não só por cor. A fila de atenção não depende do período. | obrigatório |
| RF-08 | O **gráfico de tendência** deve comparar abertas e concluídas no período, com eixo, valores legíveis ao tocar, passar o mouse ou focar com o teclado, o último ponto destacado ("hoje" no gráfico diário, "esta semana" no semanal de 90 dias) e legenda que diz o que cada série é (solicitações criadas naquele dia que hoje estão abertas ou concluídas; a API agrupa por data de criação); deve ter alternativa em texto (tabela ou resumo) para quem não enxerga o gráfico. | obrigatório |
| RF-09 | O gráfico sem dados no período deve mostrar um vazio explicado ("Nenhuma solicitação aberta ou concluída nos últimos 30 dias"), com a mesma altura de quando há dados. | obrigatório |
| RF-10 | Deve haver **uma única visão de distribuição** do trabalho **aberto** (A fazer, Em andamento e Em validação, nas três visões), com controle segmentado para alternar entre status, tipo e prioridade, substituindo a tabela e as três listas de barras atuais. | obrigatório |
| RF-11 | Clicar numa parte da distribuição deve abrir a página de solicitações, na visão Lista, já filtrada pela escolha (status, tipo ou prioridade) e por "em aberto", com o filtro visível e removível. | obrigatório |
| RF-12 | "Usuários" e "Modelos" não devem aparecer no painel de solicitações; o acesso a eles continua pela administração. | obrigatório |
| RF-13 | Nenhuma contagem pode aparecer em mais de um bloco da mesma aba. | obrigatório |
| RF-14 | O topo da página não deve repetir contexto: um título, sem a descrição com o total de solicitações e sem a pílula "Monitoramento em Tempo Real"; em seu lugar, um indicador discreto da última atualização dos dados. | obrigatório |
| RF-15 | Cada bloco deve ter seus próprios estados de carregamento, vazio e erro; o erro de um bloco não pode derrubar os outros, e deve oferecer "Tentar novamente". | obrigatório |
| RF-16 | Os blocos da mesma linha devem ter a mesma altura, sem vazio grande abaixo de nenhum. | recomendado |
| RF-17 | Em 390 × 844, a fila de atenção deve aparecer na primeira dobra e os blocos devem empilhar na ordem das perguntas. | obrigatório |
| RF-18 | O operador continua vendo só a aba "Pessoal", sem fila, indicadores nem distribuição de outros responsáveis. | obrigatório |
| RF-19 | A aba "Modelos" não deve repetir contagem já mostrada em outro bloco e deve esconder valores sem informação (por exemplo "0h") em vez de exibi-los como dado. | recomendado |
| RF-20 | A aba "Pessoal" não deve mostrar um painel vazio ao lado de um indicador zerado; sem dado, mostra um estado vazio com a ação seguinte ("Abrir nova solicitação" ou "Ver o quadro"). | recomendado |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | A fila de atenção visível sem rolagem. | Em 1440 × 900 e em 390 × 844, o primeiro item da fila fica inteiro acima da dobra. |
| RNF-02 | Tempo de carregamento percebido. | A aba mostra a fila ou seu esqueleto em até 1 s depois da navegação; a faixa de indicadores e a distribuição aparecem em até 3 s com a API local, 583 solicitações. |
| RNF-03 | Número de requisições do painel. | A aba Solicitações faz no máximo 10 requisições ao carregar, com a distribuição por status (visões tipo e prioridade carregam quando escolhidas, 4 cada) (hoje faz 12: métricas, quatro contagens por tipo, quatro por prioridade, duas de atrasadas e o histórico). |
| RNF-04 | Acessibilidade: contraste. | Texto e indicadores com contraste mínimo de 4,5:1 e 3:1 para elementos gráficos, nos dois temas. |
| RNF-05 | Acessibilidade: teclado e leitor de tela. | Todo controle e todo link do painel é alcançável e acionável por teclado; carregamento, vazio e erro anunciados (`status`/`alert`); estado de cor sempre acompanhado de texto ou ícone. |
| RNF-06 | Área de toque. | Todo alvo interativo tem pelo menos 44 × 44 px em ponteiro de toque. |
| RNF-07 | Movimento. | Nenhuma animação contínua (a pílula e o ícone que giram saem); transições respeitam `prefers-reduced-motion`. |
| RNF-08 | Cobertura de testes. | Cobertura de linhas e ramos do código novo ou alterado no mínimo igual ao exigido na constituição do repositório. |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Dashboard do gestor com uma pergunta por bloco

  Cenário: Fila de atenção abre o painel
    Dado um gestor autenticado e 123 solicitações em atraso
    Quando ele abre o dashboard na aba Solicitações
    Então a primeira seção é "Precisa de atenção"
    E a seção lista a solicitação mais atrasada primeiro
    E cada item mostra título, código do modelo, responsáveis, etapa e "atrasada há"
    E a seção oferece "Ver todas"
    Mas a seção não diz o total de atrasadas (ele está só no indicador "Em atraso")
    E nenhum indicador nem gráfico aparece acima da fila

  Cenário: Ver todas as atrasadas leva à lista filtrada
    Dado um gestor com atrasadas na fila de atenção
    Quando ele aciona "Ver todas"
    Então abre a página de solicitações na visão Lista
    E a lista mostra só as atrasadas em aberto
    E o filtro aparece como etiqueta que pode ser removida

  Cenário: Fila sem os nomes dos responsáveis
    Dado que a API não traz os nomes dos responsáveis
    Quando a fila de atenção aparece
    Então cada item diz quantos responsáveis tem, ou "Sem responsável"
    Mas não mostra identificadores

  Cenário: Fila vazia
    Dado um gestor autenticado e nenhuma solicitação em atraso
    Quando ele abre o dashboard
    Então a seção "Precisa de atenção" diz que nada está atrasado
    Mas o bloco não some

  Cenário: Indicador com leitura
    Dado um gestor com o período de 30 dias escolhido
    Quando a faixa de indicadores aparece
    Então cada indicador mostra valor, unidade e a variação contra os 30 dias anteriores
    E o estado do indicador é dito em texto ou ícone, além da cor
    Mas nenhum indicador mostra "0%" quando não há período anterior

  Cenário: Indicador sem período anterior
    Dado que não há solicitações no período anterior
    Quando a faixa de indicadores aparece
    Então o indicador diz "sem dados no período anterior"
    Mas não mostra variação numérica

  Cenário: Um período só para a tela
    Dado um gestor no dashboard com 30 dias escolhidos
    Quando ele escolhe 7 dias no controle de período do topo
    Então a faixa de indicadores e o gráfico de tendência passam a mostrar 7 dias
    Mas não existe outro controle de período na aba

  Cenário: Tendência legível
    Dado um período com solicitações abertas e concluídas
    Quando o gráfico de tendência aparece
    Então abertas e concluídas aparecem lado a lado, com eixo e hoje destacado
    E há uma alternativa em texto com os mesmos números

  Cenário: Tendência sem dados
    Dado um período sem solicitações abertas nem concluídas
    Quando o gráfico de tendência aparece
    Então ele mostra o vazio "Nenhuma solicitação aberta ou concluída nos últimos 30 dias"
    Mas mantém a mesma altura do gráfico com dados

  Cenário: Distribuição única com filtro na lista
    Dado um gestor no dashboard
    Quando ele escolhe "Prioridade" no controle da distribuição
    E aciona a parte "Urgente"
    Então abre a página de solicitações na visão Lista, filtrada por prioridade urgente em aberto
    Mas a tela não mostra mais a tabela por status nem três blocos de barras

  Cenário: Mais de 100 atrasadas
    Dado um gestor e 130 solicitações atrasadas em aberto
    Quando a fila de atenção aparece
    Então a fila mostra 5 itens
    E o indicador "Em atraso" mostra 130
    Mas não carrega mais de 100 para ordenar

  Cenário: Pouco dado no período anterior
    Dado que o período anterior teve 2 concluídas e o atual teve 5
    Quando a faixa de indicadores aparece
    Então "Concluídas" mostra a diferença "+3 contra o período anterior"
    Mas não mostra um percentual

  Cenário: Mais de 100 concluídas no período
    Dado 130 solicitações concluídas no período
    Quando a faixa de indicadores aparece
    Então o tempo médio diz "média de 100 de 130"

  Cenário: Falha da fila de atenção
    Dado que a carga da fila de atenção falha
    Quando o dashboard é exibido
    Então a fila mostra o erro com "Tentar novamente"
    E a faixa de indicadores e a tendência continuam visíveis

  Cenário: Falha nos indicadores ou na tendência
    Dado que a carga dos indicadores falha
    Quando o dashboard é exibido
    Então a faixa mostra o erro com "Tentar novamente"
    E a fila de atenção continua visível

  Cenário: Trocar o período não recarrega a fila
    Dado um gestor no dashboard com a fila carregada
    Quando ele escolhe outro período
    Então a fila de atenção não é consultada de novo

  Cenário: Aba Modelos sem valor vazio
    Dado um ranking de modelos com tempo médio menor que 1 minuto
    Quando a aba Modelos é exibida
    Então o valor aparece como "—"
    Mas não como "0h"

  Cenário: Aba Pessoal sem nada
    Dado um usuário sem solicitações abertas, sob responsabilidade ou concluídas
    Quando a aba Pessoal é exibida
    Então ela mostra um estado vazio com a ação "Ver o quadro"
    Mas não mostra um painel vazio ao lado de indicadores zerados

  Cenário: Blocos da mesma linha com a mesma altura
    Dado um gestor no dashboard em 1440 por 900
    Quando os blocos da mesma linha são exibidos
    Então eles têm a mesma altura

  Cenário: Cadastros fora do painel de solicitações
    Dado um administrador no dashboard
    Quando a aba Solicitações é exibida
    Então não existem os indicadores "Usuários" e "Modelos"

  Cenário: Nenhuma contagem repetida
    Dado qualquer perfil de gestão no dashboard
    Quando a aba Solicitações é exibida
    Então cada contagem aparece em um só bloco

  Cenário: Erro de um bloco não derruba os outros
    Dado que a carga da distribuição falha
    Quando o dashboard é exibido
    Então o bloco da distribuição mostra o erro com "Tentar novamente"
    E a fila de atenção e a faixa de indicadores continuam visíveis

  Cenário: Operador não vê o agregado
    Dado um operador autenticado
    Quando ele abre o dashboard
    Então vê apenas a aba "Pessoal"
    Mas não vê fila de atenção, indicadores nem distribuição de outros responsáveis

  Cenário: Celular
    Dado um gestor em tela de 390 por 844
    Quando ele abre o dashboard
    Então o primeiro item da fila de atenção está acima da dobra
    E os blocos seguem a ordem das perguntas
    Mas não há rolagem horizontal da página

  Cenário: Topo sem repetição
    Dado um gestor no dashboard
    Quando a página é exibida
    Então há um título e a hora da última atualização
    Mas não há a descrição com o total nem a pílula "Monitoramento em Tempo Real"
```

## Ambiguidades

Nenhuma em aberto. Decisões na tabela **Esclarecimentos**, no fim do documento.

## Métricas de sucesso

- O gestor responde "o que está atrasado e de quem é" olhando só a primeira dobra, sem
  rolar nem abrir outra tela (medido em captura nos dois tamanhos).
- Nenhuma contagem repetida no painel (conferido por teste de tela).
- Menos requisições ao carregar a aba Solicitações: de 12 para no máximo 10.
- A suíte de testes de acessibilidade e de contraste do painel passa nos dois temas.

## Esclarecimentos

Rodada de 2026-10-09.

| # | Pergunta | Resposta | Quem |
|---|---|---|---|
| 1 | Como ficam os indicadores com "leitura", se a API só tem série histórica de concluídas e tempo médio? | Variação contra o período anterior só onde há dado (concluídas e tempo médio, buscando o dobro do período no histórico); abertas e em atraso mostram o valor de agora. O usuário perguntou "o que você me recomenda" e delegou a escolha; esta foi a recomendação. | usuário (delegou), recomendação do agente de especificação |
| 2 | Qual regra dá a cor de estado? | Proposta: em atraso 0 = bom, até 10% das abertas = atenção, acima = ruim; tempo médio melhor/igual/pior que o período anterior; abertas neutro. | usuário |
| 3 | O que entra na fila de atenção? | Só atrasadas, 5 itens, da mais atrasada para a menos atrasada, com "Ver todas". | usuário |
| 4 | A distribuição cobre o quê? | Só o trabalho aberto (A fazer, Em andamento, Em validação) em status, tipo e prioridade; concluídas e canceladas só no indicador de concluídas do período. | usuário |
| 5 | Quais abas o gestor vê? | As três (Solicitações, Modelos e Pessoal), como hoje. O operador continua só com "Pessoal". | usuário |
| 6 | O critério de "atrasada" é o do backend ou um corte de 7 dias? | **Verificado no código, não decidido:** é o SLA por prazo limite da solicitação (`Solicitacao#isAtrasada`: não terminal compara o prazo com o instante atual; concluída compara com a data de conclusão; cancelada nunca é atrasada). O texto "excedeu 7 dias" da tela atual está errado e sai. A fila usa o filtro de atrasadas combinado com em aberto, para não contar concluída fora do prazo. Em 2026-10-09: 123 atrasadas, todas em aberto. | verificação no código (backend `Solicitacao.java`) |
| 7 | Revisão dos checklists: destino de "Ver todas" e da distribuição (Lista, não Kanban), legenda do gráfico (série por data de criação), diferença absoluta com menos de 5 concluídas no período anterior, "média de 100 de N" com mais de 100 concluídas, e as demais lacunas | O usuário respondeu "Ok" às quatro propostas do agente de especificação (2026-10-09). Entraram em RF-01, RF-02, RF-03, RF-05, RF-07, RF-08, RF-10 e RF-11, no RNF-03 e em dez cenários novos de aceite. | usuário ("Ok"), texto do agente de especificação |
| 8 | Convergência (T055): o total de atrasadas aparecia na fila e no indicador "Em atraso", e o RF-13 proíbe repetir contagem. Como resolver? | Opção (a): tirar o total do cabeçalho da fila (fica só "Ver todas") e manter o indicador "Em atraso" como único lugar do número. Alterados o RF-03 e os cenários *Fila de atenção abre o painel* e *Mais de 100 atrasadas*. | usuário ("A", 2026-10-09) |
| 9 | Convergência, rodada 2: as ressalvas de medição RNF-02 (carga medida só no Vite de desenvolvimento, uma de quatro medições em 3,2 s) e RNF-05 (teclado e `aria` testados, sem leitor de tela real) ficam abertas. Aceitar? | Aceitas como ressalva, sem nova medição nesta feature. Se a carga incomodar na fábrica, medir no build de produção em outra issue. | usuário ("aprova isso", 2026-10-10) |
