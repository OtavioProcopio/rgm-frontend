import { describe, expect, it } from 'vitest';

import { alterarSenhaSchema } from '@/features/auth/schemas/perfilSchema';
import { MENSAGEM_DA_SENHA } from '@/shared/lib/senha';

describe('alterarSenhaSchema', () => {
  it('accepts matching new passwords that are at least 8 characters long', () => {
    const result = alterarSenhaSchema.safeParse({
      senhaAtual: 'senhaAtual123',
      novaSenha: 'novasenha123',
      confirmarNovaSenha: 'novasenha123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short new passwords', () => {
    const result = alterarSenhaSchema.safeParse({
      senhaAtual: 'senhaAtual123',
      novaSenha: '12345',
      confirmarNovaSenha: '12345',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().novaSenha?._errors[0]).toBe(
        MENSAGEM_DA_SENHA
      );
    }
  });

  it('rejects mismatching new passwords', () => {
    const result = alterarSenhaSchema.safeParse({
      senhaAtual: 'senhaAtual123',
      novaSenha: 'novasenha123',
      confirmarNovaSenha: 'novasenha321',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().confirmarNovaSenha?._errors[0]).toBe(
        'As senhas não coincidem'
      );
    }
  });

  it('rejects empty current password', () => {
    const result = alterarSenhaSchema.safeParse({
      senhaAtual: '',
      novaSenha: 'novasenha123',
      confirmarNovaSenha: 'novasenha123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().senhaAtual?._errors[0]).toBe(
        'Senha atual é obrigatória'
      );
    }
  });
});

describe('regra única de senha na troca da própria senha', () => {
  it('deve recusar a nova senha quando ela tem 7 caracteres', () => {
    // Arrange
    const novaSenha = 'a'.repeat(7);
    const dados = { senhaAtual: 'senhaAtual123', novaSenha, confirmarNovaSenha: novaSenha };

    // Act
    const resultado = alterarSenhaSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: ['novaSenha'], message: MENSAGEM_DA_SENHA });
  });

  it('deve aceitar a nova senha quando ela tem 8 caracteres', () => {
    // Arrange
    const novaSenha = 'a'.repeat(8);
    const dados = { senhaAtual: 'senhaAtual123', novaSenha, confirmarNovaSenha: novaSenha };

    // Act
    const resultado = alterarSenhaSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });
});
