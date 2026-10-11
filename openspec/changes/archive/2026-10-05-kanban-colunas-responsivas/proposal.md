## Why

No quadro Kanban desktop (`KanbanBoard.tsx`), cada coluna tem largura fixa
`w-72` (288px). Com as 5 colunas de status + gaps, o quadro precisa de
~1504px de largura — mais do que a área de conteúdo disponível em um
notebook comum (sidebar de 280px + paddings do layout já consomem boa parte
da tela). O resultado é uma barra de rolagem horizontal permanente e colunas
que nunca aproveitam o espaço realmente disponível, independente do tamanho
da tela do usuário.

## What Changes

- As colunas do quadro Kanban desktop passam a ter largura flexível
  (encolhem/crescem dentro de um mínimo e máximo), em vez de `w-72` fixo.
- Em telas mais estreitas (ex.: notebook 13"-14"), as 5 colunas continuam
  visíveis lado a lado sem depender de rolagem horizontal para as colunas
  em si — a rolagem horizontal deixa de ser o mecanismo primário de uso do
  quadro nesses tamanhos.
- Em telas muito estreitas onde nem o mínimo por coluna cabe, a rolagem
  horizontal continua existindo como fallback (não é removida, apenas deixa
  de ser o comportamento padrão em notebooks comuns).
- Nenhuma mudança de comportamento na visão mobile (tabs + coluna única),
  que já é responsiva.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `solicitacoes-kanban`: o requisito de exibição do quadro Kanban passa a
  exigir que as colunas se adaptem à largura disponível da viewport em vez
  de manter largura fixa, reduzindo a dependência de rolagem horizontal em
  resoluções de notebook comuns.

## Impact

- `app/src/features/solicitacoes/components/KanbanColumn.tsx`: troca da
  classe de largura fixa por uma estratégia flexível (ex.: `flex-1` com
  `min-width`/`max-width`, ou `clamp()`).
- `app/src/features/solicitacoes/components/KanbanBoard.tsx`: contêiner do
  quadro desktop, hoje `overflow-x-auto`, precisa acomodar colunas
  flexíveis mantendo o fallback de rolagem em telas muito estreitas.
- Sem mudança de API, backend ou schema — puramente CSS/layout no
  frontend.
- Testes existentes de `KanbanColumn`/`KanbanBoard` (Vitest) precisam
  continuar passando; nenhum teste novo de snapshot de largura é esperado
  (comportamento validado visualmente/manualmente).
