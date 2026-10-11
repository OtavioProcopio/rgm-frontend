# Especificação — Navegação e menus que recolhem: barra lateral recolhível, "Mais ações" e seções recolhíveis

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#127, reescrita em 2026-10-08 depois da análise de
usabilidade das telas em `develop` (capturas em
`/root/rgm/evidencias/analise-ux-2026-10-08/`). É a **spec A** de cinco: entrega as peças de
navegação que as specs de dashboard (#144), modelos (#145), detalhe da solicitação (#130) e
quadro (#129) vão usar.

## Problema

A navegação e a moldura do RGM foram feitas para mostrar tudo o tempo todo. Medição de
2026-10-08 em `develop`:

1. **A barra lateral ocupa 280 px em toda tela do computador**, inclusive nas de leitura
   (detalhe de solicitação, histórico, ficha do modelo), e não pode ser recolhida. O
   conteúdo útil fica com cerca de 1.100 px de 1.440.
2. **No celular a navegação é uma faixa que rola**, abaixo do cabeçalho. Com perfil de
   administrador são 5 destinos; em 390 px parte deles fica fora da tela, sem indicação.
   Uma faixa no topo também fica longe do polegar.
3. **Três níveis de moldura:** a página, um cartão que envolve todo o conteúdo e os cartões
   de cada tela dentro dele. São 28 usos de cartão em 17 arquivos, todos já dentro da
   moldura da página.
4. **O cabeçalho repete o contexto:** "Painel administrativo" na barra lateral e
   "Administração RGM" no topo dizem a mesma coisa; o perfil aparece em maiúsculas cruas
   ("ADMINISTRADOR"). Nome, tema e "Sair" são três controles soltos, lado a lado.
5. **Toda ação aparece ao mesmo tempo e com o mesmo peso.** Sete telas têm ações no
   cabeçalho; a ficha do modelo mostra cinco botões na mesma linha ("Exportar PDF",
   "Editar", "Desativar" e, mais abaixo, "Ver galeria completa" e "Adicionar foto"), com a
   ação destrutiva ao lado da edição.
6. **Nenhuma seção pode ser fechada.** Filtros, galeria e histórico ocupam espaço mesmo
   quando o usuário não os quer naquele momento.

**Custo de não resolver:** as três specs visuais seguintes (dashboard, modelos e detalhe da
solicitação) teriam de inventar, cada uma, o seu jeito de esconder ação secundária e de
recolher seção, e o RGM ficaria com três padrões.

**Objetivo desta especificação:** o usuário vê o essencial e abre o resto quando quer
(revelação progressiva), a navegação cede espaço ao conteúdo e alcança o polegar no celular,
e o RGM tem uma peça só para cada um desses comportamentos.

## Objetivo

Depois desta entrega:

- no computador, a barra lateral recolhe para uma coluna de ícones e expande de novo, por
  clique e por teclado, e lembra a escolha;
- no celular, a navegação principal é uma barra de abas fixa na base, com todos os destinos
  visíveis;
- nome, perfil, tema e "Sair" ficam num menu do usuário só;
- o conteúdo fica sobre o fundo da página, sem o cartão que o envolve;
- toda tela com mais de uma ação mostra uma ação principal e guarda as outras num menu
  "Mais ações", com a destrutiva separada e confirmada;
- filtros e blocos secundários podem ser recolhidos, e a escolha é lembrada.

## Fora de escopo

- **Estados de carregamento, vazio, erro e sucesso, com avisos temporários (#126).** É uma
  trilha própria; esta spec não muda o que a tela mostra enquanto carrega ou quando falha.
- **Conteúdo e disposição interna do dashboard (#144), da ficha e da lista de modelos
  (#145), do detalhe da solicitação (#130) e do card do quadro (#129).** Esta spec entrega
  as peças e a aplica só onde descrito em RF-12 e RF-15; não reorganiza o conteúdo dessas
  telas.
- **Definir qual é a ação principal de cada etapa da solicitação.** Isso é da #130; aqui
  vale a regra geral (uma principal, o resto no menu).
- **Atalhos de teclado globais** (inclusive para recolher a barra lateral) e paleta de comandos: o botão, acionado por Enter, é o único meio.
- **Título da página que encolhe ao rolar no celular:** o título fica fixo.
- **Navegação por migalhas de pão e botão "Voltar" que usa o histórico (#130).**
- **Guardar a preferência de barra lateral e de seções no servidor:** a escolha fica no
  navegador, como a do tema.
- **Novas telas, novos destinos de navegação ou mudança de quem acessa o quê:** os destinos
  e as permissões por perfil continuam como hoje.
- **Mudar a cor da marca, o logo ou o tema** (spec 010).

## Personas e cenários de uso

- **Gestor no computador**, com o histórico de uma solicitação aberto, quer mais largura
  para ler e recolhe a barra lateral; na próxima visita, ela continua recolhida.
- **Operador no celular**, de luvas ou com uma mão só, troca entre quadro, solicitações e
  modelos pela base da tela, sem esticar o dedo até o topo.
- **Administrador**, na ficha de um modelo, vê "Editar" como a ação clara e encontra
  "Exportar PDF" e "Desativar" no menu "Mais ações"; ao tocar em "Desativar", precisa
  confirmar.
- **Quem dá manutenção no frontend**, ao criar uma tela nova, usa a peça de cabeçalho com
  "Mais ações" e a de seção recolhível em vez de montar a sua.

## Requisitos funcionais

### Barra lateral recolhível (computador)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Em tela larga, a barra lateral deve poder ser recolhida para uma coluna só de ícones e expandida de novo, por um botão acionável por teclado (Enter ou Espaço, sem atalho global); recolhida, cada destino mostra o rótulo ao receber o ponteiro ou o foco, e o destino atual continua marcado | obrigatório |
| RF-02 | A escolha entre recolhida e expandida deve valer nas visitas seguintes, no mesmo navegador | obrigatório |
| RF-03 | Ao recolher ou expandir a barra, o conteúdo deve ocupar o espaço liberado ou cedido, sem recarregar a página | obrigatório |
| RF-04 | Na primeira visita, sem escolha guardada, a barra deve aparecer expandida em todas as telas, sem regra especial para telas de leitura; depois, deve estar no estado guardado antes de a primeira tela aparecer: o usuário não vê a barra no estado errado e depois a troca | obrigatório |

### Navegação no celular

| ID | Requisito | Prioridade |
|---|---|---|
| RF-05 | Em tela estreita, a navegação principal deve ser uma barra de abas fixa na base da tela, com ícone e rótulo por destino, todos os destinos do perfil visíveis sem rolar e sem passar de cinco | obrigatório |
| RF-06 | A barra de abas deve respeitar a área segura do aparelho (sem ficar sob a barra de gestos) e não cobrir o fim do conteúdo: o último elemento da página deve poder ser rolado até ficar acima dela | obrigatório |
| RF-07 | A faixa de navegação que rola, hoje abaixo do cabeçalho, deve deixar de existir em tela estreita | obrigatório |

### Cabeçalho e menu do usuário

| ID | Requisito | Prioridade |
|---|---|---|
| RF-08 | Nome do usuário, perfil, acesso à tela de perfil, escolha de tema e "Sair" devem ficar num menu do usuário só, aberto por um botão no canto do cabeçalho, no lugar dos controles soltos; "Sair" existe só dentro desse menu, no computador e no celular | obrigatório |
| RF-09 | O perfil deve ser escrito por extenso e em caixa normal ("Administrador", "Gestor", "Operador"), em todo lugar onde aparece | obrigatório |
| RF-10 | O cabeçalho não deve repetir o contexto que a barra lateral já dá: a identificação do portal aparece uma vez | obrigatório |
| RF-11 | O conteúdo da página deve ficar sobre o fundo da aplicação, sem o cartão com borda e sombra que hoje o envolve; só agrupamentos reais viram cartão, e nenhuma tela passa de dois níveis de moldura | obrigatório |

### "Mais ações"

| ID | Requisito | Prioridade |
|---|---|---|
| RF-12 | O cabeçalho de página deve mostrar a ação principal e, quando houver outras, um botão "Mais ações" que abre um menu com elas, cada uma com texto e ícone; com uma ação só, nenhum menu aparece. As sete telas que hoje têm ações no cabeçalho devem usar essa peça: só entram no menu os comandos: voltar (navegação), o alternador Kanban/Lista (visão) e o par Salvar/Cancelar de uma edição não são ações do menu e ficam como estão. Quadro de solicitações: a principal é "Nova solicitação" e "Exportar PDF" vai para o menu; lista de modelos: a principal é "Novo modelo" e "Exportar PDF" vai para o menu; ficha do modelo: a principal é "Editar", e "Exportar PDF" e "Desativar" (ou "Ativar", se o modelo está inativo) ficam em "Mais ações"; usuários, máquinas, edição do modelo e detalhe da solicitação têm um comando só no cabeçalho e seguem sem menu; a regra de uma principal por etapa da solicitação é da #130 | obrigatório |
| RF-13 | A ação destrutiva (desativar, excluir) deve ficar no fim do menu, separada das demais, em cor de perigo, e só deve ser executada depois de uma confirmação | obrigatório |
| RF-14 | O menu "Mais ações" e o menu do usuário devem funcionar por teclado (abrir, navegar entre itens, escolher, fechar com Esc), devolver o foco ao botão que os abriu ao fechar e ser anunciados por leitor de tela como menu com estado aberto ou fechado | obrigatório |

### Seções recolhíveis

| ID | Requisito | Prioridade |
|---|---|---|
| RF-15 | Deve existir uma peça de seção recolhível: título que abre e fecha a seção por clique e por teclado, com o estado anunciado a leitor de tela; fechada, mostra um resumo curto do conteúdo escondido (por exemplo, "Filtros · 2 ativos") | obrigatório |
| RF-16 | O estado aberto ou fechado de cada seção recolhível deve valer nas visitas seguintes, no mesmo navegador | obrigatório |
| RF-17 | A faixa de filtros das listas de modelos e de usuários deve usar a seção recolhível; o quadro de solicitações mantém os filtros como estão | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Área de toque e foco | 0 controles novos com menos de 44 px em 390 px com toque; contorno de foco visível em 100% dos controles novos (critério das specs 006 e 007 mantido) |
| RNF-02 | Contraste | no mínimo 4,5:1 para texto e 3:1 para ícone e contorno de foco nos controles novos, nos dois temas (critério da spec 010 mantido) |
| RNF-03 | Moldura | no máximo 2 níveis de moldura (borda ou superfície com borda) em cada uma das 16 telas, medido em 1440 px e em 390 px; hoje são 3 |
| RNF-04 | Ações visíveis | no máximo 1 ação principal e 1 botão "Mais ações" no cabeçalho de cada uma das 7 telas com ações; hoje a ficha do modelo mostra 3 só no cabeçalho |
| RNF-05 | Largura da barra lateral | recolhida: 72 px, com tolerância de 4 px; expandida: 280 px, como hoje |
| RNF-06 | Barra de abas no celular | 100% dos destinos de cada perfil visíveis sem rolar em 390 px e em 360 px de largura; altura de 56 px com tolerância de 4 px, mais a área segura |
| RNF-07 | Sem estado errado no carregamento | 0 quadros com a barra lateral ou a seção no estado errado, medido em 5 carregamentos de cada estado |
| RNF-08 | Duração das transições | recolher, expandir e abrir menu em até 200 ms; 0 ms de movimento quando o usuário pediu redução de movimento |
| RNF-09 | Teclado | 100% das ações dos menus alcançáveis só com teclado, em no máximo 10 pressionamentos de tecla a partir do botão que abre o menu |
| RNF-10 | Cobertura | no mínimo 95% de linha em cada arquivo alterado que o projeto mede |
| RNF-11 | Dependências | 0 dependências novas |
| RNF-12 | Compatibilidade | funciona com a API v1.5.0 em produção; nenhuma mudança de contrato |
| RNF-13 | Permissões preservadas | 0 destinos de navegação adicionados ou removidos para qualquer perfil, comparando antes e depois |

## Critérios de aceite

Escritos em DADO / QUANDO / ENTÃO / MAS. Cada critério vira um cenário em
`app/tests/bdd/` sem tradução no meio.

```gherkin
# language: pt
Funcionalidade: Navegação e menus que recolhem

  # Barra lateral recolhível

  Cenário: Recolher a barra lateral no computador
    Dado um usuário em tela larga com a barra lateral expandida
    Quando ele aciona o botão de recolher
    Então a barra mostra só os ícones dos destinos
    E o conteúdo passa a ocupar o espaço liberado
    Mas a página não é recarregada

  Cenário: Rótulo do destino com a barra recolhida
    Dado a barra lateral recolhida
    Quando o ponteiro ou o foco chega a um destino
    Então o rótulo desse destino aparece
    E o destino da tela atual continua marcado

  Cenário: Recolher e expandir por teclado
    Dado o foco no botão de recolher da barra lateral
    Quando o usuário aperta Enter
    Então a barra recolhe
    E o foco permanece no botão
    Mas nenhum destino perde a ordem de tabulação
    E nenhuma combinação de teclas fora do botão recolhe a barra

  Cenário: A escolha da barra vale na visita seguinte
    Dado um usuário que recolheu a barra lateral
    Quando ele fecha a aplicação e abre de novo no mesmo navegador
    Então a barra aparece recolhida desde o primeiro quadro
    Mas não aparece expandida e depois recolhida

  Cenário: Primeira visita
    Dado um navegador sem escolha guardada
    Quando o usuário abre a aplicação em tela larga
    Então a barra lateral aparece expandida
    E isso vale também nas telas de leitura, como o detalhe da solicitação e a ficha do modelo
    Mas a barra não muda de estado sozinha ao navegar entre telas

  # Navegação no celular

  Cenário: Barra de abas na base
    Dado um administrador em tela de 390 px
    Quando a tela principal abre
    Então a base mostra uma barra de abas com os cinco destinos, cada um com ícone e rótulo
    Mas não existe faixa de navegação que rola abaixo do cabeçalho

  Cenário: Barra de abas não cobre o conteúdo
    Dado uma lista longa em tela de 390 px
    Quando o usuário rola até o fim
    Então o último elemento da lista fica inteiro acima da barra de abas

  Cenário: Barra de abas com poucos destinos
    Dado um operador, que tem menos destinos que o administrador
    Quando a tela abre em 390 px
    Então a barra mostra só os destinos dele, com a largura dividida entre eles
    Mas nenhum destino de administrador aparece

  # Cabeçalho e menu do usuário

  Cenário: Menu do usuário reúne os controles soltos
    Dado um usuário autenticado
    Quando ele aciona o botão do canto do cabeçalho
    Então abre um menu com o nome, o perfil por extenso, "Meu perfil", a escolha de tema e "Sair"
    Mas o cabeçalho não mostra mais o nome, o tema e "Sair" lado a lado

  Cenário: Perfil por extenso
    Dado um usuário com perfil ADMINISTRADOR
    Quando qualquer tela mostra o perfil dele
    Então o texto é "Administrador"
    Mas não é "ADMINISTRADOR"

  Cenário: Menu do usuário por teclado
    Dado o foco no botão do menu do usuário
    Quando o usuário aperta Enter, desce com a seta e aperta Esc
    Então o menu abre, o foco vai ao primeiro item e o menu fecha
    E o foco volta ao botão que abriu o menu

  Cenário: Cabeçalho sem texto repetido
    Dado um administrador em tela larga
    Quando uma tela abre
    Então a identificação do portal aparece uma vez
    Mas não aparece em dois lugares ao mesmo tempo

  Cenário: Conteúdo sobre o fundo
    Dado qualquer uma das 16 telas
    Quando ela abre em 1440 px
    Então o conteúdo não está dentro de um cartão com borda e sombra
    E a tela tem no máximo dois níveis de moldura

  # "Mais ações"

  Cenário: Ação principal e menu
    Dado a ficha de um modelo aberta por um administrador
    Quando a tela carrega
    Então o cabeçalho mostra "Editar" como ação principal e um botão "Mais ações"
    E "Exportar PDF" e "Desativar" estão dentro de "Mais ações"
    Mas não aparecem soltos no cabeçalho

  Cenário: Sair só no menu do usuário
    Dado um usuário em tela de 390 px
    Quando ele olha o cabeçalho
    Então não existe botão "Sair" fora do menu do usuário
    E "Sair" está dentro do menu do usuário

  Cenário: Filtros recolhíveis só nas listas definidas
    Dado as listas de modelos, de usuários e o quadro de solicitações
    Quando cada uma abre
    Então modelos e usuários mostram a faixa de filtros como seção recolhível
    Mas o quadro de solicitações mostra os filtros como hoje

  Cenário: Uma ação só
    Dado uma tela com uma única ação no cabeçalho
    Quando ela carrega
    Então a ação aparece como botão
    Mas nenhum botão "Mais ações" aparece

  Cenário: Ação destrutiva no fim e confirmada
    Dado o menu "Mais ações" aberto na ficha de um modelo ativo
    Quando o usuário escolhe "Desativar"
    Então abre uma confirmação
    E o modelo só é desativado depois de o usuário confirmar
    Mas se ele cancelar, o modelo continua ativo

  Cenário: Ação destrutiva separada das outras
    Dado o menu "Mais ações" aberto
    Quando o usuário olha a lista
    Então "Desativar" é o último item, separado dos demais por uma divisória e em cor de perigo

  Cenário: Menu "Mais ações" por teclado
    Dado o foco no botão "Mais ações"
    Quando o usuário aperta Enter, desce duas vezes com a seta, aperta Enter
    Então a terceira ação é executada
    E o menu fecha e o foco volta ao botão "Mais ações"
    Mas Esc, no lugar de Enter, fecha o menu sem executar nada

  Cenário: Leitor de tela anuncia o menu
    Dado o botão "Mais ações"
    Quando o menu está fechado e depois aberto
    Então o botão anuncia que tem um menu e informa se está aberto ou fechado

  # Seções recolhíveis

  Cenário: Recolher uma seção
    Dado uma seção recolhível aberta
    Quando o usuário aciona o título dela
    Então o conteúdo some
    E o título mostra um resumo do que está escondido
    Mas o título continua visível e acessível por teclado

  Cenário: Resumo de filtros
    Dado a seção de filtros fechada com dois filtros preenchidos
    Quando o usuário olha o título
    Então ele lê "Filtros · 2 ativos"

  Cenário: A escolha da seção vale na visita seguinte
    Dado um usuário que fechou a seção de filtros
    Quando ele volta à tela no mesmo navegador
    Então a seção aparece fechada desde o primeiro quadro

  Cenário: Filtro escondido continua valendo
    Dado a seção de filtros fechada com um filtro preenchido
    Quando a lista carrega
    Então a lista continua filtrada pelo filtro preenchido
    Mas a seção continua fechada

  # Acessibilidade e movimento

  Cenário: Redução de movimento
    Dado um usuário que pediu redução de movimento ao sistema
    Quando ele recolhe a barra lateral ou abre um menu
    Então a mudança acontece sem animação

  Cenário: Alvos de toque
    Dado um aparelho de toque em 390 px
    Quando a barra de abas, o menu do usuário e "Mais ações" aparecem
    Então cada controle tem pelo menos 44 px de lado
```

## Ambiguidades

Nenhuma em aberto; as respostas estão em **Esclarecimentos**.

Já decidido, sem pergunta:

- **Escopo da #126:** fica de fora. É uma trilha de estados e avisos, independente, e juntá-la
  inflaria a spec (o limite combinado é de duas ou três issues por spec).
- **Lembrar a escolha:** no navegador, como o tema da spec 010, e não no servidor.
- **Destinos por perfil:** os mesmos de hoje; esta spec não cria nem remove destino (RNF-13).
- **Cinco abas no máximo:** é o limite que as diretrizes de interface dão para barra de abas
  e é o número de destinos do administrador hoje.
- **16 telas:** as mesmas medidas nas specs 007 e 010.

## Métricas de sucesso

- A ficha do modelo e as demais telas com ações têm uma ação em destaque, e o resto está em
  "Mais ações" (RNF-04).
- Nenhuma tela passa de dois níveis de moldura (RNF-03).
- No celular, o usuário alcança qualquer destino principal com um toque na base da tela.
- As specs de dashboard, modelos, detalhe da solicitação e quadro usam as mesmas três peças
  (cabeçalho com "Mais ações", seção recolhível, menu do usuário) e nenhuma cria uma versão
  própria.
- Medição de largura útil em 1440 px: conteúdo pelo menos 200 px mais largo com a barra
  recolhida.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| RF-04: a barra lateral começa expandida ou recolhida na primeira visita, e as telas de leitura começam recolhidas? | Expandida em todas, sem regra por tela | 2026-10-08 |
| RF-17: quais listas usam a seção de filtros recolhível? | Modelos e usuários; o quadro fica como está | 2026-10-08 |
| RF-12, RNF-04: qual é a ação principal nas telas com ações? E o detalhe da solicitação? | "Editar" na ficha do modelo; o detalhe da solicitação só usa a peça com o que já existe, e a regra por etapa fica para a #130 | 2026-10-08 |
| RF-08: onde fica o "Sair" no celular? | Só dentro do menu do usuário, no computador e no celular | 2026-10-08 |
| O título da página, no celular, encolhe ao rolar ou fica fixo? | Fica fixo | 2026-10-08 |
| RF-01: qual é o atalho de teclado para recolher a barra lateral? | Nenhum; só o botão, acionado por Enter | 2026-10-08 |
| **Correção do plano, a confirmar:** a spec dizia que 4 telas tinham uma ação só (nova solicitação, novo usuário, novo modelo, nova máquina); o código mostra que o quadro e a lista de modelos também têm "Exportar PDF" no cabeçalho. A resposta do usuário ("Editar" na ficha) não muda; a principal do quadro e da lista de modelos é a ação de criar e "Exportar PDF" vai ao menu | Aguardando confirmação | 2026-10-08 |
