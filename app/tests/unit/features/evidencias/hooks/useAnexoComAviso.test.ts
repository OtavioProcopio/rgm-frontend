/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { evidenciasKeys } from '@/features/evidencias/hooks/evidenciasKeys';
import { useAnexoComAviso } from '@/features/evidencias/hooks/useAnexoComAviso';

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({ evidenciasApi: { anexar: vi.fn() } }));

const foto = new File(['x'], 'foto.png', { type: 'image/png' });
const opcoes = { tipo: 'INSTRUCAO_SERVICO', descricao: 'usar gabarito' } as const;
const aceito = {} as Awaited<ReturnType<typeof evidenciasApi.anexar>>;

function montar() {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(() => useAnexoComAviso(), { wrapper: QueryWrapper });
  return { result, queryClient };
}

afterEach(() => vi.clearAllMocks());

describe('useAnexoComAviso', () => {
  it('deve enviar o arquivo e não deixar aviso quando o primeiro envio é aceito', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockResolvedValue(aceito);
    const { result, queryClient } = montar();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');

    // Act
    let enviado = false;
    await act(async () => {
      enviado = await result.current.anexar('s1', foto, opcoes);
    });

    // Assert
    expect(enviado).toBe(true);
    expect(evidenciasApi.anexar).toHaveBeenCalledWith('s1', foto, opcoes);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: evidenciasKeys.bySolicitacao('s1') });
    expect(result.current.estado).toBeNull();
    expect(result.current.enviando).toBe(false);
  });

  it('deve ficar no estado de falha quando o envio é recusado', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('rede'));
    const { result } = montar();

    // Act
    let enviado = true;
    await act(async () => {
      enviado = await result.current.anexar('s1', foto, opcoes);
    });

    // Assert
    expect(enviado).toBe(false);
    expect(result.current.estado).toBe('falhou');
  });

  it('deve reenviar o mesmo arquivo e passar a enviado quando a nova tentativa dá certo', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(aceito);
    const { result } = montar();
    await act(async () => {
      await result.current.anexar('s1', foto, opcoes);
    });

    // Act
    await act(async () => {
      await result.current.tentarNovamente();
    });

    // Assert
    expect(evidenciasApi.anexar).toHaveBeenCalledTimes(2);
    expect(evidenciasApi.anexar).toHaveBeenLastCalledWith('s1', foto, opcoes);
    expect(result.current.estado).toBe('enviado');
  });

  it('deve continuar em falha quando a nova tentativa também falha', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('rede'));
    const { result } = montar();
    await act(async () => {
      await result.current.anexar('s1', foto);
    });

    // Act
    await act(async () => {
      await result.current.tentarNovamente();
    });

    // Assert
    expect(result.current.estado).toBe('falhou');
  });

  it('deve não enviar nada quando se tenta de novo sem envio anterior', async () => {
    // Arrange
    const { result } = montar();

    // Act
    let enviado = true;
    await act(async () => {
      enviado = await result.current.tentarNovamente();
    });

    // Assert
    expect(enviado).toBe(false);
    expect(evidenciasApi.anexar).not.toHaveBeenCalled();
  });
});
