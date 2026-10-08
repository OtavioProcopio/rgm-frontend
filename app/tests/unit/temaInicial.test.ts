/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { THEME_KEY, getStoredPreference, resolveTheme } from '@/shared/lib/theme';

const [html] = Object.values(
  import.meta.glob<string>('/index.html', { query: '?raw', import: 'default', eager: true }),
);

const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const VERSAO_ANTIGA = '2';
const VERSAO_ATUAL = '3';

const TRECHO = html.match(/<script>([\s\S]*?)<\/script>/);

type Caso = {
  nome: string;
  guardado: string | null;
  versao: string | null;
  sistemaEscuro: boolean;
};

const CASOS: Caso[] = [
  {
    nome: 'nada foi guardado e o sistema está no escuro',
    guardado: null,
    versao: null,
    sistemaEscuro: true,
  },
  {
    nome: 'nada foi guardado e o sistema está no claro',
    guardado: null,
    versao: null,
    sistemaEscuro: false,
  },
  {
    nome: 'dark foi escolhido e o sistema está no claro',
    guardado: 'dark',
    versao: VERSAO_ATUAL,
    sistemaEscuro: false,
  },
  {
    nome: 'light foi escolhido e o sistema está no escuro',
    guardado: 'light',
    versao: VERSAO_ATUAL,
    sistemaEscuro: true,
  },
  {
    nome: 'system foi escolhido e o sistema está no escuro',
    guardado: 'system',
    versao: VERSAO_ATUAL,
    sistemaEscuro: true,
  },
  {
    nome: 'system foi escolhido e o sistema está no claro',
    guardado: 'system',
    versao: VERSAO_ATUAL,
    sistemaEscuro: false,
  },
  {
    nome: 'o escuro é da versão antiga e o sistema está no escuro',
    guardado: 'dark',
    versao: VERSAO_ANTIGA,
    sistemaEscuro: true,
  },
  {
    nome: 'o escuro é da versão antiga e o sistema está no claro',
    guardado: 'dark',
    versao: VERSAO_ANTIGA,
    sistemaEscuro: false,
  },
  {
    nome: 'o claro é da versão antiga e o sistema está no escuro',
    guardado: 'light',
    versao: VERSAO_ANTIGA,
    sistemaEscuro: true,
  },
  {
    nome: 'o valor guardado não é uma opção e o sistema está no escuro',
    guardado: 'azul',
    versao: VERSAO_ATUAL,
    sistemaEscuro: true,
  },
];

function preparar({ guardado, versao, sistemaEscuro }: Caso) {
  localStorage.clear();
  if (guardado !== null) localStorage.setItem(THEME_KEY, guardado);
  if (versao !== null) localStorage.setItem(THEME_DEFAULTED_KEY, versao);
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: sistemaEscuro } as MediaQueryList);
}

function executarTrecho() {
  new Function(TRECHO![1])();
  return document.documentElement.classList.contains('dark');
}

function limpar() {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  Reflect.deleteProperty(window, 'matchMedia');
}

beforeEach(limpar);
afterEach(limpar);

describe('tema aplicado antes da primeira tela', () => {
  it.each(CASOS)('deve decidir o mesmo que theme.ts quando $nome', (caso) => {
    // Arrange
    preparar(caso);
    const esperado = resolveTheme(getStoredPreference()) === 'dark';
    preparar(caso);

    // Act
    const escuro = executarTrecho();

    // Assert
    expect(escuro).toBe(esperado);
  });

  it('deve tirar o tema escuro do documento quando o tema decidido é o claro', () => {
    // Arrange
    preparar({ nome: '', guardado: 'light', versao: VERSAO_ATUAL, sistemaEscuro: true });
    document.documentElement.classList.add('dark');

    // Act
    const escuro = executarTrecho();

    // Assert
    expect(escuro).toBe(false);
  });

  it('deve usar o tema claro quando o navegador não informa a preferência do sistema', () => {
    // Act
    const escuro = executarTrecho();

    // Assert
    expect(escuro).toBe(false);
  });

  it('deve vir antes de qualquer folha de estilo ou módulo', () => {
    // Arrange
    const posicao = html.indexOf('<script>');

    // Act
    const anteriores = html.slice(0, posicao);

    // Assert
    expect({
      existe: posicao >= 0,
      folhaDeEstilo: /rel="stylesheet"/.test(anteriores),
      modulo: /type="module"/.test(anteriores),
    }).toEqual({ existe: true, folhaDeEstilo: false, modulo: false });
  });

  it('deve estar no cabeçalho do documento', () => {
    // Act
    const cabecalho = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));

    // Assert
    expect(cabecalho).toContain('<script>');
  });
});
