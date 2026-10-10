import { describe, expect, it } from 'vitest';

import {
  LIMITE_DA_AMOSTRA,
  leituraDoAtraso,
  leituraDoTempoMedio,
  resumoDasPaginas,
  tempoMedioDeResolucao,
  variacaoDeConcluidas,
} from '@/features/solicitacoes/lib/leituraDosIndicadores';

describe('variacaoDeConcluidas', () => {
  it('deve ser neutra e sem dados quando o período anterior é zero e o atual também', () => {
    // Arrange
    const atual = 0;
    const anterior = 0;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'sem dados no período anterior' });
  });

  it('deve ser neutra e sem dados quando o período anterior é zero e o atual é maior que zero', () => {
    // Arrange
    const atual = 7;
    const anterior = 0;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'sem dados no período anterior' });
  });

  it('deve mostrar diferença absoluta positiva quando o anterior é 4', () => {
    // Arrange
    const atual = 7;
    const anterior = 4;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: '+3 contra o período anterior' });
  });

  it('deve mostrar diferença absoluta negativa com sinal de menos quando o anterior é menor que 5', () => {
    // Arrange
    const atual = 1;
    const anterior = 3;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'atencao', texto: '−2 contra o período anterior' });
  });

  it('deve dizer igual quando a diferença absoluta é zero', () => {
    // Arrange
    const atual = 2;
    const anterior = 2;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'igual ao período anterior' });
  });

  it('deve usar percentual quando o anterior é 5', () => {
    // Arrange
    const atual = 10;
    const anterior = 5;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: '+100% contra o período anterior' });
  });

  it('deve arredondar o percentual positivo ao inteiro', () => {
    // Arrange
    const atual = 10;
    const anterior = 8;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: '+25% contra o período anterior' });
  });

  it('deve mostrar percentual negativo com sinal de menos quando houve queda', () => {
    // Arrange
    const atual = 9;
    const anterior = 10;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'atencao', texto: '−10% contra o período anterior' });
  });

  it('deve dizer igual quando o percentual é zero', () => {
    // Arrange
    const atual = 10;
    const anterior = 10;

    // Act
    const leitura = variacaoDeConcluidas(atual, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'igual ao período anterior' });
  });
});

describe('leituraDoAtraso', () => {
  it('deve dizer em dia quando não há atrasadas', () => {
    // Arrange
    const atrasadas = 0;
    const abertas = 12;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: 'Em dia' });
  });

  it('deve dizer em dia quando não há atrasadas nem abertas', () => {
    // Arrange
    const atrasadas = 0;
    const abertas = 0;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: 'Em dia' });
  });

  it('deve pedir atenção quando as atrasadas são 10% exatos das abertas', () => {
    // Arrange
    const atrasadas = 1;
    const abertas = 10;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'atencao', texto: 'Atenção · 10% das abertas' });
  });

  it('deve pedir atenção com percentual arredondado quando está abaixo de 10%', () => {
    // Arrange
    const atrasadas = 2;
    const abertas = 25;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'atencao', texto: 'Atenção · 8% das abertas' });
  });

  it('deve ser ruim quando as atrasadas passam de 10% das abertas', () => {
    // Arrange
    const atrasadas = 6;
    const abertas = 25;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'ruim', texto: 'Ruim · 24% das abertas' });
  });

  it('deve ser ruim e sem percentual quando há atrasadas e nenhuma aberta', () => {
    // Arrange
    const atrasadas = 3;
    const abertas = 0;

    // Act
    const leitura = leituraDoAtraso(atrasadas, abertas);

    // Assert
    expect(leitura).toEqual({ tom: 'ruim', texto: 'Ruim' });
  });
});

describe('leituraDoTempoMedio', () => {
  it('deve ser neutra e sem conclusões quando o tempo atual é nulo', () => {
    // Arrange
    const atual = null;

    // Act
    const leitura = leituraDoTempoMedio(atual, 100);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'sem conclusões no período' });
  });

  it('deve ser neutra e sem dados quando o tempo anterior é nulo', () => {
    // Arrange
    const anterior = null;

    // Act
    const leitura = leituraDoTempoMedio(100, anterior);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'sem dados no período anterior' });
  });

  it('deve ser ok quando o tempo atual é menor que o anterior', () => {
    // Arrange
    const atual = 50;

    // Act
    const leitura = leituraDoTempoMedio(atual, 100);

    // Assert
    expect(leitura).toEqual({ tom: 'ok', texto: 'Melhor que o período anterior' });
  });

  it('deve ser neutra quando o tempo atual é igual ao anterior', () => {
    // Arrange
    const atual = 100;

    // Act
    const leitura = leituraDoTempoMedio(atual, 100);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'Igual ao período anterior' });
  });

  it('deve ser ruim quando o tempo atual é maior que o anterior', () => {
    // Arrange
    const atual = 150;

    // Act
    const leitura = leituraDoTempoMedio(atual, 100);

    // Assert
    expect(leitura).toEqual({ tom: 'ruim', texto: 'Pior que o período anterior' });
  });
});

