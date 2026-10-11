import { describe, expect, it } from 'vitest';

import { tipoModeloSchema } from '@/features/admin/tiposModelo/schemas/tipoModeloSchema';
import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

describe('tipoModeloSchema', () => {
  it('requires nome', () => {
    const result = tipoModeloSchema.safeParse({ nome: '' });
    expect(result.success).toBe(false);
  });

  it('succeeds with a valid nome', () => {
    const result = tipoModeloSchema.safeParse({ nome: 'FBOX' });
    expect(result.success).toBe(true);
  });
});

describe('limite de tamanho do nome do tipo de modelo', () => {
  it('deve aceitar o nome quando ele tem exatamente o limite de caracteres', () => {
    // Arrange
    const dados = { nome: 'a'.repeat(LIMITES.tipoModeloNome) };

    // Act
    const resultado = tipoModeloSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });

  it('deve recusar o nome quando ele passa do limite de caracteres', () => {
    // Arrange
    const dados = { nome: 'a'.repeat(LIMITES.tipoModeloNome + 1) };

    // Act
    const resultado = tipoModeloSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toBe(mensagemDeLimite(LIMITES.tipoModeloNome));
  });
});
