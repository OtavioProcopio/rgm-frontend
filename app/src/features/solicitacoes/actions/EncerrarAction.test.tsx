/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import { EncerrarAction } from './EncerrarAction';

const encerrar = vi.fn();
const cancelar = vi.fn();
const anexar = vi.fn();
const foto = new File(['x'], 'pronto.png', { type: 'image/png' });

vi.mock('../hooks/useEncerrarSolicitacao', () => ({
  useEncerrarSolicitacao: () => ({ mutateAsync: encerrar, isPending: false }),
}));
vi.mock('../hooks/useCancelarSolicitacao', () => ({
  useCancelarSolicitacao: () => ({ mutateAsync: cancelar, isPending: false }),
}));
vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: { anexar: (...args: unknown[]) => anexar(...args) },
}));
vi.mock('../components/EncerramentoModal', () => ({
  EncerramentoModal: ({
    podeConcluir,
    isPending,
    onCancel,
    onConfirm,
  }: {
    podeConcluir: boolean;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: (data: { concluir: boolean; comentario: string }, foto: File | null) => void;
  }) => (
    <form aria-label={podeConcluir ? 'Encerramento' : 'Cancelamento'}>
      <button type="button" disabled={isPending} onClick={() => onConfirm({ concluir: true, comentario: 'Peça aprovada' }, foto)}>
        Concluir
      </button>
      <button type="button" onClick={() => onConfirm({ concluir: false, comentario: 'Pedido duplicado' }, null)}>
        Cancelar solicitação
      </button>
      <button type="button" onClick={onCancel}>Fechar</button>
    </form>
  ),
}));

function montar() {
  const onClose = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(<EncerrarAction solicitacao={criarSolicitacao({ status: 'EM_VALIDACAO' })} onClose={onClose} />, {
    wrapper: QueryWrapper,
  });
  return { onClose };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('EncerrarAction', () => {
  it('deve abrir o formulário de encerramento quando a ação é aberta', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('form', { name: 'Encerramento' })).toBeDefined();
  });

  it('deve enviar a foto antes de concluir e fechar quando o usuário conclui com foto', async () => {
    // Arrange
    const ordem: string[] = [];
    anexar.mockImplementation(async () => {
      ordem.push('foto');
    });
    encerrar.mockImplementation(async () => {
      ordem.push('conclusão');
    });
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }));

    // Assert
    expect(ordem).toEqual(['foto', 'conclusão']);
    expect(anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'CONCLUSAO', descricao: 'Peça aprovada' });
    expect(encerrar).toHaveBeenCalledWith({ concluir: true, comentario: 'Peça aprovada' });
    expect(cancelar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve não concluir e mostrar o erro no formulário quando o envio da foto falha', async () => {
    // Arrange
    anexar.mockRejectedValue(new Error('rede'));
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(
      'A foto não foi enviada e a solicitação não foi concluída.',
    );
    expect(encerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('form', { name: 'Encerramento' })).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve cancelar com o motivo e fechar quando o usuário escolhe cancelar', async () => {
    // Arrange
    cancelar.mockResolvedValue(undefined);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitação' }));

    // Assert
    expect(cancelar).toHaveBeenCalledWith({ motivo: 'Pedido duplicado' });
    expect(encerrar).not.toHaveBeenCalled();
    expect(anexar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa a conclusão', async () => {
    // Arrange
    const recusa = new ApiError({ status: 422, message: 'Solicitação não está em validação.' });
    anexar.mockResolvedValue(undefined);
    encerrar.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar sem encerrar quando o formulário é cancelado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(encerrar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
