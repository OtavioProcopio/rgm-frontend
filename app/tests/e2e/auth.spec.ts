import { test, expect, ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from './fixtures';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/app/solicitacoes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('faz login com credenciais válidas e redireciona para o app', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="senha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/\/app\//);
  });

  test('admin vai para /app/admin após login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="senha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/\/app\/admin/);
  });

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="senha"]', 'wrongpassword');
    await page.click('button:has-text("Entrar")');
    await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible();
  });

  test('diz que excedeu as tentativas quando o login responde 429', async ({ page }) => {
    await page.route('**/auth/login', (rota) =>
      rota.fulfill({ status: 429, contentType: 'application/json', body: '{}' }),
    );
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="senha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Entrar")');
    await expect(page.getByRole('alert')).toHaveText(
      'Muitas tentativas. Tente de novo em 1 minuto.',
    );
  });

  test('diz que está sem conexão quando a requisição de login não chega ao servidor', async ({
    page,
  }) => {
    await page.route('**/auth/login', (rota) => rota.abort('connectionrefused'));
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="senha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Entrar")');
    await expect(page.getByRole('alert')).toHaveText(
      'Sem conexão com o servidor. Verifique sua rede e tente de novo.',
    );
  });

  test('mostra e oculta a senha digitada no login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="senha"]', 'segredo123');
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(page.locator('input[name="senha"]')).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(page.locator('input[name="senha"]')).toHaveAttribute('type', 'password');
  });

  test('mostra o nome do produto no título da aba e na tela de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle('Rei Auto Parts');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rei Auto Parts');
  });

  test('faz logout e redireciona para /login', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin');
    await page.getByRole('button', { name: /^Menu do usuário/ }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('navega para perfil e exibe dados do usuário', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin');
    // Perfil agora fica no header — clica no link do nome do usuário
    await page.goto('/app/perfil');
    await expect(page).toHaveURL(/\/app\/perfil/);
    // O selo mostra o rótulo do perfil (não o valor da API); o nome do usuário de teste também é "Administrador".
    await expect(
      page
        .getByRole('main')
        .locator('span')
        .filter({ hasText: /^Administrador$/ }),
    ).toBeVisible();
    await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  });

  test('altera senha e valida comportamentos de erro', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/perfil');

    // Sem preencher
    await page.click('button:has-text("Atualizar Senha")');
    await expect(page.getByText('Senha atual é obrigatória')).toBeVisible();

    // Senha incorreta
    await page.fill('input[name="senhaAtual"]', 'senha_errada');
    await page.fill('input[name="novaSenha"]', 'novasenha123');
    await page.fill('input[name="confirmarNovaSenha"]', 'novasenha123');
    await page.click('button:has-text("Atualizar Senha")');
    await expect(page.getByText('Senha atual incorreta')).toBeVisible();

    // Senhas não coincidem
    await page.fill('input[name="senhaAtual"]', ADMIN_PASSWORD);
    await page.fill('input[name="novaSenha"]', 'novasenha123');
    await page.fill('input[name="confirmarNovaSenha"]', 'diferente456');
    await page.click('button:has-text("Atualizar Senha")');
    await expect(page.getByText('As senhas não coincidem')).toBeVisible();

    // Altera com sucesso e restaura
    await page.fill('input[name="senhaAtual"]', ADMIN_PASSWORD);
    await page.fill('input[name="novaSenha"]', 'novasenha123');
    await page.fill('input[name="confirmarNovaSenha"]', 'novasenha123');
    await page.click('button:has-text("Atualizar Senha")');
    await expect(page.getByText('Senha alterada com sucesso')).toBeVisible();

    await page.fill('input[name="senhaAtual"]', 'novasenha123');
    await page.fill('input[name="novaSenha"]', ADMIN_PASSWORD);
    await page.fill('input[name="confirmarNovaSenha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Atualizar Senha")');
    await expect(page.getByText('Senha alterada com sucesso')).toBeVisible();
  });

  test('token JWT é armazenado no localStorage após login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="senha"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/\/app\//);

    const token = await page.evaluate(() => localStorage.getItem('rgm.accessToken'));
    expect(token).toBeTruthy();
  });

  test('health check da API está OK', async ({ request }) => {
    const res = await request.get(`${API_URL.replace('/api', '')}/actuator/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('UP');
  });
});
