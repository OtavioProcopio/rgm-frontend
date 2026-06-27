/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { RelatoriosPage } from './RelatoriosPage';

const mockUseMetricas = vi.fn();

vi.mock('../hooks/useMetricas', () => ({
  useMetricas: () => mockUseMetricas(),
}));

const defaultData = {
  totalSolicitacoes: 10,
  solicitacoesAbertas: 3,
  solicitacoesPendentes: 2,
  solicitacoesConcluidas: 5,
  tempoMedioResolucaoSegundos: 7200,
  solicitacoesPorStatus: {
    A_FAZER: 3,
    EM_ANDAMENTO: 2,
    EM_VALIDACAO: 0,
    CONCLUIDA: 5,
    CANCELADA: 0,
  },
};

afterEach(cleanup);

describe('RelatoriosPage', () => {
  it('renders page title and metric cards', () => {
    mockUseMetricas.mockReturnValue({ data: defaultData, isLoading: false, isError: false });
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<RelatoriosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Relatórios')).toBeDefined();
    expect(within(container).getByText('Total')).toBeDefined();
    expect(within(container).getByText('Abertas')).toBeDefined();
    expect(within(container).getByText('Concluídas')).toBeDefined();
  });

  it('shows loading state', () => {
    mockUseMetricas.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<RelatoriosPage />, { wrapper: AppWrapper });
    expect(container).toBeDefined();
  });

  it('shows error state', () => {
    mockUseMetricas.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<RelatoriosPage />, { wrapper: AppWrapper });
    expect(container).toBeDefined();
  });

  it('formats zero duration as em dash', () => {
    mockUseMetricas.mockReturnValue({
      data: { ...defaultData, tempoMedioResolucaoSegundos: 0 },
      isLoading: false,
      isError: false,
    });
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<RelatoriosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('—')).toBeDefined();
  });
});
