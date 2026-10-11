/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TipoModeloForm } from '@/features/admin/tiposModelo/components/TipoModeloForm';
import { LIMITES } from '@/shared/lib/limites';

afterEach(cleanup);

describe('TipoModeloForm', () => {
  it('renders the nome field', () => {
    const { container } = render(<TipoModeloForm onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/nome do tipo de modelo/i)).toBeDefined();
  });

  it('pre-fills nomeInicial when provided', () => {
    const { container } = render(<TipoModeloForm nomeInicial="FBOX" onSubmit={vi.fn()} />);
    expect(within(container).getByDisplayValue('FBOX')).toBeDefined();
  });

  it('does not submit with an empty nome', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<TipoModeloForm onSubmit={onSubmit} />);
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the entered nome', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<TipoModeloForm onSubmit={onSubmit} />);
    await userEvent.type(within(container).getByLabelText(/nome do tipo de modelo/i), 'FBOX');
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit.mock.calls[0][0]).toEqual({ nome: 'FBOX' });
  });

  it('shows a custom submit label', () => {
    const { container } = render(
      <TipoModeloForm submitLabel="Salvar alterações" onSubmit={vi.fn()} />,
    );
    expect(within(container).getByRole('button', { name: 'Salvar alterações' })).toBeDefined();
  });
});

describe('TipoModeloForm — limite de texto', () => {
  it('deve limitar o nome ao tamanho que a API grava', () => {
    // Arrange
    const esperado = LIMITES.tipoModeloNome;

    // Act
    const { container } = render(<TipoModeloForm onSubmit={vi.fn()} />);
    const campo = within(container).getByLabelText(
      /nome do tipo de modelo/i,
    ) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
