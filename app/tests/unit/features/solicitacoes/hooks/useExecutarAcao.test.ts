/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@tests/support/queryWrapper';

import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import { useExecutarAcao } from '@/features/solicitacoes/hooks/useExecutarAcao';

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: { anexar: vi.fn() },
}));

const foto = new File(['x'], 'foto.png', { type: 'image/png' });
const aceito = {} as Awaited<ReturnType<typeof evidenciasApi.anexar>>;
const feito = 'A solicitação foi triada, mas a foto não foi enviada.';

function montar() {
  const onConcluida = vi.fn();
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(() => useExecutarAcao('s1', onConcluida), { wrapper: QueryWrapper });
  return { result, onConcluida, queryClient };
}

afterEach(() => vi.clearAllMocks());

describe('useExecutarAcao', () => {
  it('deve avisar a conclusão sem anexar nada quando a ação dá certo e não há foto', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const acao = vi.fn().mockResolvedValue(undefined);

    // Act
    await act(() => result.current.executar(acao, { file: null, tipo: 'DEVOLUCAO' }));

    // Assert
    expect(acao).toHaveBeenCalledTimes(1);
    expect(evidenciasApi.anexar).not.toHaveBeenCalled();
    expect(onConcluida).toHaveBeenCalledTimes(1);
    expect(result.current.erro).toBeNull();
    expect(result.current.aviso).toBeNull();
  });

  it('deve guardar a mensagem da API e não avisar a conclusão quando a ação é recusada', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const recusa = new ApiError({ status: 409, message: 'Solicitação já foi triada.' });

    // Act
    await act(() => result.current.executar(() => Promise.reject(recusa), { file: foto }));

    // Assert
    expect(result.current.erro).toBe(recusa.message);
    expect(onConcluida).not.toHaveBeenCalled();
    expect(evidenciasApi.anexar).not.toHaveBeenCalled();
  });

  it('deve limpar o erro anterior quando a ação é tentada de novo e dá certo', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    await act(() => result.current.executar(() => Promise.reject(new Error('rede'))));

    // Act
    await act(() => result.current.executar(() => Promise.resolve()));

    // Assert
    expect(result.current.erro).toBeNull();
    expect(onConcluida).toHaveBeenCalledTimes(1);
  });

  it('deve anexar a foto depois da ação e atualizar o histórico quando a ação dá certo e há foto', async () => {
    // Arrange
    const { result, onConcluida, queryClient } = montar();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const ordem: string[] = [];
    vi.mocked(evidenciasApi.anexar).mockImplementation(async () => {
      ordem.push('foto');
      return aceito;
    });
    const acao = async () => {
      ordem.push('ação');
    };

    // Act
    await act(() => result.current.executar(acao, { file: foto, tipo: 'DEVOLUCAO', descricao: 'ok', feito }));

    // Assert
    expect(ordem).toEqual(['ação', 'foto']);
    expect(evidenciasApi.anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'DEVOLUCAO', descricao: 'ok' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.atividades('s1') });
    expect(onConcluida).toHaveBeenCalledTimes(1);
    expect(result.current.aviso).toBeNull();
  });

  it('deve deixar o aviso com a frase da ação e não avisar a conclusão quando a ação é feita e a foto falha', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('arquivo grande'));

    // Act
    await act(() => result.current.executar(() => Promise.resolve(), { file: foto, tipo: 'INSTRUCAO_SERVICO', feito }));

    // Assert
    expect(result.current.aviso).toMatchObject({ mensagem: feito, estado: 'falhou', enviando: false });
    expect(result.current.erro).toBeNull();
    expect(onConcluida).not.toHaveBeenCalled();
  });

  it('deve reenviar só a foto e passar o aviso a enviado quando a nova tentativa dá certo', async () => {
    // Arrange
    const { result, queryClient } = montar();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const acao = vi.fn().mockResolvedValue(undefined);
    vi.mocked(evidenciasApi.anexar).mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(aceito);
    await act(() => result.current.executar(acao, { file: foto, tipo: 'INSTRUCAO_SERVICO', feito }));

    // Act
    await act(() => result.current.aviso!.onTentarNovamente());

    // Assert
    expect(acao).toHaveBeenCalledTimes(1);
    expect(evidenciasApi.anexar).toHaveBeenCalledTimes(2);
    expect(result.current.aviso).toMatchObject({ estado: 'enviado' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.atividades('s1') });
  });

  it('deve manter o aviso de falha quando a nova tentativa também falha', async () => {
    // Arrange
    const { result } = montar();
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('rede'));
    await act(() => result.current.executar(() => Promise.resolve(), { file: foto, feito }));

    // Act
    await act(() => result.current.aviso!.onTentarNovamente());

    // Assert
    expect(result.current.aviso).toMatchObject({ estado: 'falhou' });
  });

  it('deve enviar a foto antes da ação quando a evidência pede o anexo antes', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const ordem: string[] = [];
    vi.mocked(evidenciasApi.anexar).mockImplementation(async () => {
      ordem.push('foto');
      return aceito;
    });
    const acao = async () => {
      ordem.push('ação');
    };

    // Act
    await act(() =>
      result.current.executar(acao, { file: foto, tipo: 'CONCLUSAO', descricao: 'ok', anexarAntes: true }),
    );

    // Assert
    expect(ordem).toEqual(['foto', 'ação']);
    expect(evidenciasApi.anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'CONCLUSAO', descricao: 'ok' });
    expect(onConcluida).toHaveBeenCalledTimes(1);
  });

  it('deve não executar a ação e mostrar o erro quando a foto que vai antes falha', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const recusa = new ApiError({ status: 422, message: 'Arquivo excede o tamanho máximo.' });
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(recusa);
    const acao = vi.fn();

    // Act
    await act(() => result.current.executar(acao, { file: foto, tipo: 'CONCLUSAO', anexarAntes: true }));

    // Assert
    expect(acao).not.toHaveBeenCalled();
    expect(result.current.erro).toBe(`A foto não foi enviada e a solicitação não foi concluída. ${recusa.message}`);
    expect(result.current.aviso).toBeNull();
    expect(onConcluida).not.toHaveBeenCalled();
  });

  it('deve não enviar a mesma foto outra vez quando a ação foi recusada e é tentada de novo', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    vi.mocked(evidenciasApi.anexar).mockResolvedValue(aceito);
    const acao = vi.fn().mockRejectedValueOnce(new Error('recusada')).mockResolvedValueOnce(undefined);
    const evidencia = { file: foto, tipo: 'CONCLUSAO', anexarAntes: true } as const;
    await act(() => result.current.executar(acao, evidencia));

    // Act
    await act(() => result.current.executar(acao, evidencia));

    // Assert
    expect(evidenciasApi.anexar).toHaveBeenCalledTimes(1);
    expect(acao).toHaveBeenCalledTimes(2);
    expect(onConcluida).toHaveBeenCalledTimes(1);
  });

  it('deve indicar atualização por outro usuário quando um evento da solicitação chega com o formulário aberto', async () => {
    // Arrange
    const { result, queryClient } = montar();

    // Act
    queryClient.setQueryData(solicitacoesKeys.atualizacao('s1'), 1);

    // Assert
    await waitFor(() => expect(result.current.atualizadaPorOutro).toBe(true));
  });

  it('deve não indicar atualização quando o evento é de outra solicitação', async () => {
    // Arrange
    const { result, queryClient } = montar();

    // Act
    queryClient.setQueryData(solicitacoesKeys.atualizacao('outra'), 1);
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    // Assert
    expect(result.current.atualizadaPorOutro).toBe(false);
  });

  it('deve não indicar atualização quando a mudança chegou antes de o formulário abrir', () => {
    // Arrange
    const onConcluida = vi.fn();
    const { QueryWrapper, queryClient } = createQueryWrapper();
    queryClient.setQueryData(solicitacoesKeys.atualizacao('s1'), 3);

    // Act
    const { result } = renderHook(() => useExecutarAcao('s1', onConcluida), { wrapper: QueryWrapper });

    // Assert
    expect(result.current.atualizadaPorOutro).toBe(false);
  });

  it('deve não indicar atualização quando o evento chega durante a execução da própria ação', async () => {
    // Arrange
    const { result, queryClient } = montar();
    const acaoQueGeraEvento = async () => {
      queryClient.setQueryData(solicitacoesKeys.atualizacao('s1'), 1);
      throw new Error('recusada');
    };

    // Act
    await act(() => result.current.executar(acaoQueGeraEvento));

    // Assert
    expect(result.current.atualizadaPorOutro).toBe(false);
  });
});
