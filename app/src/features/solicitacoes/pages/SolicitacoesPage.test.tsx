/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { SolicitacoesPage } from './SolicitacoesPage';

vi.mock('../hooks/useSolicitacoes', () => ({
  useSolicitacoes: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../api/solicitacoesApi', () => ({
  solicitacoesApi: { exportar: vi.fn().mockResolvedValue('') },
}));
vi.mock('../components/KanbanBoard', () => ({
  KanbanBoard: () => <div data-testid="kanban-board" />,
}));
vi.mock('../components/SolicitacaoCard', () => ({
  SolicitacaoCard: ({ solicitacao }: { solicitacao: { titulo: string } }) => (
    <div data-testid="solicitacao-card">{solicitacao.titulo}</div>
  ),
}));
vi.mock('../components/SolicitacaoFilters', () => ({
  SolicitacaoFilters: () => <div data-testid="solicitacao-filters" />,
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
    const { useSolicitacoes } = await import('../hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: undefined, error: new Error('fail'), isLoading: false,
    } as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /lista/i }));
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('shows export csv button', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<SolicitacoesPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /exportar csv/i })).toBeDefined();
  });
});
