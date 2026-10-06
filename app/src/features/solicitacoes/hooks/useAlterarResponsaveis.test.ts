/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';
import { useAlterarResponsaveis } from './useAlterarResponsaveis';

vi.mock('../api/solicitacoesApi', () => ({
  solicitacoesApi: { alterarResponsaveis: vi.fn().mockResolvedValue({}) },
}));

describe('useAlterarResponsaveis', () => {
  it('deve atualizar o detalhe e as listas quando os responsáveis são alterados', async () => {
    // Arrange
    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAlterarResponsaveis('s1'), { wrapper: QueryWrapper });

    // Act
    await act(() => result.current.mutateAsync({ responsavelIds: ['op'] }));

    // Assert
    expect(solicitacoesApi.alterarResponsaveis).toHaveBeenCalledWith('s1', { responsavelIds: ['op'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.detail('s1') });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
  });
});
