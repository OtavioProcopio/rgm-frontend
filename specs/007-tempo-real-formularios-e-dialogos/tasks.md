# Tarefas — Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação

> Ordem de dependência. `[P]` marca tarefa paralelizável. Teste vem antes da implementação
> que ele prova; quando teste e implementação estão na mesma tarefa, o teste é escrito
> primeiro. Dentro de cada parte, regra pura antes de hook e de componente.

> O repositório não tem `app/tests/bdd/` (ver `plan.md`): cada cenário da spec é um teste no
> arquivo indicado, com o nome do cenário.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo testado tem em `app/src` (Princípio 7, versão 2.0.0). Onde uma tarefa diz "testes e alteração de `SRC/x/Y.tsx`", o teste é `TST/x/Y.test.tsx`.

## Parte 1 — Tempo real

- [x] T001 Criar `TST/features/solicitacoes/lib/reconexao.test.ts`: espera de cada tentativa (3, 6, 12, 24, 30, 30 s); sessão expirada para 400, 401 e 403; falha de rede e 5xx não são sessão expirada
- [x] T002 Criar `SRC/features/solicitacoes/lib/reconexao.ts`
- [x] T003 Testes em `TST/features/solicitacoes/hooks/useSolicitacaoEvents.test.ts`: primeira abertura não atualiza nada; segunda abertura atualiza listas, detalhes, históricos e evidências; falha de rede na renovação agenda nova tentativa; espera cresce e volta ao início após sucesso; sessão expirada não agenda; estado da conexão publicado ao abrir e ao cair
- [x] T004 Alterar `SRC/features/solicitacoes/hooks/solicitacoesKeys.ts` (chave `conexao()`) e `SRC/features/solicitacoes/hooks/useSolicitacaoEvents.ts`
- [x] T005 Criar `TST/features/solicitacoes/hooks/useSemAtualizacao.test.ts`: falso com conexão aberta; falso com menos de 10 s de queda; verdadeiro depois de 10 s; volta a falso quando a conexão abre
- [x] T006 Criar `SRC/features/solicitacoes/hooks/useSemAtualizacao.ts`
- [x] T007 Criar `TST/features/solicitacoes/components/AvisoSemAtualizacao.test.tsx`: mostra o texto quando sem atualização; região de status vazia quando há conexão; o foco não muda quando o aviso aparece
- [x] T008 Criar `SRC/features/solicitacoes/components/AvisoSemAtualizacao.tsx`
- [x] T009 Alterar `SRC/app/layouts/AppLayout.tsx` (abre a conexão e mostra o aviso) e retirar a abertura da conexão de `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`, `DashboardPage.tsx` e `SolicitacaoDetalhePage.tsx`, ajustando os testes dessas páginas

## Parte 2 — Limites e senha

