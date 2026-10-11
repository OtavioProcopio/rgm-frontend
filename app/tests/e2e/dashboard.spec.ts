import { test, expect, API_URL } from './fixtures';

/** Requisições de dados do painel: as de solicitações, sem o canal de eventos em tempo real. */
const ehRequisicaoDeDados = (url: string) =>
  url.startsWith(`${API_URL}/solicitacoes`) && !url.includes('/solicitacoes/events');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginAdmin }) => {
    await loginAdmin('/app/dashboard');
  });

  test('abre com a fila de atenção e a hora da última atualização', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Precisa de atenção' })).toBeVisible();
    await expect(page.getByText(/Atualizado às/)).toBeVisible();
    await expect(page.getByText('Monitoramento em Tempo Real')).toHaveCount(0);
  });

  test('exibe os quatro indicadores de solicitação e não os de cadastro', async ({ page }) => {
    const indicadores = page.getByRole('region', { name: 'Indicadores' });

    await expect(indicadores.getByText('Abertas', { exact: true })).toBeVisible();
    await expect(indicadores.getByText('Em atraso', { exact: true })).toBeVisible();
    await expect(indicadores.getByText('Concluídas no período')).toBeVisible();
    await expect(indicadores.getByText('Tempo médio', { exact: true })).toBeVisible();
    await expect(indicadores.getByText('Usuários', { exact: true })).toHaveCount(0);
    await expect(indicadores.getByText('Modelos', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Acompanhamento Crítico')).toHaveCount(0);
  });

  test('exibe a tendência e uma única distribuição do trabalho em aberto', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Tendência' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Trabalho em aberto' })).toBeVisible();
    await expect(page.getByText('Distribuição detalhada por status')).toHaveCount(0);
    await expect(page.getByText('Distribuição por tipo')).toHaveCount(0);
  });

  test('troca o período e atualiza a faixa de indicadores', async ({ page }) => {
    await page.getByRole('radio', { name: /^7 dias/ }).click();

    await expect(page.getByRole('radio', { name: /^7 dias/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText(/últimos 7 dias/),
    ).toBeVisible();
  });

  test('mostra a distribuição por prioridade ao escolher a visão Prioridade', async ({ page }) => {
    const distribuicao = page.getByRole('region', { name: 'Trabalho em aberto' });

    await distribuicao.getByRole('radio', { name: /^Prioridade/ }).click();

    await expect(distribuicao.getByRole('link', { name: /Urgente/ })).toBeVisible();
  });

  test('abre a lista filtrada ao escolher uma parte da distribuição', async ({ page }) => {
    const distribuicao = page.getByRole('region', { name: 'Trabalho em aberto' });

    await distribuicao.getByRole('link', { name: /A fazer/ }).click();

    await expect(page).toHaveURL(/\/app\/solicitacoes\?.*status=A_FAZER/);
    await expect(page.getByRole('button', { name: 'Remover filtro Em aberto' })).toBeVisible();
  });
});

test.describe('Lista filtrada vinda do painel', () => {
  test('mostra e remove os filtros "Em atraso" e "Em aberto" da URL', async ({
    page,
    loginAdmin,
  }) => {
    await loginAdmin('/app/solicitacoes?atrasada=true&emAberto=true');

    const emAtraso = page.getByRole('button', { name: 'Remover filtro Em atraso' });
    await expect(emAtraso).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover filtro Em aberto' })).toBeVisible();

    await emAtraso.click();

    await expect(emAtraso).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remover filtro Em aberto' })).toBeVisible();
  });

  test('ignora filtro inválido da URL e abre o quadro', async ({ page, loginAdmin }) => {
    await loginAdmin('/app/solicitacoes?status=XYZ&atrasada=1');

    await expect(page.getByRole('button', { name: /Remover filtro/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Kanban' })).toBeVisible();
  });
});

test.describe('Dashboard sobre o painel por período', () => {
  test('abre os indicadores com no máximo três requisições de dados', async ({
    page,
    loginAdmin,
  }) => {
    await loginAdmin('/app/perfil');
    const requisicoes: string[] = [];
    page.on('request', (requisicao) => {
      if (ehRequisicaoDeDados(requisicao.url())) requisicoes.push(requisicao.url());
    });

    await page.goto('/app/dashboard');
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText('Concluídas no período'),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Tendência' })).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(requisicoes.length).toBeLessThanOrEqual(3);
  });

  test('mostra os indicadores do painel por período quando o backend o oferece', async ({
    page,
    loginAdmin,
  }) => {
    const painel = page.waitForResponse((resposta) =>
      resposta.url().includes('/solicitacoes/metricas/painel'),
    );

    await loginAdmin('/app/dashboard');

    expect((await painel).status()).toBe(200);
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText('Concluídas no período'),
    ).toBeVisible();
  });

  test('mostra os indicadores da spec 013 quando o painel responde 404', async ({
    page,
    loginAdmin,
  }) => {
    await page.route('**/solicitacoes/metricas/painel**', (rota) =>
      rota.fulfill({ status: 404, contentType: 'application/json', body: '{}' }),
    );

    await loginAdmin('/app/dashboard');

    const indicadores = page.getByRole('region', { name: 'Indicadores' });
    await expect(indicadores.getByText('Concluídas no período')).toBeVisible();
    await expect(indicadores.getByText('Tempo médio', { exact: true })).toBeVisible();
    await expect(indicadores.getByRole('alert')).toHaveCount(0);
  });

  test('mostra o erro com Tentar novamente quando o painel falha com erro do servidor', async ({
    page,
    loginAdmin,
  }) => {
    await page.route('**/solicitacoes/metricas/painel**', (rota) =>
      rota.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    );

    await loginAdmin('/app/dashboard');

    await expect(
      page
        .getByRole('region', { name: 'Indicadores' })
        .getByRole('button', { name: 'Tentar novamente' }),
    ).toBeVisible();
  });
});
