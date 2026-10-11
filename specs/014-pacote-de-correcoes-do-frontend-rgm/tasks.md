# Tarefas — Pacote de correções do frontend (#153, #146, #139, #141 e #138)

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova. Caminhos relativos ao
> repositório `rgm-frontend`; o código fica sob `app/`.
>
> O frontend valida cenários de aceite com Vitest (unidade) e Playwright (`app/tests/e2e`),
> não há `app/tests/bdd` neste repositório (desvio herdado das specs anteriores).

## Fase 0 — Já feito antes do plano (registro)

- [x] T001 RF-01: teste e correção do perfil do operador em
  `app/tests/unit/features/auth/pages/PerfilPage.test.tsx` e
  `app/src/features/auth/pages/PerfilPage.tsx` (commit `fix(perfil)`, PR #154; feito
  **antes** da spec; a convergência o confronta)

## Fase 1 — Compartilhado

- [x] T002 [P] Teste do mapeador em `app/tests/unit/shared/lib/mensagensDaApi.test.ts`:
  401, 403, 409, "Senha deve ter no minimo 8 caracteres", erro desconhecido devolve `null`,
  entrada que não é `ApiError` devolve `null`
- [x] T003 [P] Teste do `Select` em `app/tests/unit/shared/components/Select/Select.test.tsx`:
  com `limpavel`, `userEvent.selectOptions` volta ao valor vazio; sem `limpavel`, a opção de
  apoio continua desabilitada
- [x] T004 [P] Teste do `ErrorState` em
  `app/tests/unit/shared/components/ErrorState/ErrorState.test.tsx`: renderiza `action` quando
  recebe
- [x] T005 Implementar `app/src/shared/lib/mensagensDaApi.ts`
- [x] T006 Implementar `limpavel` em `app/src/shared/components/Select/Select.tsx`
- [x] T007 Implementar `action` em `app/src/shared/components/ErrorState/ErrorState.tsx`

## Fase 2 — Telas

- [x] T008 [P] Teste em
  `app/tests/unit/features/solicitacoes/components/SolicitacaoFilters.test.tsx`: cada um dos
  cinco filtros volta a "Todos" com `userEvent`
- [x] T009 [P] Teste em
  `app/tests/unit/features/admin/modelos/components/ModelosFilters.test.tsx`: máquina e status
  voltam a "Todas"/"Todos"
- [x] T010 [P] Teste em `app/tests/unit/features/solicitacoes/lib/solicitacaoMessages.test.ts`:
  403 devolve "Você não tem acesso a esta solicitação."; sem mapeamento, mantém a mensagem
- [x] T011 [P] Teste em `app/tests/unit/features/admin/usuarios/lib/usuarioMessages.test.ts`:
  ramo padrão usa o mapeador
- [x] T012 Implementar `limpavel` em
  `app/src/features/solicitacoes/components/SolicitacaoFilters.tsx` e
  `app/src/features/admin/modelos/components/ModelosFilters.tsx`
- [x] T013 Implementar o uso do mapeador em
  `app/src/features/solicitacoes/lib/solicitacaoMessages.ts`,
  `app/src/features/admin/usuarios/lib/usuarioMessages.ts` e na falha de senha de
  `app/src/features/auth/pages/PerfilPage.tsx`
- [x] T014 Teste em
  `app/tests/unit/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx`: 403 mostra a
  mensagem própria e o link "Voltar ao quadro" (RF-04)
- [x] T015 Implementar a ação de voltar em
  `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx`
- [x] T016 Teste do hook em
  `app/tests/unit/features/solicitacoes/hooks/useTemSolicitacaoDoOperador.test.ts`: `size=1`,
  desabilitado quando `enabled` é falso
- [x] T017 Implementar `app/src/features/solicitacoes/hooks/useTemSolicitacaoDoOperador.ts`
- [x] T018 Teste em `app/tests/unit/features/solicitacoes/components/KanbanBoard.test.tsx`:
  operador com encerradas só fora do recorte não vê o convite; sem nenhuma, vê; com a
  consulta falhando, não afirma que nunca teve (decisão do revisor sobre a lacuna)
