/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  THEME_COLOR,
  THEME_KEY,
  applyTheme,
  getStoredPreference,
  initializeTheme,
  resolveTheme,
  setThemePreference,
  systemPrefersDark,
} from '@/shared/lib/theme';

const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const VERSAO_ANTIGA = '2';
const VERSAO_ATUAL = '3';
const CONSULTA_DO_SISTEMA = '(prefers-color-scheme: dark)';

function simularSistema(escuro: boolean) {
  const matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: escuro } as MediaQueryList);
  window.matchMedia = matchMedia;
  return matchMedia;
}

function criarMetaDaBarra(): HTMLMetaElement {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#000000';
  document.head.appendChild(meta);
  return meta;
}

function limpar() {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  Reflect.deleteProperty(window, 'matchMedia');
}

beforeEach(limpar);
afterEach(limpar);

describe('getStoredPreference', () => {
  it('deve ser system quando nada foi guardado', () => {
    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('system');
  });

  it('deve virar system quando o escuro foi imposto pela versão antiga', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('system');
  });

  it('deve guardar system quando o escuro da versão antiga é convertido', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);

    // Act
    getStoredPreference();

    // Assert
    expect(localStorage.getItem(THEME_KEY)).toBe('system');
  });

  it('deve gravar a marca da versão atual quando a passagem é feita', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);

    // Act
    getStoredPreference();

    // Assert
    expect(localStorage.getItem(THEME_DEFAULTED_KEY)).toBe(VERSAO_ATUAL);
  });

  it('deve manter dark quando ele foi escolhido depois da passagem', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);
    getStoredPreference();
    localStorage.setItem(THEME_KEY, 'dark');

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('dark');
  });

  it('deve manter light quando o claro foi escolhido na versão antiga', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'light');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('light');
  });

  it('deve devolver system quando system está guardado na versão atual', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'system');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ATUAL);

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('system');
  });

  it('deve ser system quando o valor guardado não é uma preferência conhecida', () => {
    // Arrange
    localStorage.setItem(THEME_KEY, 'azul');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ATUAL);

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('system');
  });
});

describe('systemPrefersDark', () => {
  it('deve ser verdadeiro quando o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);

    // Act
    const escuro = systemPrefersDark();

    // Assert
    expect(escuro).toBe(true);
  });

  it('deve ser falso quando o sistema está no claro', () => {
    // Arrange
    simularSistema(false);

    // Act
    const escuro = systemPrefersDark();

    // Assert
    expect(escuro).toBe(false);
  });

  it('deve consultar o sistema uma vez pela preferência de cor quando é chamado', () => {
    // Arrange
    const matchMedia = simularSistema(true);

    // Act
    systemPrefersDark();

    // Assert
    expect(matchMedia).toHaveBeenCalledTimes(1);
    expect(matchMedia).toHaveBeenCalledWith(CONSULTA_DO_SISTEMA);
    expect(matchMedia).toHaveReturnedWith({ matches: true });
  });

  it('deve ser falso quando o ambiente não informa a preferência do sistema', () => {
    // Act
    const escuro = systemPrefersDark();

    // Assert
    expect(escuro).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('deve resolver dark quando a preferência é system e o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);

    // Act
    const tema = resolveTheme('system');

    // Assert
    expect(tema).toBe('dark');
  });

  it('deve resolver light quando a preferência é system e o sistema está no claro', () => {
    // Arrange
    simularSistema(false);

    // Act
    const tema = resolveTheme('system');

    // Assert
    expect(tema).toBe('light');
  });

  it('deve resolver light quando a preferência é light e o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);

    // Act
    const tema = resolveTheme('light');

    // Assert
    expect(tema).toBe('light');
  });

  it('deve resolver dark quando a preferência é dark e o sistema está no claro', () => {
    // Arrange
    simularSistema(false);

    // Act
    const tema = resolveTheme('dark');

    // Assert
    expect(tema).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('deve pôr a classe dark no documento quando o tema é escuro', () => {
    // Act
    applyTheme('dark');

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve tirar a classe dark do documento quando o tema é claro', () => {
    // Arrange
    document.documentElement.classList.add('dark');

    // Act
    applyTheme('light');

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve pôr na barra do navegador a cor de fundo do tema escuro quando o tema é escuro', () => {
    // Arrange
    const meta = criarMetaDaBarra();

    // Act
    applyTheme('dark');

    // Assert
    expect(meta.content).toBe(THEME_COLOR.dark);
  });

  it('deve pôr na barra do navegador a cor de fundo do tema claro quando o tema é claro', () => {
    // Arrange
    const meta = criarMetaDaBarra();

    // Act
    applyTheme('light');

    // Assert
    expect(meta.content).toBe(THEME_COLOR.light);
  });

  it('deve aplicar a classe mesmo quando a página não tem a cor da barra', () => {
    // Act
    applyTheme('dark');

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('setThemePreference', () => {
  it('deve guardar a preferência quando ela é escolhida', () => {
    // Act
    setThemePreference('dark');

    // Assert
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('deve gravar a marca da versão atual quando a preferência é escolhida', () => {
    // Act
    setThemePreference('light');

    // Assert
    expect(localStorage.getItem(THEME_DEFAULTED_KEY)).toBe(VERSAO_ATUAL);
  });

  it('deve aplicar o tema escuro quando a preferência escolhida é dark', () => {
    // Act
    setThemePreference('dark');

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve aplicar o tema do sistema quando a preferência escolhida é system', () => {
    // Arrange
    simularSistema(true);

    // Act
    setThemePreference('system');

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve devolver o tema aplicado quando a preferência é escolhida', () => {
    // Arrange
    simularSistema(true);

    // Act
    const tema = setThemePreference('light');

    // Assert
    expect(tema).toBe('light');
  });

  it('deve devolver a mesma preferência na visita seguinte quando ela foi escolhida', () => {
    // Arrange
    setThemePreference('dark');

    // Act
    const preferencia = getStoredPreference();

    // Assert
    expect(preferencia).toBe('dark');
  });
});

describe('initializeTheme', () => {
  it('deve aplicar o tema do sistema quando nada foi guardado', () => {
    // Arrange
    simularSistema(true);

    // Act
    initializeTheme();

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve aplicar o tema claro quando light está guardado e o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);
    localStorage.setItem(THEME_KEY, 'light');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ATUAL);

    // Act
    initializeTheme();

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve seguir o sistema quando o escuro guardado veio da versão antiga', () => {
    // Arrange
    simularSistema(false);
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ANTIGA);

    // Act
    initializeTheme();

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
