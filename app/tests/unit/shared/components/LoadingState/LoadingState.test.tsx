/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('renders the default title', () => {
    const { container } = render(<LoadingState />);
    expect(within(container).getByText('Carregando...')).toBeDefined();
  });

  it('renders a custom title', () => {
    const { container } = render(<LoadingState title="Carregando usuários..." />);
    expect(within(container).getByText('Carregando usuários...')).toBeDefined();
  });

  it('deve ser anunciado como estado quando carrega', () => {
    // Act
    const { container } = render(<LoadingState title="Carregando quadro..." />);

    // Assert
    expect(within(container).getByRole('status').textContent).toBe('Carregando quadro...');
  });

  it('deve manter o texto só para o leitor de tela quando o esqueleto é desenhado', () => {
    // Act
    const { container } = render(<LoadingState title="Carregando quadro..." />);

    // Assert
    expect(within(container).getByText('Carregando quadro...').className).toContain('sr-only');
  });

  it('deve desenhar o número de linhas pedido quando linhas é informado', () => {
    // Act
    const { container } = render(<LoadingState linhas={5} />);

    // Assert
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });
});
