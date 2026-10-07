# Tarefas — Paginação real nas listas

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova; quando teste e
> implementação estão na mesma tarefa, o teste é escrito primeiro.

> O repositório não tem `app/tests/bdd/` (ver `plan.md`): cada cenário da spec é um teste no
> arquivo indicado, com o nome do cenário.

> Checklist `checklists/requisitos.md`: o usuário aceitou a adequação da spec em 2026-10-07
> e mandou implementar ("vamos implementar a 005"), sem revisão item a item.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`.

## Fase 1 — Domínio

- [ ] T001 Criar `TST/features/solicitacoes/lib/filtrosDaColuna.test.ts`: bloco de 20 na página pedida; status da coluna; modelo e período de criação repassados a toda coluna; Concluída e Cancelada sem período pedem data de conclusão a partir de 30 dias atrás; com período não pedem; colunas em aberto nunca pedem; `inicioDosUltimos30Dias` devolve o início do dia de 30 dias antes
- [ ] T002 Alterar `SRC/features/solicitacoes/types/solicitacaoTypes.ts` (`emAberto`, `tipoData`, `dataInicio`, `dataFim`) e criar `SRC/features/solicitacoes/lib/filtrosDaColuna.ts`

## Fase 2 — Quadro em blocos

- [ ] T003 Criar `TST/features/solicitacoes/hooks/useColunaDoQuadro.test.ts`: primeira carga pede 1 bloco de 20; devolve os cards e o total da API; `temMais` verdadeiro com mais páginas e falso na última; carregar mais pede a página seguinte e soma os cards; atualizar as listas refaz os 2 blocos carregados e mantém a quantidade; card repetido entre blocos aparece uma vez
- [ ] T004 Alterar `SRC/features/solicitacoes/hooks/solicitacoesKeys.ts` (chave `coluna()`) e criar `SRC/features/solicitacoes/hooks/useColunaDoQuadro.ts`
- [ ] T005 Testes e alteração de `SRC/features/solicitacoes/components/KanbanColumn.tsx`: contador mostra o `total` e não a quantidade de cards; "Carregar mais" aparece com `temMais`; não aparece sem; chama `onCarregarMais` uma vez; fica desabilitado com "Carregando..." durante a busca; mostra o aviso recebido ("últimos 30 dias") e não mostra sem ele
- [ ] T006 Testes em `TST/features/solicitacoes/components/KanbanBoard.test.tsx`: abre com uma consulta por coluna; contador de cada coluna e das abas do celular com o total; "últimos 30 dias" em Concluída e Cancelada sem período e ausente com período; quadro vazio do operador só quando as cinco colunas responderam e somam zero; não aparece enquanto alguma carrega; operador com 1 solicitação vê as cinco colunas; erro de uma coluna mostra o erro do quadro. Ajustar os testes existentes do arquivo ao hook novo
- [ ] T007 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`
- [ ] T008 Remover `SRC/features/solicitacoes/hooks/useKanbanSolicitacoes.ts` e `SRC/features/solicitacoes/hooks/useDashboardData.ts`, e os testes dos dois em `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts` (o teste de RF-09 da feature 009 passa a usar `useColunaDoQuadro`)

## Fase 3 — Aba pessoal e painel

- [ ] T009 [P] Testes e alteração de `SRC/features/solicitacoes/pages/PessoalTab.tsx`: as duas listas pedem `emAberto` com 10 por página; mostram 10 itens e a paginação com o total de páginas; "Próxima" pede a página seguinte só daquela lista; "Abertas por mim" e "Sou responsável" mostram o total em aberto. Ajustar os testes existentes do arquivo
- [ ] T010 [P] Criar `TST/features/solicitacoes/pages/SolicitacoesTab.test.tsx` e alterar `SRC/features/solicitacoes/pages/SolicitacoesTab.tsx`: cada prioridade vem de uma contagem em aberto com `size` 1; a barra mostra o total da API; nenhuma consulta pede mais de 5 itens

## Fase 4 — Seletor de modelo

