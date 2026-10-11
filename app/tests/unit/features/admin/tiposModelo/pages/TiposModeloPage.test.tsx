/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useAtivarTipoModelo } from '@/features/admin/tiposModelo/hooks/useAtivarTipoModelo';
import { useDesativarTipoModelo } from '@/features/admin/tiposModelo/hooks/useDesativarTipoModelo';
import { TiposModeloPage } from '@/features/admin/tiposModelo/pages/TiposModeloPage';
import { useTiposModelo } from '@/features/admin/modelos/hooks/useTiposModelo';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/modelos/hooks/useTiposModelo', () => ({
  useTiposModelo: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/tiposModelo/hooks/useAtivarTipoModelo', () => ({
  useAtivarTipoModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/tiposModelo/hooks/useDesativarTipoModelo', () => ({
  useDesativarTipoModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(cleanup);

describe('TiposModeloPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Tipos de modelo')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando tipos de modelo/i)).toBeDefined();
  });

  it('shows empty state when no tiposModelo', async () => {
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nenhum tipo de modelo cadastrado/i)).toBeDefined();
  });

  it('shows novo tipo de modelo link', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /novo tipo de modelo/i })).toBeDefined();
  });

  it('deve não mostrar Mais ações quando o cabeçalho tem só o comando Novo tipo de modelo', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();

    // Act
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });

    // Assert
    expect(within(container).getByRole('link', { name: 'Novo tipo de modelo' })).toBeDefined();
    expect(within(container).queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });

  it('shows error state when request fails', async () => {
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    vi.mocked(useTiposModelo).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('deve refazer a consulta quando Tentar novamente é acionado depois da falha', async () => {
    // Arrange
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    const refetch = vi.fn();
    vi.mocked(useTiposModelo).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useTiposModelo>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders machines table when data is available', async () => {
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getAllByText('FBOX').length).toBeGreaterThan(0);
  });
});

describe('TiposModeloPage — ativar e desativar', () => {
  function abrir(ativo: boolean) {
    const ativar = vi.fn().mockResolvedValue(undefined);
    const desativar = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarTipoModelo).mockReturnValue({
      mutateAsync: ativar,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarTipoModelo>);
    vi.mocked(useDesativarTipoModelo).mockReturnValue({
      mutateAsync: desativar,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarTipoModelo>);
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<TiposModeloPage />, { wrapper: AppWrapper });
    return { ativar, desativar, tela: within(container) };
  }

  it('deve desativar o tipo de modelo pelo identificador quando Desativar é acionado', async () => {
    // Arrange
    const { desativar, tela } = abrir(true);

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Desativar' })[0]);

    // Assert
    expect(desativar).toHaveBeenCalledExactlyOnceWith('1');
  });

  it('deve ativar o tipo de modelo pelo identificador quando Ativar é acionado', async () => {
    // Arrange
    const { ativar, tela } = abrir(false);

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Ativar' })[0]);

    // Assert
    expect(ativar).toHaveBeenCalledExactlyOnceWith('1');
  });

  it('deve mostrar o erro da operação quando desativar falha', async () => {
    // Arrange
    const { desativar, tela } = abrir(true);
    desativar.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Há modelos ativos' }));

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Desativar' })[0]);

    // Assert
    expect(await tela.findByText('Operação não concluída')).toBeDefined();
  });

  it('deve mostrar o erro da operação quando ativar falha', async () => {
    // Arrange
    const { ativar, tela } = abrir(false);
    ativar.mockRejectedValueOnce(new ApiError({ status: 500, message: 'Erro interno' }));

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Ativar' })[0]);

    // Assert
    expect(await tela.findByText('Operação não concluída')).toBeDefined();
  });
});
