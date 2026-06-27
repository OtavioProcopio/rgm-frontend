/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Evidencia } from '../types/evidenciaTypes';
import { EvidenciaPreview } from './EvidenciaPreview';

afterEach(cleanup);

const base: Evidencia = {
  id: '1',
  publicUrl: 'http://minio/foto.jpg',
  mimeType: 'image/jpeg',
  nomeArquivo: 'foto.jpg',
  tamanhoBytes: 1024,
  enviadaPorUsuarioId: 'user-1',
  criadaEm: '2024-01-01T00:00:00Z',
};

describe('EvidenciaPreview', () => {
  it('renders filename', () => {
    const { container } = render(<EvidenciaPreview evidencia={base} />);
    expect(within(container).getByText('foto.jpg')).toBeDefined();
  });

  it('renders image for image mimeType', () => {
    const { container } = render(<EvidenciaPreview evidencia={base} />);
    expect(container.querySelector('img')).toBeDefined();
  });

  it('renders fallback for non-image mimeType', () => {
    const pdf = { ...base, mimeType: 'application/pdf', nomeArquivo: 'doc.pdf' };
    const { container } = render(<EvidenciaPreview evidencia={pdf} />);
    expect(container.querySelector('img')).toBeNull();
    expect(within(container).getByText('Arquivo')).toBeDefined();
  });

  it('formats bytes correctly', () => {
    const { container } = render(<EvidenciaPreview evidencia={{ ...base, tamanhoBytes: 512 }} />);
    expect(within(container).getByText('512 B')).toBeDefined();
  });

  it('formats kilobytes correctly', () => {
    const { container } = render(<EvidenciaPreview evidencia={{ ...base, tamanhoBytes: 2048 }} />);
    expect(within(container).getByText('2.0 KB')).toBeDefined();
  });

  it('formats megabytes correctly', () => {
    const mb = 2 * 1024 * 1024;
    const { container } = render(<EvidenciaPreview evidencia={{ ...base, tamanhoBytes: mb }} />);
    expect(within(container).getByText('2.0 MB')).toBeDefined();
  });

  it('renders open link', () => {
    const { container } = render(<EvidenciaPreview evidencia={base} />);
    const links = within(container).getAllByRole('link', { name: /abrir/i });
    expect(links.length).toBeGreaterThan(0);
  });
});
