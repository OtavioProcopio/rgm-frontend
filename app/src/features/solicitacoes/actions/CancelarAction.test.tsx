/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import { CancelarAction } from './CancelarAction';

const cancelar = vi.fn();
const foto = null;

vi.mock('../hooks/useCancelarSolicitacao', () => ({
  useCancelarSolicitacao: () => ({ mutateAsync: cancelar, isPending: false }),
}));
vi.mock('@/features/evidencias/hooks/useUploadEvidencia', () => ({
  useUploadEvidencia: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
  render(<CancelarAction solicitacao={criarSolicitacao()} onClose={onClose} />, { wrapper: QueryWrapper });
  return { onClose };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CancelarAction', () => {
  it('deve abrir o formulário só de cancelamento quando a ação é aberta', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('form', { name: 'Cancelamento' })).toBeDefined();
  });

  it('deve cancelar com o motivo e fechar quando o cancelamento é confirmado', async () => {
    // Arrange
    cancelar.mockResolvedValue(undefined);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitação' }));

    // Assert
    expect(cancelar).toHaveBeenCalledWith({ motivo: 'Pedido duplicado' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa o cancelamento', async () => {
    // Arrange
    const recusa = new ApiError({ status: 403, message: 'Você não pode cancelar esta solicitação.' });
    cancelar.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitação' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar sem cancelar quando o formulário é fechado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(cancelar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
