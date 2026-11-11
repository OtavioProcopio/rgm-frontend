# Especificação — Catálogo de modelos com destaque, filtros por botão e fotos navegáveis

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: pedido do usuário em 2026-11-11 (sem issue), com POC em HTML aprovada
(`catalogo-poc.html`, em wireframe). Par no backend: `rgm-backend` spec 016. Base: `develop` na
`v1.7.0`.

## Problema

1. **O catálogo é uma grade de cartões iguais.** Todo modelo tem o mesmo peso, a foto de capa é
   pequena e, para ver as outras fotos ou os dados, é preciso abrir a ficha de cada um. Percorrer
   vários modelos em sequência (comparar, procurar o certo) custa um clique e uma página por modelo.
2. **Os filtros ficam escondidos.** Tipo e máquina só existem como filtro de administração; o
   catálogo de operação filtra por código, máquina e descrição em campos separados, sem botões.
3. **A navegação é por páginas numeradas**, que não combinam com "ir para o próximo modelo".
4. **O filtro por tipo não existe** no catálogo, embora o tipo seja a forma natural de achar um
   modelo na fundição.

**Custo de não resolver:** quem está no chão de fábrica gasta cliques e rolagem para achar e
conferir um modelo, e a foto, que é o que mais identifica uma peça, fica pequena.

## Objetivo

- Tipo e máquina escolhidos por **botões sempre visíveis**, somados a uma busca única por código
  ou descrição; a lista já responde ao filtro.
- O **primeiro modelo do filtro aparece grande**, com as fotos navegáveis, e a lista dos demais
  fica sempre ao lado, clicável.
- Um **Anterior / Próximo** troca o modelo grande sem sair da tela, e a lista carrega **por blocos**.

## Fora de escopo

- Editar, trocar a capa ou excluir foto na tela do catálogo (continua na ficha).
- Exportar PDF, comparar modelos lado a lado, favoritos ou ordenação além do código.
- Mudar a tela de administração de modelos e a ficha do modelo.
- Funcionar sem os parâmetros novos do backend (ver "Ordem de publicação").

## Personas e cenários de uso

- **Operador de chão de fábrica (muitas vezes em tela de toque):** escolhe a máquina e o tipo,
  olha as fotos do modelo e passa para o próximo até achar a peça.
- **Gestor e administrador:** procuram um modelo pelo código ou descrição e abrem a ficha.

## Requisitos funcionais

### Filtros

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A tela mostra sempre, antes do conteúdo, uma fileira de botões de **tipo** (os tipos ativos do catálogo, mais "Todos"), uma de **máquina** (as máquinas ativas do catálogo, mais "Todas"), o campo de busca, "Mostrar inativos" e "Limpar filtros" | obrigatório |
| RF-02 | Tipo e máquina aceitam um valor cada; clicar no botão já escolhido volta a "Todos"/"Todas"; os botões escolhidos ficam marcados | obrigatório |
| RF-03 | Cada botão de tipo e de máquina mostra quantos modelos traria com os **outros** filtros atuais; botão com 0 fica esmaecido e desabilitado, exceto o que já está escolhido | obrigatório |
| RF-04 | A busca procura no código e na descrição, sem diferenciar caixa nem acento, espera 300 ms depois da última tecla e só filtra a partir de 2 caracteres; com 1 caractere mostra a dica "Digite ao menos 2 letras" e não filtra | obrigatório |
| RF-05 | Por padrão só aparecem modelos ativos; "Mostrar inativos" inclui os inativos, marcados com o selo "Inativo" | obrigatório |
| RF-06 | Os modelos saem em ordem de código (e, no mesmo código, da versão maior para a menor) | obrigatório |
| RF-07 | Trocar qualquer filtro ou a busca leva a lista de volta ao início e faz o primeiro modelo do resultado virar o destaque, com a foto de capa | obrigatório |

