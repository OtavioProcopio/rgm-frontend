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

  it('deve ler a busca quando o parâmetro q tem 2 ou mais caracteres', () => {
    // Arrange
    const params = new URLSearchParams('q=correia');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: { q: 'correia' }, temFiltroDoPainel: false });
  });

  it('deve ignorar a busca quando o parâmetro q tem 1 caractere', () => {
    // Arrange
    const params = new URLSearchParams('q=a');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ler modeloId e responsavelId quando são UUID', () => {
    // Arrange
    const id = '6dacdfac-4812-4b37-9a4c-20ed9516dc0f';
    const params = new URLSearchParams(`modeloId=${id}&responsavelId=${id}`);

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({
      filtros: { modeloId: id, responsavelId: id },
      temFiltroDoPainel: true,
    });
  });

  it('deve ignorar modeloId e responsavelId quando não são UUID', () => {
    // Arrange
    const params = new URLSearchParams('modeloId=abc&responsavelId=1');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });

  it('deve ler o período de criação quando são instantes ISO em UTC', () => {
    // Arrange
    const params = new URLSearchParams(
      'criadaEmInicio=2026-10-08T12:00:00.000Z&criadaEmFim=2026-10-10T12:00:00Z',
    );

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado.filtros).toEqual({
      criadaEmInicio: '2026-10-08T12:00:00.000Z',
      criadaEmFim: '2026-10-10T12:00:00Z',
    });
  });

  it('deve ignorar o período de criação quando não é um instante ISO', () => {
    // Arrange
    const params = new URLSearchParams('criadaEmInicio=ontem&criadaEmFim=2026-10-10');

    // Act
    const resultado = lerFiltrosDaUrl(params);

    // Assert
    expect(resultado).toEqual({ filtros: {}, temFiltroDoPainel: false });
  });
});
