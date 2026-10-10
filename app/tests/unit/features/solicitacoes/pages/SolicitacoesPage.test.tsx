/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createAppWrapper } from '@tests/support/appWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';

import { SolicitacoesPage } from '@/features/solicitacoes/pages/SolicitacoesPage';

vi.mock('@/features/solicitacoes/hooks/useSolicitacoes', () => ({
  useSolicitacoes: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { exportar: vi.fn().mockResolvedValue('') },
}));
vi.mock('@/features/solicitacoes/components/KanbanBoard', () => ({
  KanbanBoard: ({
    modeloId,
    dataInicio,
    dataFim,
    onLimparFiltro,
  }: {
    modeloId?: string;
    dataInicio?: string;
    dataFim?: string;
    onLimparFiltro?: () => void;
  }) => (
    <div data-testid="kanban-board">
      <span data-testid="modelo-do-quadro">{modeloId ?? 'sem modelo'}</span>
      <span data-testid="periodo-do-quadro">{`${dataInicio ?? 'sem início'} | ${dataFim ?? 'sem fim'}`}</span>
      <button type="button" onClick={onLimparFiltro}>
        Limpar filtro
      </button>
    </div>
  ),
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoCard', () => ({
  SolicitacaoCard: ({ solicitacao }: { solicitacao: { titulo: string } }) => (
    <div data-testid="solicitacao-card">{solicitacao.titulo}</div>
  ),
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoFilters', () => ({
  SolicitacaoFilters: ({
    filters,
    onChange,
  }: {
    filters: { atrasada?: boolean; emAberto?: boolean };
    onChange: (filtros: object) => void;
  }) => (
    <div data-testid="solicitacao-filters">
      <button type="button" onClick={() => onChange({ ...filters, modeloId: 'm-9' })}>
        Filtrar pelo modelo m-9
      </button>
      {filters.atrasada ? (
        <button type="button" onClick={() => onChange({ ...filters, atrasada: undefined })}>
          Em atraso
        </button>
      ) : null}
      {filters.emAberto ? <span>Em aberto</span> : null}
    </div>
  ),
}));

afterEach(cleanup);

describe('SolicitacoesPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Solicitações')).toBeDefined();
  });

  it('renders kanban board by default', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(container.querySelector('[data-testid="kanban-board"]')).toBeDefined();
  });

  it('shows nova solicitacao link for OPERADOR', () => {
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /nova solicitação/i })).toBeDefined();
  });

  it('shows nova solicitacao link for GESTOR', () => {
    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' } });
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /nova solicitação/i })).toBeDefined();
  });

  it('does not show nova solicitacao link when user is null', () => {
    const { AppWrapper } = createAppWrapper({ user: null });
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).queryByRole('link', { name: /nova solicitação/i })).toBeNull();
  });

  it('shows lista view when Lista button is clicked', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /lista/i }));
    expect(within(container).getByTestId('solicitacao-filters')).toBeDefined();
  });

  it('shows loading state in lista view', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /lista/i }));
    expect(within(container).getByText(/carregando solicitações/i)).toBeDefined();
  });

  it('shows error state in lista view', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
    } as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /lista/i }));
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('opens directly in lista view filtered by maquina from the URL', async () => {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper({
      initialEntries: ['/app/solicitacoes?maquina=VICK'],
    });
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });

    expect(within(container).getByTestId('solicitacao-filters')).toBeDefined();
    expect(useSolicitacoes).toHaveBeenCalledWith(
      expect.objectContaining({ maquina: 'VICK' }),
      expect.anything(),
    );
  });

  it('deve mostrar o erro junto do cabeçalho quando a exportação falha pelo menu', async () => {
    // Arrange
    const recusa = new ApiError({ status: 500, message: 'Falha ao gerar o relatório.' });
    vi.mocked(solicitacoesApi.exportar).mockRejectedValueOnce(recusa);
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    const titulo = await screen.findByText('Exportação não concluída');
    expect(titulo.tagName).toBe('H2');
    expect(titulo.nextElementSibling?.textContent).toBe(
      `Não foi possível exportar o PDF. ${recusa.message}`,
    );
  });
});

