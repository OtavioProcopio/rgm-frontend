/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { DialogoDaAcao } from '@/features/solicitacoes/actions/DialogoDaAcao';

const devolver = vi.fn();
const solicitacao = criarSolicitacao({ status: 'EM_VALIDACAO' });
const MOTIVO = 'Solda incompleta';
const PERGUNTA = 'Descartar o que foi preenchido?';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { devolver: (...args: unknown[]) => devolver(...args) },
}));

function montar() {
  const onClose = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(<DialogoDaAcao acao="DEVOLVER" solicitacao={solicitacao} onClose={onClose} />, {
    wrapper: QueryWrapper,
  });
  return { onClose };
}

function campoDoMotivo() {
  return screen.getByLabelText(/motivo da devolução/i) as HTMLTextAreaElement;
}

async function preencherMotivo() {
  await userEvent.type(campoDoMotivo(), MOTIVO);
}

/** Preenche e envia; a API fica sem responder, então o envio continua em andamento. */
async function enviarSemResposta() {
  devolver.mockReturnValue(new Promise(() => undefined));
  await preencherMotivo();
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar devolução' }));
  await screen.findByRole('button', { name: 'Devolvendo...' });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DialogoDaAcao', () => {
  it('deve se chamar pela ação e pela solicitação quando abre', () => {
    // Arrange
    const nome = `Devolver: ${solicitacao.titulo}`;

    // Act
    montar();

    // Assert
    expect(screen.getByRole('dialog', { name: nome })).toBeDefined();
  });

  it('deve fechar sem perguntar quando Esc é apertado sem nada preenchido', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(PERGUNTA)).toBeNull();
  });

  it('deve perguntar antes de descartar quando Esc é apertado com algo preenchido', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.getByText(PERGUNTA)).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve perguntar antes de descartar quando o clique é fora com algo preenchido', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();

    // Act
    await userEvent.click(screen.getByRole('dialog').parentElement!);

    // Assert
    expect(screen.getByText(PERGUNTA)).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve perguntar antes de descartar quando Cancelar do formulário é acionado com algo preenchido', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText(PERGUNTA)).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve pôr o foco em Continuar editando quando pergunta', async () => {
    // Arrange
    montar();
    await preencherMotivo();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continuar editando' }));
  });

  it('deve manter o que foi preenchido quando o usuário escolhe continuar editando', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();
    await userEvent.keyboard('{Escape}');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));

    // Assert
    expect(campoDoMotivo().value).toBe(MOTIVO);
    expect(screen.queryByText(PERGUNTA)).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve devolver o foco ao campo quando o usuário escolhe continuar editando', async () => {
    // Arrange
    montar();
    await preencherMotivo();
    await userEvent.keyboard('{Escape}');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));

    // Assert
    expect(document.activeElement).toBe(campoDoMotivo());
  });

  it('deve voltar ao formulário quando Esc é apertado na pergunta', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();
    await userEvent.keyboard('{Escape}');

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByText(PERGUNTA)).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar quando o usuário escolhe descartar', async () => {
    // Arrange
    const { onClose } = montar();
    await preencherMotivo();
    await userEvent.keyboard('{Escape}');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve continuar aberto sem perguntar quando Esc é apertado durante o envio', async () => {
    // Arrange
    const { onClose } = montar();
    await enviarSemResposta();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText(PERGUNTA)).toBeNull();
  });

  it('deve continuar aberto sem perguntar quando o clique é fora durante o envio', async () => {
    // Arrange
    const { onClose } = montar();
    await enviarSemResposta();

    // Act
    await userEvent.click(screen.getByRole('dialog').parentElement!);

    // Assert
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText(PERGUNTA)).toBeNull();
  });

  it('deve continuar aberto com o erro e o que foi preenchido quando o envio falha', async () => {
    // Arrange
    const recusa = new ApiError({ status: 422, message: 'Solicitação não está em validação.' });
    devolver.mockRejectedValue(recusa);
    const { onClose } = montar();
    await preencherMotivo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar devolução' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(campoDoMotivo().value).toBe(MOTIVO);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar sem perguntar quando a ação é concluída', async () => {
    // Arrange
    devolver.mockResolvedValue(solicitacao);
    const { onClose } = montar();
    await preencherMotivo();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar devolução' }));

    // Assert
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(PERGUNTA)).toBeNull();
  });
});
