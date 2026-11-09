/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { DialogoDaAcao } from '@/features/solicitacoes/actions/DialogoDaAcao';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';

const editarInstrucao = vi.fn();
const PERGUNTA = 'Descartar o que foi preenchido?';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { editarInstrucao: (...args: unknown[]) => editarInstrucao(...args) },
}));

const comInstrucao = criarSolicitacao({
  status: 'EM_ANDAMENTO',
  prioridade: 'ALTA',
  instrucao: 'Trocar o gabarito',
});
const semInstrucao = criarSolicitacao({ status: 'EM_ANDAMENTO', prioridade: 'ALTA' });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** Diálogo real, ação real e formulário real: só a chamada à API é trocada. */
function montar(solicitacao = comInstrucao) {
  const onClose = vi.fn();
  const { QueryWrapper, queryClient } = createQueryWrapper();
  queryClient.setQueryData(solicitacoesKeys.detail(solicitacao.id), solicitacao);
  render(<DialogoDaAcao acao="EDITAR_INSTRUCAO" solicitacao={solicitacao} onClose={onClose} />, {
    wrapper: QueryWrapper,
  });
  return { onClose };
}

const campo = () => screen.getByLabelText(/^o que precisa ser feito/i) as HTMLTextAreaElement;
const salvar = () => screen.getByRole('button', { name: 'Salvar' }) as HTMLButtonElement;

describe('EditarInstrucaoAction — o formulário', () => {
  it('deve abrir com a instrução atual, o limite de 2000 e "Salvar" desabilitado', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('dialog', { name: /Editar o que precisa ser feito/ })).toBeDefined();
    expect(campo().value).toBe('Trocar o gabarito');
    expect(campo().maxLength).toBe(2000);
    expect(screen.queryByText(/caracteres/)).toBeNull();
    expect(salvar().disabled).toBe(true);
  });

  it('deve abrir vazio quando a solicitação foi triada antes do campo existir', () => {
    // Act
    montar(semInstrucao);

    // Assert
    expect(campo().value).toBe('');
    expect(salvar().disabled).toBe(true);
  });

  it('deve habilitar "Salvar" só quando o texto aparado difere do atual', async () => {
    // Arrange
    montar();

    // Act + Assert
    await userEvent.type(campo(), '   ');
    expect(salvar().disabled).toBe(true);
    await userEvent.type(campo(), ' e o pino');
    expect(salvar().disabled).toBe(false);
  });

  it('deve mostrar o erro e não enviar quando o texto é apagado', async () => {
    // Arrange
    montar();
    await userEvent.clear(campo());

    // Act
    await userEvent.click(salvar());

    // Assert
    expect(await screen.findByText('Descreva o que precisa ser feito')).toBeDefined();
    expect(editarInstrucao).not.toHaveBeenCalled();
  });
});

describe('EditarInstrucaoAction — salvar', () => {
  it('deve enviar a instrução aparada, fechar e avisar quando a API aceita', async () => {
    // Arrange
    editarInstrucao.mockResolvedValue({ ...comInstrucao, instrucao: 'Trocar o gabarito e o pino' });
    const { onClose } = montar();
    await userEvent.type(campo(), ' e o pino   ');

    // Act
    await userEvent.click(salvar());

    // Assert
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(editarInstrucao).toHaveBeenCalledWith('s1', { instrucao: 'Trocar o gabarito e o pino' });
  });

  it('deve manter o diálogo aberto com o texto e mostrar o erro quando a solicitação saiu de andamento', async () => {
    // Arrange
    editarInstrucao.mockRejectedValue(
      new ApiError({ status: 409, message: 'A instrucao so pode ser editada em andamento.' }),
    );
    const { onClose } = montar();
    await userEvent.type(campo(), ' e o pino');

    // Act
    await userEvent.click(salvar());

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBeTruthy();
    expect(campo().value).toBe('Trocar o gabarito e o pino');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve manter o diálogo aberto com o texto e mostrar o erro quando a rede falha', async () => {
    // Arrange
    editarInstrucao.mockRejectedValue(new Error('Network Error'));
    const { onClose } = montar();
    await userEvent.type(campo(), ' e o pino');

    // Act
    await userEvent.click(salvar());

    // Assert
    expect(await screen.findByRole('alert')).toBeDefined();
    expect(campo().value).toBe('Trocar o gabarito e o pino');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve bloquear o envio duplicado enquanto a API não responde', async () => {
    // Arrange
    editarInstrucao.mockReturnValue(new Promise(() => undefined));
    montar();
    await userEvent.type(campo(), ' e o pino');

    // Act
    await userEvent.click(salvar());

    // Assert
    const salvando = await screen.findByRole('button', { name: 'Salvando...' });
    expect((salvando as HTMLButtonElement).disabled).toBe(true);
    expect(editarInstrucao).toHaveBeenCalledTimes(1);
  });
});

describe('EditarInstrucaoAction — desistir', () => {
  it('deve fechar direto quando nada foi alterado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(PERGUNTA)).toBeNull();
  });

  it('deve perguntar antes de descartar quando o texto foi alterado', async () => {
    // Arrange
    const { onClose } = montar();
    await userEvent.type(campo(), ' e o pino');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText(PERGUNTA)).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar com Esc sem perguntar quando nada foi alterado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('EditarInstrucaoAction — instrução perto do limite', () => {
  it('deve mostrar quantos caracteres restam desde a abertura quando a instrução atual é longa', () => {
    // Arrange
    const longa = criarSolicitacao({
      status: 'EM_ANDAMENTO',
      prioridade: 'ALTA',
      instrucao: 'x'.repeat(1950),
    });

    // Act
    montar(longa);

    // Assert
    expect(screen.getByText('Restam 50 caracteres')).toBeDefined();
  });
});