- [x] T010 [P] Criar `TST/shared/lib/limites.test.ts` e `SRC/shared/lib/limites.ts`: constantes, mensagem de limite e `caracteresRestantes` (nulo abaixo de 90%; fronteira em 229 e 230 de 255)
- [x] T011 [P] Criar `TST/shared/lib/senha.test.ts` e `SRC/shared/lib/senha.ts`: 7 caracteres recusa, 8 aceita, mensagem única
- [x] T012 Testes e alteração de `SRC/features/solicitacoes/schemas/solicitacaoSchema.ts`: título 255 aceita e 256 recusa; descrição 2.000 e 2.001; código pretendido 50; máquina pretendida 100; comentário, motivo e comentário final 2.000; `editarSolicitacaoSchema`
- [x] T013 [P] Testes e alteração de `SRC/features/admin/modelos/schemas/modeloSchema.ts` (código 100, descrição 255, máquina 255, observações 2.000) e `SRC/features/admin/maquinas/schemas/maquinaSchema.ts` (nome 255)
- [x] T014 [P] Testes e alteração de `SRC/features/admin/usuarios/schemas/usuarioSchema.ts` (nome 255, e-mail 255, senha pela regra única) e `SRC/features/auth/schemas/perfilSchema.ts` (senha pela regra única)
- [x] T015 Testes e alteração de `SRC/shared/components/Input/Input.tsx` e `SRC/shared/components/Textarea/Textarea.tsx`: contador aparece a partir de 90% do `maxLength`, some abaixo disso, não existe sem `maxLength`, e é associado ao campo
- [x] T016 Passar `maxLength` com a constante nos campos de texto de `SRC/features/solicitacoes/pages/NovaSolicitacaoPage.tsx`, `SRC/features/solicitacoes/components/ComentarioForm.tsx`, `TriagemModal.tsx`, `DevolucaoModal.tsx`, `EncerramentoModal.tsx`, `EnviarValidacaoModal.tsx`, `SRC/features/admin/modelos/components/ModeloForm.tsx`, `SRC/features/admin/maquinas/components/MaquinaForm.tsx` e `SRC/features/admin/usuarios/components/UsuarioForm.tsx`, com um teste por formulário provando o limite no campo
- [x] T017 Teste e alteração de `SRC/features/admin/usuarios/pages/EditarUsuarioPage.tsx`: redefinição recusa 7 caracteres com a mensagem única

## Parte 3 — Diálogo

- [x] T018 Testes em `TST/shared/components/Dialog/Dialog.test.tsx`: bloqueado ignora Esc; bloqueado ignora clique fora; controle dentro de elemento oculto fica fora do ciclo de Tab
- [x] T019 Alterar `SRC/shared/components/Dialog/Dialog.tsx`: `bloqueado`, controles ocultos, fundo opaco
- [x] T020 Testes em `TST/shared/components/ConfirmDialog/ConfirmDialog.test.tsx`: é diálogo modal com o título como nome; foco inicial em "Cancelar"; Enter ao abrir não confirma; Esc cancela; durante o envio Esc não fecha; `cancelLabel`
- [x] T021 Alterar `SRC/shared/components/ConfirmDialog/ConfirmDialog.tsx`
- [x] T022 Criar `TST/features/solicitacoes/actions/DialogoDaAcao.test.tsx`: nome com a ação e a solicitação; Esc sem nada preenchido fecha; Esc com algo preenchido pergunta; "Continuar editando" mantém o texto; "Descartar" fecha; "Cancelar" do formulário com algo preenchido pergunta; durante o envio Esc e clique fora não fecham; falha no envio mantém o diálogo, o erro e o texto; ação concluída fecha sem perguntar
- [x] T023 Alterar `SRC/features/solicitacoes/types/acaoProps.ts` (`onCancelar`) e criar `SRC/features/solicitacoes/actions/DialogoDaAcao.tsx`
- [x] T024 Alterar `SRC/features/solicitacoes/actions/AcaoSolicitacaoAtiva.tsx`, `TriarAction.tsx`, `ResponsaveisAction.tsx`, `EnviarValidacaoAction.tsx`, `DevolverAction.tsx`, `EncerrarAction.tsx` e `CancelarAction.tsx`: desistir chama `onCancelar`; ajustar o teste de cada um em `TST`
- [x] T025 Testes e alteração de `SRC/features/solicitacoes/components/KanbanBoard.tsx`: usa `DialogoDaAcao`
- [x] T026 Testes e alteração de `SRC/features/solicitacoes/components/SolicitacaoAcoes.tsx`: a ação do detalhe abre em diálogo modal com o mesmo nome do quadro; Esc fecha e o foco volta ao botão
- [x] T027 [P] Testes e alteração de `SRC/features/admin/usuarios/pages/UsuariosPage.tsx` e `SRC/features/admin/usuarios/components/DeleteUsuarioDialog.tsx`: desativar e excluir abrem como diálogo modal; foco inicial em desistir
- [x] T028 [P] Testes e alteração de `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx` e `SRC/features/admin/modelos/components/GaleriaCarousel.tsx`: desativar, ativar e remover foto abrem como diálogo modal; Esc na confirmação da galeria não fecha a galeria

