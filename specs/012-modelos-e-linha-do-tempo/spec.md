# Especificação — Modelos e linha do tempo: ficha do modelo com foto em destaque e histórico da solicitação em linha do tempo

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: OtavioProcopio/rgm-frontend#145 (modelos) e #130 (detalhe da solicitação),
reescritas em 2026-10-08 depois da análise de usabilidade (capturas em
`/root/rgm/evidencias/analise-ux-2026-10-08/`). É a **spec C** de cinco. Usa o que a spec 011
entregou (cabeçalho de página com "Mais ações", menu, seção recolhível, barra lateral
recolhível). O usuário apontou a ficha do modelo como a tela mais feia do sistema e pediu
um front operacional, fácil e rápido para a fábrica.

## Problema

Medição de 2026-10-08, em `develop` (`946342a`), com 496 solicitações e 206 modelos.

### Ficha do modelo

1. **A foto, que é o que identifica o molde, é uma fileira de miniaturas de 80 px.** Ao lado
   dela há cerca de 700 px de espaço vazio em 1440 px. A foto de capa só tem destaque nas
   listagens.
2. **Dados em lista de rótulos soltos**, em largura total, com o mesmo peso do título:
   "Tipo do Modelo: Não definido" e "Pendência aberta: Sim" ocupam o mesmo espaço que o
   código.
3. **Dois históricos que se sobrepõem.** "Eventos do Modelo" e "Histórico de Solicitações"
   listam as mesmas solicitações concluídas, uma como cartão grande e outra como linha.
4. **Indicadores que não dizem nada:** "Tempo médio de resolução 0h" e "Intervalo médio
   entre solicitações 0h" aparecem para duração menor que uma hora ou sem dado.
5. **Página linear de cerca de 1.850 px** (2.800 px no celular), sem como ir direto ao que
   se procura.

### Lista de modelos

6. O código, longo, quebra em duas linhas em negrito grande e vira o título; a descrição,
   que identifica o modelo para quem está na fábrica, fica em segundo plano.
7. O selo "Ativo" aparece em quase todos os cartões e vira ruído; a foto ocupa pouco do
   cartão; "Ver detalhes →" repete o que o cartão inteiro deveria fazer.

### Detalhe da solicitação

8. **O resumo não diz de quem é nem quando vence:** não mostra responsáveis nem prazo; a
   data aparece com segundos ("05/10/2026, 12:26:29").
9. **Várias ações com o mesmo peso.** Em "Em validação", um gestor vê "Alterar
   responsáveis", "Devolver" e "Encerrar", com "Devolver" e "Encerrar" ambos em destaque.
10. **O histórico é difícil de ler:** todo evento tem o mesmo peso; autor e hora se repetem
    em cada linha; "Status alterado: A fazer → Em andamento" é uma frase, sem os estados
    como selos; não há agrupamento por dia; a ordem é do mais antigo para o mais novo, então
    o que acabou de acontecer fica no fim da página.
11. **Para comentar é preciso rolar até depois de todo o histórico.**
12. **"Voltar" leva sempre ao quadro**, mesmo para quem chegou pela ficha de um modelo ou
    pelo painel.

**Custo de não resolver:** quem abre a ficha de um molde na fábrica não reconhece o molde
pela foto, e quem abre uma solicitação não vê de relance de quem é, quando vence, o que
aconteceu por último e o que fazer agora.

## Objetivo

Depois desta entrega:

- a ficha do modelo mostra a foto em tamanho que permite reconhecer o molde, com os dados
  principais ao lado e uma ação principal clara;
- a ficha tem um histórico só, em ordem do mais recente para o mais antigo, sem repetição;
- a lista de modelos mostra cartões limpos, em que o cartão inteiro abre o modelo;
- o detalhe da solicitação mostra de relance de quem é, quando vence e qual é o próximo
  passo, com uma ação principal por etapa;
- o histórico da solicitação é uma linha do tempo legível, e comentar não exige rolar até o
  fim.

## Fora de escopo

