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

- [ ] T014 [P] Testes e alteração de `SRC/shared/components/EmptyState/EmptyState.tsx`: mostra a ação quando recebe `action`; sem `action` não há controle interativo
- [ ] T015 [P] Testes e alteração de `SRC/features/solicitacoes/components/KanbanCard.tsx`: mostra "Aberta por você" com relação aberta; mostra "Atribuída a você" com relação atribuída; sem relação não mostra nenhuma das duas
- [ ] T016 Testes e alteração de `SRC/features/solicitacoes/components/KanbanColumn.tsx`: repassa ao card a relação devolvida por `relacaoDe`
- [ ] T017 Testes em `TST/features/solicitacoes/components/KanbanBoard.test.tsx`: operador sem nenhuma vê "Você ainda não abriu nem recebeu solicitações" e o link "Nova solicitação" para a abertura; não vê o texto antigo; operador com filtro e sem resultado vê "Nenhuma solicitação para este filtro" e "Limpar filtro"; "Limpar filtro" chama `onLimparFiltro`; card aberto pelo operador mostra "Aberta por você"; card atribuído mostra "Atribuída a você"; card aberto e atribuído mostra só "Atribuída a você"; gestor não vê marca; gestor sem solicitações vê as colunas
- [ ] T018 Alterar `SRC/features/solicitacoes/components/KanbanBoard.tsx`
- [ ] T019 Testes e alteração de `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`: "Limpar filtro" zera modelo e período e o quadro volta a mostrar as solicitações
- [ ] T020 [P] Teste em `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts`: abrir solicitação invalida as listas (RF-09)
- [ ] T021 [P] Testes em `TST/features/solicitacoes/pages/PessoalTab.test.tsx`: "abertas por mim" lista as solicitações em aberto que o operador abriu, atribuídas ou não; a contagem de concluídas e a de canceladas abertas por ele vêm da consulta por "aberta por mim", sem filtro de responsável

## Fase 4 — Integração e fechamento

- [ ] T022 Roteiro de medição com API simulada: trocar a senha, executar 10 ações sem ir à tela de entrada (RNF-01) e medir o tempo até a conexão de tempo real reabrir (RNF-02); registrar o resultado na convergência
- [ ] T023 Conferir `openspec/specs/` e acrescentar a linha desta feature à tabela de `openspec/README.md` se algum comportamento descrito lá mudou
- [ ] T024 Cobertura por arquivo alterado em 95% ou mais (`make coverage`) e `package.json` sem dependência nova
- [ ] T025 `make validate` verde

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