## Parte 4 — Confirmações

- [x] T029 Testes e alteração de `SRC/features/evidencias/components/EvidenciaList.tsx`: excluir pede confirmação citando o arquivo; confirmar exclui; desistir mantém
- [x] T030 Testes e alteração de `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx`: campos da edição com `maxLength`; edição validada pelo esquema; cancelar com alteração pergunta; confirmar descarta; cancelar sem alteração fecha direto

## Parte 5 — Toque e foco

- [x] T031 Alterar a área de toque em `SRC/features/solicitacoes/pages/DashboardPage.tsx`, `SRC/features/solicitacoes/components/HistoricoChart.tsx`, `SRC/features/modelos/components/ModeloCard.tsx`, `SRC/features/admin/usuarios/components/UsuariosFilters.tsx`, `SRC/features/admin/usuarios/components/UsuarioForm.tsx`, `SRC/features/admin/usuarios/pages/EditarUsuarioPage.tsx`, `SRC/features/admin/modelos/components/ModeloActionsMenu.tsx`, `SRC/features/admin/modelos/pages/NovoModeloPage.tsx`, `SRC/features/admin/modelos/pages/EditarModeloPage.tsx`, `SRC/features/solicitacoes/components/TriagemModal.tsx` e `SRC/features/solicitacoes/components/AlterarResponsaveisModal.tsx`
- [x] T032 Testes e alteração de `SRC/features/auth/pages/PerfilPage.tsx` e `SRC/shared/components/Combobox/Combobox.tsx`: botões só de ícone com nome acessível e área de toque
- [x] T033 Medir RNF-06 (área de toque) e RNF-07 (contraste do foco) em todas as telas de RF-25, corrigir o que a medição ainda apontar e registrar na convergência

## Integração

- [x] T034 Medir RNF-01 com a aplicação rodando contra API simulada: derrubar a conexão, mudar uma solicitação, restabelecer e cronometrar até a tela refletir
- [x] T035 Capturas de tela antes e depois: aviso no cabeçalho, contador de caracteres, confirmação de evidência, ação do detalhe em diálogo e as quatro confirmações de administração (1440 px e 390 px, claro e escuro)
- [x] T036 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01, RF-02 | T003, T004 |
| RF-03, RF-04, RF-05 | T001, T002, T003, T004 |
| RF-06, RF-07 | T005, T006, T007, T008, T009 |
| RF-08 | T007, T008 |
| RF-09, RF-10 | T010, T012, T013, T014 |
| RF-11 | T016, T030 |
| RF-12 | T010, T015 |
| RF-13 | T011, T014, T017 |
| RF-14, RF-15 | T029 |
| RF-16, RF-17 | T030 |
| RF-18 | T022, T023, T024 |
| RF-19 | T022, T023, T025, T026 |
| RF-20 | T020, T021, T027, T028 |
| RF-21, RF-22 | T020, T021, T027 |
| RF-23 | T018, T019, T020, T022 |
| RF-24 | T022, T023 |
| RF-25 | T031, T032, T033 |
| RF-26 | T033 |
| RF-27 | T032 |
| RNF-01 | T034 |
| RNF-02 | T001, T003 |
| RNF-03 | T010, T012, T013, T014, T016, T036 |
| RNF-04 | T011, T014, T017 |
| RNF-05 | T001, T010, T011, T036 |
| RNF-06, RNF-07 | T033 |
| RNF-08 | T036 |
| RNF-09 | T003, T004 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-10-06

