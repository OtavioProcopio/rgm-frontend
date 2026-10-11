/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EncerramentoModal } from '@/features/solicitacoes/components/EncerramentoModal';
import { LIMITES } from '@/shared/lib/limites';

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('EncerramentoModal — cores por papel', () => {
  it('deve usar o fundo e a borda de sucesso quando a opção é concluir', () => {
    // Act
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-success-soft', 'border-success']),
    );
  });

  it('deve usar o fundo e a borda de perigo quando a opção é cancelar', () => {
    // Act
    const { container } = render(
      <EncerramentoModal podeConcluir={false} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-danger-soft', 'border-danger']),
    );
  });

  it('deve usar o fundo cheio de perigo no botão de confirmar quando a opção é cancelar', () => {
    // Act
    const { container } = render(
      <EncerramentoModal podeConcluir={false} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    const confirmar = within(container).getByRole('button', { name: 'Cancelar solicitação' });

    // Assert
    expect(classes(confirmar)).toEqual(expect.arrayContaining(['bg-danger', 'text-on-solid']));
  });

  it('deve usar o texto principal quando mostra o título', () => {
    // Act
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);

    // Assert
    expect(classes(within(container).getByRole('heading'))).toContain('text-fg');
  });
});

describe('EncerramentoModal', () => {
  it('renders encerrar title when podeConcluir', () => {
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(within(container).getByText(/encerrar solicitação/i)).toBeDefined();
  });

  it('renders cancelar title when not podeConcluir', () => {
    const { container } = render(
      <EncerramentoModal podeConcluir={false} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    const heading = container.querySelector('h3')!;
    expect(heading.textContent).toMatch(/cancelar solicitação/i);
  });

  it('renders radio options when podeConcluir', () => {
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
  });

  it('renders textarea for comentário', () => {
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(within(container).getByLabelText(/comentário final/i)).toBeDefined();
  });

  it('shows submitting state', () => {
    const { container } = render(
      <EncerramentoModal isPending onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/encerrando/i)).toBeDefined();
  });
});

describe('EncerramentoModal — limite de texto', () => {
  it('deve limitar o comentário final ao tamanho que a API grava', () => {
    // Arrange
    const esperado = LIMITES.textoLongo;

    // Act
    const { container } = render(<EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    const campo = within(container).getByLabelText(
      /comentário final|motivo do cancelamento/i,
    ) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
