/**
 * @vitest-environment jsdom
 */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { useContagensDeModelos } from '@/features/modelos/hooks/useContagensDeModelos';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const CONTAGENS = { total: 3, porTipo: [{ tipo: 'RESINA', total: 3 }], porMaquina: [] };

describe('useContagensDeModelos', () => {
  it('deve pedir as contagens com os mesmos filtros e devolvê-las', async () => {
    // Arrange
    const contagens = vi.spyOn(modelosApi, 'contagens').mockResolvedValue(CONTAGENS);
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(
      () => useContagensDeModelos({ ativo: true, maquina: 'FBOX', maquinaExata: true }),
      { wrapper: QueryWrapper },
    );
    await waitFor(() => expect(result.current.data).toEqual(CONTAGENS));

    // Assert
    expect(contagens).toHaveBeenCalledExactlyOnceWith({
      ativo: true,
      maquina: 'FBOX',
      maquinaExata: true,
    });
  });

  it('deve manter os números anteriores enquanto os novos chegam', async () => {
    // Arrange
    let liberar: (valor: typeof CONTAGENS) => void = () => undefined;
    vi.spyOn(modelosApi, 'contagens')
      .mockResolvedValueOnce(CONTAGENS)
      .mockImplementationOnce(() => new Promise((resolve) => (liberar = resolve)));
    const { QueryWrapper } = createQueryWrapper();
    const { result, rerender } = renderHook(({ q }) => useContagensDeModelos({ ativo: true, q }), {
      wrapper: QueryWrapper,
      initialProps: { q: 'ab' },
    });
    await waitFor(() => expect(result.current.data).toEqual(CONTAGENS));

    // Act
    rerender({ q: 'abc' });

    // Assert
    expect(result.current.data).toEqual(CONTAGENS);
    expect(result.current.isPlaceholderData).toBe(true);
    liberar({ total: 1, porTipo: [], porMaquina: [] });
    await waitFor(() => expect(result.current.data?.total).toBe(1));
  });
});
