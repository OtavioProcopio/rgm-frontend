/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UploadFotoCapaDialog } from './UploadFotoCapaDialog';

afterEach(cleanup);

describe('UploadFotoCapaDialog', () => {
  it('renders file input and upload button', () => {
    const { container } = render(<UploadFotoCapaDialog onUpload={vi.fn()} />);
    expect(within(container).getByText(/foto de capa/i)).toBeDefined();
    const fileInput = container.querySelector('input[type="file"]')!;
    expect(fileInput).toBeDefined();
    expect(within(container).getByText(/enviar foto/i)).toBeDefined();
  });

  it('shows enviando when uploading', () => {
    const { container } = render(<UploadFotoCapaDialog isUploading onUpload={vi.fn()} />);
    expect(within(container).getByText(/enviando/i)).toBeDefined();
  });

  it('button is disabled when no file selected', () => {
    const { container } = render(<UploadFotoCapaDialog onUpload={vi.fn()} />);
    const btn = within(container).getByText(/enviar foto/i).closest('button')!;
    expect(btn.disabled).toBe(true);
  });
});
