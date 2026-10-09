# Plano de implementação — Modelos e linha do tempo: ficha do modelo com foto em destaque e histórico da solicitação em linha do tempo

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/features/...`), conforme o
> Princípio 7. Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado
> tem em `app/src`. Não há `app/tests/bdd/`: cada cenário da spec vira um teste de módulo ou
> de componente com o nome do cenário (decisão do usuário, 2026-10-07). Nada é injetado por
> abstração neste projeto, então não há `app/interfaces/`.

> **Leitura do código antes do plano (2026-10-08, `develop` @ `946342a`):**
> - A ficha do modelo (`ModeloDetalhePage`, 309 linhas) monta cinco blocos em coluna única: um
>   cartão de dados, a galeria, os indicadores, os eventos do modelo e o histórico de
>   solicitações (esta última lista vem de `useSolicitacoes` com `size: 50`).
> - A galeria (`GaleriaModelo`, 181 linhas) mostra até 4 miniaturas de 80 px
>   (`GaleriaFotoThumb`, `h-20 w-20`), os botões "Ver galeria completa" e "Adicionar foto" e
>   guarda tudo o que a galeria faz (adicionar, definir capa, renomear, remover, carrossel).
> - `EventosModeloList` (71 linhas) lista cartões em ordem de chegada; `EventoModelo` já
>   traz `solicitacaoRelacionadaId`, o que permite saber qual solicitação um evento cobre.
> - A linha do tempo da solicitação (`SolicitacaoTimeline`, 94 linhas) já existe, em ordem
>   **ascendente**, com ícone por tipo; o formulário de comentário (`ComentarioForm`) fica
>   depois dela, na página.
> - `formatDuracao` (`solicitacaoMessages.ts`) arredonda para horas, e é daí que vem o
>   "0h"; `formatarDuracao` (`prazoSolicitacao.ts`) já escreve minutos, horas e dias, e
>   `situacaoDoPrazo` já devolve "Atrasada há 2 d" e "Vence em 5 h" (o card do quadro usa).
> - As seis ações da solicitação (`TRIAR`, `ALTERAR_RESPONSAVEIS`, `ENVIAR_VALIDACAO`,
>   `DEVOLVER`, `ENCERRAR`, `CANCELAR`) saem de `acoesPermitidas`/`botoesDeAcao`, hoje com
>   `variant="primary"` em três delas ("Triar", "Enviar para validação", "Devolver").
>   "Cancelar" já some quando há "Encerrar" (o formulário de encerramento oferece o
>   cancelamento).
> - **A API só devolve identificadores** (`responsavelIds`, `abertaPorUsuarioId`). O hook
>   `useResponsaveisDisponiveis` busca a lista de usuários ativos **só para quem gerencia
>   solicitações** (`enabled: canManageSolicitacoes`) e filtra operadores e gestores. Um
>   operador, então, nunca tem os nomes (ver R2).
> - O cartão da lista de operação (`ModeloCard`) tem foto `h-36`, código em negrito como
>   título, selo "Ativo" sempre e o link "Ver detalhes →".
> - "Voltar" do detalhe é `navigate('/app/solicitacoes')` fixo.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Linha do tempo | uma peça `LinhaDoTempo` em `SRC/shared/components/LinhaDoTempo/` que recebe itens já prontos (`id`, `em`, ícone, título, detalhe, autor, peso, destino) e cuida da ordem do mais recente para o mais antigo, do agrupamento por dia, da hora relativa com a data completa em `title` e do "Mostrar N anteriores" | duas linhas do tempo, uma por tela | as duas telas pedem o mesmo comportamento (RF-08, RF-14, RF-15, RNF-12); uma peça só |
| Regra de agrupar e recolher | funções puras em `SRC/shared/lib/linhaDoTempo.ts` (`agruparPorDia`, `recolher`) e de data em `SRC/shared/lib/data.ts` (`tempoRelativo`, `formatarDataHora`, `rotuloDoDia`), com o relógio recebido por parâmetro | cálculo dentro do componente | regra medida e testada sem DOM; "Hoje" e "Ontem" dependem do relógio, e o teste precisa fixá-lo |
| Limite de recolhimento | constante em `linhaDoTempo.ts`: 10 eventos visíveis; com 10 ou menos, nenhum recolhe (RF-15) | por parâmetro de cada tela | decisão do usuário, igual nas duas telas; o parâmetro entra só se uma tela precisar de outro número |
| Duração curta | `formatDuracao` (segundos) passa a escrever "N s" abaixo de 1 min, "N min" abaixo de 1 h, "Nh" abaixo de 24 h e "Nd Nh" depois; `formatarDuracao` (milissegundos) vai para `SRC/shared/lib/duracao.ts` e as duas passam a vir da mesma regra | manter duas regras de duração | RF-09; o painel também usa `formatDuracao`, e "0h" lá também é enganoso, então o ganho vale nos dois |
| Adaptar domínio para a linha do tempo | duas funções puras: `historicoDoModelo(eventos, solicitacoes)` em `SRC/features/admin/modelos/lib/` e `historicoDaSolicitacao(atividades)` em `SRC/features/solicitacoes/lib/`, que devolvem os itens da `LinhaDoTempo` | montar os itens dentro de cada tela | a regra de "cada solicitação uma vez" (RF-08) e a de peso por tipo de atividade (RF-14) ficam testáveis sem componente |
| Cada solicitação uma vez (RF-08) | o evento do modelo com `solicitacaoRelacionadaId` marca aquela solicitação como representada; a solicitação sem evento entra como "abertura" (título, status e `criadaEm`), com link; evento sem solicitação relacionada entra como está | mostrar as duas listas e esconder uma com CSS | o usuário escolheu "eventos + abertura de cada solicitação, uma vez" |
| Abas | peça `Abas` em `SRC/shared/components/Abas/` (`role="tablist"`, `tab`, `tabpanel`, `aria-selected`, setas, Home e End, painel inativo escondido) usada pela ficha com "Resumo" e "Histórico" | ancorar com `<a href="#...">`; migrar já o painel, que tem abas próprias | RF-07; migrar o painel é da spec do dashboard (#144) |
| Foto grande na ficha | `GaleriaModelo` passa a mostrar a foto ativa grande (a capa, ou a primeira), as miniaturas abaixo e o botão "Adicionar foto" junto; escolher miniatura troca a foto ativa; tocar na grande abre o carrossel que já existe, na mesma foto; a lógica de adicionar, definir capa, renomear e remover não muda | criar componente novo ao lado e deixar o antigo | RF-01, RF-03, RF-06; a galeria já concentra os efeitos |
| Miniaturas | até 6 miniaturas; a sexta, se houver mais, mostra "+N" e abre o carrossel; `GaleriaFotoThumb` ganha o estado "ativa" (contorno) | manter 4 | a foto grande tomou o destaque, e a fileira fica no fim dela |
| Disposição da ficha | em tela larga, grade de duas colunas: foto (cerca de 55%) à esquerda; identificação, selos, dados e botão "Adicionar foto" à direita; em tela estreita, uma coluna, com a foto no topo em largura total; as abas vêm abaixo | foto pequena ao lado do texto | RNF-01 (40% da largura útil, sem vazio maior que 80 px) |
| Sem capa | o espaço da foto grande mostra as duas primeiras letras do código sobre superfície neutra, no mesmo tamanho da foto | espaço menor | RF-02; é o que o cartão da lista já faz |
| Dados da ficha | grade compacta (`dl` de duas colunas) com máquina, tipo, criação e atualização; "Pendência aberta" vira selo ao lado de "Ativo"/"Inativo" | lista de rótulos em largura total | RF-04, RF-05; nenhum dado é removido (RNF-08) |
| Cartão do modelo | `ModeloCard` vira um `Link` que envolve o cartão inteiro; foto em proporção 4:3; título é a descrição; código em fonte monoespaçada pequena; selos só "Inativo" e "Pendência aberta"; sai "Ver detalhes →" | botão dentro do cartão | RF-10, RF-11; um alvo só, por toque, clique e teclado |
| Nomes de usuários | função pura `nomesDosUsuarios(ids, usuarios)` em `SRC/features/solicitacoes/lib/` que devolve o texto ("Ana, Bruno", ou "N responsáveis" quando algum nome falta) e `nomeDoUsuario(id, usuarios)`; os usuários vêm de `useResponsaveisDisponiveis` | endpoint novo; guardar nomes no cliente | RF-12 e a decisão do usuário; sem contrato novo (RNF-11) |
| Resumo da solicitação | `SolicitacaoResumo` mostra status, prioridade, prazo (`situacaoDoPrazo`, que já existe), responsáveis, modelo com link e quem abriu, em grade; datas por `tempoRelativo` com `formatarDataHora` em `title`; o subtítulo da página deixa de mostrar segundos | recalcular prazo na tela | RF-12; o prazo continua só com o que a API informa |
| Ação principal por etapa | tabela em `acoesSolicitacao.ts`: `A_FAZER → TRIAR`, `EM_ANDAMENTO → ENVIAR_VALIDACAO`, `EM_VALIDACAO → ENCERRAR`; função pura `separarAcoes(acoes, status)` devolve `{ principal, outras }`; com uma ação permitida só, ela é o botão (a de cancelar em perigo); com várias e a principal não permitida ao usuário, todas vão para o menu | escolher a principal em cada tela | RF-13; a regra mora em `lib/`, onde é medida (Princípio 10) |
| Onde as ações aparecem | hook `useAcoesDoCabecalho(solicitacao)` devolve `{ principal, maisAcoes, dialogo }`; a página passa o botão em `actions`, a lista em `maisAcoes` do `PageHeader` (spec 011) e renderiza `dialogo`; o bloco "Ações" no corpo sai, e `SolicitacaoAcoes` com ele | manter o bloco e acrescentar o menu | RF-13, RNF-03; os diálogos de cada ação não mudam |
| "Editar" e "Voltar" | "Editar" entra em `maisAcoes`; "Voltar" sai do cabeçalho e vira um link "← Voltar" acima do título; na edição, "Salvar" e "Cancelar" continuam em `actions`, sem menu | deixar "Editar" como principal | RNF-03 (uma principal e um menu); a principal é a ação de fluxo |
| Voltar à origem | hook `useVoltar(reserva)` em `SRC/shared/hooks/`: volta no histórico quando há tela anterior (`location.key !== 'default'`) e vai à reserva (`/app/solicitacoes`) quando não há | guardar a origem em estado de rota em cada link | RF-17; funciona para qualquer entrada, inclusive link direto |
| Comentário no topo | `ComentarioForm` passa a ficar acima da linha do tempo, dentro de "Histórico de atividades", só quando a solicitação não é terminal | campo fixo na base | RF-16; a base é da barra de abas (spec 011) |
| Medir o resultado | roteiro Playwright com API simulada e backend real (`/root/rgm/evidencias/012-frontend/`), antes (`946342a`) e depois, em 1440 × 900 e 390 × 844: largura da foto, vazio ao lado, botões do cabeçalho, ordem do histórico, largura da coluna de leitura | só teste de unidade | jsdom não calcula layout |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Adapter | `historicoDoModelo` e `historicoDaSolicitacao` | converter eventos e atividades de domínio no formato que a `LinhaDoTempo` mostra, sem a peça conhecer o domínio | uma função por origem |
| Composição de componentes | `LinhaDoTempo` recebe `ReactNode` para título e detalhe; `Abas` recebe os painéis como filhos | cada tela põe o seu conteúdo (selos, link, balão) sem a peça saber o que é | o item da linha do tempo é um registro com vários campos opcionais |

**Considerados e recusados**

| Padrão | Motivo |
|---|---|
| Strategy (um modo de agrupar para cada tela) | as duas telas agrupam por dia; só o conteúdo muda |
| Composite (itens que contêm itens) | a linha do tempo é plana; o agrupamento é visual |
| State (máquina de estados da ação principal) | a regra é uma tabela de três linhas |
| Observer (atualizar a linha do tempo por evento) | o tempo real já invalida as consultas (spec 004); nada a acrescentar |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/shared/lib/data.ts` | criar | `TST/shared/lib/data.test.ts` |
| core/domain | `SRC/shared/lib/duracao.ts` | criar (recebe `formatarDuracao`) | `TST/shared/lib/duracao.test.ts` |
| core/domain | `SRC/shared/lib/linhaDoTempo.ts` | criar | `TST/shared/lib/linhaDoTempo.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/prazoSolicitacao.ts` | alterar (importa `formatarDuracao`) | `TST/features/solicitacoes/lib/prazoSolicitacao.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/solicitacaoMessages.ts` | alterar (`formatDuracao` com minutos e segundos) | `TST/features/solicitacoes/lib/solicitacaoMessages.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/acoesSolicitacao.ts` | alterar (`separarAcoes`, principal por etapa) | `TST/features/solicitacoes/lib/acoesSolicitacao.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/nomesDosUsuarios.ts` | criar | `TST/features/solicitacoes/lib/nomesDosUsuarios.test.ts` |
| core/domain | `SRC/features/solicitacoes/lib/historicoDaSolicitacao.ts` | criar | `TST/features/solicitacoes/lib/historicoDaSolicitacao.test.ts` |
| core/domain | `SRC/features/admin/modelos/lib/historicoDoModelo.ts` | criar | `TST/features/admin/modelos/lib/historicoDoModelo.test.ts` |
| adaptador UI↔regra | `SRC/shared/hooks/useVoltar.ts` | criar | `TST/shared/hooks/useVoltar.test.ts` |
| adaptador UI↔regra | `SRC/features/solicitacoes/hooks/useAcoesDoCabecalho.ts` | criar | `TST/features/solicitacoes/hooks/useAcoesDoCabecalho.test.tsx` |
| adapters/presenters | `SRC/shared/components/LinhaDoTempo/LinhaDoTempo.tsx` | criar | `TST/shared/components/LinhaDoTempo/LinhaDoTempo.test.tsx` |
| adapters/presenters | `SRC/shared/components/Abas/Abas.tsx` | criar | `TST/shared/components/Abas/Abas.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/components/GaleriaModelo.tsx` | alterar | `TST/features/admin/modelos/components/GaleriaModelo.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/components/GaleriaFotoThumb.tsx` | alterar (estado ativa) | `TST/features/admin/modelos/components/GaleriaFotoThumb.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/components/HistoricoDoModelo.tsx` | criar (substitui `EventosModeloList`) | `TST/features/admin/modelos/components/HistoricoDoModelo.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/components/EventosModeloList.tsx` | remover | remover `TST/features/admin/modelos/components/EventosModeloList.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx` | alterar | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` |
| adapters/presenters | `SRC/features/modelos/components/ModeloCard.tsx` | alterar | `TST/features/modelos/components/ModeloCard.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/SolicitacaoTimeline.tsx` | alterar (usa `LinhaDoTempo`; leva o formulário de comentário) | `TST/features/solicitacoes/components/SolicitacaoTimeline.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/SolicitacaoResumo.tsx` | alterar | `TST/features/solicitacoes/components/SolicitacaoResumo.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/components/SolicitacaoAcoes.tsx` | remover (vira `useAcoesDoCabecalho`) | remover `TST/features/solicitacoes/components/SolicitacaoAcoes.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar | `TST/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx` |
| fora de `app/src` | `app/tests/e2e/*.spec.ts` que clicam em ação do detalhe (conferir `Devolver`, `Cancelar`, `Alterar responsáveis`, `Editar`, `Voltar`) | alterar | rodados por `make e2e` |
| fora de `app/` | `openspec/README.md` | alterar (linhas da tabela, Princípio 12) | — |

