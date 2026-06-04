import { describe, expect, it } from 'vitest';

import { criarUsuarioSchema, editarUsuarioSchema } from './usuarioSchema';

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
