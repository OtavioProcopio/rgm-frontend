/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDistribuicaoDoTrabalho } from '@/features/solicitacoes/hooks/useDistribuicaoDoTrabalho';
import type { MetricasResponse } from '@/features/solicitacoes/types/solicitacaoTypes';

const METRICAS: MetricasResponse = {
  totalUsuarios: 3,
  totalModelos: 2,
  totalSolicitacoes: 50,
  solicitacoesPorStatus: {
    A_FAZER: 5,
    EM_ANDAMENTO: 3,
    EM_VALIDACAO: 2,
    CONCLUIDA: 30,
    CANCELADA: 10,
  },
  solicitacoesAbertas: 10,
  solicitacoesPendentes: 5,
  solicitacoesConcluidas: 30,
  tempoMedioResolucaoSegundos: 100,
  emAbertoPorTipo: { REPARO: 4, INSPECAO: 3, REENGENHARIA: 2, CRIACAO: 1 },
  emAbertoPorPrioridade: { URGENTE: 4, ALTA: 3, MEDIA: 1, BAIXA: 1, SEM_PRIORIDADE: 1 },
};

function quantidades(visao: 'status' | 'tipo' | 'prioridade', metricas?: MetricasResponse) {
  const { result } = renderHook(() => useDistribuicaoDoTrabalho(visao, metricas));
  return result.current.partes?.map((parte) => parte.quantidade);
}

describe('useDistribuicaoDoTrabalho', () => {
  it('deve contar por status quando a visão é status', () => {
    // Arrange
    const esperado = [5, 3, 2];

    // Act
    const resultado = quantidades('status', METRICAS);

    // Assert
    expect(resultado).toEqual(esperado);
  });

  it('deve contar por tipo a partir das métricas quando a visão é tipo', () => {
    // Arrange
    const esperado = [4, 3, 2, 1];

    // Act
    const resultado = quantidades('tipo', METRICAS);

    // Assert
    expect(resultado).toEqual(esperado);
  });

  it('deve contar por prioridade, com sem prioridade, quando a visão é prioridade', () => {
    // Arrange
    const esperado = [4, 3, 1, 1, 1];

    // Act
    const resultado = quantidades('prioridade', METRICAS);

    // Assert
    expect(resultado).toEqual(esperado);
  });

  it('deve devolver indefinido quando as métricas ainda não chegaram', () => {
    // Arrange
    const metricas = undefined;

    // Act
    const resultado = quantidades('tipo', metricas);

    // Assert
    expect(resultado).toBeUndefined();
  });
});