Observações sobre a tabela:

- Os testes de `ModeloCard`, `GaleriaFotoThumb`, `SolicitacaoTimeline`, `SolicitacaoResumo` e
  `SolicitacaoAcoes` já existem; os que o arquivo não tiver, a tarefa cria.
- Remover `EventosModeloList` e `SolicitacaoAcoes` leva junto os testes deles; os casos
  úteis passam para o `HistoricoDoModelo` e para `useAcoesDoCabecalho`.
- As guardas da 010 (`coresPorPapel`, `rotulosUnicos`) leem todo o código de produção e
  cobrem os arquivos novos sem alteração. Nenhum arquivo cria cor nova.
- Pelo Princípio 10, regra nova mora em `lib/`: agrupar, recolher, tempo relativo, nomes e
  ação principal estão ali.

## Contrato entre camadas

- **Página** → hooks existentes de dados (`useModelo`, `useEventosModelo`,
  `useSolicitacoes`, `useAtividades`, `useResponsaveisDisponiveis`) → **adapters de lib**
  (`historicoDoModelo`, `historicoDaSolicitacao`, `nomesDosUsuarios`, `separarAcoes`) →
  **peças** (`LinhaDoTempo`, `Abas`, `SolicitacaoResumo`). Nada novo chama a API.
- **Relógio:** as funções puras recebem `agoraMs`; o componente lê `Date.now()` uma vez por
  render e repassa. Os testes fixam o relógio.
