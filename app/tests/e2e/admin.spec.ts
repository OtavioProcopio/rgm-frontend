import { test, expect, apiPost, API_URL, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Admin — Modelos', () => {
  test('cria um novo modelo e oferece a galeria inline antes de navegar', async ({
    page,
    loginAdmin,
  }) => {
    const codigo = `MDL-PW-${ts()}`;
    await loginAdmin('/app/admin/modelos/novo');

    await page.fill('input[name="codigo"]', codigo);
    await page.fill('input[name="descricao"]', 'Modelo criado pelo Playwright');
    await page.selectOption('select[name="maquina"]', MAQUINA_CATALOGO);

    await page.click('button:has-text("Salvar modelo")');

    // Passo 2: cadastro concluído, oferece a galeria inline (sem navegar ainda).
    await expect(page.getByText('Modelo cadastrado')).toBeVisible();

    // Segue para o detalhe sem adicionar fotos.
    await page.click('button:has-text("Ir para o detalhe do modelo")');
    await expect(page).toHaveURL(/\/app\/admin\/modelos\/[a-f0-9-]+$/);
    await expect(page.getByText(codigo)).toBeVisible();
  });

  test('exibe detalhe do modelo com link de edição', async ({
    page,
    loginAdmin,
    token,
    request,
  }) => {
    const codigo = `MDL-DT-${ts()}`;
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo, descricao: 'Detalhe PW', maquina: MAQUINA_CATALOGO },
      token,
    );

    await loginAdmin(`/app/admin/modelos/${modelo.id}`);

    await expect(page.getByText(codigo)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Editar' })).toBeVisible();
  });

  test('desativa e reativa um modelo', async ({ page, loginAdmin, token, request }) => {
    const codigo = `MDL-AT-${ts()}`;
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo, descricao: 'Ativar/desativar', maquina: MAQUINA_CATALOGO },
      token,
    );

    await loginAdmin(`/app/admin/modelos/${modelo.id}`);

    await page.getByRole('button', { name: 'Mais ações' }).click();
    await page.getByRole('menuitem', { name: 'Desativar', exact: true }).click();
    await expect(page.getByText('Desativar modelo')).toBeVisible();
    await page.getByRole('button', { name: 'Desativar', exact: true }).click();
    await expect(page.getByText('Inativo')).toBeVisible();

    await page.getByRole('button', { name: 'Mais ações' }).click();
    await page.getByRole('menuitem', { name: 'Ativar', exact: true }).click();
    await expect(page.getByText('Ativar modelo')).toBeVisible();
    await page.getByRole('button', { name: 'Ativar', exact: true }).click();
    await expect(page.getByText('Ativo').first()).toBeVisible();
  });
});

test.describe('Admin — Usuários', () => {
  test('exibe lista de usuários', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin/usuarios');
    await expect(page.getByRole('heading', { name: /usuário/i })).toBeVisible();
  });

  test('cria um usuário GESTOR', async ({ page, loginAdmin }) => {
    const email = `gestor.pw.${ts()}@rgm.com`;
    await loginAdmin('/app/admin/usuarios/novo');

    await page.fill('input[name="nome"]', `Gestor Playwright ${ts()}`);
    await page.selectOption('select[name="perfil"]', 'GESTOR');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="senha"]', 'senha123');

    await page.click('button:has-text("Salvar usuário")');

    await expect(page).toHaveURL(/\/app\/admin\/usuarios/);
    await expect(page.getByRole('cell', { name: email })).toBeVisible();
  });

  test('cria um usuário OPERADOR', async ({ page, loginAdmin }) => {
    const email = `operador.pw.${ts()}@rgm.com`;
    await loginAdmin('/app/admin/usuarios/novo');

    await page.fill('input[name="nome"]', `Operador PW ${ts()}`);
    await page.selectOption('select[name="perfil"]', 'OPERADOR');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="senha"]', 'senha123');

    await page.click('button:has-text("Salvar usuário")');

    await expect(page).toHaveURL(/\/app\/admin\/usuarios/);
    await expect(page.getByRole('cell', { name: email })).toBeVisible();
  });

  test('cria um prestador EXTERNO (sem email/senha)', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin/usuarios/novo');

    await page.fill('input[name="nome"]', `Prestador PW ${ts()}`);
    await page.selectOption('select[name="perfil"]', 'EXTERNO');

    await expect(page.getByText('Prestador externo não acessa o sistema')).toBeVisible();
    await page.click('button:has-text("Salvar usuário")');
    await expect(page).toHaveURL(/\/app\/admin\/usuarios/);
  });

  const URL_PROMETHEUS = `${API_URL.replace('/api', '')}/actuator/prometheus`;

  test('Prometheus recusa quem não tem a credencial de coleta', async ({ request }) => {
    // Act
    const res = await request.get(URL_PROMETHEUS);

    // Assert
    expect(res.status()).toBe(401);
  });

  test('Prometheus responde 200 com a credencial de coleta', async ({ request }) => {
    // Arrange
    const usuario = process.env.MONITORAMENTO_COLETA_USUARIO;
    const senha = process.env.MONITORAMENTO_COLETA_SENHA;
    test.skip(
      !usuario || !senha,
      'MONITORAMENTO_COLETA_USUARIO/SENHA não definidos neste ambiente',
    );
    const credencial = Buffer.from(`${usuario}:${senha}`).toString('base64');

    // Act
    const res = await request.get(URL_PROMETHEUS, {
      headers: { Authorization: `Basic ${credencial}` },
    });

    // Assert
    expect(res.status()).toBe(200);
  });

  test('Prometheus expõe as métricas da JVM com a credencial de coleta', async ({ request }) => {
    // Arrange
    const usuario = process.env.MONITORAMENTO_COLETA_USUARIO;
    const senha = process.env.MONITORAMENTO_COLETA_SENHA;
    test.skip(
      !usuario || !senha,
      'MONITORAMENTO_COLETA_USUARIO/SENHA não definidos neste ambiente',
    );
    const credencial = Buffer.from(`${usuario}:${senha}`).toString('base64');

    // Act
    const res = await request.get(URL_PROMETHEUS, {
      headers: { Authorization: `Basic ${credencial}` },
    });

    // Assert
    expect(await res.text()).toContain('jvm_memory');
  });
});
