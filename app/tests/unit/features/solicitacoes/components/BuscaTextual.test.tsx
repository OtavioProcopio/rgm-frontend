/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BuscaTextual } from '@/features/solicitacoes/components/BuscaTextual';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const esperar = () => act(() => vi.advanceTimersByTimeAsync(500));

describe('BuscaTextual', () => {
  it('deve aplicar o termo depois de uma pausa quando tem 2 ou mais caracteres', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<BuscaTextual onChange={onChange} />);

    // Act
    await userEvent.type(screen.getByLabelText('Buscar'), 'correia');
    await esperar();

    // Assert
    expect(onChange).toHaveBeenLastCalledWith('correia');
  });

  it('deve avisar e não buscar quando o termo tem 1 caractere', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<BuscaTextual onChange={onChange} />);

    // Act
    await userEvent.type(screen.getByLabelText('Buscar'), 'a');
    await esperar();

    // Assert
    expect(screen.getByText('Digite ao menos 2 caracteres para buscar.')).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve limpar a busca aplicada quando o campo é esvaziado', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<BuscaTextual valor="correia" onChange={onChange} />);

    // Act
    await userEvent.clear(screen.getByLabelText('Buscar'));
    await esperar();

    // Assert
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('deve não notificar quando o valor inicial não mudou', async () => {
    // Arrange
    const onChange = vi.fn();

    // Act
    render(<BuscaTextual valor="correia" onChange={onChange} />);
    await esperar();

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });
});
