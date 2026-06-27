/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ModeloFotoCapa } from './ModeloFotoCapa';

afterEach(cleanup);

describe('ModeloFotoCapa', () => {
  it('renders sem foto placeholder when fotoUrl is null', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl={null} />);
    expect(within(container).getByText(/sem foto de capa/i)).toBeDefined();
  });

  it('renders image when fotoUrl is provided', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    const img = container.querySelector('img')!;
    expect(img).toBeDefined();
    expect(img.src).toBe('http://example.com/foto.jpg');
  });

  it('renders ampliar button when fotoUrl is provided', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    expect(within(container).getByRole('button', { name: /ampliar/i })).toBeDefined();
  });

  it('opens lightbox when image button is clicked', async () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    const btn = within(container).getByRole('button', { name: /ampliar/i });
    await userEvent.click(btn);
    expect(within(container).getByRole('dialog')).toBeDefined();
  });

  it('closes lightbox when close button is clicked', async () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    await userEvent.click(within(container).getByRole('button', { name: /ampliar/i }));
    await userEvent.click(within(container).getByRole('button', { name: /fechar/i }));
    expect(within(container).queryByRole('dialog')).toBeNull();
  });
});
