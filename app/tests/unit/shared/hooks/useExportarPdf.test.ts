/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { baixarArquivo, mensagemDeFalhaNaExportacao } from '@/shared/lib/exportacao';

import { useExportarPdf } from '@/shared/hooks/useExportarPdf';

vi.mock('@/shared/lib/exportacao', () => ({
  baixarArquivo: vi.fn(),
  mensagemDeFalhaNaExportacao: vi.fn(),
}));

const pdf = new Blob(['%PDF'], { type: 'application/pdf' });

afterEach(() => {
  vi.clearAllMocks();
});

describe('useExportarPdf', () => {
  it('deve manter exportando verdadeiro durante a busca e falso depois quando a exportação dá certo', async () => {
    // Arrange
    let concluir: (conteudo: Blob) => void = () => {};
    const buscar = () => new Promise<Blob>((resolve) => (concluir = resolve));
    const { result } = renderHook(() =>
      useExportarPdf({ buscar, nomeDoArquivo: () => 'relatorio.pdf' }),
    );

    // Act
    let promessa: Promise<void> = Promise.resolve();
    act(() => {
      promessa = result.current.exportar();
    });
    const durante = result.current.exportando;
    await act(async () => {
      concluir(pdf);
      await promessa;
    });

    // Assert
    expect(durante).toBe(true);
    expect(result.current.exportando).toBe(false);
  });

  it('deve baixar o arquivo com o Blob e o nome informados quando a exportação dá certo', async () => {
    // Arrange
    const { result } = renderHook(() =>
      useExportarPdf({ buscar: () => Promise.resolve(pdf), nomeDoArquivo: () => 'relatorio.pdf' }),
    );

    // Act
    await act(async () => {
      await result.current.exportar();
    });

    // Assert
    expect(baixarArquivo).toHaveBeenCalledTimes(1);
    expect(baixarArquivo).toHaveBeenCalledWith(pdf, 'relatorio.pdf');
    expect(result.current.erro).toBeNull();
  });

  it('deve gravar a mensagem de falha em erro e não baixar nada quando a busca falha', async () => {
    // Arrange
    const falha = new Error('rede');
    vi.mocked(mensagemDeFalhaNaExportacao).mockReturnValue('Não foi possível exportar o PDF. rede');
    const { result } = renderHook(() =>
      useExportarPdf({ buscar: () => Promise.reject(falha), nomeDoArquivo: () => 'relatorio.pdf' }),
    );

    // Act
    await act(async () => {
      await result.current.exportar();
    });

    // Assert
    expect(result.current.erro).toBe('Não foi possível exportar o PDF. rede');
    expect(mensagemDeFalhaNaExportacao).toHaveBeenCalledTimes(1);
    expect(mensagemDeFalhaNaExportacao).toHaveBeenCalledWith(falha);
    expect(baixarArquivo).not.toHaveBeenCalled();
  });

  it('deve limpar o erro quando uma nova tentativa dá certo', async () => {
    // Arrange
    vi.mocked(mensagemDeFalhaNaExportacao).mockReturnValue('falhou');
    const buscar = vi.fn().mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(pdf);
    const { result } = renderHook(() =>
      useExportarPdf({ buscar, nomeDoArquivo: () => 'relatorio.pdf' }),
    );
    await act(async () => {
      await result.current.exportar();
    });
    await waitFor(() => expect(result.current.erro).toBe('falhou'));

    // Act
    await act(async () => {
      await result.current.exportar();
    });

    // Assert
    expect(result.current.erro).toBeNull();
    expect(baixarArquivo).toHaveBeenCalledTimes(1);
  });

  it('deve voltar exportando para falso quando a busca falha', async () => {
    // Arrange
    vi.mocked(mensagemDeFalhaNaExportacao).mockReturnValue('falhou');
    const { result } = renderHook(() =>
      useExportarPdf({
        buscar: () => Promise.reject(new Error('rede')),
        nomeDoArquivo: () => 'relatorio.pdf',
      }),
    );

    // Act
    await act(async () => {
      await result.current.exportar();
    });

    // Assert
    expect(result.current.exportando).toBe(false);
  });
});
