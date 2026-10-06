import { test, expect, apiPost, API_URL, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Admin — Modelos', () => {
  test('cria um novo modelo e oferece a galeria inline antes de navegar', async ({ page, loginAdmin }) => {
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

  test('exibe detalhe do modelo com link de edição', async ({ page, loginAdmin, token, request }) => {
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

    await page.getByRole('button', { name: 'Desativar', exact: true }).click();
    await expect(page.getByText('Desativar modelo')).toBeVisible();
    await page.getByRole('button', { name: 'Desativar', exact: true }).last().click();
    await expect(page.getByText('Inativo')).toBeVisible();

    await page.getByRole('button', { name: 'Ativar', exact: true }).click();
    await expect(page.getByText('Ativar modelo')).toBeVisible();
    await page.getByRole('button', { name: 'Ativar', exact: true }).last().click();
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

  test('API de métricas Prometheus está acessível', async ({ request }) => {
    // Valida que o endpoint de métricas está exposto
    const res = await request.get(`${API_URL.replace('/api', '')}/actuator/prometheus`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('jvm_memory');
  });
});
