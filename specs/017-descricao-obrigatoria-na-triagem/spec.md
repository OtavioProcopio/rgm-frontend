# Especificação — Descrição do que fazer, obrigatória na triagem

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: relato do usuário em 2026-10-31 (sem issue). Par no backend: `rgm-backend` spec 014
(PR #139). Base: `main` com a spec 016.

> **Registro de processo (honestidade):** esta mudança foi **codificada e aberta como PR #174
> antes desta spec existir**, sem passar por `/bu:specify`, `/bu:plan` e `/bu:tasks`. Foi feita
> primeiro como campo opcional salvo como comentário e, depois da correção do usuário, como
> campo obrigatório enviado na triagem. O usuário apontou o desvio. Esta spec a absorve e a
> convergência a confronta com o código que já estava na branch.

## Problema

1. **A tela de triagem não tem onde dizer o que fazer.** Ao triar, o gestor escolhe prioridade e
   responsáveis, mas o único campo de texto ("Observação") só aparece depois de anexar uma foto.
   Quem não tem foto não consegue escrever a instrução.
2. **A instrução não faz parte da decisão.** Mesmo com foto, o texto era a descrição da foto,
   opcional, e não da triagem. A solicitação podia entrar em andamento sem dizer o que fazer.

**Custo de não resolver:** o responsável recebe a solicitação sem instrução e pergunta fora do
sistema; a triagem é uma decisão incompleta.

## Objetivo

- A tela de triagem sempre mostra o campo "Descrição do que precisa ser feito", e a triagem só
  é confirmada com ele preenchido.
- A foto continua opcional e deixa de carregar texto próprio.
- A descrição é enviada na própria triagem (spec 014 do backend), não como comentário à parte.

## Fora de escopo

- Mostrar a instrução no card ou no cabeçalho do detalhe (hoje ela aparece no histórico).
- Editar a descrição depois de triar.
- Triagens já feitas sem descrição.
- Qualquer mudança nas demais ações (devolver, encerrar, cancelar).

## Personas e cenários de uso

- **Gestor e administrador:** trocam a prioridade e os responsáveis e dizem o que fazer, pelo
  quadro ou pelo detalhe.
- **Responsável (operador):** lê a instrução no histórico da solicitação.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A tela de triagem mostra sempre o campo "Descrição do que precisa ser feito", com ou sem foto anexada | obrigatório |
| RF-02 | O campo é obrigatório: vazio ou só com espaços, "Confirmar triagem" não envia e mostra "Descreva o que precisa ser feito" | obrigatório |
| RF-03 | O campo aceita até 2000 caracteres e mostra o que resta | obrigatório |
| RF-04 | A descrição, sem os espaços das pontas, segue na triagem como parte da decisão; não é enviada como comentário nem como texto da foto | obrigatório |
| RF-05 | A foto continua opcional; anexada, é enviada como instrução de serviço, sem texto próprio, e a falha do envio mantém o aviso com "Tentar novamente" | obrigatório |
| RF-06 | O erro de prioridade e de responsáveis continua como antes, e todos os erros do formulário aparecem juntos | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Cobertura dos arquivos tocados | ≥ 95% de linhas por arquivo (Princípio 10) |
| RNF-02 | Verificação | `make validate` com 0 falhas e 0 erros de lint e de tipos |
| RNF-03 | Acessibilidade | O campo tem rótulo associado e o erro é anunciado junto do campo |
| RNF-04 | Sem requisição extra | A triagem faz a mesma requisição de antes mais, só se houver foto, o envio da foto |

## Ordem de publicação (Princípio 9)

Este front depende da `descricao` na triagem, que só existe no backend com a spec 014. Os dois
são publicados **juntos, com o backend primeiro no mesmo deploy**, e esta spec **não** traz
comportamento de reserva: contra um backend anterior, o campo `descricao` é ignorado sem aviso
e a instrução se perde. Publicar este front contra backend sem a spec 014 não é suportado.

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Descrição do que fazer na triagem

  Cenário: Campo visível sem foto
    Dado que abri "Triar solicitação"
    Quando a tela abre
    Então vejo o campo "Descrição do que precisa ser feito"
    E não preciso anexar foto para vê-lo

  Cenário: Triar sem descrição
    Dado que escolhi a prioridade e um responsável
    Quando aciono "Confirmar triagem" sem escrever a descrição
    Então vejo "Descreva o que precisa ser feito"
    E nenhuma requisição de triagem é feita

  Cenário: Descrição só com espaços
    Dado que escrevi apenas espaços na descrição
    Quando aciono "Confirmar triagem"
    Então vejo "Descreva o que precisa ser feito"

  Cenário: Triar com descrição
    Dado que escolhi prioridade, um responsável e escrevi "  Trocar o gabarito  "
    Quando aciono "Confirmar triagem"
    Então a triagem é enviada com a descrição "Trocar o gabarito"
    E nenhum comentário é criado

  Cenário: Limite de 2000 caracteres
    Dado o campo de descrição
    Quando tento escrever mais de 2000 caracteres
    Então o campo não aceita o excedente
    E mostra quantos caracteres restam

  Cenário: Foto opcional
    Dado que escrevi a descrição e não anexei foto
    Quando aciono "Confirmar triagem"
    Então a triagem é feita sem envio de foto

  Cenário: Foto anexada
    Dado que escrevi a descrição e anexei uma foto
    Quando aciono "Confirmar triagem"
    Então a triagem é enviada e a foto segue como instrução de serviço, sem texto

  Cenário: Foto não enviada depois da triagem
    Dado que a triagem foi feita e o envio da foto falhou
    Então vejo "A solicitação foi triada, mas a foto não foi enviada."
    E posso tentar de novo

  Cenário: Todos os erros juntos
    Dado que não escolhi prioridade, responsável nem escrevi a descrição
    Quando aciono "Confirmar triagem"
    Então vejo os três erros ao mesmo tempo
```

## Ambiguidades

- Nenhuma marca aberta.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| A descrição é obrigatória? | Sim; a foto continua opcional | 2026-10-31 |
| É um comentário? | Não: é uma decisão, parte da triagem | 2026-10-31 |

## Métricas de sucesso

- 0 triagens feitas pela tela sem descrição.
- 0 comentários criados pela triagem.
