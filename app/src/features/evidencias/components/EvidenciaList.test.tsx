/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Evidencia } from '../types/evidenciaTypes';
import { EvidenciaList } from './EvidenciaList';

afterEach(cleanup);

const makeEvidencia = (overrides: Partial<Evidencia> = {}): Evidencia => ({
  id: '1',
  publicUrl: 'http://minio/img.jpg',
  mimeType: 'image/jpeg',
  nomeArquivo: 'foto.jpg',
  tamanhoBytes: 1024,
  enviadaPorUsuarioId: 'user-1',
  criadaEm: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('EvidenciaList', () => {
  it('shows loading state', () => {
    const { container } = render(<EvidenciaList evidencias={[]} isLoading />);
    expect(within(container).getByText(/carregando evidências/i)).toBeDefined();
  });

  it('shows empty state when no evidencias', () => {
    const { container } = render(<EvidenciaList evidencias={[]} />);
    expect(within(container).getByText(/nenhuma evidência/i)).toBeDefined();
  });

  it('renders evidencia cards', () => {
    const evidencias = [makeEvidencia({ id: '1', nomeArquivo: 'a.jpg' }), makeEvidencia({ id: '2', nomeArquivo: 'b.jpg' })];
    const { container } = render(<EvidenciaList evidencias={evidencias} />);
    expect(within(container).getByText('a.jpg')).toBeDefined();
    expect(within(container).getByText('b.jpg')).toBeDefined();
  });
});
