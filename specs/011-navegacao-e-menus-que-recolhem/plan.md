# Plano de implementação — Navegação e menus que recolhem: barra lateral recolhível, "Mais ações" e seções recolhíveis

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/...`), conforme o Princípio 7.
> Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado tem em
> `app/src`. Não há `app/tests/bdd/`: a decisão do usuário de 2026-10-07 (registrada na spec
> 010) continua valendo, e cada cenário da spec vira um teste de módulo ou de componente com
> o nome do cenário. Nada é injetado por abstração neste projeto (componentes e hooks), então
> não há `app/interfaces/`.

> **Leitura do código antes do plano (2026-10-08, `develop` @ `5e1f29d`):**
> - `AppLayout` (160 linhas) monta barra lateral fixa de 280 px, cabeçalho com nome, tema e
>   "Sair" soltos, faixa de navegação que rola (`lg:hidden`) e o `main` com borda e sombra.
> - `ThemeToggle` já implementa um menu completo (abrir, setas, Enter, Esc, foco de volta ao
>   botão, fechar ao clicar fora); é a única cópia desse comportamento.
> - **Ações no cabeçalho, contadas no código:** quadro de solicitações (alternador de visão +
>   Exportar PDF + Nova solicitação), lista de modelos (Exportar PDF + Novo modelo), ficha do
>   modelo (Exportar PDF + Editar + Desativar/Ativar), detalhe da solicitação (Editar +
>   Voltar, ou Salvar + Cancelar na edição), usuários (Novo usuário), máquinas (Nova máquina)
>   e edição do modelo (Voltar). **A spec dizia que quatro telas tinham uma ação só; o quadro e a
>   lista de modelos também têm Exportar PDF.** Correção registrada na spec (Esclarecimentos),
>   a confirmar; ver Riscos, R1.
> - `ExportarPdfButton` guarda o estado e o erro dentro do botão; para virar item de menu o
>   estado precisa sair dele.
> - O `#root` só pinta depois de o módulo carregar; por isso o tema precisou de trecho em
>   `index.html`, e a barra lateral e as seções não precisam (ver decisões).
> - 16 arquivos usam `PageHeader`; 28 usos de `Card` em 17 arquivos.

