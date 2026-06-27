/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ComentarioForm } from './ComentarioForm';

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
