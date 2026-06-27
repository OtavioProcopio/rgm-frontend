/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

afterEach(cleanup);

describe('Input', () => {
  it('renders label and input', () => {
    const { container } = render(<Input label="Nome" />);
    expect(within(container).getByLabelText('Nome')).toBeDefined();
  });

  it('associates label with input via generated id', () => {
    const { container } = render(<Input label="Email" />);
    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;
    expect(label.htmlFor).toBe(input.id);
  });

  it('uses provided id over generated one', () => {
    const { container } = render(<Input label="CPF" id="cpf-field" />);
    expect(container.querySelector('input')!.id).toBe('cpf-field');
  });

  it('renders error message and sets aria-invalid', () => {
    const { container } = render(<Input label="Email" error="E-mail inválido." />);
    expect(within(container).getByText('E-mail inválido.')).toBeDefined();
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not render error element when error is not provided', () => {
    const { container } = render(<Input label="Nome" />);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('false');
  });

  it('forwards additional props to native input', async () => {
    const onChange = vi.fn();
    const { container } = render(<Input label="Busca" placeholder="Pesquisar..." onChange={onChange} />);
    const input = within(container).getByPlaceholderText('Pesquisar...');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
