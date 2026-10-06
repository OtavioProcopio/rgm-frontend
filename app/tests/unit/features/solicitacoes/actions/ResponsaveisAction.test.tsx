/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { ResponsaveisAction } from '@/features/solicitacoes/actions/ResponsaveisAction';

const alterar = vi.fn();

vi.mock('@/features/solicitacoes/hooks/useAlterarResponsaveis', () => ({
  useAlterarResponsaveis: () => ({ mutateAsync: alterar, isPending: false }),
}));
vi.mock('@/features/evidencias/hooks/useUploadEvidencia', () => ({
  useUploadEvidencia: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/hooks/useResponsaveisDisponiveis', () => ({
  useResponsaveisDisponiveis: () => ({
    responsaveis: [
      { id: 'op', nome: 'Olga Operadora' },
      { id: 'ge', nome: 'Gil Gestor' },
    ],
    isLoading: false,
  }),
}));

function montar() {
  const onClose = vi.fn();
  const onCancelar = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(
    <ResponsaveisAction
      solicitacao={criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['op'] })}
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

describe('ResponsaveisAction', () => {
  it('deve abrir com os responsáveis atuais marcados quando a ação é aberta', () => {
    // Act
    montar();

    // Assert
    expect(
      (screen.getByRole('checkbox', { name: 'Olga Operadora' }) as HTMLInputElement).checked,
    ).toBe(true);
    expect((screen.getByRole('checkbox', { name: 'Gil Gestor' }) as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it('deve salvar a nova lista e fechar quando a alteração é confirmada', async () => {
    // Arrange
    alterar.mockResolvedValue(undefined);
    const { onClose } = montar();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Gil Gestor' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect(alterar).toHaveBeenCalledWith({ responsavelIds: ['op', 'ge'] });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa a alteração', async () => {
    // Arrange
    const recusa = new ApiError({ status: 422, message: 'Responsável inativo.' });
    alterar.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve avisar a desistência sem salvar quando o formulário é cancelado', async () => {
    // Arrange
    const { onClose, onCancelar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(alterar).not.toHaveBeenCalled();
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
