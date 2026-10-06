## Context

O quadro desktop (`KanbanBoard.tsx`) já renderiza as colunas dentro de um
contêiner `flex` com `gap-4 overflow-x-auto`. Cada `KanbanColumn` define sua
própria largura via `className` (`w-72 shrink-0` hoje). O layout pai
(`AppLayout.tsx`) reserva 280px para a sidebar em telas `lg`+, e a área de
conteúdo ainda tem padding (`px-4/px-8`) e um card (`p-5/p-6`) por cima. Ver
`proposal.md` para a motivação.

## Goals / Non-Goals

**Goals:**
- Colunas crescem para preencher a largura real disponível em resoluções de
  notebook (1366–1440px de tela, menos sidebar/paddings).
- Preservar a rolagem horizontal como fallback em janelas muito estreitas
  (ex.: janela restaurada pequena, zoom alto do navegador).
- Mudança isolada em CSS/classes Tailwind — sem tocar lógica de
  drag-and-drop, permissões ou dados.

**Non-Goals:**
- Não mexe na visão mobile (tabs + coluna única), que já é responsiva.
- Não introduz colunas colapsáveis/ocultáveis nem reordenação de colunas
  (fora de escopo desta mudança).
- Não resolve separadamente a possível compressão da sidebar/main — assume
  o layout atual do `AppLayout` como constante.

## Decisions

**Trocar `w-72 shrink-0` por largura flexível com piso e teto, mantendo o
contêiner pai como `flex`.**

Concretamente, em `KanbanColumn.tsx`: `flex-1 min-w-[170px] max-w-[340px]`
(shrink-0 removido) no lugar de `w-72 shrink-0`.

- Em flexbox, `min-width` tem precedência sobre o encolhimento automático do
  `flex-1` — ou seja, abaixo de 170px por coluna o contêiner volta a
  transbordar e o `overflow-x-auto` já existente assume a rolagem, sem
  nenhum JS adicional.
- `max-w-[340px]` evita que, em monitores muito largos, uma única coluna
  fique desproporcionalmente esticada.

Alternativa considerada: CSS Grid (`grid-template-columns: repeat(5,
minmax(220px, 1fr))`) no contêiner. Rejeitada por exigir trocar o contêiner
de `flex` para `grid` e reajustar como o "drop target" e o scroll mobile
(que reaproveita `KanbanColumn` no modo `mobileView`) se comportam — o ganho
seria marginal frente ao ajuste `flex-1`/`min-w`/`max-w`, que é uma troca de
2 classes no componente existente.

Os valores de piso e teto foram ajustados durante a implementação: a
estimativa inicial de piso (220px) não cabia as 5 colunas em 1366×768 sem
rolagem — nessa largura a área de conteúdo real (descontando sidebar de
280px + paddings do `AppLayout`) é de ~974px, e 5×220px + 4 gaps de 16px =
1164px, ~190px maior que o disponível. Confirmado via teste E2E real
(Playwright, `e2e/kanban-responsivo.spec.ts`) antes do ajuste. O piso foi
reduzido para 170px (5×170px + gaps = 914px, cabe com folga em 1366×768),
validado visualmente (screenshot) e via E2E depois do ajuste — cartões
continuam legíveis nessa largura. Teto de 340px mantido sem mudanças.

## Risks / Trade-offs

- [Cartões podem ficar mais estreitos que os 288px atuais em telas menores]
  → Mitigação: piso de 170px preserva legibilidade mínima (validado
  visualmente e via E2E em 1366×768); abaixo disso o fallback de rolagem
  horizontal assume.
- [Mudança de largura pode afetar testes existentes que fazem snapshot de
  classes CSS em `KanbanColumn.test.tsx`/`KanbanBoard.tsx` (se houver)]
  → Mitigação: rodar a suíte (`make test-frontend`) e ajustar asserções de
  classe, se necessário — sem mudar comportamento funcional testado.
