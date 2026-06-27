/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EncerramentoModal } from './EncerramentoModal';

afterEach(cleanup);

describe('EncerramentoModal', () => {
  it('renders encerrar title when podeConcluir', () => {
    const { container } = render(
      <EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
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
    const { container } = render(
      <EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
  });

  it('renders textarea for comentário', () => {
    const { container } = render(
      <EncerramentoModal onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByLabelText(/comentário final/i)).toBeDefined();
  });

  it('shows submitting state', () => {
    const { container } = render(
      <EncerramentoModal isPending onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/encerrando/i)).toBeDefined();
  });
});
