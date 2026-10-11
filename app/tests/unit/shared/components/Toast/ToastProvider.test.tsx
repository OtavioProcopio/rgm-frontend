/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DURACAO_DO_AVISO_EM_MS, ToastProvider } from '@/shared/components/Toast/ToastProvider';
import { useToast } from '@/shared/components/Toast/toastContext';

function Disparador({ mensagem }: { mensagem: string }) {
  const { avisar } = useToast();
  return (
    <button type="button" onClick={() => avisar(mensagem)}>
      avisar
    </button>
  );
}

function montar(mensagem = 'Solicitação triada') {
  const { container } = render(
    <ToastProvider>
      <Disparador mensagem={mensagem} />
    </ToastProvider>,
  );
  return { regiao: container.parentElement!.querySelector('[aria-live]')! };
}

const acionar = () =>
  act(() => {
    screen.getByRole('button', { name: 'avisar' }).click();
  });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('deve manter uma região anunciada com cortesia quando nenhum aviso foi dado', () => {
    // Act
    const { regiao } = montar();

    // Assert
    expect(regiao.getAttribute('aria-live')).toBe('polite');
  });

  it('deve mostrar a mensagem na região quando um aviso é dado', () => {
    // Arrange
    const { regiao } = montar('Solicitação triada');

    // Act
    acionar();

    // Assert
    expect(regiao.textContent).toBe('Solicitação triada');
  });

  it('deve manter o aviso na tela quando falta um instante para os 4 segundos', () => {
    // Arrange
    const { regiao } = montar();
    acionar();

    // Act
    act(() => {
      vi.advanceTimersByTime(DURACAO_DO_AVISO_EM_MS - 1);
    });

    // Assert
    expect(regiao.textContent).toBe('Solicitação triada');
  });

  it('deve remover o aviso sozinho quando passam 4 segundos', () => {
    // Arrange
    const { regiao } = montar();
    acionar();

    // Act
    act(() => {
      vi.advanceTimersByTime(DURACAO_DO_AVISO_EM_MS);
    });

    // Assert
    expect(regiao.textContent).toBe('');
  });

  it('deve mostrar os dois avisos quando dois são dados em sequência', () => {
    // Arrange
    const { regiao } = montar('Salvo');

    // Act
    acionar();
    acionar();

    // Assert
    expect(regiao.children).toHaveLength(2);
  });

  it('deve falhar com mensagem clara quando useToast é usado fora do provedor', () => {
    // Arrange
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act
    const renderizar = () => render(<Disparador mensagem="x" />);

    // Assert
    expect(renderizar).toThrow('useToast deve ser usado dentro de ToastProvider.');
    erro.mockRestore();
  });
});
