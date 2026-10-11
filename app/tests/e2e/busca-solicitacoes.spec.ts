import { test, expect } from './fixtures';

test.describe('Solicitações — busca textual', () => {
  test('abre na lista com q da URL e avisa quando o texto é curto', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes?q=reparo');
    const busca = page.getByLabel('Buscar');
    await expect(busca).toHaveValue('reparo');

    await busca.fill('a');
    await expect(page.getByText('Digite ao menos 2 caracteres')).toBeVisible();
  });
});
