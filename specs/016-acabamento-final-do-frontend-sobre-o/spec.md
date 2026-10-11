# Especificação — Acabamento final do frontend sobre o backend v1.6

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: issues `rgm-frontend#150` (indicadores de gestão), `#142` (colunas encerradas),
`#129` (card do quadro), `#132` (triagem com busca), `#156` (tipos de modelo) e `#151`
(limpeza e nova versão), mais dois pontos que o backend entregou e o front ainda não usa:
a busca textual na lista de solicitações e os PDFs que seguem a tela. Base: `develop` do front
com a spec 015 e `develop` do backend com as specs 011, 012 e 013 mergeadas
(`rgm-backend` PRs #126, #136, #137 e #138). Os comportamentos "hoje" foram lidos no código de
`develop` do front e conferidos contra o backend rodando.

## Problema

O backend v1.6 já entrega o que faltava, e o frontend ainda trabalha como se não entregasse:

1. **O dashboard não diz se o prazo está sendo cumprido (#150).** Mostra quantas solicitações
   existem e quantas estão atrasadas, mas não a taxa de prazo cumprido, onde o tempo se perde
   (fila, execução, validação), quanto trabalho volta, nem qual máquina, modelo ou pessoa
   concentra o problema. O backend agora entrega tudo isso em uma requisição.
2. **A distribuição por tipo e por prioridade custa 8 requisições** (uma por valor, `size=1`),
   embora o backend já devolva as duas contagens junto das métricas.
3. **O card do quadro não responde "de quem é?" nem "de qual modelo?" (#129).** Só o pequeno
   link "Ver" abre a solicitação, e no celular a faixa mostra 3 das 5 colunas sem avisar.
4. **As colunas Concluída e Cancelada não têm ordem útil (#142).** O backend ordena por data de
   encerramento; o quadro as mostra por criação.
5. **A triagem e a troca de responsáveis listam todos como caixas (#132)**, e a lista vem só dos
   100 primeiros usuários: quem passa do centésimo não aparece.
6. **O tipo do modelo é fixo no código (#156).** O administrador cadastra máquinas, mas não tipos.
7. **Achar uma solicitação exige navegar** (701 em `develop`), embora a listagem aceite busca.
8. **O PDF não é o que está na tela.** O botão exportar não repassa a busca nem a ordem, e o PDF
   da lista não diz quais filtros foram usados.
9. **O repositório carrega resto (#151):** 51 arquivos fora do padrão de formatação, código sem
   uso e dívida registrada na revisão da spec 013.

**Custo de não resolver:** o gestor decide sem os números que o backend já calcula, o quadro
continua escondendo o que importa, e a nova versão em produção sai com tela faltando.

## Entrega em fases

1. **Limpeza e formatação** (RF-34 a RF-37): formatação em commit só dela, código sem uso, dívida do review.
2. **Quadro e triagem** (RF-13 a RF-22).
3. **Tipos de modelo, busca e PDFs** (RF-23 a RF-33).
4. **Dashboard de gestão** (RF-01 a RF-12).

Cada fase é um PR e passa por `make validate` e e2e antes do merge.

## Objetivo

- O dashboard responde, em linguagem simples, "estamos cumprindo o prazo?", "onde o tempo se
  perde?", "o que volta?" e "quem e o quê concentra o problema?", cada resposta com leitura.
- O quadro mostra em cada card o modelo, a máquina, os responsáveis, a prioridade e o prazo, e o
  card inteiro abre a solicitação; no celular as cinco colunas são alcançáveis.
- A triagem e a troca de responsáveis escolhem por busca entre todos os atribuíveis e mostram o
  prazo de cada prioridade.
- O administrador gerencia os tipos de modelo e o formulário do modelo usa o catálogo.
- A lista de solicitações tem busca, e todo PDF exportado é o que a tela mostrava.
- O repositório fica formatado e sem código sem uso, pronto para a nova versão.

## Ordem de publicação

Hoje os **dois** estão em produção na v1.5.0. As telas desta spec dependem de rotas e campos que
só existem no backend v1.6.0 (indicadores de gestão, tipos de modelo, busca `q`, responsáveis
disponíveis, `sort=concluidaEm`, contagens por tipo e prioridade). Por isso o backend v1.6.0 e
este front são publicados **juntos, com o backend primeiro no mesmo deploy**, e esta spec **não**
traz comportamento de reserva para a v1.5.0 (ao contrário da spec 015). Publicar este front
contra a v1.5.0 não é suportado.

## Fora de escopo

- Qualquer mudança no backend, inclusive comparação com o período anterior nos indicadores de
  gestão (o endpoint traz só o período atual).
- Métricas de operação no Micrometer (`rgm-backend#123`), usuário desativado com solicitações sem
  responsável (`#104`), erros com código estável (`#130`), busca de usuários na administração
  (`#134`) e limite de upload por tipo (`#135`).
- PDF de uma solicitação isolada (não existe no backend).
- Filtro por tipo na lista de modelos (a tela e o backend não têm).
- Renomear em massa os testes antigos além do que a dívida da #151 lista.
- Implantar a versão em produção: o deploy é do usuário; esta spec deixa o repositório pronto.

## Personas e cenários de uso

- **Gestor:** abre o dashboard e vê, dos últimos 30 dias, quanto do trabalho saiu no prazo, em que
  etapa o tempo se perde e qual máquina concentra atraso; clica numa máquina e cai na lista já
  filtrada.
- **Gestor no quadro:** olha o card e sabe de quem é, de qual modelo e quando vence, sem abrir.
- **Gestor triando:** digita parte do nome, toca uma vez e escolhe a prioridade vendo o prazo.
- **Administrador:** cadastra "Aço inox" como tipo e o usa num modelo.
- **Qualquer perfil na lista:** busca "correia", ordena, exporta e recebe o PDF igual à tela.
- **Operador:** vê o quadro com cards clicáveis; não vê indicadores de gestão nem a tela de tipos.

## Requisitos funcionais

### Dashboard de gestão (#150)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Gestor e administrador veem, no dashboard, um bloco de **prazo cumprido** do período escolhido (7, 30 ou 90 dias): porcentagem das concluídas dentro do prazo, quantas foram, quantas ficaram fora da conta por não terem prioridade, e a porcentagem por prioridade | obrigatório |
| RF-02 | O bloco de prazo cumprido traz leitura (cor, ícone e texto) por meta fixa: verde com 90% ou mais, atenção de 75% a 89%, vermelho abaixo de 75%; sem concluídas no período o bloco diz que não há base, em vez de mostrar um número | obrigatório |
| RF-03 | Um bloco de **tempo de resolução** mostra o caso típico (mediana) e o pior caso comum (p90), em horas ou dias, com a quantidade de concluídas que o sustentam | obrigatório |
| RF-04 | Um bloco de **idade do trabalho em aberto** mostra as três faixas (menos de 1 dia, 1 a 3 dias, mais de 3 dias) e quantas abertas não têm responsável, e cada número leva à lista de solicitações já filtrada | obrigatório |
| RF-05 | Um bloco de **onde o tempo se perde** mostra o tempo típico de cada etapa (espera até iniciar, execução, espera de validação) e diz em texto qual é a maior; etapa sem dado aparece como "sem dados", não como zero | obrigatório |
| RF-06 | O mesmo bloco mostra a taxa de devolução com os dois números que a compõem ("2 devolvidas de 12 enviadas para validação") | obrigatório |
| RF-07 | Um bloco por máquina lista abertas, em atraso e tempo médio; clicar na máquina abre a lista de solicitações filtrada por ela | obrigatório |
| RF-08 | Um bloco de modelos reincidentes lista os modelos com 3 ou mais reparos no período; clicar no modelo abre a lista filtrada por ele | obrigatório |
| RF-09 | Um bloco de carga por responsável lista as abertas de cada pessoa, com o nome, e avisa que a soma pode passar do total porque um pedido com dois responsáveis conta para os dois | obrigatório |
| RF-10 | Cada bloco novo tem carregamento, vazio e erro com "Tentar novamente"; a falha de um bloco não derruba os outros | obrigatório |
| RF-11 | Operador não vê os blocos de gestão e o front nem os pede | obrigatório |
| RF-12 | A distribuição do trabalho por tipo e por prioridade usa as contagens que o backend já devolve junto das métricas, em uma requisição, e os números batem com a distribuição por status | obrigatório |

### Quadro e card (#129 e #142)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-13 | O card mostra, nesta ordem: título (até 2 linhas); código e máquina do modelo; prioridade, prazo ("vence em 5 h" ou "atrasada há 2 d") e as iniciais dos responsáveis | obrigatório |
| RF-14 | Solicitação de criação ainda sem modelo mostra o código e a máquina informados na abertura | obrigatório |
| RF-15 | O card inteiro é o link para o detalhe; "avançar etapa" continua um botão separado, com rótulo da ação ("Triar", "Enviar para validação") e não abre o detalhe | obrigatório |
| RF-16 | No celular, as cinco colunas ficam visíveis como controle (rótulo curto e contagem) e o toque troca de coluna | obrigatório |
| RF-17 | As colunas Concluída e Cancelada mostram a encerrada mais recentemente primeiro; as demais mantêm a ordem da spec 015 | obrigatório |
| RF-18 | A data completa e o tipo detalhado saem do card (ficam no detalhe); o tipo permanece como ícone com rótulo curto | desejável |

### Triagem e responsáveis (#132)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-19 | A triagem e a troca de responsáveis escolhem por busca de nome com seleção múltipla, mostrando os escolhidos como etiquetas removíveis | obrigatório |
| RF-20 | A lista de candidatos vem da consulta de responsáveis disponíveis (paginada e com busca no servidor), então todo operador e gestor ativo é alcançável, mesmo passando de 100 usuários | obrigatório |
| RF-21 | A prioridade é escolhida em quatro opções lado a lado, cada uma com o prazo ("Urgente · 4 h", "Alta · 24 h", "Média · 3 dias", "Baixa · 7 dias"), visíveis antes de confirmar | obrigatório |
| RF-22 | A troca de responsáveis só é oferecida depois da triagem (em A Fazer o caminho é a triagem), de acordo com as ações permitidas que o backend devolve | obrigatório |

### Tipos de modelo (#156)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-23 | O administrador lista, cadastra, renomeia, ativa e desativa tipos de modelo, em tela espelhada na de máquinas, com link no painel do administrador | obrigatório |
| RF-24 | Gestor e operador não veem a tela nem o link | obrigatório |
| RF-25 | O campo tipo do formulário do modelo lista só os tipos ativos do catálogo, mais o tipo que o modelo já tem mesmo desativado | obrigatório |
| RF-26 | O tipo aparece com o nome amigável nos cinco tipos de origem e com o próprio nome nos tipos novos | obrigatório |
| RF-27 | Renomear um tipo mostra o novo nome nos modelos que o usavam, sem recarregar à mão | obrigatório |
| RF-28 | Sucesso e erro de cada ação seguem o padrão da spec 015 (aviso de sucesso, "Tentar novamente" no carregamento) | obrigatório |

### Busca e PDFs fiéis à tela

| ID | Requisito | Prioridade |
|---|---|---|
| RF-29 | A lista de solicitações tem um campo de busca textual (título, descrição e código do modelo), de 2 a 100 caracteres, que se soma aos filtros e à ordenação e some da URL ao limpar | obrigatório |
| RF-30 | Busca com menos de 2 caracteres não dispara consulta e diz por quê | obrigatório |
| RF-31 | O botão exportar da lista repassa filtros, busca e ordenação que a tela está usando, e o PDF recebido tem exatamente as linhas da tela | obrigatório |
| RF-32 | A exportação da lista de modelos repassa os filtros da tela, e a do ranking repassa a ordenação | obrigatório |
| RF-33 | Quando o PDF avisa que foi cortado (acima de 5000 linhas), a tela diz isso ao concluir a exportação | desejável |

### Limpeza e nova versão (#151)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-34 | Todos os arquivos passam pela formatação do projeto, em um commit só de formatação | obrigatório |
| RF-35 | Código sem uso levantado na #151 é removido (o que muda comportamento é conferido antes) | obrigatório |
| RF-36 | A dívida do review da spec 013 listada na #151 é tratada: nomes de teste sem a condição, regra de apresentação fora de `pages/`, direção das pastas e funções acima do limite nos arquivos tocados | obrigatório |
| RF-37 | A medição de tempo de carga (RNF-02 da 013) é refeita no build de produção, não no servidor de desenvolvimento | desejável |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Requisições do dashboard de gestão | Os blocos novos fazem 1 requisição de dados (a dos indicadores) além das já existentes; a distribuição passa de 8 para 0 requisições extras |
| RNF-02 | Tempo para o dashboard ficar utilizável | ≤ 3 s no build de produção, medido com os dados de `develop` (701 solicitações) |
| RNF-03 | Acessibilidade | Todo bloco novo com título, leitura em texto (não só cor), foco visível e alvo de toque ≥ 44 px; 0 violações nas verificações de acessibilidade existentes |
| RNF-04 | Cobertura | ≥ 95% de linhas por arquivo tocado (Princípio 10); `make validate` com 0 falhas |
| RNF-05 | Sem regressão visual de tema | Claro e escuro verificados nos blocos e telas novos; texto com contraste ≥ 4,5:1 |
| RNF-06 | Celular | Sem rolagem horizontal da página em 390 px nas telas tocadas |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Acabamento final do frontend

  Cenário: Prazo cumprido do período
    Dado 10 solicitações concluídas com prioridade nos últimos 30 dias, 8 dentro do prazo, e 2 sem prioridade
    Quando o gestor abre o dashboard com o período de 30 dias
    Então o bloco de prazo mostra 80% e "8 de 10"
    E informa que 2 concluídas ficaram fora da conta por não terem prioridade

  Cenário: Gargalo em texto
    Dado espera de 2 h, execução de 9 h e validação de 1 h
    Quando o gestor abre o dashboard
    Então o bloco de etapas diz que a execução é a etapa mais demorada

  Cenário: Etapa sem dados
    Dado nenhuma solicitação que passou pela validação no período
    Quando o gestor abre o dashboard
    Então a espera de validação aparece como "sem dados"
    Mas não aparece como zero

  Cenário: Devolução com os dois números
    Dado 12 enviadas para validação e 2 devolvidas
    Quando o gestor abre o dashboard
    Então o bloco mostra "2 devolvidas de 12 enviadas para validação"

  Cenário: Máquina leva à lista filtrada
    Dado a máquina FBOX com atrasos no bloco por máquina
    Quando o gestor clica em FBOX
    Então a lista de solicitações abre já filtrada pela máquina FBOX

  Cenário: Modelo reincidente leva à lista filtrada
    Dado um modelo reincidente
    Quando o gestor clica no modelo
    Então a lista abre filtrada por esse modelo

  Cenário: Carga por responsável explica a soma
    Dado uma solicitação com dois responsáveis
    Quando o gestor abre o bloco de carga
    Então ela conta para os dois, com o nome de cada um
    E o bloco avisa que a soma pode passar do total

  Cenário: Falha de um bloco não derruba os outros
    Dado que o endpoint de indicadores falha
    Quando o gestor abre o dashboard
    Então os blocos de gestão mostram o erro com "Tentar novamente"
    E a fila de atenção e as demais seções continuam visíveis

  Cenário: Operador não vê gestão
    Dado um operador autenticado
    Quando abre o dashboard
    Então os blocos de gestão não aparecem
    E nenhuma requisição de indicadores de gestão é feita

  Cenário: Distribuição em uma requisição
    Dado o dashboard aberto
    Quando o gestor alterna a distribuição entre status, tipo e prioridade
    Então nenhuma requisição extra por valor é feita
    E a soma de cada distribuição é o total em aberto

  Cenário: Card responde de quem e de qual modelo
    Dado uma solicitação de reparo do modelo MOD-9 da máquina FBOX, urgente, com dois responsáveis
    Quando o quadro é exibido
    Então o card mostra MOD-9 e FBOX, a prioridade, o prazo e as iniciais dos dois

  Cenário: Criação sem modelo no card
    Dado uma solicitação de criação com código COD-1 e máquina VICK informados na abertura
    Quando o quadro é exibido
    Então o card mostra COD-1 e VICK

  Cenário: Card inteiro abre o detalhe
    Dado um card no quadro
    Quando o usuário toca em qualquer ponto do card, menos no botão de avançar
    Então o detalhe da solicitação abre
    Mas tocar em "Triar" não abre o detalhe

  Cenário: Colunas no celular
    Dado a tela de 390 px
    Quando o quadro é exibido
    Então as cinco colunas estão acessíveis por um controle com rótulo curto e contagem

  Cenário: Encerradas mais recentes primeiro
    Dado concluídas em datas diferentes
    Quando o quadro é exibido
    Então a concluída mais recentemente aparece primeiro na coluna Concluída

  Cenário: Triagem por busca
    Dado 150 usuários atribuíveis e a triagem aberta
    Quando o gestor digita parte do nome do 140º usuário
    Então ele aparece e é escolhido com um toque

  Cenário: Prazo da prioridade antes de confirmar
    Dado a triagem aberta
    Quando o gestor olha as opções de prioridade
    Então cada uma mostra seu prazo antes de confirmar

  Cenário: Troca de responsáveis só depois da triagem
    Dado uma solicitação em A Fazer
    Quando o gestor abre as ações
    Então a ação de alterar responsáveis não é oferecida

  Cenário: Administrador gerencia tipos
    Dado um administrador autenticado
    Quando cadastra o tipo "Aço inox", o renomeia e depois o desativa
    Então cada ação mostra o aviso de sucesso e a lista reflete o estado

  Cenário: Tipo novo aparece no formulário do modelo
    Dado o tipo "Aço inox" cadastrado
    Quando o administrador abre o formulário de um modelo
    Então "Aço inox" está entre as opções

  Cenário: Tipo desativado continua no modelo que o tinha
    Dado um modelo com um tipo que foi desativado
    Quando o administrador abre o formulário desse modelo
    Então o tipo atual aparece selecionado
    Mas não aparece para os demais modelos

  Cenário: Gestor e operador não veem tipos
    Dado um gestor e um operador autenticados
    Quando abrem o painel do administrador
    Então não há link nem rota de tipos de modelo para eles

  Cenário: Busca na lista
    Dado solicitações com "correia" no título, na descrição e no código do modelo
    Quando o usuário busca "correia"
    Então a lista traz só essas
    E a busca se soma aos filtros e à ordenação

  Cenário: Busca curta demais
    Quando o usuário digita 1 caractere na busca
    Então nenhuma consulta é feita e a tela explica que são necessários 2 caracteres

  Cenário: PDF igual à tela
    Dado a lista filtrada por máquina, com busca "correia" e ordenada por prazo
    Quando o usuário exporta
    Então a requisição leva os mesmos filtros, a busca e a ordenação
    E o PDF tem as linhas da tela

  Cenário: Formatação e código sem uso
    Dado o repositório depois da limpeza
    Quando se roda a verificação de formatação e de arquivos sem uso listados na #151
    Então não há diferença nem arquivo listado
```

## Ambiguidades

Nenhuma aberta (ver Esclarecimentos).

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Como o prazo cumprido ganha leitura sem o período anterior? | Meta fixa de 90% (verde ≥ 90, atenção 75–89, vermelho < 75) | 2026-10-11 |
| Ordem de publicação | "Em produção ainda tá o 1.5.0 dos dois": o back v1.6.0 e este front saem juntos, back primeiro; sem reserva para a v1.5.0 (registrado como entendimento do redator, a confirmar) | 2026-10-11 |
| Como entregar | Em fases, 1 PR por fase: (1) limpeza e formatação, (2) quadro e triagem, (3) tipos, busca e PDFs, (4) dashboard de gestão | 2026-10-11 |

## Métricas de sucesso

- O gestor responde "estamos cumprindo o prazo?" olhando um bloco, sem abrir lista alguma.
- 0 requisições por valor na distribuição do dashboard.
- 0 cards sem modelo e responsável no quadro (exceto criação sem modelo, que mostra os dados da
  abertura).
- 0 arquivos reformatados por `make fmt` depois da limpeza.
