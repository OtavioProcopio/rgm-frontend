# Especificação — Dashboard sobre o painel por período e quadro ordenado pela API

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: issues `rgm-frontend#149` (dashboard consome o painel e a listagem ordenada) e
`rgm-frontend#142` (quadro mostra as mais antigas primeiro). Base: `develop` com o backend v1.6
já mergeado (`rgm-backend` PR #126, spec 011) e a spec 014 do front. Os comportamentos "hoje"
foram lidos no código de `develop`.

## Problema

O dashboard da spec 013 e o quadro foram feitos com a API antiga e fazem no navegador o que a
API agora entrega:

1. **"Concluídas no período" e a variação saem de duas listagens de até 100 itens.** Quando há
   mais de 100, o número é uma amostra, e o tempo médio aparece como "média de 100 de N".
2. **A fila de atenção ordena por atraso só entre as primeiras atrasadas**, porque a listagem
   não ordenava. Com 123 atrasadas, a "mais atrasada" pode não ser a primeira.
3. **A tendência usa o histórico por data de criação**: uma solicitação criada há 20 dias e
   concluída hoje não aparece como concluída hoje.
4. **O quadro mostra as mais antigas primeiro** (#142): em A Fazer, a solicitação que o operador
   acabou de abrir fica depois do "Carregar mais".
5. **Muitas requisições para uma tela:** ao abrir a aba Solicitações o dashboard faz 5 consultas
   de dados (indicadores gerais, fila, duas de concluídas e o histórico).

**Custo de não resolver:** número de concluídas e tempo médio errados acima de 100, fila fora de
ordem, e o operador sem achar o que acabou de abrir.

## Objetivo

- Concluídas, variação e tempo médio do dashboard vêm do painel por período, **exatos** e em uma
  requisição, sem "média de 100 de N".
- A fila de atenção mostra a mais atrasada primeiro, de verdade, com o total exato.
- A tendência compara criadas e concluídas cada uma no seu dia.
- O quadro mostra, em A Fazer, a solicitação mais recente primeiro.
- Com o backend v1.5.0 em produção (sem o painel), tudo continua funcionando como na spec 013.

## Fora de escopo

- Indicadores de gestão novos (prazo cumprido, gargalo, por máquina): `#150`, dependem das
  issues `rgm-backend#119`, `#120` e `#121`.
- Distribuição por tipo e por prioridade em uma requisição: depende de `rgm-backend#127`. Esta
  spec **mantém como está** as contagens por valor da distribuição e declara isso.
- Melhorias visuais do card e do quadro (`#129`, depende de `rgm-backend#128`), seleção com
  busca na triagem (`#132`, depende de `rgm-backend#129`), limpeza e nova versão (`#151`).
- Erro **por campo** vindo da API e mensagens sem dicionário (`rgm-backend#130`): o retorno do
  sistema desta spec trata erro de ação junto do botão, não por campo.
- Qualquer mudança no backend.

> **Ampliação (2026-10-10):** a pedido do usuário, a spec inclui também o **login** (`#131`) e o
> **retorno do sistema** (`#126`, a parte que não depende do backend), porque são correções só
> de front e vão no mesmo PR. As fases 1 a 3 (painel, fila e quadro) já estavam implementadas
> quando a ampliação foi escrita.
- Nova tela ou novo filtro de período: o seletor de 7, 30 e 90 dias da spec 013 continua.

## Personas e cenários de uso

- **Gestor e administrador:** abrem o dashboard e querem o número de concluídas e o tempo médio
  do período certos, a mais atrasada na primeira linha da fila e a tendência verdadeira.
- **Operador:** abre o quadro e quer ver, no topo de A Fazer, o que acabou de abrir.
- **Quem publica:** precisa subir o front antes do back, e o painel não pode quebrar nesse
  intervalo.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | "Concluídas no período" e sua variação contra o período anterior vêm do painel por período, sem amostragem | obrigatório |
| RF-02 | O tempo médio de resolução vem do painel em segundos e é mostrado como tempo legível; o texto "média de 100 de N" deixa de existir | obrigatório |
| RF-03 | A tendência mostra criadas e concluídas por dia (por semana acima de 30 dias), cada uma pela sua data | obrigatório |
| RF-04 | A fila de atenção pede à API as atrasadas em aberto ordenadas pelo prazo, e mostra o total exato, sem corte em 100 | obrigatório |
| RF-05 | A coluna A Fazer do quadro mostra a solicitação criada mais recentemente primeiro | obrigatório |
| RF-06 | Em Andamento e Em Validação mostram o prazo mais vencido primeiro; A Fazer e essas duas dizem no cabeçalho em que ordem estão; Concluída e Cancelada ficam como hoje (sem ordenação nova e sem texto novo) | obrigatório |
| RF-07 | Se o painel não existir no backend (resposta "não encontrado"), os indicadores do dashboard funcionam como na spec 013 | obrigatório |
| RF-08 | Se o painel falhar por outro motivo (erro do servidor ou rede), o bloco mostra o erro com "Tentar novamente", sem trocar de fonte em silêncio | obrigatório |
| RF-09 | Com o backend antigo, o parâmetro de ordenação não quebra o quadro nem a fila: a lista aparece, na ordem antiga | obrigatório |
| RF-10 | A aba Solicitações do dashboard faz menos requisições de dados que na spec 013 | obrigatório |
| RF-11 | O operador não aciona o painel por período nem recebe 403 por causa dele | obrigatório |
| RF-12 | A distribuição por tipo e por prioridade continua com as contagens por valor, e a spec registra o motivo | obrigatório |
| RF-13 | O nome do produto é "Rei Auto Parts" no login, no título da aba, no texto alternativo do logo e na identificação do layout | obrigatório |
| RF-14 | O campo de e-mail do login usa um exemplo neutro, recebe o foco ao abrir a tela e pede o teclado de e-mail | obrigatório |
| RF-15 | O login permite mostrar e ocultar a senha digitada, com nome acessível e estado anunciado | obrigatório |
| RF-16 | O login tem um título e um subtítulo discreto e segue o tema claro ou escuro | obrigatório |
| RF-17 | O login diz com mensagens diferentes: credencial inválida, excesso de tentativas e falta de conexão | obrigatório |
| RF-18 | Telas que carregam dados mostram um esqueleto com a forma do conteúdo e anunciam o carregamento a leitores de tela | obrigatório |
| RF-19 | Toda tela de erro de carregamento oferece "Tentar novamente" sem recarregar a página e é anunciada como alerta | obrigatório |
| RF-20 | O estado vazio tem ícone e, quando faz sentido, uma ação | obrigatório |
| RF-21 | Triar, comentar, anexar, salvar edição e criar usuário confirmam o sucesso com um aviso temporário que some sozinho em 4 segundos e é anunciado com cortesia | obrigatório |
| RF-22 | O erro de uma ação aparece junto do formulário ou botão que falhou e não some sozinho | obrigatório |
| RF-23 | Animações novas respeitam a preferência do sistema por menos movimento | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Requisições de dados ao abrir a aba Solicitações do gestor | ≤ 3 (hoje 5: indicadores gerais, fila, concluídas atual e anterior, histórico) |
| RNF-02 | Cobertura dos arquivos tocados | ≥ 95% de linhas por arquivo (Princípio 10) |
| RNF-03 | Compatibilidade com o backend v1.5.0 (Princípio 9) | 100% dos cenários do dashboard e do quadro passam com o painel respondendo 404 e `sort` ignorado |
| RNF-04 | Verificação | `make validate` com 0 falhas, 0 erros de lint e de tipos; e2e inteiro contra o backend de `develop` |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Dashboard sobre o painel por período e quadro ordenado

  Cenário: Concluídas e tempo médio exatos acima de 100
    Dado que o período tem 140 solicitações concluídas e 120 no período anterior
    Quando o gestor abre a aba Solicitações
    Então vê 140 concluídas com a variação contra 120
    E o tempo médio é mostrado como tempo legível
    Mas não vê o texto "média de 100 de"

  Cenário: Tempo médio curto não vira zero
    Dado que as concluídas do período levaram 30 minutos em média
    Quando o gestor abre a aba Solicitações
    Então o tempo médio mostra 30 min
    Mas não mostra 0 h

  Cenário: Tendência pelo dia de cada evento
    Dado uma solicitação criada há 20 dias e concluída ontem
    Quando o gestor vê a tendência dos últimos 7 dias
    Então ela conta como concluída ontem
    E não conta como criada nos 7 dias

  Cenário: Fila com a mais atrasada primeiro
    Dado 123 solicitações atrasadas em aberto
    Quando o gestor abre o dashboard
    Então a primeira da fila é a de prazo mais vencido entre as 123
    E o total mostrado é 123
    Mas não existe corte em 100

  Cenário: Recém-aberta no topo de A Fazer
    Dado que o operador tem 25 solicitações em A Fazer e abre uma nova
    Quando o quadro carrega
    Então a nova aparece no primeiro bloco de A Fazer

  Cenário: Backend sem o painel
    Dado que o backend responde "não encontrado" ao painel por período
    Quando o gestor abre a aba Solicitações
    Então os indicadores aparecem como na spec 013
    E nenhuma mensagem de erro é mostrada

  Cenário: Painel com falha do servidor
    Dado que o painel responde erro do servidor
    Quando o gestor abre a aba Solicitações
    Então o bloco de indicadores mostra o erro e "Tentar novamente"
    Mas não troca de fonte em silêncio

  Cenário: Backend antigo ignora a ordenação
    Dado que o backend ignora o parâmetro de ordenação
    Quando o operador abre o quadro
    Então as solicitações aparecem na ordem antiga
    E o quadro não mostra erro

  Cenário: Operador não aciona o painel
    Dado que estou autenticado como operador
    Quando abro o dashboard
    Então nenhuma requisição ao painel por período é feita

  Cenário: Nome do produto único
    Dado que abro a tela de login
    Então vejo "Rei Auto Parts" como título
    E o título da aba também diz "Rei Auto Parts"
    Mas não vejo "RGM Auto Parts" em lugar nenhum da tela

  Cenário: Mostrar a senha
    Dado que digitei uma senha no login
    Quando aciono "Mostrar senha"
    Então o campo mostra o texto digitado
    E o botão passa a dizer "Ocultar senha"

  Cenário: Mensagem por tipo de falha no login
    Dado o login com credencial inválida, com excesso de tentativas e sem conexão
    Quando tento entrar em cada caso
    Então vejo "E-mail ou senha inválidos.", "Muitas tentativas. Tente de novo em 1 minuto." e "Sem conexão com o servidor. Verifique sua rede e tente de novo."
    Mas nunca a mesma frase nos três casos

  Cenário: Carregando com esqueleto
    Dado que o quadro ainda carrega
    Quando a tela aparece
    Então vejo cartões de esqueleto no lugar das colunas
    E o leitor de tela anuncia que está carregando

  Cenário: Erro de carregamento com nova tentativa
    Dado que a lista de solicitações falhou ao carregar
    Quando vejo o erro
    Então existe o botão "Tentar novamente"
    E ao acioná-lo a consulta é refeita sem recarregar a página

  Cenário: Confirmação de sucesso
    Dado que triei uma solicitação com sucesso
    Quando o diálogo fecha
    Então vejo o aviso "Solicitação triada" por 4 segundos
    E o aviso desaparece sozinho

  Cenário: Erro de ação junto do botão
    Dado que comentar uma solicitação falhou
    Quando vejo o resultado
    Então a mensagem de erro está junto do formulário do comentário
    E ela não some sozinha
```

## Ambiguidades

Nenhuma ambiguidade aberta (ver Esclarecimentos).

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Ordenação do quadro: pela API ou só no front? (#142) | Pela API (opção 1 da #142), `sort` e `dir` | 2026-10-10 |
| Ordem de cada coluna (RF-06) | A Fazer: criada mais recente primeiro. Em Andamento e Em Validação: prazo mais vencido primeiro. Concluída e Cancelada: **não ordenar** (a API só ordena por criação, não por conclusão); ficam como hoje | 2026-10-10 |
| Revisão do checklist `requisitos.md` | Lacunas aceitas como no plano: texto do cabeçalho por coluna; tendência passa a "criadas e concluídas"; total exato da fila no contador; falha de rede tratada como erro; o 404 do painel é simulado pelo e2e | 2026-10-10 |
| A coluna diz a ordem? (RF-06) | Sim, texto curto no cabeçalho, ao lado do aviso "Últimos 30 dias" que já existe | 2026-10-10 |
| Quando usar o plano antigo da spec 013? (RF-07, RF-08) | Só quando o painel responde "não encontrado"; qualquer outro erro mostra o erro com "Tentar novamente" | 2026-10-10 |
| Distribuição por tipo e prioridade (RF-12) | Fica como está; backend `rgm-backend#127` aberto para resolver | 2026-10-10 |
| Escopo da spec | Inclui o login (#131) e o retorno do sistema (#126, parte sem backend), por serem só de front | 2026-10-10 |
| Nome do produto (RF-13) | "Rei Auto Parts", em todo o sistema (login, título da aba, texto alternativo do logo, identificação do layout) | 2026-10-10 |

## Métricas de sucesso

- Em produção, nenhum "média de 100 de N" na tela e a fila com a mais atrasada primeiro.
- O gestor abre a aba Solicitações com 3 requisições de dados ou menos.
- O operador encontra a solicitação recém-aberta no topo de A Fazer sem usar "Carregar mais".
