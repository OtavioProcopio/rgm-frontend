## 1. Layout das colunas

- [x] 1.1 Trocar `w-72 shrink-0` por `flex-1 min-w-[220px] max-w-[340px]` em `KanbanColumn.tsx` (apenas no modo desktop, `mobileView` continua `w-full`) e verificar visualmente via `make up` (http://localhost:5173) em uma janela ~1280px de largura que as 5 colunas preenchem o espaço sem rolagem horizontal
- [x] 1.2 Confirmar em uma janela bem estreita (ex.: DevTools em 900px) que a rolagem horizontal do quadro volta a aparecer como fallback, sem quebrar o drag-and-drop
- [x] 1.3 (Achado via E2E real, `e2e/kanban-responsivo.spec.ts`) O piso de 220px não cabia as 5 colunas em 1366×768 (overflow de ~192px medido via `scrollWidth - clientWidth`) — reduzido para `min-w-[170px]`, validado via screenshot e reteste E2E (0 overflow, cartões ainda legíveis); `design.md` atualizado com a math de largura disponível

## 2. Regressão

- [x] 2.1 Rodar `make test-frontend` e ajustar qualquer teste de `KanbanColumn`/`KanbanBoard` que dependa da classe de largura antiga
- [x] 2.2 Rodar `make check-frontend` (lint + typecheck + testes + build) e confirmar que passa sem erros
- [x] 2.3 Rodar E2E real (Playwright, `e2e/kanban-responsivo.spec.ts`) em 3 viewports (1366×768 notebook, 1100×768 desktop estreito, 390×844 mobile) — todos passando após o ajuste do piso
