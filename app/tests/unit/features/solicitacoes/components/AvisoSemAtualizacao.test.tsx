/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSemAtualizacao } from '@/features/solicitacoes/hooks/useSemAtualizacao';
import { AvisoSemAtualizacao } from '@/features/solicitacoes/components/AvisoSemAtualizacao';

vi.mock('@/features/solicitacoes/hooks/useSemAtualizacao', () => ({ useSemAtualizacao: vi.fn() }));

afterEach(cleanup);

describe('AvisoSemAtualizacao', () => {
  it('deve mostrar o aviso quando a aplicação está sem atualização automática', () => {
    // Arrange
    vi.mocked(useSemAtualizacao).mockReturnValue(true);

    // Act
    render(<AvisoSemAtualizacao />);

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Sem atualização automática');
  });

  it('deve usar o fundo e o texto de alerta quando o aviso é mostrado', () => {
    // Arrange
    vi.mocked(useSemAtualizacao).mockReturnValue(true);

    // Act
    render(<AvisoSemAtualizacao />);
    const aviso = screen.getByText('Sem atualização automática');

    // Assert
    expect(aviso.className.split(' ')).toEqual(
      expect.arrayContaining(['bg-warning-soft', 'text-warning-fg']),
    );
  });

  it('deve manter a região de status vazia quando há atualização automática', () => {
    // Arrange
    vi.mocked(useSemAtualizacao).mockReturnValue(false);

    // Act
    render(<AvisoSemAtualizacao />);

    // Assert
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('deve manter o foco onde está quando o aviso aparece', () => {
    // Arrange
    vi.mocked(useSemAtualizacao).mockReturnValue(false);
    const { rerender } = render(
      <>
        <AvisoSemAtualizacao />
        <input aria-label="Título" />
      </>,
    );
    const campo = screen.getByLabelText('Título');
    campo.focus();
    vi.mocked(useSemAtualizacao).mockReturnValue(true);

    // Act
    rerender(
      <>
        <AvisoSemAtualizacao />
        <input aria-label="Título" />
      </>,
    );

    // Assert
    expect(document.activeElement).toBe(campo);
  });
});
