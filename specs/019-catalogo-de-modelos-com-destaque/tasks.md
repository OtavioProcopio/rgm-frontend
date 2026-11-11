# Tarefas — Catálogo de modelos com destaque, filtros por botão e fotos navegáveis

> Ordem de dependência; teste antes da implementação.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Contrato, regras puras e dados (RF-01 a RF-07, RF-13, RF-18, RF-19)

- [x] T001 Teste e `lib/filtrosDoCatalogo`: lê e escreve `tipo`, `maquina`, `q`, `inativos`, `modelo`; descarta valor inválido; `q` de 1 caractere não filtra; padrão = só ativos (RF-04, RF-05, RF-18)
- [x] T002 Teste e `lib/botoesDoCatalogo`: junta os tipos e as máquinas do catálogo com as contagens da API, põe 0 no que a API omite, marca o escolhido, desabilita o de 0 que não é o escolhido, e deixa sem número quando não há contagens (RF-02, RF-03, RF-21)
- [x] T003 Teste e `lib/posicaoNoCatalogo`: índice, anterior, próximo, primeiro e último, "precisa de outro bloco", modelo ausente (RF-13, RF-17, RF-19)
- [x] T004 Tipos `ModelosFilters` (`tipo`, `q`, `maquinaExata`, `ordem`) e `ContagensDeModelos`; teste e `modelosApi.contagens` (RF-03)
- [x] T005 Teste e `useCatalogoDeModelos` (infinita, nos dois sentidos): 20 por bloco, começa na página pedida e carrega a anterior, `ordem=CODIGO`, `ativo=true` por padrão, `maquinaExata`, total do servidor, próximo bloco, sem requisição duplicada (RF-06, RF-16)
- [x] T006a Teste e `usePosicaoDoModelo`: posição, nula, 404; deriva a página inicial `(posicao − 1) / 20` (RF-19, RF-20)
- [x] T006 Teste e `useContagensDeModelos`: mesmos filtros, sem a página, mantém os números anteriores enquanto atualiza (RF-03)
- [x] T007 Teste e `useFiltrosDoCatalogo`: botão cria entrada no histórico; busca, inativos e modelo usam `replace`; "Limpar filtros" (RF-02, RF-18)

## Fase 2 — Filtros e lista (RF-01 a RF-07, RF-15, RF-16, RF-20)

- [x] T008 Teste e `FiltrosDoCatalogo` + `BotaoDeFiltro`: grupos de tipo e de máquina, `aria-pressed`, clique no escolhido volta a Todos, contagem, desabilitado em 0, busca com debounce de 300 ms e dica de 2 letras, "Mostrar inativos", "Limpar filtros"; alvo de toque de 44 px (RF-01 a RF-05, RF-22)
- [x] T009 Teste e `ListaDoCatalogo` + `ItemDoCatalogo`: miniatura da capa, descrição, código, selos; item do destaque marcado e visível; clique; "mostrando X de Y"; "Carregar mais (n restantes)"; vazio; erro com "Tentar novamente" (RF-15, RF-16, RF-20)

## Fase 3 — Destaque e fotos (RF-08 a RF-14, RF-21)

- [x] T010 Teste e `GaleriaDoDestaque`: foto grande, miniaturas com a capa primeiro, troca ao clicar, `aria-current`, "foto k de n", setas que dão a volta, setas do teclado só dentro da faixa, uma foto sem setas nem faixa, sem foto com sigla, movimento reduzido sem animação (RF-09 a RF-11)
- [x] T011 Teste e `usePrefetchGaleria`: carrega a galeria dos vizinhos em segundo plano, sem repetir (RF-12, RNF-01)
- [x] T012 Teste e `DestaqueDoModelo`: dados, selos, "Abrir ficha completa" para `/app/modelos/:id`, "Anterior" e "Próximo" com contador e desabilitados nos extremos, região que anuncia a troca, aviso de falha nas fotos extras com "Tentar novamente" (RF-08, RF-13, RF-21, RNF-05)
- [x] T013 Teste do ouvinte de teclado: ←/→ trocam de modelo, e não quando o foco está em campo ou na faixa de miniaturas (RF-14)

