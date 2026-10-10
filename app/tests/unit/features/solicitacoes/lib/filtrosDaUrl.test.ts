import { describe, expect, it } from 'vitest';

import { lerFiltrosDaUrl } from '@/features/solicitacoes/lib/filtrosDaUrl';

describe('lerFiltrosDaUrl', () => {
  it('deve devolver filtros vazios quando não há parâmetro', () => {
    // Arrange
    const params = new URLSearchParams('');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ler o status quando é válido', () => {
    // Arrange
    const params = new URLSearchParams('status=EM_VALIDACAO');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { status: 'EM_VALIDACAO' },
      temFiltroDoPainel: true,
    });
  });

  it('deve ler o tipo quando é válido', () => {
    // Arrange
    const params = new URLSearchParams('tipo=REENGENHARIA');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { tipo: 'REENGENHARIA' },
      temFiltroDoPainel: true,
    });
  });

  it('deve ler a prioridade quando é válida', () => {
    // Arrange
    const params = new URLSearchParams('prioridade=URGENTE');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { prioridade: 'URGENTE' },
      temFiltroDoPainel: true,
    });
  });

  it('deve ler atrasada quando o texto é true', () => {
    // Arrange
    const params = new URLSearchParams('atrasada=true');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { atrasada: true },
      temFiltroDoPainel: true,
    });
  });

  it('deve ler emAberto quando o texto é true', () => {
    // Arrange
    const params = new URLSearchParams('emAberto=true');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { emAberto: true },
      temFiltroDoPainel: true,
    });
  });

  it('deve ignorar o status quando está fora da lista', () => {
    // Arrange
    const params = new URLSearchParams('status=INVALIDO');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar o tipo quando está fora da lista', () => {
    // Arrange
    const params = new URLSearchParams('tipo=reparo');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar a prioridade quando está fora da lista', () => {
    // Arrange
    const params = new URLSearchParams('prioridade=CRITICA');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar atrasada quando o texto é false', () => {
    // Arrange
    const params = new URLSearchParams('atrasada=false');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar atrasada quando o texto é 1', () => {
    // Arrange
    const params = new URLSearchParams('atrasada=1');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar emAberto quando o texto é TRUE em maiúsculas', () => {
    // Arrange
    const params = new URLSearchParams('emAberto=TRUE');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ignorar o parâmetro quando é desconhecido', () => {
    // Arrange
    const params = new URLSearchParams('foo=bar&page=2');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ler a máquina sem contar como filtro do painel quando só ela vem', () => {
    // Arrange
    const params = new URLSearchParams('maquina=Prensa 3');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { maquina: 'Prensa 3' },
      temFiltroDoPainel: false,
    });
  });

  it('deve ignorar a máquina quando está vazia', () => {
    // Arrange
    const params = new URLSearchParams('maquina=');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve combinar atrasada e emAberto quando ambos são true', () => {
    // Arrange
    const params = new URLSearchParams('atrasada=true&emAberto=true');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { atrasada: true, emAberto: true },
      temFiltroDoPainel: true,
    });
  });

  it('deve combinar tipo e emAberto quando ambos são válidos', () => {
    // Arrange
    const params = new URLSearchParams('tipo=REPARO&emAberto=true');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { tipo: 'REPARO', emAberto: true },
      temFiltroDoPainel: true,
    });
  });
});
