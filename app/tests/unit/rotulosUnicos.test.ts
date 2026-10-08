import { describe, expect, it } from 'vitest';

import * as rotulos from '@/shared/lib/rotulos';

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

/** As formas em que um arquivo liga um valor da API ao texto que a tela mostra. */
const FORMAS = [
  new RegExp(`\\b${VALOR}\\s*:\\s*\\{[^{}]*?\\blabel\\s*:\\s*${TEXTO}`, 'g'),
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

function rotulosForaDaFonte(fontes: Record<string, string>): Achado[] {
  return Object.entries(fontes)
    .filter(([arquivo]) => arquivo !== FONTE_DOS_ROTULOS)
    .flatMap(([arquivo, texto]) =>
      FORMAS.flatMap((forma) => [...texto.matchAll(forma)])
        .filter((achado) => ehRotuloDoValor(achado[1], achado[3]))
        .map((achado) => ({ arquivo, trecho: achado[0] })),
    );
}

const ARQUIVO_SEM_AREA = '/src/exemplo/Tela.tsx';
const ARQUIVOS_DE_PRODUCAO = [
  '/src/shared/components/Exemplo/Exemplo.tsx',
  '/src/features/solicitacoes/components/Exemplo.tsx',
  '/src/features/admin/usuarios/pages/ExemploPage.tsx',
  '/src/app/layouts/ExemploLayout.tsx',
];
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
    {
      nome: 'uma configuração por valor com o rótulo dentro',
      trecho: `${VALOR_DE_EXEMPLO}: { variant: 'info', label: '${ROTULO_DE_EXEMPLO}'`,
    },
  ])('deve apontar o arquivo e o trecho quando o texto tem $nome', ({ trecho }) => {
    // Arrange
    const fontes = { [ARQUIVO_SEM_AREA]: `const exemplo = { ${trecho} };` };

    // Act
    const achados = rotulosForaDaFonte(fontes);

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
    const achados = rotulosForaDaFonte(fontes);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_SEM_AREA, trecho }]);
  });

  it('deve não apontar nada quando o texto ligado ao valor não é o rótulo dele', () => {
    // Arrange
    const fontes = {
      [ARQUIVO_SEM_AREA]: `const classes = { ${VALOR_DE_EXEMPLO}: 'bg-surface', OUTRO: '${ROTULO_DE_EXEMPLO}' };`,
    };

    // Act
    const achados = rotulosForaDaFonte(fontes);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve não conferir o arquivo que é a fonte dos rótulos', () => {
    // Arrange
    const fontes = { [FONTE_DOS_ROTULOS]: FONTES[FONTE_DOS_ROTULOS] };

    // Act
    const achados = rotulosForaDaFonte(fontes);

    // Assert
    expect(achados).toEqual([]);
  });

  it.each(ARQUIVOS_DE_PRODUCAO)('deve conferir o arquivo %s, de qualquer pasta', (arquivo) => {
    // Arrange
    const trecho = `${VALOR_DE_EXEMPLO}: '${ROTULO_DE_EXEMPLO}'`;
    const fontes = { [arquivo]: `const exemplo = { ${trecho} };` };

    // Act
    const achados = rotulosForaDaFonte(fontes);

    // Assert
    expect(achados).toEqual([{ arquivo, trecho }]);
  });

  it('deve não encontrar rótulo de valor da API fora da fonte em nenhum arquivo de produção', () => {
    // Act
    const achados = rotulosForaDaFonte(FONTES);

    // Assert
    expect(achados).toEqual([]);
  });
});