- [x] T019 Implementar o vazio em `app/src/features/solicitacoes/components/KanbanBoard.tsx`

## Fase 3 — Integração e e2e

- [x] T020 Reescrever em `app/tests/e2e/evidencias.spec.ts` o cenário do operador sem
  relação (403) e acrescentar o do autor de solicitação encerrada (RF-07)
- [x] T021 `openspec/README.md`: linha da spec 014 (Princípio 12)
- [x] T022 `make cover-arquivos` com os arquivos tocados (≥ 95% por arquivo)
- [x] T023 e2e inteiro contra o backend de `develop`: `make` do Playwright (RF-08)
- [x] T025 (acrescentada na implementação) `app/tests/e2e/admin.spec.ts`: o cenário "API de
  métricas Prometheus está acessível" esperava 200 anônimo, o que a `rgm-backend#122` fechou;
  passa a provar 401 sem credencial e 200 com `MONITORAMENTO_COLETA_*` (pulado se ausentes).
  Achado na rodada e2e inteira (54 de 55); necessário para o RF-08
- [x] T026 (acrescentada na implementação) cobertura de `KanbanBoard.tsx` de 89% para ≥ 95%
  (arrastar, avançar, fim do arrasto, destino inválido e aba do celular): o arquivo foi tocado
  (Princípio 10); testes de caracterização em `KanbanBoard.test.tsx`
- [x] T024 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001 |
| RF-02 | T003, T006, T008, T009, T012 |
| RF-03 | T003, T006 |
| RF-04 | T004, T007, T010, T013, T014, T015 |
| RF-05 | T002, T005, T010, T011, T013 |
| RF-06 | T016, T017, T018, T019 |
| RF-07 | T020 |
| RF-08 | T023 |
| RNF-01 | T022 |
| RNF-02 | T001, T013 |
| RNF-03 | T024 |
| RNF-04 | T016, T017 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-10