- **Erro:** o tratamento de falha de cada ação continua na página (`actionError`); a
  exportação continua como na spec 011.
- **Compatibilidade (Princípio 9):** sem nome na lista de usuários, a tela mostra "N
  responsáveis" e omite "quem abriu"; sem `acoesPermitidas` na resposta, vale a regra local
  que já existe.
- Nenhum contrato com a API muda (RNF-11).

## Dependências externas

Nenhuma nova (RNF-10). Ícones vêm de `lucide-react`, já usado.

## Impacto no contrato de operação

Nenhum alvo novo. `make test`, `make cover-arquivos ARQUIVOS="src/..."` (criado na 011),
`make e2e` e `make validate` bastam. O roteiro de medição fica fora dos repositórios, em
`/root/rgm/evidencias/012-frontend/`.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| **R1.** A solicitação não mostra "quem abriu" para boa parte dos casos: a lista de usuários vem só de operadores e gestores ativos, e quem abriu pode ser administrador ou externo | alta | a spec já prevê omitir a linha; registrar na convergência quantos dos casos de teste caem na reserva; pedir à API o nome é uma issue de backend, fora desta spec |
| **R2.** O operador nunca vê os nomes dos responsáveis (o hook só busca para quem gerencia): sempre "N responsáveis" | certa | é o comportamento especificado (RF-12); abrir issue para a API devolver nomes se a fábrica sentir falta |
| **R3.** Mudar `formatDuracao` altera textos do painel e dos indicadores ("0h" some em todo lugar) | média | testes de `solicitacaoMessages` e do painel ajustados; a mudança é só abaixo de 1 hora |
| **R4.** Remover `SolicitacaoAcoes` e o bloco "Ações" quebra teste e e2e que clicam num botão que agora está no menu | alta | levantar as asserções afetadas antes (as tarefas listam os arquivos); e2e passam por "Mais ações" |
| **R5.** Foto muito larga ou muito alta quebra a proporção da foto grande | média | `object-cover` em proporção fixa e o carrossel mostra a foto inteira; checar nas capturas |
| **R6.** A lista de solicitações do modelo vem limitada a 50 (`size: 50`); o histórico unificado mostra no máximo 50 solicitações | média | manter o limite de hoje e mostrar "N solicitações no total" quando o total passar de 50; paginar é outra spec |
| **R7.** Trocar a ordem do histórico da solicitação (do antigo ao novo para do novo ao antigo) surpreende quem já usa | baixa | pedido nas duas issues; os rótulos dos dias ("Hoje", "Ontem") deixam a ordem óbvia |
| **R8.** Cobertura por arquivo: páginas e componentes de feature não entram no `make cover` | média | `make cover-arquivos` com todos os arquivos alterados é parte da última tarefa, com 95% em cada um |
| **R9.** Aba escondida (`tabpanel` inativo) continua na ordem de tabulação | baixa | painel inativo com `hidden`; teste confere |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | tudo por `make test`, `make cover-arquivos`, `make e2e` e `make validate`; nenhum alvo novo |
| 2 Arquitetura limpa | regra pura em `shared/lib` e `features/*/lib`; componente fala com hook; nenhum acesso novo à API |
| 3 Testes provam a entrega | todo arquivo de produção criado tem teste espelhado; um comportamento por teste, Arrange/Act/Assert, `deve ... quando ...`; cada cenário da spec vira um teste com o nome do cenário |
| 4 Simplicidade defensável | Adapter e composição onde resolvem problema presente; Strategy, Composite, State e Observer recusados com motivo |
| 5 Autoria | commits e PR sem crédito a ferramenta de IA |
| 6 Idioma | artefatos e textos de tela em português; nomes de peças em português como o legado (`LinhaDoTempo`, `Abas`) |
| 7 Mapa de pastas do legado | nada fora de `app/src` e `app/tests`; testes espelhados; nenhuma pasta Byte Union; `fetch` não é chamado; nenhum `*Api.ts` importado em componente novo |
| 8 Linguagem ubíqua | nenhum termo de domínio traduzido ou renomeado |
| 9 Compatibilidade com a v1.5.0 | sem contrato novo; reserva para nome ausente e para `acoesPermitidas` ausente |
| 10 Cobertura não regride | regra nova em `lib/`, medida; 95% por arquivo alterado medido por `make cover-arquivos`; nenhuma exclusão acrescentada |
| 11 Padrão de teste no que for tocado | todo teste novo ou alterado segue o Princípio 3 |
| 12 Uma fonte de especificação | tudo em `specs/012-...`; `openspec/` só ganha linhas na tabela do README |