Medições feitas com a aplicação rodando contra API simulada e um servidor de eventos simulado
(scripts e saídas em `/root/rgm/evidencias/007-frontend/`), sem backend real.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `hooks/useSolicitacaoEvents.ts:47-56` (listas, detalhes e evidências na reabertura); medição de RNF-01 |
| RF-02 | realizado | `useSolicitacaoEvents.ts:51`; teste "primeira abertura não atualiza nada" |
| RF-03 | realizado | `useSolicitacaoEvents.ts:117-122`; `lib/reconexao.ts:20-22` |
| RF-04 | realizado | `lib/reconexao.ts:10-13`; `useSolicitacaoEvents.ts:49` zera as tentativas ao abrir; medido: tentativas em 3 s, 6 s e 12 s depois da queda |
| RF-05 | realizado | `useSolicitacaoEvents.ts:120` |
| RF-06 | realizado | `hooks/useSemAtualizacao.ts:8`; `app/layouts/AppLayout.tsx:31,129`; medido: aviso 10,4 a 10,5 s depois da queda |
| RF-07 | realizado | `useSemAtualizacao.ts`; medido: aviso ausente depois de a conexão voltar, nas 3 rodadas |
| RF-08 | realizado | `components/AvisoSemAtualizacao.tsx` (`role="status"` sempre montado); teste de foco |
| RF-09 | realizado | `shared/lib/limites.ts:2-16`; esquemas de solicitação, modelo, máquina e usuário usam `.max(LIMITES.*)` |
| RF-10 | realizado | `limites.ts:5,7`; `schemas/solicitacaoSchema.ts` (`textoLongo`, `comentarioValidacao`) |
| RF-11 | realizado | `maxLength={LIMITES.*}` nos nove formulários e na edição do detalhe (`SolicitacaoDetalhePage.tsx:208,224`); um teste por formulário |
| RF-12 | realizado | `limites.ts:26-32`; `Input.tsx:28-31,72`; `Textarea.tsx` (mesma lógica) |
| RF-13 | realizado | `shared/lib/senha.ts`; `usuarioSchema.ts`, `perfilSchema.ts`, `EditarUsuarioPage.tsx` (`erroDaSenha`) |
| RF-14 | realizado | `evidencias/components/EvidenciaList.tsx:43-55` |
| RF-15 | realizado | `EvidenciaList.tsx:49`; teste "deve manter a evidência…" |
| RF-16 | realizado | `SolicitacaoDetalhePage.tsx:130-135,234-244` |
| RF-17 | realizado | `SolicitacaoDetalhePage.tsx:134` |
| RF-18 | realizado | `actions/DialogoDaAcao.tsx:30-37,47,51`; `types/acaoProps.ts` (`onCancelar`) |
| RF-19 | realizado | `components/SolicitacaoAcoes.tsx` e `KanbanBoard.tsx` usam `DialogoDaAcao`; nome em `DialogoDaAcao.tsx:46` |
| RF-20 | realizado | `shared/components/ConfirmDialog/ConfirmDialog.tsx:49`; `UsuariosPage.tsx`, `DeleteUsuarioDialog.tsx`, `ModeloDetalhePage.tsx`, `GaleriaCarousel.tsx` |
| RF-21 | realizado | `ConfirmDialog.tsx:54-56` (desistir é o primeiro controle); `Dialog.tsx` foca o primeiro |
| RF-22 | realizado | teste "deve desistir em vez de confirmar quando Enter é apertado logo ao abrir" |
| RF-23 | realizado | `Dialog.tsx:47,73`; `DialogoDaAcao.tsx:25,48`; `ConfirmDialog.tsx:49` |
| RF-24 | realizado | cenário da spec (diálogo de devolução): teste "deve continuar aberto com o erro e o que foi preenchido quando o envio falha" |
| RF-25 | realizado | medição de RNF-06 |
| RF-26 | realizado | `styles/globals.css:64-84`; medição de RNF-07 |
| RF-27 | realizado | `auth/pages/PerfilPage.tsx` (três botões de olho), `Combobox.tsx`; medido: 0 botões sem nome em 16 telas |
| RNF-01 | realizado | 209 ms, 265 ms e 302 ms entre a conexão voltar e a tela mostrar o título alterado durante a queda (3 rodadas) |
| RNF-02 | realizado | `reconexao.ts:3-4` (3 s a 30 s); teste de sessão expirada não agenda tentativa |
| RNF-03 | realizado | busca por `.max(<número>` e `maxLength=<número>` em `app/src` fora de `limites.ts`: 0 ocorrências |
| RNF-04 | realizado | busca por `min(6`, `min(8`, `length < 6` em `app/src`: 0 ocorrências fora de `senha.ts` |
| RNF-05 | realizado | `reconexao.ts`, `limites.ts` e `senha.ts` com 100% de linha no relatório de cobertura |
| RNF-06 | realizado | 0 de 261 controles abaixo de 44 px em 16 telas, em 390 px com ponteiro de toque (caixa de seleção medida pelo rótulo); antes: 33 |
| RNF-07 | realizado | 0 de 249 controles com contraste abaixo de 3:1 em cada tema; menor valor medido 4,94:1 |
| RNF-08 | realizado | `package.json` e `package-lock.json` sem alteração desde `4a29131` |
| RNF-09 | realizado | nenhuma chamada nova à API; a reconexão usa só a abertura da conexão do navegador |