## Fase 4 — Página (RF-07, RF-13, RF-17 a RF-23)

- [x] T014 Teste e `ModelosPage` (catálogo): primeiro do filtro em destaque; filtro novo reinicia; "Próximo" no fim do bloco carrega o seguinte e avança; "Anterior" no primeiro bloco carregado carrega o anterior; link para o 135º de 300 abre no bloco certo com "135 de 300"; modelo fora do filtro zera os filtros e avisa; modelo inativo liga "Mostrar inativos"; modelo inexistente avisa e corrige o endereço; vazio; erro; contagens falhando; uma coluna no celular (RF-07, RF-13, RF-17 a RF-20, RF-23 a RF-25)
- [x] T014a Teste de "Copiar link" (cópia, confirmação, campo de reserva quando bloqueada) e de os itens da lista serem `<a href>` que abrem sem recarregar e respeitam Ctrl/Cmd/botão do meio (RF-21, RF-22)
- [x] T015 Teste de que `/app/modelos/:id`, a administração e a ficha seguem inalteradas e remover `ModeloCard` se sem uso (RF-23)

## Fase 5 — E2E, documentação e validação

- [~] T016 E2E `catalogo-de-modelos.spec.ts`: botões de tipo e máquina, busca, destaque, Próximo, lista, miniaturas, endereço compartilhável, 390 px sem rolagem horizontal
- [x] T017 Atualizar `docs/swagger.json` (parâmetros e rota de contagens) e a tabela de `openspec/README.md` (capacidade `modelos`)
- [~] T018 `make validate` verde, `make cover-arquivos` nos componentes e hooks novos, e `make e2e` contra o backend com a spec 016, com a saída real no `Convergence`

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01, RF-02 | T001, T007, T008 |
| RF-03 | T002, T004, T006, T008 |
| RF-04, RF-05 | T001, T008 |
| RF-06 | T005 |
| RF-07 | T005, T014 |
| RF-08 | T012 |
| RF-09, RF-10, RF-11 | T010 |
| RF-12 | T011 |
| RF-13 | T003, T012 |
| RF-14 | T013 |
| RF-15 | T009 |
| RF-16 | T005, T009 |
| RF-17 | T003, T014 |
| RF-18 | T001, T007 |
| RF-19, RF-20 | T003, T006a, T014 |
| RF-21, RF-22 | T014a |
| RF-23, RF-24 | T002, T009, T012, T014 |
| RF-25 | T008, T014, T016 |
| RF-26 | T015 |
| RNF-01 | T005, T006, T011 |
| RNF-02 | T014 |
| RNF-03, RNF-05 | T010, T012 |
| RNF-04 | T018 (`package.json` sem mudança) |
| RNF-06, RNF-07 | T018 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-11-11

Evidência de execução (nesta máquina):

- `npm run validate`: lint 0 erros (2 avisos que já existiam, em `TriagemModal` e `NovaSolicitacaoPage`),
  tipos sem erro, **249 arquivos e 3706 testes sem falha**, cobertura global 99,9% de linhas, build
  concluído.
- `make cover-arquivos` em todos os componentes, hooks, libs e na página do catálogo
  (`src/features/modelos/**`): exit 0 com o limite de 95% por arquivo (conjunto: 99,5% de linhas).
- `playwright test --list` reconhece os 5 cenários de `app/tests/e2e/catalogo-de-modelos.spec.ts`.
- **Não executado:** `make e2e`. Os 5 cenários (busca + Próximo/Anterior, clique na lista, link
  direto, botão de máquina, 390 px sem rolagem horizontal) exigem o backend da spec 016 no ar; esta
  máquina não o tem. Por isso T016 e T018 ficam parciais (`[~]`), e RNF-03 do teclado/foco em
  navegador real também não foi vista.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01, RF-02 | realizado | `FiltrosDoCatalogo`, `BotaoDeFiltro`, `useFiltrosDoCatalogo` (clique no escolhido volta a todos); testes de página |
