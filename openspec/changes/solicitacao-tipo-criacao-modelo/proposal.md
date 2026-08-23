## Why

O backend já suporta solicitações do tipo `CRIACAO` — um pedido formal de
"novo modelo" que percorre o mesmo Kanban de manutenção e, ao ser concluído,
gera automaticamente o cadastro do Modelo (ver a change equivalente no
`rgm-backend`, `solicitacao-tipo-criacao-modelo`). O frontend precisa
reconhecer esse novo tipo em todas as superfícies que hoje assumem que toda
solicitação tem um `modeloId` obrigatório: formulário de abertura, card do
Kanban, filtros, labels, permissões e a página de detalhe.

Esta change documenta retroativamente o trabalho já implementado no
frontend nesta mesma sessão de desenvolvimento — o código já existe e está
coberto por testes unitários e E2E (Playwright); o objetivo deste registro é
formalizar a decisão de design e a superfície afetada, sem mudança
funcional adicional.

## What Changes

- Novo valor `CRIACAO` em `TipoSolicitacao` no frontend, com label
  "Criação de modelo" (`solicitacaoMessages.ts`, `SolicitacaoFilters.tsx`,
  `SolicitacoesTab.tsx`).
- Nova permissão `canAbrirSolicitacaoCriacao` (GESTOR/ADMINISTRADOR) em
  `shared/lib/permissions.ts`, controlando se a opção "Criação de modelo"
  aparece no formulário de abertura.
- `NovaSolicitacaoPage`: quando `tipo === 'CRIACAO'`, troca o combobox de
  modelo existente por três campos condicionais (código, máquina do
  catálogo, observações) — os mesmos dados exigidos pelo cadastro direto de
  modelo.
- `KanbanCard`: reconhece `CRIACAO` no mapa de configuração visual (ícone e
  cor) — sem essa entrada o card quebrava ao renderizar (bug encontrado
  nesta sessão via auditoria de fluxos, corrigido junto).
- `EnviarValidacaoModal`/`KanbanBoard`: evidência deixa de ser obrigatória
  para enviar uma solicitação CRIACAO para validação (o backend não exige
  evidência para esse tipo — só para REPARO/REENGENHARIA).
- `SolicitacaoDetalhePage`: enquanto uma CRIACAO ainda não foi concluída
  (sem `modeloId`), mostra um card "Modelo pretendido" com os dados
  carregados na abertura em vez do card de rastreabilidade (que passa a
  aparecer normalmente assim que a solicitação é concluída e o modelo é
  criado); o tipo deixa de ser editável em qualquer solicitação (imutável
  após a abertura, refletindo a regra já aplicada no backend).
- `useModelo`: aceita `id` opcional/nulo, já que a página de detalhe de uma
  CRIACAO sem modelo ainda não tem um id de modelo para buscar.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `solicitacoes-kanban`: novo tipo CRIACAO no formulário de abertura (campos
  condicionais, restrito a GESTOR/ADMINISTRADOR), evidência opcional ao
  enviar para validação, card "Modelo pretendido" antes da conclusão, e tipo
  imutável na edição.

## Impact

- `app/src/features/solicitacoes/types/solicitacaoTypes.ts`,
  `schemas/solicitacaoSchema.ts` (validação condicional via
  `superRefine`), `lib/solicitacaoMessages.ts`.
- `app/src/features/solicitacoes/components/KanbanCard.tsx`,
  `KanbanColumn.tsx` (sem mudança funcional, só posicionamento),
  `KanbanBoard.tsx`, `EnviarValidacaoModal.tsx`, `SolicitacaoFilters.tsx`.
- `app/src/features/solicitacoes/pages/NovaSolicitacaoPage.tsx`,
  `SolicitacaoDetalhePage.tsx`, `SolicitacoesTab.tsx`.
- `app/src/features/admin/modelos/hooks/useModelo.ts`.
- `app/src/shared/lib/permissions.ts`.
- Testes: unitários atualizados/adicionados nos arquivos acima
  (`EnviarValidacaoModal.test.tsx` novo); E2E novo
  (`e2e/solicitacao-criacao.spec.ts`, 8 testes) cobrindo o fluxo completo
  abrir → triar → validar → concluir, permissão de OPERADOR, cancelamento
  sem criar modelo, listagem sem modelo vinculado e imutabilidade do tipo.
