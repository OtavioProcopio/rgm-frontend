/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useKanbanActions } from './useKanbanActions';

vi.mock('../api/solicitacoesApi', () => ({
  solicitacoesApi: {
    triar: vi.fn().mockResolvedValue({}),
    enviarParaValidacao: vi.fn().mockResolvedValue({}),
    encerrar: vi.fn().mockResolvedValue({}),
    cancelar: vi.fn().mockResolvedValue({}),
    devolver: vi.fn().mockResolvedValue({}),
  },
}));

describe('useKanbanActions', () => {
  it('exposes all action mutations', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useKanbanActions(), { wrapper: QueryWrapper });
    expect(typeof result.current.triar.mutateAsync).toBe('function');
    expect(typeof result.current.enviarValidacao.mutateAsync).toBe('function');
    expect(typeof result.current.encerrar.mutateAsync).toBe('function');
    expect(typeof result.current.cancelar.mutateAsync).toBe('function');
    expect(typeof result.current.devolver.mutateAsync).toBe('function');
  });
});
