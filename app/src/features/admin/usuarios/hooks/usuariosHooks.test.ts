/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useAlterarPerfilUsuario } from './useAlterarPerfilUsuario';
import { useAtivarUsuario } from './useAtivarUsuario';
import { useCriarUsuario } from './useCriarUsuario';
import { useDesativarUsuario } from './useDesativarUsuario';
import { useEditarUsuario } from './useEditarUsuario';
import { useExcluirUsuario } from './useExcluirUsuario';
import { useRedefinirSenhaUsuario } from './useRedefinirSenhaUsuario';
import { useUsuario } from './useUsuario';
import { useUsuarios } from './useUsuarios';

vi.mock('../api/usuariosApi', () => {
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
