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
| presenter | `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` (nenhuma mudança esperada) | conferir | `TST/unit/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx` (evento "triada") |
| test | `TST/support/solicitacaoFixture.ts` (`instrucao: null` por padrão) | alterar | — |
| e2e | `TST/e2e/fixtures.ts` (rótulo novo), `kanban.spec.ts` (instrução aparece no detalhe depois de triar) | alterar | roteiros e2e |
| docs | `docs/swagger.json`, `openspec/README.md` (linha) | alterar | — |

## Contrato entre camadas

- **UI → hook:** `onConfirm(data, foto)` com `data = { prioridade, responsavelIds, instrucao }`.
- **Hook → API:** `PATCH /api/solicitacoes/{id}/triar` com os três campos.
- **API → UI:** `Solicitacao.instrucao` no detalhe e nos eventos; ignorado pelo cartão.
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

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| P7 — mapa de pastas | Regra em `lib/`; componente fala com props, sem `fetch`; sem `*Api.ts` em componente |
| P8 — linguagem ubíqua | `instrucao`; testes `it('deve ... quando ...')` |
| P9 — compatibilidade | Dependência do backend declarada, com ordem de publicação |
| P10 — cobertura | Regra nova em `lib/` e `schemas/`, medida |
| P11 — padrão de teste | Testes novos e alterados em AAA, um comportamento por teste, consulta por papel e texto acessível |
| P12 — uma fonte | Spec em `specs/018`; linha na tabela de `openspec/README.md` |
