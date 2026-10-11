/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/shared/components/Button/Button';

describe('Button', () => {
  it('renders native button content', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDefined();
  });

  it('deve ter a altura mínima de toque quando nenhum tamanho é informado', () => {
    render(<Button>Padrão</Button>);

    expect(screen.getByRole('button', { name: 'Padrão' }).className).toContain('min-h-11');
  });

  it('deve usar a altura compacta quando o tamanho é sm', () => {
    render(<Button size="sm">Compacto</Button>);

    const classes = screen.getByRole('button', { name: 'Compacto' }).className;

    expect(classes).toContain('min-h-9');
    expect(classes).not.toContain('min-h-11');
  });

  it.each([
    { variant: 'primary', fundo: 'bg-accent', texto: 'text-on-accent' },
    { variant: 'secondary', fundo: 'bg-surface-muted', texto: 'text-fg' },
    { variant: 'ghost', fundo: 'bg-transparent', texto: 'text-fg-muted' },
    { variant: 'danger', fundo: 'bg-danger', texto: 'text-on-solid' },
  ] as const)(
    'deve usar o fundo e o texto do papel quando a variante é $variant',
    ({ variant, fundo, texto }) => {
      // Act
      render(<Button variant={variant}>Excluir</Button>);

      // Assert
      const classes = screen.getByRole('button', { name: 'Excluir' }).className.split(' ');
      expect(classes).toEqual(expect.arrayContaining([fundo, texto]));
    },
  );
});
