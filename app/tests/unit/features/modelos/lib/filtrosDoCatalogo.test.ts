import { describe, expect, it } from 'vitest';

import {
  FILTROS_PADRAO,
  buscaCurtaDemais,
  buscaValida,
  escreverFiltros,
  lerFiltros,
  paraConsulta,
  temFiltro,
} from '@/features/modelos/lib/filtrosDoCatalogo';

describe('lerFiltros', () => {
  it('deve devolver o padrão quando o endereço não tem filtro', () => {
    expect(lerFiltros(new URLSearchParams(''))).toEqual(FILTROS_PADRAO);
  });

  it('deve ler tipo, máquina, busca, inativos e modelo quando o endereço os traz', () => {
    // Arrange
    const params = new URLSearchParams('tipo=RESINA&maquina=FBOX&q=carcaca&inativos=1&modelo=m1');

    // Act
    const filtros = lerFiltros(params);

    // Assert
    expect(filtros).toEqual({
      tipo: 'RESINA',
      maquina: 'FBOX',
      q: 'carcaca',
      inativos: true,
      modelo: 'm1',
    });
  });

  it('deve aparar tipo, máquina e modelo e tratar inativos que não seja 1 como desligado', () => {
    const filtros = lerFiltros(new URLSearchParams('tipo=%20RESINA%20&inativos=true&modelo=%20m1'));

    expect(filtros.tipo).toBe('RESINA');
    expect(filtros.modelo).toBe('m1');
    expect(filtros.inativos).toBe(false);
  });
});

describe('escreverFiltros', () => {
  it('deve escrever só o que difere do padrão', () => {
    expect(escreverFiltros(FILTROS_PADRAO).toString()).toBe('');
    expect(escreverFiltros({ ...FILTROS_PADRAO, tipo: 'RESINA', modelo: 'm1' }).toString()).toBe(
      'tipo=RESINA&modelo=m1',
    );
  });

  it('deve voltar ao mesmo filtro quando é escrito e lido de novo', () => {
    // Arrange
    const filtros = {
      tipo: 'Madeira e 3D',
      maquina: 'LINHA 2',
      q: 'câmbio & cia',
      inativos: true,
      modelo: 'abc',
    };

    // Act
    const volta = lerFiltros(escreverFiltros(filtros));

    // Assert
    expect(volta).toEqual(filtros);
  });
});

describe('busca', () => {
  it.each([
    ['', ''],
    ['a', ''],
    [' a ', ''],
    ['ab', 'ab'],
    ['  carcaça ', 'carcaça'],
  ])('deve só valer a partir de 2 caracteres aparados: %j', (digitado, esperado) => {
    expect(buscaValida(digitado)).toBe(esperado);
  });

  it('deve avisar só quando há 1 caractere e não quando está vazia ou é válida', () => {
    expect(buscaCurtaDemais('a')).toBe(true);
    expect(buscaCurtaDemais(' a ')).toBe(true);
    expect(buscaCurtaDemais('')).toBe(false);
    expect(buscaCurtaDemais('   ')).toBe(false);
    expect(buscaCurtaDemais('ab')).toBe(false);
  });
});

describe('paraConsulta', () => {
  it('deve pedir só os ativos quando nada foi escolhido', () => {
    expect(paraConsulta(FILTROS_PADRAO)).toEqual({ ativo: true });
  });

  it('deve pedir máquina exata, tipo e busca quando escolhidos, e incluir os inativos se pedido', () => {
    // Arrange
    const filtros = {
      ...FILTROS_PADRAO,
      tipo: 'RESINA',
      maquina: 'FBOX',
      q: ' mancal ',
      inativos: true,
    };

    // Act
    const consulta = paraConsulta(filtros);

    // Assert
    expect(consulta).toEqual({
      tipo: 'RESINA',
      maquina: 'FBOX',
      maquinaExata: true,
      q: 'mancal',
    });
    expect('ativo' in consulta).toBe(false);
  });

  it('não deve mandar busca de 1 caractere', () => {
    expect(paraConsulta({ ...FILTROS_PADRAO, q: 'a' })).toEqual({ ativo: true });
  });
});

describe('temFiltro', () => {
  it('deve ser falso no padrão e quando só o modelo em destaque está no endereço', () => {
    expect(temFiltro(FILTROS_PADRAO)).toBe(false);
    expect(temFiltro({ ...FILTROS_PADRAO, modelo: 'm1' })).toBe(false);
  });

  it('deve ser verdadeiro com tipo, máquina, busca válida ou inativos', () => {
    expect(temFiltro({ ...FILTROS_PADRAO, tipo: 'RESINA' })).toBe(true);
    expect(temFiltro({ ...FILTROS_PADRAO, maquina: 'FBOX' })).toBe(true);
    expect(temFiltro({ ...FILTROS_PADRAO, q: 'ab' })).toBe(true);
    expect(temFiltro({ ...FILTROS_PADRAO, inativos: true })).toBe(true);
  });

  it('não deve contar a busca de 1 caractere, que não filtra', () => {
    expect(temFiltro({ ...FILTROS_PADRAO, q: 'a' })).toBe(false);
  });
});
