/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Badge } from '@/shared/components/Badge/Badge';

const VARIACOES = [
  { variant: 'neutral', fundo: 'bg-surface-muted', texto: 'text-fg-muted' },
  { variant: 'accent', fundo: 'bg-accent', texto: 'text-on-accent' },
  { variant: 'success', fundo: 'bg-success-soft', texto: 'text-success-fg' },
  { variant: 'warning', fundo: 'bg-warning-soft', texto: 'text-warning-fg' },
  { variant: 'danger', fundo: 'bg-danger-soft', texto: 'text-danger-fg' },
  { variant: 'info', fundo: 'bg-info-soft', texto: 'text-info-fg' },
] as const;
const NEUTRO = VARIACOES[0];
const TEXTO = 'Em validação';

const selo = () => screen.getByText(TEXTO);
const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('Badge', () => {
  it.each(VARIACOES)(
    'deve usar o fundo e o texto do papel quando a variação é $variant',
    ({ variant, fundo, texto }) => {
      // Act
      render(<Badge variant={variant}>{TEXTO}</Badge>);

      // Assert
      expect(classes(selo())).toEqual(expect.arrayContaining([fundo, texto]));
    },
  );

  it('deve ser neutro quando a variação não é informada', () => {
    // Act
    render(<Badge>{TEXTO}</Badge>);

    // Assert
    expect(classes(selo())).toEqual(expect.arrayContaining([NEUTRO.fundo, NEUTRO.texto]));
  });

  it('deve mostrar o texto recebido', () => {
    // Act
    render(<Badge>{TEXTO}</Badge>);

    // Assert
    expect(selo().textContent).toBe(TEXTO);
  });

  it('deve mostrar o ícone antes do texto quando o ícone é informado', () => {
    // Arrange
    const icone = <svg data-testid="icone" aria-hidden="true" />;

    // Act
    render(<Badge icon={icone}>{TEXTO}</Badge>);

    // Assert
    expect(selo().firstElementChild).toBe(screen.getByTestId('icone'));
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Arrange
    const extra = 'ml-2';

    // Act
    render(<Badge className={extra}>{TEXTO}</Badge>);

    // Assert
    expect(classes(selo())).toContain(extra);
  });
});
