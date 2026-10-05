# Especificação — Falhas visíveis de upload e exportação

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#112 (prioridade alta). Relacionadas:
OtavioProcopio/rgm-backend#86 (corrigida, em `develop` do backend) e
OtavioProcopio/rgm-backend#91 (solução definitiva, ainda aberta).

## Problema

Em onze pontos a tela captura o erro, registra só no console do navegador e segue como se
tivesse dado certo:

- **Foto anexada junto de uma ação:** na abertura, na triagem, na conclusão e na devolução.
  A ação acontece, a foto não é enviada e ninguém é avisado.
- **Exportação de PDF:** relatório de solicitações, ranking de modelos, lista de modelos e
  ficha do modelo. O botão é clicado e nada acontece.

O usuário acredita que anexou a foto ou gerou o relatório. Na abertura isso acontecia sempre
com operadores, porque a API recusava o envio.

Além disso, o limite de tipo e de tamanho do arquivo é conferido de formas diferentes em cada
tela, e nenhuma delas aceita todos os tipos que a API aceita.

## Objetivo

Toda falha de upload ou de exportação aparece na tela, em português, dizendo o que deu certo
e o que não deu, com um caminho para resolver. Arquivo fora da regra é recusado antes de
qualquer envio.

## Fora de escopo

- Enviar o arquivo no mesmo pedido da ação (OtavioProcopio/rgm-backend#91).
- Barra de progresso de upload.
- Componente global de notificação (toast); ver Ambiguidades.
- Outros erros que já aparecem na tela.

## Personas e cenários de uso

- **Operador** abre uma solicitação com foto do problema.
- **Gestor** tria, conclui ou devolve anexando foto, pelo quadro ou pelo detalhe.
- **Gestor ou administrador** exporta relatórios em PDF.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Quando a ação é concluída e o envio da foto falha, a tela deve informar que a ação foi feita e que a foto não foi enviada, nomeando a ação | obrigatório |
| RF-02 | O aviso de RF-01 deve oferecer "Tentar novamente", que reenvia o mesmo arquivo sem refazer a ação | obrigatório |
| RF-03 | O aviso de RF-01 deve dizer que a foto pode ser anexada depois, pelo detalhe da solicitação | obrigatório |
| RF-04 | Enquanto o aviso de RF-01 estiver aberto, o usuário não deve ser levado para outra tela automaticamente; ele dispensa o aviso ou segue por um botão | obrigatório |
| RF-05 | Se a nova tentativa der certo, o aviso deve ser substituído pela confirmação de envio | obrigatório |
| RF-06 | Arquivo deve ser recusado antes do envio quando passa de 10 MB ou não é JPEG, PNG, GIF, WebP, PDF ou MP4, com mensagem que diz o limite | obrigatório |
| RF-07 | A regra de RF-06 deve ser a mesma em toda tela que anexa evidência; telas que só aceitam imagem continuam restritas a imagem | obrigatório |
| RF-08 | Falha em qualquer exportação de PDF deve mostrar mensagem de erro visível junto do botão que a disparou | obrigatório |
| RF-09 | Nenhuma falha de upload ou de exportação deve ficar registrada apenas no console | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Acessibilidade do aviso | aviso de falha exposto com papel de alerta em 100% dos casos de RF-01 e RF-08 |
| RNF-02 | Regra medida | o módulo de validação de arquivo tem pelo menos 95% de cobertura de linhas e de ramos |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Falhas visíveis de upload e exportação

  Cenário: Triagem feita, foto não enviada
    Dado que estou triando uma solicitação com uma foto anexada
    Quando a triagem é aceita e o envio da foto falha
    Então vejo "A solicitação foi triada, mas a foto não foi enviada."
    E vejo o botão "Tentar novamente"
    E vejo que posso anexar a foto depois pelo detalhe

  Cenário: Nova tentativa dá certo
    Dado que vejo o aviso de foto não enviada
    Quando aciono "Tentar novamente" e o envio é aceito
    Então o aviso é substituído por "Foto enviada."
    Mas a triagem não é refeita

  Cenário: Abertura com foto que falha
    Dado que estou abrindo uma solicitação com foto
    Quando a solicitação é criada e o envio da foto falha
    Então continuo na tela com o aviso de foto não enviada
    E vejo um botão para ir ao detalhe da solicitação
    Mas não sou levado ao detalhe automaticamente

  Cenário: Arquivo grande demais
    Quando escolho um arquivo de 11 MB
    Então vejo "Arquivo muito grande. O limite é 10 MB."
    Mas nenhum envio é feito

  Cenário: Tipo não aceito
    Quando escolho um arquivo ".exe"
    Então vejo que os tipos aceitos são JPEG, PNG, GIF, WebP, PDF e MP4
    Mas nenhum envio é feito

  Cenário: Vídeo aceito
    Quando escolho um arquivo MP4 de 5 MB como evidência
    Então o envio é feito

  Cenário: Exportação falha
    Dado que estou na lista de solicitações
    Quando aciono a exportação de PDF e a API responde com erro
    Então vejo uma mensagem de erro junto do botão de exportar
```

## Ambiguidades

Nenhuma em aberto.

- **Toast ou mensagem ao lado do botão** (a issue admite os dois): mensagem na própria
  tela, junto de onde a ação foi disparada. Decisão tomada em 2026-10-05 por não existir
  componente de notificação no projeto e porque o aviso de upload precisa de botão de
  ação, que fica mal num toast que some sozinho. Um toast pode vir com a issue #116.

## Métricas de sucesso

- Nenhum relato de "anexei a foto e ela não apareceu" sem que a tela tenha avisado.
