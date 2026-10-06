/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
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
