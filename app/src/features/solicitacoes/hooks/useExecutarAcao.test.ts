/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { solicitacoesKeys } from './solicitacoesKeys';
import { useExecutarAcao } from './useExecutarAcao';

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: { anexar: vi.fn() },
}));

const foto = new File(['x'], 'foto.png', { type: 'image/png' });

function montar() {
  const onConcluida = vi.fn();
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(() => useExecutarAcao('s1', onConcluida), { wrapper: QueryWrapper });
  return { result, onConcluida, queryClient };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useExecutarAcao', () => {
  it('deve avisar a conclusão sem anexar nada quando a ação dá certo e não há foto', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const acao = vi.fn().mockResolvedValue(undefined);

    // Act
    await act(() => result.current.executar(acao, { file: null, tipo: 'DEVOLUCAO' }));

    // Assert
    expect(acao).toHaveBeenCalledTimes(1);
    expect(evidenciasApi.anexar).not.toHaveBeenCalled();
    expect(onConcluida).toHaveBeenCalledTimes(1);
    expect(result.current.erro).toBeNull();
  });

  it('deve guardar a mensagem da API e não avisar a conclusão quando a ação é recusada', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    const recusa = new ApiError({ status: 409, message: 'Solicitação já foi triada.' });

    // Act
    await act(() => result.current.executar(() => Promise.reject(recusa), { file: foto }));

    // Assert
    expect(result.current.erro).toBe(recusa.message);
    expect(onConcluida).not.toHaveBeenCalled();
    expect(evidenciasApi.anexar).not.toHaveBeenCalled();
  });

  it('deve limpar o erro anterior quando a ação é tentada de novo e dá certo', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    await act(() => result.current.executar(() => Promise.reject(new Error('rede'))));

    // Act
    await act(() => result.current.executar(() => Promise.resolve()));

    // Assert
    expect(result.current.erro).toBeNull();
    expect(onConcluida).toHaveBeenCalledTimes(1);
  });

  it('deve anexar a foto e atualizar o histórico quando a ação dá certo e há foto', async () => {
    // Arrange
    const { result, onConcluida, queryClient } = montar();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(evidenciasApi.anexar).mockResolvedValue({} as Awaited<ReturnType<typeof evidenciasApi.anexar>>);

    // Act
    await act(() =>
      result.current.executar(() => Promise.resolve(), { file: foto, tipo: 'CONCLUSAO', descricao: 'ok' }),
    );

    // Assert
    expect(evidenciasApi.anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'CONCLUSAO', descricao: 'ok' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.atividades('s1') });
    expect(onConcluida).toHaveBeenCalledTimes(1);
  });

  it('deve avisar a conclusão mesmo assim quando o anexo da foto falha', async () => {
    // Arrange
    const { result, onConcluida } = montar();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('arquivo grande'));

    // Act
    await act(() => result.current.executar(() => Promise.resolve(), { file: foto, tipo: 'DEVOLUCAO' }));

    // Assert
    expect(onConcluida).toHaveBeenCalledTimes(1);
    expect(result.current.erro).toBeNull();
  });
});
