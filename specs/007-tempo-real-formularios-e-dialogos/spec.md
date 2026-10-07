# Especificação — Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#121 e #123, e o que ficou em aberto de #124 e #125
depois da feature 006 (PR #133). O usuário pediu as quatro numa especificação só, em
2026-10-06.

## Problema

A aplicação deixa de se atualizar sozinha depois de uma queda de rede e não avisa; aceita
nos formulários o que a API recusa; apaga e descarta sem perguntar; e só o quadro ganhou o
diálogo modal e a área de toque medida. São quatro partes:

### Tempo real que se recupera (OtavioProcopio/rgm-frontend#121)

1. Quando a conexão de tempo real cai e volta (queda de rede, renovação da sessão, tempo
   limite de 30 minutos do servidor), o que mudou enquanto ela esteve fechada não aparece:
   o quadro, as listas e o detalhe aberto ficam com dados velhos até alguém recarregar a
   página.
2. Se a renovação da sessão falha por problema de rede, a aplicação desiste de reconectar.
   O tempo real fica desligado até a página ser recarregada.
3. Em nenhum dos dois casos há aviso: a tela parece atualizada e não está.

O gestor decide a partir de um quadro que pode estar parado há horas sem que ele saiba.

**Objetivo:** depois de qualquer interrupção, a aplicação volta a se atualizar sozinha, mostra
o que mudou no intervalo e avisa enquanto estiver sem atualização automática.

### Formulários que previnem erro (OtavioProcopio/rgm-frontend#123)

1. Os formulários de solicitação, modelo, máquina e usuário não têm tamanho máximo. Um
   título com mais de 255 caracteres é enviado, a API falha ao gravar e responde "registro
   duplicado": a mensagem manda procurar uma duplicata que não existe
   (OtavioProcopio/rgm-backend#109).
2. A regra de senha aparece em mais de um formulário (criar usuário, redefinir senha,
   trocar a própria senha), cada um com a sua cópia, e nenhuma vem de uma regra da API,
   que hoje só exige senha não vazia (OtavioProcopio/rgm-backend#98).
3. Excluir uma evidência apaga na hora, sem confirmação e sem como desfazer.
4. No detalhe da solicitação, "Cancelar" a edição descarta o que foi digitado sem perguntar.

Quinta heurística de Nielsen (prevenção de erros): é melhor impedir o erro do que explicar
depois.

**Objetivo:** nenhum formulário envia o que a API vai recusar por tamanho, a senha tem uma
regra só, e nada é apagado ou descartado sem confirmação.

### Diálogo em toda a aplicação (resto de OtavioProcopio/rgm-frontend#124)

A feature 006 entregou o diálogo modal e o levou às ações do quadro. Ficou de fora:

1. No detalhe da solicitação, as mesmas ações (triar, alterar responsáveis, enviar para
   validação, devolver, encerrar, cancelar) abrem como um bloco dentro da página. A mesma
   ação tem duas apresentações (quarta heurística de Nielsen, consistência).
2. As confirmações (desativar e excluir usuário, desativar e ativar modelo, remover foto da galeria)
   também são blocos dentro da página: não prendem o foco, não fecham com Esc e empurram o
   conteúdo para baixo.
3. Numa confirmação destrutiva, nada garante que o foco inicial esteja na opção segura.
4. Enquanto uma ação está sendo enviada, Esc e o clique fora fecham o diálogo: a ação
   continua em andamento sem que o usuário veja o resultado (RF-30 da feature 006, adiado).

**Objetivo:** toda ação e toda confirmação abrem no mesmo diálogo modal, com a opção segura
em foco quando a ação destrói algo, e o diálogo não some no meio de um envio.

### Toque e foco no resto das telas (resto de OtavioProcopio/rgm-frontend#125)

A feature 006 mediu e corrigiu a área de toque e o foco em três telas: quadro, detalhe e
nova solicitação. As outras não foram medidas: entrada, painel, lista de solicitações,
modelos (consulta e detalhe), perfil e administração (usuários, máquinas e modelos, com
suas telas de criar e editar). O critério da issue é para a aplicação inteira.

**Objetivo:** o mesmo critério de 44 px e de foco visível vale em todas as telas.

## Objetivo

Quem usa o RGM pode confiar que a tela está atualizada ou está avisando que não está; não
consegue enviar o que a API recusaria nem apagar algo por um toque errado; e encontra o
mesmo diálogo e os mesmos alvos de toque em qualquer tela.

## Fora de escopo

- Mudar a API: limites de tamanho e regra de senha no backend ficam com
  OtavioProcopio/rgm-backend#109 e #98. Esta feature só alinha o frontend.
- Desfazer a exclusão de evidência (a API apaga em definitivo); só a confirmação.
- Reenviar automaticamente uma ação que falhou por rede.
- Funcionamento sem conexão (fila de ações, cache persistente).
- Mudar o conteúdo dos formulários das ações ou das telas de administração.
- Redesenho de navegação, tema, cores, card e detalhe (OtavioProcopio/rgm-frontend#127 a
  #130) e estados de carregamento, vazio e erro (#126).
- Seleção de responsáveis com busca (#132) e tela de entrada (#131), além da área de toque
  e do foco dela.
- Animações de entrada e saída do diálogo.
- Paginação (#114) e a nova regra de visibilidade do operador (#122), que dependem do
  backend.

## Personas e cenários de uso

- **Gestor** deixa o quadro aberto o dia todo num monitor; a rede da fábrica oscila.
- **Operador** usa o celular no chão de fábrica: a tela apaga, o aparelho troca de rede.
- **Operador** escreve uma descrição longa ao abrir uma solicitação.
- **Administrador** cria usuários e redefine senhas.
- **Operador** anexa a evidência errada e vai excluí-la; ao lado há outras evidências.
- **Gestor** edita título e descrição no detalhe e toca em "Cancelar" sem querer.
- **Gestor** tria, devolve e encerra tanto pelo quadro quanto pelo detalhe.
- **Administrador** desativa e exclui usuários pelo teclado.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Quando a conexão de tempo real volta depois de ter caído, o quadro, as listas de solicitações e o detalhe aberto (dados, histórico e evidências) devem ser atualizados sem ação do usuário | obrigatório |
| RF-02 | A primeira conexão depois de entrar na aplicação não deve provocar atualização extra | obrigatório |
| RF-03 | Depois de uma falha de rede, inclusive na renovação da sessão, a aplicação deve continuar tentando reconectar até conseguir ou até a sessão expirar | obrigatório |
| RF-04 | O intervalo entre as tentativas deve crescer a cada falha seguida, até o teto de 30 segundos, e voltar ao valor inicial quando a conexão for restabelecida | obrigatório |
| RF-05 | Quando a sessão expirou de fato, a aplicação deve parar de tentar reconectar | obrigatório |
| RF-06 | Quando a conexão de tempo real estiver fechada há mais de 10 segundos, o cabeçalho da aplicação deve mostrar o aviso "Sem atualização automática", em todas as telas | obrigatório |
| RF-07 | O aviso deve sumir sozinho quando a conexão voltar | obrigatório |
| RF-08 | O aviso deve ser anunciado por tecnologia assistiva sem tirar o foco de onde está | obrigatório |
| RF-09 | Todo campo de texto dos formulários de solicitação, modelo, máquina e usuário deve recusar, antes do envio, valor maior que o limite que a API consegue gravar: título de solicitação 255; código de modelo 100; descrição de modelo 255; máquina do modelo 255; nome de máquina 255; nome de usuário 255; e-mail 255; na solicitação de criação de modelo, código pretendido 50 e máquina pretendida 100 | obrigatório |
| RF-10 | Os campos de texto longo sem limite na API (descrição de solicitação, comentário, motivo de cancelamento e de devolução, comentário final, observações) devem ter limite de 2.000 caracteres; o comentário do envio para validação continua com o limite de 1.000 que a API já impõe | obrigatório |
| RF-11 | O campo com limite não deve aceitar digitação além dele | obrigatório |
| RF-12 | O campo com limite deve mostrar quantos caracteres restam a partir de 90% do limite; antes disso, nenhum contador | obrigatório |
| RF-13 | Criar usuário, redefinir senha e trocar a própria senha devem aplicar a mesma regra de senha, com a mesma mensagem: mínimo de 8 caracteres | obrigatório |
| RF-14 | Excluir uma evidência deve pedir confirmação, dizendo qual evidência será excluída e que não há como desfazer | obrigatório |
| RF-15 | Desistir da confirmação de exclusão deve manter a evidência | obrigatório |
| RF-16 | No detalhe da solicitação, cancelar a edição com alteração não salva deve pedir confirmação antes de descartar | obrigatório |
| RF-17 | Cancelar a edição sem nenhuma alteração deve fechar a edição sem perguntar | obrigatório |
| RF-18 | Fechar o diálogo de uma ação (Esc, clique fora ou "Cancelar") com algo preenchido deve pedir confirmação antes de descartar; sem nada preenchido, fecha sem perguntar | obrigatório |
| RF-19 | No detalhe da solicitação, as ações (triar, alterar responsáveis, enviar para validação, devolver, encerrar, cancelar) devem abrir no mesmo diálogo modal do quadro, com nome que diga a ação e a solicitação | obrigatório |
| RF-20 | As confirmações de desativar usuário, excluir usuário, desativar e ativar modelo e remover foto da galeria devem abrir como diálogo modal, com o título da confirmação como nome | obrigatório |
| RF-21 | Em confirmação de ação destrutiva, o foco inicial deve estar no botão de desistir | obrigatório |
| RF-22 | Em confirmação de ação destrutiva, a tecla Enter logo ao abrir não deve executar a ação | obrigatório |
| RF-23 | Enquanto uma ação ou confirmação estiver sendo enviada, Esc e o clique fora não devem fechar o diálogo | obrigatório |
| RF-24 | Se o envio falhar, o diálogo deve continuar aberto, com o erro visível e o que foi preenchido | obrigatório |
| RF-25 | Todo controle interativo das telas de entrada, painel, lista de solicitações, modelos (consulta e detalhe), perfil e administração (usuários, máquinas e modelos, com criar e editar) deve ter área de toque de no mínimo 44 por 44 px em tela de toque | obrigatório |
| RF-26 | Todo controle interativo dessas telas deve mostrar contorno de foco ao ser alcançado pelo teclado, nos temas claro e escuro | obrigatório |
| RF-27 | Todo botão que só tem ícone deve ter nome acessível que diga o que faz | obrigatório |

Partes: RF-01 a RF-08, tempo real; RF-09 a RF-18, formulários; RF-19 a RF-24, diálogo;
RF-25 a RF-27, toque e foco.

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Tempo até a tela refletir o que mudou durante a queda | no máximo 5 segundos depois de a conexão voltar, em rede local |
| RNF-02 | Tentativas de reconexão | intervalo nunca menor que 1 segundo nem maior que 30 segundos; 0 tentativas depois de sessão expirada |
| RNF-03 | Uma fonte só para os limites | 0 números de tamanho máximo de texto escritos fora do ponto único de limites |
| RNF-04 | Uma fonte só para a regra de senha | 1 definição da regra, usada pelos 3 formulários |
| RNF-05 | Cobertura das regras novas | no mínimo 95% de linha nos módulos de reconexão, limites e regra de senha |
| RNF-06 | Área de toque | 0 controles interativos com menos de 44 px em qualquer dimensão nas telas de RF-25, em 390 px de largura com ponteiro de toque |
| RNF-07 | Contorno de foco | contraste de no mínimo 3:1 contra o fundo em todo controle das telas de RF-25, nos dois temas |
| RNF-08 | Dependências | 0 dependências novas |
| RNF-09 | Compatibilidade | funciona com a API v1.5.0 em produção, sem exigir mudança no backend |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação

  # Tempo real

  Cenário: Mudança durante a queda aparece quando a conexão volta
    Dado o quadro aberto com a conexão de tempo real caída
    E que outro usuário moveu uma solicitação durante a queda
    Quando a conexão volta
    Então o quadro mostra a solicitação na coluna nova sem eu recarregar a página

  Cenário: Detalhe aberto se atualiza na reconexão
    Dado o detalhe de uma solicitação aberto com a conexão caída
    E que outro usuário comentou nela durante a queda
    Quando a conexão volta
    Então o histórico mostra o comentário novo

  Cenário: Primeira conexão não recarrega nada
    Dado que acabei de entrar na aplicação
    Quando a conexão de tempo real é estabelecida pela primeira vez
    Então nenhuma lista é buscada de novo por causa disso

  Cenário: Falha de rede na renovação da sessão
    Dado a conexão de tempo real caída
    E que a renovação da sessão falhou por falta de rede
    Quando a rede volta
    Então a conexão é retomada sem eu recarregar a página

  Cenário: Espera cresce a cada falha
    Dado que a reconexão falhou várias vezes seguidas
    Quando a próxima tentativa é agendada
    Então a espera é maior que a anterior
    Mas nunca passa de 30 segundos

  Cenário: Espera volta ao início depois do sucesso
    Dado que a conexão foi restabelecida depois de várias falhas
    Quando ela cai de novo
    Então a primeira tentativa usa a espera inicial

  Cenário: Sessão expirada
    Dado a conexão de tempo real caída
    E que a sessão expirou
    Quando a renovação da sessão é recusada
    Então a aplicação não tenta reconectar de novo

  Cenário: Aviso de falta de atualização
    Dado o quadro aberto
    Quando a conexão de tempo real fica fechada por mais de 10 segundos
    Então vejo o aviso "Sem atualização automática" no cabeçalho

  Cenário: Aviso some
    Dado o aviso "Sem atualização automática" visível
    Quando a conexão volta
    Então o aviso some

  Cenário: Queda curta não avisa
    Dado o quadro aberto
    Quando a conexão cai e volta em menos de 10 segundos
    Então o aviso não aparece

  Cenário: Aviso anunciado sem roubar o foco
    Dado que estou digitando num campo
    Quando o aviso "Sem atualização automática" aparece
    Então a tecnologia assistiva anuncia o aviso
    E o foco continua no campo

  # Formulários

  Cenário: Título no limite
    Dado o formulário de nova solicitação
    Quando informo um título de 255 caracteres
    Então o formulário aceita o título

  Cenário: Título acima do limite
    Dado o formulário de nova solicitação
    Quando tento enviar um título de 256 caracteres
    Então vejo que o limite é de 255 caracteres
    E nada é enviado à API

  Cenário: Campo não aceita digitação além do limite
    Dado o campo de título com 255 caracteres
    Quando digito mais um caractere
    Então o campo continua com 255 caracteres

  Cenário: Contador perto do limite
    Dado o campo de título, com limite de 255 caracteres
    Quando o texto chega a 230 caracteres
    Então vejo que restam 25 caracteres

  Cenário: Sem contador longe do limite
    Dado o campo de título, com limite de 255 caracteres
    Quando o texto tem 229 caracteres
    Então não vejo contador

  Cenário: Código de modelo acima do limite
    Dado o formulário de modelo
    Quando tento enviar um código de 101 caracteres
    Então vejo que o limite é de 100 caracteres
    E nada é enviado à API

  Cenário: Texto longo acima do limite
    Dado o formulário de nova solicitação
    Quando tento enviar uma descrição de 2.001 caracteres
    Então vejo que o limite é de 2.000 caracteres
    E nada é enviado à API

  Cenário: Mesma regra de senha nos três formulários
    Dado uma senha de 7 caracteres
    Quando a informo ao criar usuário, ao redefinir senha e ao trocar a minha senha
    Então os três formulários recusam com a mesma mensagem

  Cenário: Senha no mínimo
    Dado uma senha de 8 caracteres
    Quando a informo ao trocar a minha senha
    Então o formulário aceita a senha

  Cenário: Excluir evidência pede confirmação
    Dado uma solicitação com uma evidência
    Quando peço para excluir a evidência
    Então vejo uma confirmação que cita a evidência e diz que não há como desfazer
    E a evidência ainda não foi excluída

  Cenário: Confirmar a exclusão
    Dado a confirmação de exclusão de evidência aberta
    Quando confirmo
    Então a evidência é excluída

  Cenário: Desistir da exclusão
    Dado a confirmação de exclusão de evidência aberta
    Quando desisto
    Então a evidência continua na solicitação

  Cenário: Cancelar edição com alteração
    Dado a edição da solicitação com o título alterado
    Quando toco em "Cancelar"
    Então vejo uma confirmação antes de descartar
    E o texto digitado continua no campo

  Cenário: Confirmar o descarte
    Dado a confirmação de descarte aberta
    Quando confirmo
    Então a edição fecha e a solicitação continua como estava

  Cenário: Cancelar edição sem alteração
    Dado a edição da solicitação sem nenhuma alteração
    Quando toco em "Cancelar"
    Então a edição fecha sem perguntar

  Cenário: Fechar diálogo de ação preenchido
    Dado o diálogo de devolução com o motivo preenchido
    Quando aperto Esc
    Então vejo uma confirmação antes de descartar

  Cenário: Fechar diálogo de ação vazio
    Dado o diálogo de devolução sem nada preenchido
    Quando aperto Esc
    Então o diálogo fecha sem perguntar

  # Diálogo

  Cenário: Ação do detalhe abre em diálogo
    Dado o detalhe de uma solicitação em "A Fazer"
    Quando escolho triar
    Então existe um diálogo modal cujo nome cita a ação e a solicitação
    E o foco está dentro do diálogo

  Cenário: Mesma apresentação no quadro e no detalhe
    Dado uma solicitação em "Em Validação"
    Quando abro a devolução pelo quadro e depois pelo detalhe
    Então nos dois casos ela abre num diálogo modal com o mesmo nome e os mesmos campos

  Cenário: Esc fecha a ação do detalhe
    Dado o diálogo de triagem aberto pelo detalhe, sem nada preenchido
    Quando aperto Esc
    Então o diálogo fecha
    E o foco volta ao botão que o abriu

  Cenário: Confirmação é diálogo modal
    Dado a lista de usuários
    Quando peço para desativar um usuário
    Então existe um diálogo modal com o nome "Desativar usuário"

  Cenário: Foco inicial na opção segura
    Dado a confirmação de excluir usuário aberta
    Então o foco está no botão de desistir

  Cenário: Enter não destrói
    Dado a confirmação de excluir usuário recém-aberta
    Quando aperto Enter
    Então o usuário não é excluído

  Cenário: Diálogo não fecha durante o envio
    Dado o diálogo de devolução com o envio em andamento
    Quando aperto Esc ou clico fora
    Então o diálogo continua aberto

  Cenário: Falha no envio mantém o diálogo
    Dado o diálogo de devolução preenchido
    Quando o envio falha
    Então o diálogo continua aberto com o erro visível
    E o motivo digitado continua no campo

  # Toque e foco

  Cenário: Área de toque nas demais telas
    Dado uma das telas de entrada, painel, lista de solicitações, modelos, perfil ou administração, em 390 px de largura com ponteiro de toque
    Quando meço cada controle interativo
    Então nenhum tem menos de 44 px de largura ou de altura

  Cenário: Foco pelo teclado nas demais telas
    Dado uma dessas telas, no tema claro ou no escuro
    Quando percorro os controles com a tecla Tab
    Então cada controle mostra um contorno ao receber o foco

  Cenário: Botão só de ícone tem nome
    Dado um botão que mostra apenas um ícone
    Quando a tecnologia assistiva o lê
    Então ela anuncia o que o botão faz
```

## Ambiguidades

Nenhuma em aberto.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| Depois de quanto tempo sem conexão o aviso "Sem atualização automática" aparece? (RF-06) | 10 segundos | 2026-10-06 |
| Onde o aviso aparece? (RF-06) | No cabeçalho, em todas as telas | 2026-10-06 |
| Qual o limite dos textos longos, que a API grava sem limite? (RF-10) | 2.000 caracteres | 2026-10-06 |
| A partir de quando o contador de caracteres aparece? (RF-12) | Com 90% do limite | 2026-10-06 |
| Qual o tamanho mínimo da senha? (RF-13) | 8 caracteres | 2026-10-06 |
| A confirmação ao descartar vale também para os diálogos de ação? (RF-18) | Sim, nos diálogos também | 2026-10-06 |

## Métricas de sucesso

- Quadro deixado aberto durante uma queda de rede mostra o estado atual em até 5 segundos
  depois de a rede voltar, sem recarga.
- Nenhuma resposta "registro duplicado" da API causada por texto grande demais.
- Nenhuma evidência excluída sem confirmação.
- Triar, devolver e encerrar pelo detalhe só com o teclado, do começo ao fim.
- Zero controles abaixo de 44 px em qualquer tela, em celular.
