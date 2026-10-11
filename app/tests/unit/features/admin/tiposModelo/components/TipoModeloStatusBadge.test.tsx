/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TipoModeloStatusBadge } from '@/features/admin/tiposModelo/components/TipoModeloStatusBadge';

const FORMA_DO_SELO = ['inline-flex', 'rounded-full', 'text-xs', 'font-medium'];

const SITUACOES = [
  { ativo: true, rotulo: 'Ativo', variacao: ['bg-success-soft', 'text-success-fg'] },
  { ativo: false, rotulo: 'Inativo', variacao: ['bg-surface-muted', 'text-fg-muted'] },
];

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('TipoModeloStatusBadge', () => {
  it.each(SITUACOES)('deve mostrar o texto $rotulo quando ativo é $ativo', ({ ativo, rotulo }) => {
    // Act
    render(<TipoModeloStatusBadge ativo={ativo} />);

    // Assert
    expect(screen.getByText(rotulo).textContent).toBe(rotulo);
  });

  it.each(SITUACOES)(
    'deve ter a forma do selo compartilhado quando ativo é $ativo',
    ({ ativo, rotulo }) => {
      // Act
      render(<TipoModeloStatusBadge ativo={ativo} />);

      // Assert
      expect(classes(screen.getByText(rotulo))).toEqual(expect.arrayContaining(FORMA_DO_SELO));
    },
  );

  it.each(SITUACOES)(
    'deve usar a variação do papel de $rotulo quando ativo é $ativo',
    ({ ativo, rotulo, variacao }) => {
      // Act
      render(<TipoModeloStatusBadge ativo={ativo} />);

      // Assert
      expect(classes(screen.getByText(rotulo))).toEqual(expect.arrayContaining(variacao));
    },
  );
});
