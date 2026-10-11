# Tarefas — Sessão mantida na troca de senha e quadro do operador com o que ele abriu

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova; quando teste e
> implementação estão na mesma tarefa, o teste é escrito primeiro.

> O repositório não tem `app/tests/bdd/` (ver `plan.md`): cada cenário da spec é um teste no
> arquivo indicado, com o nome do cenário.

> Checklists (`checklists/requisitos.md` e `checklists/seguranca.md`) liberados pelo usuário
> em 2026-10-07 ("está tudo ok"), sem revisão item a item.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`.

## Fase 1 — Domínio

- [x] T001 [P] Criar `TST/features/auth/lib/credenciaisDaTroca.test.ts`: devolve o par quando a resposta traz `token` e `refreshToken`; nulo sem `token`; nulo sem `refreshToken`; nulo com texto vazio
- [x] T002 [P] Alterar `SRC/features/auth/types/authTypes.ts` (tipo `SenhaAlteradaResponse`) e criar `SRC/features/auth/lib/credenciaisDaTroca.ts`
- [x] T003 [P] Criar `TST/features/solicitacoes/lib/relacaoDoOperador.test.ts`: atribuída quando é responsável e não abriu; atribuída quando abriu e é responsável; aberta quando abriu e não é responsável; nulo quando não abriu nem é responsável; nulo sem id do usuário; rótulo de cada relação
- [x] T004 [P] Criar `SRC/features/solicitacoes/lib/relacaoDoOperador.ts`

## Fase 2 — Sessão mantida na troca de senha

- [x] T005 Criar `TST/app/providers/AuthProvider.test.tsx`: `renovarCredenciais` grava as duas credenciais; `renovarCredenciais` sobe `versaoDaSessao` em 1; `versaoDaSessao` começa em 0
- [x] T006 Alterar `SRC/app/providers/authContext.ts` e `SRC/app/providers/AuthProvider.tsx`: `renovarCredenciais` e `versaoDaSessao`
- [x] T007 Alterar `SRC/features/auth/api/perfilApi.ts`: `alterarSenha` devolve `SenhaAlteradaResponse`
- [x] T008 Testes em `TST/features/auth/hooks/authHooks.test.ts`: troca com credenciais na resposta chama `renovarCredenciais` com o par; resposta sem credenciais não chama; troca recusada não chama
- [x] T009 Alterar `SRC/features/auth/hooks/useAlterarSenha.ts`
- [x] T010 Testes em `TST/features/auth/pages/PerfilPage.test.tsx`: depois da troca a tela de perfil continua visível com "Senha alterada com sucesso!"; resposta sem credenciais também mostra o sucesso; troca recusada mostra o erro
- [x] T011 Testes em `TST/features/solicitacoes/hooks/useSolicitacaoEvents.test.ts`: quando `versaoDaSessao` muda, a conexão anterior é fechada e outra é aberta com a credencial nova; a ordem "conexão cai, depois versão muda" termina com uma conexão só, a nova; temporizador de reconexão pendente não abre segunda conexão
- [x] T012 Alterar `SRC/features/solicitacoes/hooks/useSolicitacaoEvents.ts`: `versaoDaSessao` nas dependências do efeito
- [x] T013 Teste em `TST/features/solicitacoes/hooks/useSemAtualizacao.test.ts`: conexão que fecha e reabre antes de 10 s não produz aviso (já existia desde a feature 007: "deve não avisar quando a conexão cai e volta antes de 10 segundos"; nenhum teste novo)

## Fase 3 — Quadro do operador

- [x] T014 [P] Testes e alteração de `SRC/shared/components/EmptyState/EmptyState.tsx`: mostra a ação quando recebe `action`; sem `action` não há controle interativo
- [x] T015 [P] Testes e alteração de `SRC/features/solicitacoes/components/KanbanCard.tsx`: mostra "Aberta por você" com relação aberta; mostra "Atribuída a você" com relação atribuída; sem relação não mostra nenhuma das duas
- [x] T016 Testes e alteração de `SRC/features/solicitacoes/components/KanbanColumn.tsx`: repassa ao card a relação devolvida por `relacaoDe`
- [x] T017 Testes em `TST/features/solicitacoes/components/KanbanBoard.test.tsx`: operador sem nenhuma vê "Você ainda não abriu nem recebeu solicitações" e o link "Nova solicitação" para a abertura; não vê o texto antigo; operador com filtro e sem resultado vê "Nenhuma solicitação para este filtro" e "Limpar filtro"; "Limpar filtro" chama `onLimparFiltro`; card aberto pelo operador mostra "Aberta por você"; card atribuído mostra "Atribuída a você"; card aberto e atribuído mostra só "Atribuída a você"; gestor não vê marca; gestor sem solicitações vê as colunas
- [x] T018 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`
- [x] T019 Testes e alteração de `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`: "Limpar filtro" zera modelo e período e o quadro volta a mostrar as solicitações
- [x] T020 [P] Teste em `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts`: abrir solicitação invalida as listas (RF-09)
- [x] T021 [P] Testes em `TST/features/solicitacoes/pages/PessoalTab.test.tsx`: "abertas por mim" lista as solicitações em aberto que o operador abriu, atribuídas ou não; a contagem de concluídas e a de canceladas abertas por ele vêm da consulta por "aberta por mim", sem filtro de responsável

