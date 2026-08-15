/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({ options: [], isLoading: false }),
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

  it('shows maquina filter when maquinas are available and calls onChange', async () => {
    const { useMaquinaOptions } = await import('@/features/admin/modelos/hooks/useMaquinaOptions');
    vi.mocked(useMaquinaOptions).mockReturnValue({
      options: [{ value: 'VICK', label: 'VICK' }],
      isLoading: false,
    });

    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={onChange} />,
    );
    const select = within(container).getByLabelText(/máquina/i) as HTMLSelectElement;
    expect(within(container).getByText('VICK')).toBeDefined();

    select.value = 'VICK';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maquina: 'VICK', page: 0 }),
    );
  });

  it('does not render maquina filter when no maquinas are available', async () => {
    const { useMaquinaOptions } = await import('@/features/admin/modelos/hooks/useMaquinaOptions');
    vi.mocked(useMaquinaOptions).mockReturnValue({ options: [], isLoading: false });

    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );
    expect(within(container).queryByLabelText(/máquina/i)).toBeNull();
  });
});