Confronto do código entregue com `spec.md` (RF-01 a RF-08, RNF-01 a RNF-04).

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 perfil sem indicadores agregados | realizado | `PerfilPage.tsx` (`useMetricas({ enabled })`, seção só para gestor e administrador); 4 testes novos em `PerfilPage.test.tsx`. **Codificado antes da spec** (PR #154); a spec o absorveu |
| RF-02 voltar a "Todos" | realizado | `Select.tsx` (`limpavel`), `SolicitacaoFilters.tsx`, `ModelosFilters.tsx`; testes com `userEvent.selectOptions` para cada filtro; o combo de modelo já limpava por "Limpar seleção" |
| RF-03 campo obrigatório sem opção vazia | realizado | `limpavel` desligado por padrão; teste existente `placeholder disabled` mantido; `ModeloForm` e demais formulários intocados |
| RF-04 acesso negado ao detalhe | realizado | `SolicitacaoDetalhePage.tsx` ("Voltar ao quadro" em `/app/solicitacoes`); `mensagemDaApi` troca o texto cru do backend; e2e contra backend real mostra a mensagem e o link |
| RF-05 mensagens de senha, acesso, sessão e conflito | realizado | `mensagensDaApi.ts` (texto conhecido + 401), usado em `solicitacaoMessages.ts`, `usuarioMessages.ts` e `PerfilPage.tsx` |
| RF-06 quadro vazio do operador | realizado | `useTemSolicitacaoDoOperador.ts` (`size=1`, só com quadro vazio) e `KanbanBoard.tsx`: com encerradas fora do recorte ou com a consulta falhando mostra colunas vazias com "Últimos 30 dias"; sem nenhuma, o convite |
| RF-07 e2e de evidências | realizado | `evidencias.spec.ts`: 5 de 5 passam; dois cenários novos (sem relação, autor de encerrada) |
| RF-08 suíte e2e inteira | realizado | 56 de 56 contra o backend de `develop` com `MONITORAMENTO_COLETA_*` definidos (sem elas, 55 passam e 1 é pulado); antes da T025: 54 de 55 |
| RNF-01 cobertura por arquivo ≥ 95% | realizado | `make cover-arquivos` sem erro; `KanbanBoard.tsx` 89% → 100% linhas, ramos ≥ 95% (T026) |
| RNF-02 compatibilidade com backend v1.5.0 | realizado por construção | o perfil do operador deixou de chamar; nenhuma chamada nova com contrato novo |
| RNF-03 `make validate` | realizado | 194 arquivos, 3094 testes, 0 falhas, 0 erros de lint e de tipos, build ok |
| RNF-04 no máximo 1 requisição extra | realizado | hook com `enabled` só para operador, sem filtro, quadro vazio; teste de `enabled` por caso |

**Achados da convergência (incorporados):**
- T025: um segundo e2e (`admin.spec.ts`, Prometheus anônimo) descrevia a regra antiga fechada pela
  `rgm-backend#122`; reescrito.
- T026: `KanbanBoard.tsx` estava em 89% e foi tocado; testes de caracterização acrescentados.
- Um teste existente de `solicitacaoMessages.test.ts` trocou o status do caso "mantém o texto da
  ApiError" de 403 para 422, porque 403 agora tem mapeamento; a intenção do teste foi mantida.
- O subagente da T014 reportou 2 testes "antigos" falhando como não relacionados; eram regressão
  da T010 (mapeamento por status largo demais, que trocava 409 de duplicidade e 403 de ação por
  texto genérico). Corrigido na origem: o mapeador só troca **texto conhecido** do backend, mais
  o 401.

**Excesso de escopo:** nenhum. `SeletorDeModelo` não foi tocado. Alterações fora da lista do
plano: `admin.spec.ts` (T025) e `KanbanBoard.test.tsx` (T026), ambas registradas acima.

**Desvios de processo (para o revisor):** o RF-01 foi codificado antes da spec; usei `sed -i` e
Python para editar arquivos em três pontos (um import de teste, a reordenação de trechos do
`spec.md`, ajustes de testes), contra a regra de só Write/Edit. Nenhum afeta comportamento.

Veredito: **convergido**
Tarefas acrescentadas: T025, T026

### Rodada 2 — 2026-10-10

Depois do `/bu:review` (duas passagens, REPROVADO nas duas), corrigido e verificado:

- **Teste sempre-verde apagado** (`Select`: "não repassa `limpavel` ao DOM"; o React descarta o
  atributo de qualquer forma) e **precedência de frase sobre status** passou a usar o status 401
  (mutação: inverter a ordem faz o teste falhar).
- **Ramo sem teste** em `PerfilPage` (400/422 desconhecidos) coberto; a frase conhecida agora vale
  também para 422.
- **403 do detalhe** passa a ser acesso negado por status (`getMensagemDoDetalhe`), qualquer que
  seja o texto do backend; o plano foi atualizado, com o motivo do desvio da primeira versão.
- **Guarda `!isLoading`** da consulta extra do quadro (RNF-04) sem teste: teste acrescentado;
  mutação (remover a guarda) faz só ele falhar; arquivo restaurado e conferido com `cmp`.
- **Padrão de teste:** nomes `deve ... quando ...`, blocos Arrange/Act/Assert, e2e do Prometheus
  em dois testes, comentário solto removido, `ErrorState` verifica a ausência do wrapper.

Medição final: `make validate` EXIT=0, 194 arquivos, **3101 testes**, 0 falhas, 0 erros de lint e
de tipos (1 warning antigo em `NovaSolicitacaoPage.tsx`), build ok; e2e 56 de 56 (rodada
anterior) e `admin.spec.ts` + `evidencias.spec.ts` 15 de 15 depois das últimas edições.

**Mantido como dívida (aceito, a confirmar pelo usuário):** o `prettier` reformatou linhas
antigas e sem relação em `Select.test.tsx`, `usuarioMessages.test.ts`, `admin.spec.ts` e
`evidencias.spec.ts`. É só formatação; entra de qualquer forma na #151 e não vale reverter à mão.
O número "3094" da Rodada 1 foi a medição daquele momento; vale o de 3101.

Veredito: **convergido**; `/bu:review` ainda aponta apenas o ruído de formatação, aceito acima.
Tarefas acrescentadas: nenhuma.
