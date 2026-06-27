/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Select } from './Select';

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
    const placeholder = within(container).getByRole('option', { name: 'Selecione...' }) as HTMLOptionElement;
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
});
