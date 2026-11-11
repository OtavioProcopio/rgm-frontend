/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTeclasDoCatalogo } from '@/features/modelos/hooks/useTeclasDoCatalogo';

afterEach(cleanup);

function Tela({ voltar, avancar }: { voltar: () => void; avancar: () => void }) {
  useTeclasDoCatalogo(voltar, avancar);
  return (
    <div>
      <input aria-label="campo" />
      <textarea aria-label="texto" />
      <div data-faixa-de-fotos="">
        <button type="button">miniatura</button>
      </div>
      <button type="button">fora</button>
    </div>
  );
}

function montar() {
  const voltar = vi.fn();
  const avancar = vi.fn();
  render(<Tela voltar={voltar} avancar={avancar} />);
  return { voltar, avancar };
}

describe('useTeclasDoCatalogo', () => {
  it('deve voltar com a seta esquerda e avançar com a direita quando o foco está fora de campos', () => {
    // Arrange
    const { voltar, avancar } = montar();
    const alvo = screen.getByRole('button', { name: 'fora' });

    // Act
    fireEvent.keyDown(alvo, { key: 'ArrowLeft' });
    fireEvent.keyDown(alvo, { key: 'ArrowRight' });

    // Assert
    expect(voltar).toHaveBeenCalledTimes(1);
    expect(avancar).toHaveBeenCalledTimes(1);
  });

  it('não deve reagir quando o foco está num campo de texto', () => {
    const { voltar, avancar } = montar();

    fireEvent.keyDown(screen.getByLabelText('campo'), { key: 'ArrowLeft' });
    fireEvent.keyDown(screen.getByLabelText('texto'), { key: 'ArrowRight' });

    expect(voltar).not.toHaveBeenCalled();
    expect(avancar).not.toHaveBeenCalled();
  });

  it('não deve reagir quando o foco está na faixa de miniaturas, onde as setas trocam a foto', () => {
    const { voltar, avancar } = montar();

    fireEvent.keyDown(screen.getByRole('button', { name: 'miniatura' }), { key: 'ArrowRight' });

    expect(avancar).not.toHaveBeenCalled();
    expect(voltar).not.toHaveBeenCalled();
  });

  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'])(
    'não deve reagir quando a seta vem com %s',
    (modificador) => {
      const { voltar, avancar } = montar();

      fireEvent.keyDown(document.body, { key: 'ArrowRight', [modificador]: true });

      expect(avancar).not.toHaveBeenCalled();
      expect(voltar).not.toHaveBeenCalled();
    },
  );

  it('não deve reagir a outras teclas e deve parar de ouvir quando a tela sai', () => {
    // Arrange
    const voltar = vi.fn();
    const avancar = vi.fn();
    const { unmount } = render(<Tela voltar={voltar} avancar={avancar} />);

    // Act
    fireEvent.keyDown(document.body, { key: 'ArrowUp' });
    unmount();
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });

    // Assert
    expect(avancar).not.toHaveBeenCalled();
    expect(voltar).not.toHaveBeenCalled();
  });
});
