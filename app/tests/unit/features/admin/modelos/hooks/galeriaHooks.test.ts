/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useAdicionarFotoGaleria } from '@/features/admin/modelos/hooks/useAdicionarFotoGaleria';
import { useEditarFotoGaleria } from '@/features/admin/modelos/hooks/useEditarFotoGaleria';
import { useGaleriaModelo } from '@/features/admin/modelos/hooks/useGaleriaModelo';
import { useRemoverFotoGaleria } from '@/features/admin/modelos/hooks/useRemoverFotoGaleria';

const { foto } = vi.hoisted(() => ({
  foto: {
    id: 'f1',
    modeloId: '1',
    publicUrl: 'http://minio/f1.jpg',
    identificacao: 'Parte 1',
    principal: true,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-01T00:00:00Z',
  },
}));

vi.mock('@/features/admin/modelos/api/galeriaApi', () => ({
  galeriaApi: {
    listar: vi.fn().mockResolvedValue([foto]),
    adicionar: vi.fn().mockResolvedValue(foto),
    editar: vi.fn().mockResolvedValue(foto),
    remover: vi.fn().mockResolvedValue(undefined),
  },
}));

afterEach(() => vi.clearAllMocks());

describe('useGaleriaModelo', () => {
  it('fetches gallery when modeloId is provided', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useGaleriaModelo('1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([foto]);
  });

  it('does not fetch when modeloId is absent', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useGaleriaModelo(), { wrapper: QueryWrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useAdicionarFotoGaleria', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdicionarFotoGaleria(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useEditarFotoGaleria', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEditarFotoGaleria(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useRemoverFotoGaleria', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRemoverFotoGaleria(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
