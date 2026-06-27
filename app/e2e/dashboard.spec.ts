import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginAdmin }) => {
    await loginAdmin('/app/dashboard');
  });

  test('exibe título e KPIs principais', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(/solicitações no total/i)).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Concluídas')).toBeVisible();
    await expect(page.getByText('Lead time médio')).toBeVisible();
    await expect(page.getByText('Em atraso')).toBeVisible();
  });

  test('exibe seções de distribuição', async ({ page }) => {
    await expect(page.getByText('Distribuição por status')).toBeVisible();
    await expect(page.getByText('Distribuição por tipo')).toBeVisible();
    await expect(page.getByText('Distribuição por prioridade')).toBeVisible();
    await expect(page.getByText('Distribuição detalhada por status')).toBeVisible();
    await expect(page.getByText('Acompanhamento Crítico')).toBeVisible();
  });
});
