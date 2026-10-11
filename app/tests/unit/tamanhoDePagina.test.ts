import { describe, expect, it } from 'vitest';

const LIMITE = 100;
const DECLARACOES_DE_TIPO = ['number;'];

const FONTES = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const TEXTO = Object.values(FONTES).join('\n');

function tamanhosDePagina() {
  return Object.entries(FONTES).flatMap(([arquivo, texto]) =>
    [...texto.matchAll(/\bsize:\s*([^,}\n]+)/g)].map((achado) => ({
      arquivo,
      valor: achado[1].replace(/\s+as const$/, '').trim(),
    })),
  );
}

const numero = (texto: string) => Number(texto.replace(/_/g, ''));
const ehNumero = (valor: string) => /^[\d_]+$/.test(valor);
const ehConstante = (valor: string) => /^[A-Z][A-Z0-9_]*$/.test(valor);

function valorDaConstante(nome: string): number | null {
  const definicao = TEXTO.match(new RegExp(`const ${nome}\\s*=\\s*([\\d_]+)\\s*;`));
  return definicao ? numero(definicao[1]) : null;
}

describe('tamanho de página pedido à API', () => {
  it('deve encontrar os pedidos de página do código de produção', () => {
    // Act
    const tamanhos = tamanhosDePagina();

    // Assert
    expect(tamanhos.length).toBeGreaterThan(5);
  });

  it(`deve não pedir mais de ${LIMITE} itens por página com número escrito no código`, () => {
    // Act
    const acimaDoLimite = tamanhosDePagina().filter(
      ({ valor }) => ehNumero(valor) && numero(valor) > LIMITE,
    );

    // Assert
    expect(acimaDoLimite).toEqual([]);
  });

  it(`deve não pedir mais de ${LIMITE} itens por página por meio de constante`, () => {
    // Act
    const acimaDoLimite = tamanhosDePagina()
      .filter(({ valor }) => ehConstante(valor))
      .map(({ arquivo, valor }) => ({ arquivo, valor, numero: valorDaConstante(valor) }))
      .filter((item) => item.numero === null || item.numero > LIMITE);

    // Assert
    expect(acimaDoLimite).toEqual([]);
  });

  it('deve só usar número, constante ou o tamanho recebido de quem chama', () => {
    // Act
    const outros = tamanhosDePagina()
      .map(({ valor }) => valor)
      .filter((valor) => !ehNumero(valor) && !ehConstante(valor) && valor !== 'filtros.size');

    // Assert
    expect([...new Set(outros)].sort()).toEqual(DECLARACOES_DE_TIPO);
  });
});
