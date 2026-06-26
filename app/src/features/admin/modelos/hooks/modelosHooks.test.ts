/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useAtivarModelo } from './useAtivarModelo';
import { useCriarModelo } from './useCriarModelo';
import { useDesativarModelo } from './useDesativarModelo';
import { useEditarModelo } from './useEditarModelo';
import { useEventosModelo } from './useEventosModelo';
import { useModelo } from './useModelo';
import { useModelos } from './useModelos';
import { useUploadFotoCapa } from './useUploadFotoCapa';

vi.mock('../api/modelosApi', () => ({
  modelosApi: {
    listar: vi.fn().mockResolvedValue({ content: [], page: 0, totalPages: 0, totalElements: 0 }),
    buscarPorId: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01', ativo: true }),
    listarEventos: vi.fn().mockResolvedValue([]),
    criar: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01' }),
    editar: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01' }),
    desativar: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01', ativo: false }),
    ativar: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01', ativo: true }),
    uploadFotoCapa: vi.fn().mockResolvedValue({ id: '1', codigo: 'M01' }),
  },
}));

afterEach(() => vi.clearAllMocks());

describe('useModelos', () => {
  it('fetches modelos list', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useModelos({ page: 0, size: 20 }), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('useModelo', () => {
  it('fetches a single modelo when id is provided', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useModelo('1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: '1', codigo: 'M01', ativo: true });
  });

  it('does not fetch when id is absent', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useModelo(), { wrapper: QueryWrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useEventosModelo', () => {
  it('fetches eventos when id is provided', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEventosModelo('1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when id is absent', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEventosModelo(), { wrapper: QueryWrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCriarModelo', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCriarModelo(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useEditarModelo', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEditarModelo(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useDesativarModelo', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDesativarModelo(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useAtivarModelo', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAtivarModelo(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useUploadFotoCapa', () => {
  it('exposes mutate function', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUploadFotoCapa(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
