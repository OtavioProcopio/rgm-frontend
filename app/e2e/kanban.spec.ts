import { test, expect, apiPost, apiPatch, apiGet, apiAnexarServicoRealizado, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Fluxo Kanban — Solicitações', () => {
  let modeloId: string;
  let modeloCodigo: string;
  let modeloDescricao: string;
  let responsavelId: string;

  test.beforeAll(async ({ request, token }) => {
    // Cria modelo para usar nos testes
    modeloCodigo = `MDL-KBN-${ts()}`;
    modeloDescricao = 'Modelo kanban PW';
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: modeloCodigo, descricao: modeloDescricao, maquina: MAQUINA_CATALOGO },
      token,
    );
    modeloId = modelo.id;

    // Pega um responsável válido
    const page_ = await apiGet<{ content: Array<{ id: string; perfil: string }> }>(
      request,
      '/admin/usuarios?size=20',
      token,
    );
    const responsavel = page_.content.find((u) => u.perfil === 'OPERADOR' || u.perfil === 'GESTOR');
    responsavelId = responsavel?.id ?? '';
  });

  async function criarSolicitacao(request: Parameters<typeof apiPost>[0], token: string, titulo: string) {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo, descricao: 'Via API Playwright', tipo: 'REENGENHARIA', modeloId },
      token,
    );
    return sol.id;
  }

  async function triar(request: Parameters<typeof apiPatch>[0], token: string, id: string) {
    await apiPatch(request, `/solicitacoes/${id}/triar`, { prioridade: 'MEDIA', responsavelIds: [responsavelId] }, token);
  }

  async function selecionarModeloNoCombobox(page: import('@playwright/test').Page) {
    await page.getByLabel('Modelo', { exact: true }).click();
    await page.getByRole('button', { name: new RegExp(`${modeloCodigo} - ${modeloDescricao}`) }).click();
  }

  /** Escopo do modal "Enviar para validação" — a página também tem seu próprio uploader de evidências. */
  function enviarValidacaoModal(page: import('@playwright/test').Page) {
    return page.locator('form').filter({ hasText: 'Descrição do serviço realizado' });
  }

  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );

  test('abre solicitação via UI e exibe status A fazer', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `UI PW ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Descrição via Playwright');
    await page.selectOption('select[name="tipo"]', 'REENGENHARIA');
    await selecionarModeloNoCombobox(page);
    await page.click('button:has-text("Abrir solicitação")');

    await expect(page).toHaveURL(/\/app\/solicitacoes\/[a-f0-9-]+$/);
    await expect(page.getByText('A fazer')).toBeVisible();
  });

  test('lista solicitações contém a criada', async ({ page, loginAdmin, request, token }) => {
    const titulo = `Lista PW ${ts()}`;
    await criarSolicitacao(request, token, titulo);

    await loginAdmin('/app/solicitacoes');
    // Vista padrão é o Kanban; troca para a lista e filtra pelo modelo do
    // teste (a lista não tem paginação suficiente para achar item recente
    // sem filtro, dado o volume de dados acumulado por outras suítes E2E).
    await page.click('button:has-text("Lista")');
    await page.getByLabel('Modelo', { exact: true }).selectOption(modeloId);
    await expect(page.getByText(titulo)).toBeVisible();
  });

  test('triagem: A_FAZER → EM_ANDAMENTO', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Triagem PW ${ts()}`);
    await loginAdmin(`/app/solicitacoes/${id}`);

    await expect(page.getByText('A fazer')).toBeVisible();
    await page.click('button:has-text("Triar")');
    await expect(page.getByText('Triar solicitação')).toBeVisible();

    await page.selectOption('select[name="prioridade"]', 'ALTA');
    await page.locator('input[name="responsavelIds"]').first().check();
    await page.click('button:has-text("Confirmar triagem")');

    await expect(page.getByText('Em andamento', { exact: true })).toBeVisible();
  });

  test('envio para validação: EM_ANDAMENTO → EM_VALIDACAO (exige evidência para REENGENHARIA)', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const id = await criarSolicitacao(request, token, `Validar PW ${ts()}`);
    await triar(request, token, id);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await page.click('button:has-text("Enviar para validação")');
    const modal = enviarValidacaoModal(page);
    await expect(page.getByRole('heading', { name: 'Enviar para validação' })).toBeVisible();

    // REENGENHARIA exige evidência de serviço realizado — o botão de enviar
    // deve começar desabilitado até a evidência ser anexada.
    const enviar = modal.getByRole('button', { name: 'Enviar para validação' });
    await expect(enviar).toBeDisabled();

    await modal.locator('textarea[name="comentario"]').fill('Serviço realizado conforme solicitado');
    await modal.locator('input[type="file"]').setInputFiles({
      name: 'servico.png',
      mimeType: 'image/png',
      buffer: pngBytes,
    });
    await expect(page.getByText('Evidência anexada com sucesso')).toBeVisible({ timeout: 15000 });
    await expect(enviar).toBeEnabled();
    await enviar.click();

    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();
  });

  test('devolver: EM_VALIDACAO → EM_ANDAMENTO', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Devolver PW ${ts()}`);
    await triar(request, token, id);
    await apiAnexarServicoRealizado(request, id, token);
    await apiPatch(
      request,
      `/solicitacoes/${id}/enviar-validacao`,
      { comentario: 'Pronto para validação' },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${id}`);
    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();

    await page.click('button:has-text("Devolver")');
    await expect(page.getByText('Devolver solicitação')).toBeVisible();
    await page.fill('textarea[name="motivo"]', 'Falta ajuste antes de validar');
    await page.click('button:has-text("Confirmar devolução")');

    await expect(page.getByText('Em andamento', { exact: true })).toBeVisible();
  });

  test('concluir: EM_VALIDACAO → CONCLUIDA', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Concluir PW ${ts()}`);
    await triar(request, token, id);
    await apiAnexarServicoRealizado(request, id, token);
    await apiPatch(
      request,
      `/solicitacoes/${id}/enviar-validacao`,
      { comentario: 'Pronto para validação' },
      token,
    );

    await loginAdmin(`/app/solicitacoes/${id}`);
    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();

    await page.click('button:has-text("Encerrar")');
    await page.locator('textarea[name="comentario"]').first().fill('Concluído via Playwright');
    await page.click('button:has-text("Concluir")');

    await expect(page.getByText('Concluída', { exact: true })).toBeVisible();
  });

  test('cancelar: EM_ANDAMENTO → CANCELADA', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Cancelar PW ${ts()}`);
    await triar(request, token, id);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await page.click('button:has-text("Cancelar")');
    await page.locator('textarea[name="comentario"]').first().fill('Cancelado via Playwright');
    await page.click('button:has-text("Cancelar solicitação")');

    await expect(page.getByText('Cancelada', { exact: true })).toBeVisible();
  });

  test('comentário aparece no histórico', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Comentário PW ${ts()}`);
    await loginAdmin(`/app/solicitacoes/${id}`);

    await page.fill('textarea[name="comentario"]', 'Comentário via Playwright');
    await page.click('button:has-text("Enviar comentário")');

    await expect(page.getByText('Histórico de atividades')).toBeVisible();
    await expect(page.getByText('Comentário via Playwright')).toBeVisible();
  });

  test('fluxo completo A_FAZER → CONCLUIDA', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `Fluxo Completo PW ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Teste fluxo completo Playwright');
    await page.selectOption('select[name="tipo"]', 'REENGENHARIA');
    await selecionarModeloNoCombobox(page);
    await page.click('button:has-text("Abrir solicitação")');

    await expect(page.getByText('A fazer')).toBeVisible();

    // Triagem
    await page.click('button:has-text("Triar")');
    await page.selectOption('select[name="prioridade"]', 'URGENTE');
    await page.locator('input[name="responsavelIds"]').first().check();
    await page.click('button:has-text("Confirmar triagem")');
    await expect(page.getByText('Em andamento', { exact: true })).toBeVisible();

    // Validação (com evidência, exigida para REENGENHARIA)
    await page.click('button:has-text("Enviar para validação")');
    const modal = enviarValidacaoModal(page);
    await modal.locator('textarea[name="comentario"]').fill('Serviço concluído');
    await modal.locator('input[type="file"]').setInputFiles({
      name: 'servico.png',
      mimeType: 'image/png',
      buffer: pngBytes,
    });
    await expect(page.getByText('Evidência anexada com sucesso')).toBeVisible({ timeout: 15000 });
    await modal.getByRole('button', { name: 'Enviar para validação' }).click();
    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();

    // Conclusão
    await page.click('button:has-text("Encerrar")');
    await page.locator('textarea[name="comentario"]').first().fill('Fluxo completo concluído');
    await page.click('button:has-text("Concluir")');
    await expect(page.getByText('Concluída', { exact: true })).toBeVisible();

    await expect(page.getByText('Histórico de atividades')).toBeVisible();
  });
});