- [ ] T011 Testes e alteração de `SRC/shared/components/Combobox/Combobox.tsx`: com `onSearchChange`, digitar avisa o termo e as opções recebidas não são filtradas na tela; com `selectedOption`, o campo mostra o rótulo dele mesmo fora das opções; fechar sem escolher mantém o selecionado; `loading` mostra "Buscando..."; sem as propriedades novas o comportamento atual se mantém
- [ ] T012 Criar `TST/features/admin/modelos/hooks/useBuscaDeModelos.test.ts` e `SRC/features/admin/modelos/hooks/useBuscaDeModelos.ts`: não busca antes de 300 ms da última tecla; busca por `codigo`, só ativos, 20 itens; termo vazio busca os 20 primeiros
- [ ] T013 Criar `TST/features/solicitacoes/components/SeletorDeModelo.test.tsx` e `SRC/features/solicitacoes/components/SeletorDeModelo.tsx`: opções vêm da busca; o modelo selecionado aparece mesmo fora da busca atual; escolher chama `onChange` com o id; limpar chama com vazio
- [ ] T014 [P] Testes e alteração de `SRC/features/solicitacoes/pages/NovaSolicitacaoPage.tsx`: usa o seletor com busca; não pede mais de 20 modelos; abre com o modelo da URL selecionado
- [ ] T015 [P] Testes e alteração de `SRC/features/solicitacoes/components/SolicitacaoFilters.tsx`: filtro de modelo com busca; escolher um modelo filtra a lista e volta à primeira página; limpar remove o filtro

## Fase 5 — Resumos de modelos

- [ ] T016 Alterar `SRC/features/admin/modelos/types/modeloTypes.ts`, `SRC/features/admin/modelos/api/modelosApi.ts` e `SRC/features/admin/modelos/hooks/modelosKeys.ts`; criar `TST/features/admin/modelos/hooks/resumosDeModelos.test.ts`, `SRC/features/admin/modelos/hooks/useResumoDeModelos.ts` e `SRC/features/admin/modelos/hooks/useResumoDasSolicitacoesDoModelo.ts`: cada hook chama o endpoint uma vez e devolve o resumo; o da ficha não busca sem id
- [ ] T017 [P] Testes e alteração de `SRC/features/solicitacoes/pages/ModelosTab.tsx`: total, ativos, inativos, com pendência e quantidade por máquina vêm do resumo; a tela não lista modelos para contar
- [ ] T018 [P] Testes e alteração de `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx`: total, abertas, concluídas, taxa de sucesso e os dois tempos vêm do resumo; tempo ausente mostra "—"; a tela só pede as 50 solicitações do histórico

## Fase 6 — Integração e fechamento

- [ ] T019 Criar `TST/tamanhoDePagina.test.ts`: nenhum `size` literal acima de 100 nem calculado em `app/src` (RNF-03, RF-11)
- [ ] T020 Acrescentar as linhas desta feature à tabela de `openspec/README.md`
- [ ] T021 Rodar a feature contra o backend de `develop`: carga inicial do quadro com 5 listagens de 20 (RNF-01); coluna com 45 mostra 20, depois 40 (cenários da spec); encerradas de 10 e de 60 dias; busca de modelo; área de toque e foco de "Carregar mais", paginação e seletor em 390 px (RNF-04). Registrar na convergência
- [ ] T022 Cobertura dos arquivos medidos em 95% ou mais (`make coverage`) e `package.json` sem dependência nova
- [ ] T023 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001, T002, T003, T004, T006, T007 |
| RF-02 | T003, T004, T005, T007 |
| RF-03 | T005, T006, T007 |
| RF-04 | T001, T002, T005, T006, T007 |
| RF-05 | T001, T002, T006 |
| RF-06 | T001, T002 |
| RF-07 | T009 |
| RF-08 | T011, T012, T013, T014, T015 |
| RF-09 | T011, T013, T014 |
| RF-10 | T010 |
| RF-11 | T008, T019 |
| RF-12 | T003, T004 |
| RF-13 | T016, T017 |
| RF-14 | T016, T018 |
| RF-15 | T003, T004 |
| RF-16 | T006, T007 |
| RNF-01 | T006, T021 |
| RNF-02 | T012 |
| RNF-03 | T008, T019 |
| RNF-04 | T021 |
| RNF-05 | T022 |

### Cenários da spec × teste

| Cenário | Tarefa |
|---|---|
| Coluna carrega em blocos | T003, T006, T021 |
| Carregar mais | T003, T005, T021 |
| Fim da coluna | T003, T005 |
| Encerradas dos últimos 30 dias | T001, T006, T021 |
| Período escolhido vale para as encerradas | T001, T006 |
| Aba pessoal paginada | T009 |
| Buscar modelo pelo código | T012, T013, T021 |
| Modelo selecionado permanece visível | T011, T013 |
| Ação mantém o que foi carregado | T003 |
| Reconexão mantém o que foi carregado | T003 |
| Quadro vazio do operador só depois de carregar | T006 |
| Operador com solicitação em uma coluna só | T006 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
