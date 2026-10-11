/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SecaoRecolhivel } from '@/shared/components/SecaoRecolhivel/SecaoRecolhivel';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

function renderizar(id = 'filtros', resumo?: string) {
  return render(
    <SecaoRecolhivel id={id} titulo="Filtros" resumo={resumo}>
      <input aria-label="campo" />
    </SecaoRecolhivel>,
  );
}

describe('SecaoRecolhivel', () => {
  it('deve manter o contorno de foco do projeto quando o título recebe o foco do teclado', () => {
    // Arrange
    renderizar();

    // Act
    const desligadas = Array.from(screen.getByRole('button').classList).filter(
      (classe) => classe.includes('outline-none') || classe.includes('ring-accent'),
    );

    // Assert
    expect(desligadas).toEqual([]);
  });

  it('deve começar aberta quando não há estado guardado', () => {
    // Arrange
    renderizar();

    // Act
    const conteudo = screen.getByLabelText('campo').parentElement as HTMLElement;

    // Assert
    expect(conteudo.hidden).toBe(false);
  });

  it('deve começar fechada quando abertaPorPadrao é falso e não há estado guardado', () => {
    // Arrange
    const secao = (
      <SecaoRecolhivel id="tabela" titulo="Valores" abertaPorPadrao={false}>
        <input aria-label="campo" />
      </SecaoRecolhivel>
    );

    // Act
    render(secao);

    // Assert
    const conteudo = screen.getByLabelText('campo', { selector: 'input' }).parentElement;
    expect(conteudo?.hidden).toBe(true);
  });

  it('deve respeitar o estado guardado quando abertaPorPadrao é falso', () => {
    // Arrange
    const secao = (
      <SecaoRecolhivel id="tabela" titulo="Valores" abertaPorPadrao={false}>
        <input aria-label="campo" />
      </SecaoRecolhivel>
    );
    const primeira = render(secao);
    fireEvent.click(screen.getByRole('button'));
    primeira.unmount();

    // Act
    render(secao);

    // Assert
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('deve expor aria-expanded verdadeiro quando está aberta', () => {
    // Arrange
    renderizar();

    // Act
    const botao = screen.getByRole('button');

    // Assert
    expect(botao.getAttribute('aria-expanded')).toBe('true');
  });

  it('deve apontar aria-controls para o conteúdo quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const botao = screen.getByRole('button');
    const conteudo = screen.getByLabelText('campo').parentElement as HTMLElement;

    // Assert
    expect(botao.getAttribute('aria-controls')).toBe(conteudo.id);
    expect(conteudo.id).not.toBe('');
  });

  it('deve recolher quando o botão é clicado', () => {
    // Arrange
    renderizar();
    const botao = screen.getByRole('button');

    // Act
    fireEvent.click(botao);

    // Assert
    const conteudo = screen.getByLabelText('campo', { selector: 'input' }).parentElement;
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    expect(conteudo?.hidden).toBe(true);
  });

  it('deve reabrir quando o botão é acionado duas vezes', () => {
    // Arrange
    renderizar();
    const botao = screen.getByRole('button');

    // Act
    fireEvent.click(botao);
    fireEvent.click(botao);

    // Assert
    expect(botao.getAttribute('aria-expanded')).toBe('true');
  });

  it('deve ser um botão nativo acionável por teclado quando renderizada', () => {
    // Arrange
    renderizar();

    // Act
    const botao = screen.getByRole('button');

    // Assert
    expect(botao.tagName).toBe('BUTTON');
    expect(botao.getAttribute('type')).toBe('button');
  });

  it('deve mostrar o resumo quando está fechada', () => {
    // Arrange
    renderizar('filtros', '3 filtros ativos');

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(screen.getByRole('button').textContent).toBe('3 filtros ativos');
  });

  it('deve mostrar o título e não o resumo quando está aberta', () => {
    // Arrange
    renderizar('filtros', '3 filtros ativos');

    // Act
    const texto = screen.getByRole('button').textContent;

    // Assert
    expect(texto).toBe('Filtros');
  });

  it('deve mostrar o título quando está fechada e não há resumo', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(screen.getByRole('button').textContent).toBe('Filtros');
  });

  it('deve manter o conteúdo montado com o valor digitado quando está fechada', () => {
    // Arrange
    renderizar();
    const campo = screen.getByLabelText('campo') as HTMLInputElement;
    fireEvent.change(campo, { target: { value: 'abc' } });

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    const depois = screen.getByLabelText('campo', { selector: 'input' }) as HTMLInputElement;
    expect(depois.value).toBe('abc');
  });

  it('deve nascer fechada já no primeiro render quando o estado guardado é fechada', () => {
    // Arrange
    localStorage.setItem('rgm.secao.filtros', 'fechada');

    // Act
    const primeiroRender = renderToString(
      <SecaoRecolhivel id="filtros" titulo="Filtros">
        <input aria-label="campo" />
      </SecaoRecolhivel>,
    );

    // Assert
    expect(primeiroRender).toContain('aria-expanded="false"');
  });

  it('deve guardar estados separados quando os ids são diferentes', () => {
    // Arrange
    localStorage.setItem('rgm.secao.a', 'fechada');

    // Act
    render(
      <>
        <SecaoRecolhivel id="a" titulo="A">
          <p>a</p>
        </SecaoRecolhivel>
        <SecaoRecolhivel id="b" titulo="B">
          <p>b</p>
        </SecaoRecolhivel>
      </>,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('deve gravar fechada no armazenamento quando recolhe', () => {
    // Arrange
    renderizar('filtros');

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(localStorage.getItem('rgm.secao.filtros')).toBe('fechada');
  });
});
