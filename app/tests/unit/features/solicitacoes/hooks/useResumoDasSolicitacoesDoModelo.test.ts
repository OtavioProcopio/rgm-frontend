/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import { useResumoDasSolicitacoesDoModelo } from '@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo';

vi.mock('@/features/admin/modelos/api/modelosApi', () => ({
  modelosApi: { obterResumoDasSolicitacoes: vi.fn() },
}));

const RESUMO = {
  total: 40,
  emAberto: 6,
  concluidas: 30,
  canceladas: 4,
  tempoMedioResolucaoSegundos: 7200,
  intervaloMedioSegundos: null,
};

beforeEach(() => {
  vi.mocked(modelosApi.obterResumoDasSolicitacoes).mockReset();
  vi.mocked(modelosApi.obterResumoDasSolicitacoes).mockResolvedValue(RESUMO);
});

async function montar(modeloId: string) {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(() => useResumoDasSolicitacoesDoModelo(modeloId), {
    wrapper: QueryWrapper,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return { result, queryClient };
}

describe('useResumoDasSolicitacoesDoModelo', () => {
  it('deve pedir à API, uma vez, o resumo do modelo informado', async () => {
    // Act
    await montar('m-1');

    // Assert
    expect(modelosApi.obterResumoDasSolicitacoes).toHaveBeenCalledTimes(1);
    expect(modelosApi.obterResumoDasSolicitacoes).toHaveBeenCalledWith('m-1');
  });

  it('deve devolver o resumo que a API calculou', async () => {
    // Act
    const { result } = await montar('m-1');

    // Assert
    expect(result.current.data).toEqual(RESUMO);
  });

  it('deve não chamar a API quando não há modelo', () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();

    // Act
    renderHook(() => useResumoDasSolicitacoesDoModelo(undefined), { wrapper: QueryWrapper });

    // Assert
    expect(modelosApi.obterResumoDasSolicitacoes).not.toHaveBeenCalled();
  });

  it('deve buscar o resumo de novo quando as listas de solicitações são atualizadas', async () => {
    // Arrange
    const { queryClient } = await montar('m-1');

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() }));

    // Assert
    expect(modelosApi.obterResumoDasSolicitacoes).toHaveBeenCalledTimes(2);
  });
});
