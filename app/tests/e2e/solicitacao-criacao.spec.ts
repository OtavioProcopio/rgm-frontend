/**
 * Fluxo completo da solicitação do tipo CRIACAO: abertura restrita a
 * GESTOR/ADMINISTRADOR, sem modelo vinculado, percorre o Kanban normalmente e,
 * ao ser concluída, cria o Modelo e vincula o modeloId — ver
 * openspec/changes/solicitacao-tipo-criacao-modelo (backend).
 */
import { test, expect, apiCriarUsuario, apiPatch, apiPost, MAQUINA_CATALOGO } from './fixtures';

const ts = () => Date.now();

test.describe('Solicitação tipo CRIACAO', () => {
  let modeloExistenteCodigo: string;
  let modeloExistenteDescricao: string;

  test.beforeAll(async ({ request, token }) => {
    modeloExistenteCodigo = `MDL-CRI-${ts()}`;
    modeloExistenteDescricao = 'Modelo existente para testes de CRIACAO';
    await apiPost(
      request,
      '/modelos',
      { codigo: modeloExistenteCodigo, descricao: modeloExistenteDescricao, maquina: MAQUINA_CATALOGO },
      token,
    );
  });

  test('OPERADOR não vê a opção "Criação de modelo" no formulário', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());
    await loginAs(operador.email, operador.senha, '/app/solicitacoes/nova');

    const select = page.getByLabel('Tipo', { exact: true });
    const values = await select.locator('option').allTextContents();
    expect(values.join(' ')).not.toContain('Criação de modelo');
  });

  test('GESTOR abre uma solicitação CRIACAO com campos condicionais', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    await loginAs(gestor.email, gestor.senha, '/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `Novo modelo E2E ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Descrição do modelo pretendido');
    await page.selectOption('select[name="tipo"]', 'CRIACAO');

    // Troca o seletor de modelo pelos campos de código/máquina/observações.
    await expect(page.getByLabel('Modelo', { exact: true })).toHaveCount(0);
    await page.fill('input[name="modeloCodigo"]', `COD-E2E-${ts()}`);
    await page.selectOption('select[name="modeloMaquina"]', MAQUINA_CATALOGO);

    await page.click('button:has-text("Abrir solicitação")');

    await expect(page).toHaveURL(/\/app\/solicitacoes\/[a-f0-9-]+$/);
    await expect(page.getByText('A fazer')).toBeVisible();
    await expect(page.getByText('Criação de modelo')).toBeVisible();
    await expect(page.getByText('Modelo pretendido', { exact: true })).toBeVisible();
    await expect(page.getByText(/será criado ao concluir/i)).toBeVisible();
  });

  test('fluxo completo: abrir → triar → validar (sem evidência obrigatória) → concluir cria o Modelo', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    const codigo = `COD-E2E-FLUXO-${ts()}`;

    await loginAs(gestor.email, gestor.senha, '/app/solicitacoes/nova');
    await page.fill('input[name="titulo"]', `Fluxo criação E2E ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Modelo a ser criado via fluxo completo E2E');
    await page.selectOption('select[name="tipo"]', 'CRIACAO');
    await page.fill('input[name="modeloCodigo"]', codigo);
    await page.selectOption('select[name="modeloMaquina"]', MAQUINA_CATALOGO);
    await page.click('button:has-text("Abrir solicitação")');
    await expect(page.getByText('A fazer')).toBeVisible();

    // Triagem — usa o próprio gestor como responsável (perfil atribuível).
    await page.click('button:has-text("Triar")');
    await page.selectOption('select[name="prioridade"]', 'MEDIA');
    await page.locator('input[name="responsavelIds"]').first().check();
    await page.click('button:has-text("Confirmar triagem")');
    await expect(page.getByText('Em andamento', { exact: true })).toBeVisible();

    // Enviar para validação: CRIACAO não exige evidência — só o comentário.
    await page.click('button:has-text("Enviar para validação")');
    const modal = page.locator('form').filter({ hasText: 'Enviar para validação' });
    await expect(modal.getByText('(opcional)')).toBeVisible();
    await modal.locator('textarea[name="comentario"]').fill('Modelo pronto para validação');
    await modal.getByRole('button', { name: 'Enviar para validação' }).click();
    await expect(page.getByText('Em validação', { exact: true })).toBeVisible();

    // Concluir: cria o Modelo e vincula o modeloId.
    await page.click('button:has-text("Encerrar")');
    await page.locator('textarea[name="comentario"]').first().fill('Modelo criado via E2E');
    await page.click('button:has-text("Concluir")');
    await expect(page.getByText('Concluída', { exact: true })).toBeVisible();

    // O card de "Modelo pretendido" vira o link real de rastreabilidade.
    await expect(page.getByText('Modelo (rastreabilidade)')).toBeVisible();
    const link = page.getByRole('link', { name: new RegExp(codigo) });
    await expect(link).toBeVisible();

    // O evento CADASTRO aparece no prontuário do modelo recém-criado.
    await link.click();
    await expect(page.getByText(codigo)).toBeVisible();
    await expect(page.getByText('Modelo cadastrado')).toBeVisible();
  });

  test('cancelar uma CRIACAO antes de concluir não cria modelo', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    await loginAs(gestor.email, gestor.senha, '/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `Criação cancelada E2E ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Não deve virar modelo');
    await page.selectOption('select[name="tipo"]', 'CRIACAO');
    await page.fill('input[name="modeloCodigo"]', `COD-E2E-CANCEL-${ts()}`);
    await page.selectOption('select[name="modeloMaquina"]', MAQUINA_CATALOGO);
    await page.click('button:has-text("Abrir solicitação")');
    await expect(page.getByText('A fazer')).toBeVisible();

    await page.click('button:has-text("Cancelar")');
    await page.locator('textarea[name="comentario"]').first().fill('Não precisa mais');
    await page.click('button:has-text("Cancelar solicitação")');

    await expect(page.getByText('Cancelada', { exact: true })).toBeVisible();
    // Sem modelo vinculado: nem o link de rastreabilidade, nem os dados
    // pretendidos fazem mais sentido mostrar (solicitação já é terminal).
    await expect(page.getByText('Modelo (rastreabilidade)')).toHaveCount(0);
  });

  test('a solicitação CRIACAO aparece na listagem sem modelo vinculado (LEFT JOIN)', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    const titulo = `Aparece na lista E2E ${ts()}`;

    await loginAs(gestor.email, gestor.senha, '/app/solicitacoes/nova');
    await page.fill('input[name="titulo"]', titulo);
    await page.fill('textarea[name="descricao"]', 'Deve aparecer mesmo sem modelo');
    await page.selectOption('select[name="tipo"]', 'CRIACAO');
    await page.fill('input[name="modeloCodigo"]', `COD-E2E-LISTA-${ts()}`);
    await page.selectOption('select[name="modeloMaquina"]', MAQUINA_CATALOGO);
    await page.click('button:has-text("Abrir solicitação")');
    await expect(page.getByText('A fazer')).toBeVisible();

    await page.goto('/app/solicitacoes');
    await page.click('button:has-text("Lista")');
    await page.getByLabel('Tipo', { exact: true }).selectOption('CRIACAO');

    // A ordenação é por data de criação ascendente e o volume de CRIACAO de
    // execuções anteriores desta suíte pode passar de uma página — navega
    // até achar o item recém-criado (sempre o mais recente) ou esgotar as
    // páginas disponíveis.
    const proxima = page.getByRole('button', { name: 'Próxima' });
    for (let tentativas = 0; tentativas < 10; tentativas += 1) {
      if (await page.getByText(titulo).isVisible()) break;
      if (await proxima.isDisabled()) break;
      await proxima.click();
    }
    await expect(page.getByText(titulo)).toBeVisible();
  });

  test('GESTOR não consegue trocar o tipo ao editar (imutável após a abertura)', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    await loginAs(gestor.email, gestor.senha, '/app/solicitacoes/nova');

    await page.fill('input[name="titulo"]', `Tipo imutável E2E ${ts()}`);
    await page.fill('textarea[name="descricao"]', 'Não pode virar CRIACAO depois');
    await page.selectOption('select[name="tipo"]', 'REPARO');
    await page.getByLabel('Modelo', { exact: true }).click();
    await page
      .getByRole('button', { name: new RegExp(`${modeloExistenteCodigo} - ${modeloExistenteDescricao}`) })
      .click();
    await page.click('button:has-text("Abrir solicitação")');
    await expect(page.getByText('A fazer')).toBeVisible();

    await page.click('button:has-text("Editar")');
    await expect(page.getByText(/não pode ser alterado/i)).toBeVisible();
    // Não há nenhum <select> de tipo no formulário de edição.
    await expect(page.locator('select[name="tipo"]')).toHaveCount(0);
  });
});

