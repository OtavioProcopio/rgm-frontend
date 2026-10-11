/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useAtivarMaquina } from '@/features/admin/maquinas/hooks/useAtivarMaquina';
import { useDesativarMaquina } from '@/features/admin/maquinas/hooks/useDesativarMaquina';
import { MaquinasPage } from '@/features/admin/maquinas/pages/MaquinasPage';
import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/modelos/hooks/useMaquinas', () => ({
  useMaquinas: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/maquinas/hooks/useAtivarMaquina', () => ({
  useAtivarMaquina: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/maquinas/hooks/useDesativarMaquina', () => ({
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

  it('deve não mostrar Mais ações quando o cabeçalho tem só o comando Nova máquina', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();

    // Act
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });

    // Assert
    expect(within(container).getByRole('link', { name: 'Nova máquina' })).toBeDefined();
    expect(within(container).queryByRole('button', { name: 'Mais ações' })).toBeNull();
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

  it('deve refazer a consulta quando Tentar novamente é acionado depois da falha', async () => {
    // Arrange
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    const refetch = vi.fn();
    vi.mocked(useMaquinas).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useMaquinas>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
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

describe('MaquinasPage — ativar e desativar', () => {
  function abrir(ativo: boolean) {
    const ativar = vi.fn().mockResolvedValue(undefined);
    const desativar = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarMaquina).mockReturnValue({
      mutateAsync: ativar,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarMaquina>);
    vi.mocked(useDesativarMaquina).mockReturnValue({
      mutateAsync: desativar,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarMaquina>);
    vi.mocked(useMaquinas).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<MaquinasPage />, { wrapper: AppWrapper });
    return { ativar, desativar, tela: within(container) };
  }

  it('deve desativar a máquina pelo identificador quando Desativar é acionado', async () => {
    // Arrange
    const { desativar, tela } = abrir(true);

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Desativar' })[0]);

    // Assert
    expect(desativar).toHaveBeenCalledExactlyOnceWith('1');
  });

  it('deve ativar a máquina pelo identificador quando Ativar é acionado', async () => {
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
