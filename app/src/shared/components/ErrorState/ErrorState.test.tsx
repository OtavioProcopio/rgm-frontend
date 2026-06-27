/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ErrorState } from './ErrorState';

afterEach(cleanup);

describe('ErrorState', () => {
  it('renders the default title when none provided', () => {
    const { container } = render(<ErrorState />);
    expect(within(container).getByText('Não foi possível carregar os dados.')).toBeDefined();
  });

  it('renders a custom title', () => {
    const { container } = render(<ErrorState title="Erro ao salvar" />);
    expect(within(container).getByText('Erro ao salvar')).toBeDefined();
  });

  it('renders description when provided', () => {
    const { container } = render(<ErrorState description="Tente novamente mais tarde." />);
    expect(within(container).getByText('Tente novamente mais tarde.')).toBeDefined();
  });

  it('does not render description element when omitted', () => {
    const { container } = render(<ErrorState title="Erro" />);
    expect(container.querySelector('p')).toBeNull();
  });
});
