/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { BarraDeAbas } from '@/app/layouts/BarraDeAbas';
import { destinosDeNavegacao, type DestinoDeNavegacao } from '@/shared/lib/navegacao';

function renderizar(destinos: DestinoDeNavegacao[], rota: string = '/app/dashboard') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <BarraDeAbas destinos={destinos} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('BarraDeAbas', () => {
  it('deve mostrar os 5 destinos com ícone e rótulo quando o perfil é administrador', () => {
    // Arrange
    const destinos = destinosDeNavegacao('ADMINISTRADOR');

    // Act
    renderizar(destinos);

    // Assert
    const links = within(screen.getByRole('navigation')).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(destinos.map((d) => d.rotulo));
    links.forEach((link) => {
      expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('deve mostrar só os 3 destinos do operador quando o perfil é operador', () => {
    // Arrange
    const destinos = destinosDeNavegacao('OPERADOR');

    // Act
    renderizar(destinos);

    // Assert
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('link', { name: 'Usuários' })).toBeNull();
  });

  it('deve ter uma coluna por destino quando a grade é montada', () => {
    // Arrange
    const destinos = destinosDeNavegacao('ADMINISTRADOR');

    // Act
    renderizar(destinos);

    // Assert
    const grade = screen.getAllByRole('link')[0].parentElement as HTMLElement;
    expect(grade.style.gridTemplateColumns).toBe('repeat(5, minmax(0, 1fr))');
  });

  it('deve ficar fixa na base e sumir em tela larga quando renderizada', () => {
    // Arrange
    const destinos = destinosDeNavegacao('OPERADOR');

    // Act
    renderizar(destinos);

    // Assert
    const nav = screen.getByRole('navigation');
    expect(nav.classList.contains('fixed')).toBe(true);
    expect(nav.classList.contains('bottom-0')).toBe(true);
    expect(nav.classList.contains('lg:hidden')).toBe(true);
  });

  it('deve reservar a área segura inferior quando renderizada', () => {
    // Arrange
    const destinos = destinosDeNavegacao('OPERADOR');

    // Act
    renderizar(destinos);

    // Assert
    expect(
      screen.getByRole('navigation').classList.contains('pb-[env(safe-area-inset-bottom)]'),
    ).toBe(true);
  });

  it('deve dar altura mínima de 56 px a cada aba quando renderizada', () => {
    // Arrange
    const destinos = destinosDeNavegacao('ADMINISTRADOR');

    // Act
    renderizar(destinos);

    // Assert
    screen.getAllByRole('link').forEach((link) => {
      expect(link.classList.contains('min-h-14')).toBe(true);
    });
  });

  it('deve marcar só a aba da rota atual como ativa quando a rota é solicitações', () => {
    // Arrange
    const destinos = destinosDeNavegacao('OPERADOR');

    // Act
    renderizar(destinos, '/app/solicitacoes');

    // Assert
    const ativa = screen.getByRole('link', { name: 'Solicitações' });
    expect(ativa.getAttribute('aria-current')).toBe('page');
    expect(ativa.classList.contains('text-accent')).toBe(true);
    expect(ativa.classList.contains('border-accent')).toBe(true);
    expect(ativa.classList.contains('font-semibold')).toBe(false);
    const inativa = screen.getByRole('link', { name: 'Dashboard' });
    expect(inativa.getAttribute('aria-current')).toBeNull();
    expect(inativa.classList.contains('text-fg-muted')).toBe(true);
  });

  it('deve expor o nome acessível "Navegação principal" quando renderizada', () => {
    // Arrange
    const destinos = destinosDeNavegacao('OPERADOR');

    // Act
    renderizar(destinos);

    // Assert
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeTruthy();
  });

  it('deve usar texto de 11 px nas abas quando o administrador tem 5 destinos em tela estreita', () => {
    // Arrange
    const destinos = destinosDeNavegacao('ADMINISTRADOR');

    // Act
    renderizar(destinos);

    // Assert
    screen.getAllByRole('link').forEach((link) => {
      expect(link.classList.contains('text-[11px]')).toBe(true);
      expect(link.classList.contains('text-xs')).toBe(false);
    });
  });

  it('deve manter o contorno de foco do projeto quando a aba recebe o foco do teclado', () => {
    // Arrange
    const destinos = destinosDeNavegacao('ADMINISTRADOR');

    // Act
    renderizar(destinos);

    // Assert
    screen.getAllByRole('link').forEach((link) => {
      const desligadas = Array.from(link.classList).filter(
        (classe) => classe.includes('outline-none') || classe.includes('ring-accent'),
      );
      expect(desligadas).toEqual([]);
    });
  });

  it('deve renderizar sem links quando a lista de destinos é vazia', () => {
    // Arrange
    const destinos: DestinoDeNavegacao[] = [];

    // Act
    renderizar(destinos);

    // Assert
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
