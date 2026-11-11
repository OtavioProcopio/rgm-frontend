# Tarefas — Catálogo de modelos com destaque, filtros por botão e fotos navegáveis

> Ordem de dependência; teste antes da implementação.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Contrato, regras puras e dados (RF-01 a RF-07, RF-13, RF-18, RF-19)

- [ ] T001 Teste e `lib/filtrosDoCatalogo`: lê e escreve `tipo`, `maquina`, `q`, `inativos`, `modelo`; descarta valor inválido; `q` de 1 caractere não filtra; padrão = só ativos (RF-04, RF-05, RF-18)
- [ ] T002 Teste e `lib/botoesDoCatalogo`: junta os tipos e as máquinas do catálogo com as contagens da API, põe 0 no que a API omite, marca o escolhido, desabilita o de 0 que não é o escolhido, e deixa sem número quando não há contagens (RF-02, RF-03, RF-21)
- [ ] T003 Teste e `lib/posicaoNoCatalogo`: índice, anterior, próximo, primeiro e último, "precisa de outro bloco", modelo ausente (RF-13, RF-17, RF-19)
- [ ] T004 Tipos `ModelosFilters` (`tipo`, `q`, `maquinaExata`, `ordem`) e `ContagensDeModelos`; teste e `modelosApi.contagens` (RF-03)
- [ ] T005 Teste e `useCatalogoDeModelos` (infinita): 20 por bloco, `ordem=CODIGO`, `ativo=true` por padrão, `maquinaExata`, total do servidor, próximo bloco, sem requisição duplicada (RF-06, RF-16)
- [ ] T006 Teste e `useContagensDeModelos`: mesmos filtros, sem a página, mantém os números anteriores enquanto atualiza (RF-03)
- [ ] T007 Teste e `useFiltrosDoCatalogo`: botão cria entrada no histórico; busca, inativos e modelo usam `replace`; "Limpar filtros" (RF-02, RF-18)

## Fase 2 — Filtros e lista (RF-01 a RF-07, RF-15, RF-16, RF-20)

- [ ] T008 Teste e `FiltrosDoCatalogo` + `BotaoDeFiltro`: grupos de tipo e de máquina, `aria-pressed`, clique no escolhido volta a Todos, contagem, desabilitado em 0, busca com debounce de 300 ms e dica de 2 letras, "Mostrar inativos", "Limpar filtros"; alvo de toque de 44 px (RF-01 a RF-05, RF-22)
- [ ] T009 Teste e `ListaDoCatalogo` + `ItemDoCatalogo`: miniatura da capa, descrição, código, selos; item do destaque marcado e visível; clique; "mostrando X de Y"; "Carregar mais (n restantes)"; vazio; erro com "Tentar novamente" (RF-15, RF-16, RF-20)

## Fase 3 — Destaque e fotos (RF-08 a RF-14, RF-21)

- [ ] T010 Teste e `GaleriaDoDestaque`: foto grande, miniaturas com a capa primeiro, troca ao clicar, `aria-current`, "foto k de n", setas que dão a volta, setas do teclado só dentro da faixa, uma foto sem setas nem faixa, sem foto com sigla, movimento reduzido sem animação (RF-09 a RF-11)
- [ ] T011 Teste e `usePrefetchGaleria`: carrega a galeria dos vizinhos em segundo plano, sem repetir (RF-12, RNF-01)
- [ ] T012 Teste e `DestaqueDoModelo`: dados, selos, "Abrir ficha completa" para `/app/modelos/:id`, "Anterior" e "Próximo" com contador e desabilitados nos extremos, região que anuncia a troca, aviso de falha nas fotos extras com "Tentar novamente" (RF-08, RF-13, RF-21, RNF-05)
- [ ] T013 Teste do ouvinte de teclado: ←/→ trocam de modelo, e não quando o foco está em campo ou na faixa de miniaturas (RF-14)

## Fase 4 — Página (RF-07, RF-13, RF-17 a RF-23)

- [ ] T014 Teste e `ModelosPage` (catálogo): primeiro do filtro em destaque; filtro novo reinicia; "Próximo" no fim do bloco carrega o seguinte e avança; endereço com modelo no 2º bloco carrega até achá-lo; modelo fora do filtro corrige o endereço; vazio; erro; contagens falhando; uma coluna no celular (RF-07, RF-13, RF-17 a RF-22)
- [ ] T015 Teste de que `/app/modelos/:id`, a administração e a ficha seguem inalteradas e remover `ModeloCard` se sem uso (RF-23)

## Fase 5 — E2E, documentação e validação

- [ ] T016 E2E `catalogo-de-modelos.spec.ts`: botões de tipo e máquina, busca, destaque, Próximo, lista, miniaturas, endereço compartilhável, 390 px sem rolagem horizontal
- [ ] T017 Atualizar `docs/swagger.json` (parâmetros e rota de contagens) e a tabela de `openspec/README.md` (capacidade `modelos`)
- [ ] T018 `make validate` verde, `make cover-arquivos` nos componentes e hooks novos, e `make e2e` contra o backend com a spec 016, com a saída real no `Convergence`

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
| RF-19 | T003, T014 |
| RF-20, RF-21 | T002, T009, T012, T014 |
| RF-22 | T008, T014, T016 |
| RF-23 | T015 |
| RNF-01 | T005, T006, T011 |
| RNF-02 | T014 |
| RNF-03, RNF-05 | T010, T012 |
| RNF-04 | T018 (`package.json` sem mudança) |
| RNF-06, RNF-07 | T018 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
