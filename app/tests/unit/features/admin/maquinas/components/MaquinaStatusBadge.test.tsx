/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MaquinaStatusBadge } from '@/features/admin/maquinas/components/MaquinaStatusBadge';

const FORMA_DO_SELO = ['inline-flex', 'rounded-full', 'text-xs', 'font-medium'];

const SITUACOES = [
  { ativo: true, rotulo: 'Ativa', variacao: ['bg-success-soft', 'text-success-fg'] },
  { ativo: false, rotulo: 'Inativa', variacao: ['bg-surface-muted', 'text-fg-muted'] },
];

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('MaquinaStatusBadge', () => {
  it.each(SITUACOES)('deve mostrar o texto $rotulo quando ativo é $ativo', ({ ativo, rotulo }) => {
    // Act
    render(<MaquinaStatusBadge ativo={ativo} />);

    // Assert
    expect(screen.getByText(rotulo).textContent).toBe(rotulo);
  });

  it.each(SITUACOES)(
    'deve ter a forma do selo compartilhado quando ativo é $ativo',
    ({ ativo, rotulo }) => {
      // Act
      render(<MaquinaStatusBadge ativo={ativo} />);

      // Assert
      expect(classes(screen.getByText(rotulo))).toEqual(expect.arrayContaining(FORMA_DO_SELO));
    },
  );

  it.each(SITUACOES)(
    'deve usar a variação do papel de $rotulo quando ativo é $ativo',
    ({ ativo, rotulo, variacao }) => {
      // Act
      render(<MaquinaStatusBadge ativo={ativo} />);

      // Assert
      expect(classes(screen.getByText(rotulo))).toEqual(expect.arrayContaining(variacao));
    },
  );
});
