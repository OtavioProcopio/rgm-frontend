/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/app/providers/authContext';
import { createQueryWrapper } from '@tests/support/queryWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { usePainelPorPeriodo } from '@/features/solicitacoes/hooks/usePainelPorPeriodo';
import type {
  PainelPorPeriodo,
  PeriodoAnteriorDoPainel,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { ApiError } from '@/shared/api/apiError';

const ANTERIOR: PeriodoAnteriorDoPainel = {
  inicio: '2026-08-10',
  fim: '2026-09-09',
  criadas: 10,
  concluidas: 120,
  canceladas: 1,
  tempoMedioResolucaoSegundos: 3600,
  serie: [],
};
const PAINEL: PainelPorPeriodo = {
  periodo: {
    ...ANTERIOR,
    inicio: '2026-09-10',
    fim: '2026-10-10',
    concluidas: 140,
    abertasAgora: 12,
    atrasadasAgora: 3,
  },
  anterior: ANTERIOR,
};

function erroHttp(status: number): ApiError {
  return new ApiError({ status, message: `HTTP ${status}` });
}

function montar(dias: number, options?: { enabled?: boolean; modeloId?: string }) {
  const { QueryWrapper } = createQueryWrapper();
  return renderHook(() => usePainelPorPeriodo(dias, options), { wrapper: QueryWrapper });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePainelPorPeriodo', () => {
  it('deve devolver os dados do painel quando a API responde', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(result.current.data).toEqual(PAINEL);
  });

  it('deve consultar o painel com os dias e o modelo quando monta', async () => {
    // Arrange
    const obterPainel = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);

    // Act
    const { result } = montar(7, { modeloId: 'modelo-1' });
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(obterPainel).toHaveBeenCalledExactlyOnceWith(7, 'modelo-1');
  });

  it('deve estar indisponível quando a API responde 404', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(erroHttp(404));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.indisponivel).toBe(true));

    // Assert
    expect(result.current.isError).toBe(false);
  });

  it('deve sinalizar erro e não indisponível quando a API responde 500', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(erroHttp(500));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.indisponivel).toBe(false);
  });

  it('deve sinalizar erro e não indisponível quando a chamada falha na rede', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(new TypeError('Failed to fetch'));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.indisponivel).toBe(false);
  });

  it('deve não chamar a API quando enabled é falso', () => {
    // Arrange
    const obterPainel = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);

    // Act
    montar(30, { enabled: false });

    // Assert
    expect(obterPainel).not.toHaveBeenCalled();
  });

  it('deve estar carregando quando a resposta ainda não chegou', () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar(30);

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('deve consultar de novo quando refetch é chamado', async () => {
    // Arrange
    const obterPainel = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Act
    await result.current.refetch();

    // Assert
    expect(obterPainel).toHaveBeenCalledTimes(2);
  });

  it('deve consultar o painel uma só vez quando a API responde 404', async () => {
    // Arrange
    const obter = vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(erroHttp(404));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.indisponivel).toBe(true));

    // Assert
    expect(obter).toHaveBeenCalledTimes(1);
  });

  it('deve não consultar o painel quando o usuário é operador', async () => {
    // Arrange
    const obter = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);
    const { QueryWrapper } = createQueryWrapper();
    const operador = {
      user: { nome: 'Olga', perfil: 'OPERADOR' as const },
      isAuthenticated: true,
      login: async () => {},
      logout: () => {},
      renovarCredenciais: () => {},
      versaoDaSessao: 0,
    };
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryWrapper,
        null,
        createElement(AuthContext.Provider, { value: operador }, children),
      );

    // Act
    renderHook(() => usePainelPorPeriodo(30), { wrapper });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Assert
    expect(obter).not.toHaveBeenCalled();
  });
});
