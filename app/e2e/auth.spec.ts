import { test, expect, ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from './fixtures';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
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

  test('faz logout e redireciona para /login', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin');
    await page.click('button:has-text("Sair")');
    await expect(page).toHaveURL(/\/login/);
  });

  test('navega para perfil e exibe dados do usuário', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/admin');
    // Perfil agora fica no header — clica no link do nome do usuário
    await page.goto('/app/perfil');
    await expect(page).toHaveURL(/\/app\/perfil/);
    await expect(page.getByText('ADMINISTRADOR')).toBeVisible();
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
