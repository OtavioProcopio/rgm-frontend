/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EvidenciaUploader } from './EvidenciaUploader';

afterEach(cleanup);

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob(['x'.repeat(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('EvidenciaUploader', () => {
  it('renders the upload button', () => {
    const { container } = render(<EvidenciaUploader onUpload={vi.fn()} />);
    expect(within(container).getByRole('button', { name: /anexar arquivo/i })).toBeDefined();
  });

  it('shows "Enviando..." when isPending', () => {
    const { container } = render(<EvidenciaUploader isPending onUpload={vi.fn()} />);
    expect(within(container).getByRole('button', { name: /enviando/i })).toBeDefined();
  });

  it('disables button when isPending', () => {
    const { container } = render(<EvidenciaUploader isPending onUpload={vi.fn()} />);
    expect(within(container).getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('calls onUpload with valid file', async () => {
    const onUpload = vi.fn();
    const { container } = render(<EvidenciaUploader onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile('foto.jpg', 'image/jpeg', 100);

    await userEvent.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('shows error for unsupported mime type', () => {
    const onUpload = vi.fn();
    const { container } = render(<EvidenciaUploader onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]')! as HTMLInputElement;
    const file = makeFile('doc.txt', 'text/plain', 100);

    // userEvent.upload respeita o accept do input; usamos fireEvent para testar
    // a validação de tipo que ocorre no handler JS
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onUpload).not.toHaveBeenCalled();
    expect(within(container).getByText(/tipo de arquivo não permitido/i)).toBeDefined();
  });

  it('shows error for oversized file', () => {
    const onUpload = vi.fn();
    const { container } = render(<EvidenciaUploader onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]')! as HTMLInputElement;
    const file = makeFile('big.jpg', 'image/jpeg', 11 * 1024 * 1024);

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onUpload).not.toHaveBeenCalled();
    expect(within(container).getByText(/arquivo muito grande/i)).toBeDefined();
  });
});
