/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import { DevolverAction } from './DevolverAction';

const devolver = vi.fn();
const anexar = vi.fn();
const foto = new File(['x'], 'defeito.png', { type: 'image/png' });
const dados = { motivo: 'Solda incompleta' };

vi.mock('../hooks/useDevolverSolicitacao', () => ({
  useDevolverSolicitacao: () => ({ mutateAsync: devolver, isPending: false }),
}));
vi.mock('@/features/evidencias/hooks/useUploadEvidencia', () => ({
  useUploadEvidencia: () => ({ mutateAsync: anexar, isPending: false }),
}));
vi.mock('../components/DevolucaoModal', () => ({
  DevolucaoModal: ({
    onCancel,
    onConfirm,
  }: {
    onCancel: () => void;
    onConfirm: (data: unknown, foto: File | null) => void;
  }) => (
    <form aria-label="Devolução">
      <button type="button" onClick={() => onConfirm(dados, foto)}>Confirmar com foto</button>
      <button type="button" onClick={() => onConfirm(dados, null)}>Confirmar</button>
      <button type="button" onClick={onCancel}>Fechar</button>
    </form>
  ),
}));

function montar() {
  const onClose = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(<DevolverAction solicitacao={criarSolicitacao({ status: 'EM_VALIDACAO' })} onClose={onClose} />, {
    wrapper: QueryWrapper,
  });
  return { onClose };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DevolverAction', () => {
  it('deve devolver, anexar a foto como evidência de devolução e fechar quando confirmada com foto', async () => {
    // Arrange
    devolver.mockResolvedValue(undefined);
    anexar.mockResolvedValue(undefined);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto' }));

    // Assert
    expect(devolver).toHaveBeenCalledWith(dados);
    expect(anexar).toHaveBeenCalledWith({ file: foto, tipo: 'DEVOLUCAO', descricao: dados.motivo });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa a devolução', async () => {
    // Arrange
    const recusa = new ApiError({ status: 422, message: 'Solicitação não está em validação.' });
    devolver.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar sem devolver quando o formulário é cancelado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(devolver).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
