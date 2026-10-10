/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { useTemSolicitacaoDoOperador } from '@/features/solicitacoes/hooks/useTemSolicitacaoDoOperador';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { listar: vi.fn() },
}));

type Pagina = Awaited<ReturnType<typeof solicitacoesApi.listar>>;

function paginaCom(totalElements: number): Pagina {
  return { content: [], page: 0, size: 1, totalPages: totalElements, totalElements };
}

beforeEach(() => {
  vi.mocked(solicitacoesApi.listar).mockReset();
  vi.mocked(solicitacoesApi.listar).mockResolvedValue(paginaCom(1));
});

function montar(enabled: boolean) {
  const { QueryWrapper } = createQueryWrapper();
  return renderHook(() => useTemSolicitacaoDoOperador({ enabled }), { wrapper: QueryWrapper });
}

describe('useTemSolicitacaoDoOperador', () => {
  it('deve não chamar a API quando enabled é falso', () => {
    // Act
    montar(false);

    // Assert
    expect(solicitacoesApi.listar).not.toHaveBeenCalled();
  });

  it('deve listar, uma vez, só a primeira página de tamanho 1 sem filtro de status nem período', async () => {
    // Act
    const { result } = montar(true);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledTimes(1);
    expect(solicitacoesApi.listar).toHaveBeenCalledWith({ page: 0, size: 1 });
  });

  it('deve devolver verdadeiro quando a listagem tem ao menos uma solicitação', async () => {
    // Act
    const { result } = montar(true);

    // Assert
    await waitFor(() => expect(result.current.data).toBe(true));
  });

  it('deve devolver falso quando a listagem não tem nenhuma solicitação', async () => {
    // Arrange
    vi.mocked(solicitacoesApi.listar).mockResolvedValue(paginaCom(0));

    // Act
    const { result } = montar(true);

    // Assert
    await waitFor(() => expect(result.current.data).toBe(false));
  });

  it('deve sinalizar erro e não afirmar nada quando a listagem falha', async () => {
    // Arrange
    vi.mocked(solicitacoesApi.listar).mockRejectedValue(new Error('sem rede'));

    // Act
    const { result } = montar(true);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
