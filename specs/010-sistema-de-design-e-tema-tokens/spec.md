# Especificação — Sistema de design e tema: cores por papel, componentes base e tema que segue o sistema

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#116 e #128, as duas de prioridade média. O usuário pediu
as duas juntas, como uma especificação completa, em 2026-10-07, com o objetivo declarado de
melhorar a aparência do frontend. Esta é a primeira das especificações visuais; as outras
(#126, #127, #129 a #132) se apoiam no que ela entrega.

## Problema

A aparência do RGM foi construída tela a tela, sem um vocabulário comum de cor nem peças
compartilhadas. Medição de 2026-10-07 em `develop`:

### Cores sem papel definido (OtavioProcopio/rgm-frontend#116)

1. As cores são escritas direto em cada tela: **1.594 usos em 76 arquivos**, em **224
   combinações distintas**, de 15 famílias de cor. Não existe "a cor de borda" ou "a cor de
   texto secundário": existe o que cada tela escolheu.
2. A cor da marca e as superfícies do tema escuro foram aplicadas trocando o significado de
   cores genéricas, em vez de dar nome ao papel que elas cumprem. Quem lê uma tela não tem
   como saber que aquele azul é "a cor da marca".
3. Peças que se repetem não são compartilhadas: há **6 selos** (status, prioridade, perfil,
   situação de usuário, de modelo e de máquina), **31 molduras de cartão** e **5 tabelas**,
   cada um com o seu próprio acabamento.
4. Três sobreposições ainda são feitas à mão, fora do diálogo modal que as features 006 e
   007 criaram: a galeria de fotos do modelo, o carrossel da galeria e a foto de capa. Elas
   não prendem o foco nem fecham com Esc do mesmo jeito.
5. O nome que o usuário lê para cada valor da API (status, tipo, prioridade, perfil) é
   escrito em mais de um lugar. "Gestor" e "Operador" aparecem em três arquivos; os status
   têm cores definidas em cinco.

Mudar a identidade, ajustar o tema escuro ou garantir contraste hoje significa revisar 76
arquivos, e nada impede que a próxima tela invente a 225ª combinação.

**Objetivo:** cada cor da interface tem um papel com nome, definido num lugar só; as peças
que se repetem são uma só; e cada valor da API tem um rótulo só.

### Tema (OtavioProcopio/rgm-frontend#128)

1. Na primeira visita a aplicação força o tema escuro e ignora a preferência do sistema do
   usuário. Só há duas opções, claro e escuro.
2. No tema escuro o logo, que tem texto preto, quase desaparece sobre a barra lateral
   escura.
3. A tela de entrada mostra um cartão branco fixo sobre fundo escuro e, para isso, desfaz à
   mão as cores dos campos dentro do tema escuro.
4. Os cabeçalhos das cinco colunas do quadro usam cinco cores fortes (cinza, azul, âmbar,
   verde e vermelho) que competem com os selos de prioridade e de prazo, que são as cores
   que carregam informação.
5. Há texto abaixo do contraste mínimo: "Sem prioridade" em cinza claro sobre branco é o
   caso apontado na issue; não há medição do conjunto.
6. A cor que o navegador do celular usa na barra do topo é fixa e não acompanha o tema.

**Objetivo:** a aplicação abre no tema do sistema do usuário, deixa escolher entre três
opções, é legível nos dois temas e usa cor forte só onde ela significa algo.

## Objetivo

O RGM passa a ter um sistema de design mínimo: cores com papel, peças base compartilhadas e
um tema que respeita o usuário. As telas continuam as mesmas, com a mesma disposição, mas
passam a falar um vocabulário visual só, legível no claro e no escuro.

## Fora de escopo

- Mudar a disposição, o conteúdo ou a navegação de qualquer tela: barra de abas no celular
  e remoção de molduras (#127), conteúdo do card do quadro (#129), detalhe da solicitação
  (#130), tela de entrada além da cor (#131), triagem com busca (#132).
- Estados de carregamento, vazio, erro e sucesso (#126), além da cor que eles usam.
- Mudar a cor da marca ou criar identidade nova: o azul atual continua sendo a cor de
  destaque.
- Tipografia, espaçamento, raios e sombras como tokens: esta especificação trata de cor.
- Redesenhar o logo ou criar uma versão dele para fundo escuro.
- Tema por usuário guardado no servidor: a escolha continua guardada no navegador.
- Tabelas com ordenação, filtro ou paginação novas: a peça de tabela só unifica a aparência.
- Trocar os rótulos dos valores da API por outros textos: o dicionário reúne os que já
  existem.

## Personas e cenários de uso

- **Operador no chão de fábrica**, com o celular em modo claro por causa da luz do galpão,
  abre o RGM pela primeira vez e hoje recebe uma tela escura.
- **Gestor no escritório**, que usa o computador em modo escuro, olha o quadro o dia
  inteiro e precisa achar de relance o que está atrasado e o que é urgente.
- **Quem dá manutenção no frontend** precisa ajustar uma cor ou criar uma tela nova sem
  procurar em 76 arquivos qual é o cinza certo.

## Requisitos funcionais

### Cores por papel

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A interface deve ter um conjunto único de cores por papel, definido uma vez para o tema claro e uma vez para o escuro: fundo da aplicação, superfície, superfície elevada, borda, texto, texto secundário, destaque (marca), perigo, alerta, sucesso e informação | obrigatório |
| RF-02 | As peças base compartilhadas (botão, campo de texto, área de texto, seletor, seletor com busca, diálogo, confirmação, paginação, cabeçalho de página e os estados de carregamento, vazio e erro) devem usar somente as cores por papel | obrigatório |
| RF-03 | Todas as 16 telas e todos os componentes de cada área devem usar somente as cores por papel: nenhuma cor é escrita direto numa tela | obrigatório |
| RF-04 | Trocar o valor de uma cor por papel deve mudar essa cor em todos os lugares que a usam, nos dois temas, sem editar tela nenhuma | obrigatório |

### Peças base

| ID | Requisito | Prioridade |
|---|---|---|
| RF-05 | Deve existir uma única peça de selo, com as variações neutro, destaque, sucesso, alerta, perigo e informação; os seis selos atuais (status e prioridade da solicitação, perfil e situação do usuário, situação do modelo e da máquina) devem usá-la | obrigatório |
| RF-06 | Deve existir uma única peça de cartão (moldura com superfície, borda e canto), usada pelas molduras de cartão das telas | obrigatório |
| RF-07 | Deve existir uma única peça de tabela (cabeçalho, linhas, divisórias e rolagem horizontal em tela estreita), usada pelas cinco tabelas atuais | obrigatório |
| RF-08 | A galeria de fotos do modelo, o carrossel da galeria e a foto de capa ampliada devem abrir no mesmo diálogo modal das demais telas: foco preso dentro, Esc fecha, foco volta a quem abriu, e o resto da página fica inacessível enquanto aberto | obrigatório |
| RF-09 | Cada valor da API exibido ao usuário (status, tipo e prioridade da solicitação, perfil do usuário, tipo do modelo, tipo de evidência e tipo de atividade) deve ter um rótulo definido uma vez, usado por selos, filtros, formulários e textos | obrigatório |

### Tema

| ID | Requisito | Prioridade |
|---|---|---|
| RF-10 | O usuário deve poder escolher entre três opções de tema: Sistema, Claro e Escuro | obrigatório |
| RF-11 | Na primeira visita, sem escolha guardada, a opção deve ser Sistema: a aplicação usa o tema claro ou escuro conforme a preferência do sistema do usuário | obrigatório |
| RF-12 | Com a opção Sistema, quando o usuário muda a preferência do sistema com a aplicação aberta, a aplicação deve acompanhar sem recarregar | obrigatório |
| RF-13 | A opção escolhida deve valer nas visitas seguintes, no mesmo navegador | obrigatório |
| RF-14 | Quem já usou a aplicação e tem "escuro" guardado deve passar para a opção Sistema, uma única vez, na primeira visita depois desta entrega, porque o escuro foi imposto e não escolhido; quem tem "claro" guardado escolheu, e continua no claro | obrigatório |
| RF-15 | O controle de tema deve ser um botão no cabeçalho e na tela de entrada, onde está hoje, que abre um menu com as três opções e marca a ativa; deve funcionar por teclado e por leitor de tela, e o menu fecha com Esc e ao escolher | obrigatório |
| RF-16 | O tema deve estar aplicado antes de a primeira tela aparecer: o usuário não vê a tela no tema errado e depois a troca | obrigatório |
| RF-17 | O logo deve ser legível nos dois temas, na barra lateral e na tela de entrada: no tema escuro, o logo atual fica sobre uma placa clara | obrigatório |
| RF-18 | A tela de entrada deve seguir o tema escolhido: cartão, campos e textos no tema claro quando o tema é claro e no escuro quando é escuro | obrigatório |
| RF-19 | A cor da barra do navegador no celular deve acompanhar o tema em uso | desejável |

### Cor com significado

| ID | Requisito | Prioridade |
|---|---|---|
| RF-20 | Os cabeçalhos das colunas do quadro devem ser neutros, com a etapa identificada pelo nome e por um ponto de cor; as abas das colunas no celular seguem a mesma regra | obrigatório |
| RF-21 | Prioridade e prazo (atrasada, perto de vencer, no prazo) devem continuar com cor própria, e devem ser os elementos de maior destaque de cor no card | obrigatório |
| RF-22 | Além de prioridade e prazo, só o status mantém cor própria, pelos papéis: concluída é sucesso, cancelada é perigo, em validação é alerta, em andamento é informação e a fazer é neutro. O tipo da solicitação passa a selo neutro com ícone e texto. Os indicadores do painel ficam neutros, com cor só no ícone | obrigatório |
| RF-23 | Nenhuma informação deve ser transmitida só por cor: todo elemento colorido que informa algo tem também texto ou ícone | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Contraste de texto | no mínimo 4,5:1 para texto normal e 3:1 para texto grande (a partir de 24 px, ou 18,66 px em negrito), em 100% dos textos das 16 telas, nos dois temas |
| RNF-02 | Contraste de borda de campo, de ícone que informa e do contorno de foco | no mínimo 3:1 contra o fundo vizinho, nas 16 telas, nos dois temas |
| RNF-03 | Cores escritas fora do conjunto por papel | 0 usos em todo o código de produção; a contagem de 2026-10-07 é 1.594 em 76 arquivos |
| RNF-04 | Guarda contra regressão | 1 verificação automática que falha quando uma cor fora do conjunto por papel aparece em qualquer arquivo de produção |
| RNF-05 | Uma definição por papel | 1 valor por papel e por tema; 0 papéis definidos em mais de um lugar |
| RNF-06 | Um rótulo por valor da API | 1 definição para cada valor dos sete conjuntos de RF-09 |
| RNF-07 | Disposição preservada | 0 controles com mudança de posição ou de tamanho maior que 2 px, comparando antes e depois, nas 16 telas, em 1440 px e em 390 px, exceto os elementos de RF-15, RF-17, RF-18, RF-20 e RF-22 |
| RNF-08 | Área de toque e foco | 0 controles com menos de 44 px em 390 px com toque; contorno de foco visível em todo controle (critério das especificações 006 e 007 mantido) |
| RNF-09 | Tema sem piscar | 0 quadros com o tema errado no carregamento, medido em 5 carregamentos por tema |
| RNF-10 | Troca de tema | a tela inteira muda em até 200 ms depois da escolha, sem recarregar |
| RNF-11 | Cobertura | no mínimo 95% de linha em cada arquivo alterado que o projeto mede |
| RNF-12 | Dependências | 0 dependências novas |
| RNF-13 | Compatibilidade | funciona com a API v1.5.0 em produção; nenhuma mudança de contrato |

## Critérios de aceite

Escritos em DADO / QUANDO / ENTÃO / MAS. Cada critério vira um cenário em
`app/tests/bdd/` sem tradução no meio.

```gherkin
# language: pt
Funcionalidade: Sistema de design e tema

  # Cores por papel

  Cenário: Peça base usa cor por papel
    Dado uma tela com um botão principal, um campo de texto e um diálogo
    Quando o tema muda de claro para escuro
    Então o fundo, a borda e o texto das três peças mudam para os valores do tema escuro
    Mas nenhuma das três peças tem cor que não venha do conjunto por papel

  Cenário: Trocar o valor de um papel muda todos os usos
    Dado a cor de borda definida no conjunto por papel
    Quando o valor dela é trocado
    Então todo campo, cartão, tabela e divisória passa a usar o valor novo
    Mas nenhuma tela foi editada

  # Peças base

  Esquema do Cenário: Selos usam a mesma peça
    Dado um selo de <origem> com o valor "<valor>"
    Quando ele é exibido
    Então ele tem a forma do selo compartilhado, na variação <variacao>
    E mostra o texto "<rotulo>"

    Exemplos:
      | origem                  | valor        | variacao   | rotulo       |
      | status da solicitação   | CONCLUIDA    | sucesso    | Concluída    |
      | status da solicitação   | CANCELADA    | perigo     | Cancelada    |
      | prioridade              | URGENTE      | perigo     | Urgente      |
      | prioridade              | MEDIA        | informação | Média        |
      | situação do usuário     | inativo      | neutro     | Inativo      |
      | situação do modelo      | ativo        | sucesso    | Ativo        |

  Cenário: Tabela em tela estreita
    Dado a lista de usuários aberta em 390 px de largura
    Quando a tabela é mais larga que a tela
    Então a tabela rola na horizontal dentro da própria moldura
    Mas a página não ganha rolagem horizontal

  Cenário: Galeria de fotos abre como diálogo modal
    Dado a ficha de um modelo com fotos
    Quando abro a galeria completa
    Então o foco vai para dentro da galeria
    E Tab não sai da galeria
    E o resto da página fica inacessível

  Cenário: Esc fecha a foto ampliada e devolve o foco
    Dado uma foto da galeria ampliada
    Quando aperto Esc
    Então a foto ampliada fecha
    E o foco volta para a miniatura que a abriu

  Esquema do Cenário: Um rótulo por valor da API
    Dado o valor "<valor>" de <conjunto>
    Quando ele aparece no selo, no filtro e no formulário
    Então o texto é "<rotulo>" nos três

    Exemplos:
      | conjunto              | valor         | rotulo            |
      | status                | EM_VALIDACAO  | Em validação      |
      | tipo                  | CRIACAO       | Criação de modelo |
      | prioridade            | ALTA          | Alta              |
      | perfil                | GESTOR        | Gestor            |

  # Tema

  Esquema do Cenário: Primeira visita segue o sistema
    Dado que nunca abri a aplicação neste navegador
    E o meu sistema está em modo <sistema>
    Quando abro a aplicação
    Então vejo o tema <sistema>
    E a opção de tema ativa é "Sistema"

    Exemplos:
      | sistema |
      | claro   |
      | escuro  |

  Cenário: Sistema muda com a aplicação aberta
    Dado a opção de tema "Sistema" e o meu sistema em modo claro
    Quando mudo o sistema para modo escuro
    Então a aplicação passa ao tema escuro sem recarregar

  Cenário: Escolha explícita não segue o sistema
    Dado que escolhi o tema "Claro"
    Quando mudo o sistema para modo escuro
    Então a aplicação continua no tema claro

  Cenário: Escolha vale na visita seguinte
    Dado que escolhi o tema "Escuro"
    Quando fecho e abro a aplicação de novo
    Então vejo o tema escuro
    E a opção de tema ativa é "Escuro"

  Cenário: Tema certo desde a primeira tela
    Dado que escolhi o tema "Escuro"
    Quando recarrego a página
    Então a primeira tela já aparece no tema escuro
    Mas não aparece no tema claro em nenhum momento

  Cenário: Controle de tema por teclado
    Dado o foco no controle de tema
    Quando escolho "Claro" pelo teclado
    Então a aplicação passa ao tema claro
    E o controle informa "Claro" como a opção ativa

  Esquema do Cenário: Logo legível nos dois temas
    Dado o tema <tema>
    Quando vejo a <tela>
    Então o logo tem contraste de no mínimo 3:1 contra o fundo em volta

    Exemplos:
      | tema   | tela            |
      | claro  | barra lateral   |
      | escuro | barra lateral   |
      | claro  | tela de entrada |
      | escuro | tela de entrada |

  Esquema do Cenário: Tela de entrada segue o tema
    Dado o tema <tema>
    Quando abro a tela de entrada
    Então o cartão, os campos e os textos estão no tema <tema>

    Exemplos:
      | tema   |
      | claro  |
      | escuro |

  Cenário: Barra do navegador acompanha o tema
    Dado a aplicação aberta no celular com o tema claro
    Quando troco para o tema escuro
    Então a cor da barra do navegador passa a ser a do fundo do tema escuro

  # Cor com significado

  Cenário: Cabeçalhos das colunas são neutros
    Dado o quadro aberto
    Quando olho os cabeçalhos das cinco colunas
    Então os cinco têm o mesmo fundo neutro
    E cada um mostra o nome da etapa e um ponto de cor
    Mas nenhum cabeçalho tem fundo de cor forte

  Cenário: Prioridade e prazo são o destaque de cor do card
    Dado um card de prioridade "Urgente" e atrasado
    Quando olho o card
    Então o selo de prioridade e o selo de prazo têm cor própria
    E cada um deles tem texto que diz o que significa

  Cenário: Informação não depende só de cor
    Dado o quadro aberto em escala de cinza
    Quando olho um card atrasado e um card no prazo
    Então consigo distinguir os dois pelo texto dos selos

  # Contraste

  Esquema do Cenário: Texto legível
    Dado o tema <tema>
    Quando percorro as 16 telas
    Então nenhum texto normal tem contraste menor que 4,5:1
    E nenhum texto grande tem contraste menor que 3:1

    Exemplos:
      | tema   |
      | claro  |
      | escuro |

  Cenário: "Sem prioridade" legível
    Dado um card sem prioridade, no tema claro
    Quando olho o texto "Sem prioridade"
    Então o contraste dele contra o fundo do card é de no mínimo 4,5:1

  # Respostas do esclarecimento

  Cenário: Nenhuma tela escreve cor
    Dado todo o código de produção da interface
    Quando a verificação de cores é executada
    Então ela não encontra nenhuma cor fora do conjunto por papel

  Cenário: Cor nova fora do conjunto é barrada
    Dado uma tela que passa a usar uma cor escrita direto
    Quando a verificação de cores é executada
    Então ela falha e aponta o arquivo

  Cenário: Quem tinha o escuro imposto passa para Sistema
    Dado que usei a aplicação antes desta entrega e tenho "escuro" guardado
    E o meu sistema está em modo claro
    Quando abro a aplicação pela primeira vez depois da entrega
    Então vejo o tema claro
    E a opção de tema ativa é "Sistema"

  Cenário: A passagem para Sistema acontece uma vez só
    Dado que passei para "Sistema" na primeira visita depois da entrega
    E depois escolhi o tema "Escuro"
    Quando abro a aplicação de novo
    Então vejo o tema escuro
    E a opção de tema ativa é "Escuro"

  Cenário: Quem escolheu o claro continua no claro
    Dado que usei a aplicação antes desta entrega e tenho "claro" guardado
    E o meu sistema está em modo escuro
    Quando abro a aplicação pela primeira vez depois da entrega
    Então vejo o tema claro
    E a opção de tema ativa é "Claro"

  Cenário: Menu de tema mostra as três opções
    Dado a aplicação aberta com a opção de tema "Sistema"
    Quando aciono o botão de tema
    Então vejo as opções "Sistema", "Claro" e "Escuro"
    E "Sistema" está marcada como ativa

  Cenário: Menu de tema fecha com Esc
    Dado o menu de tema aberto
    Quando aperto Esc
    Então o menu fecha
    E o foco volta ao botão de tema

  Cenário: Logo sobre placa clara no tema escuro
    Dado o tema escuro
    Quando vejo a barra lateral
    Então o logo está sobre uma placa clara
    Mas no tema claro não há placa

  Esquema do Cenário: Status mantém cor pelo papel
    Dado uma solicitação com status "<status>"
    Quando vejo o selo de status
    Então ele está na variação <variacao>

    Exemplos:
      | status        | variacao   |
      | A fazer       | neutro     |
      | Em andamento  | informação |
      | Em validação  | alerta     |
      | Concluída     | sucesso    |
      | Cancelada     | perigo     |

  Esquema do Cenário: Tipo da solicitação é neutro
    Dado um card do tipo "<tipo>"
    Quando olho o selo de tipo
    Então ele está na variação neutro
    E mostra um ícone e o texto "<tipo>"

    Exemplos:
      | tipo              |
      | Reparo            |
      | Inspeção          |
      | Reengenharia      |
      | Criação de modelo |

  Cenário: Indicadores do painel são neutros
    Dado o painel aberto
    Quando olho os indicadores
    Então todos têm o mesmo fundo neutro
    E só o ícone de cada um tem cor
```

## Ambiguidades

Nenhuma em aberto; as respostas estão em **Esclarecimentos**.

Já decidido, sem pergunta:

- **Cor da marca:** o azul atual continua; a issue não pede identidade nova.
- **Papéis de cor (RF-01):** a lista vem das duas issues, somando "informação", que os
  selos de prioridade média e de status em andamento já usam hoje.
- **Peças base (RF-05 a RF-08):** a issue #116 lista diálogo modal, cartão, selo e tabela.
  O diálogo modal já existe desde a 006; aqui entram as três sobreposições que ficaram de
  fora.
- **Contraste (RNF-01, RNF-02):** os números são os do nível AA das diretrizes de
  acessibilidade para conteúdo web, que a issue #128 cita como 4,5:1.
- **16 telas:** as mesmas medidas na feature 007 (entrada, painel, lista e quadro de
  solicitações, nova solicitação, detalhe, modelos, ficha do modelo, perfil e as telas de
  administração de usuários, máquinas e modelos, com criar e editar).

## Métricas de sucesso

- Uma tela nova é feita sem escrever nenhuma cor: só peças base e cores por papel.
- Ajustar o tema escuro é mudar valores num lugar só.
- Nenhum relato de "abriu escuro e eu uso claro".
- A medição de contraste das 16 telas passa nos dois temas e fica guardada como referência
  para as próximas especificações visuais.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| RF-03: quanto das 16 telas e dos 76 arquivos passa para as cores por papel nesta entrega? | Tudo: as 16 telas | 2026-10-07 |
| RF-17: como o logo fica legível no tema escuro? | Placa clara atrás do logo atual | 2026-10-07 |
| RF-14: quem já tem "escuro" guardado continua no escuro ou passa para Sistema? | Passa para Sistema, uma vez; quem tinha escolhido o claro continua no claro | 2026-10-07 |
| RF-15: onde fica e como é o controle das três opções de tema? | Botão no cabeçalho (e na tela de entrada) que abre um menu com as três opções | 2026-10-07 |
| RF-22: além de prioridade e prazo, o que mantém cor própria? | Prioridade, prazo e status. Tipo vira selo neutro com ícone e texto; indicadores do painel ficam neutros, com cor só no ícone | 2026-10-07 |
| Processo: o repositório não tem `app/tests/bdd` nem alvo `make bdd`. Como os critérios de aceite são provados? | Cenários como testes de componente, cada um com o nome do cenário. Lacuna aceita pelo usuário de forma explícita para esta feature | 2026-10-07 |
| Processo: o `Makefile` não tem alvo para rodar um caminho nem os nomes do contrato. Como a implementação roda as ferramentas? | Estender o `Makefile` nesta feature (formatar, testar por caminho, cobertura e verificação de tipos que verifica de fato), mantendo os alvos atuais. Rodam na máquina; o serviço `dev` em container fica para uma feature de contrato | 2026-10-07 |
