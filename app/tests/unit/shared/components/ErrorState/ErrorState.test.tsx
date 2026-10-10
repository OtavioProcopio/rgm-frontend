/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

afterEach(cleanup);

describe('ErrorState', () => {
  it('renders the default title when none provided', () => {
    const { container } = render(<ErrorState />);
    expect(within(container).getByText('Não foi possível carregar os dados.')).toBeDefined();
  });

  it('renders a custom title', () => {
    const { container } = render(<ErrorState title="Erro ao salvar" />);
    expect(within(container).getByText('Erro ao salvar')).toBeDefined();
  });

  it('renders description when provided', () => {
    const { container } = render(<ErrorState description="Tente novamente mais tarde." />);
    expect(within(container).getByText('Tente novamente mais tarde.')).toBeDefined();
  });

  it('does not render description element when omitted', () => {
    const { container } = render(<ErrorState title="Erro" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('deve omitir o botão quando onRetry não for informado', () => {
    // Arrange
    const { container } = render(<ErrorState title="Erro" />);

    // Act
    const botao = within(container).queryByRole('button');

    // Assert
    expect(botao).toBeNull();
  });

  it('deve mostrar o botão Tentar novamente quando onRetry for informado', () => {
    // Arrange
    const { container } = render(<ErrorState onRetry={vi.fn()} />);

    // Act
    const botao = within(container).queryByRole('button', { name: 'Tentar novamente' });

    // Assert
    expect(botao).not.toBeNull();
  });

  it('deve chamar onRetry uma vez quando o botão for clicado', async () => {
    // Arrange
    const onRetry = vi.fn();
    const { container } = render(<ErrorState onRetry={onRetry} />);

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('deve expor role alert quando renderizado', () => {
    // Arrange
    const { container } = render(<ErrorState title="Erro" />);

    // Act
    const alerta = within(container).queryByRole('alert');

    // Assert
    expect(alerta).not.toBeNull();
  });

  it('deve não renderizar parágrafo quando houver onRetry e não houver descrição', () => {
    // Arrange
    const { container } = render(<ErrorState title="Erro" onRetry={vi.fn()} />);

    // Act
    const paragrafo = container.querySelector('p');

    // Assert
    expect(paragrafo).toBeNull();
  });

  it('deve renderizar o conteúdo de action quando for informado', () => {
    // Arrange
    const { container } = render(<ErrorState title="Erro" action={<a href="/quadro">Voltar</a>} />);

    // Act
    const link = within(container).queryByRole('link', { name: 'Voltar' });

    // Assert
    expect(link).not.toBeNull();
  });

  it('deve renderizar só o título quando não há descrição, nova tentativa nem action', () => {
    // Arrange
    const { container } = render(<ErrorState title="Erro" />);

    // Act
    const filhos = container.firstElementChild?.children;

    // Assert
    expect(filhos).toHaveLength(1);
  });
});
