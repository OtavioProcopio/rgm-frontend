# Tarefas — Instrução em destaque na solicitação

> Ordem de dependência; teste antes da implementação.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Esquema, contrato e triagem (RF-05, RF-06, RF-08, RF-09)

- [ ] T001 Teste do `triarSolicitacaoSchema`: `instrucao` ausente, só com espaços e com 2001 caracteres é recusada; 2000 é aceita; as pontas são aparadas (RF-05, RF-06)
- [ ] T002 Renomear `descricao` para `instrucao` em `solicitacaoSchema`, `solicitacaoTypes` (`Solicitacao.instrucao`, `TriarSolicitacaoRequest.instrucao`) e `solicitacaoFixture`; atualizar os testes que citam o nome
- [ ] T003 Teste do `TriagemModal`: rótulo "O que precisa ser feito"; vazio e só com espaços mostram "Descreva o que precisa ser feito", não enviam e focam o campo; entrega a instrução aparada; limite de 2000 com contador (RF-05, RF-06, RNF-04)
- [ ] T004 `TriagemModal` com o rótulo e o campo `instrucao`
- [ ] T005 Teste do `TriarAction`: `triar` recebe `instrucao`; a foto segue sem texto; falha da triagem mantém o texto e mostra o erro; conflito mostra o aviso de conflito (RF-08, RF-09)
- [ ] T006 `TriarAction` ajustado

## Fase 2 — Instrução em destaque (RF-01 a RF-04, RF-07, RF-10)

- [ ] T007 Teste de `instrucaoParaExibir` por tabela de status e texto: `A_FAZER` e `CANCELADA` sem texto → nenhuma; `EM_ANDAMENTO`, `EM_VALIDACAO` e `CONCLUIDA` sem texto ou em branco → semRegistro; com texto, em qualquer status → instrução (RF-01, RF-03, RF-04)
- [ ] T008 `lib/instrucaoParaExibir.ts`
- [ ] T009 Teste de `InstrucaoDaSolicitacao`: região nomeada "O que precisa ser feito"; quebras de linha preservadas; 2000 caracteres e palavra de 200 sem espaço renderizam inteiros, com `break-words`; aviso de "Sem instrução registrada…" tem texto e ícone; nada para "nenhuma" (RF-02, RF-03, RNF-04)
- [ ] T010 `components/InstrucaoDaSolicitacao.tsx`
- [ ] T011 Teste de `SolicitacaoResumo`: o bloco vem antes da grade; sem mudança nos demais campos; descrição da abertura segue como "Descrição" (RF-01, RF-10)
- [ ] T012 `SolicitacaoResumo` renderiza o bloco
- [ ] T013 Teste do `SolicitacaoDetalhePage`: evento "triada" de outro usuário faz o bloco aparecer sem nova requisição de detalhe além da que o evento já provoca (RF-07, RNF-01)
- [ ] T014 Teste do cartão e da linha da listagem: não mostram a instrução (RF-10)

## Fase 3 — E2E, documentação e validação

- [ ] T015 E2E: auxiliar de triagem preenche "O que precisa ser feito"; roteiro do quadro confere o bloco no detalhe depois de triar; verificação de largura em 320 px com instrução longa (RF-01, RF-02, RNF-03)
- [ ] T016 Atualizar `docs/swagger.json` e a tabela de `openspec/README.md`; ajustar a linha da spec 017 (o campo passou a `instrucao`)
- [ ] T017 `make validate` verde e `make e2e` contra o backend com a spec 015, com a saída real no `Convergence`

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T007, T008, T009, T010, T011, T012, T015 |
| RF-02 | T009, T010, T015 |
| RF-03 | T007, T008, T009, T010 |
| RF-04 | T007, T008 |
| RF-05 | T001, T002, T003, T004 |
| RF-06 | T001, T002, T003, T004 |
| RF-07 | T013 |
| RF-08 | T005, T006 |
| RF-09 | T005, T006 |
| RF-10 | T011, T014 |
| RNF-01 | T013 |
| RNF-02 | T017 (`package.json` sem mudança) |
| RNF-03 | T015 |
| RNF-04 | T003, T009 |
| RNF-05, RNF-06 | T017 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
