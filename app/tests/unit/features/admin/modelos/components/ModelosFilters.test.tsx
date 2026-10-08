/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModelosFilters } from '@/features/admin/modelos/components/ModelosFilters';

afterEach(cleanup);

describe('ModelosFilters', () => {
  it('renders codigo input and status select', () => {
    const { container } = render(
      <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByLabelText(/código/i)).toBeDefined();
    expect(within(container).getByLabelText(/status/i)).toBeDefined();
  });

  it('shows current codigo value', () => {
    const { container } = render(
      <ModelosFilters codigo="M01" onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    const input = within(container).getByDisplayValue('M01');
    expect(input).toBeDefined();
  });

  it('shows ativo filter options', () => {
    const { container } = render(
      <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Ativos')).toBeDefined();
    expect(within(container).getByText('Inativos')).toBeDefined();
  });

  it('renders descricao and maquina inputs', () => {
    const { container } = render(
      <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByLabelText(/descrição/i)).toBeDefined();
    expect(within(container).getByLabelText(/máquina/i)).toBeDefined();
  });

  it('shows current descricao and maquina values', () => {
    const { container } = render(
      <ModelosFilters
        descricao="My Description"
        maquina="My Machine"
        maquinaOptions={[{ value: 'My Machine', label: 'My Machine' }]}
        onCodigoChange={vi.fn()}
        onAtivoChange={vi.fn()}
      />,
    );
    expect(within(container).getByDisplayValue('My Description')).toBeDefined();
    expect(within(container).getByDisplayValue('My Machine')).toBeDefined();
  });

  it('lists machine options from the catalog', () => {
    const { container } = render(
      <ModelosFilters
        maquinaOptions={[
          { value: 'FBOX', label: 'FBOX' },
          { value: 'VICK', label: 'VICK' },
        ]}
        onCodigoChange={vi.fn()}
        onAtivoChange={vi.fn()}
      />,
    );
    const select = within(container).getByLabelText(/máquina/i);
    expect(select.tagName).toBe('SELECT');
    expect(within(select).getByRole('option', { name: 'FBOX' })).toBeDefined();
    expect(within(select).getByRole('option', { name: 'VICK' })).toBeDefined();
  });

  it('disables the machine select while options are loading', () => {
    const { container } = render(
      <ModelosFilters maquinaOptionsLoading onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByLabelText<HTMLSelectElement>(/máquina/i).disabled).toBe(true);
  });

  describe('seção recolhível', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('deve exibir a seção Filtros aberta quando nada foi guardado', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      const botao = within(container).getByRole('button', { name: /filtros/i });

      // Assert
      expect(botao.getAttribute('aria-expanded')).toBe('true');
    });

    it('deve mostrar apenas Filtros no resumo quando nenhum filtro está preenchido', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      fireEvent.click(within(container).getByRole('button', { name: /filtros/i }));

      // Assert
      expect(within(container).getByRole('button').textContent).toBe('Filtros');
    });

    it('deve mostrar 2 ativos no resumo quando código e status estão preenchidos', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters
          codigo="M01"
          ativo={false}
          onCodigoChange={vi.fn()}
          onAtivoChange={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(within(container).getByRole('button', { name: /filtros/i }));

      // Assert
      expect(within(container).getByRole('button').textContent).toBe('Filtros · 2 ativos');
    });

    it('deve mostrar 1 ativo no resumo quando só um filtro está preenchido', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters descricao="abc" onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      fireEvent.click(within(container).getByRole('button', { name: /filtros/i }));

      // Assert
      expect(within(container).getByRole('button').textContent).toBe('Filtros · 1 ativo');
    });

    it('deve manter os campos montados com o valor quando a seção é recolhida', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters codigo="M01" onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      fireEvent.click(within(container).getByRole('button', { name: /filtros/i }));

      // Assert
      const campo = container.querySelector<HTMLInputElement>('input[value="M01"]');
      expect(campo?.value).toBe('M01');
    });

    it('deve guardar o estado fechado quando a seção é recolhida', () => {
      // Arrange
      const { container } = render(
        <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      fireEvent.click(within(container).getByRole('button', { name: /filtros/i }));

      // Assert
      expect(localStorage.getItem('rgm.secao.filtros-modelos')).toBe('fechada');
    });
  });
});
