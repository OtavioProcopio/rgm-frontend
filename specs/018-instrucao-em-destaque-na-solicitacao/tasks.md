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

## Fase 3 — Corrigir a instrução (RF-11 a RF-19)

- [ ] T015 Teste de `acoesSolicitacao`: com `acoesPermitidas` da API vale a API; sem ela, `EDITAR_INSTRUCAO` só para gestor e administrador com `EM_ANDAMENTO`; nunca para operador; o rótulo da ação existe; `BOTOES` e `acaoDoMovimento` não a incluem (RF-11, RF-19)
- [ ] T016 `EDITAR_INSTRUCAO` em `ACOES_SOLICITACAO`, `regraLocal` e rótulo "Editar o que precisa ser feito"
- [ ] T017 Teste de `instrucaoMudou`: igual, igual depois de aparar, diferente, atual nulo (RF-13)
- [ ] T018 `lib/instrucaoMudou.ts`
- [ ] T019 Teste do `editarInstrucaoSchema` e do validador compartilhado: ausente, em branco, 2001, 2000, aparado; a triagem usa o mesmo (RF-12)
- [ ] T020 `instrucaoDoTrabalho` e `editarInstrucaoSchema`; `triarSolicitacaoSchema` passa a usá-lo
- [ ] T021 Teste de `solicitacoesApi.editarInstrucao`: rota e corpo (RF-12)
- [ ] T022 `solicitacoesApi.editarInstrucao`, `TriarSolicitacao`-style tipo `EditarInstrucaoRequest`
- [ ] T023 Teste de `useEditarInstrucao`: no sucesso, o detalhe em cache recebe a resposta mantendo `acoesPermitidas` e responsáveis; listas e histórico invalidados; sem GET do detalhe (RF-13, RNF-01)
- [ ] T024 `useEditarInstrucao`
- [ ] T025 Teste de `EditarInstrucaoAction`: campo preenchido com a instrução atual; "Salvar" desabilitado até mudar; vazio mostra o erro e não envia; envia a instrução aparada; fecha e avisa "Instrução atualizada"; erro de conflito e de rede mantêm o diálogo aberto com o texto (RF-12, RF-13, RF-15)
- [ ] T026 `EditarInstrucaoAction`, entrada em `AcaoSolicitacaoAtiva` e em `sucessoDaAcao`
- [ ] T027 Teste de `DialogoDaAcao` com a nova ação: alterar e cancelar pergunta o descarte; sem alteração fecha direto; foco volta ao botão "Editar" (RF-14, RNF-04)
- [ ] T028 Teste de `InstrucaoDaSolicitacao`: botão "Editar" com nome acessível só quando permitido; ausente para operador, em outros status e sem instrução; chama o callback (RF-11)
- [ ] T029 `InstrucaoDaSolicitacao` com o botão; `SolicitacaoDetalhePage` passa a permissão e abre a ação
- [ ] T030 Teste de `historicoDaSolicitacao` e `SolicitacaoTimeline`: `INSTRUCAO_ALTERADA` mostra "Instrução alterada", autor, data e "Antes: …" em destaque; tipo desconhecido mostra "Atividade registrada" com marcador neutro e o resto da linha do tempo aparece (RF-16, RF-18)
- [ ] T031 `INSTRUCAO_ALTERADA` em tipos, peso, ícone e rótulo; item de reserva para tipo desconhecido
- [ ] T032 Teste do `SolicitacaoDetalhePage`: evento `instrucao_editada` (solicitação e atividade) atualiza o bloco, o histórico e o botão sem recarregar (RF-17)

## Fase 4 — E2E, documentação e validação

- [ ] T033 E2E: auxiliar de triagem preenche "O que precisa ser feito"; roteiro do quadro confere o bloco no detalhe depois de triar; verificação de largura em 320 px com instrução longa; gestor corrige a instrução e o histórico mostra "Instrução alterada"; operador não vê "Editar" (RF-01, RF-02, RF-11, RF-16, RNF-03)
- [ ] T034 Atualizar `docs/swagger.json` (`instrucao` na solicitação e na triagem, rota `/instrucao`) e a tabela de `openspec/README.md`; ajustar a linha da spec 017 (o campo passou a `instrucao`)
- [ ] T035 `make validate` verde e `make e2e` contra o backend com a spec 015, com a saída real no `Convergence`

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
| RF-11 | T015, T016, T028, T029 |
| RF-12 | T019, T020, T021, T022, T025, T026 |
| RF-13 | T017, T018, T023, T024, T025, T026 |
| RF-14 | T027 |
| RF-15 | T025, T026 |
| RF-16 | T030, T031, T033 |
| RF-17 | T032 |
| RF-18 | T030, T031 |
| RF-19 | T015, T016 |
| RNF-01 | T013, T023 |
| RNF-02 | T035 (`package.json` sem mudança) |
| RNF-03 | T033 |
| RNF-04 | T003, T009, T027, T028 |
| RNF-05, RNF-06 | T035 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
