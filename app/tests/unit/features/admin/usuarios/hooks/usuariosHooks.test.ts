/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useAlterarPerfilUsuario } from '@/features/admin/usuarios/hooks/useAlterarPerfilUsuario';
import { useAtivarUsuario } from '@/features/admin/usuarios/hooks/useAtivarUsuario';
import { useCriarUsuario } from '@/features/admin/usuarios/hooks/useCriarUsuario';
import { useDesativarUsuario } from '@/features/admin/usuarios/hooks/useDesativarUsuario';
import { useEditarUsuario } from '@/features/admin/usuarios/hooks/useEditarUsuario';
import { useExcluirUsuario } from '@/features/admin/usuarios/hooks/useExcluirUsuario';
import { useRedefinirSenhaUsuario } from '@/features/admin/usuarios/hooks/useRedefinirSenhaUsuario';
import { useUsuario } from '@/features/admin/usuarios/hooks/useUsuario';
import { useUsuarios } from '@/features/admin/usuarios/hooks/useUsuarios';

vi.mock('@/features/admin/usuarios/api/usuariosApi', () => {
  const u = { id: '1', nome: 'Otávio', email: 'o@o.com', perfil: 'OPERADOR', ativo: true };
  return {
    usuariosApi: {
      listar: vi.fn().mockResolvedValue({ content: [], page: 0, totalPages: 0, totalElements: 0 }),
      buscarPorId: vi.fn().mockResolvedValue(u),
      criar: vi.fn().mockResolvedValue(u),
      editar: vi.fn().mockResolvedValue(u),
      desativar: vi.fn().mockResolvedValue(u),
      ativar: vi.fn().mockResolvedValue(u),
      excluir: vi.fn().mockResolvedValue(undefined),
      redefinirSenha: vi.fn().mockResolvedValue(undefined),
      alterarPerfil: vi.fn().mockResolvedValue(u),
    },
  };
});

afterEach(() => vi.clearAllMocks());

describe('useUsuarios', () => {
  it('fetches usuarios list', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUsuarios({ page: 0, size: 20 }), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('useUsuario', () => {
  it('fetches a single usuario when id is provided', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUsuario('1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.nome).toBe('Otávio');
  });

  it('does not fetch when id is absent', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUsuario(), { wrapper: QueryWrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('mutation hooks', () => {
  it.each([
    ['useCriarUsuario', useCriarUsuario],
    ['useEditarUsuario', useEditarUsuario],
    ['useDesativarUsuario', useDesativarUsuario],
    ['useAtivarUsuario', useAtivarUsuario],
    ['useExcluirUsuario', useExcluirUsuario],
    ['useRedefinirSenhaUsuario', useRedefinirSenhaUsuario],
    ['useAlterarPerfilUsuario', useAlterarPerfilUsuario],
  ] as const)('%s exposes mutateAsync', (_, hook) => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => hook(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
