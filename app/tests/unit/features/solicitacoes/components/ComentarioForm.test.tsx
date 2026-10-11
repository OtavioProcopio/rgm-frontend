/**
 * @vitest-environment jsdom
 */
import { cleanup, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ComentarioForm } from '@/features/solicitacoes/components/ComentarioForm';
import { LIMITES } from '@/shared/lib/limites';

afterEach(cleanup);

describe('ComentarioForm', () => {
  it('renders textarea and submit button', () => {
    const { container } = render(<ComentarioForm onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/comentário/i)).toBeDefined();
    expect(within(container).getByText(/enviar comentário/i)).toBeDefined();
  });

  it('shows pending state', () => {
    const { container } = render(<ComentarioForm isPending onSubmit={vi.fn()} />);
    expect(within(container).getByText(/enviando/i)).toBeDefined();
  });
});

describe('ComentarioForm — limite de texto', () => {
  it('deve limitar o comentário ao tamanho que a API grava', () => {
    // Arrange
    const esperado = LIMITES.textoLongo;

    // Act
    const { container } = render(<ComentarioForm onSubmit={vi.fn()} />);
    const campo = within(container).getByLabelText(/novo comentário/i) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});

describe('ComentarioForm — texto digitado', () => {
  async function digitarEEnviar(onSubmit: () => unknown) {
    const { container } = render(<ComentarioForm onSubmit={onSubmit} />);
    const tela = within(container);
    const campo = tela.getByLabelText(/novo comentário/i) as HTMLTextAreaElement;
    await userEvent.type(campo, 'Peça conferida');
    await userEvent.click(tela.getByRole('button', { name: /enviar comentário/i }));
    return campo;
  }

  it('deve limpar o campo quando o envio dá certo', async () => {
    // Act
    const campo = await digitarEEnviar(() => Promise.resolve(true));

    // Assert
    await waitFor(() => expect(campo.value).toBe(''));
  });

  it('deve manter o texto digitado quando o envio falha', async () => {
    // Arrange
    const falha = vi.fn().mockResolvedValue(false);

    // Act
    const campo = await digitarEEnviar(falha);

    // Assert
    await waitFor(() => expect(falha).toHaveBeenCalledTimes(1));
    expect(campo.value).toBe('Peça conferida');
  });
});
