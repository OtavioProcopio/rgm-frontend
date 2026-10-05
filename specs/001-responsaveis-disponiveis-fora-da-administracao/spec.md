# Especificação — Responsáveis disponíveis fora da administração

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#117 (prioridade baixa, `good first issue`).

## Problema

Para triar uma solicitação ou trocar os responsáveis, a tela precisa da lista de quem pode
ser responsável: operadores e gestores ativos. Hoje o quadro e o detalhe da solicitação
montam essa lista cada um por conta própria, buscando direto na área de administração de
usuários e repetindo o filtro de perfil.

As duas cópias já divergiram: no detalhe a lista carrega para gestor e administrador; no
quadro, só para administrador. Um gestor que tria pelo quadro abre o modal de triagem com a
lista de responsáveis vazia.

## Objetivo

Existe um único lugar que responde "quem pode ser responsável por uma solicitação", e o
quadro e o detalhe usam esse lugar. Gestor e administrador veem a mesma lista nos dois.

## Fora de escopo

- Busca de usuário por nome na API (a lista continua limitada aos 100 primeiros ativos; ver
  feature 005).
- Mudar quem a API aceita como responsável.
- Telas da área de administração de usuários.

## Personas e cenários de uso

- **Gestor ou administrador** tria uma solicitação pelo quadro ou pelo detalhe e escolhe os
  responsáveis numa lista.
- **Gestor ou administrador** troca os responsáveis de uma solicitação em andamento.
- **Operador** não tria nem troca responsáveis; para ele a lista não é buscada.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A lista de responsáveis disponíveis deve conter apenas usuários ativos com perfil OPERADOR ou GESTOR | obrigatório |
| RF-02 | A lista deve ser a mesma no quadro e no detalhe da solicitação, para o mesmo usuário | obrigatório |
| RF-03 | A lista deve ser buscada para GESTOR e ADMINISTRADOR, e não deve ser buscada para OPERADOR | obrigatório |
| RF-04 | O código de solicitações não deve conhecer a área de administração de usuários para montar essa lista | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Reuso da busca entre telas | abrir o quadro e depois o detalhe em menos de 5 minutos dispara 1 requisição de usuários, não 2 |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Responsáveis disponíveis fora da administração

  Cenário: Lista só com quem pode ser responsável
    Dado que existem um operador ativo, um gestor ativo, um administrador ativo e um operador inativo
    Quando um gestor abre o modal de triagem
    Então a lista mostra o operador ativo e o gestor ativo
    Mas não mostra o administrador nem o operador inativo

  Cenário: Gestor tria pelo quadro
    Dado que estou autenticado como gestor
    E existe uma solicitação em "A Fazer"
    Quando avanço o card para "Em Andamento"
    Então o modal de triagem lista os responsáveis disponíveis

  Cenário: Mesma lista no detalhe
    Dado que estou autenticado como gestor
    Quando abro "Alterar responsáveis" no detalhe de uma solicitação em andamento
    Então vejo a mesma lista de responsáveis que o quadro mostra

  Cenário: Operador não busca a lista
    Dado que estou autenticado como operador
    Quando abro o quadro
    Então nenhuma busca de usuários é feita
```

## Ambiguidades

Nenhuma em aberto.

- **Onde mora o hook** (a issue admite "na feature de usuários ou em shared"): decisão de
  plano, não de requisito.

## Métricas de sucesso

- Nenhum gestor relata lista de responsáveis vazia ao triar pelo quadro.
