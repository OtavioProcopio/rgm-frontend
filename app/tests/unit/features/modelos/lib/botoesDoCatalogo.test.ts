import { describe, expect, it } from 'vitest';

import {
  botoesDoCatalogo,
  totaisPorMaquina,
  totaisPorTipo,
} from '@/features/modelos/lib/botoesDoCatalogo';

const TIPOS = [
  { valor: 'RESINA', rotulo: 'Resina' },
  { valor: 'COQUILHA_ACO', rotulo: 'Coquilha em Aço' },
];

describe('botoesDoCatalogo', () => {
  it('deve começar pelo "Todos" marcado quando nada foi escolhido', () => {
    // Act
    const botoes = botoesDoCatalogo('Todos', TIPOS, new Map([['RESINA', 3]]), '');

    // Assert
    expect(botoes[0]).toEqual({
      valor: '',
      rotulo: 'Todos',
      total: null,
      escolhido: true,
      desabilitado: false,
    });
    expect(botoes.map((b) => b.rotulo)).toEqual(['Todos', 'Resina', 'Coquilha em Aço']);
  });

  it('deve dar a cada botão o número da API e 0 ao que a API omitiu, desabilitando o 0', () => {
    // Act
    const [, resina, coquilha] = botoesDoCatalogo('Todos', TIPOS, new Map([['RESINA', 3]]), '');

    // Assert
    expect(resina).toMatchObject({ total: 3, desabilitado: false });
    expect(coquilha).toMatchObject({ total: 0, desabilitado: true });
  });

  it('deve marcar o escolhido e não desabilitá-lo mesmo com 0', () => {
    // Act
    const botoes = botoesDoCatalogo('Todos', TIPOS, new Map([['RESINA', 3]]), 'COQUILHA_ACO');

    // Assert
    expect(botoes[0].escolhido).toBe(false);
    expect(botoes[2]).toMatchObject({ escolhido: true, total: 0, desabilitado: false });
  });

  it('deve deixar os botões sem número e habilitados quando as contagens não existem', () => {
    // Act
    const botoes = botoesDoCatalogo('Todas', TIPOS, null, '');

    // Assert
    expect(botoes.slice(1).map((b) => [b.total, b.desabilitado])).toEqual([
      [null, false],
      [null, false],
    ]);
  });

  it('deve incluir o filtro escolhido que não está no catálogo, como um botão a mais', () => {
    // Act
    const botoes = botoesDoCatalogo('Todos', TIPOS, new Map(), 'TIPO_ANTIGO');

    // Assert
    expect(botoes.map((b) => b.valor)).toEqual(['', 'RESINA', 'COQUILHA_ACO', 'TIPO_ANTIGO']);
    expect(botoes[3]).toMatchObject({
      escolhido: true,
      rotulo: 'TIPO_ANTIGO',
      desabilitado: false,
    });
  });
});

describe('totais da API', () => {
  const contagens = {
    total: 5,
    porTipo: [{ tipo: 'RESINA', total: 3 }],
    porMaquina: [{ maquina: 'FBOX', total: 5 }],
  };

  it('deve indexar as contagens por tipo e por máquina', () => {
    expect(totaisPorTipo(contagens)?.get('RESINA')).toBe(3);
    expect(totaisPorMaquina(contagens)?.get('FBOX')).toBe(5);
  });

  it('deve devolver nulo quando as contagens não chegaram', () => {
    expect(totaisPorTipo(undefined)).toBeNull();
    expect(totaisPorMaquina(undefined)).toBeNull();
  });
});
