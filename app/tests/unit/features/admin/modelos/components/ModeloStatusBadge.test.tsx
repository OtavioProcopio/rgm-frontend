/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ModeloStatusBadge } from '@/features/admin/modelos/components/ModeloStatusBadge';

afterEach(cleanup);

const FORMA_DO_SELO = 'rounded-full';
const SELO_DE_SUCESSO = ['bg-success-soft', 'text-success-fg'];
const SELO_NEUTRO = ['bg-surface-muted', 'text-fg-muted'];
const classes = (elemento: Element) => elemento.className.split(' ');

describe('ModeloStatusBadge', () => {
  it('renders active label', () => {
    render(<ModeloStatusBadge ativo />);

    expect(screen.getByText('Ativo')).toBeDefined();
  });

  it('deve mostrar o texto Inativo quando o modelo está inativo', () => {
    // Act
    render(<ModeloStatusBadge ativo={false} />);

    // Assert
    expect(screen.getByText('Inativo')).toBeDefined();
  });

  it('deve ter a forma do selo compartilhado quando o modelo está ativo', () => {
    // Act
    render(<ModeloStatusBadge ativo />);

    // Assert
    expect(classes(screen.getByText('Ativo'))).toContain(FORMA_DO_SELO);
  });

  it('deve usar a variação de sucesso quando o modelo está ativo', () => {
    // Act
    render(<ModeloStatusBadge ativo />);

    // Assert
    expect(classes(screen.getByText('Ativo'))).toEqual(expect.arrayContaining(SELO_DE_SUCESSO));
  });

  it('deve usar a variação neutra quando o modelo está inativo', () => {
    // Act
    render(<ModeloStatusBadge ativo={false} />);

    // Assert
    expect(classes(screen.getByText('Inativo'))).toEqual(expect.arrayContaining(SELO_NEUTRO));
  });
});
