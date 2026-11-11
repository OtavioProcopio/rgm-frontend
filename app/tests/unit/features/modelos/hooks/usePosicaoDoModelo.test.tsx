/**
 * @vitest-environment jsdom
 */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { usePosicaoDoModelo } from '@/features/modelos/hooks/usePosicaoDoModelo';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('usePosicaoDoModelo', () => {
  it('deve pedir a posição do modelo com os filtros e devolvê-la', async () => {
    // Arrange
    const posicao = vi.spyOn(modelosApi, 'posicao').mockResolvedValue({ posicao: 135, total: 300 });
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => usePosicaoDoModelo('m1', { ativo: true }, true), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.data).toEqual({ posicao: 135, total: 300 }));

    // Assert
    expect(posicao).toHaveBeenCalledExactlyOnceWith('m1', { ativo: true });
  });

  it('não deve consultar sem modelo ou quando está desabilitado', async () => {
    // Arrange
    const posicao = vi.spyOn(modelosApi, 'posicao').mockResolvedValue({ posicao: 1, total: 1 });
    const { QueryWrapper } = createQueryWrapper();

    // Act
    renderHook(() => usePosicaoDoModelo('', { ativo: true }, true), { wrapper: QueryWrapper });
    renderHook(() => usePosicaoDoModelo('m1', { ativo: true }, false), { wrapper: QueryWrapper });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Assert
    expect(posicao).not.toHaveBeenCalled();
  });
});
