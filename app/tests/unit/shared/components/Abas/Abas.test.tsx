/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { Abas, type AbaDaPeca } from '@/shared/components/Abas/Abas';

const ABAS: AbaDaPeca[] = [
  { id: 'resumo', rotulo: 'Resumo', conteudo: <p>Conteúdo do resumo</p> },
  { id: 'historico', rotulo: 'Histórico', conteudo: <p>Conteúdo do histórico</p> },
  { id: 'anexos', rotulo: 'Anexos', conteudo: <p>Conteúdo dos anexos</p> },
];

function renderizar(abaInicial?: string): void {
  render(<Abas abas={ABAS} rotulo="Seções da peça" abaInicial={abaInicial} />);
}

const aba = (nome: string): HTMLElement => screen.getByRole('tab', { name: nome });

describe('Abas', () => {
  afterEach(cleanup);

  it('deve expor tablist com aria-label, tabs e tabpanels quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const lista = screen.getByRole('tablist', { name: 'Seções da peça' });

    // Assert
    expect(lista).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
  });

  it('deve abrir a primeira aba quando abaInicial não é informada', () => {
    // Arrange
    renderizar();

    // Act
    const selecionada = aba('Resumo').getAttribute('aria-selected');

    // Assert
    expect(selecionada).toBe('true');
  });

  it('deve abrir a aba escolhida quando abaInicial é informada', () => {
    // Arrange
    renderizar('historico');

    // Act
    const selecionada = aba('Histórico').getAttribute('aria-selected');

    // Assert
    expect(selecionada).toBe('true');
    expect(aba('Resumo').getAttribute('aria-selected')).toBe('false');
  });

  it('deve marcar aria-selected somente na aba aberta quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const marcadas = screen
      .getAllByRole('tab')
      .filter((t) => t.getAttribute('aria-selected') === 'true');

    // Assert
    expect(marcadas).toEqual([aba('Resumo')]);
  });

  it('deve ligar cada aba ao seu painel quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const painel = screen.getByRole('tabpanel');

    // Assert
    expect(aba('Resumo').getAttribute('aria-controls')).toBe(painel.id);
    expect(painel.getAttribute('aria-labelledby')).toBe(aba('Resumo').id);
  });

  it('deve exibir o painel da aba clicada quando há clique', async () => {
    // Arrange
    renderizar();

    // Act
    await userEvent.click(aba('Histórico'));

    // Assert
    expect(screen.getByRole('tabpanel').textContent).toBe('Conteúdo do histórico');
    expect(aba('Histórico').getAttribute('aria-selected')).toBe('true');
  });

  it('deve manter painel inativo montado com hidden quando a aba não está aberta', () => {
    // Arrange
    renderizar();

    // Act
    const inativo = screen.getByText('Conteúdo do histórico').parentElement;

    // Assert
    expect(inativo?.getAttribute('role')).toBe('tabpanel');
    expect(inativo?.hasAttribute('hidden')).toBe(true);
  });

  it('deve dar tabIndex 0 somente à aba aberta quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const indices = screen.getAllByRole('tab').map((t) => t.tabIndex);

    // Assert
    expect(indices).toEqual([0, -1, -1]);
  });

  it('deve abrir e focar a aba seguinte quando pressiona seta para a direita', async () => {
    // Arrange
    renderizar();
    aba('Resumo').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(document.activeElement).toBe(aba('Histórico'));
    expect(aba('Histórico').getAttribute('aria-selected')).toBe('true');
  });

  it('deve voltar à primeira aba quando pressiona seta para a direita na última', async () => {
    // Arrange
    renderizar('anexos');
    aba('Anexos').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(document.activeElement).toBe(aba('Resumo'));
    expect(aba('Resumo').getAttribute('aria-selected')).toBe('true');
  });

  it('deve ir à última aba quando pressiona seta para a esquerda na primeira', async () => {
    // Arrange
    renderizar();
    aba('Resumo').focus();

    // Act
    await userEvent.keyboard('{ArrowLeft}');

    // Assert
    expect(document.activeElement).toBe(aba('Anexos'));
    expect(aba('Anexos').getAttribute('aria-selected')).toBe('true');
  });

  it('deve ir à primeira aba quando pressiona Home', async () => {
    // Arrange
    renderizar('anexos');
    aba('Anexos').focus();

    // Act
    await userEvent.keyboard('{Home}');

    // Assert
    expect(document.activeElement).toBe(aba('Resumo'));
    expect(aba('Resumo').getAttribute('aria-selected')).toBe('true');
  });

  it('deve ir à última aba quando pressiona End', async () => {
    // Arrange
    renderizar();
    aba('Resumo').focus();

    // Act
    await userEvent.keyboard('{End}');

    // Assert
    expect(document.activeElement).toBe(aba('Anexos'));
    expect(aba('Anexos').getAttribute('aria-selected')).toBe('true');
  });

  it('deve manter a aba aberta quando pressiona tecla fora das setas', async () => {
    // Arrange
    renderizar();
    aba('Resumo').focus();

    // Act
    await userEvent.keyboard('{ArrowDown}a');

    // Assert
    expect(document.activeElement).toBe(aba('Resumo'));
    expect(aba('Resumo').getAttribute('aria-selected')).toBe('true');
  });

  it('deve renderizar a lista sem abas quando abas é vazio', () => {
    // Arrange
    render(<Abas abas={[]} rotulo="Seções da peça" />);

    // Act
    const lista = screen.getByRole('tablist', { name: 'Seções da peça' });

    // Assert
    expect(lista.children).toHaveLength(0);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('deve ter alvo de toque de 44 px quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const abas = screen.getAllByRole('tab');

    // Assert
    expect(abas.every((t) => t.classList.contains('pointer-coarse:min-h-11'))).toBe(true);
  });

  it('deve não usar outline-none quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const abas = screen.getAllByRole('tab');

    // Assert
    expect(abas.some((t) => t.className.includes('outline-none'))).toBe(false);
  });

  it('deve não usar transição fora de motion-safe quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const soltas = screen
      .getAllByRole('tab')
      .flatMap((t) => Array.from(t.classList))
      .filter((c) => /^(transition|duration|animate)/.test(c));

    // Assert
    expect(soltas).toEqual([]);
  });
});
