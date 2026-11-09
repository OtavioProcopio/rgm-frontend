# Plano de implementação — Instrução em destaque na solicitação

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> `SRC` = `app/src`, `TST` = `app/tests`. Base: `develop` com a spec 017. Publicação: junto do
> backend com a spec 015, backend primeiro; sem reserva para backend anterior.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| O que mostrar em cada situação | Função pura `instrucaoParaExibir(solicitacao)` em `lib/`, que devolve `{ tipo: 'instrucao', texto }`, `{ tipo: 'semRegistro' }` ou `{ tipo: 'nenhuma' }` pelo status e pelo texto | Condições no JSX | Regra de negócio testável fora de `pages/` e `components/` (Princípio 10); os três estados e as bordas de status ficam numa tabela de teste |
| Onde fica o bloco | Componente `InstrucaoDaSolicitacao` renderizado por `SolicitacaoResumo` **antes** da grade de dados, em largura total | Dentro da grade (`col-span-2`) | O bloco é o conteúdo principal; fora da grade fica acima no celular e no desktop e não depende das colunas |
| Aparência | Região (`section`) nomeada por `aria-labelledby`, título "O que precisa ser feito", faixa de acento à esquerda e fundo `info-soft` com texto `info-fg` (os tokens que a triagem já usa); texto com `whitespace-pre-line` e `break-words` | Cartão genérico; cor própria | Reaproveita tokens que já passam em contraste nos dois temas (spec 010); a faixa e o título não dependem só de cor |
| Instrução longa | Sem truncar nem recolher | `line-clamp` com "Ver mais" | Esconderia o conteúdo principal; 2000 caracteres cabem numa tela de celular com rolagem normal |
| Aviso de triada antiga | Linha discreta (`text-fg-muted`, ícone mais texto) no mesmo lugar do bloco | Esconder; inferir do histórico | RF-03; não adivinhar |
| Campo do formulário | `instrucao` no `triarSolicitacaoSchema` (renomeia `descricao`), `trim`, mínimo 1, máximo `LIMITES.textoLongo`; mensagem "Descreva o que precisa ser feito" | Manter o nome `descricao` | RF-06: mesmo nome do contrato; evita dois significados de `descricao` |
| Rótulo | "O que precisa ser feito", sem "(opcional)" | "Instrução" | A tela usa a linguagem de quem executa; o termo `instrucao` fica no código (Princípio 8) |
| Foco no erro | `register` do react-hook-form já foca o primeiro campo de texto inválido; não se muda isso | Foco manual | Menos código; o controle de prioridade e o seletor não são campos de texto |
| Tempo real | Nenhum código novo: o detalhe já ouve os eventos de solicitação e atualiza o cache; o evento "triada" já traz a resposta completa, que passa a ter `instrucao` | Nova assinatura | RNF-01; confirmado por teste |
| Cartão e listagem | Sem alteração | Mostrar a instrução | RF-10 |
| Contrato | `Solicitacao.instrucao: string \| null`; `TriarSolicitacaoRequest.instrucao: string`; `docs/swagger.json` atualizado | Campo opcional ausente | O backend sempre envia o campo, nulo quando não houver |
| Validação compartilhada | Um só validador `instrucaoDoTrabalho` (`trim`, mínimo 1, máximo `LIMITES.textoLongo`, mensagem "Descreva o que precisa ser feito") usado por `triarSolicitacaoSchema` e por `editarInstrucaoSchema` | Duplicar a regra | Triar e corrigir não podem divergir (RF-05, RF-12) |
| Ação de editar | `EDITAR_INSTRUCAO` entra em `ACOES_SOLICITACAO`; `EditarInstrucaoAction` entra em `COMPONENTE_DA_ACAO` e abre pelo `DialogoDaAcao` que o quadro e o detalhe já usam | Diálogo próprio | O diálogo já prende foco, fecha com Esc, devolve o foco, bloqueia durante o envio e pergunta antes de descartar (RF-14, RNF-04) |
| Fora de "Mais ações" | `BOTOES` (cabeçalho) e `acaoDoMovimento` (quadro) não ganham a ação; só o bloco a abre | Entrada no menu | RF-19; o botão fica junto do texto que edita |
| Quem pode | `acoesPermitidas` da API quando informada; sem ela (eventos e listagens), `regraLocal` inclui `EDITAR_INSTRUCAO` para gestor e administrador com `EM_ANDAMENTO` | Só a regra local | Eventos chegam sem `acoesPermitidas` (ver `mesclarSolicitacaoDoEvento`); a API manda quando informa, a regra local nunca concede o que ela recusa (P9) |
| Envio da edição | `solicitacoesApi.editarInstrucao(id, { instrucao })` (`PATCH /solicitacoes/{id}/instrucao`) e `useEditarInstrucao`; no sucesso, o detalhe em cache recebe a resposta mesclada (mantendo `acoesPermitidas` e responsáveis, que a resposta não traz), as listas e o histórico são invalidados | Refazer a consulta do detalhe | RNF-01: sem GET extra do detalhe |
| Botão "Salvar" | Desabilitado enquanto o texto aparado é igual ao atual; função pura `instrucaoMudou(atual, digitado)` em `lib/` | Comparar no JSX | Regra testável (P10) |
| Aviso de sucesso | `sucessoDaAcao.EDITAR_INSTRUCAO` = "Instrução atualizada", como as demais ações | Texto no componente | Segue `solicitacaoMessages` |
| Tempo real | O evento `solicitacao` já atualiza o detalhe; o backend também publica `solicitacao_atividade`, que já recarrega o histórico (`useSolicitacaoEvents`). Nenhum código novo de assinatura | Assinar tipo novo | RF-17, RNF-01 |
| Tipo de atividade novo | `INSTRUCAO_ALTERADA` entra em `TipoAtividadeSolicitacao`, em `PESO_POR_TIPO` (`destaque`), em `TIPO_CONFIG` (ícone de lápis) e no rótulo; título "Instrução alterada" e detalhe "Antes: …" | Reaproveitar `COMENTARIO` | RF-16 |
| Tipo desconhecido | `TIPO_CONFIG` e `PESO_POR_TIPO` passam a ter um item de reserva (`DESCONHECIDO`) usado quando a chave não existe; título "Atividade registrada" | Deixar quebrar | RF-18; é o que impede o backend novo de derrubar um front desatualizado |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| domain | `SRC/features/solicitacoes/lib/instrucaoParaExibir.ts` | criar | `TST/unit/features/solicitacoes/lib/instrucaoParaExibir.test.ts` |
| domain | `SRC/features/solicitacoes/types/solicitacaoTypes.ts` (`Solicitacao.instrucao`, `TriarSolicitacaoRequest.instrucao`) | alterar | tipos (`tsc`) |
| domain | `SRC/features/solicitacoes/schemas/solicitacaoSchema.ts` (`descricao` → `instrucao`) | alterar | `TST/unit/features/solicitacoes/schemas/solicitacaoSchema.test.ts` |
| presenter | `SRC/features/solicitacoes/components/InstrucaoDaSolicitacao.tsx` | criar | `TST/unit/features/solicitacoes/components/InstrucaoDaSolicitacao.test.tsx` |
| presenter | `SRC/features/solicitacoes/components/SolicitacaoResumo.tsx` (renderiza o bloco antes da grade) | alterar | `TST/unit/features/solicitacoes/components/SolicitacaoResumo.test.tsx` |
| presenter | `SRC/features/solicitacoes/components/TriagemModal.tsx` (rótulo, `instrucao`) | alterar | `TST/unit/features/solicitacoes/components/TriagemModal.test.tsx` |
| presenter | `SRC/features/solicitacoes/actions/TriarAction.tsx` | alterar (se o tipo mudar) | `TST/unit/features/solicitacoes/actions/TriarAction.test.tsx` |
| presenter | `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` (passa ao resumo se pode editar e abre a ação) | alterar | `TST/unit/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx` (evento "triada" e "instrucao_editada") |
| domain | `SRC/features/solicitacoes/lib/acoesSolicitacao.ts` (`EDITAR_INSTRUCAO`, `regraLocal`, rótulo) | alterar | `TST/unit/features/solicitacoes/lib/acoesSolicitacao.test.ts` |
| domain | `SRC/features/solicitacoes/lib/instrucaoMudou.ts` | criar | `TST/unit/features/solicitacoes/lib/instrucaoMudou.test.ts` |
| domain | `SRC/features/solicitacoes/lib/solicitacaoMessages.ts` (`sucessoDaAcao.EDITAR_INSTRUCAO`) | alterar | `TST/unit/features/solicitacoes/lib/solicitacaoMessages.test.ts` |
| domain | `SRC/features/solicitacoes/schemas/solicitacaoSchema.ts` (`instrucaoDoTrabalho`, `editarInstrucaoSchema`) | alterar | `TST/unit/features/solicitacoes/schemas/solicitacaoSchema.test.ts` |
| clients | `SRC/features/solicitacoes/api/solicitacoesApi.ts` (`editarInstrucao`) | alterar | `TST/unit/features/solicitacoes/api/solicitacoesApi.test.ts` |
| hook | `SRC/features/solicitacoes/hooks/useEditarInstrucao.ts` | criar | `TST/unit/features/solicitacoes/hooks/useEditarInstrucao.test.tsx` |
| presenter | `SRC/features/solicitacoes/actions/EditarInstrucaoAction.tsx`, `AcaoSolicitacaoAtiva.tsx` | criar/alterar | `TST/unit/features/solicitacoes/actions/EditarInstrucaoAction.test.tsx`, `AcaoSolicitacaoAtiva.test.tsx` |
| presenter | `SRC/features/solicitacoes/components/InstrucaoDaSolicitacao.tsx` (botão "Editar") | alterar | `InstrucaoDaSolicitacao.test.tsx` |
| domain | `SRC/features/solicitacoes/types/solicitacaoTypes.ts` (`INSTRUCAO_ALTERADA`), `lib/historicoDaSolicitacao.ts`, `lib/solicitacaoLabels` (rótulo do tipo) | alterar | `TST/unit/features/solicitacoes/lib/historicoDaSolicitacao.test.ts` |
| presenter | `SRC/features/solicitacoes/components/SolicitacaoTimeline.tsx` (ícone, reserva para tipo desconhecido) | alterar | `TST/unit/features/solicitacoes/components/SolicitacaoTimeline.test.tsx` |
| test | `TST/support/solicitacaoFixture.ts` (`instrucao: null` por padrão) | alterar | — |
| e2e | `TST/e2e/fixtures.ts` (rótulo novo), `kanban.spec.ts` (instrução aparece no detalhe depois de triar) | alterar | roteiros e2e |
| docs | `docs/swagger.json`, `openspec/README.md` (linha) | alterar | — |

