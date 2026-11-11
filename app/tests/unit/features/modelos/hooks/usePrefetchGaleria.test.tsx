/**
 * @vitest-environment jsdom
 */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { galeriaApi } from '@/features/admin/modelos/api/galeriaApi';
import { usePrefetchGaleria } from '@/features/modelos/hooks/usePrefetchGaleria';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('usePrefetchGaleria', () => {
  it('deve carregar a galeria de cada vizinho em segundo plano, ignorando os vazios', async () => {
    // Arrange
    const listar = vi.spyOn(galeriaApi, 'listar').mockResolvedValue([]);
    const { QueryWrapper } = createQueryWrapper();

    // Act
    renderHook(() => usePrefetchGaleria(['m1', undefined, 'm3']), { wrapper: QueryWrapper });

    // Assert
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
    expect(listar).toHaveBeenCalledWith('m1');
    expect(listar).toHaveBeenCalledWith('m3');
  });

  it('não deve carregar de novo os mesmos vizinhos quando a tela renderiza outra vez', async () => {
    // Arrange
    const listar = vi.spyOn(galeriaApi, 'listar').mockResolvedValue([]);
    const { QueryWrapper } = createQueryWrapper();
    const { rerender } = renderHook(() => usePrefetchGaleria(['m1']), { wrapper: QueryWrapper });
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(1));

    // Act
    rerender();
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Assert
    expect(listar).toHaveBeenCalledTimes(1);
  });
});
