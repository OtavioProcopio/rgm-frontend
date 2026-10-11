/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Select } from '@/shared/components/Select/Select';

afterEach(cleanup);

const OPTIONS = [
  { value: 'a', label: 'Opção A' },
  { value: 'b', label: 'Opção B' },
];

describe('Select', () => {
  it('renders label and options', () => {
    const { container } = render(<Select label="Status" options={OPTIONS} />);
    expect(within(container).getByLabelText('Status')).toBeDefined();
    expect(within(container).getByRole('option', { name: 'Opção A' })).toBeDefined();
    expect(within(container).getByRole('option', { name: 'Opção B' })).toBeDefined();
  });

  it('renders placeholder as first disabled option when provided', () => {
    const { container } = render(
      <Select label="Status" options={OPTIONS} placeholder="Selecione..." />,
    );
    const placeholder = within(container).getByRole('option', {
      name: 'Selecione...',
    }) as HTMLOptionElement;
    expect(placeholder.disabled).toBe(true);
  });

  it('does not render placeholder when omitted', () => {
    const { container } = render(<Select label="Status" options={OPTIONS} />);
    expect(container.querySelectorAll('option')).toHaveLength(2);
  });

  it('renders error message and sets aria-invalid', () => {
    const { container } = render(<Select label="Status" options={OPTIONS} error="Obrigatório." />);
    expect(within(container).getByText('Obrigatório.')).toBeDefined();
    expect(container.querySelector('select')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not render error element when error is not provided', () => {
    const { container } = render(<Select label="Status" options={OPTIONS} />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('associates label with select via generated id', () => {
    const { container } = render(<Select label="Perfil" options={OPTIONS} />);
    const label = container.querySelector('label')!;
    const select = container.querySelector('select')!;
    expect(label.htmlFor).toBe(select.id);
  });

  it('deve associar a mensagem de erro ao campo quando há erro', () => {
    const { container } = render(
      <Select label="Status" options={OPTIONS} error="Campo inválido." />,
    );

    const campo = container.querySelector('select')!;
    const descricao = container.ownerDocument.getElementById(
      campo.getAttribute('aria-describedby')!,
    );

    expect(descricao?.textContent).toBe('Campo inválido.');
  });

  it('deve deixar o campo sem descrição associada quando não há erro', () => {
    const { container } = render(<Select label="Status" options={OPTIONS} />);

    expect(container.querySelector('select')!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('deve chamar onChange com valor vazio quando o campo é limpável e o placeholder é escolhido', async () => {
    // Arrange
    const onChange = vi.fn<(valor: string) => void>();
    const { container } = render(
      <Select
        label="Status"
        options={OPTIONS}
        placeholder="Todos"
        limpavel
        defaultValue="a"
        onChange={(e) => onChange(e.target.value)}
      />,
    );

    // Act
    await userEvent.selectOptions(container.querySelector('select')!, '');

    // Assert
    expect(onChange.mock.calls).toEqual([['']]);
  });

  it('deve voltar ao valor vazio quando o campo é limpável e o placeholder é escolhido', async () => {
    // Arrange
    const { container } = render(
      <Select label="Status" options={OPTIONS} placeholder="Todos" limpavel defaultValue="a" />,
    );
    const select = container.querySelector('select')!;

    // Act
    await userEvent.selectOptions(select, '');

    // Assert
    expect(select.value).toBe('');
  });

  it('deve renderizar o placeholder habilitado quando o campo é limpável', () => {
    // Arrange
    const { container } = render(
      <Select label="Status" options={OPTIONS} placeholder="Todos" limpavel />,
    );

    // Act
    const placeholder = within(container).getByRole('option', {
      name: 'Todos',
    }) as HTMLOptionElement;

    // Assert
    expect(placeholder.disabled).toBe(false);
  });
});
