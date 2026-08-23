import { test, expect, apiPost, apiCriarUsuario, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Evidências', () => {
  let modeloId: string;

  test.beforeAll(async ({ request, token }) => {
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: `MDL-EV-${ts()}`, descricao: 'Modelo evidencia PW', maquina: MAQUINA_CATALOGO },
      token,
    );
    modeloId = modelo.id;
  });

  test('faz upload de imagem e exibe na lista de evidências', async ({ page, loginAdmin, request, token }) => {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Evidencia PW ${ts()}`, descricao: 'Teste upload PW', tipo: 'REPARO', modeloId },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${sol.id}`);
    await expect(page.getByRole('heading', { name: 'Evidências' })).toBeVisible();

    // PNG sintético (1x1 pixel)
    const pngBytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'evidencia-playwright.png',
      mimeType: 'image/png',
      buffer: pngBytes,
    });

    // Aguarda aparecer a evidência na lista
    await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 15000 });
  });

  test('rejeita arquivo com tipo inválido', async ({ page, loginAdmin, request, token }) => {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Ev Inv PW ${ts()}`, descricao: 'Tipo inválido', tipo: 'REPARO', modeloId },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${sol.id}`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'arquivo.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('conteudo texto'),
    });

    await expect(page.getByText('Tipo de arquivo não permitido')).toBeVisible();
  });

  test('uploader aparece para o admin que abriu a solicitação', async ({ page, loginAdmin, request, token }) => {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Perm EV Admin PW ${ts()}`, descricao: 'Permissão evidência', tipo: 'REPARO', modeloId },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${sol.id}`);
    await expect(page.getByRole('button', { name: 'Anexar arquivo' })).toBeVisible();
  });

  test('uploader não aparece para OPERADOR não-responsável e não-autor', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    // Solicitação aberta pelo admin, sem nenhum responsável atribuído.
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Perm EV Op PW ${ts()}`, descricao: 'Permissão evidência', tipo: 'REPARO', modeloId },
      token,
    );

    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());
    await loginAs(operador.email, operador.senha, `/app/solicitacoes/${sol.id}`);

    await expect(page.getByRole('heading', { name: 'Evidências' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Anexar arquivo' })).toHaveCount(0);
  });
});
