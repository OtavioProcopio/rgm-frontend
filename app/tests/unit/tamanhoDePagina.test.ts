import { describe, expect, it } from 'vitest';

const LIMITE = 100;

/** Texto de todo arquivo de código de produção, por caminho. */
const FONTES = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Todo `size: <algo>` do código de produção, com o arquivo e o texto do valor. */
function tamanhosDePagina() {
  return Object.entries(FONTES).flatMap(([arquivo, texto]) =>
    [...texto.matchAll(/\bsize:\s*([^,}\n]+)/g)].map((achado) => ({
      arquivo,
      valor: achado[1].trim(),
    })),
  );
}

describe('tamanho de página pedido à API', () => {
  it('deve encontrar os pedidos de página do código de produção', () => {
    // Act
    const tamanhos = tamanhosDePagina();

    // Assert
    expect(tamanhos.length).toBeGreaterThan(5);
  });

  it(`deve não pedir mais de ${LIMITE} itens por página em nenhum arquivo`, () => {
    // Act
    const acimaDoLimite = tamanhosDePagina().filter(
      ({ valor }) => /^\d+$/.test(valor) && Number(valor) > LIMITE,
    );

    // Assert
    expect(acimaDoLimite).toEqual([]);
  });

  it('deve não calcular o tamanho da página a partir do total de registros', () => {
    // Act
    const calculados = tamanhosDePagina().filter(({ valor }) => /Math\.|total/i.test(valor));

    // Assert
    expect(calculados).toEqual([]);
  });
});
