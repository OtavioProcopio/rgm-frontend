/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';

vi.mock('@/features/admin/modelos/api/maquinasApi', () => ({
  maquinasApi: {
    listar: vi.fn().mockResolvedValue([
      { id: 'm1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' },
      { id: 'm2', nome: 'VICK', ativo: true, criadoEm: '', atualizadoEm: '' },
    ]),
  },
}));

afterEach(() => vi.clearAllMocks());

describe('useMaquinas', () => {
  it('fetches the machine catalog', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useMaquinas(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { id: 'm1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' },
      { id: 'm2', nome: 'VICK', ativo: true, criadoEm: '', atualizadoEm: '' },
    ]);
  });
});
