/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { baixarArquivo } from '@/shared/lib/exportacao';

import { ExportarPdfButton } from './ExportarPdfButton';

vi.mock('@/shared/lib/exportacao', async (original) => ({
  ...(await original<typeof import('@/shared/lib/exportacao')>()),
  baixarArquivo: vi.fn(),
}));

const pdf = new Blob(['%PDF'], { type: 'application/pdf' });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ExportarPdfButton', () => {
  it('deve baixar o PDF com o nome informado quando a exportação dá certo', async () => {
    // Arrange
    render(<ExportarPdfButton buscar={() => Promise.resolve(pdf)} nomeDoArquivo={() => 'relatorio.pdf'} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));

    // Assert
    expect(baixarArquivo).toHaveBeenCalledWith(pdf, 'relatorio.pdf');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('deve mostrar o erro junto do botão quando a API responde com erro', async () => {
    // Arrange
    const recusa = new ApiError({ status: 500, message: 'Falha ao gerar o relatório.' });
    render(<ExportarPdfButton buscar={() => Promise.reject(recusa)} nomeDoArquivo={() => 'relatorio.pdf'} />);
    const botao = screen.getByRole('button', { name: 'Exportar PDF' });

    // Act
    await userEvent.click(botao);

    // Assert
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toBe(`Não foi possível exportar o PDF. ${recusa.message}`);
    expect(alerta.parentElement).toBe(botao.parentElement);
    expect(baixarArquivo).not.toHaveBeenCalled();
  });

  it('deve limpar o erro quando uma nova exportação dá certo', async () => {
    // Arrange
    const buscar = vi.fn().mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(pdf);
    render(<ExportarPdfButton buscar={buscar} nomeDoArquivo={() => 'relatorio.pdf'} />);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));
    await screen.findByRole('alert');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));

    // Assert
    expect(screen.queryByRole('alert')).toBeNull();
    expect(baixarArquivo).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear o botão e avisar que está exportando quando a exportação está em andamento', async () => {
    // Arrange
    let concluir: (conteudo: Blob) => void = () => {};
    const buscar = () => new Promise<Blob>((resolve) => (concluir = resolve));
    render(<ExportarPdfButton buscar={buscar} nomeDoArquivo={() => 'relatorio.pdf'} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));

    // Assert
    expect((screen.getByRole('button', { name: 'Exportando...' }) as HTMLButtonElement).disabled).toBe(true);
    concluir(pdf);
    expect(await screen.findByRole('button', { name: 'Exportar PDF' })).toBeDefined();
  });
});
