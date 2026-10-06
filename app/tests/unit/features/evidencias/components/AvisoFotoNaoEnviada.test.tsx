/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AvisoFotoNaoEnviada } from '@/features/evidencias/components/AvisoFotoNaoEnviada';

const mensagem = 'A solicitação foi triada, mas a foto não foi enviada.';

afterEach(cleanup);

describe('AvisoFotoNaoEnviada', () => {
  it('deve avisar com papel de alerta, oferecer nova tentativa e dizer que dá para anexar depois quando o envio falhou', () => {
    // Act
    render(<AvisoFotoNaoEnviada mensagem={mensagem} estado="falhou" onTentarNovamente={vi.fn()} onSair={vi.fn()} />);

    // Assert
    const alerta = screen.getByRole('alert');
    expect(within(alerta).getByText(mensagem)).toBeDefined();
    expect(within(alerta).getByText(/anexar a foto depois, pelo detalhe da solicitação/)).toBeDefined();
    expect(within(alerta).getByRole('button', { name: 'Tentar novamente' })).toBeDefined();
  });

  it('deve pedir o reenvio quando o usuário aciona Tentar novamente', async () => {
    // Arrange
    const onTentarNovamente = vi.fn();
    render(
      <AvisoFotoNaoEnviada mensagem={mensagem} estado="falhou" onTentarNovamente={onTentarNovamente} onSair={vi.fn()} />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear os botões quando o reenvio está em andamento', () => {
    // Act
    render(
      <AvisoFotoNaoEnviada mensagem={mensagem} estado="falhou" enviando onTentarNovamente={vi.fn()} onSair={vi.fn()} />,
    );

    // Assert
    expect((screen.getByRole('button', { name: 'Enviando...' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Fechar' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve sair pelo botão com o rótulo informado quando o usuário dispensa o aviso', async () => {
    // Arrange
    const onSair = vi.fn();
    render(
      <AvisoFotoNaoEnviada
        mensagem={mensagem}
        estado="falhou"
        rotuloSair="Ir para a solicitação"
        onTentarNovamente={vi.fn()}
        onSair={onSair}
      />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ir para a solicitação' }));

    // Assert
    expect(onSair).toHaveBeenCalledTimes(1);
  });

  it('deve trocar o aviso pela confirmação quando a foto foi enviada', async () => {
    // Arrange
    const onSair = vi.fn();
    render(<AvisoFotoNaoEnviada mensagem={mensagem} estado="enviado" onTentarNovamente={vi.fn()} onSair={onSair} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(within(screen.getByRole('status')).getByText('Foto enviada.')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(mensagem)).toBeNull();
    expect(onSair).toHaveBeenCalledTimes(1);
  });
});
