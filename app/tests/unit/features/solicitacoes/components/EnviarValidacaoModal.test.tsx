/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { EnviarValidacaoModal } from '@/features/solicitacoes/components/EnviarValidacaoModal';
import { LIMITES } from '@/shared/lib/limites';

const classes = (elemento: Element) => elemento.className.split(' ');

function montar() {
  const { AppWrapper } = createAppWrapper();
  return render(
    <EnviarValidacaoModal solicitacaoId="s1" onCancel={vi.fn()} onConfirm={vi.fn()} />,
    { wrapper: AppWrapper },
  );
}

afterEach(cleanup);

describe('EnviarValidacaoModal — cores por papel', () => {
  it('deve usar o fundo e a borda de informação quando o formulário é mostrado', () => {
    // Act
    const { container } = montar();

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-info-soft', 'border-info']),
    );
  });

  it('deve usar o texto de informação quando mostra o título', () => {
    // Act
    montar();

    // Assert
    expect(classes(screen.getByRole('heading'))).toContain('text-info-fg');
  });

  it('deve usar o texto de perigo na marca de obrigatório quando a evidência é obrigatória', () => {
    // Act
    montar();
    const marca = screen.getByText('*', { selector: 'span' });

    // Assert
    expect(classes(marca)).toContain('text-danger-fg');
  });
});

describe('EnviarValidacaoModal', () => {
  it('requires an evidence upload before enabling submit by default', async () => {
    const { AppWrapper } = createAppWrapper();
    render(<EnviarValidacaoModal solicitacaoId="s1" onCancel={vi.fn()} onConfirm={vi.fn()} />, {
      wrapper: AppWrapper,
    });

    await userEvent.type(
      screen.getByLabelText(/descrição do serviço realizado/i),
      'Servico realizado conforme solicitado',
    );

    const submit = screen.getByRole('button', {
      name: /enviar para validação/i,
    }) as HTMLButtonElement;
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

    const submit = screen.getByRole('button', {
      name: /enviar para validação/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);

    await userEvent.click(submit);
    expect(onConfirm).toHaveBeenCalled();
    expect(onConfirm.mock.calls[0][0]).toEqual({ comentario: 'Modelo pronto para validação' });
  });
});

describe('EnviarValidacaoModal — limite de texto', () => {
  it('deve limitar o comentário ao tamanho que a API aceita no envio para validação', () => {
    // Arrange
    const esperado = LIMITES.comentarioValidacao;
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<EnviarValidacaoModal solicitacaoId="s1" onCancel={vi.fn()} onConfirm={vi.fn()} />, {
      wrapper: AppWrapper,
    });
    const campo = screen.getByLabelText(/descrição do serviço realizado/i) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