`make validate`: verde. Lint com 0 erros e 1 aviso que já existia (`NovaSolicitacaoPage.tsx`,
`react-hooks/incompatible-library`); 126 arquivos e 985 testes passando; cobertura de 99,77%
de instruções, 99,47% de ramos, 100% de funções e 99,74% de linhas; build concluído.

Cenários de aceite: os 39 têm teste de módulo ou de componente, exceto os de layout (área de
toque em px, contraste do foco) e o de tempo até a tela refletir, provados por medição.

Capturas (T035): 32 de depois (8 estados em 1440 px e 390 px, claro e escuro) e 20 de antes
(os 5 estados que já existiam em `4a29131`), em `/root/rgm/evidencias/007-frontend/capturas/`.

Desvios e excesso:

- `ModeloForm.tsx`: o campo "Observações" trocou o `textarea` próprio pelo `Textarea`
  compartilhado, para ganhar limite, contador e mensagem de erro. Muda a aparência do campo;
  a spec deixa fora de escopo mudar o conteúdo dos formulários de administração.
- `limites.ts` ganhou `mensagemDeRestantes` (singular e plural do contador), que o plano não
  listava.
- `ConfirmDialog` passou a aceitar `message` com marcação, para o `DeleteUsuarioDialog`
  manter o nome em negrito; durante a exclusão o botão mostra "Aguarde..." em vez de
  "Excluindo...".
- `PerfilPage.tsx`: o texto de exemplo do campo dizia "Mínimo de 6 caracteres"; passou a usar
  a constante.
- Arquivos alterados que o plano não listava, para RNF-06 e RNF-07 fecharem em zero:
  `globals.css` (contorno de foco em `select`, caixa de seleção e botão de opção; cor por
  `--foco`), `LoginPage.tsx` (cor do contorno no cartão branco com tema escuro) e opções do
  `Combobox`.
- Confirmações de administração (desativar usuário, excluir usuário, desativar e ativar
  modelo): quando o envio falha, a confirmação fecha e o erro aparece na página, como já era.
  O cenário de RF-24 cobre o diálogo de ação; não foi alterado aqui.
- `DialogoDaAcao`: depois de uma ação feita com foto não enviada, Esc no aviso ainda pergunta
  se descarta, porque o formulário foi marcado como alterado. O envio da foto depois da ação
  não conta como envio em andamento para o bloqueio do diálogo.
- Achado fora da feature: `make typecheck` roda `tsc --noEmit` sobre um `tsconfig.json` sem
  arquivos e não verifica nada; os tipos só são checados no `tsc -b` do build. Nesta rodada
  a verificação foi feita com `tsc --noEmit -p tsconfig.app.json`.

Veredito: convergido
Tarefas acrescentadas: nenhuma
