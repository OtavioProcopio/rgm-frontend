/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useAlterarSenha } from '@/features/auth/hooks/useAlterarSenha';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { usePerfil } from '@/features/auth/hooks/usePerfil';

vi.mock('@/features/auth/api/authApi', () => ({
  authApi: { login: vi.fn().mockResolvedValue({ token: 'tok', refreshToken: 'ref', nome: 'A', perfil: 'OPERADOR' }) },
}));

vi.mock('@/features/auth/api/perfilApi', () => ({
  perfilApi: {
    obterPerfil: vi.fn().mockResolvedValue({ nome: 'Otávio', email: 'o@o.com', perfil: 'OPERADOR' }),
    alterarSenha: vi.fn().mockResolvedValue(undefined),
  },
}));

afterEach(() => vi.clearAllMocks());

describe('useLogin', () => {
  it('exposes mutateAsync', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('usePerfil', () => {
  it('fetches perfil data', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePerfil(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.nome).toBe('Otávio');
  });
});

describe('useAlterarSenha', () => {
  it('exposes mutateAsync', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAlterarSenha(), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
