/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { baixarArquivo, mensagemDeFalhaNaExportacao } from './exportacao';

afterEach(() => vi.restoreAllMocks());

describe('baixarArquivo', () => {
  it('deve disparar o download com o nome informado e liberar o endereço temporário quando recebe o conteúdo', () => {
    // Arrange
    const conteudo = new Blob(['%PDF'], { type: 'application/pdf' });
    const endereco = 'blob:relatorio';
    URL.createObjectURL = vi.fn().mockReturnValue(endereco);
    URL.revokeObjectURL = vi.fn();
    const baixados: { href: string; nome: string | null }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      baixados.push({ href: this.href, nome: this.getAttribute('download') });
    });

    // Act
    baixarArquivo(conteudo, 'relatorio.pdf');

    // Assert
    expect(URL.createObjectURL).toHaveBeenCalledWith(conteudo);
    expect(baixados).toEqual([{ href: endereco, nome: 'relatorio.pdf' }]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(endereco);
    expect(document.querySelector('a[download]')).toBeNull();
  });
});

describe('mensagemDeFalhaNaExportacao', () => {
  it('deve incluir o motivo da API quando a falha veio da API', () => {
    // Arrange
    const recusa = new ApiError({ status: 403, message: 'Você não tem permissão para exportar.' });

    // Act
    const mensagem = mensagemDeFalhaNaExportacao(recusa);

    // Assert
    expect(mensagem).toBe(`Não foi possível exportar o PDF. ${recusa.message}`);
  });

  it('deve sugerir nova tentativa quando a falha não veio da API', () => {
    // Act
    const mensagem = mensagemDeFalhaNaExportacao(new TypeError('Failed to fetch'));

    // Assert
    expect(mensagem).toBe('Não foi possível exportar o PDF. Tente novamente.');
  });

  it('deve sugerir nova tentativa quando a API não informa o motivo', () => {
    // Act
    const mensagem = mensagemDeFalhaNaExportacao(new ApiError({ status: 500, message: '' }));

    // Assert
    expect(mensagem).toBe('Não foi possível exportar o PDF. Tente novamente.');
  });
});
