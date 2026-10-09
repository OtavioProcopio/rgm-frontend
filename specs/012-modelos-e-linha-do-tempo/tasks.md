# Tarefas — Modelos e linha do tempo: ficha do modelo com foto em destaque e histórico da solicitação em linha do tempo

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova: a tarefa de teste é
> escrita, rodada e vista falhar pelo motivo certo antes da tarefa de implementação.

> O repositório não tem `app/tests/bdd/`: pela decisão do usuário de 2026-10-07 (spec 010),
> cada cenário da spec é um teste no arquivo indicado, com o nome do cenário. A tabela
> **Cenários da spec × teste**, no fim, faz a correspondência.

> Checklists `checklists/requisitos.md` (23 itens) e `checklists/acessibilidade.md` (15
> itens): o usuário os viu em 2026-10-08 e respondeu "vamos implementar"; as lacunas viraram
> requisitos e **as caixas seguem sem marca** (ver o estado da revisão em cada arquivo).

> Regras de execução desta feature (memória do projeto): todo arquivo é criado e editado com
> Write e Edit (nunca script no shell); toda ferramenta roda por `make`; `make fmt` e
> `make lint` sempre com `CAMINHO=`; cada par de teste e implementação de uma fase `[P]` vai
> para um subagente `bu:developer`; o teste é visto falhar antes de implementar.

Prefixos: `SRC` = `app/src`; `TST` = `app/tests/unit`, com o mesmo caminho que o arquivo
testado tem em `app/src`. Toda ferramenta roda por `make`, na raiz do repositório.

## Fase 0 — Linha de base

- [x] T001 Roteiro de medição em `/root/rgm/evidencias/012-frontend/medir012.cjs` (backend real local e Vite): em 1440 × 900 e 390 × 844, grava a largura da foto de capa na ficha do modelo e o vazio ao lado (RNF-01), o que aparece acima da primeira dobra (RNF-02), os botões do cabeçalho da ficha e do detalhe da solicitação (RNF-03), a ordem dos eventos do histórico (RNF-12), a largura da coluna de texto do histórico (RNF-04) e as moldura (RNF-07); roda em `946342a` (worktree com `node_modules` por link e `dist` próprio servido com proxy para o backend) e guarda o resultado "antes"

## Fase 1 — Domínio (regras puras)

- [x] T002 [P] Criar `TST/shared/lib/data.test.ts`: `tempoRelativo` ("agora" abaixo de 1 min, "há N min", "há N h", "há N d") com o relógio recebido; `formatarDataHora` sem segundos, em pt-BR; `rotuloDoDia` devolve "Hoje", "Ontem" e a data nos demais dias, na fronteira da meia-noite e no fuso do navegador
- [x] T003 [P] Criar `SRC/shared/lib/data.ts`
- [x] T004 [P] Criar `TST/shared/lib/duracao.test.ts`: `formatarDuracao` (milissegundos) dá minutos abaixo de 1 h, horas abaixo de 48 h e dias depois; mínimo de 1 min; mesmos casos do teste atual de `prazoSolicitacao`
- [x] T005 [P] Criar `SRC/shared/lib/duracao.ts` (recebe `formatarDuracao`, sem mudar o comportamento)
- [x] T006 [P] Alterar `TST/features/solicitacoes/lib/solicitacaoMessages.test.ts`: `formatDuracao` (segundos) escreve "N s" abaixo de 1 min, "N min" abaixo de 1 h ("12 min", nunca "0h"), "Nh" abaixo de 24 h e "Nd Nh" depois (RF-09)
- [x] T007 [P] Alterar `SRC/features/solicitacoes/lib/solicitacaoMessages.ts`
- [x] T008 [P] Alterar `TST/features/solicitacoes/lib/acoesSolicitacao.test.ts`: `separarAcoes(acoes, status)` devolve a principal da etapa (`A_FAZER` → `TRIAR`, `EM_ANDAMENTO` → `ENVIAR_VALIDACAO`, `EM_VALIDACAO` → `ENCERRAR`) e as outras; principal não permitida ao usuário deixa `principal` nulo e tudo em `outras`; com uma única ação permitida, ela é a principal; `CANCELAR` fica por último e é a única destrutiva; `CANCELAR` some quando há `ENCERRAR` (como hoje); solicitação encerrada ou cancelada não tem ação
- [x] T009 [P] Alterar `SRC/features/solicitacoes/lib/acoesSolicitacao.ts`
- [x] T010 [P] Criar `TST/features/solicitacoes/lib/nomesDosUsuarios.test.ts`: `nomesDosResponsaveis` usa o campo `responsaveis` da API quando existe; senão a lista de usuários; senão devolve "N responsáveis" (com "1 responsável" no singular) e nada para lista vazia; `nomeDeQuemAbriu` usa `abertaPorNome`, depois o autor da atividade `ABERTURA`, depois a lista de usuários, e devolve nulo quando nenhum conhece
- [x] T011 [P] Criar `SRC/features/solicitacoes/lib/nomesDosUsuarios.ts` e acrescentar os campos opcionais `responsaveis` (`{ id, nome }[]`) e `abertaPorNome` a `Solicitacao` em `SRC/features/solicitacoes/types/solicitacaoTypes.ts`

