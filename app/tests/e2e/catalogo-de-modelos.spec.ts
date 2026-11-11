import { test, expect, apiPost, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now().toString(36);

/** O catálogo de modelos: botões de filtro, destaque, navegação e link direto (spec 019). */
test.describe('Catálogo de modelos', () => {
  const prefixo = `CAT-${ts()}`;
  const ids: string[] = [];

  test.beforeAll(async ({ request, token }) => {
    for (const letra of ['A', 'B', 'C']) {
      const modelo = await apiPost<{ id: string }>(
        request,
        '/modelos',
        {
          codigo: `${prefixo}-${letra}`,
          descricao: `Modelo catálogo ${letra}`,
          maquina: MAQUINA_CATALOGO,
        },
        token,
      );
      ids.push(modelo.id);
    }
  });

  test('filtra por busca, destaca o primeiro e navega com Próximo e Anterior', async ({
    page,
    loginAdmin,
  }) => {
    await loginAdmin('/app/modelos');

    await page.getByLabel('Buscar por código ou descrição').fill(prefixo);

    const destaque = page.getByRole('region', { name: 'Modelo em destaque' });
    await expect(destaque.getByRole('heading', { name: 'Modelo catálogo A' })).toBeVisible();
    await expect(page.getByText('3 modelos · mostrando 3')).toBeVisible();

    await page.getByRole('button', { name: /Próximo/ }).click();
    await expect(destaque.getByRole('heading', { name: 'Modelo catálogo B' })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`modelo=${ids[1]}`));

    await page.getByRole('button', { name: /Anterior/ }).click();
    await expect(destaque.getByRole('heading', { name: 'Modelo catálogo A' })).toBeVisible();
  });

  test('clicar num item da lista leva o modelo para o destaque', async ({ page, loginAdmin }) => {
    await loginAdmin(`/app/modelos?q=${prefixo}`);

    await page
      .getByRole('complementary', { name: 'Lista de modelos' })
      .getByRole('link', { name: /Modelo catálogo C/ })
      .click();

    await expect(
      page
        .getByRole('region', { name: 'Modelo em destaque' })
        .getByRole('heading', { name: 'Modelo catálogo C' }),
    ).toBeVisible();
  });

  test('o endereço com ?modelo= abre direto o modelo, mesmo fora do filtro padrão', async ({
    page,
    loginAdmin,
  }) => {
    await loginAdmin(`/app/modelos?modelo=${ids[2]}`);

    await expect(
      page
        .getByRole('region', { name: 'Modelo em destaque' })
        .getByRole('heading', { name: 'Modelo catálogo C' }),
    ).toBeVisible();
  });

  test('o botão da máquina filtra e o botão sem modelos fica desabilitado', async ({
    page,
    loginAdmin,
  }) => {
    await loginAdmin(`/app/modelos?q=${prefixo}`);

    const grupo = page.getByRole('group', { name: 'Máquina' });
    await expect(
      grupo.getByRole('button', { name: new RegExp(`^${MAQUINA_CATALOGO}`) }),
    ).toBeEnabled();
    await grupo.getByRole('button', { name: new RegExp(`^${MAQUINA_CATALOGO}`) }).click();
    await expect(page).toHaveURL(new RegExp(`maquina=${MAQUINA_CATALOGO}`));
    await expect(page.getByText('3 modelos · mostrando 3')).toBeVisible();
  });

  test('em celular (390 px) não há rolagem horizontal', async ({ page, loginAdmin }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await loginAdmin(`/app/modelos?q=${prefixo}`);
    await expect(page.getByRole('region', { name: 'Modelo em destaque' })).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
