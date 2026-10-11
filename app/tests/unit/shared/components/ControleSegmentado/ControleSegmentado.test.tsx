/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ControleSegmentado,
  type OpcaoDoControle,
} from '@/shared/components/ControleSegmentado/ControleSegmentado';

const OPCOES: OpcaoDoControle<string>[] = [
  { valor: 'dia', rotulo: 'Dia' },
  { valor: 'semana', rotulo: 'Semana' },
  { valor: 'mes', rotulo: 'Mês' },
];

const OPCOES_NUMERICAS: OpcaoDoControle<number>[] = [
  { valor: 7, rotulo: '7 dias' },
  { valor: 30, rotulo: '30 dias' },
  { valor: 90, rotulo: '90 dias' },
];

function renderizar(valor: string = 'dia') {
  const onChange = vi.fn<(valor: string) => void>();
  render(<ControleSegmentado rotulo="Período" opcoes={OPCOES} valor={valor} onChange={onChange} />);
  return onChange;
}

const opcao = (nome: string): HTMLElement =>
  screen.getByRole('radio', { name: new RegExp(`^${nome}`) });

describe('ControleSegmentado', () => {
  afterEach(cleanup);

  it('deve expor radiogroup com o rótulo como aria-label quando renderizado', () => {
    // Arrange
    renderizar('semana');

    // Act
    const grupo = screen.queryByRole('radiogroup', { name: 'Período' });

    // Assert
    expect(grupo).not.toBeNull();
  });

  it('deve marcar aria-checked somente na opção escolhida quando renderizado', () => {
    // Arrange
    renderizar('semana');

    // Act
    const marcados = screen.getAllByRole('radio').map((r) => r.getAttribute('aria-checked'));

    // Assert
    expect(marcados).toEqual(['false', 'true', 'false']);
  });

  it('deve dar tabIndex 0 somente à opção escolhida quando renderizado', () => {
    // Arrange
    renderizar('semana');

    // Act
    const indices = screen.getAllByRole('radio').map((r) => r.tabIndex);

    // Assert
    expect(indices).toEqual([-1, 0, -1]);
  });

  it('deve exibir o texto (selecionada) somente na opção escolhida quando renderizado', () => {
    // Arrange
    renderizar('mes');

    // Act
    const comTexto = screen
      .getAllByRole('radio')
      .map((r) => r.textContent?.includes('(selecionada)'));

    // Assert
    expect(comTexto).toEqual([false, false, true]);
  });

  it('deve chamar onChange uma vez quando clica em outra opção', async () => {
    // Arrange
    const onChange = renderizar('dia');

    // Act
    await userEvent.click(opcao('Mês'));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onChange com o valor da opção quando clica em outra opção', async () => {
    // Arrange
    const onChange = renderizar('dia');

    // Act
    await userEvent.click(opcao('Mês'));

    // Assert
    expect(onChange).toHaveBeenCalledWith('mes');
  });

  it('deve não chamar onChange quando clica na opção já escolhida', async () => {
    // Arrange
    const onChange = renderizar('dia');

    // Act
    await userEvent.click(opcao('Dia'));

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve chamar onChange uma vez quando pressiona seta para a direita', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onChange com a próxima opção quando pressiona seta para a direita', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('semana');
  });

  it('deve focar a próxima opção quando pressiona seta para a direita', async () => {
    // Arrange
    renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(document.activeElement).toBe(opcao('Semana'));
  });

  it('deve chamar onChange com a próxima opção quando pressiona seta para baixo', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowDown}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('semana');
  });

  it('deve focar a próxima opção quando pressiona seta para baixo', async () => {
    // Arrange
    renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowDown}');

    // Assert
    expect(document.activeElement).toBe(opcao('Semana'));
  });

  it('deve chamar onChange com a primeira opção quando pressiona seta para a direita na última', async () => {
    // Arrange
    const onChange = renderizar('mes');
    opcao('Mês').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('dia');
  });

  it('deve focar a primeira opção quando pressiona seta para a direita na última', async () => {
    // Arrange
    renderizar('mes');
    opcao('Mês').focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(document.activeElement).toBe(opcao('Dia'));
  });

  it('deve chamar onChange com a última opção quando pressiona seta para a esquerda na primeira', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowLeft}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('mes');
  });

  it('deve focar a última opção quando pressiona seta para a esquerda na primeira', async () => {
    // Arrange
    renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{ArrowLeft}');

    // Assert
    expect(document.activeElement).toBe(opcao('Mês'));
  });

  it('deve chamar onChange com a opção anterior quando pressiona seta para cima', async () => {
    // Arrange
    const onChange = renderizar('semana');
    opcao('Semana').focus();

    // Act
    await userEvent.keyboard('{ArrowUp}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('dia');
  });

  it('deve focar a opção anterior quando pressiona seta para cima', async () => {
    // Arrange
    renderizar('semana');
    opcao('Semana').focus();

    // Act
    await userEvent.keyboard('{ArrowUp}');

    // Assert
    expect(document.activeElement).toBe(opcao('Dia'));
  });

  it('deve chamar onChange com a primeira opção quando pressiona Home', async () => {
    // Arrange
    const onChange = renderizar('mes');
    opcao('Mês').focus();

    // Act
    await userEvent.keyboard('{Home}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('dia');
  });

  it('deve focar a primeira opção quando pressiona Home', async () => {
    // Arrange
    renderizar('mes');
    opcao('Mês').focus();

    // Act
    await userEvent.keyboard('{Home}');

    // Assert
    expect(document.activeElement).toBe(opcao('Dia'));
  });

  it('deve chamar onChange com a última opção quando pressiona End', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{End}');

    // Assert
    expect(onChange).toHaveBeenCalledWith('mes');
  });

  it('deve focar a última opção quando pressiona End', async () => {
    // Arrange
    renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('{End}');

    // Assert
    expect(document.activeElement).toBe(opcao('Mês'));
  });

  it('deve não chamar onChange quando pressiona tecla irrelevante', async () => {
    // Arrange
    const onChange = renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('a');

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve manter o foco na opção atual quando pressiona tecla irrelevante', async () => {
    // Arrange
    renderizar('dia');
    opcao('Dia').focus();

    // Act
    await userEvent.keyboard('a');

    // Assert
    expect(document.activeElement).toBe(opcao('Dia'));
  });

  it('deve ter alvo de toque de 44 px em cada opção quando renderizado', () => {
    // Arrange
    renderizar();

    // Act
    const radios = screen.getAllByRole('radio');

    // Assert
    expect(radios.every((r) => r.classList.contains('pointer-coarse:min-h-11'))).toBe(true);
  });

  it('deve devolver número a onChange quando os valores são numéricos', async () => {
    // Arrange
    const onChange = vi.fn<(valor: number) => void>();
    render(
      <ControleSegmentado rotulo="Dias" opcoes={OPCOES_NUMERICAS} valor={7} onChange={onChange} />,
    );

    // Act
    await userEvent.click(screen.getByRole('radio', { name: /^90 dias/ }));

    // Assert
    expect(onChange).toHaveBeenCalledWith(90);
  });

  it('deve chamar onChange uma vez quando os valores são numéricos e clica em outra opção', async () => {
    // Arrange
    const onChange = vi.fn<(valor: number) => void>();
    render(
      <ControleSegmentado rotulo="Dias" opcoes={OPCOES_NUMERICAS} valor={7} onChange={onChange} />,
    );

    // Act
    await userEvent.click(screen.getByRole('radio', { name: /^90 dias/ }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