Prefixos: `SRC` = `app/src`, `TST` = `app/tests/unit`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Peça de menu | um `Menu` em `SRC/shared/components/Menu/` com `Menu`, `MenuItem`, `MenuLink`, `MenuSeparator` e `MenuTitulo`: abre por botão, itens achados pelo papel (`menuitem`, `menuitemradio`), setas com volta ao fim, Home e End, Enter e Espaço escolhem, Esc e Tab fecham, clique fora fecha, foco vai ao primeiro item ao abrir e volta ao botão ao fechar | copiar o `ThemeToggle` duas vezes; biblioteca de menu | três menus (tema, usuário, "Mais ações") com o mesmo comportamento: uma cópia só (DRY, RF-14); biblioteca fere RNF-11 (0 dependências) |
| `ThemeToggle` | passa a usar o `Menu`, sem mudar o que faz nem o que o teste da 010 confere | deixar a cópia | o teste existente é a prova de que o `Menu` preserva o comportamento |
| Menu do usuário | `SRC/app/layouts/MenuDoUsuario.tsx`: botão com o avatar e o nome; abre `Menu` com título (nome e perfil por extenso), link "Meu perfil", três itens de tema de escolha única e "Sair" | três controles soltos | RF-08; "Sair" só ali (esclarecimento) |
| Destinos de navegação | função pura `destinosDeNavegacao(perfil)` em `SRC/shared/lib/navegacao.ts`, com `id`, `to`, `rotulo` e `end`; barra lateral e barra de abas leem dela, e o layout liga cada `id` ao ícone | duas listas (como hoje, `navigation` vive dentro do componente) | uma fonte para as duas barras; teste fixa os destinos de cada perfil e prova RNF-13 |
| Estado guardado | `SRC/shared/lib/preferenciaDeInterface.ts` (ler e gravar uma chave de `localStorage`, com `try/catch` e valor padrão) e hook `usePreferenciaGuardada(chave, padrao)` em `SRC/shared/hooks/` | gravar direto no componente; guardar no servidor (fora de escopo) | a barra e as seções precisam do mesmo comportamento; sem armazenamento (navegação privada), o padrão vale e a tela funciona |
| Sem quadro no estado errado (RF-04, RNF-07) | o hook lê o valor guardado na **inicialização do estado**, antes do primeiro `render`; sem trecho em `index.html` | trecho no `<head>`, como o tema | o fundo do corpo é pintado antes do JS, por isso o tema precisou do trecho; a barra e as seções só existem depois de o React montar, então já nascem no estado guardado. Teste prova que o primeiro `render` já está no estado guardado |
| Barra lateral | `SRC/app/layouts/BarraLateral.tsx`: botão de recolher no topo (`aria-expanded`, `aria-controls`, rótulo "Recolher menu lateral" / "Expandir menu lateral"), só em tela larga; a coluna do `AppLayout` passa de `280px` a `72px` (RNF-05) com transição de 200 ms e sem transição quando o sistema pede redução de movimento (RNF-08) | esconder a barra por completo; atalho global (fora de escopo) | RF-01, RF-03 |
| Rótulo com a barra recolhida | o texto do destino vira `sr-only` (o nome acessível não muda) e uma etiqueta visível aparece ao passar o ponteiro ou ao focar (`group-hover` e `group-focus-visible`), sem `title` | atributo `title` | `title` não aparece com o foco do teclado, que a spec exige (RF-01) |
| Marca com a barra recolhida | o logo some e fica só o botão de recolher e os ícones | logo em miniatura | a imagem do logo tem largura própria maior que 72 px; ver R3 |
| Barra de abas | `SRC/app/layouts/BarraDeAbas.tsx`, `nav` fixo na base abaixo de `lg`, grade com tantas colunas quanto destinos (no máximo 5), ícone e rótulo, altura de 56 px mais a área segura; o `main` ganha o espaço dela no fim | rolagem horizontal como hoje | RF-05, RF-06, RNF-06 |
| Área segura | `viewport-fit=cover` no `<meta viewport>` de `app/index.html` e `env(safe-area-inset-bottom)` no preenchimento da barra | ignorar a área segura | sem `viewport-fit=cover` o `env()` vale 0 em iPhone e a barra fica sob a barra de gestos (RF-06) |
| Cabeçalho | `AppLayout` deixa só o logo (celular), o aviso de falta de atualização e o `MenuDoUsuario`; o texto "Administração RGM / Usuários, máquinas e modelos" sai; a identificação do portal fica só na barra lateral | manter os dois | RF-10 |
| Conteúdo sem cartão | o `main` perde borda, superfície e sombra; fica sobre `canvas` com o mesmo espaçamento | manter | RF-11; só `Card` explícito vira moldura |
| Cabeçalho de página | `PageHeader` ganha `maisAcoes?: AcaoDoMenu[]` (`rotulo`, `icone?`, `onSelect?`, `to?`, `perigo?`, `desabilitada?`); `actions` continua sendo a ação principal e os controles que não são comandos (alternador de visão, Voltar, Salvar e Cancelar); com `maisAcoes` vazio, nenhum menu | trocar `actions` por uma lista de ações para tudo | RF-12; Voltar, o alternador e Salvar e Cancelar não são "Mais ações" (spec) |
| Ação destrutiva | item com `perigo`: vai sempre para o fim, com `MenuSeparator` antes e cor de perigo; o `onSelect` abre o `ConfirmDialog` que a tela já usa | confirmar dentro do menu | RF-13; o diálogo existente já prende o foco |
| Exportar PDF no menu | hook `useExportarPdf({ buscar, nomeDoArquivo })` em `SRC/shared/hooks/` devolve `exportar`, `exportando` e `erro`; o `ExportarPdfButton` passa a usá-lo, e as telas com menu mostram o `erro` num `ErrorState` logo abaixo do cabeçalho, como já fazem com `actionError` | duplicar o `try/catch` em cada tela | RF-12; a falha continua junto da ação (spec 003) |
| "Ativar" na ficha | vai para o menu como item comum (confirma pelo diálogo que já existe); "Editar" fica como principal nos dois estados | manter "Ativar" como principal | uma principal por tela (RNF-04); "Ativar" não é destrutivo e por isso não é vermelho |
| Seção recolhível | `SRC/shared/components/SecaoRecolhivel/SecaoRecolhivel.tsx`: título em botão (`aria-expanded`, `aria-controls`), conteúdo no mesmo elemento com `hidden` quando fechado, **sem desmontar** (filtro escondido continua valendo), resumo ao lado do título só quando fechado; estado guardado em `rgm.secao.<id>`, aberto por padrão | desmontar o conteúdo; usar `<details>` | RF-15, RF-16; o conteúdo montado mantém campos e foco coerentes; `<details>` não anuncia nem guarda o estado do jeito pedido |
| Resumo dos filtros | função pura `resumoDeFiltros(quantidade)` em `SRC/shared/lib/resumoDeFiltros.ts`: `Filtros`, `Filtros · 1 ativo`, `Filtros · 2 ativos`; cada tela de filtros conta os seus campos preenchidos | montar o texto em cada tela | RF-15; um lugar para o texto e o plural |
| Perfil por extenso | `rotuloDoPerfil` (já existe) é a fonte; sai a classe que põe o texto em maiúsculas onde o perfil aparece; uma busca no código de produção confere os demais lugares | trocar o texto | RF-09 |
| Verificação de RNF-03, RNF-05 a RNF-08 | roteiros Playwright com API simulada (`/root/rgm/evidencias/011-frontend/`), antes (`5e1f29d`) e depois, em 1440 px, 390 px e 360 px, nos dois temas; resultado na convergência | só teste de unidade | jsdom não calcula layout nem rolagem |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Composição de componentes | `Menu` com `MenuItem`, `MenuLink`, `MenuSeparator` e `MenuTitulo` | itens de natureza diferente (botão, link, escolha única, separador) no mesmo menu, sem lista de opções com todos os casos | o `Menu` acha os itens pelo papel no DOM em vez de recebê-los como dados |
| Fachada | `PageHeader` esconde o `Menu` atrás de `maisAcoes` | as telas descrevem ações e não montam menu | o `PageHeader` conhece o `Menu` |

