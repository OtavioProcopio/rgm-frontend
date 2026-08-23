/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { EnviarValidacaoModal } from './EnviarValidacaoModal';

afterEach(cleanup);

describe('EnviarValidacaoModal', () => {
  it('requires an evidence upload before enabling submit by default', async () => {
    const { AppWrapper } = createAppWrapper();
    render(
      <EnviarValidacaoModal solicitacaoId="s1" onCancel={vi.fn()} onConfirm={vi.fn()} />,
      { wrapper: AppWrapper },
    );

    await userEvent.type(
      screen.getByLabelText(/descrição do serviço realizado/i),
      'Servico realizado conforme solicitado',
    );

    const submit = screen.getByRole('button', { name: /enviar para validação/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('shows the evidence as required by default', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(
      <EnviarValidacaoModal solicitacaoId="s1" onCancel={vi.fn()} onConfirm={vi.fn()} />,
      { wrapper: AppWrapper },
    );
    expect(within(container).getByText(/evidência do serviço realizado/i)).toBeDefined();
    expect(container.textContent).not.toContain('(opcional)');
  });

  it('allows submitting with just a comentário when evidenciaObrigatoria is false', async () => {
    const onConfirm = vi.fn();
    const { AppWrapper } = createAppWrapper();
    render(
      <EnviarValidacaoModal
        solicitacaoId="s1"
        evidenciaObrigatoria={false}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
      { wrapper: AppWrapper },
    );

    expect(screen.getByText(/\(opcional\)/i)).toBeDefined();

    await userEvent.type(screen.getByLabelText(/comentário/i), 'Modelo pronto para validação');

    const submit = screen.getByRole('button', { name: /enviar para validação/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);

    await userEvent.click(submit);
    expect(onConfirm).toHaveBeenCalled();
    expect(onConfirm.mock.calls[0][0]).toEqual({ comentario: 'Modelo pronto para validação' });
  });
});
