/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';
import { THEME_KEY, type ThemePreference } from '@/shared/lib/theme';

const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const VERSAO_ATUAL = '3';

const OPCOES: { preferencia: ThemePreference; rotulo: string }[] = [
  { preferencia: 'system', rotulo: 'Sistema' },
  { preferencia: 'light', rotulo: 'Claro' },
  { preferencia: 'dark', rotulo: 'Escuro' },
];
const ROTULOS = OPCOES.map((opcao) => opcao.rotulo);
const [PRIMEIRA, SEGUNDA, ULTIMA] = ROTULOS;

function simularSistema(escuro: boolean) {
  window.matchMedia = vi.fn<typeof window.matchMedia>().mockReturnValue({
    matches: escuro,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
}

function guardar(preferencia: ThemePreference) {
  localStorage.setItem(THEME_KEY, preferencia);
  localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ATUAL);
}

const botao = () => screen.getByRole('button');
const opcoes = () => screen.getAllByRole('menuitemradio');
const opcao = (rotulo: string) => screen.getByRole('menuitemradio', { name: rotulo });

function abrirMenu() {
  render(<ThemeToggle />);
  fireEvent.click(botao());
}

function limpar() {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  Reflect.deleteProperty(window, 'matchMedia');
}

beforeEach(() => {
  limpar();
  simularSistema(false);
});
afterEach(limpar);

describe('ThemeToggle', () => {
  it('deve não mostrar o menu quando o botão ainda não foi acionado', () => {
    // Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve informar que o menu está fechado quando o botão ainda não foi acionado', () => {
    // Act
    render(<ThemeToggle />);

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('false');
  });

  it.each(OPCOES)(
    'deve informar a opção $rotulo no nome do botão quando ela é a ativa',
    ({ preferencia, rotulo }) => {
      // Arrange
      guardar(preferencia);

      // Act
      render(<ThemeToggle />);

      // Assert
      expect(screen.getByRole('button', { name: `Tema: ${rotulo}` })).toBeDefined();
    },
  );

  it('deve abrir um menu com Sistema, Claro e Escuro quando o botão é acionado', () => {
    // Act
    abrirMenu();

    // Assert
    expect(opcoes().map((item) => item.textContent)).toEqual(ROTULOS);
  });

  it('deve informar que o menu está aberto quando o botão é acionado', () => {
    // Act
    abrirMenu();

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('true');
  });

  it.each(OPCOES)(
    'deve marcar só a opção $rotulo quando ela é a ativa',
    ({ preferencia, rotulo }) => {
      // Arrange
      guardar(preferencia);

      // Act
      abrirMenu();

      // Assert
      const marcadas = opcoes().filter((item) => item.getAttribute('aria-checked') === 'true');
      expect(marcadas.map((item) => item.textContent)).toEqual([rotulo]);
    },
  );

  it('deve pôr o foco na opção ativa quando o menu abre', () => {
    // Arrange
    guardar('dark');

    // Act
    abrirMenu();

    // Assert
    expect(document.activeElement).toBe(opcao(ULTIMA));
  });

  it('deve fechar o menu quando o botão é acionado com o menu aberto', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve aplicar o tema escuro quando Escuro é escolhido', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.click(opcao(ULTIMA));

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it.each(OPCOES)(
    'deve guardar $preferencia quando $rotulo é escolhido',
    ({ preferencia, rotulo }) => {
      // Arrange
      abrirMenu();

      // Act
      fireEvent.click(opcao(rotulo));

      // Assert
      expect(localStorage.getItem(THEME_KEY)).toBe(preferencia);
    },
  );

  it('deve fechar o menu quando uma opção é escolhida', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.click(opcao(SEGUNDA));

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve devolver o foco ao botão quando uma opção é escolhida', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.click(opcao(SEGUNDA));

    // Assert
    expect(document.activeElement).toBe(botao());
  });

  it.each([
    { tecla: 'ArrowDown', de: PRIMEIRA, para: SEGUNDA, caso: 'a seta para baixo sai da primeira' },
    { tecla: 'ArrowDown', de: ULTIMA, para: PRIMEIRA, caso: 'a seta para baixo sai da última' },
    { tecla: 'ArrowUp', de: SEGUNDA, para: PRIMEIRA, caso: 'a seta para cima sai da segunda' },
    { tecla: 'ArrowUp', de: PRIMEIRA, para: ULTIMA, caso: 'a seta para cima sai da primeira' },
  ])('deve mover o foco para $para quando $caso', ({ tecla, de, para }) => {
    // Arrange
    abrirMenu();
    opcao(de).focus();

    // Act
    fireEvent.keyDown(opcao(de), { key: tecla });

    // Assert
    expect(document.activeElement).toBe(opcao(para));
  });

  it.each(['Enter', ' '])(
    'deve escolher a opção em foco quando a tecla %j é pressionada',
    (tecla) => {
      // Arrange
      const escolhida = OPCOES[2];
      abrirMenu();
      opcao(escolhida.rotulo).focus();

      // Act
      fireEvent.keyDown(opcao(escolhida.rotulo), { key: tecla });

      // Assert
      expect(localStorage.getItem(THEME_KEY)).toBe(escolhida.preferencia);
    },
  );

  it('deve manter o menu aberto quando uma tecla sem função é pressionada', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.keyDown(opcao(PRIMEIRA), { key: 'a' });

    // Assert
    expect(screen.getByRole('menu')).toBeDefined();
  });

  it('deve fechar o menu quando Esc é pressionado', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.keyDown(opcao(PRIMEIRA), { key: 'Escape' });

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve devolver o foco ao botão quando Esc é pressionado', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.keyDown(opcao(PRIMEIRA), { key: 'Escape' });

    // Assert
    expect(document.activeElement).toBe(botao());
  });

  it('deve manter a opção guardada quando Esc é pressionado', () => {
    // Arrange
    const guardada: ThemePreference = 'light';
    guardar(guardada);
    abrirMenu();

    // Act
    fireEvent.keyDown(opcao(ULTIMA), { key: 'Escape' });

    // Assert
    expect(localStorage.getItem(THEME_KEY)).toBe(guardada);
  });

  it('deve fechar o menu quando o clique é fora do controle', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.mouseDown(document.body);

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve manter o menu aberto quando o clique é dentro do menu', () => {
    // Arrange
    abrirMenu();

    // Act
    fireEvent.mouseDown(screen.getByRole('menu'));

    // Assert
    expect(screen.getByRole('menu')).toBeDefined();
  });

  it('deve ter área de toque de 44 px no botão', () => {
    // Act
    render(<ThemeToggle />);

    // Assert
    expect(botao().className).toEqual(
      expect.stringMatching(/(?=.*pointer-coarse:h-11)(?=.*pointer-coarse:w-11)/),
    );
  });

  it('deve ter área de toque de 44 px em cada opção do menu', () => {
    // Act
    abrirMenu();

    // Assert
    expect(opcoes().every((item) => item.className.includes('pointer-coarse:min-h-11'))).toBe(true);
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Arrange
    const extra = 'custom-class';

    // Act
    render(<ThemeToggle className={extra} />);

    // Assert
    expect(botao().className).toContain(extra);
  });
});
