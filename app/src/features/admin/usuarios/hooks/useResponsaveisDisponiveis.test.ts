/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { usuariosApi } from '../api/usuariosApi';
import { useResponsaveisDisponiveis } from './useResponsaveisDisponiveis';

vi.mock('../api/usuariosApi', () => ({ usuariosApi: { listar: vi.fn() } }));

const operador = { id: 'op', nome: 'Op', email: null, perfil: 'OPERADOR', ativo: true, criadoEm: '', atualizadoEm: '' };
const administrador = { ...operador, id: 'ad', perfil: 'ADMINISTRADOR' };

afterEach(() => vi.clearAllMocks());

describe('useResponsaveisDisponiveis', () => {
  it('deve devolver só quem pode ser responsável quando o usuário é gestor', async () => {
    // Arrange
    vi.mocked(usuariosApi.listar).mockResolvedValue({
      content: [operador, administrador],
      page: 0,
      totalPages: 1,
      totalElements: 2,
    } as Awaited<ReturnType<typeof usuariosApi.listar>>);
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });

    // Act
    const { result } = renderHook(() => useResponsaveisDisponiveis(), { wrapper: AppWrapper });

    // Assert
    await waitFor(() => expect(result.current.responsaveis).toEqual([operador]));
    expect(usuariosApi.listar).toHaveBeenCalledTimes(1);
    expect(usuariosApi.listar).toHaveBeenCalledWith({ page: 0, size: 100, ativo: true });
  });

  it('deve não buscar usuários quando o usuário é operador', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    const { result } = renderHook(() => useResponsaveisDisponiveis(), { wrapper: AppWrapper });

    // Assert
    expect(result.current.responsaveis).toEqual([]);
    expect(usuariosApi.listar).not.toHaveBeenCalled();
  });
});
