/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { perfilApi } from '@/features/auth/api/perfilApi';
import { useAlterarSenha } from '@/features/auth/hooks/useAlterarSenha';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/auth/api/authApi', () => ({
  authApi: { login: vi.fn().mockResolvedValue({ token: 'tok', refreshToken: 'ref', nome: 'A', perfil: 'OPERADOR' }) },
}));

vi.mock('@/features/auth/api/perfilApi', () => ({
  perfilApi: {
    obterPerfil: vi.fn().mockResolvedValue({ nome: 'Otávio', email: 'o@o.com', perfil: 'OPERADOR' }),
    alterarSenha: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockRenovarCredenciais = vi.fn();
vi.mock('@/app/providers/authContext', () => ({
  useAuth: () => ({ renovarCredenciais: mockRenovarCredenciais }),
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
  const TROCA = { senhaAtual: 'senha-antiga', novaSenha: 'senha-nova-1' };
  const USUARIO = {
    id: 'u-1',
    nome: 'Ana',
    email: 'ana@empresa.com.br',
    perfil: 'OPERADOR' as const,
    ativo: true,
    criadoEm: '2026-10-01T10:00:00Z',
    atualizadoEm: '2026-10-07T10:00:00Z',
  };

  function montar() {
    const { QueryWrapper } = createQueryWrapper();
    return renderHook(() => useAlterarSenha(), { wrapper: QueryWrapper });
  }

  it('deve enviar à API a senha atual e a nova quando a troca é pedida', async () => {
    // Arrange
    vi.mocked(perfilApi.alterarSenha).mockResolvedValue(USUARIO);
    const { result } = montar();

    // Act
    await result.current.mutateAsync(TROCA);

    // Assert
    expect(perfilApi.alterarSenha).toHaveBeenCalledTimes(1);
    expect(vi.mocked(perfilApi.alterarSenha).mock.calls[0][0]).toEqual(TROCA);
  });

  it('deve renovar as credenciais da sessão com o par devolvido quando a troca dá certo', async () => {
    // Arrange
    vi.mocked(perfilApi.alterarSenha).mockResolvedValue({
      ...USUARIO,
      token: 'acesso-novo',
      refreshToken: 'renovacao-nova',
    });
    const { result } = montar();

    // Act
    await result.current.mutateAsync(TROCA);

    // Assert
    expect(mockRenovarCredenciais).toHaveBeenCalledTimes(1);
    expect(mockRenovarCredenciais).toHaveBeenCalledWith('acesso-novo', 'renovacao-nova');
  });

  it('deve manter as credenciais em uso quando a resposta da troca não traz credenciais novas', async () => {
    // Arrange
    vi.mocked(perfilApi.alterarSenha).mockResolvedValue(USUARIO);
    const { result } = montar();

    // Act
    await result.current.mutateAsync(TROCA);

    // Assert
    expect(mockRenovarCredenciais).not.toHaveBeenCalled();
  });

  it('deve manter as credenciais em uso quando a API recusa a troca', async () => {
    // Arrange
    const recusa = new ApiError({ status: 400, message: 'Senha atual incorreta' });
    vi.mocked(perfilApi.alterarSenha).mockRejectedValue(recusa);
    const { result } = montar();

    // Act
    const tentativa = result.current.mutateAsync(TROCA);

    // Assert
    await expect(tentativa).rejects.toBe(recusa);
    expect(mockRenovarCredenciais).not.toHaveBeenCalled();
  });
});
