# Especificação — Tempo real no quadro e no detalhe

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#113 (prioridade alta, a confirmar em produção).
Relacionadas: OtavioProcopio/rgm-backend#87 e OtavioProcopio/rgm-backend#88, as duas já em
`develop` do backend.

## Problema

O sistema promete que o quadro se atualiza sozinho quando alguém mexe numa solicitação. Na
prática há dois furos:

1. **O servidor web segura os eventos.** O proxy que fica na frente da API junta a resposta
   antes de repassar e encerra a conexão depois de 60 segundos sem tráfego. Os eventos
   chegam atrasados, em lote, ou não chegam. O quadro provavelmente só muda quando alguém
   recarrega a página.
2. **O detalhe não reage.** Quando um evento chega, só as listas são atualizadas. Quem está
   com o detalhe de uma solicitação aberto continua vendo o estado antigo, e pode agir em
   cima dele.

O backend passou a avisar também abertura, edição, comentário e troca de responsáveis, além
das mudanças de status, e a manter a conexão viva com um sinal periódico. A tela ainda não
ouve esses avisos novos.

## Objetivo

Uma mudança feita por um usuário aparece para os outros em poucos segundos, no quadro e no
detalhe, sem recarregar a página, e sem trocar dados por baixo de quem está preenchendo um
formulário.

## Fora de escopo

- Trocar o token na URL da conexão de eventos (OtavioProcopio/rgm-backend#93).
- Notificação fora da tela (push, e-mail, som).
- Edição colaborativa ou bloqueio de solicitação.
- Configuração de proxies que ficam fora deste repositório, na frente do servidor web da
  aplicação.

## Personas e cenários de uso

- **Gestor** acompanha o quadro aberto durante o turno e espera ver cards mudando de coluna.
- **Operador** está no detalhe de uma solicitação quando o gestor a devolve.
- **Gestor** está preenchendo o formulário de triagem quando outro gestor tria a mesma
  solicitação.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O servidor web deve repassar cada evento da conexão de tempo real assim que o recebe, sem acumular | obrigatório |
| RF-02 | A conexão de tempo real não deve ser encerrada pelo servidor web enquanto houver o sinal periódico do backend | obrigatório |
| RF-03 | As demais chamadas da API devem manter o comportamento atual do proxy | obrigatório |
| RF-04 | Ao receber um evento de solicitação, a tela deve atualizar as listas e o quadro | obrigatório |
| RF-05 | Ao receber um evento de uma solicitação cujo detalhe está aberto, o detalhe deve passar a mostrar na hora os dados que vieram no evento e, em seguida, confirmar com uma consulta do detalhe | obrigatório |
| RF-06 | Ao receber um evento ou um aviso de atividade (comentário) de uma solicitação, o histórico de atividades dela deve ser atualizado | obrigatório |
| RF-07 | Se houver um formulário de ação aberto para a solicitação que mudou, a tela deve mostrar "Atualizada por outro usuário" no formulário e não deve trocar o que o usuário digitou | obrigatório |
| RF-08 | A tela deve tratar os avisos novos do backend (abertura, edição, comentário e troca de responsáveis) da mesma forma que os de mudança de status | obrigatório |
| RF-09 | O evento não informa as ações permitidas e só informa os responsáveis quando o aviso é de troca de responsáveis; até a confirmação de RF-05 chegar, a tela deve manter os responsáveis que já mostrava e decidir as ações pela regra local da feature 002 | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Atraso do evento no servidor web | 0 bytes de buffer de resposta na rota de eventos |
| RNF-02 | Duração da conexão | tempo limite de leitura da rota de eventos de 1 hora, acima dos 30 minutos de conexão e dos 25 segundos do sinal do backend |
| RNF-03 | Compatibilidade | com backend v1.5.0, que só envia mudança de status e não envia sinal periódico, o quadro continua atualizando como hoje |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Tempo real no quadro e no detalhe

  Cenário: Quadro reage a mudança de outro usuário
    Dado que estou com o quadro aberto
    Quando outro usuário tria uma solicitação
    Então o card passa para "Em Andamento" sem eu recarregar a página

  Cenário: Detalhe reage a mudança de outro usuário
    Dado que estou no detalhe de uma solicitação em "Em Validação"
    Quando outro usuário a devolve
    Então o detalhe passa a mostrar "Em Andamento"
    E o histórico mostra a devolução

  Cenário: Comentário de outro usuário
    Dado que estou no detalhe de uma solicitação
    Quando outro usuário comenta nela
    Então o comentário aparece no histórico sem eu recarregar a página

  Cenário: Formulário aberto não é atropelado
    Dado que estou com o formulário de triagem de uma solicitação aberto e já digitei uma nota
    Quando outro usuário altera essa solicitação
    Então vejo "Atualizada por outro usuário" no formulário
    Mas a nota que digitei continua lá

  Cenário: Evento de outra solicitação não avisa
    Dado que estou com o formulário de triagem de uma solicitação aberto
    Quando outro usuário altera uma solicitação diferente
    Então não vejo o aviso "Atualizada por outro usuário"

  Cenário: Solicitação nova aparece no quadro
    Dado que estou com o quadro aberto
    Quando outro usuário abre uma solicitação
    Então o card aparece em "A Fazer"
```

## Ambiguidades

Nenhuma em aberto.

- **"Confirmar em produção"** (a issue não tem evidência de produção): a correção do
  servidor web é feita aqui porque a configuração atual retém eventos por definição. Se em
  produção houver outro proxy na frente (o `rgm-infra` decide isso), ele precisa da mesma
  regra; fica registrado como risco no plano, não como requisito desta feature.
- **Atualizar o detalhe só com o dado do evento** (texto da issue): não basta. Conferido no
  backend em 2026-10-05: o evento vem sem ações permitidas e com a lista de responsáveis
  vazia, exceto na troca de responsáveis. Por isso o RF-05 pede a confirmação por consulta.
- **Aviso com formulário aberto:** só avisa, não fecha o formulário nem recarrega os campos
  (texto da issue).

## Métricas de sucesso

- Com dois navegadores abertos em produção, a mudança feita em um aparece no outro em até
  5 segundos.
