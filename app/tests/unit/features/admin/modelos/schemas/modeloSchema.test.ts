import { describe, expect, it } from 'vitest';

import { criarModeloSchema, editarModeloSchema } from '@/features/admin/modelos/schemas/modeloSchema';
import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

describe('modeloSchema', () => {
  it('requires machine on create', () => {
    const result = criarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(false);
  });

  it('requires machine on edit', () => {
    const result = editarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(false);
  });

  it('succeeds on edit with valid data', () => {
    const result = editarModeloSchema.safeParse({
      codigo: 'M-01',
      descricao: 'Modelo base',
      maquina: 'FBOX',
    });

    expect(result.success).toBe(true);
  });
});

describe('limites de tamanho do modelo', () => {
  const modelo = { codigo: 'M-01', descricao: 'Modelo base', maquina: 'FBOX' };
  const casos = [
    ['codigo', LIMITES.modeloCodigo],
    ['descricao', LIMITES.modeloDescricao],
    ['maquina', LIMITES.modeloMaquina],
    ['observacoes', LIMITES.textoLongo],
  ] as const;

  describe.each([
    ['criação', criarModeloSchema],
    ['edição', editarModeloSchema],
  ] as const)('na %s', (_nome, esquema) => {
    it.each(casos)('deve aceitar %s quando o texto tem exatamente %i caracteres', (campo, limite) => {
      // Arrange
      const dados = { ...modelo, [campo]: 'a'.repeat(limite) };

      // Act
      const resultado = esquema.safeParse(dados);

      // Assert
      expect(resultado.success).toBe(true);
    });

    it.each(casos)('deve recusar %s quando o texto passa de %i caracteres', (campo, limite) => {
      // Arrange
      const dados = { ...modelo, [campo]: 'a'.repeat(limite + 1) };

      // Act
      const resultado = esquema.safeParse(dados);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.issues[0]).toMatchObject({ path: [campo], message: mensagemDeLimite(limite) });
    });
  });
});
