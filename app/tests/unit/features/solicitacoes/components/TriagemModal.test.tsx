/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TriagemModal } from '@/features/solicitacoes/components/TriagemModal';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDaPrioridade } from '@/shared/lib/rotulos';

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('TriagemModal — rótulos dos valores da API', () => {
  it.each(Object.entries(rotuloDaPrioridade))(
    'deve oferecer a prioridade %s com o rótulo compartilhado',
    (valor, rotulo) => {
      // Act
      const { container } = render(
        <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
      );
      const opcao = within(container)
        .getByLabelText('Prioridade')
        .querySelector(`option[value="${valor}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );
});

describe('TriagemModal — cores por papel', () => {
  it('deve usar o fundo e a borda de informação quando o formulário é mostrado', () => {
    // Act
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-info-soft', 'border-info']),
    );
  });

  it('deve usar o texto de informação quando mostra o título', () => {
    // Act
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    expect(classes(within(container).getByRole('heading'))).toContain('text-info-fg');
  });

  it('deve usar o texto secundário quando não há responsável disponível', () => {
    // Act
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    expect(classes(within(container).getByText('Nenhum responsável disponível.'))).toContain(
      'text-fg-muted',
    );
  });
});

describe('TriagemModal', () => {
  it('renders form fields', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/triar solicitação/i)).toBeDefined();
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('shows empty responsáveis message when no usuarios', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/nenhum responsável/i)).toBeDefined();
  });

  it('renders usuario checkboxes', () => {
    const usuarios = [
      { id: 'u1', nome: 'João' },
      { id: 'u2', nome: 'Maria' },
    ];
    const { container } = render(
      <TriagemModal usuarios={usuarios} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('João')).toBeDefined();
    expect(within(container).getByText('Maria')).toBeDefined();
  });

  it('renders Cancelar and Confirmar buttons', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Cancelar')).toBeDefined();
    expect(within(container).getByText('Confirmar triagem')).toBeDefined();
  });

  it('shows pending state', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} isPending onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Triando...')).toBeDefined();
  });
});

describe('TriagemModal — limite de texto', () => {
  it('deve limitar a observação da foto ao tamanho que a API grava', async () => {
    // Arrange
    const esperado = LIMITES.textoLongo;
    const foto = new File(['x'], 'servico.png', { type: 'image/png' });
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Act
    await userEvent.upload(within(container).getByLabelText('Arquivo de evidência'), foto);
    const campo = (await within(container).findByLabelText(/observação/i)) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
