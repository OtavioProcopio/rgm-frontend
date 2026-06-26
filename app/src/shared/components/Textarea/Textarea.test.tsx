/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Textarea } from './Textarea';

afterEach(cleanup);

describe('Textarea', () => {
  it('renders label and textarea', () => {
    const { container } = render(<Textarea label="Descrição" />);
    expect(within(container).getByLabelText('Descrição')).toBeDefined();
  });

  it('associates label with textarea via generated id', () => {
    const { container } = render(<Textarea label="Comentário" />);
    const label = container.querySelector('label')!;
    const textarea = container.querySelector('textarea')!;
    expect(label.htmlFor).toBe(textarea.id);
  });

  it('renders error message and sets aria-invalid', () => {
    const { container } = render(<Textarea label="Descrição" error="Campo obrigatório." />);
    expect(within(container).getByText('Campo obrigatório.')).toBeDefined();
    expect(container.querySelector('textarea')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not render error element when error is not provided', () => {
    const { container } = render(<Textarea label="Descrição" />);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('textarea')!.getAttribute('aria-invalid')).toBe('false');
  });
});