- **Dashboard (#144), card do quadro (#129), estados e avisos de ação (#126), triagem com
  busca (#132), tela de entrada (#131).** Trilhas próprias.
- **Ação principal fixa na base do celular** (a #145 sugeria): a base do celular já é da
  barra de abas da spec 011; duas barras fixas na base tirariam altura útil. A ação
  principal fica no topo.
- **Busca única nos filtros da lista de modelos:** os filtros recolhíveis da spec 011 ficam
  como estão.
- **Permissão de editar e de anexar evidência vinda da API:** a lista de ações permitidas da
  API só traz as seis ações da solicitação (triar, alterar responsáveis, enviar para
  validação, devolver, encerrar e cancelar); editar e anexar seguem decididos como hoje.
- **Novos indicadores, novos dados ou novos endpoints.** Nenhuma mudança de contrato com a
  API; o que a tela precisa e a API não entrega vira pergunta, não campo novo.
- **Editar, excluir ou reordenar fotos da galeria além do que existe hoje** (adicionar e
  marcar como capa).
- **Evidências da solicitação** (envio, lista e exclusão): continuam como estão.
- **Conteúdo e regra das ações** (diálogos de triagem, encerramento, devolução): só muda
  onde elas aparecem e qual é a principal.

## Personas e cenários de uso

- **Operador no chão de fábrica**, com um molde na mão, abre o modelo pelo celular e
  confere se é aquele pela foto grande e pelo código.
- **Gestor no escritório** abre uma solicitação "Em validação" e vê, sem rolar, quem é o
  responsável, se está atrasada e qual é a ação que fecha a etapa.
- **Administrador**, na ficha de um modelo, vê a foto de capa grande, o histórico do mais
  recente para o mais antigo e a ação "Editar".
- **Quem acompanha uma solicitação** lê "o que aconteceu hoje" no topo do histórico e
  comenta sem rolar até o fim da página.

## Requisitos funcionais

### Ficha do modelo

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A ficha do modelo deve mostrar a foto de capa em tamanho grande, ao lado da identificação e dos dados do modelo em tela larga, e no topo, em largura total, em tela estreita | obrigatório |
| RF-02 | Sem foto de capa, a ficha deve mostrar no mesmo lugar e tamanho um espaço com as duas primeiras letras do código, como a lista já faz | obrigatório |
| RF-03 | As demais fotos da galeria devem aparecer como miniaturas abaixo da foto grande; escolher uma miniatura deve trocar a foto grande por ela; tocar na foto grande deve abrir a galeria ampliada no diálogo que já existe | obrigatório |
| RF-04 | A identificação deve mostrar o código e a versão em destaque, com o código em fonte monoespaçada, a descrição logo abaixo e os selos de estado ("Ativo" ou "Inativo", e "Pendência aberta" quando houver) ao lado | obrigatório |
| RF-05 | Máquina, tipo, criação e atualização devem aparecer numa grade compacta de duas colunas, ao lado ou abaixo da foto, sem ocupar a largura toda | obrigatório |
| RF-06 | A ação principal da ficha continua sendo "Editar", com as demais em "Mais ações" (spec 011); "Adicionar foto" é um botão junto da foto, ao lado das miniaturas, só para quem pode gerenciar as fotos, e não entra no menu | obrigatório |
| RF-07 | O conteúdo abaixo da identificação deve estar em duas abas, "Resumo" e "Histórico", que trocam o conteúdo na mesma página: "Resumo" traz as observações e os indicadores das solicitações do modelo; "Histórico" traz a linha do tempo de RF-08. A lista de solicitações do modelo deixa de ser um bloco à parte e passa a fazer parte do histórico | obrigatório |
| RF-08 | O histórico da ficha deve ser uma linha do tempo só, do mais recente para o mais antigo, agrupada por dia, com os eventos do modelo e a abertura de cada solicitação, em que cada solicitação aparece uma vez (pelo evento dela, se houver; senão pela abertura, com o status) e leva à solicitação | obrigatório |
| RF-09 | Os indicadores da ficha devem mostrar durações menores que uma hora em minutos (e menores que um minuto em segundos), e "Sem dados ainda" quando a API não informa valor, nunca "0h" | obrigatório |

### Lista de modelos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-10 | Cada cartão da lista de modelos deve mostrar a foto de capa maior que hoje, a descrição como título, o código em fonte monoespaçada e menor, e selo só para o que foge do normal ("Inativo", "Pendência aberta"); o selo "Ativo" não aparece | obrigatório |
| RF-11 | O cartão inteiro deve abrir o modelo, por toque, clique e teclado, e o texto "Ver detalhes →" deve sair; a mudança vale para os cartões da lista de operação e não altera a tabela da lista de administração | obrigatório |

### Detalhe da solicitação

| ID | Requisito | Prioridade |
|---|---|---|
| RF-12 | O resumo deve mostrar status, prioridade, prazo ("vence em 5 h" ou "atrasada há 2 d"), responsáveis, modelo (com link) e quem abriu, com datas em forma relativa ("há 3 h") e a data completa, sem segundos, ao passar o ponteiro ou focar; a API informa só os identificadores, então os nomes de quem abriu e dos responsáveis vêm da lista de usuários que o front já carrega para os responsáveis disponíveis: com o nome conhecido, mostra o nome; sem ele, mostra "N responsáveis" no lugar dos responsáveis e omite a linha de quem abriu | obrigatório |
| RF-13 | O detalhe deve ter uma única ação principal por etapa e perfil, e as demais ações no menu "Mais ações" (spec 011): "Triar" é a principal em "A fazer", "Enviar para validação" em "Em andamento" e "Encerrar" em "Em validação"; "Alterar responsáveis" e "Devolver" ficam no menu; "Cancelar", quando existir, fica no fim do menu, separada, em cor de perigo e confirmada | obrigatório |
| RF-14 | O histórico da solicitação deve ser uma linha do tempo do mais recente para o mais antigo, agrupada por dia ("Hoje", "Ontem", a data), em que a mudança de status mostra os dois estados como selos, o autor aparece com iniciais e nome uma vez por evento, a hora aparece em forma relativa com a completa ao passar o ponteiro, o comentário aparece como balão com o texto em destaque e os eventos automáticos (atribuição, mudança de status) têm menos peso que comentários e evidências | obrigatório |
| RF-15 | Numa linha do tempo longa, os eventos mais antigos devem ficar recolhidos atrás de "Mostrar N eventos anteriores": com mais de 10 eventos, ficam visíveis os 10 mais recentes; com 10 ou menos, todos | obrigatório |
| RF-16 | O campo de comentário deve ficar junto da linha do tempo, ao alcance sem rolar até o fim da página, e só aparecer enquanto a solicitação pode receber comentário | obrigatório |
| RF-17 | "Voltar" deve levar à tela de onde o usuário veio, e ao quadro de solicitações quando não houver tela anterior | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Foto de capa em destaque | em 1440 × 900, a foto de capa ocupa pelo menos 40% da largura útil, acima da primeira dobra, sem espaço vazio maior que 80 px ao lado dela; em 390 × 844, ocupa a largura toda |
| RNF-02 | O essencial acima da primeira dobra | em 1440 × 900 e em 390 × 844, a ficha do modelo mostra foto, código, selos e ação principal; o detalhe da solicitação mostra status, prazo, responsáveis e ação principal |
| RNF-03 | Ações visíveis | no máximo 1 ação principal e 1 botão "Mais ações" no cabeçalho de cada uma das duas telas; hoje o detalhe da solicitação em "Em validação" mostra 3 botões lado a lado |
| RNF-04 | Leitura do histórico | coluna de texto da linha do tempo com no máximo 720 px de largura; com 20 eventos, dia, autor, tipo e resultado visíveis em cada um, sem rolagem horizontal |
| RNF-05 | Área de toque e foco | 0 controles novos com menos de 44 px em 390 px com toque; contorno de foco de 2 px visível em todo controle novo (critério das specs 007, 010 e 011) |
| RNF-06 | Contraste | no mínimo 4,5:1 para texto e 3:1 para ícone e contorno de foco nos elementos novos, nos dois temas |
| RNF-07 | Moldura | no máximo 2 níveis de moldura em cada tela, medido em 1440 px e em 390 px |
| RNF-08 | Coleção de dados | a ficha mostra os mesmos dados de hoje, sem perder nenhum: 0 campos removidos |
| RNF-09 | Cobertura | no mínimo 95% de linha, função, ramo e instrução em **cada** arquivo alterado, medido por `make cover-arquivos` |
| RNF-10 | Dependências | 0 dependências novas |
| RNF-11 | Compatibilidade | funciona com a API v1.5.0 em produção; nenhuma mudança de contrato; onde o dado novo falta, a tela mostra o que tem (Princípio 9) |
| RNF-12 | Ordem do histórico | 100% das linhas do tempo, da ficha e da solicitação, do mais recente para o mais antigo |

## Critérios de aceite

Escritos em DADO / QUANDO / ENTÃO / MAS. Cada critério vira um teste no arquivo indicado no
`tasks.md`, com o nome do cenário (decisão do usuário de 2026-10-07, spec 010).

```gherkin
# language: pt
Funcionalidade: Modelos e linha do tempo

  # Ficha do modelo

  Cenário: Foto de capa em destaque
    Dado um modelo com foto de capa
    Quando o usuário abre a ficha em tela larga
    Então a foto de capa aparece grande ao lado da identificação e dos dados
    Mas não aparece como uma fileira de miniaturas de 80 px

  Cenário: Foto de capa em tela estreita
    Dado um modelo com foto de capa
    Quando o usuário abre a ficha em 390 px
    Então a foto de capa aparece no topo, em largura total

  Cenário: Modelo sem foto de capa
    Dado um modelo sem foto de capa
    Quando o usuário abre a ficha
    Então aparece, no mesmo tamanho da foto, um espaço com as duas primeiras letras do código

  Cenário: Trocar a foto grande por uma miniatura
    Dado um modelo com quatro fotos na galeria
    Quando o usuário escolhe a terceira miniatura
    Então a foto grande passa a ser a terceira foto
    Mas a foto de capa continua marcada como capa

  Cenário: Ampliar a foto
    Dado a ficha de um modelo com fotos
    Quando o usuário toca na foto grande
    Então a galeria ampliada abre no diálogo, com o foco preso e Esc para fechar

  Cenário: Identificação do modelo
    Dado um modelo ativo com pendência aberta
    Quando o usuário abre a ficha
    Então o código e a versão aparecem em destaque, o código em fonte monoespaçada
    E a descrição aparece logo abaixo
    E os selos "Ativo" e "Pendência aberta" aparecem ao lado

  Cenário: Dados em grade compacta
    Dado a ficha de um modelo
    Quando o usuário abre a ficha em tela larga
    Então máquina, tipo, criação e atualização aparecem numa grade de duas colunas
    Mas nenhum dado ocupa a largura toda da página

  Cenário: Ação principal e menu
    Dado a ficha de um modelo aberta por um administrador
    Quando a tela carrega
    Então o cabeçalho mostra "Editar" como ação principal e o botão "Mais ações"

  Cenário: Abas Resumo e Histórico
    Dado a ficha de um modelo
    Quando a ficha abre
    Então existem as abas "Resumo" e "Histórico", com "Resumo" aberta
    E escolher "Histórico" troca o conteúdo pela linha do tempo, na mesma página
    Mas não existe uma aba "Solicitações"

  Cenário: Adicionar foto junto da foto
    Dado a ficha de um modelo aberta por quem pode gerenciar as fotos
    Quando a ficha abre
    Então o botão "Adicionar foto" aparece junto das miniaturas
    Mas não aparece no menu "Mais ações"

  Cenário: Sem permissão para fotos
    Dado a ficha de um modelo aberta por quem não pode gerenciar as fotos
    Quando a ficha abre
    Então o botão "Adicionar foto" não aparece

  Cenário: Histórico único do modelo
    Dado um modelo com uma solicitação concluída que gerou um evento
    Quando o usuário abre o histórico da ficha
    Então a solicitação aparece uma vez
    E ela leva à solicitação
    Mas não aparece também numa segunda lista

  Cenário: Solicitação sem evento no histórico
    Dado um modelo com uma solicitação aberta que ainda não gerou evento
    Quando o usuário abre o histórico da ficha
    Então a abertura da solicitação aparece com o status dela
    E leva à solicitação

  Cenário: Histórico do mais recente para o mais antigo
    Dado um modelo com eventos de três dias diferentes
    Quando o usuário abre o histórico
    Então os eventos aparecem agrupados por dia, do dia mais recente para o mais antigo

  Cenário: Duração curta nos indicadores
    Dado um modelo cujo tempo médio de resolução é de 12 minutos
    Quando o usuário abre a ficha
    Então o indicador mostra "12 min"
    Mas não mostra "0h"

  Cenário: Indicador sem dado
    Dado um modelo sem solicitação concluída
    Quando o usuário abre a ficha
    Então o indicador de tempo médio mostra "Sem dados ainda"

  # Lista de modelos

  Cenário: Cartão do modelo
    Dado um modelo ativo, sem pendência, com foto de capa
    Quando a lista de modelos abre
    Então o cartão mostra a foto maior, a descrição como título e o código pequeno em fonte monoespaçada
    Mas não mostra o selo "Ativo"

  Cenário: Selos só para exceções
    Dado um modelo inativo com pendência aberta
    Quando a lista de modelos abre
    Então o cartão mostra os selos "Inativo" e "Pendência aberta"

  Cenário: Cartão inteiro abre o modelo
    Dado a lista de modelos
    Quando o usuário toca em qualquer ponto do cartão
    Então a ficha do modelo abre
    Mas não existe o texto "Ver detalhes →"

  Cenário: Cartão por teclado
    Dado o foco num cartão da lista
    Quando o usuário aperta Enter
    Então a ficha do modelo abre

  # Detalhe da solicitação

  Cenário: Resumo completo
    Dado uma solicitação em andamento, com prioridade alta, responsável e prazo
    Quando o usuário abre o detalhe
    Então o resumo mostra status, prioridade, prazo, responsáveis, modelo com link e quem abriu

  Cenário: Nome do responsável conhecido
    Dado uma solicitação com um responsável que está na lista de responsáveis disponíveis
    Quando o usuário abre o detalhe
    Então o resumo mostra o nome do responsável

  Cenário: Nome do responsável desconhecido
    Dado uma solicitação com dois responsáveis que não estão na lista carregada
    Quando o usuário abre o detalhe
    Então o resumo mostra "2 responsáveis"
    E a linha de quem abriu não aparece se o nome também não é conhecido

  Cenário: Prazo vencido
    Dado uma solicitação atrasada há dois dias
    Quando o usuário abre o detalhe
    Então o prazo aparece como "atrasada há 2 d" em cor de perigo

  Cenário: Datas relativas
    Dado uma atividade de três horas atrás
    Quando o usuário abre o detalhe
    Então a hora aparece como "há 3 h"
    E a data completa, sem segundos, aparece ao passar o ponteiro
    Mas a data não aparece com segundos

  Cenário: Uma ação principal por etapa
    Dado um gestor numa solicitação em validação
    Quando o detalhe abre
    Então existe um único botão em destaque, o da ação principal da etapa
    E as demais ações estão em "Mais ações"
    Mas "Devolver" e "Encerrar" não aparecem os dois em destaque

  Cenário: Cancelar separado e confirmado
    Dado o menu "Mais ações" de uma solicitação que pode ser cancelada
    Quando o usuário escolhe "Cancelar"
    Então abre uma confirmação
    E a solicitação só é cancelada depois da confirmação
    Mas "Cancelar" aparece no fim do menu, separado, em cor de perigo

  Cenário: Linha do tempo agrupada por dia
    Dado uma solicitação com atividades de hoje, de ontem e de uma semana atrás
    Quando o usuário abre o detalhe
    Então as atividades aparecem sob "Hoje", "Ontem" e a data, do dia mais recente para o mais antigo

  Cenário: Mudança de status com selos
    Dado uma atividade de mudança de status de "A fazer" para "Em andamento"
    Quando o usuário abre a linha do tempo
    Então a atividade mostra "A fazer" e "Em andamento" como dois selos, com uma seta entre eles

  Cenário: Comentário em destaque
    Dado uma atividade de comentário e uma de atribuição de responsável
    Quando o usuário abre a linha do tempo
    Então o comentário aparece como balão com o texto em destaque
    Mas a atribuição aparece com menos peso

  Cenário: Autor uma vez por evento
    Dado uma atividade feita por uma pessoa
    Quando o usuário abre a linha do tempo
    Então aparecem as iniciais e o nome da pessoa uma vez
    Mas o nome não se repete na mesma linha

  Cenário: Eventos antigos recolhidos
    Dado uma solicitação com mais eventos do que o limite
    Quando o usuário abre o detalhe
    Então os mais antigos ficam atrás de "Mostrar eventos anteriores"
    E tocar nesse controle mostra os que faltam

  Cenário: Comentar sem rolar até o fim
    Dado uma solicitação em andamento com vinte eventos
    Quando o usuário abre o detalhe
    Então o campo de comentário está junto da linha do tempo, sem exigir rolar até o fim da página

  Cenário: Solicitação encerrada não recebe comentário
    Dado uma solicitação concluída
    Quando o usuário abre o detalhe
    Então o campo de comentário não aparece

  Cenário: Voltar à tela de origem
    Dado um usuário que abriu a solicitação a partir da ficha de um modelo
    Quando ele aciona "Voltar"
    Então volta à ficha do modelo

  Cenário: Voltar sem tela anterior
    Dado um usuário que abriu o detalhe por um link direto
    Quando ele aciona "Voltar"
    Então vai ao quadro de solicitações

  # Acessibilidade

  Cenário: Alvos de toque
    Dado um aparelho de toque em 390 px
    Quando a ficha do modelo e o detalhe da solicitação aparecem
    Então cada controle novo tem pelo menos 44 px de lado
```

## Ambiguidades

Nenhuma em aberto; as respostas estão em **Esclarecimentos**.

Já decidido, sem pergunta:

- **Ordem do histórico:** do mais recente para o mais antigo, nas duas linhas do tempo
  (as duas issues pedem).
- **Ação principal na base do celular:** fora de escopo (a base é da barra de abas).
- **Alternância entre grade e lista densa na lista de modelos** (a #145 sugeria): fora desta
  especificação, porque o usuário não pediu e a fábrica precisa de rapidez, não de mais
  controles.
- **Cobertura:** 95% por arquivo, medida por `make cover-arquivos` (alvo criado na 011).

## Métricas de sucesso

- Quem tem um molde na mão o reconhece pela foto, sem abrir a galeria.
- Quem abre uma solicitação sabe, sem rolar, de quem é, quando vence e o que fazer.
- O histórico de qualquer solicitação ou modelo lê-se do mais novo para o mais antigo, sem
  repetição.
- Nenhuma tela de detalhe tem mais de uma ação em destaque.
- As medições de 1440 × 900 e 390 × 844 passam e ficam guardadas para as próximas specs
  visuais.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| RF-12: como mostrar os nomes de quem abriu e dos responsáveis, se a API informa só os identificadores? | Resolver pela lista de usuários que o front já carrega (responsáveis disponíveis); sem o nome, "N responsáveis" e a linha de quem abriu some | 2026-10-08 |
| RF-08: o que entra na linha do tempo única do modelo? | Eventos do modelo e a abertura de cada solicitação, cada uma uma vez | 2026-10-08 |
| RF-07: como organizar o conteúdo abaixo da identificação? | Duas abas, Resumo e Histórico; a lista de solicitações vira parte do histórico | 2026-10-08 |
| RF-13: a ação principal por etapa? | "Triar", "Enviar para validação" e "Encerrar"; "Alterar responsáveis" e "Devolver" no menu | 2026-10-08 |
| RF-06: onde fica "Adicionar foto"? | Botão junto da foto, não no menu | 2026-10-08 |
| RF-11: a mudança do cartão vale para qual lista? | Só os cartões da lista de operação; a tabela da administração não muda | 2026-10-08 |
| RF-15: a partir de quantos eventos a linha do tempo recolhe os antigos? | Mais de 10: mostra os 10 mais recentes | 2026-10-08 |
