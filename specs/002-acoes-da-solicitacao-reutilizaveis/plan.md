# Plano de implementação — Ações da solicitação reutilizáveis

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Cenários de aceite:** o repositório não tem `app/tests/bdd/` nem alvo `make bdd` (ver
> `.specify/memory/as-is.md`, seção 4). Cada cenário da spec vira um teste de componente ou
> de módulo com o nome do cenário, no arquivo indicado nas tarefas.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde mora a regra de quem pode o quê | função pura `acoesPermitidas(solicitacao, ator)` em `features/solicitacoes/lib/acoesSolicitacao.ts` | regra dentro de hook ou de componente | `hooks/` e `components/` estão fora da medição de cobertura; regra de permissão precisa ser medida (Princípio 10, RNF-02) |
| Fonte das ações | se `solicitacao.acoesPermitidas` é uma lista, vale a interseção dela com as seis ações desta feature; se falta, vale a regra local | confiar só na API | backend v1.5.0 em produção não envia o campo; listagens e eventos nunca enviam (Princípio 9, RF-02, RF-03) |
| Regra local | cópia fiel das condições de hoje do detalhe e do quadro | espelhar `AcoesPermitidasSolicitacao.java` do backend | RF-03 pede o resultado de hoje. A única diferença para o backend: localmente "Alterar responsáveis" não aparece em "A Fazer" (ali a ação é "Triar") |
| Movimento do quadro | `acaoDoMovimento(de, para)` em `lib/acoesSolicitacao.ts` devolve a ação; o card só se move se a ação estiver em `acoesPermitidas` | manter `getMoveType` e `canDragCard` no componente | uma regra só para quadro e detalhe (RF-04, RF-05) |
| Soltar em "Cancelada" a partir de "Em Validação" | abre o formulário de cancelamento | manter o de hoje, que abre o de encerramento com "Concluir" pré-marcado | o destino escolhido é "Cancelada"; abrir com "Concluir" marcado induz a erro. Mudança de valor inicial de formulário, não de regra |
| Um componente por ação | pasta `features/solicitacoes/actions/` com `TriarAction`, `EnviarValidacaoAction`, `DevolverAction`, `EncerrarAction`, `CancelarAction`, `ResponsaveisAction` | um componente único com as seis mutations; pasta `components/acoes/` | é o que a issue pede e o que a métrica de sucesso mede. `actions/` não está na lista de exclusões de cobertura, então nasce medida |
| Fluxo comum (executar, anexar foto, erro, fechar) | hook `useExecutarAcao(solicitacaoId, onConcluida)` | repetir `try/catch` em cada ação | o tratamento de erro passa a existir num lugar só; é o ponto que a feature 003 altera |
| Mutations | os hooks por solicitação que o detalhe já usa (`useTriarSolicitacao(id)` etc.) | `useKanbanActions` | invalidam detalhe e listas; `useKanbanActions` só invalidava listas e é removido. `useAlterarResponsaveis` passa a invalidar listas também (RF-07) |
| Histórico depois de anexar foto | `useExecutarAcao` invalida as atividades da solicitação depois do upload | deixar como está | o anexo gera atividade; sem isso o histórico fica defasado (RF-07) |
| Tamanho das telas | extrair do detalhe `SolicitacaoResumo` e `SolicitacaoAcoes`; extrair do quadro a configuração de colunas | dividir por abas ou rotas | menor mudança que cumpre o RNF-01 sem alterar layout |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

