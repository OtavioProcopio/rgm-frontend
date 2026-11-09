import {
  test,
  expect,
  apiPost,
  apiPatch,
  apiCriarUsuario,
  MAQUINA_CATALOGO,
  escolherPrioridadeEPrimeiroResponsavel,
} from './fixtures';

const ts = () => Date.now();
const NOME_DO_BLOCO = 'O que precisa ser feito';

/** A instrução do que fazer: bloco no detalhe, triagem obrigatória e correção em andamento. */
test.describe('Instrução da solicitação', () => {
  let modeloId: string;

  test.beforeAll(async ({ request, token }) => {
    const modelo = await apiPost<{ id: string }>(
      request,
      '/modelos',
      { codigo: `MDL-INS-${ts()}`, descricao: 'Modelo instrução PW', maquina: MAQUINA_CATALOGO },
      token,
    );
    modeloId = modelo.id;
  });

  async function criarSolicitacao(
    request: Parameters<typeof apiPost>[0],
    token: string,
    titulo: string,
  ) {
    const sol = await apiPost<{ id: string }>(
      request,
      '/solicitacoes',
      { titulo, descricao: 'Relato do operador', tipo: 'REPARO', modeloId },
      token,
    );
    return sol.id;
  }

  async function triar(
    request: Parameters<typeof apiPatch>[0],
    token: string,
    id: string,
    responsavelId: string,
    instrucao: string,
  ) {
    await apiPatch(
      request,
      `/solicitacoes/${id}/triar`,
      { prioridade: 'MEDIA', responsavelIds: [responsavelId], instrucao },
      token,
    );
  }

  test('triagem pela tela: sem instrução não confirma, com instrução mostra o bloco', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const id = await criarSolicitacao(request, token, `Instrução triagem ${ts()}`);
    await loginAdmin(`/app/solicitacoes/${id}`);
    await page.click('button:has-text("Triar")');
    await escolherPrioridadeEPrimeiroResponsavel(page, 'ALTA');
    const campo = page.getByLabel(NOME_DO_BLOCO, { exact: true });

    // Sem instrução: o erro aparece, o foco vai ao campo e nada é enviado.
    await campo.fill('   ');
    await page.click('button:has-text("Confirmar triagem")');
    await expect(page.getByText('Descreva o que precisa ser feito')).toBeVisible();
    await expect(campo).toBeFocused();

    // Com instrução: tria e o detalhe mostra o bloco no topo.
    await campo.fill('Trocar o gabarito\nConferir o furo 3');
    await page.click('button:has-text("Confirmar triagem")');
    const bloco = page.getByRole('region', { name: NOME_DO_BLOCO });
    await expect(bloco).toContainText('Trocar o gabarito');
    await expect(bloco).toContainText('Conferir o furo 3');
  });

  test('o gestor corrige a instrução em andamento e o histórico guarda a anterior', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    const id = await criarSolicitacao(request, token, `Instrução correção ${ts()}`);
    await triar(request, token, id, gestor.id, 'Trocar o gabarito');
    await loginAdmin(`/app/solicitacoes/${id}`);

    await page.getByRole('button', { name: 'Editar o que precisa ser feito' }).click();
    const dialogo = page.getByRole('dialog');
    const salvar = dialogo.getByRole('button', { name: 'Salvar' });
    await expect(salvar).toBeDisabled();
    await dialogo.getByLabel(NOME_DO_BLOCO, { exact: true }).fill('Trocar o gabarito e o pino');
    await salvar.click();

    await expect(page.getByRole('region', { name: NOME_DO_BLOCO })).toContainText(
      'Trocar o gabarito e o pino',
    );
    await expect(page.getByText('Instrução alterada')).toBeVisible();
    await expect(page.getByText('Antes: Trocar o gabarito')).toBeVisible();
  });

  test('o operador responsável lê a instrução mas não vê o botão de corrigir', async ({
    page,
    loginAs,
    request,
    token,
  }) => {
    const operador = await apiCriarUsuario(request, token, 'OPERADOR', ts());
    const id = await criarSolicitacao(request, token, `Instrução operador ${ts()}`);
    await triar(request, token, id, operador.id, 'Montar o novo gabarito');

    await loginAs(operador.email, operador.senha, `/app/solicitacoes/${id}`);

    await expect(page.getByRole('region', { name: NOME_DO_BLOCO })).toContainText(
      'Montar o novo gabarito',
    );
    await expect(page.getByRole('button', { name: 'Editar o que precisa ser feito' })).toHaveCount(
      0,
    );
  });

  test('em tela de 320 px a instrução longa aparece inteira, sem rolagem horizontal', async ({
    page,
    loginAdmin,
    request,
    token,
  }) => {
    const gestor = await apiCriarUsuario(request, token, 'GESTOR', ts());
    const id = await criarSolicitacao(request, token, `Instrução longa ${ts()}`);
    const palavra = 'x'.repeat(200);
    const instrucao = `${palavra} ${'serviço '.repeat(220)}`.slice(0, 2000);
    await triar(request, token, id, gestor.id, instrucao);
    await page.setViewportSize({ width: 320, height: 700 });

    await loginAdmin(`/app/solicitacoes/${id}`);

    const bloco = page.getByRole('region', { name: NOME_DO_BLOCO });
    await expect(bloco).toContainText(palavra);
    const largura = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(largura.conteudo).toBeLessThanOrEqual(largura.janela);
  });
});
