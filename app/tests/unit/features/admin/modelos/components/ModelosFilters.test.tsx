/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModelosFilters } from '@/features/admin/modelos/components/ModelosFilters';

afterEach(cleanup);

describe('ModelosFilters', () => {
  describe('alterações dos filtros', () => {
    const maquinas = [
      { value: 'FBOX', label: 'FBOX' },
      { value: 'VICK', label: 'VICK' },
    ];

    it('deve chamar onCodigoChange com o texto quando o usuário digita no campo Código', async () => {
      // Arrange
      const onCodigoChange = vi.fn();
      const { container } = render(
        <ModelosFilters onCodigoChange={onCodigoChange} onAtivoChange={vi.fn()} />,
      );

      // Act
      await userEvent.type(within(container).getByLabelText(/código/i), 'M');

      // Assert
      expect(onCodigoChange).toHaveBeenCalledTimes(1);
      expect(onCodigoChange).toHaveBeenCalledWith('M');
    });

    it('deve chamar onCodigoChange com undefined quando o usuário limpa o campo Código', async () => {
      // Arrange
      const onCodigoChange = vi.fn();
      const { container } = render(
        <ModelosFilters codigo="M" onCodigoChange={onCodigoChange} onAtivoChange={vi.fn()} />,
      );

      // Act
      await userEvent.clear(within(container).getByLabelText(/código/i));

      // Assert
      expect(onCodigoChange).toHaveBeenCalledTimes(1);
      expect(onCodigoChange).toHaveBeenCalledWith(undefined);
    });

    it('deve chamar onDescricaoChange com o texto quando o usuário digita em Descrição', async () => {
      // Arrange
      const onDescricaoChange = vi.fn();
      const { container } = render(
        <ModelosFilters
          onCodigoChange={vi.fn()}
          onDescricaoChange={onDescricaoChange}
          onAtivoChange={vi.fn()}
        />,
      );

      // Act
      await userEvent.type(within(container).getByLabelText(/descrição/i), 'D');

      // Assert
      expect(onDescricaoChange).toHaveBeenCalledTimes(1);
      expect(onDescricaoChange).toHaveBeenCalledWith('D');
    });

    it('deve chamar onMaquinaChange com o valor quando o usuário escolhe uma máquina', async () => {
      // Arrange
      const onMaquinaChange = vi.fn();
      const { container } = render(
        <ModelosFilters
          maquinaOptions={maquinas}
          onCodigoChange={vi.fn()}
          onMaquinaChange={onMaquinaChange}
          onAtivoChange={vi.fn()}
        />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(/máquina/i), 'VICK');

      // Assert
      expect(onMaquinaChange).toHaveBeenCalledTimes(1);
      expect(onMaquinaChange).toHaveBeenCalledWith('VICK');
    });

    it('deve chamar onMaquinaChange com undefined quando o usuário volta para Todas', async () => {
      // Arrange
      const onMaquinaChange = vi.fn();
      const { container } = render(
        <ModelosFilters
          maquina="FBOX"
          maquinaOptions={maquinas}
          onCodigoChange={vi.fn()}
          onMaquinaChange={onMaquinaChange}
          onAtivoChange={vi.fn()}
        />,
      );

      // Act
      fireEvent.change(within(container).getByLabelText(/máquina/i), { target: { value: '' } });

      // Assert
      expect(onMaquinaChange).toHaveBeenCalledTimes(1);
      expect(onMaquinaChange).toHaveBeenCalledWith(undefined);
    });

    it('deve chamar onAtivoChange com true quando o usuário escolhe Ativos', async () => {
      // Arrange
      const onAtivoChange = vi.fn();
      const { container } = render(
        <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={onAtivoChange} />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(/status/i), 'Ativos');

      // Assert
      expect(onAtivoChange).toHaveBeenCalledTimes(1);
      expect(onAtivoChange).toHaveBeenCalledWith(true);
    });

    it('deve chamar onAtivoChange com false quando o usuário escolhe Inativos', async () => {
      // Arrange
      const onAtivoChange = vi.fn();
      const { container } = render(
        <ModelosFilters onCodigoChange={vi.fn()} onAtivoChange={onAtivoChange} />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(/status/i), 'Inativos');

      // Assert
      expect(onAtivoChange).toHaveBeenCalledTimes(1);
      expect(onAtivoChange).toHaveBeenCalledWith(false);
    });

    it('deve chamar onAtivoChange com undefined quando o usuário volta para Todos', async () => {
      // Arrange
      const onAtivoChange = vi.fn();
      const { container } = render(
        <ModelosFilters ativo={true} onCodigoChange={vi.fn()} onAtivoChange={onAtivoChange} />,
      );

      // Act
      fireEvent.change(within(container).getByLabelText(/status/i), { target: { value: '' } });

      // Assert
      expect(onAtivoChange).toHaveBeenCalledTimes(1);
      expect(onAtivoChange).toHaveBeenCalledWith(undefined);
    });

    it('deve chamar onMaquinaChange com undefined quando o usuário escolhe a opção Todas', async () => {
      // Arrange
      const onMaquinaChange = vi.fn();
      const { container } = render(
        <ModelosFilters
          maquina="FBOX"
          maquinaOptions={maquinas}
          onCodigoChange={vi.fn()}
          onMaquinaChange={onMaquinaChange}
          onAtivoChange={vi.fn()}
        />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(/máquina/i), '');

      // Assert
      expect(onMaquinaChange).toHaveBeenCalledWith(undefined);
    });

    it('deve chamar onAtivoChange com undefined quando o usuário escolhe a opção Todos', async () => {
      // Arrange
      const onAtivoChange = vi.fn();
      const { container } = render(
        <ModelosFilters ativo={true} onCodigoChange={vi.fn()} onAtivoChange={onAtivoChange} />,
      );

      // Act
      await userEvent.selectOptions(within(container).getByLabelText(/status/i), '');

      // Assert
      expect(onAtivoChange).toHaveBeenCalledWith(undefined);
    });
  });

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