test.describe('Solicitação tipo CRIACAO — regressão de bugs corrigidos', () => {
  test('cancelar uma CRIACAO sem modelo não derruba o backend (bug real corrigido)', async ({
    request,
    token,
  }) => {
    // Regressão: SolicitacaoFinalizadaEvent exigia modeloId não-nulo — cancelar
    // uma CRIACAO sem modelo dava 500. apiPatch lança se a resposta não for OK,
    // então basta não lançar para confirmar o fix.
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      {
        titulo: `Cancelar via API ${ts()}`,
        descricao: 'Regressão SolicitacaoFinalizadaEvent',
        tipo: 'CRIACAO',
        modeloCodigo: `COD-API-${ts()}`,
        modeloMaquina: MAQUINA_CATALOGO,
      },
      token,
    );

    await apiPatch(request, `/solicitacoes/${sol.id}/cancelar`, { motivo: 'Não precisa mais' }, token);
  });

  test('métricas do dashboard não quebram com CRIACAO sem modelo (bug real corrigido)', async ({
    request,
    token,
  }) => {
    // Regressão: GROUP BY modelo_id com linhas nulas quebrava a serialização
    // JSON (Map com chave nula). Garante que exista ao menos uma CRIACAO sem
    // modelo e que /solicitacoes/metricas continue respondendo 200.
    await apiPost(
      request,
      '/solicitacoes',
      {
        titulo: `Métricas sem quebrar ${ts()}`,
        descricao: 'Regressão countGroupByModeloId',
        tipo: 'CRIACAO',
        modeloCodigo: `COD-METRICAS-${ts()}`,
        modeloMaquina: MAQUINA_CATALOGO,
      },
      token,
    );

    const res = await request.get(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/solicitacoes/metricas`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(res.ok()).toBeTruthy();
  });
});
