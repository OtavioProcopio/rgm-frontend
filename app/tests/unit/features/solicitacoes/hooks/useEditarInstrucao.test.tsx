/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import { useEditarInstrucao } from '@/features/solicitacoes/hooks/useEditarInstrucao';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

afterEach(() => {
  vi.restoreAllMocks();
});

function emAndamento(): Solicitacao {
  return criarSolicitacao({
    status: 'EM_ANDAMENTO',
    prioridade: 'ALTA',
    instrucao: 'Antiga',
    responsavelIds: ['op1', 'op2'],
    acoesPermitidas: ['ENVIAR_VALIDACAO', 'EDITAR_INSTRUCAO'],
  });
}

describe('useEditarInstrucao', () => {
  it('deve atualizar só a instrução e a data no detalhe em cache, mantendo responsáveis e ações', async () => {
    // Arrange
    const { QueryWrapper, queryClient } = createQueryWrapper();
    const atual = emAndamento();
    queryClient.setQueryData(solicitacoesKeys.detail('s1'), atual);
    vi.spyOn(solicitacoesApi, 'editarInstrucao').mockResolvedValue({
      ...atual,
      instrucao: 'Nova',
      atualizadaEm: '2026-01-02T00:00:00Z',
      responsavelIds: [],
      acoesPermitidas: null,
    });
    const { result } = renderHook(() => useEditarInstrucao('s1'), { wrapper: QueryWrapper });

    // Act
    await result.current.mutateAsync({ instrucao: 'Nova' });

    // Assert
    const emCache = queryClient.getQueryData<Solicitacao>(solicitacoesKeys.detail('s1'))!;
    expect(emCache.instrucao).toBe('Nova');
    expect(emCache.atualizadaEm).toBe('2026-01-02T00:00:00Z');
    expect(emCache.responsavelIds).toEqual(['op1', 'op2']);
    expect(emCache.acoesPermitidas).toEqual(['ENVIAR_VALIDACAO', 'EDITAR_INSTRUCAO']);
    expect(emCache.status).toBe('EM_ANDAMENTO');
  });

  it('deve recarregar as listas e o histórico, e não consultar o detalhe de novo', async () => {
    // Arrange
    const { QueryWrapper, queryClient } = createQueryWrapper();
    queryClient.setQueryData(solicitacoesKeys.detail('s1'), emAndamento());
    vi.spyOn(solicitacoesApi, 'editarInstrucao').mockResolvedValue(emAndamento());
    const buscarDetalhe = vi.spyOn(solicitacoesApi, 'buscarPorId');
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEditarInstrucao('s1'), { wrapper: QueryWrapper });

    // Act
    await result.current.mutateAsync({ instrucao: 'Nova' });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.atividades('s1') });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: solicitacoesKeys.detail('s1') });
    expect(buscarDetalhe).not.toHaveBeenCalled();
  });

  it('não deve inventar um detalhe em cache quando a solicitação não estava carregada', async () => {
    // Arrange
    const { QueryWrapper, queryClient } = createQueryWrapper();
    vi.spyOn(solicitacoesApi, 'editarInstrucao').mockResolvedValue(emAndamento());
    const { result } = renderHook(() => useEditarInstrucao('s1'), { wrapper: QueryWrapper });

    // Act
    await result.current.mutateAsync({ instrucao: 'Nova' });

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.detail('s1'))).toBeUndefined();
  });

  it('não deve tocar no detalhe nem recarregar nada, e deve expor o erro, quando a API recusa', async () => {
    // Arrange
    const { QueryWrapper, queryClient } = createQueryWrapper();
    queryClient.setQueryData(solicitacoesKeys.detail('s1'), emAndamento());
    vi.spyOn(solicitacoesApi, 'editarInstrucao').mockRejectedValue(new Error('conflito'));
    const gravar = vi.spyOn(queryClient, 'setQueryData');
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEditarInstrucao('s1'), { wrapper: QueryWrapper });

    // Act
    result.current.mutate({ instrucao: 'Nova' });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(gravar).not.toHaveBeenCalled();
    expect(invalidar).not.toHaveBeenCalled();
  });
});