describe('SolicitacoesPage — ações do cabeçalho', () => {
  it('deve mostrar "Nova solicitação" como botão e "Mais ações" quando o usuário pode criar', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    render(<SolicitacoesPage />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getByRole('link', { name: 'Nova solicitação' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeDefined();
  });

  it('deve manter "Exportar PDF" fora da barra quando o usuário pode criar', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    render(<SolicitacoesPage />, { wrapper: AppWrapper });

    // Assert
    expect(screen.queryByRole('button', { name: 'Exportar PDF' })).toBeNull();
  });

  it('deve mostrar "Exportar PDF" no menu quando "Mais ações" é aberto', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Exportar PDF' })).toBeDefined();
  });

  it('deve manter o alternador Kanban/Lista fora do menu quando o usuário pode criar', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Kanban' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Lista' })).toBeDefined();
    expect(screen.queryByRole('menuitem', { name: 'Kanban' })).toBeNull();
  });

  it('deve exportar com os filtros atuais quando "Exportar PDF" é escolhido no menu', async () => {
    // Arrange
    vi.mocked(solicitacoesApi.exportar).mockClear();
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    expect(solicitacoesApi.exportar).toHaveBeenCalledTimes(1);
    expect(solicitacoesApi.exportar).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      maquina: undefined,
    });
  });

  it('deve mostrar "Exportar PDF" como botão e nenhum "Mais ações" quando o usuário não pode criar', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: null });

    // Act
    render(<SolicitacoesPage />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });
});

describe('SolicitacoesPage — período vazio e lista vazia', () => {
  async function abrirListaVazia(filtrar: boolean) {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReset();
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useSolicitacoes>);
    const { AppWrapper } = createAppWrapper();
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));
    if (filtrar) {
      await userEvent.click(screen.getByRole('button', { name: 'Filtrar pelo modelo m-9' }));
    }
  }

  it('deve entregar ao quadro o início vazio quando a data inicial é apagada', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    const campo = screen.getByLabelText('Criada a partir de');
    await userEvent.type(campo, '2026-10-01');

    // Act
    await userEvent.clear(campo);

    // Assert
    expect(screen.getByTestId('periodo-do-quadro').textContent).toBe('sem início | sem fim');
  });

  it('deve entregar ao quadro o fim vazio quando a data final é apagada', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    const campo = screen.getByLabelText('Criada até');
    await userEvent.type(campo, '2026-10-07');

    // Act
    await userEvent.clear(campo);

    // Assert
    expect(screen.getByTestId('periodo-do-quadro').textContent).toBe('sem início | sem fim');
  });

  it('deve avisar que nada foi cadastrado quando a lista vem vazia sem filtros', async () => {
    // Act
    await abrirListaVazia(false);

    // Assert
    expect(screen.getByText('Nenhuma solicitação cadastrada ainda.')).toBeDefined();
  });

  it('deve avisar que os filtros não acharam nada quando a lista vem vazia com filtro de modelo', async () => {
    // Act
    await abrirListaVazia(true);

    // Assert
    expect(screen.getByText('Nenhuma solicitação com os filtros aplicados.')).toBeDefined();
  });
});

describe('SolicitacoesPage — paginação da lista', () => {
  async function abrirListaComTresPaginas() {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReset();
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: {
        content: [{ id: 's-1', titulo: 'Troca de molde' }],
        page: 1,
        totalPages: 3,
        totalElements: 50,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useSolicitacoes>);
    const { AppWrapper } = createAppWrapper();
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));
    vi.mocked(useSolicitacoes).mockClear();
    return useSolicitacoes;
  }

  it('deve mostrar um cartão por solicitação quando a lista tem resultados', async () => {
    // Arrange
    await abrirListaComTresPaginas();

    // Act
    const cartoes = screen.getAllByTestId('solicitacao-card');

    // Assert
    expect(cartoes).toHaveLength(1);
    expect(cartoes[0].textContent).toBe('Troca de molde');
  });

  it('deve pedir a página seguinte quando Próxima é acionado', async () => {
    // Arrange
    const useSolicitacoes = await abrirListaComTresPaginas();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    // Assert
    expect(useSolicitacoes).toHaveBeenCalledTimes(1);
    expect(useSolicitacoes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, size: 20 }),
      expect.anything(),
    );
  });

  it('deve pedir a página anterior quando Anterior é acionado', async () => {
    // Arrange
    const useSolicitacoes = await abrirListaComTresPaginas();
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    vi.mocked(useSolicitacoes).mockClear();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    // Assert
    expect(useSolicitacoes).toHaveBeenCalledTimes(1);
    expect(useSolicitacoes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 20 }),
      expect.anything(),
    );
  });
});