| RF-03 | realizado | `botoesDoCatalogo` + `useContagensDeModelos`; página: 0 desabilita, escolhido com 0 não desabilita |
| RF-04, RF-05 | realizado | `useBuscaDoCatalogo` (300 ms, 2 letras), `paraConsulta` (ativos por padrão); página: busca e "Mostrar inativos" |
| RF-06, RF-07 | realizado | `useCatalogoDeModelos` (`ordem=CODIGO`, blocos de 20); filtro novo volta ao 1º do resultado |
| RF-08 a RF-12 | realizado | `DestaqueDoModelo`, `GaleriaDoDestaque`, `usePrefetchGaleria`; testes de miniaturas, setas, foco, "capa", sem foto, cache |
| RF-13, RF-14, RF-17 | realizado | `posicaoNoCatalogo`; página: Próximo/Anterior dentro do bloco e atravessando blocos nos dois sentidos; setas do teclado |
| RF-15, RF-16 | realizado | `ListaDoCatalogo`, `ItemDoCatalogo`; "Carregar mais" e "Carregar anteriores" |
| RF-18 | realizado | filtros e modelo no endereço (`lerFiltros`/`escreverFiltros`); botão cria entrada, o resto substitui |
| RF-19, RF-20 | realizado | `useAberturaDoCatalogo`: 135º de 299 abre no bloco 6; fora do filtro mostra tudo e avisa; inativo liga "Mostrar inativos"; inexistente avisa |
| RF-21, RF-22 | realizado | "Copiar link" (copiado e campo de reserva); itens da lista são `<a href>` |
| RF-23, RF-24 | realizado | vazio com "Limpar filtros", erro com "Tentar novamente", contagens falhando sem número, fotos extras falhando com "Tentar novamente" |
| RF-25 | parcial | layout de uma coluna por classes (`min-[800px]`); e2e de 390 px escrito, não executado |
| RF-26 | realizado | administração, ficha e `/app/modelos/:id` intocados (suíte inteira verde); `ModeloCard` removido por falta de uso |
| RNF-01 a RNF-05 | realizado | uma consulta de lista e uma de contagens por filtro; sem dependência nova; imagens preguiçosas; região nomeada e `aria-pressed` |
| RNF-06, RNF-07 | realizado | cobertura por arquivo e `validate` acima |

Achados e desvios:

- **Defeito encontrado pelos testes de falha:** `carregarDepois`/`carregarAntes` devolviam o último
  bloco já carregado quando a busca do novo bloco falhava, e a página moveria o destaque para um
  modelo errado; além disso, a falha derrubava a tela toda em `ErrorState`. Corrigido: devolvem
  vazio em falha, `erro` só vale sem nenhum bloco e há `erroNoBloco`, mostrado na lista como aviso
  sem esconder o que já estava na tela.
- O botão "Todos"/"Todas" fica sem número: o total exato com um filtro de grupo ignorado não vem da
  API sem uma terceira contagem.
- A lista ganhou "Carregar anteriores" (a abertura por link cai no meio do catálogo).
- O nome acessível do botão de filtro leva um espaço entre rótulo e contagem ("Resina (3 modelos)").
- `docs/swagger.json` recebeu os parâmetros novos de `GET /api/modelos` e as rotas
  `/api/modelos/contagens` e `/api/modelos/{id}/posicao`, escritos à mão no estilo do arquivo (que
  já estava defasado em outras rotas do backend); não foi regenerado do backend.
- Desvio de processo: o `e2e` que o resumo anterior dava como escrito não existia no disco; foi
  escrito agora. Um `git stash` meu, por engano, guardou as edições por instantes; restaurado sem
  perda (conferido pelo `status` e pela suíte inteira) e o trabalho foi commitado em seguida.
- Ordem de publicação (Princípio 9): o backend da spec 016 (PR #141) precisa ir antes; sem ele, o
  catálogo novo falha (contagens, posição, `ordem`, `maquinaExata`).
