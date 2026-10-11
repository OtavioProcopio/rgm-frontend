/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useRenomearTipoModelo } from '@/features/admin/tiposModelo/hooks/useRenomearTipoModelo';
import { EditarTipoModeloPage } from '@/features/admin/tiposModelo/pages/EditarTipoModeloPage';
import { useTiposModelo } from '@/features/admin/modelos/hooks/useTiposModelo';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/modelos/hooks/useTiposModelo', () => ({
  useTiposModelo: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/tiposModelo/hooks/useRenomearTipoModelo', () => ({
  useRenomearTipoModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(cleanup);

describe('EditarTipoModeloPage', () => {
  function renderPage() {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/tiposModelo/1/editar'] });

    return render(
      <Routes>
        <Route path="/tiposModelo/:id/editar" element={<EditarTipoModeloPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  it('shows loading state', () => {
    const { container } = renderPage();
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows not found when machine id does not match any machine', async () => {
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [{ id: '2', nome: 'VICK', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);

    const { container } = renderPage();
    expect(within(container).getByText(/tipo de modelo não encontrado/i)).toBeDefined();
  });

  it('shows the form pre-filled when machine is found', async () => {
    const { useTiposModelo } = await import('@/features/admin/modelos/hooks/useTiposModelo');
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);

    const { container } = renderPage();
    expect(within(container).getByText('Renomear tipo de modelo')).toBeDefined();
    expect(within(container).getByDisplayValue('FBOX')).toBeDefined();
  });
});

describe('EditarTipoModeloPage — renomear', () => {
  function abrir() {
    const renomear = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRenomearTipoModelo).mockReturnValue({
      mutateAsync: renomear,
      isPending: false,
    } as unknown as ReturnType<typeof useRenomearTipoModelo>);
    vi.mocked(useTiposModelo).mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTiposModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/tiposModelo/1/editar'] });
    render(
      <Routes>
        <Route path="/tiposModelo/:id/editar" element={<EditarTipoModeloPage />} />
        <Route path="/app/admin/tipos-modelo" element={<p>Lista de tipos de modelo</p>} />
      </Routes>,
      { wrapper: AppWrapper },
    );
    return { renomear };
  }

  async function renomearPara(nome: string) {
    const campo = screen.getByLabelText('Nome do tipo de modelo');
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
    expect(await screen.findByText('Lista de tipos de modelo')).toBeDefined();
  });

  it('deve mostrar o erro e ficar na tela quando renomear falha', async () => {
    // Arrange
    const { renomear } = abrir();
    renomear.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Nome já existe' }));

    // Act
    await renomearPara('VICK');

    // Assert
    expect(await screen.findByText('Não foi possível renomear o tipo de modelo')).toBeDefined();
    expect(screen.queryByText('Lista de tipos de modelo')).toBeNull();
  });

  it('deve refazer a consulta das tipos de modelo quando Tentar novamente é acionado', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useTiposModelo).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useTiposModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/tiposModelo/1/editar'] });
    render(
      <Routes>
        <Route path="/tiposModelo/:id/editar" element={<EditarTipoModeloPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