**Considerados e recusados**

| Padrão | Motivo |
|---|---|
| Command (objeto de comando por item) | cada ação já é uma função da tela; `AcaoDoMenu` é um registro de dados, não uma hierarquia |
| Observer (avisar outras abas da mudança) | fora de escopo; a escolha vale na visita seguinte, não entre abas abertas (YAGNI) |
| Strategy (um modo de menu para cada situação) | os três menus diferem no conteúdo, não no comportamento |
| Contexto de preferências | só dois consumidores (barra e seção), e cada um lê a sua chave; o hook basta |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/shared/lib/preferenciaDeInterface.ts` | criar | `TST/shared/lib/preferenciaDeInterface.test.ts` |
| core/domain | `SRC/shared/lib/navegacao.ts` | criar | `TST/shared/lib/navegacao.test.ts` |
| core/domain | `SRC/shared/lib/resumoDeFiltros.ts` | criar | `TST/shared/lib/resumoDeFiltros.test.ts` |
| adaptador UI↔regra | `SRC/shared/hooks/usePreferenciaGuardada.ts` | criar | `TST/shared/hooks/usePreferenciaGuardada.test.ts` |
| adaptador UI↔regra | `SRC/shared/hooks/useExportarPdf.ts` | criar | `TST/shared/hooks/useExportarPdf.test.ts` |
| adapters/presenters | `SRC/shared/components/Menu/Menu.tsx` | criar | `TST/shared/components/Menu/Menu.test.tsx` |
| adapters/presenters | `SRC/shared/components/ThemeToggle/ThemeToggle.tsx` | alterar | `TST/shared/components/ThemeToggle/ThemeToggle.test.tsx` |
| adapters/presenters | `SRC/shared/components/PageHeader/PageHeader.tsx` | alterar | `TST/shared/components/PageHeader/PageHeader.test.tsx` |
| adapters/presenters | `SRC/shared/components/SecaoRecolhivel/SecaoRecolhivel.tsx` | criar | `TST/shared/components/SecaoRecolhivel/SecaoRecolhivel.test.tsx` |
| adapters/presenters | `SRC/shared/components/ExportarPdfButton/ExportarPdfButton.tsx` | alterar | `TST/shared/components/ExportarPdfButton/ExportarPdfButton.test.tsx` |
| adapters/presenters | `SRC/app/layouts/AppLayout.tsx` | alterar | `TST/app/layouts/AppLayout.test.tsx` |
| adapters/presenters | `SRC/app/layouts/BarraLateral.tsx` | criar | `TST/app/layouts/BarraLateral.test.tsx` |
| adapters/presenters | `SRC/app/layouts/BarraDeAbas.tsx` | criar | `TST/app/layouts/BarraDeAbas.test.tsx` |
| adapters/presenters | `SRC/app/layouts/MenuDoUsuario.tsx` | criar | `TST/app/layouts/MenuDoUsuario.test.tsx` |
| adapters/presenters | `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx` | alterar | `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/pages/ModelosPage.tsx` | alterar | `TST/features/admin/modelos/pages/ModelosPage.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx` | alterar | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` |
| adapters/presenters | `SRC/features/admin/modelos/components/ModelosFilters.tsx` | alterar | `TST/features/admin/modelos/components/ModelosFilters.test.tsx` |
| adapters/presenters | `SRC/features/admin/usuarios/components/UsuariosFilters.tsx` | alterar | `TST/features/admin/usuarios/components/UsuariosFilters.test.tsx` |
| infra | `app/index.html` (`viewport-fit=cover`) | alterar | `TST/temaInicial.test.ts` (já lê o `index.html`; ganha uma asserção da meta) |
| fora de `app/src` | `app/tests/e2e/auth.spec.ts`, `admin.spec.ts`, `kanban.spec.ts` | alterar | rodados por `make e2e` |
| fora de `app/` | `openspec/README.md` | alterar (linha da tabela, Princípio 12) | — |

