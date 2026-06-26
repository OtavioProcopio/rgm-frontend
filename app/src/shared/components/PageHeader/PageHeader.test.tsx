/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('renders the title', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(within(container).getByText('Usuários')).toBeDefined();
  });

  it('renders description when provided', () => {
    const { container } = render(<PageHeader title="Usuários" description="Gerencie usuários." />);
    expect(within(container).getByText('Gerencie usuários.')).toBeDefined();
  });

  it('does not render description element when omitted', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders actions slot when provided', () => {
    const { container } = render(
      <PageHeader title="Usuários" actions={<button>Novo</button>} />,
    );
    expect(within(container).getByRole('button', { name: 'Novo' })).toBeDefined();
  });

  it('does not render actions wrapper when omitted', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(within(container).queryByRole('button')).toBeNull();
  });
});
