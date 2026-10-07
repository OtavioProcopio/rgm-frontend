/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthProvider } from '@/app/providers/AuthProvider';
import { useAuth } from '@/app/providers/authContext';
import { authToken } from '@/shared/api/authToken';

beforeEach(() => {
  localStorage.clear();
});

function montar() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe('AuthProvider — renovarCredenciais', () => {
  it('deve começar com a versão da sessão em zero quando nenhuma credencial foi trocada', () => {
    // Act
    const { result } = montar();

    // Assert
    expect(result.current.versaoDaSessao).toBe(0);
  });

  it('deve passar a usar a credencial de acesso nova quando as credenciais são renovadas', () => {
    // Arrange
    authToken.setTokens('acesso-antigo', 'renovacao-antiga');
    const { result } = montar();

    // Act
    act(() => result.current.renovarCredenciais('acesso-novo', 'renovacao-nova'));

    // Assert
    expect(authToken.getAccessToken()).toBe('acesso-novo');
  });

  it('deve passar a usar a credencial de renovação nova quando as credenciais são renovadas', () => {
    // Arrange
    authToken.setTokens('acesso-antigo', 'renovacao-antiga');
    const { result } = montar();

    // Act
    act(() => result.current.renovarCredenciais('acesso-novo', 'renovacao-nova'));

    // Assert
    expect(authToken.getRefreshToken()).toBe('renovacao-nova');
  });

  it('deve subir a versão da sessão em um a cada renovação de credenciais', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => result.current.renovarCredenciais('acesso-1', 'renovacao-1'));
    act(() => result.current.renovarCredenciais('acesso-2', 'renovacao-2'));

    // Assert
    expect(result.current.versaoDaSessao).toBe(2);
  });

  it('deve manter o usuário autenticado quando as credenciais são renovadas', () => {
    // Arrange
    authToken.setTokens('acesso-antigo', 'renovacao-antiga');
    authToken.setUser({ nome: 'Ana', perfil: 'OPERADOR' });
    const { result } = montar();

    // Act
    act(() => result.current.renovarCredenciais('acesso-novo', 'renovacao-nova'));

    // Assert
    expect(result.current.user).toEqual({ nome: 'Ana', perfil: 'OPERADOR' });
  });
});
