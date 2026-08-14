/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useAtivarMaquina } from './useAtivarMaquina';
import { useCriarMaquina } from './useCriarMaquina';
import { useDesativarMaquina } from './useDesativarMaquina';
import { useRenomearMaquina } from './useRenomearMaquina';

vi.mock('../api/maquinasAdminApi', () => {
  const m = { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' };
  return {
    maquinasAdminApi: {
      criar: vi.fn().mockResolvedValue(m),
      renomear: vi.fn().mockResolvedValue(m),
      ativar: vi.fn().mockResolvedValue(m),
      desativar: vi.fn().mockResolvedValue(m),
    },
  };
});

afterEach(() => vi.clearAllMocks());

describe('mutation hooks', () => {
  it.each([
    ['useCriarMaquina', useCriarMaquina],
    ['useRenomearMaquina', useRenomearMaquina],
    ['useAtivarMaquina', useAtivarMaquina],
    ['useDesativarMaquina', useDesativarMaquina],
  ] as const)('%s exposes mutateAsync', (_, hook) => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => hook(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
