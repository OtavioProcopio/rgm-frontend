/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { EditarModeloPage } from './EditarModeloPage';

vi.mock('../hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('../hooks/useEditarModelo', () => ({
  useEditarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUploadFotoCapa', () => ({
  useUploadFotoCapa: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/ModeloForm', () => ({
  ModeloForm: () => <div data-testid="modelo-form" />,
}));
vi.mock('../components/ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div data-testid="modelo-foto" />,
}));
vi.mock('../components/UploadFotoCapaDialog', () => ({
  UploadFotoCapaDialog: () => null,
}));

afterEach(cleanup);

describe('EditarModeloPage', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<EditarModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows form when modelo is loaded', async () => {
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { id: '1', codigo: 'M01', ativo: true, descricao: 'Desc', maquinaId: 'm1', fotoCapa: null, criadoEm: '', atualizadoEm: '' },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useModelo>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<EditarModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Editar modelo')).toBeDefined();
  });
});
