/**
 * @vitest-environment jsdom
 */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarModelo } from '@tests/support/modeloFixture';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { useAberturaDoCatalogo } from '@/features/modelos/hooks/useAberturaDoCatalogo';
import { FILTROS_PADRAO, type FiltrosDoCatalogo } from '@/features/modelos/lib/filtrosDoCatalogo';
import { ApiError } from '@/shared/api/apiError';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function montar(inicial: Partial<FiltrosDoCatalogo>) {
  const substituirFiltros = vi.fn();
  const definirModelo = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  const hook = renderHook(
    ({ filtros }) => useAberturaDoCatalogo({ filtros, substituirFiltros, definirModelo }),
    { wrapper: QueryWrapper, initialProps: { filtros: { ...FILTROS_PADRAO, ...inicial } } },
  );
  return { ...hook, substituirFiltros, definirModelo };
}

describe('useAberturaDoCatalogo', () => {
  it('deve estar pronta na hora, no bloco 0 e sem consulta, quando o endereço não traz modelo', () => {
    // Arrange
    const posicao = vi.spyOn(modelosApi, 'posicao');

    // Act
    const { result } = montar({});

    // Assert
    expect(result.current).toEqual({ pronta: true, aviso: null, paginaInicial: 0 });
    expect(posicao).not.toHaveBeenCalled();
  });

  it('deve esperar a posição e abrir no bloco que contém o modelo do link', async () => {
    // Arrange: o 135º de 300, 20 por bloco → bloco 6
    vi.spyOn(modelosApi, 'posicao').mockResolvedValue({ posicao: 135, total: 300 });

    // Act
    const { result } = montar({ modelo: 'm135', tipo: 'RESINA' });

    // Assert
    expect(result.current.pronta).toBe(false);
    await waitFor(() => expect(result.current.pronta).toBe(true));
    expect(result.current.paginaInicial).toBe(6);
    expect(result.current.aviso).toBeNull();
  });

  it('deve contar a posição 20 no bloco 0 e a 21 no bloco 1', async () => {
    const posicao = vi.spyOn(modelosApi, 'posicao');
    posicao.mockResolvedValueOnce({ posicao: 20, total: 50 });
    const a = montar({ modelo: 'a' });
    await waitFor(() => expect(a.result.current.pronta).toBe(true));
    expect(a.result.current.paginaInicial).toBe(0);

    posicao.mockResolvedValueOnce({ posicao: 21, total: 50 });
    const b = montar({ modelo: 'b' });
    await waitFor(() => expect(b.result.current.pronta).toBe(true));
    expect(b.result.current.paginaInicial).toBe(1);
  });

  it('deve voltar os filtros a "todos", avisar e abrir no bloco certo quando o modelo está fora do filtro', async () => {
    // Arrange
    const posicao = vi.spyOn(modelosApi, 'posicao');
    posicao.mockResolvedValueOnce({ posicao: null, total: 5 });
    posicao.mockResolvedValueOnce({ posicao: 45, total: 300 });
    vi.spyOn(modelosApi, 'buscarPorId').mockResolvedValue(criarModelo({ id: 'm1', ativo: true }));
    const { result, rerender, substituirFiltros } = montar({
      modelo: 'm1',
      maquina: 'FBOX',
      tipo: 'RESINA',
    });

    // Act
    await waitFor(() =>
      expect(substituirFiltros).toHaveBeenCalledWith({
        tipo: '',
        maquina: '',
        q: '',
        inativos: false,
      }),
    );
    expect(result.current.pronta).toBe(false);
    rerender({ filtros: { ...FILTROS_PADRAO, modelo: 'm1' } });

    // Assert
    await waitFor(() => expect(result.current.pronta).toBe(true));
    expect(result.current.aviso).toBe('foraDoFiltro');
    expect(result.current.paginaInicial).toBe(2);
    expect(posicao).toHaveBeenLastCalledWith('m1', { ativo: true });
  });

  it('deve ligar "Mostrar inativos" quando o modelo do link está inativo', async () => {
    // Arrange
    vi.spyOn(modelosApi, 'posicao')
      .mockResolvedValueOnce({ posicao: null, total: 5 })
      .mockResolvedValueOnce({ posicao: 3, total: 8 });
    vi.spyOn(modelosApi, 'buscarPorId').mockResolvedValue(criarModelo({ id: 'm1', ativo: false }));
    const { substituirFiltros } = montar({ modelo: 'm1' });

    // Act + Assert
    await waitFor(() =>
      expect(substituirFiltros).toHaveBeenCalledWith({
        tipo: '',
        maquina: '',
        q: '',
        inativos: true,
      }),
    );
  });

  it('deve avisar, tirar o modelo do endereço e abrir no bloco 0 quando o modelo não existe', async () => {
    // Arrange
    vi.spyOn(modelosApi, 'posicao').mockRejectedValue(
      new ApiError({ status: 404, message: 'Modelo nao encontrado' }),
    );
    const { result, definirModelo } = montar({ modelo: 'fantasma' });

    // Act
    await waitFor(() => expect(definirModelo).toHaveBeenCalledWith(''));

    // Assert
    expect(result.current.aviso).toBe('naoEncontrado');
    expect(result.current.paginaInicial).toBe(0);
  });

  it('deve ficar pronta no bloco 0, sem aviso, quando a posição falha por outro motivo', async () => {
    // Arrange
    vi.spyOn(modelosApi, 'posicao').mockRejectedValue(new Error('rede'));

    // Act
    const { result, definirModelo } = montar({ modelo: 'm1' });

    // Assert
    await waitFor(() => expect(result.current.pronta).toBe(true));
    expect(result.current.aviso).toBeNull();
    expect(definirModelo).not.toHaveBeenCalled();
  });

  it('não deve desfazer o filtro que a pessoa escolheu depois da abertura', async () => {
    // Arrange
    vi.spyOn(modelosApi, 'posicao')
      .mockResolvedValueOnce({ posicao: null, total: 5 })
      .mockResolvedValueOnce({ posicao: 3, total: 8 });
    vi.spyOn(modelosApi, 'buscarPorId').mockResolvedValue(criarModelo({ id: 'm1' }));
    const { result, rerender, substituirFiltros } = montar({ modelo: 'm1', tipo: 'RESINA' });
    await waitFor(() => expect(substituirFiltros).toHaveBeenCalledTimes(1));
    rerender({ filtros: { ...FILTROS_PADRAO, modelo: 'm1' } });
    await waitFor(() => expect(result.current.pronta).toBe(true));

    // Act: a pessoa escolhe outro tipo (o modelo sai do endereço)
    rerender({ filtros: { ...FILTROS_PADRAO, tipo: 'COQUILHA_ACO' } });

    // Assert
    expect(substituirFiltros).toHaveBeenCalledTimes(1);
    expect(result.current.paginaInicial).toBe(0);
    expect(result.current.pronta).toBe(true);
  });
});