## Cobertura dos requisitos

| Requisito | Onde |
|---|---|
| RF-01, RF-02, RF-03 | `GaleriaModelo`, `GaleriaFotoThumb`, `ModeloDetalhePage` |
| RF-04, RF-05 | `ModeloDetalhePage` |
| RF-06 | `GaleriaModelo` (botão "Adicionar foto" junto da foto), `ModeloDetalhePage` |
| RF-07 | `Abas`, `ModeloDetalhePage` |
| RF-08 | `historicoDoModelo`, `HistoricoDoModelo`, `LinhaDoTempo`, `linhaDoTempo.ts` |
| RF-09 | `solicitacaoMessages.ts`, `duracao.ts`, `ModeloDetalhePage` (indicadores) |
| RF-10, RF-11 | `ModeloCard` |
| RF-12 | `SolicitacaoResumo`, `nomesDosUsuarios`, `data.ts`, `prazoSolicitacao.ts` |
| RF-13 | `acoesSolicitacao.ts` (`separarAcoes`), `useAcoesDoCabecalho`, `SolicitacaoDetalhePage` |
| RF-14 | `historicoDaSolicitacao`, `SolicitacaoTimeline`, `LinhaDoTempo` |
| RF-15 | `linhaDoTempo.ts` (`recolher`), `LinhaDoTempo` |
| RF-16 | `SolicitacaoTimeline` (formulário no topo), `SolicitacaoDetalhePage` |
| RF-17 | `useVoltar`, `SolicitacaoDetalhePage` |
| RNF-01 a RNF-04, RNF-07, RNF-12 | testes de componente e roteiro de medição da convergência |
| RNF-05, RNF-06 | medição na convergência (toque, foco e contraste) |
| RNF-08 | teste da ficha conferindo cada dado de hoje |
| RNF-09 | `make cover-arquivos` na última tarefa |
| RNF-10, RNF-11 | `package.json` sem pacote novo; nenhuma mudança de API |