describe('SolicitacoesPage — filtros vindos da URL', () => {
  async function prepararListagemCarregando() {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReset();
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useSolicitacoes>);
    return vi.mocked(useSolicitacoes);
  }

  function abrirComUrl(consulta: string): void {
    const { AppWrapper } = createAppWrapper({
      initialEntries: [`/app/solicitacoes${consulta}`],
    });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
  }

  it('deve abrir na lista quando a URL traz atrasada e emAberto', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('?atrasada=true&emAberto=true');

    // Assert
    expect(screen.getByTestId('solicitacao-filters')).toBeDefined();
  });

  it('deve pedir a listagem com atrasada, emAberto, page 0 e size 20 quando a URL traz atrasada e emAberto', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?atrasada=true&emAberto=true');

    // Assert
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, atrasada: true, emAberto: true },
      { enabled: true },
    );
  });

  it('deve mostrar a etiqueta "Em atraso" quando a URL traz atrasada e emAberto', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('?atrasada=true&emAberto=true');

    // Assert
    expect(screen.getByRole('button', { name: 'Em atraso' })).toBeDefined();
  });

  it('deve mostrar a etiqueta "Em aberto" quando a URL traz atrasada e emAberto', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('?atrasada=true&emAberto=true');

    // Assert
    expect(screen.getByText('Em aberto')).toBeDefined();
  });

  it('deve pedir a listagem com tipo e emAberto quando a URL traz tipo=REPARO e emAberto', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?tipo=REPARO&emAberto=true');

    // Assert
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, tipo: 'REPARO', emAberto: true },
      { enabled: true },
    );
  });

  it('deve pedir a listagem com status quando a URL traz status=A_FAZER', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?status=A_FAZER');

    // Assert
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, status: 'A_FAZER' },
      { enabled: true },
    );
  });

  it('deve pedir a listagem com prioridade e emAberto quando a URL traz prioridade=URGENTE e emAberto', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?prioridade=URGENTE&emAberto=true');

    // Assert
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, prioridade: 'URGENTE', emAberto: true },
      { enabled: true },
    );
  });

  it('deve abrir no Kanban quando a URL traz só valores inválidos', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('?status=XYZ&atrasada=1');

    // Assert
    expect(screen.getByTestId('kanban-board')).toBeDefined();
  });

  it('deve ignorar os valores inválidos da URL quando a listagem é pedida', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?status=XYZ&atrasada=1');

    // Assert
    expect(listagem).toHaveBeenCalledWith({ page: 0, size: 20 }, { enabled: false });
  });

  it('deve abrir no Kanban quando a URL não traz parâmetro', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('');

    // Assert
    expect(screen.getByTestId('kanban-board')).toBeDefined();
  });

  it('deve abrir na lista quando a URL traz maquina=VICK', async () => {
    // Arrange
    await prepararListagemCarregando();

    // Act
    abrirComUrl('?maquina=VICK');

    // Assert
    expect(screen.getByTestId('solicitacao-filters')).toBeDefined();
  });

  it('deve pedir a listagem com maquina quando a URL traz maquina=VICK', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();

    // Act
    abrirComUrl('?maquina=VICK');

    // Assert
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, maquina: 'VICK' },
      { enabled: true },
    );
  });

  it('deve refazer a listagem sem atrasada quando a etiqueta "Em atraso" é removida', async () => {
    // Arrange
    const listagem = await prepararListagemCarregando();
    abrirComUrl('?atrasada=true&emAberto=true');
    listagem.mockClear();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Em atraso' }));

    // Assert
    expect(listagem).toHaveBeenCalledTimes(1);
    expect(listagem).toHaveBeenCalledWith(
      { page: 0, size: 20, atrasada: undefined, emAberto: true },
      { enabled: true },
    );
  });
});