## Fase 4 — Integração e fechamento

- [x] T022 Roteiro de medição com API simulada: trocar a senha, executar 10 ações sem ir à tela de entrada (RNF-01) e medir o tempo até a conexão de tempo real reabrir (RNF-02); registrar o resultado na convergência
- [x] T023 Conferir `openspec/specs/` e acrescentar a linha desta feature à tabela de `openspec/README.md` se algum comportamento descrito lá mudou
- [x] T024 Cobertura por arquivo alterado em 95% ou mais (`make coverage`) e `package.json` sem dependência nova. **Medido só em 3 dos 11 arquivos de produção** (`credenciaisDaTroca.ts`, `relacaoDoOperador.ts` e `EmptyState.tsx`, os três em 100%): os outros 8 são hooks, componentes de feature, páginas, provedor e arquivo de API, que `app/vitest.config.ts` exclui da medição desde antes desta feature. Eles têm teste espelhado, mas sem número de cobertura
- [x] T025 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001, T002, T005, T006, T008, T009 |
| RF-02 | T008, T009, T010 |
| RF-03 | T011, T012, T013 |
| RF-04 | T001, T002, T008, T010 |
| RF-05 | T008, T010 |
| RF-06 | T014, T017, T018 |
| RF-07 | T003, T004, T015, T016, T017, T018 |
| RF-08 | T017, T018 |
| RF-09 | T020 |
| RF-10 | T021 |
| RF-11 | T021 |
| RF-12 | T014, T017, T018, T019 |
| RNF-01 | T010, T022 |
| RNF-02 | T011, T013, T022 |
| RNF-03 | T024 |
| RNF-04 | T024 |
| RNF-05 | nota de publicação no PR (entrega) |
| RNF-06 | T003, T004 |

### Cenários da spec × teste

| Cenário | Tarefa |
|---|---|
| Troca de senha guarda as credenciais novas | T005, T008 |
| Quem troca a senha continua na aplicação | T010, T022 |
| Tempo real volta depois da troca | T011, T013 |
| Backend sem credenciais na resposta | T008, T010 |
| Troca recusada não mexe na sessão | T008, T010 |
| Operador sem nenhuma solicitação | T017 |
| Ação do quadro vazio leva à abertura | T017 |
| Solicitação recém-aberta aparece no quadro | T020 |
| Card de solicitação que abri | T015, T017 |
| Card de solicitação que recebi | T015, T017 |
| Card de solicitação que abri e recebi | T003, T017 |
| Filtro sem resultado para o operador | T017 |
| Limpar o filtro devolve o quadro | T019 |
| Gestor não vê a marca de relação | T017 |
| Aba pessoal conta tudo o que o operador abriu | T021 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-07

