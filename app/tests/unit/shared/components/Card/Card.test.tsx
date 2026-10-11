/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Card } from '@/shared/components/Card/Card';

const CONTEUDO = 'Solicitações abertas';
const MOLDURA = ['rounded-xl', 'border', 'border-line', 'bg-surface'];

const cartao = () => screen.getByText(CONTEUDO);
const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('Card', () => {
  it('deve ter superfície, borda e canto pelos papéis', () => {
    // Act
    render(<Card>{CONTEUDO}</Card>);

    // Assert
    expect(classes(cartao())).toEqual(expect.arrayContaining(MOLDURA));
  });

  it('deve mostrar o conteúdo recebido', () => {
    // Act
    render(<Card>{CONTEUDO}</Card>);

    // Assert
    expect(cartao().textContent).toBe(CONTEUDO);
  });

  it('deve ser um div quando a etiqueta não é informada', () => {
    // Act
    render(<Card>{CONTEUDO}</Card>);

    // Assert
    expect(cartao().tagName).toBe('DIV');
  });

  it.each(['section', 'article', 'li'] as const)(
    'deve usar a etiqueta %s quando ela é informada',
    (etiqueta) => {
      // Act
      render(<Card as={etiqueta}>{CONTEUDO}</Card>);

      // Assert
      expect(cartao().tagName).toBe(etiqueta.toUpperCase());
    },
  );

  it('deve aceitar classes extras quando className é informado', () => {
    // Arrange
    const extra = 'p-5';

    // Act
    render(<Card className={extra}>{CONTEUDO}</Card>);

    // Assert
    expect(classes(cartao())).toEqual(expect.arrayContaining([...MOLDURA, extra]));
  });

  it('deve repassar os demais atributos ao elemento', () => {
    // Arrange
    const nome = 'Resumo';

    // Act
    render(
      <Card as="section" aria-label={nome}>
        {CONTEUDO}
      </Card>,
    );

    // Assert
    expect(screen.getByRole('region', { name: nome })).toBe(cartao());
  });
});
