/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('renders the title', () => {
    const { container } = render(<EmptyState title="Nenhum item" />);
    expect(within(container).getByText('Nenhum item')).toBeDefined();
  });

  it('renders description when provided', () => {
    const { container } = render(<EmptyState title="Nenhum item" description="Crie um novo." />);
    expect(within(container).getByText('Crie um novo.')).toBeDefined();
  });

  it('does not render description paragraph when omitted', () => {
    const { container } = render(<EmptyState title="Nenhum item" />);
    expect(within(container).queryByText(/p/i)).toBeNull();
    expect(container.querySelector('p')).toBeNull();
  });
});
