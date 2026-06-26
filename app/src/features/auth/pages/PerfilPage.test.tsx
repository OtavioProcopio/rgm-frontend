/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { PerfilPage } from './PerfilPage';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: undefined, isLoading: true, isError: false }),
}));
vi.mock('@/features/auth/hooks/useAlterarSenha', () => ({
  useAlterarSenha: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useMetricas', () => ({
  useMetricas: vi.fn().mockReturnValue({ data: undefined }),
}));

afterEach(cleanup);

describe('PerfilPage', () => {
  it('shows spinner while loading', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(container.querySelector('.animate-spin')).toBeDefined();
  });

  it('shows profile info when loaded', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: { nome: 'Otávio', email: 'o@o.com', perfil: 'ADMINISTRADOR' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Otávio')).toBeDefined();
  });

  it('shows error state', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined, isLoading: false, isError: true,
    } as ReturnType<typeof usePerfil>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível/i)).toBeDefined();
  });
});
