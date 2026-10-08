/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BarraLateral } from '@/app/layouts/BarraLateral';
import type { DestinoDeNavegacao } from '@/shared/lib/navegacao';

const CHAVE = 'rgm.barraLateral';
const IDENTIFICACAO = 'Portal de gestão';

const DESTINOS: DestinoDeNavegacao[] = [
  { id: 'dashboard', to: '/app/dashboard', rotulo: 'Dashboard', end: false },
  { id: 'solicitacoes', to: '/app/solicitacoes', rotulo: 'Solicitações', end: false },
];

function renderizar(rota: string = '/app/dashboard') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <BarraLateral destinos={DESTINOS} identificacao={IDENTIFICACAO} />
    </MemoryRouter>,
  );
}

function botao(): HTMLElement {
  return screen.getByRole('button', { name: /menu lateral/ });
}

describe('BarraLateral', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('deve iniciar expandida quando nao ha preferencia guardada', () => {
    // Arrange
    // Act
    const { container } = renderizar();

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('true');
    expect(botao().getAttribute('aria-label')).toBe('Recolher menu lateral');
    expect(container.querySelector('aside')?.classList.contains('lg:w-[280px]')).toBe(true);
  });

  it('deve manter os links acessiveis por nome quando recolhida', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Solicitações' })).toBeTruthy();
    expect(screen.getAllByText('Dashboard')[0]?.classList.contains('sr-only')).toBe(true);
  });

  it('deve anunciar expandir e aria-expanded falso quando recolhida', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('false');
    expect(botao().getAttribute('aria-label')).toBe('Expandir menu lateral');
  });

  it('deve usar a largura de 72px quando recolhida', () => {
    // Arrange
    const { container } = renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(container.querySelector('aside')?.classList.contains('lg:w-[72px]')).toBe(true);
    expect(container.querySelector('aside')?.classList.contains('lg:w-[280px]')).toBe(false);
  });

  it('deve omitir logo e identificacao quando recolhida', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(screen.queryByAltText('RGM Auto Parts')).toBeNull();
    expect(screen.queryByText(IDENTIFICACAO)).toBeNull();
  });

  it('deve mostrar logo e identificacao quando expandida', () => {
    // Arrange
    // Act
    renderizar();

    // Assert
    expect(screen.getByAltText('RGM Auto Parts')).toBeTruthy();
    expect(screen.getByText(IDENTIFICACAO)).toBeTruthy();
  });

  it('deve ter etiqueta visual que aparece no foco e no ponteiro quando recolhida', () => {
    // Arrange
    const { container } = renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    const etiqueta = container.querySelector('nav [aria-hidden="true"].absolute');
    expect(etiqueta?.textContent).toBe('Dashboard');
    expect(etiqueta?.classList.contains('hidden')).toBe(true);
    expect(etiqueta?.classList.contains('group-hover:block')).toBe(true);
    expect(etiqueta?.classList.contains('group-focus-visible:block')).toBe(true);
  });

  it('deve marcar o destino da rota atual quando ha rota ativa', () => {
    // Arrange
    // Act
    renderizar('/app/solicitacoes');

    // Assert
    expect(screen.getByRole('link', { name: 'Solicitações' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' }).hasAttribute('aria-current')).toBe(
      false,
    );
  });

  it('deve recolher e manter o foco no botao quando acionado pelo teclado', () => {
    // Arrange
    renderizar();
    botao().focus();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(botao());
  });

  it('deve ignorar teclas fora do botao quando Ctrl+B e pressionado', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.keyDown(document, { key: 'b', ctrlKey: true });

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('true');
  });

  it('deve renderizar recolhida no primeiro render quando a preferencia guardada e recolhida', () => {
    // Arrange
    localStorage.setItem(CHAVE, 'recolhida');

    // Act
    const { container } = renderizar();

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('aside')?.classList.contains('lg:w-[72px]')).toBe(true);
  });

  it('deve gravar recolhida quando o menu e recolhido', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(localStorage.getItem(CHAVE)).toBe('recolhida');
  });

  it('deve gravar expandida quando o menu e expandido', () => {
    // Arrange
    localStorage.setItem(CHAVE, 'recolhida');
    renderizar();

    // Act
    fireEvent.click(botao());

    // Assert
    expect(localStorage.getItem(CHAVE)).toBe('expandida');
  });

  it('deve animar a largura somente sob motion-safe quando houver transicao', () => {
    // Arrange
    const { container } = renderizar();

    // Act
    const classes = (container.querySelector('aside')?.className ?? '').split(/\s+/);

    // Assert
    const transicoes = classes.filter((c) => c.includes('transition-') || c.includes('duration-'));
    expect(transicoes.length).toBeGreaterThan(0);
    expect(transicoes.every((c) => c.startsWith('motion-safe:'))).toBe(true);
  });

  it('deve manter aria-controls apontando para a navegacao quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const alvo = botao().getAttribute('aria-controls');

    // Assert
    expect(screen.getByRole('navigation', { name: 'Navegação principal' }).id).toBe(alvo);
  });
});
