/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { modelosKeys } from '@/features/admin/modelos/hooks/modelosKeys';
import { useResumoDeModelos } from '@/features/admin/modelos/hooks/useResumoDeModelos';

vi.mock('@/features/admin/modelos/api/modelosApi', () => ({
  modelosApi: { obterResumo: vi.fn() },
}));

const RESUMO = {
  total: 12,
  ativos: 9,
  inativos: 3,
  comPendenciaAberta: 4,
  porMaquina: [{ maquina: 'DISA', quantidade: 7 }],
};

beforeEach(() => {
  vi.mocked(modelosApi.obterResumo).mockReset();
  vi.mocked(modelosApi.obterResumo).mockResolvedValue(RESUMO);
});

async function montar() {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(() => useResumoDeModelos(), { wrapper: QueryWrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return { result, queryClient };
}

describe('useResumoDeModelos', () => {
  it('deve pedir o resumo à API uma vez', async () => {
    // Act
    await montar();

    // Assert
    expect(modelosApi.obterResumo).toHaveBeenCalledTimes(1);
  });

  it('deve devolver as contagens que a API calculou', async () => {
    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.data).toEqual(RESUMO);
  });

  it('deve buscar o resumo de novo quando as listas de modelos são atualizadas', async () => {
    // Arrange
    const { queryClient } = await montar();

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: modelosKeys.lists() }));

    // Assert
    expect(modelosApi.obterResumo).toHaveBeenCalledTimes(2);
  });
});
