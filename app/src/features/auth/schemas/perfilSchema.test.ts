import { describe, expect, it } from 'vitest';

import { alterarSenhaSchema } from './perfilSchema';

describe('alterarSenhaSchema', () => {
  it('accepts matching new passwords that are at least 6 characters long', () => {
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
        'A nova senha deve ter no mínimo 6 caracteres'
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
