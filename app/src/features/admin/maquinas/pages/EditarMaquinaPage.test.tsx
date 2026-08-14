/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { EditarMaquinaPage } from './EditarMaquinaPage';

vi.mock('@/features/admin/modelos/hooks/useMaquinas', () => ({
  useMaquinas: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../hooks/useRenomearMaquina', () => ({
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