### Destaque e fotos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-08 | O modelo em destaque aparece grande, à esquerda, com a foto, a descrição, o código e a versão, o tipo, a máquina, as observações, os selos "Inativo" e "Pendência aberta" quando valem e o botão "Abrir ficha completa", que leva à ficha atual do modelo | obrigatório |
| RF-09 | Abaixo da foto grande ficam as **miniaturas de todas as fotos** do modelo, com a capa primeiro; clicar numa miniatura troca a foto grande com transição suave (sem animação para quem pediu movimento reduzido); a miniatura da foto atual fica marcada | obrigatório |
| RF-10 | Sobre a foto grande há "foto anterior" e "próxima foto" (botões redondos de 44 px), que dão a volta (da última vai para a primeira); dentro da faixa de miniaturas, as setas do teclado trocam a foto | obrigatório |
| RF-11 | O destaque diz em que foto está ("foto 2 de 4") e qual é a capa; modelo com uma foto não mostra setas nem faixa; modelo sem foto mostra a sigla do código no lugar | obrigatório |
| RF-12 | A foto de capa do destaque aparece sem espera (já vem na listagem); as demais fotos carregam ao abrir o destaque, e as do modelo vizinho (anterior e próximo) são carregadas em segundo plano | obrigatório |

### Navegação e lista

| ID | Requisito | Prioridade |
|---|---|---|
| RF-13 | "Anterior" e "Próximo", com o contador "n de total", trocam o modelo em destaque dentro do filtro atual; o total é o do servidor, não o dos blocos carregados; "Anterior" fica desabilitado no primeiro e "Próximo" no último | obrigatório |
| RF-14 | As setas do teclado trocam de modelo quando o foco não está num campo nem na faixa de miniaturas | obrigatório |
| RF-15 | A lista fica sempre ao lado (abaixo, no celular): cada item mostra a miniatura da capa, a descrição, o código e os selos; o item do destaque fica marcado e rola para ficar visível; clicar num item o torna o destaque | obrigatório |
| RF-16 | A lista carrega **por blocos de 20**; ao final há "Carregar mais" com quantos faltam, e acima dela "mostrando X de Y" | obrigatório |
| RF-17 | "Próximo" no último modelo carregado carrega o bloco seguinte sozinho e avança para o primeiro dele | obrigatório |
| RF-18 | Os filtros, a busca, "Mostrar inativos" e o modelo em destaque ficam no endereço da página; um link copiado reabre igual; escolher um botão de filtro cria uma entrada no histórico do navegador, e a busca e a troca de modelo não | obrigatório |
| RF-19 | Se o modelo do endereço não está no primeiro bloco, a tela carrega os blocos seguintes até achá-lo (no máximo 5 blocos); se não achar, o primeiro do filtro vira o destaque e o endereço é corrigido | obrigatório |

### Estados e responsividade

| ID | Requisito | Prioridade |
|---|---|---|
| RF-20 | Carregando mostra esqueletos no destaque e na lista; falha da lista mostra a mensagem com "Tentar novamente"; resultado vazio mostra "Nenhum modelo neste filtro" com "Limpar filtros" | obrigatório |
| RF-21 | Se as contagens falharem, os botões aparecem sem número e continuam usáveis; se as fotos extras falharem, o destaque mantém a capa e avisa "Não foi possível carregar as outras fotos" com "Tentar novamente" | obrigatório |
| RF-22 | Em tela estreita (até 800 px) a tela vira uma coluna: filtros, destaque e lista, nessa ordem, sem rolagem horizontal; todo alvo de toque tem pelo menos 44 px | obrigatório |
| RF-23 | A tela de administração de modelos, a ficha do modelo e a rota `/app/modelos/:id` continuam como estão | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Poucas requisições | Por mudança de filtro: 1 de lista e 1 de contagens (a busca com debounce); por modelo em destaque: no máximo 1 de galeria, mais 2 em segundo plano para os vizinhos; 0 requisições para trocar de foto |
| RNF-02 | Troca de modelo percebida como imediata | Com o modelo já carregado, "Próximo" e o clique na lista mostram o novo destaque (com a capa) sem esperar rede |
| RNF-03 | Imagens | Foto grande com carregamento imediato; miniaturas e capas da lista com carregamento preguiçoso |
| RNF-04 | Sem dependência nova | 0 pacotes acrescentados a `package.json` |
| RNF-05 | Acessibilidade | Botões de filtro anunciam o estado ("pressionado"); o destaque é uma região que anuncia "descrição, n de total" ao trocar; miniaturas têm nome "Foto k de n" (e "capa"); foco visível; contraste AA nos dois temas pelos tokens (spec 010) |
| RNF-06 | Cobertura dos arquivos tocados | ≥ 95% de linhas por arquivo (Princípio 10); nenhum teste escrito só para cobrir linha |
| RNF-07 | Verificação | `make validate` com 0 falhas e 0 erros de lint e de tipos |

