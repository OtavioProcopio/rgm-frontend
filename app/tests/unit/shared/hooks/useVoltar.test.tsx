/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router';

import { useVoltar } from '@/shared/hooks/useVoltar';

function Rota() {
  const { pathname } = useLocation();
  return <p data-testid="rota">{pathname}</p>;
}

function Origem() {
  return (
    <>
      <Rota />
      <Link to="/detalhe">ir</Link>
    </>
  );
}

function Detalhe({ reserva }: { reserva: string }) {
  const voltar = useVoltar(reserva);
  return (
    <>
      <Rota />
      <button onClick={voltar}>voltar</button>
    </>
  );
}

function montar(entradas: string[], reserva: string) {
  render(
    <MemoryRouter initialEntries={entradas}>
      <Routes>
        <Route path="/origem" element={<Origem />} />
        <Route path="/detalhe" element={<Detalhe reserva={reserva} />} />
        <Route path="*" element={<Rota />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('useVoltar', () => {
  it('deve voltar para a origem quando existe tela anterior na aplicação', () => {
    // Arrange
    montar(['/origem'], '/reserva');
    fireEvent.click(screen.getByText('ir'));

    // Act
    fireEvent.click(screen.getByText('voltar'));

    // Assert
    expect(screen.getByTestId('rota').textContent).toBe('/origem');
  });

  it('deve ir à reserva quando a entrada inicial é a tela de detalhe', () => {
    // Arrange
    montar(['/detalhe'], '/reserva');

    // Act
    fireEvent.click(screen.getByText('voltar'));

    // Assert
    expect(screen.getByTestId('rota').textContent).toBe('/reserva');
  });

  it('deve usar a reserva informada quando a reserva é outra', () => {
    // Arrange
    montar(['/detalhe'], '/outra-reserva');

    // Act
    fireEvent.click(screen.getByText('voltar'));

    // Assert
    expect(screen.getByTestId('rota').textContent).toBe('/outra-reserva');
  });
});
