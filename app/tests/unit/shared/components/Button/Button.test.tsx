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

  it('deve usar a cor de perigo quando a variante é danger', () => {
    render(<Button variant="danger">Excluir</Button>);

    const classes = screen.getByRole('button', { name: 'Excluir' }).className;

    expect(classes).toContain('bg-red-600');
    expect(classes).not.toContain('bg-sky-600');
  });
});
