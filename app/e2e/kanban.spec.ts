import { test, expect, apiPost, apiPatch } from './fixtures';

const ts = () => Date.now();

test.describe('Fluxo Kanban — Solicitações', () => {
  let modeloId: string;
  let responsavelId: string;

  test.beforeAll(async ({ request, token }) => {
    // Cria modelo para usar nos testes
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: `MDL-KBN-${ts()}`, descricao: 'Modelo kanban PW', maquina: 'Vick' },
      token,
    );
    modeloId = modelo.id;

    // Pega um responsável válido
    const res = await request.get(`${process.env.API_URL ?? 'http://localhost:8080/api'}/admin/usuarios?size=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const page_ = await res.json();
    const responsavel = (page_.content as Array<{ id: string; perfil: string }>).find(
      (u) => u.perfil === 'OPERADOR' || u.perfil === 'GESTOR',
    );
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

  test('abre solicitação via UI e exibe status A fazer', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `UI PW ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Descrição via Playwright');
    await page.selectOption('select[name="tipo"]', 'REENGENHARIA');
    await page.fill('input[name="modeloId"]', modeloId);
    await page.click('button:has-text("Abrir solicitação")');

    await expect(page).toHaveURL(/\/app\/solicitacoes\/[a-f0-9-]+$/);
    await expect(page.getByText('A fazer')).toBeVisible();
  });

  test('lista solicitações contém a criada', async ({ page, loginAdmin, request, token }) => {
    const titulo = `Lista PW ${ts()}`;
    await criarSolicitacao(request, token, titulo);

    await loginAdmin('/app/solicitacoes');
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

    await expect(page.getByText('Em andamento')).toBeVisible();
  });

  test('envio para validação: EM_ANDAMENTO → EM_VALIDACAO', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Validar PW ${ts()}`);
    await triar(request, token, id);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await page.click('button:has-text("Enviar para validação")');
    await expect(page.getByText('Em validação')).toBeVisible();
  });

  test('devolver: EM_VALIDACAO → EM_ANDAMENTO', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Devolver PW ${ts()}`);
    await triar(request, token, id);
    await apiPatch(request, `/solicitacoes/${id}/enviar-validacao`, null, token);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await expect(page.getByText('Em validação')).toBeVisible();

    await page.click('button:has-text("Devolver")');
    await expect(page.getByText('Devolver solicitação')).toBeVisible();
    await page.click('button:has-text("Confirmar devolução")');

    await expect(page.getByText('Em andamento')).toBeVisible();
  });

  test('concluir: EM_VALIDACAO → CONCLUIDA', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Concluir PW ${ts()}`);
    await triar(request, token, id);
    await apiPatch(request, `/solicitacoes/${id}/enviar-validacao`, null, token);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await expect(page.getByText('Em validação')).toBeVisible();

    await page.click('button:has-text("Encerrar")');
    await page.locator('textarea[name="comentario"]').first().fill('Concluído via Playwright');
    await page.click('button:has-text("Concluir")');

    await expect(page.getByText('Concluída')).toBeVisible();
  });

  test('cancelar: EM_ANDAMENTO → CANCELADA', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Cancelar PW ${ts()}`);
    await triar(request, token, id);

    await loginAdmin(`/app/solicitacoes/${id}`);
    await page.click('button:has-text("Cancelar")');
    await page.locator('textarea[name="comentario"]').first().fill('Cancelado via Playwright');
    await page.click('button:has-text("Cancelar solicitação")');

    await expect(page.getByText('Cancelada')).toBeVisible();
  });

  test('comentário aparece no histórico', async ({ page, loginAdmin, request, token }) => {
    const id = await criarSolicitacao(request, token, `Comentário PW ${ts()}`);
    await loginAdmin(`/app/solicitacoes/${id}`);

    await page.fill('textarea[name="comentario"]', 'Comentário via Playwright');
    await page.click('button:has-text("Enviar comentário")');

    await expect(page.getByText('Histórico de atividades')).toBeVisible();
  });

  test('fluxo completo A_FAZER → CONCLUIDA', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `Fluxo Completo PW ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Teste fluxo completo Playwright');
    await page.selectOption('select[name="tipo"]', 'REENGENHARIA');
    await page.fill('input[name="modeloId"]', modeloId);
    await page.click('button:has-text("Abrir solicitação")');

    await expect(page.getByText('A fazer')).toBeVisible();

    // Triagem
    await page.click('button:has-text("Triar")');
    await page.selectOption('select[name="prioridade"]', 'URGENTE');
    await page.locator('input[name="responsavelIds"]').first().check();
    await page.click('button:has-text("Confirmar triagem")');
    await expect(page.getByText('Em andamento')).toBeVisible();

    // Validação
    await page.click('button:has-text("Enviar para validação")');
    await expect(page.getByText('Em validação')).toBeVisible();

    // Conclusão
    await page.click('button:has-text("Encerrar")');
    await page.locator('textarea[name="comentario"]').first().fill('Fluxo completo concluído');
    await page.click('button:has-text("Concluir")');
    await expect(page.getByText('Concluída')).toBeVisible();

    await expect(page.getByText('Histórico de atividades')).toBeVisible();
  });
});
