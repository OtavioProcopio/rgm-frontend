/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModelosFilters } from './ModelosFilters';

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
      <ModelosFilters
        maquinaOptionsLoading
        onCodigoChange={vi.fn()}
        onAtivoChange={vi.fn()}
      />,
    );
    expect(within(container).getByLabelText<HTMLSelectElement>(/máquina/i).disabled).toBe(true);
  });
});
