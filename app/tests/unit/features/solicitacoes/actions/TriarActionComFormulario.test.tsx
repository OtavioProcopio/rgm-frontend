/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { TriarAction } from '@/features/solicitacoes/actions/TriarAction';

const triar = vi.fn();
const JOAO = '11111111-1111-4111-8111-111111111111';

vi.mock('@/features/solicitacoes/hooks/useTriarSolicitacao', () => ({
  useTriarSolicitacao: () => ({ mutateAsync: triar, isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useBuscaDeResponsaveis', () => ({
  useBuscaDeResponsaveis: () => ({
    buscar: vi.fn(),
    candidatos: [{ id: JOAO, nome: 'João', perfil: 'OPERADOR' }],
    carregando: false,
    falhou: false,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** Formulário real com a ação real: só a API e a busca de responsáveis são trocadas. */
describe('TriarAction com o formulário de triagem', () => {
  async function preencher(instrucao: string) {
    await userEvent.click(screen.getByRole('radio', { name: /Alta · 24 h/ }));
    await userEvent.click(screen.getByRole('button', { name: 'João' }));
    await userEvent.type(screen.getByLabelText(/^o que precisa ser feito/i), instrucao);
  }

  function montar() {
    const onClose = vi.fn();
    const { QueryWrapper } = createQueryWrapper();
    render(
      <TriarAction solicitacao={criarSolicitacao()} onClose={onClose} onCancelar={vi.fn()} />,
      {
        wrapper: QueryWrapper,
      },
    );
    return { onClose };
  }

  it('deve enviar a instrução aparada na triagem e fechar quando a API aceita', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    const { onClose } = montar();
    await preencher('  Trocar o gabarito  ');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar triagem' }));

    // Assert
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(triar).toHaveBeenCalledWith({
      prioridade: 'ALTA',
      responsavelIds: [JOAO],
      instrucao: 'Trocar o gabarito',
    });
  });

  it('deve manter o texto digitado e mostrar o erro quando outra pessoa triou antes', async () => {
    // Arrange
    triar.mockRejectedValue(new ApiError({ status: 409, message: 'Solicitação já foi triada.' }));
    const { onClose } = montar();
    await preencher('Trocar o gabarito');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar triagem' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe('Solicitação já foi triada.');
    const campo = screen.getByLabelText(/^o que precisa ser feito/i) as HTMLTextAreaElement;
    expect(campo.value).toBe('Trocar o gabarito');
    expect(onClose).not.toHaveBeenCalled();
  });
});