describe('SolicitacoesPage — cores por papel', () => {
  it('deve pôr a troca de visão sobre a superfície com a borda do tema quando a página abre', () => {
    // Arrange
    const esperado = ['border-line', 'bg-surface'];
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    const trocaDeVisao = screen.getByRole('button', { name: 'Kanban' }).parentElement;

    // Assert
    expect(trocaDeVisao?.className.split(' ')).toEqual(expect.arrayContaining(esperado));
  });

  it('deve mostrar a visão não escolhida no texto secundário quando a página abre no quadro', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    const visaoNaoEscolhida = screen.getByRole('button', { name: 'Lista' });

    // Assert
    expect(visaoNaoEscolhida.className.split(' ')).toContain('text-fg-muted');
  });
});

describe('SolicitacoesPage — limpar o filtro do quadro', () => {
  async function quadroFiltradoPorPeriodo() {
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.type(screen.getByLabelText('Criada a partir de'), '2026-10-01');
    await userEvent.type(screen.getByLabelText('Criada até'), '2026-10-07');
  }

  it('deve entregar ao quadro o período escolhido quando as datas são preenchidas', async () => {
    // Act
    await quadroFiltradoPorPeriodo();

    // Assert
    expect(screen.getByTestId('periodo-do-quadro').textContent).toBe(
      '2026-10-01T00:00:00Z | 2026-10-07T23:59:59Z',
    );
  });

  it('deve entregar ao quadro o período vazio quando "Limpar filtro" é acionado', async () => {
    // Arrange
    await quadroFiltradoPorPeriodo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtro' }));

    // Assert
    expect(screen.getByTestId('periodo-do-quadro').textContent).toBe('sem início | sem fim');
  });

  it('deve esvaziar os campos de período quando "Limpar filtro" é acionado', async () => {
    // Arrange
    await quadroFiltradoPorPeriodo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtro' }));

    // Assert
    expect((screen.getByLabelText('Criada a partir de') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Criada até') as HTMLInputElement).value).toBe('');
  });

  async function quadroFiltradoPorModelo() {
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar pelo modelo m-9' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kanban' }));
  }

  it('deve entregar ao quadro o modelo filtrado na lista quando o usuário volta ao quadro', async () => {
    // Act
    await quadroFiltradoPorModelo();

    // Assert
    expect(screen.getByTestId('modelo-do-quadro').textContent).toBe('m-9');
  });

  it('deve entregar ao quadro o filtro de modelo vazio quando "Limpar filtro" é acionado', async () => {
    // Arrange
    await quadroFiltradoPorModelo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtro' }));

    // Assert
    expect(screen.getByTestId('modelo-do-quadro').textContent).toBe('sem modelo');
  });
});

describe('SolicitacoesPage — lista vazia com filtros da URL', () => {
  async function abrirListaVaziaComUrl(consulta: string) {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReset();
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useSolicitacoes>);
    const { AppWrapper } = createAppWrapper({
      initialEntries: [`/app/solicitacoes${consulta}`],
    });
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
  }

  it.each([
    ['atrasada', '?atrasada=true'],
    ['emAberto', '?emAberto=true'],
    ['atrasada e emAberto', '?atrasada=true&emAberto=true'],
    ['tipo', '?tipo=REPARO'],
    ['prioridade', '?prioridade=ALTA'],
    ['maquina', '?maquina=VICK'],
  ])(
    'deve avisar que os filtros não acharam nada quando a URL traz %s e a lista vem vazia',
    async (_filtro, consulta) => {
      // Arrange
      const mensagem = 'Nenhuma solicitação com os filtros aplicados.';

      // Act
      await abrirListaVaziaComUrl(consulta);

      // Assert
      expect(screen.queryByText(mensagem)).not.toBeNull();
    },
  );
});