## Fase 2 — Domínio dependente

- [x] T012 [P] Criar `TST/shared/lib/linhaDoTempo.test.ts`: `agruparPorDia` ordena do mais recente para o mais antigo (também dentro de cada dia) e agrupa por dia com `rotuloDoDia`; itens no mesmo instante mantêm a ordem de chegada; lista vazia dá nenhum grupo; `recolher` com mais de 10 itens deixa os 10 mais recentes e informa quantos ficaram atrás, com 10 ou menos não recolhe; expandido devolve todos
- [x] T013 [P] Criar `SRC/shared/lib/linhaDoTempo.ts` (com o tipo `ItemDaLinhaDoTempo`)
- [x] T014 [P] Alterar `TST/features/solicitacoes/lib/prazoSolicitacao.test.ts`: os testes atuais passam sem alteração com `formatarDuracao` vindo de `shared/lib/duracao`; casos novos de `prazoDoResumo`: aberta recém-criada com muito prazo restante mostra "Vence em N h" (o que `situacaoDoPrazo` não mostra); aberta vencida mostra "Atrasada há N d" em tom de atraso; concluída no prazo mostra "No prazo" e fora dele "Fora do prazo"; cancelada e sem `prazoLimite` não mostram nada
- [x] T015 [P] Alterar `SRC/features/solicitacoes/lib/prazoSolicitacao.ts`: importar `formatarDuracao` de `SRC/shared/lib/duracao.ts` e acrescentar `prazoDoResumo`

## Fase 3 — Adaptadores de domínio

- [x] T016 [P] Criar `TST/features/admin/modelos/lib/historicoDoModelo.test.ts`: evento com `solicitacaoRelacionadaId` cobre aquela solicitação, que não vira item de abertura; solicitação sem evento vira item de "abertura" com título, status e `criadaEm`; evento sem solicitação relacionada entra como está; cada solicitação aparece uma vez; todo item com solicitação leva a `/app/solicitacoes/<id>`; listas vazias dão lista vazia
- [x] T017 [P] Criar `SRC/features/admin/modelos/lib/historicoDoModelo.ts`
- [x] T018 [P] Criar `TST/features/solicitacoes/lib/historicoDaSolicitacao.test.ts`: cada tipo de atividade (`ABERTURA`, `ATRIBUICAO`, `MUDANCA_STATUS`, `COMENTARIO`, `EVIDENCIA_ADICIONADA`) vira item com o rótulo certo; comentário e evidência têm peso "destaque" e atribuição e mudança de status têm peso "discreto"; mudança de status leva os dois estados (de e para); comentário leva o texto; o autor leva nome e iniciais (uma ou duas letras)
- [x] T019 [P] Criar `SRC/features/solicitacoes/lib/historicoDaSolicitacao.ts`

## Fase 4 — Hooks

- [ ] T020 [P] Criar `TST/shared/hooks/useVoltar.test.tsx`: com tela anterior (`location.key` diferente de `default`) volta no histórico; sem tela anterior vai à reserva informada
- [ ] T021 [P] Criar `SRC/shared/hooks/useVoltar.ts`
- [ ] T022 [P] Criar `TST/features/solicitacoes/hooks/useAcoesDoCabecalho.test.tsx`: devolve a ação principal da etapa como botão e as demais em `maisAcoes`, com "Cancelar" por último e em perigo; "Editar" entra em `maisAcoes`; escolher uma ação abre o diálogo dela e fechar o diálogo o remove; sem ação permitida não devolve nada; migrar os casos úteis de `SolicitacaoAcoes.test.tsx`
- [ ] T023 [P] Criar `SRC/features/solicitacoes/hooks/useAcoesDoCabecalho.ts`

## Fase 5 — Peças

