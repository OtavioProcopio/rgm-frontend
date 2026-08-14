/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { EditarModeloPage } from './EditarModeloPage';

vi.mock('../hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('../hooks/useEditarModelo', () => ({
  useEditarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/ModeloForm', () => ({
  ModeloForm: () => <div data-testid="modelo-form" />,
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
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { id: '1', codigo: 'M01', ativo: true, descricao: 'Desc', maquina: 'Injetora', versao: 1, observacoes: null, temPendenciaAberta: false, fotoCapaUrl: null, criadoEm: '', atualizadoEm: '' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { container } = renderPage();
    expect(within(container).getByText('Editar modelo')).toBeDefined();
  });

  it('links back to modelo details', async () => {
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { id: '1', codigo: 'M01', ativo: true, descricao: 'Desc', maquina: 'Injetora', versao: 1, observacoes: null, temPendenciaAberta: false, fotoCapaUrl: null, criadoEm: '', atualizadoEm: '' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { container } = renderPage();
    const backLink = within(container).getByRole('link', { name: 'Voltar' });

    expect(backLink.getAttribute('href')).toBe('/app/admin/modelos/1');
  });
});