## Contrato entre camadas

- **UI → hook:** `onConfirm(data, foto)` com `data = { prioridade, responsavelIds, instrucao }`.
- **Hook → API:** `PATCH /api/solicitacoes/{id}/triar` com os três campos.
- **UI → hook:** `EditarInstrucaoAction` envia `{ instrucao }` por `useEditarInstrucao`.
- **Hook → API:** `PATCH /api/solicitacoes/{id}/instrucao`; 200 com a solicitação; 400, 403, 409.
- **API → UI:** `Solicitacao.instrucao` no detalhe e nos eventos; `acoesPermitidas` com `EDITAR_INSTRUCAO`; atividade `INSTRUCAO_ALTERADA` com o texto anterior em `detalhe`; ignorado pelo cartão.
- **Compatibilidade:** ver "Ordem de publicação" na spec.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Front publicado contra backend sem a spec 015 recusa toda triagem | média | Ordem de publicação na spec; backend primeiro |
| E2E não roda neste ambiente | certa nesta rodada | `make e2e` antes do merge; registrado na convergência |
| Texto longo sem espaço estoura o layout | média | `break-words`; teste com palavra de 200 caracteres e verificação de largura no e2e em 320 px |
| Aviso de triada antiga aparece em cancelada que nunca foi triada | baixa | A tabela de `instrucaoParaExibir` exclui `A_FAZER` e `CANCELADA`; teste por status |
| Botão "Editar" aparece para quem a API recusaria | baixa | Vale `acoesPermitidas` da API; a regra local só vale sem ela; se a API recusar, o erro aparece no diálogo (RF-15) |
| Conflito de edição some com o texto digitado | média | O diálogo não fecha em erro e mantém o texto (RF-15); teste |
| Backend novo derruba front antigo no histórico (tipo desconhecido) | alta se publicado sem esta spec | RF-18 e a ordem de publicação |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| P7 — mapa de pastas | Regra em `lib/`; componente fala com props, sem `fetch`; sem `*Api.ts` em componente |
| P8 — linguagem ubíqua | `instrucao`; testes `it('deve ... quando ...')` |
| P9 — compatibilidade | Dependência do backend declarada, com ordem de publicação |
| P10 — cobertura | Regra nova em `lib/` e `schemas/`, medida |
| P11 — padrão de teste | Testes novos e alterados em AAA, um comportamento por teste, consulta por papel e texto acessível |
| P12 — uma fonte | Spec em `specs/018`; linha na tabela de `openspec/README.md` |
