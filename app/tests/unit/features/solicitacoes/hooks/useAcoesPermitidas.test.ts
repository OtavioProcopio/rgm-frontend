/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { useAcoesPermitidas } from '@/features/solicitacoes/hooks/useAcoesPermitidas';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: { id: 'op', nome: 'Op', perfil: 'OPERADOR' } }),
}));

const emAndamento = {
  id: 's1', status: 'EM_ANDAMENTO', abertaPorUsuarioId: 'outro', responsavelIds: ['op'],
} as Solicitacao;

describe('useAcoesPermitidas', () => {
  it('deve calcular as ações com o id e o perfil do usuário autenticado quando ele é operador responsável', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    const { result } = renderHook(() => useAcoesPermitidas(), { wrapper: AppWrapper });
    const acoes = result.current(emAndamento);

    // Assert
    expect([...acoes]).toEqual(['ENVIAR_VALIDACAO']);
  });

  it('deve não permitir nada quando não há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: null });

    // Act
    const { result } = renderHook(() => useAcoesPermitidas(), { wrapper: AppWrapper });
    const acoes = result.current(emAndamento);

    // Assert
    expect(acoes.size).toBe(0);
  });
});
