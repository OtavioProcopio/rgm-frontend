/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { NovaSolicitacaoPage } from './NovaSolicitacaoPage';

vi.mock('../hooks/useAbrirSolicitacao', () => ({
  useAbrirSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: { content: [], totalElements: 0 }, isLoading: false, error: null }),
}));

afterEach(cleanup);

describe('NovaSolicitacaoPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nova solicitação/i)).toBeDefined();
  });

  it('renders form fields', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByLabelText(/título/i)).toBeDefined();
    expect(within(container).getByLabelText(/descrição/i)).toBeDefined();
    expect(within(container).getByLabelText(/tipo/i)).toBeDefined();
  });

  it('renders submit button', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /abrir solicitação/i })).toBeDefined();
  });
});
