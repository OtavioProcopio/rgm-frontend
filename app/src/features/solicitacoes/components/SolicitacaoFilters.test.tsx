/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined }),
}));

import { SolicitacaoFilters } from './SolicitacaoFilters';

afterEach(cleanup);

describe('SolicitacaoFilters', () => {
  it('renders status select', () => {
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );
    expect(within(container).getByLabelText(/status/i)).toBeDefined();
  });

  it('renders status options', () => {
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );
    expect(within(container).getByText('A fazer')).toBeDefined();
    expect(within(container).getByText('Em andamento')).toBeDefined();
    expect(within(container).getByText('Concluída')).toBeDefined();
  });

  it('shows modelo filter when modelos are available', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [{ id: 'm1', codigo: 'M01', descricao: '', maquina: 'X', versao: 1, observacoes: null, temPendenciaAberta: false, ativo: true, fotoCapaUrl: null, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
    } as unknown as ReturnType<typeof useModelos>);

    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );
    expect(within(container).getByText('M01')).toBeDefined();
  });

  it('renders date filters', () => {
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );
    expect(within(container).getByLabelText(/criada a partir de/i)).toBeDefined();
    expect(within(container).getByLabelText(/criada até/i)).toBeDefined();
  });
});
