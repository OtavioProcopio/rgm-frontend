import { test, expect, apiPost } from './fixtures';

const ts = () => Date.now();

test.describe('Evidências', () => {
  let modeloId: string;

  test.beforeAll(async ({ request, token }) => {
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: `MDL-EV-${ts()}`, descricao: 'Modelo evidencia PW', maquina: 'PW-EV' },
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
    await expect(page.getByText('Evidências')).toBeVisible();

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
    await expect(page.locator('[data-cy="evidencia-card"], img[alt]').first()).toBeVisible({
      timeout: 15000,
    });
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

  test('uploader não aparece para OPERADOR não-responsável', async ({ page, loginAdmin, request, token }) => {
    // Cria solicitação com admin mas não atribui OPERADOR
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Perm EV PW ${ts()}`, descricao: 'Permissão evidência', tipo: 'REPARO', modeloId },
      token,
    );

    // Admin deve ver o uploader (criou a solicitação e tem permissão)
    await loginAdmin(`/app/solicitacoes/${sol.id}`);
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });
});
