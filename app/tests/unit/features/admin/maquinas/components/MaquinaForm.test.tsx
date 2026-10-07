/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MaquinaForm } from '@/features/admin/maquinas/components/MaquinaForm';
import { LIMITES } from '@/shared/lib/limites';

afterEach(cleanup);

describe('MaquinaForm', () => {
  it('renders the nome field', () => {
    const { container } = render(<MaquinaForm onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/nome da máquina/i)).toBeDefined();
  });

  it('pre-fills nomeInicial when provided', () => {
    const { container } = render(<MaquinaForm nomeInicial="FBOX" onSubmit={vi.fn()} />);
    expect(within(container).getByDisplayValue('FBOX')).toBeDefined();
  });

  it('does not submit with an empty nome', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<MaquinaForm onSubmit={onSubmit} />);
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the entered nome', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<MaquinaForm onSubmit={onSubmit} />);
    await userEvent.type(within(container).getByLabelText(/nome da máquina/i), 'FBOX');
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit.mock.calls[0][0]).toEqual({ nome: 'FBOX' });
  });

  it('shows a custom submit label', () => {
    const { container } = render(
      <MaquinaForm submitLabel="Salvar alterações" onSubmit={vi.fn()} />,
    );
    expect(within(container).getByRole('button', { name: 'Salvar alterações' })).toBeDefined();
  });
});

describe('MaquinaForm — limite de texto', () => {
  it('deve limitar o nome ao tamanho que a API grava', () => {
    // Arrange
    const esperado = LIMITES.maquinaNome;

    // Act
    const { container } = render(<MaquinaForm onSubmit={vi.fn()} />);
    const campo = within(container).getByLabelText(/nome da máquina/i) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
