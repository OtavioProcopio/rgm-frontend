import { test, expect } from './fixtures';

test.describe('Admin — Tipos de modelo', () => {
  test('cria um tipo e o oferece no cadastro de modelo', async ({ page, loginAdmin }) => {
    const nome = `Tipo PW ${Date.now()}`;
    await loginAdmin('/app/admin/tipos-modelo');

    await page.getByRole('link', { name: 'Novo tipo de modelo' }).click();
    await page.getByLabel('Nome do tipo de modelo').fill(nome);
    await page.getByRole('button', { name: 'Salvar tipo de modelo' }).click();

    await expect(page).toHaveURL(/\/app\/admin\/tipos-modelo$/);
    await expect(page.getByRole('cell', { name: nome })).toBeVisible();

    await page.goto('/app/admin/modelos/novo');
    await expect(page.locator('select[name="tipo"]')).toContainText(nome);
  });
});