Caminhos relativos a `app/src/`; testes em `app/tests/unit/`, no caminho espelhado.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `features/auth/lib/credenciaisDaTroca.ts:8`; `app/providers/AuthProvider.tsx:32` (`renovarCredenciais`); `features/auth/hooks/useAlterarSenha.ts:16`. Teste da página com hook e provedor reais confere as duas credenciais guardadas |
| RF-02 | realizado | teste "deve continuar na rota do perfil quando a troca de senha dá certo" em `PerfilPage.test.tsx`, com rota de entrada montada; medição: 10 de 10 ações sem ir à tela de entrada, 3 rodadas |
| RF-03 | realizado | `features/solicitacoes/hooks/useSolicitacaoEvents.ts:148` (efeito depende de `versaoDaSessao`); 10 testes em "troca de credenciais"; medição: conexão reaberta em 72 a 90 ms |
| RF-04 | realizado | `features/auth/types/authTypes.ts:37` (credenciais opcionais); `credenciaisDaTroca` devolve nulo; teste da página mantém a credencial em uso |
| RF-05 | realizado | `renovarCredenciais` só é chamado no sucesso; testes do hook e da página com a API recusando |
| RF-06 | realizado | `features/solicitacoes/components/KanbanBoard.tsx:111`; `shared/components/EmptyState/EmptyState.tsx:7` (`action`); captura `quadro-vazio-*.png` |
| RF-07 | realizado | `features/solicitacoes/lib/relacaoDoOperador.ts:15`; `KanbanBoard.tsx:37`; `KanbanCard.tsx:167`; captura `quadro-com-marcas-1440.png` com 2 "Aberta por você" e 2 "Atribuída a você" |
| RF-08 | realizado | `KanbanBoard.tsx:37`: a relação só é calculada para operador; teste do gestor |
| RF-09 | realizado | `features/solicitacoes/hooks/useAbrirSolicitacao.ts:12`, sem mudança de código; teste novo monta a consulta do quadro e confere que ela é refeita quando a solicitação é aberta |
| RF-10 | realizado | `features/solicitacoes/pages/PessoalTab.tsx:73`, sem mudança de código; testes novos com solicitações abertas pelo operador e atribuídas a outro |
| RF-11 | realizado | mesma tela, sem mudança de código; teste confere o indicador "Abertas por mim" e que as três consultas não restringem por responsável. O cenário da spec foi corrigido: a tela não exibe a contagem de concluídas, ela a usa no indicador |
| RF-12 | realizado | `KanbanBoard.tsx:98`; `features/solicitacoes/pages/SolicitacoesPage.tsx:122` zera modelo e período; testes para os dois; captura `filtro-sem-resultado-*.png` |
| RNF-01 | realizado | medição com API simulada: 0 idas à tela de entrada em 10 ações, 3 rodadas |
| RNF-02 | realizado | medição: 83, 90 e 72 ms depois da troca, sem aviso de "sem atualização automática"; limite de 3 s |
| RNF-03 | parcial | medido só em 3 dos 13 arquivos de produção alterados (`credenciaisDaTroca.ts`, `relacaoDoOperador.ts`, `EmptyState.tsx`, os três em 100%). Os outros 10 são hooks, componentes de feature, páginas, provedor, tipos e arquivo de API, excluídos da medição por `app/vitest.config.ts` desde antes desta feature |
| RNF-04 | realizado | `app/package.json` e `app/package-lock.json` sem mudança |
| RNF-05 | pendente da entrega | a nota de ordem de publicação entra no PR |
| RNF-06 | realizado | `relacaoDoOperador.ts` é a única definição; o card só recebe o resultado |

Veredito: convergido

Tarefas acrescentadas: nenhuma

- **`make validate`:** verde. Lint com 0 erros e 1 aviso em `NovaSolicitacaoPage.tsx:83`,
  arquivo fora desta feature; 129 arquivos de teste, 1064 testes; cobertura do conjunto
  medido de 99,75% de linha; build ok. O alvo `typecheck` do `make validate` não verifica
  nada (`tsconfig.json` sem arquivos); os tipos foram conferidos à parte com
  `tsc --noEmit -p tsconfig.app.json`, sem erros, e pelo build.
- **Medição** (`/root/rgm/evidencias/009-frontend/`, API simulada que invalida as
  credenciais antigas e derruba o tempo real na troca): antes desta feature, 0 de 10 ações,
  1 ida à tela de entrada e conexão não restabelecida em 20 s, nas 3 rodadas; depois, 10 de
  10, 0 idas e conexão de volta em menos de 100 ms.
- **`/bu:review`:** reprovou a primeira entrega com 10 achados, corrigidos no commit
  `dfb4d4b`. Os principais: o teste de "continua na tela de perfil" passava com qualquer
  implementação e foi refeito com o hook, o provedor e uma rota de entrada reais; o teste de
  RF-09 comparava a chave consigo mesma e passou a exercitar a consulta do quadro; limpar o
  filtro de modelo não tinha teste; a conexão reaberta pela troca não atualizava as
  consultas (evento perdido no intervalo), e o contador de aberturas saiu do efeito. A
  revisão não foi rodada de novo depois das correções; a conferência foi pelos gates e pela
  medição repetida.
- **Excesso, fora do que os requisitos pedem:**
  - O quadro vazio com filtro e o sem filtro ganharam uma frase de descrição, além do
    título pedido.
  - A conexão reaberta pela troca de senha atualiza listas, detalhes e evidências (veio do
    achado 6 da revisão; a spec só pedia reabrir).
- **Desvios do processo:**
  - Sem cenários em `app/tests/bdd` (desvio herdado): cada cenário é um teste de unidade ou
    de componente.
  - Checklists liberados pelo usuário sem revisão item a item.
  - As tarefas `[P]` foram executadas em sequência, sem subagentes.
  - Teste e implementação foram escritos juntos; os testes não foram vistos falhando antes
    do código, com exceção dos que falharam por erro do próprio teste.
  - Parte das edições em arquivos existentes foi feita por script no shell, sem passar pela
    trava de estrutura do plugin; os arquivos novos foram criados pelo caminho normal.
  - Durante a implementação o `vitest` e o `tsc` foram chamados direto para rodar só os
    arquivos alterados; o repositório não tem alvo de `make` para um caminho. O veredito
    final veio de `make validate`.
  - O commit de adequação da especificação 005 está nesta branch.
- **Não verificado:** nada foi exercitado contra o backend real. O comportamento da troca
  de senha e do tempo real foi medido com API e servidor de eventos simulados, escritos a
  partir do contrato do rgm-backend#112. A marca do card não foi medida quanto a contraste.
