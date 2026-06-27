/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

afterEach(cleanup);

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

  it('applies danger variant styles by default', () => {
    const { container } = render(<ConfirmDialog {...baseProps} />);
    expect(container.firstElementChild?.className).toContain('red');
  });

  it('applies warning variant styles', () => {
    const { container } = render(<ConfirmDialog {...baseProps} variant="warning" />);
    expect(container.firstElementChild?.className).toContain('amber');
  });
});
