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
    filters: object;
    onChange: (filtros: object) => void;
  }) => (
    <div data-testid="solicitacao-filters">
      <button type="button" onClick={() => onChange({ ...filters, modeloId: 'm-9' })}>
        Filtrar pelo modelo m-9
      </button>
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
      data: undefined, error: new Error('fail'), isLoading: false,
    } as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /lista/i }));
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('shows export pdf button', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /exportar pdf/i })).toBeDefined();
  });

  it('opens directly in lista view filtered by maquina from the URL', async () => {
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: undefined, error: null, isLoading: true,
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

  it('deve mostrar o erro junto do botão de exportar quando a API responde com erro na exportação', async () => {
    // Arrange
    const recusa = new ApiError({ status: 500, message: 'Falha ao gerar o relatório.' });
    vi.mocked(solicitacoesApi.exportar).mockRejectedValueOnce(recusa);
    const { AppWrapper } = createAppWrapper();
    render(<SolicitacoesPage />, { wrapper: AppWrapper });
    const botao = screen.getByRole('button', { name: 'Exportar PDF' });

    // Act
    await userEvent.click(botao);

    // Assert
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toBe(`Não foi possível exportar o PDF. ${recusa.message}`);
    expect(alerta.parentElement).toBe(botao.parentElement);
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
