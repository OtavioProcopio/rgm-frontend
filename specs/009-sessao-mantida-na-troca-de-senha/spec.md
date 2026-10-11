# Especificação — Sessão mantida na troca de senha e quadro do operador com o que ele abriu

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#136 e #122, as duas de prioridade alta. As duas existem
por causa do mesmo PR do backend, OtavioProcopio/rgm-backend#112 (mesclado em `develop` em
2026-10-07), que mudou a regra de sessão na troca de senha e a regra do que o operador vê.
O usuário pediu as duas numa especificação só, em 2026-10-07.

## Problema

O backend em `develop` mudou dois comportamentos e o frontend ainda age como antes. São duas
partes:

### Sessão mantida na troca de senha (OtavioProcopio/rgm-frontend#136)

1. Trocar a senha passou a invalidar toda credencial de acesso e de renovação emitida antes
   para o usuário (OtavioProcopio/rgm-backend#98). Para a sessão que fez a troca não cair
   junto, a resposta da troca da própria senha passou a trazer credenciais novas.
2. O frontend ignora essas credenciais e segue com as antigas. Quem troca a própria senha vê
   "Senha alterada com sucesso!" e, na ação seguinte, é mandado para a tela de entrada.
3. Na troca, a API também encerra as conexões de tempo real do usuário. Com as credenciais
   antigas guardadas, a tela não consegue reabrir a conexão.

Uma mensagem de sucesso seguida de expulsão parece defeito, e o usuário não tem como saber
se a senha foi trocada ou não.

**Objetivo:** quem troca a própria senha continua na aplicação, na mesma tela, com o tempo
real funcionando.

### Quadro do operador com o que ele abriu (OtavioProcopio/rgm-frontend#122)

1. O operador passou a receber da API as solicitações que abriu, além das atribuídas a ele
   (OtavioProcopio/rgm-backend#96). Antes, só as atribuídas.
2. O quadro vazio do operador ainda diz "Nenhuma solicitação atribuída a você" e explica que
   elas aparecerão quando forem atribuídas. O texto descreve a regra antiga e não oferece o
   que o operador pode fazer: abrir uma solicitação.
3. O quadro agora mistura dois tipos de card para o operador, os que ele abriu e os que
   estão com ele, e nada no card diz qual é qual. Só no segundo caso ele tem trabalho a
   fazer.
4. Na aba pessoal, "abertas por mim" e as contagens de concluídas e canceladas abertas por
   ele eram montadas com o que a API devolvia, ou seja, só com as que também estavam
   atribuídas a ele. Com a regra nova os números mudam; ninguém conferiu a tela com ela.

**Objetivo:** o operador encontra no quadro o que abriu e o que recebeu, sabe a diferença
olhando o card, e a aba pessoal conta tudo o que ele abriu.

## Objetivo

O frontend acompanha as duas regras novas do backend: trocar a senha não derruba quem
trocou, e o operador enxerga e distingue as solicitações que abriu e as que recebeu.

## Fora de escopo

- Mudar a API. As duas regras já estão no backend (OtavioProcopio/rgm-backend#112).
- Mudar onde as credenciais ficam guardadas e como o tempo real se autentica
  (OtavioProcopio/rgm-backend#93).
- Avisar as outras sessões do mesmo usuário de que a senha mudou: elas continuam indo para a
  tela de entrada na ação seguinte, como já acontece com sessão expirada.
- Redefinição de senha feita pelo administrador para outro usuário: a sessão de quem teve a
  senha redefinida cai, e é para cair.
- Mensagens de erro da troca de senha (hoje todo erro 400 aparece como "Senha atual
  incorreta").
- Redesenho do card: responsáveis, modelo e card inteiro clicável ficam com
  OtavioProcopio/rgm-frontend#129.
- Estados de carregamento, vazio e erro das outras telas (#126).
- Paginação do quadro e da aba pessoal (#114, especificação 005).
- Mudar o que gestor e administrador veem no quadro.

## Personas e cenários de uso

- **Qualquer usuário que faz login** troca a própria senha na tela de perfil e continua
  trabalhando.
- **Operador** abre uma solicitação, volta ao quadro e quer vê-la lá antes de alguém triar;
  ao longo do dia, quer separar de relance o que é trabalho dele do que ele só acompanha.
- **Operador novo**, sem nenhuma solicitação, abre o quadro pela primeira vez.

## Requisitos funcionais

### Sessão mantida na troca de senha

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Depois de trocar a própria senha com sucesso, a aplicação deve passar a usar as credenciais de acesso e de renovação devolvidas pela API, no lugar das anteriores | obrigatório |
| RF-02 | Depois de trocar a própria senha com sucesso, o usuário deve continuar na tela de perfil, com a mensagem de sucesso, e a ação seguinte dele não deve levá-lo à tela de entrada | obrigatório |
| RF-03 | Assim que guarda as credenciais novas, a aplicação deve reabrir a conexão de tempo real com elas, sem esperar a queda ser percebida e sem o usuário recarregar a página | obrigatório |
| RF-04 | Se a resposta da troca não trouxer credenciais novas (backend v1.5.0), a aplicação deve manter as credenciais que já tinha e mostrar o sucesso normalmente | obrigatório |
| RF-05 | Se a troca falhar, as credenciais guardadas não devem mudar | obrigatório |

### Quadro do operador

| ID | Requisito | Prioridade |
|---|---|---|
| RF-06 | Para o operador sem nenhuma solicitação aberta por ele nem atribuída a ele, o quadro deve dizer "Você ainda não abriu nem recebeu solicitações" e oferecer a ação "Nova solicitação", que leva à abertura de solicitação | obrigatório |
| RF-07 | Para o operador, cada card do quadro deve indicar a relação dele com a solicitação: "Atribuída a você" quando ele é responsável por ela, tenha aberto ou não; "Aberta por você" quando ele abriu e não é responsável. Uma marca só por card | obrigatório |
| RF-08 | A marca de RF-07 não deve aparecer para gestor e administrador | obrigatório |
| RF-09 | A solicitação que o operador acabou de abrir deve aparecer no quadro dele, em "A Fazer", quando ele volta ao quadro, sem recarregar a página | obrigatório |
| RF-10 | Na aba pessoal do operador, "abertas por mim" deve listar toda solicitação em aberto que ele abriu, atribuída a ele ou não | obrigatório |
| RF-11 | Na aba pessoal do operador, as contagens de concluídas e de canceladas abertas por ele devem considerar toda solicitação que ele abriu, atribuída a ele ou não | obrigatório |
| RF-12 | Quando o filtro de modelo ou de período do quadro não encontra nenhuma solicitação para o operador, o quadro deve dizer "Nenhuma solicitação para este filtro" e oferecer a ação "Limpar filtro"; o texto de RF-06 só aparece sem filtro aplicado | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Continuidade da sessão | 0 idas à tela de entrada nas 10 ações seguintes a uma troca de senha bem-sucedida |
| RNF-02 | Retorno do tempo real depois da troca | conexão restabelecida em até 3 segundos, sem recarregar a página e sem exibir o aviso de "sem atualização automática" |
| RNF-03 | Cobertura | no mínimo 95% de linha em cada arquivo alterado |
| RNF-04 | Dependências | 0 dependências novas |
| RNF-05 | Ordem de publicação | o texto de RF-06 e as marcas de RF-07 só são verdadeiros com o backend que contém OtavioProcopio/rgm-backend#112; os dois são publicados juntos na v1.6.0, backend antes (mesma ordem já decidida para a especificação 005) |
| RNF-06 | Regra de relação num lugar só | 1 definição de "aberta por você" e "atribuída a você", usada pelo card |

## Critérios de aceite

Escritos em DADO / QUANDO / ENTÃO / MAS. Cada critério vira um cenário em
`app/tests/bdd/` sem tradução no meio.

```gherkin
# language: pt
Funcionalidade: Sessão mantida na troca de senha e quadro do operador com o que ele abriu

  # Sessão mantida na troca de senha

  Cenário: Troca de senha guarda as credenciais novas
    Dado que estou na tela de perfil com a sessão ativa
    Quando troco a minha senha e a API responde com credenciais novas
    Então a aplicação passa a usar as credenciais novas de acesso e de renovação
    Mas não usa mais as credenciais anteriores

  Cenário: Quem troca a senha continua na aplicação
    Dado que troquei a minha senha com sucesso
    E vejo "Senha alterada com sucesso!" na tela de perfil
    Quando abro o quadro
    Então vejo o quadro
    Mas não sou levado à tela de entrada

  Cenário: Tempo real volta depois da troca
    Dado que troquei a minha senha com sucesso
    E a API encerrou a minha conexão de tempo real
    Quando outro usuário move uma solicitação
    Então o quadro mostra a solicitação na coluna nova sem eu recarregar a página
    Mas não vejo o aviso de que a tela está sem atualização automática

  Cenário: Backend sem credenciais na resposta
    Dado que a API responde à troca de senha sem credenciais novas
    Quando troco a minha senha
    Então vejo "Senha alterada com sucesso!"
    E a aplicação continua usando as credenciais que já tinha

  Cenário: Troca recusada não mexe na sessão
    Dado que estou na tela de perfil com a sessão ativa
    Quando tento trocar a senha e a API recusa
    Então vejo a mensagem de erro
    E a aplicação continua usando as credenciais que já tinha

  # Quadro do operador

  Cenário: Operador sem nenhuma solicitação
    Dado que sou operador e não abri nem recebi nenhuma solicitação
    Quando abro o quadro
    Então vejo "Você ainda não abriu nem recebeu solicitações"
    E vejo a ação "Nova solicitação"
    Mas não vejo "Nenhuma solicitação atribuída a você"

  Cenário: Ação do quadro vazio leva à abertura
    Dado que sou operador e vejo o quadro vazio
    Quando aciono "Nova solicitação"
    Então estou na tela de abertura de solicitação

  Cenário: Solicitação recém-aberta aparece no quadro
    Dado que sou operador
    Quando abro uma solicitação e volto ao quadro
    Então a solicitação está na coluna "A Fazer"

  Cenário: Card de solicitação que abri
    Dado que sou operador e abri uma solicitação que não está atribuída a mim
    Quando abro o quadro
    Então o card dela mostra "Aberta por você"
    Mas não mostra "Atribuída a você"

  Cenário: Card de solicitação que recebi
    Dado que sou operador e sou responsável por uma solicitação aberta por outra pessoa
    Quando abro o quadro
    Então o card dela mostra "Atribuída a você"
    Mas não mostra "Aberta por você"

  Cenário: Card de solicitação que abri e recebi
    Dado que sou operador, abri uma solicitação e sou responsável por ela
    Quando abro o quadro
    Então o card dela mostra "Atribuída a você"
    Mas não mostra "Aberta por você"

  Cenário: Filtro sem resultado para o operador
    Dado que sou operador e tenho solicitações no quadro
    Quando filtro por um modelo que não tem nenhuma solicitação minha
    Então vejo "Nenhuma solicitação para este filtro"
    E vejo a ação "Limpar filtro"
    Mas não vejo "Você ainda não abriu nem recebeu solicitações"

  Cenário: Limpar o filtro devolve o quadro
    Dado que sou operador e vejo "Nenhuma solicitação para este filtro"
    Quando aciono "Limpar filtro"
    Então vejo as minhas solicitações no quadro

  Cenário: Gestor não vê a marca de relação
    Dado que sou gestor e abri uma solicitação
    Quando abro o quadro
    Então o card dela não mostra "Aberta por você" nem "Atribuída a você"

  Cenário: Aba pessoal conta tudo o que o operador abriu
    Dado que sou operador e abri 3 solicitações em aberto, das quais 1 está atribuída a mim
    E abri 2 solicitações já concluídas, nenhuma atribuída a mim
    Quando abro a aba pessoal
    Então "abertas por mim" lista as 3 solicitações em aberto
    E o indicador "Abertas por mim" mostra 3
```

## Ambiguidades

Nenhuma em aberto; as respostas estão em **Esclarecimentos**.

Já decidido, sem pergunta:

- **Ordem de publicação (RNF-05):** segue a decisão registrada na especificação 005 em
  2026-10-05, de publicar backend e frontend juntos na v1.6.0, backend antes.
- **Onde a marca aparece:** só no card do quadro, como diz a issue. Na aba pessoal as duas
  listas já separam o que o operador abriu do que está com ele.
- **Cenário da aba pessoal, corrigido em 2026-10-07 durante a implementação:** a tela não
  exibe a contagem de concluídas abertas pelo operador; ela a usa para calcular o indicador
  "Abertas por mim" (tudo o que ele abriu menos concluídas e canceladas). O cenário passou
  a conferir o indicador, que é o que se vê.
- **Aba pessoal (RF-10, RF-11):** a issue pede para conferir com dados reais. Os requisitos
  dizem o resultado esperado; se a tela já chega nele só com a mudança do backend, a
  entrega é o teste que prova, sem mudança de código.

## Métricas de sucesso

- Nenhum relato de "troquei a senha e fui deslogado" depois da v1.6.0.
- O operador encontra no quadro a solicitação que acabou de abrir, sem perguntar ao gestor
  se ela foi registrada.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| RF-07: operador abriu a solicitação e também é responsável; o card mostra as duas marcas? | Só "Atribuída a você" | 2026-10-07 |
| RF-12: filtro do quadro sem resultado para o operador mostra o quê? | Mensagem própria do filtro, com ação de limpar | 2026-10-07 |
| RF-03: como o tempo real volta depois da troca de senha? | Reconectar na hora, ao guardar as credenciais novas | 2026-10-07 |
