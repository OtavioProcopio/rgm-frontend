/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({ options: [], isLoading: false }),
}));

import { SolicitacaoFilters } from '@/features/solicitacoes/components/SolicitacaoFilters';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

const FILTROS_COM_ROTULO = [
  { campo: 'Status', mapa: rotuloDoStatus },
  { campo: 'Tipo', mapa: rotuloDoTipoDeSolicitacao },
  { campo: 'Prioridade', mapa: rotuloDaPrioridade },
].flatMap(({ campo, mapa }) =>
  Object.entries(mapa).map(([valor, rotulo]) => ({ campo, valor, rotulo })),
);

afterEach(cleanup);

describe('SolicitacaoFilters — rótulos dos valores da API', () => {
  it.each(FILTROS_COM_ROTULO)(
    'deve oferecer $valor com o rótulo compartilhado quando o filtro é $campo',
    ({ campo, valor, rotulo }) => {
      // Arrange
      const filtros = { page: 0, size: 20 };

      // Act
      const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);
      const opcao = within(container)
        .getByLabelText(campo)
        .querySelector(`option[value="${valor}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );

  it.each([
    { campo: 'Status', mapa: rotuloDoStatus },
    { campo: 'Tipo', mapa: rotuloDoTipoDeSolicitacao },
    { campo: 'Prioridade', mapa: rotuloDaPrioridade },
  ])(
    'deve oferecer só os valores do mapa compartilhado quando o filtro é $campo',
    ({ campo, mapa }) => {
      // Arrange
      const filtros = { page: 0, size: 20 };

      // Act
      const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);
      const valores = [...within(container).getByLabelText(campo).querySelectorAll('option')]
        .map((opcao) => opcao.value)
        .filter((valor) => valor !== '');

      // Assert
      expect(valores).toEqual(Object.keys(mapa));
    },
  );
});

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

  async function comModelos() {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [{ id: 'm1', codigo: 'M01', descricao: 'Tambor', maquina: 'X' }] },
      isFetching: false,
    } as unknown as ReturnType<typeof useModelos>);
    return vi.mocked(useModelos);
  }

  it('deve oferecer no filtro de modelo os modelos devolvidos pela busca quando o campo recebe o foco', async () => {
    // Arrange
    await comModelos();
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />,
    );

    // Act
    fireEvent.focus(within(container).getByLabelText('Modelo'));

    // Assert
    expect(within(container).getByRole('button', { name: /^M01 - Tambor/ })).toBeDefined();
  });

  it('deve buscar no máximo 20 modelos ativos para o filtro', async () => {
    // Arrange
    const useModelos = await comModelos();
    useModelos.mockClear();

    // Act
    render(<SolicitacaoFilters filters={{ page: 0, size: 20 }} onChange={vi.fn()} />);

    // Assert
    expect(useModelos.mock.calls.map(([filtros]) => filtros)).toEqual([
      { page: 0, size: 20, ativo: true },
    ]);
  });

  it('deve filtrar pelo modelo escolhido e voltar à primeira página', async () => {
    // Arrange
    await comModelos();
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 3, size: 20, status: 'A_FAZER' }} onChange={onChange} />,
    );
    fireEvent.focus(within(container).getByLabelText('Modelo'));

    // Act
    fireEvent.click(within(container).getByRole('button', { name: /^M01 - Tambor/ }));

    // Assert
    expect(onChange).toHaveBeenCalledWith({ page: 0, size: 20, status: 'A_FAZER', modeloId: 'm1' });
  });

  it('deve tirar o filtro de modelo quando a seleção é limpa', async () => {
    // Arrange
    await comModelos();
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters filters={{ page: 2, size: 20, modeloId: 'm1' }} onChange={onChange} />,
    );

    // Act
    fireEvent.click(within(container).getByRole('button', { name: 'Limpar seleção' }));

    // Assert
    expect(onChange).toHaveBeenCalledWith({ page: 0, size: 20, modeloId: undefined });
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
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ maquina: 'VICK', page: 0 }));
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