## Ordem de publicação (Princípio 9)

Este front depende, no backend, dos parâmetros `tipo`, `q`, `maquinaExata` e `ordem` da listagem
de modelos e da rota `GET /api/modelos/contagens` (spec 016). Os dois são publicados **com o
backend primeiro**. Esta spec **não** traz comportamento de reserva: contra um backend anterior
os filtros de tipo, a busca única e as contagens não funcionam.

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Catálogo de modelos com destaque

  Cenário: Filtros em botões, sempre visíveis
    Dado o catálogo de modelos
    Quando abro a tela
    Então vejo os botões de tipo e de máquina, a busca e "Mostrar inativos"
    E cada botão mostra a contagem de modelos que traria

  Cenário: Escolher tipo e máquina
    Quando escolho o tipo "Resina" e a máquina "FBOX"
    Então a lista traz só modelos de Resina da FBOX
    E o primeiro vira o destaque, com a capa
    E os dois botões ficam marcados

  Cenário: Voltar a Todos
    Dado que escolhi o tipo "Resina"
    Quando clico de novo em "Resina"
    Então o tipo volta a "Todos"

  Cenário: Botão sem modelos
    Dado que escolhi a máquina "LINHA 3"
    Quando um tipo não traria nenhum modelo
    Então o botão desse tipo aparece esmaecido e desabilitado

  Cenário: Busca
    Quando digito "carcaca" na busca
    Então a lista traz modelos cujo código ou descrição contêm "carcaça"
    E a busca respeita os botões escolhidos

  Cenário: Busca curta
    Quando digito 1 caractere
    Então vejo "Digite ao menos 2 letras"
    E a lista não muda

  Cenário: Primeiro modelo em destaque
    Dado um filtro com vários modelos
    Quando a lista carrega
    Então o primeiro, em ordem de código, aparece grande com foto, dados e "Abrir ficha completa"

  Cenário: Próximo e Anterior
    Dado o primeiro modelo em destaque, "1 de 48"
    Quando clico em "Próximo"
    Então o segundo vira o destaque, "2 de 48"
    E "Anterior" volta ao primeiro
    E "Anterior" está desabilitado no primeiro

  Cenário: Próximo carrega o bloco seguinte
    Dado 20 modelos carregados e o 20º em destaque
    Quando clico em "Próximo"
    Então o próximo bloco é carregado e o 21º vira o destaque

  Cenário: Clicar na lista
    Quando clico num modelo da lista
    Então ele vira o destaque e fica marcado na lista

  Cenário: Carregar mais
    Dado 48 modelos no filtro
    Quando abro a tela
    Então a lista mostra 20 e "Carregar mais (28 restantes)"
    E quando clico, mostra 40

  Cenário: Miniaturas e transição
    Dado um modelo com 4 fotos
    Quando clico na miniatura 3
    Então a foto grande troca com transição suave
    E o destaque diz "foto 3 de 4"
    E a miniatura 3 fica marcada

  Cenário: Movimento reduzido
    Dado que o sistema pede movimento reduzido
    Quando troco de foto
    Então a troca é imediata, sem animação

  Cenário: Setas da foto
    Dado a foto 4 de 4
    Quando clico em "próxima foto"
    Então volta à foto 1

  Cenário: Uma foto ou nenhuma
    Dado um modelo com uma foto
    Então não vejo setas nem faixa de miniaturas
    E um modelo sem foto mostra a sigla do código

  Cenário: Teclado
    Dado o foco fora de campos e da faixa de miniaturas
    Quando aperto a seta direita
    Então avanço para o próximo modelo
    E com o foco na faixa de miniaturas, a seta direita avança a foto

  Cenário: Mudar o filtro reinicia
    Dado o 7º modelo em destaque e a lista com 40 carregados
    Quando escolho outro tipo
    Então a lista volta ao início
    E o primeiro do novo resultado vira o destaque

  Cenário: Endereço compartilhável
    Dado o tipo "Resina", a máquina "FBOX", a busca "mancal" e um modelo em destaque
    Quando copio o endereço e o abro em outra aba
    Então vejo os mesmos filtros e o mesmo modelo em destaque

  Cenário: Modelo do endereço fora do primeiro bloco
    Dado um endereço com o 35º modelo do filtro
    Quando abro a tela
    Então os blocos são carregados até ele e ele aparece em destaque

  Cenário: Modelo do endereço inexistente
    Dado um endereço com um modelo que não está no filtro
    Quando abro a tela
    Então o primeiro do filtro vira o destaque e o endereço é corrigido

  Cenário: Histórico do navegador
    Quando escolho um botão de filtro e depois uso "Voltar" do navegador
    Então o filtro anterior volta
    E trocar de modelo ou digitar na busca não cria entrada no histórico

  Cenário: Vazio
    Quando o filtro não traz modelos
    Então vejo "Nenhum modelo neste filtro" e "Limpar filtros"

  Cenário: Falha da lista
    Quando a listagem falha
    Então vejo a mensagem e "Tentar novamente"

  Cenário: Falha das contagens
    Quando as contagens falham
    Então os botões aparecem sem número e continuam funcionando

  Cenário: Falha nas fotos extras
    Quando as fotos extras falham
    Então o destaque mantém a capa e avisa "Não foi possível carregar as outras fotos"

  Cenário: Celular
    Dado uma tela de 390 px
    Quando abro a tela
    Então vejo filtros, destaque e lista em uma coluna, sem rolagem horizontal

  Cenário: Administração e ficha iguais
    Quando abro a administração de modelos e a ficha de um modelo
    Então elas funcionam como antes
```

## Ambiguidades

- Nenhuma marca aberta.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Como carregar muitos modelos? | Por blocos (20), com "Carregar mais"; o "Próximo" carrega o bloco seguinte | 2026-11-11 |
| A maioria dos modelos tem foto? | Sim; sem foto mostra a sigla do código | 2026-11-11 |
| Miniaturas das fotos? | Sim, com transição entre elas | 2026-11-11 |
| Máquinas e tipos? | Os dois são filtros, por botão, no servidor | 2026-11-11 |
| Categoria = tipo de modelo? | Sim; a máquina é o segundo grupo de botões | 2026-11-11 |
| "Mostrar inativos" começa desmarcado? | Sim (decisão a confirmar): hoje a grade mostra inativos; o catálogo de operação passa a esconder, com a opção de mostrar | 2026-11-11 |
| Ordem? | Por código | 2026-11-11 |

## Métricas de sucesso

- Chegar ao modelo certo em até 3 cliques ou uma busca de 2 a 3 letras, sem mudar de página.
- 0 requisições para trocar de foto; 1 requisição de lista por bloco e 1 de contagens por filtro.
