import { describe, expect, it } from 'vitest';

import { nomesDosTipos, TIPOS_DE_EVIDENCIA, TIPOS_DE_IMAGEM, validarArquivo } from './arquivoPermitido';

const MB = 1024 * 1024;

describe('validarArquivo', () => {
  it('deve recusar com o limite na mensagem quando o arquivo tem 11 MB', () => {
    // Arrange
    const grande = { type: 'image/png', size: 11 * MB };

    // Act
    const erro = validarArquivo(grande);

    // Assert
    expect(erro).toBe('Arquivo muito grande. O limite é 10 MB.');
  });

  it('deve aceitar quando o arquivo tem exatamente 10 MB', () => {
    // Arrange
    const noLimite = { type: 'application/pdf', size: 10 * MB };

    // Act
    const erro = validarArquivo(noLimite);

    // Assert
    expect(erro).toBeNull();
  });

  it('deve recusar listando os tipos aceitos quando o arquivo é um executável', () => {
    // Arrange
    const executavel = { type: 'application/x-msdownload', size: MB };

    // Act
    const erro = validarArquivo(executavel);

    // Assert
    expect(erro).toBe('Tipo de arquivo não permitido. Os tipos aceitos são JPEG, PNG, GIF, WebP, PDF e MP4.');
  });

  it('deve aceitar quando o arquivo é um MP4 de 5 MB', () => {
    // Arrange
    const video = { type: 'video/mp4', size: 5 * MB };

    // Act
    const erro = validarArquivo(video);

    // Assert
    expect(erro).toBeNull();
  });

  it.each(TIPOS_DE_EVIDENCIA)('deve aceitar %s quando a tela anexa evidência', (type) => {
    // Act
    const erro = validarArquivo({ type, size: MB });

    // Assert
    expect(erro).toBeNull();
  });

  it('deve aceitar quando o tipo vem em maiúsculas', () => {
    // Act
    const erro = validarArquivo({ type: 'IMAGE/JPEG', size: MB });

    // Assert
    expect(erro).toBeNull();
  });

  it('deve recusar PDF listando só imagens quando a tela só aceita imagem', () => {
    // Arrange
    const pdf = { type: 'application/pdf', size: MB };

    // Act
    const erro = validarArquivo(pdf, TIPOS_DE_IMAGEM);

    // Assert
    expect(erro).toBe('Tipo de arquivo não permitido. Os tipos aceitos são JPEG, PNG e WebP.');
  });

  it('deve recusar pelo tipo quando o arquivo é de tipo não aceito e também grande demais', () => {
    // Arrange
    const invalido = { type: '', size: 20 * MB };

    // Act
    const erro = validarArquivo(invalido);

    // Assert
    expect(erro).toContain('Tipo de arquivo não permitido');
  });
});

describe('nomesDosTipos', () => {
  it('deve devolver só o nome quando há um tipo', () => {
    // Act
    const nomes = nomesDosTipos(['application/pdf']);

    // Assert
    expect(nomes).toBe('PDF');
  });

  it('deve devolver vazio quando não há tipo', () => {
    // Act
    const nomes = nomesDosTipos([]);

    // Assert
    expect(nomes).toBe('');
  });
});
