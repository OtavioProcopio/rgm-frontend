/**
 * Evidência SERVICO_REALIZADO/CONCLUSAO em imagem, anexada a uma solicitação
 * com modelo vinculado, é copiada automaticamente para a galeria do modelo —
 * mesmo que quem anexou não tenha permissão de gestão de galeria. Ver
 * openspec/changes/evidencia-vira-foto-galeria (backend).
 */
import { test, expect, apiCriarUsuario, apiPatch, apiPost, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('Evidência vira foto de galeria automaticamente', () => {
  let modeloId: string;
  let modeloCodigo: string;

  test.beforeAll(async ({ request, token }) => {
    modeloCodigo = `MDL-GAL-${ts()}`;
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: modeloCodigo, descricao: 'Modelo galeria automática E2E', maquina: MAQUINA_CATALOGO },
      token,
    );
    modeloId = modelo.id;
  });

  test('OPERADOR sem permissão de galeria envia evidência SERVICO_REALIZADO e ela aparece na galeria do modelo', async ({
    page,
    loginAs,
    loginAdmin,
    request,
    token,
  }) => {
    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());

    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Galeria automática E2E ${ts()}`, descricao: 'Teste E2E', tipo: 'REPARO', modeloId },
      token,
    );
    await apiPatch(
      request,
      `/solicitacoes/${sol.id}/triar`,
      { prioridade: 'MEDIA', responsavelIds: [operador.id] },
      token,
    );

    await loginAs(operador.email, operador.senha, `/app/solicitacoes/${sol.id}`);

    // Único caminho da UI que anexa evidência do tipo SERVICO_REALIZADO: o
    // modal de "Enviar para validação" (REPARO exige essa evidência).
    await page.click('button:has-text("Enviar para validação")');
    const modal = page.locator('form').filter({ hasText: 'Enviar para validação' });
    await modal.locator('textarea[name="comentario"]').fill('Serviço realizado pelo operador E2E');
    await modal.locator('input[type="file"]').setInputFiles({
      name: 'servico-realizado.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    });
    await expect(page.getByText('Evidência anexada com sucesso')).toBeVisible({ timeout: 15000 });
    await modal.getByRole('button', { name: 'Enviar para validação' }).click();
    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();

    // A galeria do modelo, gerida por GESTOR/ADMIN, ganhou a foto — mesmo o
    // OPERADOR não tendo permissão nenhuma de gestão de galeria. Troca de
    // sessão para ADMIN, que é quem tem acesso à tela de galeria.
    await loginAdmin(`/app/admin/modelos/${modeloId}`);
    // Miniatura da galeria só expõe a identificação via alt/aria-label.
    await expect(page.getByRole('button', { name: /Ver foto: Serviço realizado/i })).toBeVisible();
  });

  test('evidência do tipo GERAL não alimenta a galeria (apenas SERVICO_REALIZADO/CONCLUSAO)', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    // Modelo isolado (novo) para não depender da galeria já populada pelo
    // teste anterior neste describe.
    const modeloIsolado = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: `MDL-GAL-GERAL-${ts()}`, descricao: 'Isolado para teste GERAL', maquina: MAQUINA_CATALOGO },
      token,
    );
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo: `Galeria GERAL não entra E2E ${ts()}`, descricao: 'Teste E2E', tipo: 'REPARO', modeloId: modeloIsolado.id },
      token,
    );

    // Evidência GERAL via API (mesmo caminho do uploader simples da tela de
    // detalhe, que não oferece escolha de tipo).
    const res = await request.post(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/solicitacoes/${sol.id}/evidencias`,
      {
        headers: { Authorization: `Bearer ${token}` },
        multipart: { file: { name: 'geral.png', mimeType: 'image/png', buffer: PNG_1X1 } },
      },
    );
    expect(res.ok()).toBeTruthy();

    await loginAdmin(`/app/admin/modelos/${modeloIsolado.id}`);
    await expect(page.getByText('Nenhuma foto')).toBeVisible();
  });
});
