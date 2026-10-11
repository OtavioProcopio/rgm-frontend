/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useAtivarTipoModelo } from '@/features/admin/tiposModelo/hooks/useAtivarTipoModelo';
import { useCriarTipoModelo } from '@/features/admin/tiposModelo/hooks/useCriarTipoModelo';
import { useDesativarTipoModelo } from '@/features/admin/tiposModelo/hooks/useDesativarTipoModelo';
import { useRenomearTipoModelo } from '@/features/admin/tiposModelo/hooks/useRenomearTipoModelo';

vi.mock('@/features/admin/tiposModelo/api/tiposModeloAdminApi', () => {
  const m = { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' };
  return {
    tiposModeloAdminApi: {
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
    ['useCriarTipoModelo', useCriarTipoModelo],
    ['useRenomearTipoModelo', useRenomearTipoModelo],
    ['useAtivarTipoModelo', useAtivarTipoModelo],
    ['useDesativarTipoModelo', useDesativarTipoModelo],
  ] as const)('%s exposes mutateAsync', (_, hook) => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => hook(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
