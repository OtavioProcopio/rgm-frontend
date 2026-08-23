/**
 * Testa a rastreabilidade bidirecional modelo ↔ solicitação:
 * - Detalhe da solicitação exibe card do modelo com link
 * - Detalhe do modelo lista todas as solicitações criadas para ele
 */
import { test, expect, apiPost, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Rastreabilidade modelo ↔ solicitação', () => {
  let modeloId: string;
  let modeloCodigo: string;

  test.beforeAll(async ({ request, token }) => {
    modeloCodigo = `MDL-RAST-${ts()}`;
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: modeloCodigo, descricao: 'Modelo rastreabilidade PW', maquina: MAQUINA_CATALOGO },
      token,
    );
    modeloId = modelo.id;
  });

  test('detalhe da solicitação exibe card do modelo com link', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Rast Sol ${ts()}`, descricao: 'Rastreabilidade', tipo: 'REPARO', modeloId },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${sol.id}`);

    // Card de modelo deve aparecer
    await expect(page.getByText('Modelo (rastreabilidade)')).toBeVisible();
    await expect(page.getByText(modeloCodigo)).toBeVisible();

    // Link deve apontar para o detalhe do modelo
    const link = page.getByRole('link', { name: new RegExp(modeloCodigo) });
    await expect(link).toHaveAttribute('href', new RegExp(modeloId));
  });

  test('detalhe do modelo lista solicitações criadas para ele', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const titulo = `Sol Modelo PW ${ts()}`;
    await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo, descricao: 'Listada no modelo', tipo: 'INSPECAO', modeloId },
      token,
    );

    await loginAdmin(`/app/admin/modelos/${modeloId}`);

    // Seção "Solicitações" deve aparecer
    await expect(page.getByText(/Solicitações \(\d+\)/)).toBeVisible();
    await expect(page.getByRole('link', { name: titulo })).toBeVisible();
  });

  test('link de solicitação no modelo navega para o detalhe', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const titulo = `Nav Sol PW ${ts()}`;
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo, descricao: 'Navegação', tipo: 'REPARO', modeloId },
      token,
    );

    await loginAdmin(`/app/admin/modelos/${modeloId}`);

    await page.getByRole('link', { name: titulo }).first().click();

    await expect(page).toHaveURL(new RegExp(sol.id));
    await expect(page.getByText(titulo)).toBeVisible();
  });
});
