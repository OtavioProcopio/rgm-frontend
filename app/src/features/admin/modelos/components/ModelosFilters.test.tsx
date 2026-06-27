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
});
