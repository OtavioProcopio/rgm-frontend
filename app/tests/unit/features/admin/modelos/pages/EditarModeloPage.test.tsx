/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useEditarModelo } from '@/features/admin/modelos/hooks/useEditarModelo';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import { EditarModeloPage } from '@/features/admin/modelos/pages/EditarModeloPage';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('@/features/admin/modelos/hooks/useEditarModelo', () => ({
  useEditarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/modelos/components/ModeloForm', () => ({
  ModeloForm: ({ onSubmit }: { onSubmit: (payload: object) => void }) => (
    <div data-testid="modelo-form">
      <button type="button" onClick={() => onSubmit({ descricao: 'Nova descrição' })}>
        salvar-modelo
      </button>
    </div>
  ),
}));

afterEach(cleanup);

describe('EditarModeloPage', () => {
  function renderPage() {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1/editar'] });

    return render(
      <Routes>
        <Route path="/modelos/:id/editar" element={<EditarModeloPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  it('shows loading state', () => {
    const { container } = renderPage();
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows form when modelo is loaded', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: {
        id: '1',
        codigo: 'M01',
        ativo: true,
        descricao: 'Desc',
        maquina: 'Injetora',
        versao: 1,
        observacoes: null,
        temPendenciaAberta: false,
        fotoCapaUrl: null,
        criadoEm: '',
        atualizadoEm: '',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { container } = renderPage();
    expect(within(container).getByText('Editar modelo')).toBeDefined();
  });

  it('links back to modelo details', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: {
        id: '1',
        codigo: 'M01',
        ativo: true,
        descricao: 'Desc',
        maquina: 'Injetora',
        versao: 1,
        observacoes: null,
        temPendenciaAberta: false,
        fotoCapaUrl: null,
        criadoEm: '',
        atualizadoEm: '',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { container } = renderPage();
    const backLink = within(container).getByRole('link', { name: 'Voltar' });

    expect(backLink.getAttribute('href')).toBe('/app/admin/modelos/1');
  });

  it('deve não mostrar Mais ações quando o cabeçalho tem só o Voltar', async () => {
    // Arrange
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: {
        id: '1',
        codigo: 'M01',
        ativo: true,
        descricao: 'Desc',
        maquina: 'Injetora',
        versao: 1,
        observacoes: null,
        temPendenciaAberta: false,
        fotoCapaUrl: null,
        criadoEm: '',
        atualizadoEm: '',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    // Act
    const { container } = renderPage();

    // Assert
    expect(within(container).getByRole('link', { name: 'Voltar' })).toBeDefined();
    expect(within(container).queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });
});

describe('EditarModeloPage — salvar', () => {
  function abrir() {
    const editar = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEditarModelo).mockReturnValue({
      mutateAsync: editar,
      isPending: false,
    } as unknown as ReturnType<typeof useEditarModelo>);
    vi.mocked(useModelo).mockReturnValue({
      data: { id: '1', codigo: 'M01', ativo: true, descricao: 'Desc', maquina: 'FBOX' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1/editar'] });
    render(
      <Routes>
        <Route path="/modelos/:id/editar" element={<EditarModeloPage />} />
        <Route path="/app/admin/modelos/:id" element={<p>Ficha do modelo</p>} />
      </Routes>,
      { wrapper: AppWrapper },
    );
    return { editar };
  }

  it('deve salvar e abrir a ficha do modelo quando o formulário é enviado', async () => {
    // Arrange
    const { editar } = abrir();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-modelo' }));

    // Assert
    expect(editar).toHaveBeenCalledExactlyOnceWith({
      id: '1',
      payload: { descricao: 'Nova descrição' },
    });
    expect(await screen.findByText('Ficha do modelo')).toBeDefined();
  });

  it('deve mostrar o erro e ficar na tela quando salvar falha', async () => {
    // Arrange
    const { editar } = abrir();
    editar.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Código já existe' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-modelo' }));

    // Assert
    expect(await screen.findByText('Operação não concluída')).toBeDefined();
    expect(screen.queryByText('Ficha do modelo')).toBeNull();
  });

  it('deve refazer a consulta do modelo quando Tentar novamente é acionado', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useModelo).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
      refetch,
    } as unknown as ReturnType<typeof useModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1/editar'] });
    render(
      <Routes>
        <Route path="/modelos/:id/editar" element={<EditarModeloPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('deve não salvar nem oferecer Voltar quando a rota não traz o identificador do modelo', async () => {
    // Arrange
    const { editar } = abrir();
    cleanup();
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos'] });
    render(<EditarModeloPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-modelo' }));

    // Assert
    expect(editar).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Voltar' })).toBeNull();
  });
});
