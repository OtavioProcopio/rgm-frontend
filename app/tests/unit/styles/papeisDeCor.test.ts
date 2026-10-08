/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contraste } from '@/shared/lib/contraste';
import { THEME_COLOR } from '@/shared/lib/theme';

// O Vitest não entrega o conteúdo de folha de estilo importada: o arquivo é lido do disco.
const css = readFileSync(resolve(__dirname, '../../../src/styles/globals.css'), 'utf8');

type Tema = 'claro' | 'escuro';

const SELETOR: Record<Tema, string> = { claro: ':root', escuro: '.dark' };
const TEMAS: Tema[] = ['claro', 'escuro'];

const SUPERFICIES = ['canvas', 'surface', 'surface-raised', 'surface-muted'];
const SIGNIFICADOS = ['danger', 'warning', 'success', 'info'];

const PAPEIS = [
  ...SUPERFICIES,
  'line',
  'line-strong',
  'fg',
  'fg-muted',
  'accent',
  'accent-hover',
  'on-accent',
  ...SIGNIFICADOS.flatMap((papel) => [papel, `${papel}-soft`, `${papel}-fg`]),
  'danger-hover',
  'on-solid',
  'scrim',
  'logo-plate',
];

const TEXTO_SOBRE_FUNDO: [string, string][] = [
  ...['fg', 'fg-muted', 'accent'].flatMap((texto) =>
    SUPERFICIES.map((fundo): [string, string] => [texto, fundo]),
  ),
  ['on-accent', 'accent'],
  ['on-accent', 'accent-hover'],
  ['on-solid', 'danger'],
  ['on-solid', 'danger-hover'],
  ['on-solid', 'success'],
  ['on-solid', 'warning'],
  ...SIGNIFICADOS.map((papel): [string, string] => [`${papel}-fg`, `${papel}-soft`]),
];

const CONTORNO_SOBRE_FUNDO = ['line-strong', 'accent'].flatMap((contorno) =>
  SUPERFICIES.map((fundo): [string, string] => [contorno, fundo]),
);

const porTema = <T>(casos: T[]) => TEMAS.flatMap((tema) => casos.map((caso) => ({ tema, caso })));

function blocos(seletor: string): string {
  const padrao = new RegExp(`(?:^|\\n)${seletor.replace('.', '\\.')}\\s*\\{([^}]*)\\}`, 'g');
  return [...css.matchAll(padrao)].map((achado) => achado[1]).join('\n');
}

function definicoes(tema: Tema, papel: string): string[] {
  const padrao = new RegExp(`--${papel}:\\s*([^;]+);`, 'g');
  return [...blocos(SELETOR[tema]).matchAll(padrao)].map((achado) => achado[1].trim());
}

const valor = (tema: Tema, papel: string) => definicoes(tema, papel)[0];

const blocoDoTema = () => css.match(/@theme[^{]*\{([^}]*)\}/)?.[1] ?? '';

describe('papéis de cor', () => {
  it.each(porTema(PAPEIS))(
    'deve ter exatamente uma definição do papel $caso quando o tema é $tema',
    ({ tema, caso }) => {
      // Act
      const encontradas = definicoes(tema, caso);

      // Assert
      expect(encontradas).toHaveLength(1);
    },
  );

  it.each(PAPEIS)('deve expor o papel %s como cor do Tailwind', (papel) => {
    // Act
    const tema = blocoDoTema();

    // Assert
    expect(tema).toContain(`--color-${papel}: var(--${papel});`);
  });

  it.each(porTema(TEXTO_SOBRE_FUNDO))(
    'deve dar no mínimo 4,5:1 a $caso.0 sobre $caso.1 quando o tema é $tema',
    ({ tema, caso: [texto, fundo] }) => {
      // Act
      const razao = contraste(valor(tema, texto), valor(tema, fundo));

      // Assert
      expect(razao).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(porTema(CONTORNO_SOBRE_FUNDO))(
    'deve dar no mínimo 3:1 a $caso.0 sobre $caso.1 quando o tema é $tema',
    ({ tema, caso: [contorno, fundo] }) => {
      // Act
      const razao = contraste(valor(tema, contorno), valor(tema, fundo));

      // Assert
      expect(razao).toBeGreaterThanOrEqual(3);
    },
  );

  it('deve usar o papel accent no contorno de foco', () => {
    // Act
    const foco = [...blocos(':root').matchAll(/--foco:\s*([^;]+);/g)].map((achado) => achado[1]);

    // Assert
    expect(foco).toEqual(['var(--accent)']);
  });

  it('deve deixar a placa do logo transparente quando o tema é claro', () => {
    // Act
    const placa = valor('claro', 'logo-plate');

    // Assert
    expect(placa).toBe('transparent');
  });

  it('deve dar no mínimo 4,5:1 ao texto principal do tema claro sobre a placa do logo quando o tema é escuro', () => {
    // Act
    const razao = contraste(valor('claro', 'fg'), valor('escuro', 'logo-plate'));

    // Assert
    expect(razao).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    { tema: 'claro' as const, chave: 'light' as const },
    { tema: 'escuro' as const, chave: 'dark' as const },
  ])('deve usar o papel canvas na cor da barra do navegador quando o tema é $tema', (caso) => {
    // Act
    const canvas = valor(caso.tema, 'canvas');

    // Assert
    expect(THEME_COLOR[caso.chave]).toBe(canvas);
  });
});
