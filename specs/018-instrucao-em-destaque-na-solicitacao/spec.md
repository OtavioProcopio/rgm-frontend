# Especificação — Instrução em destaque na solicitação

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: decisão do usuário em 2026-11-09, depois da spec 017 (PR #174): a instrução do que
fazer é uma decisão da triagem e deve ficar em destaque na solicitação, não perdida no
histórico. No mesmo dia o usuário decidiu que o gestor pode **corrigir** a instrução enquanto a
solicitação está em andamento (revisão desta spec antes de qualquer código no front). Par no
backend: `rgm-backend` spec 015. Base: `develop` com a spec 017.

## Problema

1. **A instrução só aparece como comentário no histórico.** Quem vai executar abre a
   solicitação, vê o resumo e precisa rolar a linha do tempo e adivinhar qual comentário é a
   instrução do gestor.
2. **A tela chama o texto de "Descrição".** O modal diz "Descrição do que precisa ser feito"
   enquanto a solicitação já tem uma "Descrição" (o que o operador relatou ao abrir). Dois
   campos com o mesmo nome, em lugares vizinhos.
3. **Solicitações triadas antes do campo ficam mudas.** Sem tratamento, o responsável
   procuraria uma instrução que nunca foi gravada.

4. **Não há como corrigir a instrução.** Se o gestor se enganou, só resta comentar por cima, e o
   responsável fica com dois textos sem saber qual vale.
5. **A tela quebraria com um tipo de atividade novo.** O histórico mapeia cada tipo conhecido
   para ícone e cor; um tipo que o front não conhece, vindo do backend novo, derruba a linha do tempo.

**Custo de não resolver:** o responsável não encontra o que fazer; a instrução, que é uma
decisão, fica com o peso de um comentário; uma correção do gestor não chega a quem executa.

## Objetivo

- O detalhe da solicitação mostra, em destaque e antes dos demais dados, o que precisa ser feito.
- A triagem pede esse texto com o nome que a tela usa para mostrá-lo, e o nome não confunde
  com a descrição da abertura.
- Quem abre uma solicitação triada antes do campo entende que não há instrução, sem procurá-la.
- Gestor e administrador corrigem a instrução ali mesmo, no bloco, enquanto a solicitação está
  em andamento; quem executa vê a mudança e o que dizia antes, sem recarregar.

## Fora de escopo

- Mostrar a instrução no cartão do quadro ou na listagem (o cartão já tem título, modelo,
  máquina, responsáveis, prioridade e prazo; fica para decisão própria).
- Editar a instrução fora de andamento, ou pelo responsável (a API decide: só aparece o botão quando ela permite).
- Notificar ativamente o responsável da correção (aviso sonoro, push, e-mail); ele vê pela tela aberta e pelo histórico.
- Preencher a instrução das triagens antigas.
- Recolher ou truncar a instrução: ela é o conteúdo principal da tela e não se esconde.
- Qualquer mudança nas demais ações (devolver, encerrar, cancelar).

## Personas e cenários de uso

- **Responsável (operador, no chão de fábrica, muitas vezes no celular):** abre a solicitação e
  precisa ler o que fazer sem rolar nem procurar.
- **Gestor e administrador:** escrevem a instrução na triagem, conferem no detalhe o que ficou
  registrado e a corrigem se for preciso.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O detalhe da solicitação que tem instrução mostra o bloco "O que precisa ser feito" em largura total, antes dos dados da solicitação (prazo, responsáveis, tipo, descrição…) | obrigatório |
| RF-02 | O bloco mostra a instrução inteira, sem cortar nem recolher, preservando as quebras de linha, e uma palavra longa não estoura a tela | obrigatório |
| RF-03 | Solicitação em andamento, em validação ou concluída que não tem instrução mostra, no lugar do bloco, o aviso "Sem instrução registrada. Esta solicitação foi triada antes deste campo existir." | obrigatório |
| RF-04 | Solicitação a fazer, ou cancelada sem instrução, não mostra bloco nem aviso | obrigatório |
| RF-05 | O formulário de triagem chama o campo "O que precisa ser feito", obrigatório, até 2000 caracteres, com o contador de caracteres restantes; vazio ou só com espaços mostra "Descreva o que precisa ser feito" e não envia | obrigatório |
| RF-06 | A triagem envia a instrução, sem os espaços das pontas, no campo `instrucao` do corpo de `triar`; não envia mais `descricao` | obrigatório |
| RF-07 | Depois da triagem, o detalhe aberto (por quem triou ou por outro usuário) mostra o bloco com a instrução sem recarregar a página | obrigatório |
| RF-08 | Se a triagem falha (conflito porque outra pessoa triou antes, ou erro de rede), o texto digitado continua no formulário e o erro aparece junto da ação, como nas demais ações | obrigatório |
| RF-09 | A foto da triagem continua opcional e sem texto próprio | obrigatório |
| RF-10 | O cartão do quadro e a listagem não mudam | obrigatório |
| RF-11 | Quando a API oferece a ação `EDITAR_INSTRUCAO`, o bloco mostra o botão "Editar" no seu cabeçalho; sem a ação (operador, outro status, antes da triagem) o botão não existe | obrigatório |
| RF-12 | "Editar" abre um diálogo com o campo "O que precisa ser feito" já preenchido com a instrução atual, com as mesmas regras do formulário de triagem (obrigatório, até 2000 caracteres, contador, aparado) | obrigatório |
| RF-13 | "Salvar" só fica ativo quando o texto aparado difere do atual; salvar fecha o diálogo, atualiza o bloco e avisa "Instrução atualizada" | obrigatório |
| RF-14 | Cancelar o diálogo com texto alterado pede confirmação do descarte, como nas demais ações; sem alteração, fecha direto | obrigatório |
| RF-15 | Se a API recusa (conflito porque a solicitação saiu de andamento ou outra pessoa editou antes, sem permissão, rede), o diálogo continua aberto com o texto digitado e o erro junto da ação; o aviso "Atualizada por outro usuário" aparece como nas demais ações | obrigatório |
| RF-16 | O histórico mostra a correção como "Instrução alterada", com autor, data e o texto anterior ("Antes: …"), em destaque como o comentário | obrigatório |
| RF-17 | Quando outra pessoa edita a instrução, o bloco e o histórico do detalhe aberto se atualizam sem recarregar, e o botão "Editar" aparece ou some conforme o novo estado | obrigatório |
| RF-18 | Um tipo de atividade que o front não conhece aparece no histórico como "Atividade registrada", com marcador neutro, sem quebrar a linha do tempo | obrigatório |
| RF-19 | "Editar instrução" não aparece em "Mais ações" nem no quadro; o único ponto de entrada é o bloco | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Sem custo de rede | 0 requisições novas no detalhe e na triagem; a instrução vem na resposta que a tela já pede; a edição faz 1 requisição de edição, atualiza o detalhe pela resposta dela e recarrega só o histórico (que já é o que toda ação faz) |
| RNF-02 | Sem dependência nova | 0 pacotes acrescentados em `package.json` |
| RNF-03 | Leitura no celular | Em 320 px de largura, sem rolagem horizontal com 2000 caracteres e uma palavra de 200 caracteres sem espaço |
| RNF-04 | Acessibilidade | O bloco é uma região nomeada por seu título; contraste mínimo AA nos temas claro e escuro, pelos tokens do sistema de design (spec 010); o aviso do RF-03 não depende só de cor; o erro do campo é anunciado e o foco vai ao primeiro campo inválido que seja um campo de texto; o diálogo prende o foco, fecha com Esc e devolve o foco ao botão "Editar" (Dialog do sistema de design); o botão "Editar" tem nome acessível "Editar o que precisa ser feito" e alvo de toque ≥ 44 px no celular |
| RNF-05 | Cobertura dos arquivos tocados | ≥ 95% de linhas por arquivo (Princípio 10); nenhum teste escrito só para cobrir linha |
| RNF-06 | Verificação | `make validate` com 0 falhas e 0 erros de lint e de tipos |

## Ordem de publicação (Princípio 9)

Este front depende do campo `instrucao`, do corpo novo de `triar`, da ação `EDITAR_INSTRUCAO`,
da rota `PATCH /instrucao` e do tipo de atividade `INSTRUCAO_ALTERADA`, que só existem no
backend com a spec 015. Os dois são publicados **juntos, com o backend primeiro no mesmo deploy**, e
esta spec **não** traz comportamento de reserva para backend anterior: contra um backend sem a
spec 015, a triagem seria recusada (400) por falta de `instrucao`. Publicar este front contra
backend sem a spec 015 não é suportado.

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Instrução em destaque na solicitação

  Cenário: Instrução em destaque no detalhe
    Dado uma solicitação em andamento com a instrução "Trocar o gabarito\nConferir o furo 3"
    Quando abro o detalhe
    Então vejo o bloco "O que precisa ser feito" antes dos dados da solicitação
    E as duas linhas aparecem em linhas separadas

  Cenário: Instrução longa
    Dado uma instrução de 2000 caracteres com uma palavra de 200 caracteres sem espaço
    Quando abro o detalhe em tela de 320 px
    Então leio a instrução inteira
    E a página não rola na horizontal

  Cenário: Triada antes do campo
    Dado uma solicitação em andamento sem instrução
    Quando abro o detalhe
    Então vejo "Sem instrução registrada. Esta solicitação foi triada antes deste campo existir."
    E não vejo o bloco "O que precisa ser feito"

  Cenário: Solicitação ainda não triada
    Dado uma solicitação a fazer
    Quando abro o detalhe
    Então não vejo bloco nem aviso de instrução

  Cenário: Cancelada sem ter sido triada
    Dado uma solicitação cancelada sem instrução
    Quando abro o detalhe
    Então não vejo bloco nem aviso de instrução

  Cenário: Concluída sem instrução
    Dado uma solicitação concluída sem instrução
    Quando abro o detalhe
    Então vejo o aviso de que não há instrução registrada

  Cenário: Triar com instrução
    Dado que escolhi a prioridade e um responsável e escrevi "  Trocar o gabarito  " em "O que precisa ser feito"
    Quando aciono "Confirmar triagem"
    Então a triagem é enviada com instrucao "Trocar o gabarito"
    E o corpo não tem o campo descricao

  Cenário: Triar sem instrução
    Dado que escolhi a prioridade e um responsável
    Quando aciono "Confirmar triagem" sem escrever o campo ou só com espaços
    Então vejo "Descreva o que precisa ser feito"
    E nenhuma requisição é feita
    E o foco vai para o campo

  Cenário: Limite
    Dado o campo "O que precisa ser feito"
    Quando tento escrever mais de 2000 caracteres
    Então o campo não aceita o excedente
    E mostra quantos caracteres restam

  Cenário: Outra pessoa triou antes
    Dado que escrevi a instrução e outra pessoa triou a solicitação antes de mim
    Quando aciono "Confirmar triagem"
    Então vejo o erro de conflito junto da ação
    E o texto que escrevi continua no campo

  Cenário: Instrução aparece sem recarregar
    Dado o detalhe de uma solicitação a fazer aberto na tela de um responsável
    Quando o gestor tria com a instrução "Trocar o gabarito"
    Então o detalhe do responsável passa a mostrar o bloco com "Trocar o gabarito" sem recarregar

  Cenário: Foto opcional sem texto
    Dado que escrevi a instrução e anexei uma foto
    Quando aciono "Confirmar triagem"
    Então a foto segue como instrução de serviço, sem texto próprio
    E a instrução vai na triagem

  Cenário: Gestor vê o botão Editar
    Dado uma solicitação em andamento com instrução e a API oferecendo EDITAR_INSTRUCAO
    Quando abro o detalhe como gestor
    Então vejo o botão "Editar" no cabeçalho do bloco "O que precisa ser feito"

  Cenário: Operador não vê o botão
    Dado a mesma solicitação aberta pelo operador responsável
    Quando abro o detalhe
    Então vejo o bloco e não vejo o botão "Editar"

  Cenário: Corrigir a instrução
    Dado o diálogo de edição aberto com "Trocar o gabarito"
    Quando troco o texto para "  Trocar o gabarito e o pino  " e aciono "Salvar"
    Então a requisição leva "Trocar o gabarito e o pino"
    E o diálogo fecha e o bloco mostra o novo texto
    E vejo "Instrução atualizada"

  Cenário: Salvar sem mudar
    Dado o diálogo de edição aberto
    Quando o texto aparado é igual ao atual
    Então "Salvar" está desabilitado

  Cenário: Campo vazio na edição
    Dado o diálogo de edição aberto
    Quando apago o texto e aciono "Salvar"
    Então vejo "Descreva o que precisa ser feito"
    E nenhuma requisição é feita

  Cenário: Desistir da edição
    Dado o diálogo de edição com o texto alterado
    Quando aciono "Cancelar"
    Então sou perguntado se descarto a alteração
    Mas sem alteração o diálogo fecha direto

  Cenário: Outra pessoa já tinha mudado
    Dado que abri a edição e outra pessoa enviou a solicitação para validação
    Quando aciono "Salvar"
    Então vejo o erro de conflito junto da ação
    E o diálogo continua aberto com o meu texto

  Cenário: Correção aparece no histórico
    Dado uma instrução corrigida de "Trocar o gabarito" para "Trocar o gabarito e o pino"
    Quando abro o histórico
    Então vejo "Instrução alterada" com o autor, a data e "Antes: Trocar o gabarito"

  Cenário: Correção chega sem recarregar
    Dado o detalhe aberto na tela do responsável
    Quando o gestor corrige a instrução
    Então o bloco e o histórico do responsável mostram a correção sem recarregar

  Cenário: Tipo de atividade desconhecido
    Dado uma atividade de um tipo que o front não conhece
    Quando abro o histórico
    Então vejo "Atividade registrada" com marcador neutro
    E o restante da linha do tempo aparece normalmente

  Cenário: Sem entrada em Mais ações
    Dado uma solicitação em andamento aberta pelo gestor
    Quando abro "Mais ações"
    Então não vejo "Editar instrução"

  Cenário: Cartão e listagem iguais
    Dado uma solicitação com instrução
    Quando vejo o quadro e a listagem
    Então os cartões e as linhas mostram o mesmo que antes
```

## Ambiguidades

- Nenhuma marca aberta.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Nome do campo na tela | "O que precisa ser feito", no modal e no bloco; "Descrição" fica só para o texto da abertura | 2026-11-09 |
| A instrução recolhe quando é longa? | Não: é o conteúdo principal e o limite é 2000 caracteres | 2026-11-09 |
| Aparece no cartão? | Não nesta spec | 2026-11-09 |
| Quem corrige e quando? | Gestor e administrador, em andamento; a API diz pelo `acoesPermitidas` | 2026-11-09 |
| Onde fica o botão de corrigir? | No cabeçalho do bloco, onde o texto aparece; não em "Mais ações" | 2026-11-09 |
| O que o responsável vê quando a instrução muda? | O bloco novo e o histórico com o texto anterior, na hora, se estiver com a tela aberta; sem notificação ativa | 2026-11-09 |
| Triadas antigas | Aviso discreto; sem inventar texto a partir de comentários | 2026-11-09 |

## Métricas de sucesso

- Um responsável lê o que fazer sem rolar o histórico: o bloco é o primeiro conteúdo do detalhe.
- 0 triagens feitas pela tela sem instrução.
- 0 requisições novas por detalhe aberto.
- 100% das correções de instrução aparecem no histórico do detalhe aberto de outro usuário sem recarregar.
- 0 quebras da linha do tempo por tipo de atividade desconhecido.