- [ ] T024 [P] Criar `TST/shared/components/LinhaDoTempo/LinhaDoTempo.test.tsx`: mostra os grupos por dia do mais recente ao mais antigo; cada grupo tem um título; cada horário é `<time dateTime>` com o texto relativo, a data completa no `title` e num texto só para leitor de tela; com mais de 10 itens recolhe e mostra "Mostrar N eventos anteriores"; acionar o controle mostra o resto, o controle continua montado e passa a "Mostrar menos" com `aria-expanded`, e o foco permanece nele; item com destino é link; sem animação fora de `motion-safe`; coluna de leitura com largura máxima de 720 px
- [ ] T025 [P] Criar `SRC/shared/components/LinhaDoTempo/LinhaDoTempo.tsx`
- [ ] T026 [P] Criar `TST/shared/components/Abas/Abas.test.tsx`: `role="tablist"`, `tab` e `tabpanel`; `aria-selected` na aba aberta; clique troca o painel; seta para a direita e para a esquerda (com volta), Home e End movem o foco e abrem a aba; o painel que não está aberto fica com `hidden` e fora da ordem de tabulação; alvo de toque de 44 px; sem animação fora de `motion-safe`
- [ ] T027 [P] Criar `SRC/shared/components/Abas/Abas.tsx`
- [ ] T028 [P] Alterar `TST/features/admin/modelos/components/GaleriaFotoThumb.test.tsx`: miniatura ativa tem contorno e `aria-current`; imagem que falha mostra o ícone de imagem indisponível; "+N" aparece só na última miniatura quando há mais fotos; os testes atuais seguem
- [ ] T029 [P] Alterar `SRC/features/admin/modelos/components/GaleriaFotoThumb.tsx`
- [ ] T030 Alterar `TST/features/admin/modelos/components/GaleriaModelo.test.tsx`: a foto grande é a capa (ou a primeira); escolher uma miniatura troca a foto grande e mantém a capa marcada; tocar na foto grande abre a galeria ampliada na foto atual; até 6 miniaturas com "+N" na última; "Adicionar foto" é um botão junto da foto só para quem pode gerenciar e não aparece sem permissão; sem fotos mostra o espaço com as duas primeiras letras do `codigo` que a página passa à galeria; galeria que falha mostra o erro com "Tentar novamente" que chama `refetch`; os testes de adicionar, definir capa, renomear e remover seguem
- [ ] T031 Alterar `SRC/features/admin/modelos/components/GaleriaModelo.tsx`
- [ ] T032 (depois de T017 e T025: usa a regra de adaptar e a peça da linha do tempo) Criar `TST/features/admin/modelos/components/HistoricoDoModelo.test.tsx`: monta a linha do tempo com `historicoDoModelo`; a solicitação concluída que gerou evento aparece uma vez e leva à solicitação; a solicitação aberta sem evento aparece com o status; mostra o total quando passa de 50 solicitações; estado vazio; migrar os casos úteis de `EventosModeloList.test.tsx`
- [ ] T033 Criar `SRC/features/admin/modelos/components/HistoricoDoModelo.tsx`

## Fase 6 — Telas