Observações sobre a tabela:

- Os testes de `ModelosPage` (administração), `ModelosFilters` e `UsuariosFilters` já
  existem em `TST/features/admin/...`; quando faltar algum, a tarefa o cria.
- `UsuariosPage`, `MaquinasPage`, `EditarModeloPage` e `SolicitacaoDetalhePage` têm um
  comando só no cabeçalho (ou o par Salvar e Cancelar) e **não mudam**: já usam
  `PageHeader` e seguem sem menu. A spec os lista entre as sete; a prova é um teste de
  cada que confere que não aparece "Mais ações".
- As guardas da 010 (`coresPorPapel`, `rotulosUnicos`) leem todo o código de produção e
  cobrem os arquivos novos sem alteração.
- Nenhum arquivo cria cor nova: tudo usa os papéis.

## Contrato entre camadas

- **Página** → `PageHeader` (`actions` principal; `maisAcoes` com `onSelect`) → `Menu`.
  A página continua dona do estado de confirmação e de erro; o menu só chama `onSelect`.
- **Layout** → `destinosDeNavegacao(perfil)` (regra pura) → `BarraLateral` e `BarraDeAbas`;
  `MenuDoUsuario` chama `useAuth` (`logout`, `user`) e `useTema`; nada novo chama a API.
- **Estado guardado:** `usePreferenciaGuardada` → `preferenciaDeInterface` (`localStorage`).
  Falha de armazenamento volta ao valor padrão e nunca interrompe a tela.
- **Erro:** a falha de exportação sai de `useExportarPdf` como texto
  (`mensagemDeFalhaNaExportacao`, que já existe) e a tela a mostra junto do cabeçalho.
- Nenhum contrato com a API muda (RNF-12).

## Dependências externas

Nenhuma nova (RNF-11). Ícones novos vêm de `lucide-react`, que o projeto já usa
(`PanelLeftClose`, `PanelLeftOpen`, `Ellipsis`, `ChevronDown`).

## Impacto no contrato de operação

