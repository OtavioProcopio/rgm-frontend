## 1. Tipo, labels e permissao

- [x] 1.1 Adicionar `CRIACAO` a `TipoSolicitacao` (`solicitacaoTypes.ts`), com label "Criação de modelo" em `solicitacaoMessages.ts`, `SolicitacaoFilters.tsx` e `SolicitacoesTab.tsx`
- [x] 1.2 Adicionar `canAbrirSolicitacaoCriacao` (GESTOR/ADMINISTRADOR) em `shared/lib/permissions.ts`
- [x] 1.3 Ajustar `abrirSolicitacaoSchema` (Zod, `superRefine`) para exigir `modeloCodigo`/`modeloMaquina` quando `tipo === 'CRIACAO'` e `modeloId` nos demais tipos

## 2. Formulario de abertura

- [x] 2.1 `NovaSolicitacaoPage`: ocultar a opcao "Criação de modelo" para quem nao tem `canAbrirSolicitacaoCriacao`
- [x] 2.2 `NovaSolicitacaoPage`: quando `tipo === 'CRIACAO'`, trocar o combobox de modelo por codigo (input), maquina (select do catalogo via `useMaquinaOptions`) e observacoes (textarea); `onSubmit` monta o payload condicionalmente

## 3. Kanban e validacao

- [x] 3.1 `KanbanCard`: adicionar entrada `CRIACAO` no mapa `TIPO_CONFIG` (ícone e cor) — sem essa entrada o card lançava `Cannot destructure property 'Icon' of undefined` e derrubava o quadro inteiro (bug real encontrado via auditoria de fluxos)
- [x] 3.2 `EnviarValidacaoModal`: nova prop `evidenciaObrigatoria` (default `true`); quando `false`, o upload de evidencia fica opcional e o botao de enviar habilita por validade do formulario (`mode: 'onChange'`), nao pela presenca de evidencia
- [x] 3.3 `KanbanBoard`: passar `evidenciaObrigatoria={card.tipo !== 'CRIACAO'}` ao abrir o modal de envio para validacao

## 4. Detalhe da solicitacao

- [x] 4.1 `SolicitacaoDetalhePage`: remover o seletor de tipo do modo de edicao — exibir o tipo como texto somente leitura com nota de que nao pode ser alterado
- [x] 4.2 `SolicitacaoDetalhePage`: quando `tipo === 'CRIACAO'` e `modeloId` ainda nulo, exibir o card "Modelo pretendido" (codigo/maquina/observacoes + aviso "sera criado ao concluir") no lugar do card de rastreabilidade
- [x] 4.3 `useModelo`: aceitar `id?: string | null` para nao disparar busca quando a CRIACAO ainda nao tem modelo vinculado

## 5. Regressao

- [x] 5.1 Atualizar testes unitarios afetados (`KanbanCard.test.tsx`, `NovaSolicitacaoPage.test.tsx`, `SolicitacaoDetalhePage.test.tsx`, `solicitacaoSchema.test.ts`) e criar `EnviarValidacaoModal.test.tsx` (novo)
- [x] 5.2 Rodar `make check-frontend` (lint + typecheck + testes + build) e confirmar que passa
- [x] 5.3 Criar `e2e/solicitacao-criacao.spec.ts` (Playwright, execucao real contra o stack de `make up`) cobrindo: OPERADOR nao ve a opcao; GESTOR abre CRIACAO com campos condicionais; fluxo completo abrir → triar → validar sem evidencia → concluir cria o Modelo; cancelar antes de concluir nao cria modelo; a solicitacao aparece na listagem mesmo sem modelo (regressao do bug de `LEFT JOIN` do backend); tipo imutavel na edicao; regressao dos dois bugs reais encontrados no backend durante esta auditoria (cancelar CRIACAO sem modelo, metricas do dashboard com `modelo_id` nulo) — 8/8 passando
