import { describe, expect, it } from 'vitest';

import { maquinaSchema } from '@/features/admin/maquinas/schemas/maquinaSchema';
import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

describe('maquinaSchema', () => {
  it('requires nome', () => {
    const result = maquinaSchema.safeParse({ nome: '' });
    expect(result.success).toBe(false);
  });

  it('succeeds with a valid nome', () => {
    const result = maquinaSchema.safeParse({ nome: 'FBOX' });
    expect(result.success).toBe(true);
  });
});

describe('limite de tamanho do nome da máquina', () => {
  it('deve aceitar o nome quando ele tem exatamente o limite de caracteres', () => {
    // Arrange
    const dados = { nome: 'a'.repeat(LIMITES.maquinaNome) };

    // Act
    const resultado = maquinaSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });

  it('deve recusar o nome quando ele passa do limite de caracteres', () => {
    // Arrange
    const dados = { nome: 'a'.repeat(LIMITES.maquinaNome + 1) };

    // Act
    const resultado = maquinaSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toBe(mensagemDeLimite(LIMITES.maquinaNome));
  });
});
