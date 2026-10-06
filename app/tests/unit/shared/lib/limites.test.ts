import { describe, expect, it } from 'vitest';

import { LIMITES, caracteresRestantes, mensagemDeLimite } from '@/shared/lib/limites';

describe('LIMITES', () => {
  it.each([
    ['solicitacaoTitulo', 255],
    ['textoLongo', 2000],
    ['comentarioValidacao', 1000],
    ['modeloCodigo', 100],
    ['modeloDescricao', 255],
    ['modeloMaquina', 255],
    ['modeloPretendidoCodigo', 50],
    ['modeloPretendidoMaquina', 100],
    ['maquinaNome', 255],
    ['usuarioNome', 255],
    ['usuarioEmail', 255],
  ] as const)('deve limitar %s a %i caracteres', (campo, esperado) => {
    // Act
    const limite = LIMITES[campo];

    // Assert
    expect(limite).toBe(esperado);
  });
});

describe('mensagemDeLimite', () => {
  it('deve dizer o limite quando ele é menor que mil', () => {
    // Act
    const mensagem = mensagemDeLimite(255);

    // Assert
    expect(mensagem).toBe('Máximo de 255 caracteres.');
  });

  it('deve separar o milhar com ponto quando o limite passa de mil', () => {
    // Act
    const mensagem = mensagemDeLimite(2000);

    // Assert
    expect(mensagem).toBe('Máximo de 2.000 caracteres.');
  });
});

describe('caracteresRestantes', () => {
  it('deve devolver nulo quando o texto está abaixo de 90% do limite', () => {
    // Act
    const restantes = caracteresRestantes(229, 255);

    // Assert
    expect(restantes).toBeNull();
  });

  it('deve devolver quantos caracteres restam quando o texto chega a 90% do limite', () => {
    // Act
    const restantes = caracteresRestantes(230, 255);

    // Assert
    expect(restantes).toBe(25);
  });

  it('deve devolver nulo quando o campo está vazio', () => {
    // Act
    const restantes = caracteresRestantes(0, 255);

    // Assert
    expect(restantes).toBeNull();
  });

  it('deve devolver zero quando o texto está exatamente no limite', () => {
    // Act
    const restantes = caracteresRestantes(255, 255);

    // Assert
    expect(restantes).toBe(0);
  });

  it('deve devolver zero quando o texto passa do limite', () => {
    // Act
    const restantes = caracteresRestantes(300, 255);

    // Assert
    expect(restantes).toBe(0);
  });
});