Nenhum alvo novo. `make test`, `make cover`, `make e2e` e `make validate` bastam; os alvos
rodam na máquina, como na 010. O roteiro de medição fica fora dos repositórios, em
`/root/rgm/evidencias/011-frontend/`.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| **R1.** A spec contou errado as ações do cabeçalho; as regras de RF-12 mudam de aplicação em duas telas (quadro e lista de modelos) | certa | correção já registrada na spec; o plano segue a regra que o usuário aprovou (criar ou editar como principal, o resto no menu) e pede confirmação antes das tarefas |
| **R2.** Tirar o cartão do `main` deixa tela com 3 níveis de moldura por outro caminho (cartão com tabela com cartão de linha) | média | RNF-03 medido nas 16 telas antes e depois; o que passar de 2 níveis é ajustado na convergência |
| **R3.** Sem logo na barra recolhida, a marca some em tela larga | média | decisão revisável nas capturas da convergência; o logo aparece de novo ao expandir, e o nome do portal continua no menu do usuário |
| **R4.** O `Menu` mudar o `ThemeToggle` e quebrar o que a 010 provou | média | o teste do `ThemeToggle` é a primeira tarefa a passar com o `Menu` novo, antes de qualquer outro uso |
| **R5.** Testes existentes que procuram "Sair", "Exportar PDF", "Desativar" ou o nome do usuário no cabeçalho quebram | alta | 18 arquivos de teste citam esses textos (levantamento de 2026-10-08); cada tarefa ajusta os testes do arquivo que toca, no padrão do Princípio 11, e três e2e passam a abrir o menu |
| **R6.** A barra de abas cobre botão flutuante ou fim de lista, ou fica sob a barra de gestos | média | espaço no fim do `main`, `viewport-fit=cover` e medição em 390 px e 360 px (RF-06, RNF-06) |
| **R7.** Conteúdo escondido com `hidden` continua na ordem de tabulação ou no `Dialog` | baixa | `hidden` tira o elemento do foco; o `Dialog` já filtra `[hidden]`; teste confere |
| **R8.** Transição da coluna da grade não anima em navegador antigo | baixa | a mudança continua correta sem animação; RNF-08 só exige o tempo máximo |
| **R9.** `localStorage` indisponível (navegação privada) | baixa | `try/catch` e valor padrão; teste cobre o caso |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | nada de ferramenta de linguagem direto: tudo por `make test`, `make cover`, `make e2e` e `make validate`; nenhum alvo novo |
| 2 Arquitetura limpa | regra pura em `shared/lib` (destinos, preferência, resumo); componente fala com hook; nenhum acesso novo à API |
| 3 Testes provam a entrega | todo arquivo de produção criado tem teste espelhado; um comportamento por teste, Arrange/Act/Assert, `deve ... quando ...`; cada cenário da spec vira um teste com o nome do cenário |
| 4 Simplicidade defensável | duas composições (`Menu` e a fachada de `PageHeader`); Command, Observer, Strategy e contexto recusados com motivo |
| 5 Autoria | commits e PR sem crédito a ferramenta de IA |
| 6 Idioma | artefatos e textos de tela em português; nomes de peças de UI em português como o legado (`SecaoRecolhivel`, `BarraLateral`), com `Menu` e `PageHeader` já existentes |
| 7 Mapa de pastas do legado | nada fora de `app/src` e `app/tests`; testes espelhados em `app/tests/unit`; nenhuma pasta Byte Union criada; `fetch` não é chamado; nenhum `*Api.ts` importado em componente |
| 8 Linguagem ubíqua | nenhum termo de domínio traduzido ou renomeado; só rótulos de interface |
| 9 Compatibilidade com a v1.5.0 | nenhuma mudança de contrato com a API; nenhuma permissão decidida no cliente além das que já existem |
| 10 Cobertura não regride | regras novas em `shared/lib` e `shared/hooks`, medidas; nenhuma exclusão acrescentada; limite de 95% por arquivo alterado mantido (RNF-10) |
| 11 Padrão de teste no que for tocado | todo teste novo ou alterado segue o Princípio 3; os 18 que citam textos movidos são ajustados nesse padrão |
| 12 Uma fonte de especificação | tudo em `specs/011-...`; `openspec/` só ganha uma linha na tabela do README |

## Cobertura dos requisitos

| Requisito | Onde |
|---|---|
| RF-01, RF-03 | `BarraLateral`, `AppLayout` |
| RF-02, RF-04 | `usePreferenciaGuardada`, `preferenciaDeInterface`, `BarraLateral` |
| RF-05, RF-06, RF-07 | `BarraDeAbas`, `AppLayout`, `app/index.html` |
| RF-08, RF-09, RF-10 | `MenuDoUsuario`, `AppLayout`, `Menu` |
| RF-11 | `AppLayout` |
| RF-12, RF-13 | `PageHeader`, `Menu`, `useExportarPdf`, `SolicitacoesPage`, `ModelosPage`, `ModeloDetalhePage` |
| RF-14 | `Menu` (e `ThemeToggle`, `MenuDoUsuario`, `PageHeader`) |
| RF-15, RF-16 | `SecaoRecolhivel`, `usePreferenciaGuardada`, `resumoDeFiltros` |
| RF-17 | `ModelosFilters`, `UsuariosFilters` |
| RNF-01 a RNF-09 | testes de componente e roteiro de medição da convergência |
| RNF-10, RNF-11, RNF-12 | `make cover`, `package.json` sem pacote novo, nenhuma mudança de API |
| RNF-13 | `navegacao.ts` e o teste dela |
