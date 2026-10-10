/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('SolicitacaoFilters — etiquetas dos filtros sem controle próprio', () => {
  it('deve mostrar a etiqueta Em atraso quando atrasada é verdadeiro', () => {
    // Arrange
    const filtros = { page: 0, size: 20, atrasada: true };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(within(container).getByText('Em atraso')).toBeDefined();
  });

  it('deve mostrar a etiqueta Em aberto quando emAberto é verdadeiro', () => {
    // Arrange
    const filtros = { page: 0, size: 20, emAberto: true };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(within(container).getByText('Em aberto')).toBeDefined();
  });

  it('deve mostrar as duas etiquetas quando atrasada e emAberto são verdadeiros', () => {
    // Arrange
    const filtros = { page: 0, size: 20, atrasada: true, emAberto: true };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(within(container).getAllByRole('button', { name: /^Remover filtro/ })).toHaveLength(2);
  });

  it('deve não mostrar etiqueta quando nenhum dos dois filtros está ativo', () => {
    // Arrange
    const filtros = { page: 0, size: 20 };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(within(container).queryAllByRole('button', { name: /^Remover filtro/ })).toHaveLength(0);
  });

  it('deve não mostrar etiqueta quando atrasada e emAberto são falsos', () => {
    // Arrange
    const filtros = { page: 0, size: 20, atrasada: false, emAberto: false };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(within(container).queryAllByRole('button', { name: /^Remover filtro/ })).toHaveLength(0);
  });

  it('deve expor a etiqueta como botão com nome Remover filtro Em atraso quando atrasada é verdadeiro', () => {
    // Arrange
    const filtros = { page: 0, size: 20, atrasada: true };

    // Act
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={vi.fn()} />);

    // Assert
    expect(
      within(container).getByRole('button', { name: 'Remover filtro Em atraso' }),
    ).toBeDefined();
  });

  it('deve remover só atrasada e voltar à primeira página quando clicar em Remover filtro Em atraso', () => {
    // Arrange
    const onChange = vi.fn();
    const filtros = { page: 3, size: 20, atrasada: true, emAberto: true };
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={onChange} />);

    // Act
    fireEvent.click(within(container).getByRole('button', { name: 'Remover filtro Em atraso' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      atrasada: undefined,
      emAberto: true,
    });
  });

  it('deve remover só emAberto e voltar à primeira página quando clicar em Remover filtro Em aberto', () => {
    // Arrange
    const onChange = vi.fn();
    const filtros = { page: 3, size: 20, atrasada: true, emAberto: true };
    const { container } = render(<SolicitacaoFilters filters={filtros} onChange={onChange} />);

    // Act
    fireEvent.click(within(container).getByRole('button', { name: 'Remover filtro Em aberto' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      atrasada: true,
      emAberto: undefined,
    });
  });
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

describe('SolicitacaoFilters — manipuladores dos filtros com controle próprio', () => {
  const BASE = { page: 3, size: 20 };

  it.each([
    { campo: 'Status', chave: 'status', valor: 'A_FAZER' },
    { campo: 'Tipo', chave: 'tipo', valor: 'REPARO' },
    { campo: 'Prioridade', chave: 'prioridade', valor: 'URGENTE' },
  ])(
    'deve filtrar por $chave e voltar à primeira página quando um valor é escolhido',
    ({ campo, chave, valor }) => {
      // Arrange
      const onChange = vi.fn();
      const { container } = render(<SolicitacaoFilters filters={BASE} onChange={onChange} />);

      // Act
      fireEvent.change(within(container).getByLabelText(campo), { target: { value: valor } });

      // Assert
      expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, [chave]: valor });
    },
  );

  it.each([
    { campo: 'Status', chave: 'status', valor: 'A_FAZER' },
    { campo: 'Tipo', chave: 'tipo', valor: 'REPARO' },
    { campo: 'Prioridade', chave: 'prioridade', valor: 'URGENTE' },
  ])(
    'deve tirar o filtro de $chave e voltar à primeira página quando o valor é limpo',
    ({ campo, chave, valor }) => {
      // Arrange
      const onChange = vi.fn();
      const { container } = render(
        <SolicitacaoFilters filters={{ ...BASE, [chave]: valor }} onChange={onChange} />,
      );

      // Act
      fireEvent.change(within(container).getByLabelText(campo), { target: { value: '' } });

      // Assert
      expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, [chave]: undefined });
    },
  );

  it('deve filtrar pelo início do dia quando a data inicial é escolhida', () => {
    // Arrange
    const onChange = vi.fn();
    const { container } = render(<SolicitacaoFilters filters={BASE} onChange={onChange} />);

    // Act
    fireEvent.change(within(container).getByLabelText('Criada a partir de'), {
      target: { value: '2026-10-01' },
    });

    // Assert
    expect(onChange).toHaveBeenCalledWith({
      ...BASE,
      page: 0,
      criadaEmInicio: '2026-10-01T00:00:00Z',
    });
  });

  it('deve tirar a data inicial quando o campo é limpo', () => {
    // Arrange
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters
        filters={{ ...BASE, criadaEmInicio: '2026-10-01T00:00:00Z' }}
        onChange={onChange}
      />,
    );

    // Act
    fireEvent.change(within(container).getByLabelText('Criada a partir de'), {
      target: { value: '' },
    });

    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, criadaEmInicio: undefined });
  });

  it('deve filtrar até o fim do dia quando a data final é escolhida', () => {
    // Arrange
    const onChange = vi.fn();
    const { container } = render(<SolicitacaoFilters filters={BASE} onChange={onChange} />);

    // Act
    fireEvent.change(within(container).getByLabelText('Criada até'), {
      target: { value: '2026-10-09' },
    });

    // Assert
    expect(onChange).toHaveBeenCalledWith({
      ...BASE,
      page: 0,
      criadaEmFim: '2026-10-09T23:59:59Z',
    });
  });

  it('deve tirar a data final quando o campo é limpo', () => {
    // Arrange
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters
        filters={{ ...BASE, criadaEmFim: '2026-10-09T23:59:59Z' }}
        onChange={onChange}
      />,
    );

    // Act
    fireEvent.change(within(container).getByLabelText('Criada até'), { target: { value: '' } });

    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, criadaEmFim: undefined });
  });
});

