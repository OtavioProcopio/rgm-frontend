import {
  test,
  expect,
  apiLogin,
  apiPatch,
  apiPost,
  apiCriarUsuario,
  MAQUINA_CATALOGO,
} from './fixtures';

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

  test('faz upload de imagem e exibe na lista de evidências', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
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

  test('uploader aparece para o admin que abriu a solicitação', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      {
        titulo: `Perm EV Admin PW ${ts()}`,
        descricao: 'Permissão evidência',
        tipo: 'REPARO',
        modeloId,
      },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${sol.id}`);
    await expect(page.getByRole('button', { name: 'Anexar arquivo' })).toBeVisible();
  });

  test('OPERADOR sem relação com a solicitação não abre o detalhe', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    // Arrange
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      {
        titulo: `Perm EV Op PW ${ts()}`,
        descricao: 'Permissão evidência',
        tipo: 'REPARO',
        modeloId,
      },
      token,
    );
    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());

    // Act
    await loginAs(operador.email, operador.senha, `/app/solicitacoes/${sol.id}`);

    // Assert
    await expect(page.getByText('Você não tem acesso a esta solicitação.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar ao quadro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Evidências' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Anexar arquivo' })).toHaveCount(0);
  });

  test('autor OPERADOR que cancelou a própria solicitação em A Fazer vê as evidências da encerrada sem o botão de anexar', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    // Arrange
    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());
    const tokenDoOperador = await apiLogin(request, operador.email, operador.senha);
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      {
        titulo: `Perm EV Autor PW ${ts()}`,
        descricao: 'Autor encerrada',
        tipo: 'REPARO',
        modeloId,
      },
      tokenDoOperador,
    );
    await apiPatch(
      request,
      `/solicitacoes/${sol.id}/cancelar`,
      { motivo: 'Aberta por engano' },
      tokenDoOperador,
    );

    // Act
    await loginAs(operador.email, operador.senha, `/app/solicitacoes/${sol.id}`);

    // Assert
    await expect(page.getByRole('heading', { name: 'Evidências' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Anexar arquivo' })).toHaveCount(0);
  });
});
