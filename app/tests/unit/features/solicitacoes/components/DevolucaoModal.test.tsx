/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DevolucaoModal } from '@/features/solicitacoes/components/DevolucaoModal';
import { LIMITES } from '@/shared/lib/limites';

afterEach(cleanup);

describe('DevolucaoModal', () => {
  it('renders title and description', () => {
    const { container } = render(<DevolucaoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(within(container).getByText(/devolver solicitação/i)).toBeDefined();
    expect(within(container).getByText(/em andamento/i)).toBeDefined();
  });

  it('renders motivo textarea and prioridade select', () => {
    const { container } = render(<DevolucaoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(within(container).getByLabelText(/motivo/i)).toBeDefined();
    expect(within(container).getByLabelText(/prioridade/i)).toBeDefined();
  });

  it('renders action buttons', () => {
    const { container } = render(<DevolucaoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(within(container).getByText('Cancelar')).toBeDefined();
    expect(within(container).getByText('Confirmar devolução')).toBeDefined();
  });

  it('shows devolvendo when pending', () => {
    const { container } = render(
      <DevolucaoModal isPending onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Devolvendo...')).toBeDefined();
  });
});

describe('DevolucaoModal — limite de texto', () => {
  it('deve limitar o motivo ao tamanho que a API grava', () => {
    // Arrange
    const esperado = LIMITES.textoLongo;

    // Act
    const { container } = render(<DevolucaoModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    const campo = within(container).getByLabelText(/motivo da devolução/i) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