describe('SolicitacaoFilters — volta a "Todos" com interação de usuário', () => {
  const BASE = { page: 3, size: 20 };

  it.each([
    { campo: 'Status', chave: 'status', valor: 'A_FAZER' },
    { campo: 'Tipo', chave: 'tipo', valor: 'REPARO' },
    { campo: 'Prioridade', chave: 'prioridade', valor: 'URGENTE' },
  ])(
    'deve limpar o filtro de $chave quando o usuário escolhe a opção de apoio',
    async ({ campo, chave, valor }) => {
      // Arrange
      const onChange = vi.fn();
      const { container } = render(
        <SolicitacaoFilters filters={{ ...BASE, [chave]: valor }} onChange={onChange} />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(campo), '');

      // Assert
      expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, [chave]: undefined });
    },
  );

  it('deve limpar o filtro de maquina quando o usuário escolhe a opção de apoio', async () => {
    // Arrange
    const { useMaquinaOptions } = await import('@/features/admin/modelos/hooks/useMaquinaOptions');
    vi.mocked(useMaquinaOptions).mockReturnValue({
      options: [{ value: 'VICK', label: 'VICK' }],
      isLoading: false,
    });
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters filters={{ ...BASE, maquina: 'VICK' }} onChange={onChange} />,
    );

    // Act
    await userEvent.selectOptions(within(container).getByLabelText('Máquina'), '');

    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, maquina: undefined });
  });

  it('deve limpar o filtro de modelo quando o usuário clica em Limpar seleção', async () => {
    // Arrange
    const onChange = vi.fn();
    const { container } = render(
      <SolicitacaoFilters filters={{ ...BASE, modeloId: 'm1' }} onChange={onChange} />,
    );

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Limpar seleção' }));

    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...BASE, page: 0, modeloId: undefined });
  });
});