- [ ] T034 [P] Alterar `TST/features/modelos/components/ModeloCard.test.tsx`: o cartão inteiro é um link para o modelo (toque, clique e Enter); foto em proporção maior; título é a descrição; código em fonte monoespaçada; "Ativo" não aparece e "Inativo" e "Pendência aberta" aparecem; não existe "Ver detalhes →"
- [ ] T035 [P] Alterar `SRC/features/modelos/components/ModeloCard.tsx`
- [ ] T036 [P] Alterar `TST/features/solicitacoes/components/SolicitacaoTimeline.test.tsx`: usa a linha do tempo (do mais recente ao mais antigo, por dia); mudança de status mostra os dois estados como selos com seta; comentário em balão e atribuição discreta; autor com iniciais e nome uma vez; mais de 10 eventos recolhem; o formulário de comentário fica acima da linha do tempo e só aparece quando a solicitação não é terminal; estado de carregando e vazio
- [ ] T037 [P] Alterar `SRC/features/solicitacoes/components/SolicitacaoTimeline.tsx`
- [ ] T038 [P] Alterar `TST/features/solicitacoes/components/SolicitacaoResumo.test.tsx`: mostra status, prioridade, prazo por `prazoDoResumo` ("atrasada há 2 d" em perigo, "vence em 5 h" mesmo com muito prazo restante), responsáveis, modelo com link e quem abriu; nome do responsável pela API, pela lista e "N responsáveis" sem nome; quem abriu pela atividade de abertura e linha ausente sem nome; datas relativas com a completa; sem segundos
- [ ] T039 [P] Alterar `SRC/features/solicitacoes/components/SolicitacaoResumo.tsx`
- [ ] T040 [P] Alterar `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx`: foto de capa grande ao lado dos dados em tela larga e no topo em tela estreita; identificação (código e versão em destaque, código monoespaçado, selos); dados em grade de duas colunas sem perder nenhum dado de hoje (RNF-08); abas "Resumo" (observações e indicadores) e "Histórico" (linha do tempo única) e nenhuma aba "Solicitações"; indicadores com minutos e "Sem dados ainda"; "Editar" e "Mais ações" como já estão; os testes atuais de desativar, ativar e exportar seguem
- [ ] T041 [P] Alterar `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx`
- [ ] T042 (depois de T023, T037 e T039: usa o hook, a linha do tempo e o resumo novos) Alterar `TST/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx`: cabeçalho com a ação principal da etapa e "Mais ações" (Editar, Alterar responsáveis, Devolver e Cancelar quando permitidos); "Voltar" é um link acima do título, fora do grupo de ações, e volta à origem ou ao quadro; sem bloco "Ações" no corpo; formulário de comentário junto da linha do tempo; na edição, "Salvar" e "Cancelar" continuam sem menu; os testes atuais de edição, evidências e comentário seguem
- [ ] T043 Alterar `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx`
- [ ] T044 Remover `SRC/features/admin/modelos/components/EventosModeloList.tsx` e `TST/features/admin/modelos/components/EventosModeloList.test.tsx` (substituídos por `HistoricoDoModelo`); conferir por busca que nada mais os importa
- [ ] T045 Remover `SRC/features/solicitacoes/components/SolicitacaoAcoes.tsx` e `TST/features/solicitacoes/components/SolicitacaoAcoes.test.tsx` (substituídos por `useAcoesDoCabecalho`); conferir por busca que nada mais os importa

## Fase 7 — Integração e fechamento

- [ ] T046 [P] Alterar os roteiros de `app/tests/e2e/` que clicam em ação do detalhe da solicitação (conferir por busca `Triar`, `Enviar para validação`, `Devolver`, `Encerrar`, `Cancelar`, `Alterar responsáveis`, `Editar`, `Voltar`): as ações fora da principal passam por "Mais ações"
- [ ] T047 [P] Acrescentar as linhas desta feature à tabela de `openspec/README.md`
- [ ] T048 Medição "depois" com `medir012.cjs` na branch e comparação com a T001: RNF-01, RNF-02, RNF-03, RNF-04, RNF-07, RNF-12, mais toque, foco e contraste dos elementos novos (RNF-05, RNF-06) e capturas da ficha (com foto, sem foto, em 390 px), do cartão da lista e do detalhe da solicitação nos dois temas; registrar na convergência
- [ ] T049 Rodar a feature contra o backend de `develop` (ambiente local): ficha com foto e abas, histórico único, detalhe com ação principal e menu, comentário e "Voltar", e a suíte `make e2e`; registrar na convergência
- [ ] T050 `make cover-arquivos ARQUIVOS="<todos os arquivos de src/ alterados ou criados>"` com 95% em cada um (RNF-09) e `app/package.json` sem pacote novo (RNF-10)
- [ ] T051 `make validate` verde

## Cenários da spec × teste

