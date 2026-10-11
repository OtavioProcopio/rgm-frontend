/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useRenomearMaquina } from '@/features/admin/maquinas/hooks/useRenomearMaquina';
import { EditarMaquinaPage } from '@/features/admin/maquinas/pages/EditarMaquinaPage';
import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/modelos/hooks/useMaquinas', () => ({
  useMaquinas: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/maquinas/hooks/useRenomearMaquina', () => ({
  useRenomearMaquina: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(cleanup);

describe('EditarMaquinaPage', () => {
  function renderPage() {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/maquinas/1/editar'] });

    return render(
      <Routes>
        <Route path="/maquinas/:id/editar" element={<EditarMaquinaPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  it('shows loading state', () => {
    const { container } = renderPage();
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows not found when machine id does not match any machine', async () => {
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    vi.mocked(useMaquinas).mockReturnValue({
      data: [{ id: '2', nome: 'VICK', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);

    const { container } = renderPage();
    expect(within(container).getByText(/máquina não encontrada/i)).toBeDefined();
  });

  it('shows the form pre-filled when machine is found', async () => {
    const { useMaquinas } = await import('@/features/admin/modelos/hooks/useMaquinas');
    vi.mocked(useMaquinas).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);

    const { container } = renderPage();
    expect(within(container).getByText('Renomear máquina')).toBeDefined();
    expect(within(container).getByDisplayValue('FBOX')).toBeDefined();
  });
});

describe('EditarMaquinaPage — renomear', () => {
  function abrir() {
    const renomear = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRenomearMaquina).mockReturnValue({
      mutateAsync: renomear,
      isPending: false,
    } as unknown as ReturnType<typeof useRenomearMaquina>);
    vi.mocked(useMaquinas).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinas>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/maquinas/1/editar'] });
    render(
      <Routes>
        <Route path="/maquinas/:id/editar" element={<EditarMaquinaPage />} />
        <Route path="/app/admin/maquinas" element={<p>Lista de máquinas</p>} />
      </Routes>,
      { wrapper: AppWrapper },
    );
    return { renomear };
  }

  async function renomearPara(nome: string) {
    const campo = screen.getByLabelText('Nome da máquina');
    await userEvent.clear(campo);
    await userEvent.type(campo, nome);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  }

  it('deve renomear e voltar à lista quando o novo nome é salvo', async () => {
    // Arrange
    const { renomear } = abrir();

    // Act
    await renomearPara('FAST LOOP');

    // Assert
    expect(renomear).toHaveBeenCalledExactlyOnceWith({ id: '1', payload: { nome: 'FAST LOOP' } });
    expect(await screen.findByText('Lista de máquinas')).toBeDefined();
  });

  it('deve mostrar o erro e ficar na tela quando renomear falha', async () => {
    // Arrange
    const { renomear } = abrir();
    renomear.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Nome já existe' }));

    // Act
    await renomearPara('VICK');

    // Assert
    expect(await screen.findByText('Não foi possível renomear a máquina')).toBeDefined();
    expect(screen.queryByText('Lista de máquinas')).toBeNull();
  });

  it('deve refazer a consulta das máquinas quando Tentar novamente é acionado', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useMaquinas).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useMaquinas>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/maquinas/1/editar'] });
    render(
      <Routes>
        <Route path="/maquinas/:id/editar" element={<EditarMaquinaPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
