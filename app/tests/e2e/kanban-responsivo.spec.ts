/**
 * Regressão do layout responsivo do quadro Kanban — colunas com largura
 * flexível (flex-1 min-w/max-w) em vez de w-72 fixo, para caber em telas de
 * notebook comuns sem rolagem horizontal. Ver
 * openspec/changes/kanban-colunas-responsivas (frontend).
 */
import { test, expect } from './fixtures';

test.describe('Kanban — layout responsivo', () => {
  test('em viewport de notebook (1366x768), as 5 colunas cabem sem rolagem horizontal', async ({
    page,
    loginAdmin,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await loginAdmin('/app/solicitacoes');

    const board = page.locator('div.hidden.gap-4.overflow-x-auto.lg\\:flex');

    // As 5 colunas do quadro desktop devem estar visíveis simultaneamente
    // (o cabeçalho de cada coluna, não a aba mobile equivalente que também
    // existe no DOM, apenas oculta por CSS abaixo do breakpoint lg).
    for (const label of ['A Fazer', 'Em Andamento', 'Em Validação', 'Concluída', 'Cancelada']) {
      await expect(board.getByText(label, { exact: true })).toBeVisible();
    }

    // O contêiner do quadro não deve exigir rolagem horizontal nesta largura
    // (scrollWidth ~ clientWidth, com pequena margem de tolerância).
    const { scrollWidth, clientWidth } = await board.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth - clientWidth).toBeLessThanOrEqual(2);
  });

  test('em viewport estreita (mas ainda desktop, ≥ lg), a rolagem horizontal volta como fallback', async ({
    page,
    loginAdmin,
  }) => {
    // Abaixo de 1024px o layout já troca para o quadro mobile (abas); aqui
    // fica logo acima do breakpoint `lg`, onde a área de conteúdo (descontando
    // sidebar de 280px) é menor que o mínimo das 5 colunas (5×170px + gaps).
    await page.setViewportSize({ width: 1100, height: 768 });
    await loginAdmin('/app/solicitacoes');

    const board = page.locator('div.hidden.gap-4.overflow-x-auto.lg\\:flex');
    await expect(board).toBeVisible();
    const { scrollWidth, clientWidth } = await board.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('em viewport mobile, mostra abas em vez do quadro horizontal', async ({ page, loginAdmin }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAdmin('/app/solicitacoes');

    await expect(page.locator('div.hidden.gap-4.overflow-x-auto.lg\\:flex')).not.toBeVisible();
    // Barra de abas mobile com os status.
    await expect(page.getByRole('button', { name: /A Fazer/ })).toBeVisible();
  });
});