| Cenário da spec | Teste |
|---|---|
| Foto de capa em destaque | `TST/features/admin/modelos/pages/ModeloDetalhePage.test.tsx` (T040) e medição (T048) |
| Foto de capa em tela estreita | T040 e medição (T048) |
| Modelo sem foto de capa | `TST/features/admin/modelos/components/GaleriaModelo.test.tsx` (T030) |
| Trocar a foto grande por uma miniatura | T030 |
| Ampliar a foto | T030 |
| Identificação do modelo | T040 |
| Dados em grade compacta | T040 |
| Ação principal e menu | T040 |
| Abas Resumo e Histórico | T040 e `TST/shared/components/Abas/Abas.test.tsx` (T026) |
| Adicionar foto junto da foto | T030 |
| Sem permissão para fotos | T030 |
| Histórico único do modelo | `TST/features/admin/modelos/lib/historicoDoModelo.test.ts` (T016) e `TST/features/admin/modelos/components/HistoricoDoModelo.test.tsx` (T032) |
| Solicitação sem evento no histórico | T016 e T032 |
| Histórico do mais recente para o mais antigo | `TST/shared/lib/linhaDoTempo.test.ts` (T012) e T032 |
| Duração curta nos indicadores | `TST/features/solicitacoes/lib/solicitacaoMessages.test.ts` (T006) e T040 |
| Indicador sem dado | T040 |
| Cartão do modelo | `TST/features/modelos/components/ModeloCard.test.tsx` (T034) |
| Selos só para exceções | T034 |
| Cartão inteiro abre o modelo | T034 |
| Cartão por teclado | T034 |
| Resumo completo | `TST/features/solicitacoes/components/SolicitacaoResumo.test.tsx` (T038) |
| Nome do responsável conhecido | `TST/features/solicitacoes/lib/nomesDosUsuarios.test.ts` (T010) e T038 |
| Nome do responsável vindo da API | T010 e T038 |
| Nome do responsável desconhecido | T010 e T038 |
| Quem abriu pela atividade de abertura | T010 e T038 |
| Quem abriu sem a atividade de abertura | T010 e T038 |
| Prazo vencido | T038 e `TST/features/solicitacoes/lib/prazoSolicitacao.test.ts` (T014) |
| Datas relativas | `TST/shared/lib/data.test.ts` (T002) e T038 |
| Uma ação principal por etapa | `TST/features/solicitacoes/lib/acoesSolicitacao.test.ts` (T008) e T042 |
| Cancelar separado e confirmado | `TST/features/solicitacoes/hooks/useAcoesDoCabecalho.test.tsx` (T022) e T042 |
| Linha do tempo agrupada por dia | T012 e `TST/features/solicitacoes/components/SolicitacaoTimeline.test.tsx` (T036) |
| Mudança de status com selos | `TST/features/solicitacoes/lib/historicoDaSolicitacao.test.ts` (T018) e T036 |
| Comentário em destaque | T018 e T036 |
| Autor uma vez por evento | T018 e T036 |
| Eventos antigos recolhidos | T012 e `TST/shared/components/LinhaDoTempo/LinhaDoTempo.test.tsx` (T024) |
| Comentar sem rolar até o fim | T036 e T042 |
| Solicitação encerrada não recebe comentário | T036 |
| Voltar à tela de origem | `TST/shared/hooks/useVoltar.test.tsx` (T020) e T042 |
| Voltar sem tela anterior | T020 |
| Galeria que não carrega | T030 |
| Foto que não abre | T028 |
| Principal não permitida ao usuário | T008 e T022 |
| Uma única ação permitida | T008, T022 e T042 |
| Editar no menu | T022 e T042 |
| Voltar como link | T042 |
| Abas por teclado | T026 |
| Foco depois de expandir o histórico | T024 |
| Data completa para leitor de tela | T024 |
| Redução de movimento | T024, T026 e T030 |
| Alvos de toque | T024, T026, T034 e medição (T048) |

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T030, T031, T040, T041, T048 |
| RF-02 | T030, T031 |
| RF-03 | T028, T029, T030, T031 |
| RF-04 | T040, T041 |
| RF-05 | T040, T041 |
| RF-06 | T030, T031, T040, T041 |
| RF-07 | T026, T027, T040, T041 |
| RF-08 | T012, T013, T016, T017, T024, T025, T032, T033 |
| RF-09 | T006, T007, T040, T041 |
| RF-10 | T034, T035 |
| RF-11 | T034, T035 |
| RF-12 | T002, T003, T010, T011, T014, T015, T038, T039 |
| RF-13 | T008, T009, T022, T023, T042, T043 |
| RF-14 | T018, T019, T024, T025, T036, T037 |
| RF-15 | T012, T013, T024, T025 |
| RF-16 | T036, T037, T042, T043 |
| RF-17 | T020, T021, T042, T043 |
| RF-18 | T028, T029, T030, T031 |
| RF-19 | T002, T003, T024, T025, T026, T027 |
| RNF-01 | T001, T048 |
| RNF-02 | T001, T048 |
| RNF-03 | T001, T022, T042, T048 |
| RNF-04 | T001, T024, T048 |
| RNF-05 | T024, T026, T034, T048 |
| RNF-06 | T048 |
| RNF-07 | T001, T048 |
| RNF-08 | T040 |
| RNF-09 | T050 |
| RNF-10 | T050 |
| RNF-11 | T011, T049, T050 |
| RNF-12 | T001, T012, T048 |
| RNF-13 | T024, T026, T030 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.
