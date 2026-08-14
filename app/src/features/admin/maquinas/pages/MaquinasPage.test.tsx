/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { MaquinasPage } from './MaquinasPage';

vi.mock('@/features/admin/modelos/hooks/useMaquinas', () => ({
  useMaquinas: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../hooks/useAtivarMaquina', () => ({
  useAtivarMaquina: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDesativarMaquina', () => ({
  useDesativarMaquina: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(cleanup);

describe('MaquinasPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Máquinas')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando máquinas/i)).toBeDefined();
  });

  it('shows empty state when no maquinas', async () => {
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    vi.mocked(useMaquinas).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nenhuma máquina cadastrada/i)).toBeDefined();
  });

  it('shows nova máquina link', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /nova máquina/i })).toBeDefined();
  });

  it('shows error state when request fails', async () => {
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    vi.mocked(useMaquinas).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders machines table when data is available', async () => {
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    vi.mocked(useMaquinas).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    expect(within(container).getAllByText('FBOX').length).toBeGreaterThan(0);
  });
});
