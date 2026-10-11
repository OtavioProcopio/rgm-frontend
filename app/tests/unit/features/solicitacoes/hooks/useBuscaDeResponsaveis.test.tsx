/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { useBuscaDeResponsaveis } from '@/features/solicitacoes/hooks/useBuscaDeResponsaveis';

const listar = vi.fn();
let perfil: 'GESTOR' | 'OPERADOR' = 'GESTOR';

vi.mock('@/features/solicitacoes/api/responsaveisDisponiveisApi', () => ({
  responsaveisDisponiveisApi: { listar: (...args: unknown[]) => listar(...args) },
}));
vi.mock('@/app/providers/authContext', () => ({
  useAuth: () => ({ user: { perfil } }),
}));

const pagina = (nomes: string[]) => ({
  content: nomes.map((nome, i) => ({ id: String(i), nome, perfil: 'OPERADOR' })),
  page: 0,
  size: 20,
  totalElements: nomes.length,
  totalPages: 1,
});

afterEach(() => {
  vi.clearAllMocks();
  perfil = 'GESTOR';
});

describe('useBuscaDeResponsaveis', () => {
  it('deve listar a primeira página sem termo quando o gestor abre a busca', async () => {
    // Arrange
    listar.mockResolvedValue(pagina(['Ana', 'Beto']));
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useBuscaDeResponsaveis(), { wrapper: QueryWrapper });

    // Assert
    await waitFor(() => expect(result.current.candidatos).toHaveLength(2));
    expect(listar).toHaveBeenCalledWith({ busca: undefined, page: 0, size: 20 });
  });

  it('deve buscar no servidor pelo termo quando ele tem 2 ou mais caracteres', async () => {
    // Arrange
    listar.mockResolvedValue(pagina(['Zélia']));
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBuscaDeResponsaveis(), { wrapper: QueryWrapper });

    // Act
    act(() => result.current.buscar('zel'));

    // Assert
    await waitFor(() => expect(listar).toHaveBeenCalledWith({ busca: 'zel', page: 0, size: 20 }));
  });

  it('deve tratar 1 caractere como busca vazia quando o termo é curto demais', async () => {
    // Arrange
    listar.mockResolvedValue(pagina(['Ana']));
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBuscaDeResponsaveis(), { wrapper: QueryWrapper });

    // Act
    act(() => result.current.buscar('z'));
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Assert
    expect(listar).not.toHaveBeenCalledWith(expect.objectContaining({ busca: 'z' }));
  });

  it('deve não consultar quando o perfil não tria', () => {
    // Arrange
    perfil = 'OPERADOR';
    const { QueryWrapper } = createQueryWrapper();

    // Act
    renderHook(() => useBuscaDeResponsaveis(), { wrapper: QueryWrapper });

    // Assert
    expect(listar).not.toHaveBeenCalled();
  });

  it('deve marcar falha quando a consulta é recusada', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('500'));
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useBuscaDeResponsaveis(), { wrapper: QueryWrapper });

    // Assert
    await waitFor(() => expect(result.current.falhou).toBe(true));
  });
});
