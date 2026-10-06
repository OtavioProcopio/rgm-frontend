import { describe, expect, it } from 'vitest';

import { criarUsuarioSchema, editarUsuarioSchema } from '@/features/admin/usuarios/schemas/usuarioSchema';
import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';
import { MENSAGEM_DA_SENHA } from '@/shared/lib/senha';

describe('usuarioSchema', () => {
  it('requires email and password for internal users', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'Operador RGM',
      perfil: 'OPERADOR',
      ativo: true,
    });

    expect(result.success).toBe(false);
  });

  it('allows external users without email and password', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'Prestador Externo',
      perfil: 'EXTERNO',
      ativo: true,
    });

    expect(result.success).toBe(true);
  });

  it('fails when internal user has email but senha is too short', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'Operador RGM',
      email: 'op@rgm.com',
      senha: '123',
      perfil: 'OPERADOR',
      ativo: true,
    });

    expect(result.success).toBe(false);
  });

  it('accepts internal user with valid email and senha', () => {
    const result = criarUsuarioSchema.safeParse({
      nome: 'Operador RGM',
      email: 'op@rgm.com',
      senha: 'senha123',
      perfil: 'OPERADOR',
      ativo: true,
    });

    expect(result.success).toBe(true);
  });

  it('does not accept password in edit payload', () => {
    const result = editarUsuarioSchema.safeParse({
      nome: 'Gestor RGM',
      email: 'gestor@rgm.com',
      senha: 'senha123',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      nome: 'Gestor RGM',
      email: 'gestor@rgm.com',
    });
  });
});

describe('limites de tamanho e regra de senha do usuário', () => {
  const interno = {
    nome: 'Operador RGM',
    email: 'op@rgm.com',
    senha: 'senha123',
    perfil: 'OPERADOR' as const,
    ativo: true,
  };
  const DOMINIO = '@rgm.com';

  it('deve recusar a criação quando a senha tem 7 caracteres', () => {
    // Arrange
    const dados = { ...interno, senha: 'a'.repeat(7) };

    // Act
    const resultado = criarUsuarioSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: ['senha'], message: MENSAGEM_DA_SENHA });
  });

  it('deve aceitar a criação quando a senha tem 8 caracteres', () => {
    // Arrange
    const dados = { ...interno, senha: 'a'.repeat(8) };

    // Act
    const resultado = criarUsuarioSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });

  it('deve recusar a criação de usuário interno quando a senha não é informada', () => {
    // Arrange
    const dados = { ...interno, senha: undefined };

    // Act
    const resultado = criarUsuarioSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: ['senha'], message: MENSAGEM_DA_SENHA });
  });

  describe.each([
    ['criação', criarUsuarioSchema],
    ['edição', editarUsuarioSchema],
  ] as const)('na %s', (_nome, esquema) => {
    it('deve aceitar nome e e-mail quando estão exatamente no limite', () => {
      // Arrange
      const dados = {
        ...interno,
        nome: 'a'.repeat(LIMITES.usuarioNome),
        email: 'a'.repeat(LIMITES.usuarioEmail - DOMINIO.length) + DOMINIO,
      };

      // Act
      const resultado = esquema.safeParse(dados);

      // Assert
      expect(resultado.success).toBe(true);
    });

    it('deve recusar o nome quando ele passa do limite', () => {
      // Arrange
      const dados = { ...interno, nome: 'a'.repeat(LIMITES.usuarioNome + 1) };

      // Act
      const resultado = esquema.safeParse(dados);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.issues[0]).toMatchObject({
        path: ['nome'],
        message: mensagemDeLimite(LIMITES.usuarioNome),
      });
    });

    it('deve recusar o e-mail quando ele passa do limite', () => {
      // Arrange
      const dados = { ...interno, email: 'a'.repeat(LIMITES.usuarioEmail - DOMINIO.length + 1) + DOMINIO };

      // Act
      const resultado = esquema.safeParse(dados);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.issues.map((issue) => issue.message)).toContain(
        mensagemDeLimite(LIMITES.usuarioEmail),
      );
    });
  });
});
