/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EmptyState } from '@/shared/components/EmptyState/EmptyState';

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

  it('deve mostrar a ação quando ela é informada', () => {
    // Arrange
    const acao = <button type="button">Limpar filtro</button>;

    // Act
    const { container } = render(<EmptyState title="Nenhum item" action={acao} />);

    // Assert
    expect(within(container).getByRole('button', { name: 'Limpar filtro' })).toBeDefined();
  });

  it('deve não ter controle interativo quando nenhuma ação é informada', () => {
    // Act
    const { container } = render(<EmptyState title="Nenhum item" description="Crie um novo." />);

    // Assert
    expect(within(container).queryByRole('button')).toBeNull();
    expect(within(container).queryByRole('link')).toBeNull();
  });
});
