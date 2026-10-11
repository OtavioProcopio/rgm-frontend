/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';

afterEach(cleanup);

const VARIANTES = [
  { variant: 'danger', fundo: 'bg-danger-soft', texto: 'text-danger-fg', botao: 'bg-danger' },
  { variant: 'warning', fundo: 'bg-warning-soft', texto: 'text-warning-fg', botao: 'bg-warning' },
] as const;

describe('ConfirmDialog', () => {
  const baseProps = {
    title: 'Confirmar ação',
    message: 'Você tem certeza?',
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('renders title and message', () => {
    const { container } = render(<ConfirmDialog {...baseProps} />);
    expect(within(container).getByText('Confirmar ação')).toBeDefined();
    expect(within(container).getByText('Você tem certeza?')).toBeDefined();
  });

  it('uses "Confirmar" as default confirm label', () => {
    const { container } = render(<ConfirmDialog {...baseProps} />);
    expect(within(container).getByRole('button', { name: 'Confirmar' })).toBeDefined();
  });

  it('renders custom confirm label', () => {
    const { container } = render(<ConfirmDialog {...baseProps} confirmLabel="Excluir" />);
    expect(within(container).getByRole('button', { name: 'Excluir' })).toBeDefined();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const { container } = render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(within(container).getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);
    await userEvent.click(within(container).getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows "Aguarde..." and disables buttons while isPending', () => {
    const { container } = render(<ConfirmDialog {...baseProps} isPending />);
    const buttons = within(container).getAllByRole('button');
    expect(buttons.every((b) => b.hasAttribute('disabled'))).toBe(true);
    expect(within(container).getByText('Aguarde...')).toBeDefined();
  });

  it.each(VARIANTES)(
    'deve mostrar o aviso com o fundo e o texto do papel quando a variante é $variant',
    ({ variant, fundo, texto }) => {
      // Act
      const { container } = render(<ConfirmDialog {...baseProps} variant={variant} />);

      // Assert
      const aviso = within(container).getByRole('dialog').firstElementChild!;
      expect(aviso.className.split(' ')).toEqual(expect.arrayContaining([fundo, texto]));
    },
  );

  it('deve mostrar o aviso de perigo quando a variante não é informada', () => {
    // Arrange
    const perigo = VARIANTES[0];

    // Act
    const { container } = render(<ConfirmDialog {...baseProps} />);

    // Assert
    const aviso = within(container).getByRole('dialog').firstElementChild!;
    expect(aviso.className.split(' ')).toContain(perigo.fundo);
  });

  it.each(VARIANTES)(
    'deve confirmar com o botão da cor cheia do papel quando a variante é $variant',
    ({ variant, botao }) => {
      // Act
      const { container } = render(<ConfirmDialog {...baseProps} variant={variant} />);

      // Assert
      const confirmar = within(container).getByRole('button', { name: 'Confirmar' });
      expect(confirmar.className.split(' ')).toContain(botao);
    },
  );

  it('deve abrir como diálogo modal com o título como nome', () => {
    // Act
    render(<ConfirmDialog {...baseProps} />);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: baseProps.title });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve pôr o foco inicial em Cancelar quando abre', () => {
    // Act
    render(<ConfirmDialog {...baseProps} />);

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
  });

  it('deve desistir em vez de confirmar quando Enter é apertado logo ao abrir', async () => {
    // Arrange
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);

    // Act
    await userEvent.keyboard('{Enter}');

    // Assert
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('deve cancelar quando Esc é apertado', async () => {
    // Arrange
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('deve continuar aberto quando Esc é apertado durante o envio', async () => {
    // Arrange
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} isPending />);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('deve usar o rótulo informado no botão de desistir quando recebe cancelLabel', () => {
    // Arrange
    const rotulo = 'Continuar editando';

    // Act
    render(<ConfirmDialog {...baseProps} cancelLabel={rotulo} />);

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: rotulo }));
  });
});
