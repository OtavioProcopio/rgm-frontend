/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AtualizadoEm } from '@/features/solicitacoes/components/AtualizadoEm';

const INSTANTE: number = Date.UTC(2026, 9, 9, 14, 30, 0);

function horaEsperada(instante: number): string {
  return new Date(instante).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

describe('AtualizadoEm', () => {
  afterEach(cleanup);

  it('deve mostrar "Atualizado às" seguido da hora quando o instante é válido', () => {
    // Arrange
    const esperado: string = `Atualizado às ${horaEsperada(INSTANTE)}`;

    // Act
    const { container } = render(<AtualizadoEm instante={INSTANTE} />);

    // Assert
    expect(container.querySelector('time')?.textContent).toBe(esperado);
  });

  it('deve usar o ISO do instante no dateTime quando o instante é válido', () => {
    // Arrange
    const esperado: string = new Date(INSTANTE).toISOString();

    // Act
    const { container } = render(<AtualizadoEm instante={INSTANTE} />);

    // Assert
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe(esperado);
  });

  it.each([undefined, 0, -5, Number.NaN])(
    'deve não renderizar nada quando o instante é %s',
    (instante: number | undefined) => {
      // Arrange
      const entrada: number | undefined = instante;

      // Act
      const { container } = render(<AtualizadoEm instante={entrada} />);

      // Assert
      expect(container.innerHTML).toBe('');
    },
  );

  it('deve mostrar a hora quando className é informado', () => {
    // Arrange
    const esperado: string = `Atualizado às ${horaEsperada(INSTANTE)}`;

    // Act
    render(<AtualizadoEm instante={INSTANTE} className="ml-2" />);

    // Assert
    expect(screen.getByText(esperado)).toBeDefined();
  });

  it('deve não conter classe de animação quando renderizado', () => {
    // Arrange
    const { container } = render(<AtualizadoEm instante={INSTANTE} />);

    // Act
    const html: string = container.innerHTML;

    // Assert
    expect(html).not.toContain('animate-');
  });
});
