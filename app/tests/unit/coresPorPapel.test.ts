import { describe, expect, it } from 'vitest';

import { AREAS, PENDENTES, arquivosConferidos } from '@tests/support/areasDaMigracao';

const FONTES = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const FAMILIAS = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

const PROPRIEDADES_DE_COR = [
  'bg',
  'text',
  'border',
  'ring',
  'ring-offset',
  'divide',
  'from',
  'via',
  'to',
  'fill',
  'stroke',
  'outline',
  'shadow',
  'placeholder',
  'decoration',
  'caret',
  'accent',
];

const COR_DE_FAMILIA = new RegExp(`\\b(?:${FAMILIAS.join('|')})-(?:50|[1-9]00|950)\\b`, 'g');
const VARIANTE_ESCURA_DE_COR = new RegExp(
  `\\bdark:(?:[a-z-]+:)*(?:${PROPRIEDADES_DE_COR.join('|')})-[\\w/.[\\]#-]+`,
  'g',
);
const COR_EM_HEXADECIMAL =
  /(?<=['"`[:])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/g;

/**
 * A cor da barra do navegador é um atributo do documento e não aceita variável de CSS:
 * `theme.ts` guarda o valor do papel `canvas`, e `papeisDeCor.test.ts` confere que é o mesmo.
 */
const VALOR_DE_PAPEL_FORA_DO_CSS = ['/src/shared/lib/theme.ts'];

type Achado = { arquivo: string; trecho: string };

function coresForaDosPapeis(fontes: Record<string, string>, pendentes: string[]): Achado[] {
  return arquivosConferidos(fontes, pendentes).flatMap(([arquivo, texto]) => {
    const padroes = VALOR_DE_PAPEL_FORA_DO_CSS.includes(arquivo)
      ? [COR_DE_FAMILIA, VARIANTE_ESCURA_DE_COR]
      : [COR_DE_FAMILIA, VARIANTE_ESCURA_DE_COR, COR_EM_HEXADECIMAL];
    const trechos = padroes.flatMap((padrao) =>
      [...texto.matchAll(padrao)].map(([achado]) => achado),
    );
    return [...new Set(trechos)].map((trecho) => ({ arquivo, trecho }));
  });
}

const ARQUIVO_SEM_AREA = '/src/exemplo/Tela.tsx';
const AREA = 'pecas-base';
const ARQUIVO_DA_AREA = `${AREAS[AREA][0]}Exemplo/Exemplo.tsx`;
const tela = (classes: string) => `export const Tela = () => <p className="${classes}">texto</p>;`;

describe('guarda de cores por papel', () => {
  it.each([
    { nome: 'cor de família genérica', trecho: 'slate-200', classes: 'border-slate-200' },
    {
      nome: 'cor de família genérica com opacidade',
      trecho: 'sky-600',
      classes: 'ring-sky-600/40',
    },
    { nome: 'variante dark: de cor', trecho: 'dark:bg-surface', classes: 'dark:bg-surface' },
    {
      nome: 'variante dark: de cor com estado',
      trecho: 'dark:hover:text-fg',
      classes: 'dark:hover:text-fg',
    },
    { nome: 'cor em hexadecimal de 6 dígitos', trecho: '#1a1d23', classes: 'bg-[#1a1d23]' },
    { nome: 'cor em hexadecimal de 3 dígitos', trecho: '#fff', classes: 'text-[#fff]' },
  ])('deve apontar o arquivo e o trecho quando o texto tem $nome', ({ trecho, classes }) => {
    // Arrange
    const fontes = { [ARQUIVO_SEM_AREA]: tela(classes) };

    // Act
    const achados = coresForaDosPapeis(fontes, []);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_SEM_AREA, trecho }]);
  });

  it('deve não apontar nada quando o texto só usa papéis, branco, preto e transparente', () => {
    // Arrange
    const classes =
      'border-line bg-surface text-fg-muted hover:bg-accent-hover bg-white bg-transparent';
    const fontes = { [ARQUIVO_SEM_AREA]: tela(classes) };

    // Act
    const achados = coresForaDosPapeis(fontes, []);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve não apontar nada quando o texto cita o número de uma issue', () => {
    // Arrange
    const fontes = {
      [ARQUIVO_SEM_AREA]: `// Regra da troca de tema (#128)\n${tela('bg-surface')}`,
    };

    // Act
    const achados = coresForaDosPapeis(fontes, []);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve não conferir o arquivo quando a área dele tem pendência', () => {
    // Arrange
    const fontes = { [ARQUIVO_DA_AREA]: tela('bg-slate-800') };

    // Act
    const achados = coresForaDosPapeis(fontes, [AREA]);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve conferir o arquivo quando a área dele não tem pendência', () => {
    // Arrange
    const fontes = { [ARQUIVO_DA_AREA]: tela('bg-slate-800') };
    const outrasAreas = Object.keys(AREAS).filter((area) => area !== AREA);

    // Act
    const achados = coresForaDosPapeis(fontes, outrasAreas);

    // Assert
    expect(achados).toEqual([{ arquivo: ARQUIVO_DA_AREA, trecho: 'slate-800' }]);
  });

  it('deve aceitar a cor em hexadecimal quando o arquivo é o que guarda a cor da barra do navegador', () => {
    // Arrange
    const fontes = { [VALOR_DE_PAPEL_FORA_DO_CSS[0]]: `export const COR = '#f8fafc';` };

    // Act
    const achados = coresForaDosPapeis(fontes, []);

    // Assert
    expect(achados).toEqual([]);
  });

  it('deve ter pendência só de área conhecida', () => {
    // Act
    const desconhecidas = PENDENTES.filter((area) => !(area in AREAS));

    // Assert
    expect(desconhecidas).toEqual([]);
  });

  it('deve não encontrar cor fora dos papéis no código de produção das áreas sem pendência', () => {
    // Act
    const achados = coresForaDosPapeis(FONTES, PENDENTES);

    // Assert
    expect(achados).toEqual([]);
  });
});
