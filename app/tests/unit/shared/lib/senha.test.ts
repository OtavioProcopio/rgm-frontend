import { describe, expect, it } from 'vitest';

import { MENSAGEM_DA_SENHA, TAMANHO_MINIMO_DA_SENHA, erroDaSenha } from '@/shared/lib/senha';

describe('erroDaSenha', () => {
  it('deve recusar a senha quando ela tem 7 caracteres', () => {
    // Arrange
    const senha = 'a'.repeat(7);

    // Act
    const erro = erroDaSenha(senha);

    // Assert
    expect(erro).toBe(MENSAGEM_DA_SENHA);
  });

  it('deve aceitar a senha quando ela tem 8 caracteres', () => {
    // Arrange
    const senha = 'a'.repeat(8);

    // Act
    const erro = erroDaSenha(senha);

    // Assert
    expect(erro).toBeNull();
  });

  it('deve recusar a senha quando ela está vazia', () => {
    // Act
    const erro = erroDaSenha('');

    // Assert
    expect(erro).toBe(MENSAGEM_DA_SENHA);
  });

  it('deve dizer o mínimo de 8 caracteres na mensagem única', () => {
    // Act
    const mensagem = MENSAGEM_DA_SENHA;

    // Assert
    expect(TAMANHO_MINIMO_DA_SENHA).toBe(8);
    expect(mensagem).toBe('A senha deve ter no mínimo 8 caracteres.');
  });
});