> Recusado: registro genérico de ações (mapa de configuração com formulário, mutation e
> evidência por ação). São seis ações com formulários diferentes; um `switch` em
> `AcaoSolicitacaoAtiva` resolve e é legível.

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `app/src/features/solicitacoes/types/solicitacaoTypes.ts` | alterar: campo opcional `acoesPermitidas` | — (só tipos) |
| core/domain | `app/src/features/solicitacoes/lib/acoesSolicitacao.ts` | criar: `acoesPermitidas`, `acaoDoMovimento`, `proximoStatus`, `botoesDeAcao` | `app/src/features/solicitacoes/lib/acoesSolicitacao.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/useAcoesPermitidas.ts` | criar: liga usuário autenticado à regra | `app/src/features/solicitacoes/hooks/useAcoesPermitidas.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/useExecutarAcao.ts` | criar | `app/src/features/solicitacoes/hooks/useExecutarAcao.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/useAlterarResponsaveis.ts` | alterar: invalida listas | `app/src/features/solicitacoes/hooks/solicitacoesHooks.test.ts` (existente) |
| hook | `app/src/features/solicitacoes/hooks/useKanbanActions.ts` e `.test.ts` | remover | — |
| presenters | `app/src/features/solicitacoes/actions/{Triar,EnviarValidacao,Devolver,Encerrar,Cancelar,Responsaveis}Action.tsx` | criar | `.test.tsx` ao lado de cada um |
| presenters | `app/src/features/solicitacoes/actions/AcaoErro.tsx` | criar: mensagem de erro do formulário | coberto pelos testes das ações |
| presenters | `app/src/features/solicitacoes/actions/AcaoSolicitacaoAtiva.tsx` | criar: escolhe o componente da ação | `app/src/features/solicitacoes/actions/AcaoSolicitacaoAtiva.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/SolicitacaoAcoes.tsx` | criar: botões e ação aberta, no detalhe | `app/src/features/solicitacoes/components/SolicitacaoAcoes.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/SolicitacaoResumo.tsx` | criar: bloco de dados do detalhe | `app/src/features/solicitacoes/components/SolicitacaoResumo.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/kanbanColunas.ts` | criar: colunas e cores, saídas do quadro | coberto por `KanbanBoard.test.tsx` |
| presenters | `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar: usa `SolicitacaoResumo` e `SolicitacaoAcoes` | `SolicitacaoDetalhePage.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/KanbanBoard.tsx` | alterar: usa a regra e `AcaoSolicitacaoAtiva` | `KanbanBoard.test.tsx` |
| projeto | `.specify/project.md` | alterar: `features/*/actions` no mapa do Princípio 7 | — |

## Contrato entre camadas

- `acoesPermitidas(solicitacao, { id, perfil })` → `ReadonlySet<AcaoSolicitacao>`.
- `useAcoesPermitidas()` → função `(solicitacao) => ReadonlySet<AcaoSolicitacao>`, já com o
  usuário autenticado; serve ao quadro (vários cards) e ao detalhe.
- Toda ação recebe `{ solicitacao, onClose }`. `onClose` é chamado ao cancelar e ao concluir.
- `useExecutarAcao(solicitacaoId, onConcluida)` → `{ erro, executar(acao, evidencia?) }`.
  Erro da ação fica em `erro` e o formulário não fecha (RF-06). Falha no anexo da foto não
  desfaz a ação, como hoje; a mensagem ao usuário é da feature 003.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Regressão em fluxo de ação ao mover código | média | testes existentes do detalhe e do quadro mantidos; cenários novos da spec |
| Operador que abriu e ainda não foi triado passa a poder arrastar o próprio card para "Cancelada" | baixa (o quadro do operador lista o que está atribuído a ele) | é o que a API permite e o que o detalhe já oferece (RF-05) |
| `actions/` entra na medição de cobertura | certa | teste por ação, com sucesso, erro e foto |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação (1) | Só `make validate`; nenhum alvo novo |
| Arquitetura limpa (2) e mapa do legado (7) | Regra em `lib/`, dados em `hooks/`, tela em `actions/`, `components/` e `pages/`; `actions/` registrada no mapa; o quadro deixa de importar `evidenciasApi` |
| Testes provam a entrega (3, 11) | Teste novo ou alterado com `it('deve ... quando ...')`, Arrange/Act/Assert, consulta por papel e texto |
| Simplicidade defensável (4) | Ver padrões aplicados e recusados |
| Autoria (5) e idioma (6) | Commits só com o autor do git; artefatos em português |
| Linguagem ubíqua (8) | Nomes das ações iguais aos da API (`TRIAR`, `ENVIAR_VALIDACAO`, ...) |
| Compatibilidade com o backend (9) | Campo `acoesPermitidas` é opcional; sem ele vale a regra local |
| Cobertura não regride (10) | Regra em `lib/`; `actions/` medida; nenhuma exclusão acrescentada |
| Uma fonte de especificação (12) | Spec nesta pasta; linha acrescentada em `openspec/README.md` |
