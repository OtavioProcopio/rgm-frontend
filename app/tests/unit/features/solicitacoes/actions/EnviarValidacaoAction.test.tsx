/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { EnviarValidacaoAction } from '@/features/solicitacoes/actions/EnviarValidacaoAction';

const enviar = vi.fn();

vi.mock('@/features/solicitacoes/hooks/useEnviarParaValidacao', () => ({
  useEnviarParaValidacao: () => ({ mutateAsync: enviar, isPending: false }),
}));
vi.mock('@/features/evidencias/hooks/useUploadEvidencia', () => ({
  useUploadEvidencia: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/components/EnviarValidacaoModal', () => ({
  EnviarValidacaoModal: ({
    solicitacaoId,
    evidenciaObrigatoria,
    onCancel,
    onConfirm,
  }: {
    solicitacaoId: string;
    evidenciaObrigatoria: boolean;
    onCancel: () => void;
    onConfirm: (data: { comentario: string }) => void;
  }) => (
    <form aria-label={`Envio de ${solicitacaoId}`}>
      <p>{evidenciaObrigatoria ? 'Evidência obrigatória' : 'Evidência opcional'}</p>
      <button type="button" onClick={() => onConfirm({ comentario: 'Correia trocada' })}>
        Confirmar
      </button>
      <button type="button" onClick={onCancel}>
        Fechar
      </button>
    </form>
  ),
}));

function montar(tipo: 'REPARO' | 'CRIACAO' = 'REPARO') {
  const onClose = vi.fn();
  const onCancelar = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(
    <EnviarValidacaoAction
      solicitacao={criarSolicitacao({ status: 'EM_ANDAMENTO', tipo })}
      onClose={onClose}
      onCancelar={onCancelar}
    />,
    { wrapper: QueryWrapper },
  );
  return { onClose, onCancelar };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('EnviarValidacaoAction', () => {
  it('deve enviar o comentário e fechar quando o envio é confirmado', async () => {
    // Arrange
    enviar.mockResolvedValue(undefined);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect(enviar).toHaveBeenCalledWith('Correia trocada');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve exigir evidência quando a solicitação não é de criação de modelo', () => {
    // Act
    montar('REPARO');

    // Assert
    expect(screen.getByRole('form', { name: 'Envio de s1' })).toBeDefined();
    expect(screen.getByText('Evidência obrigatória')).toBeDefined();
  });

  it('deve dispensar evidência quando a solicitação é de criação de modelo', () => {
    // Act
    montar('CRIACAO');

    // Assert
    expect(screen.getByText('Evidência opcional')).toBeDefined();
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa o envio', async () => {
    // Arrange
    const recusa = new ApiError({
      status: 422,
      message: 'Anexe ao menos uma evidência de serviço.',
    });
    enviar.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve avisar a desistência sem enviar quando o formulário é cancelado', async () => {
    // Arrange
    const { onClose, onCancelar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(enviar).not.toHaveBeenCalled();
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
