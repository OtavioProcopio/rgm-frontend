# Especificação — Ações da solicitação reutilizáveis

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#115 (prioridade média). Relacionadas:
OtavioProcopio/rgm-backend#90 (já em `develop` do backend) e OtavioProcopio/rgm-frontend#112.

## Problema

As ações sobre uma solicitação (triar, enviar para validação, devolver, encerrar, cancelar,
trocar responsáveis) existem em dois lugares: no quadro, ao mover um card, e na página de
detalhe. Cada lugar tem a própria cópia do fluxo, da regra de quem pode fazer o quê e do
tratamento de erro. Qualquer ajuste precisa ser feito duas vezes, e as cópias já divergem.

A regra de permissão é recalculada na tela a partir do perfil e do status. A API passou a
informar, no detalhe da solicitação, quais ações o usuário autenticado pode executar, mas a
tela não usa essa informação.

## Objetivo

Cada ação existe uma vez e é usada pelo quadro e pelo detalhe com o mesmo comportamento. A
tela mostra exatamente as ações que a API diz serem permitidas, quando a API informa; quando
não informa, usa a regra local, que hoje já vale.

## Fora de escopo

- Mudar qualquer regra de permissão ou de transição de status.
- Mensagens de falha de upload (feature 003); aqui só se garante que o tratamento existe num
  lugar só.
- Aparência dos modais e componente base de modal (issue #116).
- Editar título e descrição, comentar e anexar evidência avulsa: seguem na página de detalhe.

## Personas e cenários de uso

- **Gestor ou administrador** tria, devolve, encerra, cancela e troca responsáveis, pelo
  quadro ou pelo detalhe.
- **Operador responsável** envia para validação, pelo quadro ou pelo detalhe.
- **Operador que abriu** cancela a própria solicitação enquanto ela não foi triada.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Cada ação (triar, enviar para validação, devolver, encerrar, cancelar, alterar responsáveis) deve ter o mesmo formulário, as mesmas validações e as mesmas mensagens de erro no quadro e no detalhe | obrigatório |
| RF-02 | Quando o detalhe da solicitação traz a lista de ações permitidas, a tela não deve oferecer ação fora dessa lista | obrigatório |
| RF-03 | Quando a lista de ações permitidas não vem (listagens, quadro, backend anterior à v1.6.0), a tela deve decidir pela regra local de perfil, status, autoria e responsabilidade, com o mesmo resultado de hoje | obrigatório |
| RF-04 | A regra local deve existir em um único lugar, usado pelo quadro e pelo detalhe | obrigatório |
| RF-05 | Mover um card no quadro deve abrir a mesma ação que o botão correspondente abre no detalhe | obrigatório |
| RF-06 | Uma ação que a API recusar deve mostrar a mensagem de erro no próprio formulário da ação, sem fechá-lo | obrigatório |
| RF-07 | Depois de uma ação concluída, o quadro, o detalhe e o histórico de atividades da solicitação devem refletir o novo estado sem recarregar a página | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Tamanho das telas | página de detalhe e componente do quadro com no máximo 300 linhas cada |
| RNF-02 | Regra medida | o módulo da regra local de ações tem pelo menos 95% de cobertura de linhas e de ramos |
| RNF-03 | Sem regressão | os 523 testes existentes continuam passando, ajustados só onde o arquivo testado mudou de lugar ou de contrato |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Ações da solicitação reutilizáveis

  Cenário: A API informa as ações
    Dado que o detalhe da solicitação informa as ações "DEVOLVER" e "ENCERRAR"
    Quando abro o detalhe
    Então vejo os botões "Devolver" e "Encerrar"
    Mas não vejo "Triar" nem "Enviar para validação"

  Cenário: A API não informa as ações
    Dado que o detalhe da solicitação não informa ações permitidas
    E sou gestor e a solicitação está em "A Fazer"
    Quando abro o detalhe
    Então vejo o botão "Triar"

  Cenário: Operador responsável envia para validação pelo quadro
    Dado que sou operador e responsável por uma solicitação em "Em Andamento"
    Quando avanço o card
    Então o formulário de envio para validação é aberto

  Cenário: Operador não responsável não move o card
    Dado que sou operador e não sou responsável pela solicitação
    Quando tento avançar o card
    Então nenhuma ação é aberta

  Cenário: Operador que abriu cancela antes da triagem
    Dado que sou operador e abri uma solicitação que está em "A Fazer" sem responsável
    Quando abro o detalhe
    Então vejo o botão "Cancelar"

  Cenário: Erro da API fica no formulário
    Dado que o formulário de triagem está aberto
    Quando confirmo e a API recusa a operação
    Então a mensagem de erro aparece no formulário
    Mas o formulário não fecha

  Cenário: Mesmo fluxo nos dois lugares
    Dado que sou gestor e a solicitação está em "Em Validação"
    Quando abro "Devolver" pelo detalhe e, em outra solicitação, movo o card para "Em Andamento"
    Então os dois formulários pedem os mesmos campos
```

## Ambiguidades

Nenhuma em aberto.

- **Backend em produção (v1.5.0) não informa as ações:** resolvido pelo RF-03 e pelo
  Princípio 9 do projeto. Não há ordem de publicação a respeitar.
- **Quadro e listagens não trazem as ações** (o backend só calcula no detalhe): o quadro
  usa sempre a regra local.

## Métricas de sucesso

- Um ajuste em uma ação passa a tocar um arquivo de ação, não dois de tela.
