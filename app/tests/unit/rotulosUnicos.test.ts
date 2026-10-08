import { describe, expect, it } from 'vitest';

import * as rotulos from '@/shared/lib/rotulos';
import { AREAS, PENDENTES, arquivosConferidos } from '@tests/support/areasDaMigracao';

const FONTES = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const FONTE_DOS_ROTULOS = '/src/shared/lib/rotulos.ts';

/** Rótulos oficiais de cada valor da API; um valor pode estar em mais de um conjunto. */
const OFICIAIS = Object.values(rotulos)
  .flatMap((conjunto) => Object.entries(conjunto))
  .reduce<Record<string, string[]>>(
    (porValor, [valor, rotulo]) => ({ ...porValor, [valor]: [...(porValor[valor] ?? []), rotulo] }),
    {},
  );

const VALOR = '([A-Z][A-Z0-9_]+)';
const TEXTO = '([\'"`])([^\'"`\\n]+)\\2';

/** As três formas em que um arquivo liga um valor da API ao texto que a tela mostra. */
const FORMAS = [
  new RegExp(`\\b${VALOR}\\s*:\\s*${TEXTO}`, 'g'),
  new RegExp(
    `\\bvalue\\s*:\\s*['"]${VALOR}(['"])\\s*,\\s*label\\s*:\\s*['"\`]([^'"\`\\n]+)['"\`]`,
    'g',
  ),
  new RegExp(`\\bvalue=["']${VALOR}(["'])\\s*>\\s*([^<{]+?)\\s*<`, 'g'),
];

const semAcento = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function ehRotuloDoValor(valor: string, texto: string): boolean {
  const escrito = semAcento(texto);
  return (OFICIAIS[valor] ?? [])
    .map(semAcento)
    .some((oficial) => oficial.startsWith(escrito) || escrito.startsWith(oficial));
}

type Achado = { arquivo: string; trecho: string };

function rotulosForaDaFonte(fontes: Record<string, string>, pendentes: string[]): Achado[] {
  return arquivosConferidos(fontes, pendentes)
    .filter(([arquivo]) => arquivo !== FONTE_DOS_ROTULOS)
    .flatMap(([arquivo, texto]) =>
      FORMAS.flatMap((forma) => [...texto.matchAll(forma)])
        .filter((achado) => ehRotuloDoValor(achado[1], achado[3]))
        .map((achado) => ({ arquivo, trecho: achado[0] })),
    );
}

const ARQUIVO_SEM_AREA = '/src/exemplo/Tela.tsx';
const AREA = 'area-f';
const ARQUIVO_DA_AREA = `${AREAS[AREA][0]}Exemplo.tsx`;
const [VALOR_DE_EXEMPLO, ROTULO_DE_EXEMPLO] = Object.entries(rotulos.rotuloDoPerfil)[1];

describe('guarda de rótulo único por valor da API', () => {
  it.each([
    { nome: 'um mapa de valor para texto', trecho: `${VALOR_DE_EXEMPLO}: '${ROTULO_DE_EXEMPLO}'` },
    {
      nome: 'uma opção com valor e rótulo',
      trecho: `value: '${VALOR_DE_EXEMPLO}', label: '${ROTULO_DE_EXEMPLO}'`,
    },
    {
      nome: 'uma opção de lista escrita na tela',
      trecho: `value="${VALOR_DE_EXEMPLO}">${ROTULO_DE_EXEMPLO}<`,
    },
  ])('deve apontar o arquivo e o trecho quando o texto tem $nome', ({ trecho }) => {
    // Arrange
    const fontes = { [ARQUIVO_SEM_AREA]: `const exemplo = { ${trecho} };` };

    // Act
    const achados = rotulosForaDaFonte(fontes, []);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_SEM_AREA, trecho }]);
  });

  it('deve apontar o rótulo quando o texto é uma forma abreviada do oficial', () => {
    // Arrange
    const [valor, oficial] = Object.entries(rotulos.rotuloDoTipoDeSolicitacao).find(([, rotulo]) =>
      rotulo.includes(' '),
    )!;
    const trecho = `${valor}: '${oficial.split(' ')[0]}'`;
    const fontes = { [ARQUIVO_SEM_AREA]: `const exemplo = { ${trecho} };` };

    // Act
    const achados = rotulosForaDaFonte(fontes, []);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_SEM_AREA, trecho }]);
  });

  it('deve não apontar nada quando o texto ligado ao valor não é o rótulo dele', () => {
    // Arrange
    const fontes = {
      [ARQUIVO_SEM_AREA]: `const classes = { ${VALOR_DE_EXEMPLO}: 'bg-surface', OUTRO: '${ROTULO_DE_EXEMPLO}' };`,
    };

    // Act
    const achados = rotulosForaDaFonte(fontes, []);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve não conferir o arquivo que é a fonte dos rótulos', () => {
    // Arrange
    const fontes = { [FONTE_DOS_ROTULOS]: FONTES[FONTE_DOS_ROTULOS] };

    // Act
    const achados = rotulosForaDaFonte(fontes, []);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve não conferir o arquivo quando a área dele tem pendência', () => {
    // Arrange
    const fontes = {
      [ARQUIVO_DA_AREA]: `const exemplo = { ${VALOR_DE_EXEMPLO}: '${ROTULO_DE_EXEMPLO}' };`,
    };

    // Act
    const achados = rotulosForaDaFonte(fontes, [AREA]);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve conferir o arquivo quando a área dele não tem pendência', () => {
    // Arrange
    const trecho = `${VALOR_DE_EXEMPLO}: '${ROTULO_DE_EXEMPLO}'`;
    const fontes = { [ARQUIVO_DA_AREA]: `const exemplo = { ${trecho} };` };
    const outrasAreas = Object.keys(AREAS).filter((area) => area !== AREA);

    // Act
    const achados = rotulosForaDaFonte(fontes, outrasAreas);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_DA_AREA, trecho }]);
  });

  it('deve não encontrar rótulo de valor da API fora da fonte no código de produção das áreas sem pendência', () => {
    // Act
    const achados = rotulosForaDaFonte(FONTES, PENDENTES);

    // Assert
    expect(achados).toEqual([]);
  });
});