describe('tempoMedioDeResolucao', () => {
  it('deve calcular a média arredondada quando todos os itens têm tempo', () => {
    // Arrange
    const itens = [
      { tempoResolucaoSegundos: 10 },
      { tempoResolucaoSegundos: 11 },
      { tempoResolucaoSegundos: 11 },
    ];

    // Act
    const tempo = tempoMedioDeResolucao(itens, 3);

    // Assert
    expect(tempo).toEqual({ segundos: 11, amostra: null });
  });

  it('deve ignorar itens sem tempo de resolução', () => {
    // Arrange
    const itens = [
      { tempoResolucaoSegundos: 10 },
      { tempoResolucaoSegundos: null },
      {},
      { tempoResolucaoSegundos: 20 },
    ];

    // Act
    const tempo = tempoMedioDeResolucao(itens, 4);

    // Assert
    expect(tempo).toEqual({ segundos: 15, amostra: null });
  });

  it('deve devolver nulo quando a lista é vazia', () => {
    // Arrange
    const itens: { tempoResolucaoSegundos?: number | null }[] = [];

    // Act
    const tempo = tempoMedioDeResolucao(itens, 0);

    // Assert
    expect(tempo).toBeNull();
  });

  it('deve devolver nulo quando nenhum item tem tempo', () => {
    // Arrange
    const itens = [{ tempoResolucaoSegundos: null }, {}];

    // Act
    const tempo = tempoMedioDeResolucao(itens, 2);

    // Assert
    expect(tempo).toBeNull();
  });

  it('deve omitir a amostra quando o total é exatamente o limite', () => {
    // Arrange
    const itens = [{ tempoResolucaoSegundos: 30 }];

    // Act
    const tempo = tempoMedioDeResolucao(itens, LIMITE_DA_AMOSTRA);

    // Assert
    expect(tempo?.amostra).toBeNull();
  });

  it('deve informar a amostra quando o total passa do limite', () => {
    // Arrange
    const itens = [{ tempoResolucaoSegundos: 30 }, { tempoResolucaoSegundos: null }];

    // Act
    const tempo = tempoMedioDeResolucao(itens, LIMITE_DA_AMOSTRA + 1);

    // Assert
    expect(tempo?.amostra).toEqual({ usados: 1, total: 101 });
  });

  it('deve informar a amostra quando o total é 130', () => {
    // Arrange
    const itens = [{ tempoResolucaoSegundos: 30 }];

    // Act
    const tempo = tempoMedioDeResolucao(itens, 130);

    // Assert
    expect(tempo?.amostra).toEqual({ usados: 1, total: 130 });
  });
});

describe('resumoDasPaginas', () => {
  const ATUAL = { content: [{ tempoResolucaoSegundos: 60 }], totalElements: 8 };
  const ANTERIOR = { content: [{ tempoResolucaoSegundos: 30 }], totalElements: 5 };

  it('deve resumir concluídas e tempo médio quando as duas páginas existem', () => {
    // Arrange
    const esperado = {
      concluidas: { atual: 8, anterior: 5 },
      tempoMedio: {
        atual: { segundos: 60, amostra: null },
        anterior: { segundos: 30, amostra: null },
      },
    };

    // Act
    const resumo = resumoDasPaginas(ATUAL, ANTERIOR);

    // Assert
    expect(resumo).toEqual(esperado);
  });

  it('deve devolver tudo indefinido quando falta a página anterior', () => {
    // Arrange
    const esperado = { concluidas: undefined, tempoMedio: undefined };

    // Act
    const resumo = resumoDasPaginas(ATUAL, undefined);

    // Assert
    expect(resumo).toEqual(esperado);
  });

  it('deve devolver tudo indefinido quando falta a página atual', () => {
    // Arrange
    const esperado = { concluidas: undefined, tempoMedio: undefined };

    // Act
    const resumo = resumoDasPaginas(undefined, ANTERIOR);

    // Assert
    expect(resumo).toEqual(esperado);
  });

  it('deve manter o total zero e tempo nulo quando uma página não tem concluídas', () => {
    // Arrange
    const vazia = { content: [], totalElements: 0 };

    // Act
    const resumo = resumoDasPaginas(vazia, ANTERIOR);

    // Assert
    expect(resumo).toEqual({
      concluidas: { atual: 0, anterior: 5 },
      tempoMedio: { atual: null, anterior: { segundos: 30, amostra: null } },
    });
  });
});
