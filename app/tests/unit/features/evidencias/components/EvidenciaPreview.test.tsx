/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Evidencia } from '@/features/evidencias/types/evidenciaTypes';
import { EvidenciaPreview } from '@/features/evidencias/components/EvidenciaPreview';

afterEach(cleanup);

const base: Evidencia = {
  id: '1',
  publicUrl: 'http://minio/foto.jpg',
  mimeType: 'image/jpeg',
  nomeArquivo: 'foto.jpg',
  tamanhoBytes: 1024,
  enviadaPorUsuarioId: 'user-1',
  criadaEm: '2024-01-01T00:00:00Z',
  tipo: 'GERAL',
  descricao: null,
};

describe('EvidenciaPreview — cores por papel', () => {
  const pdf: Evidencia = { ...base, mimeType: 'application/pdf', nomeArquivo: 'doc.pdf' };

  it('deve usar a borda e a superfície do tema na moldura quando a evidência é exibida', () => {
    // Arrange
    const moldura = ['border-line', 'bg-surface'];

    // Act
    const { container } = render(<EvidenciaPreview evidencia={base} />);

    // Assert
    expect(container.firstElementChild?.className.split(' ')).toEqual(
      expect.arrayContaining(moldura),
    );
  });

  it('deve usar a superfície suave e o texto secundário na miniatura quando o arquivo não é imagem', () => {
    // Arrange
    const miniatura = ['bg-surface-muted', 'text-fg-muted'];

    // Act
    render(<EvidenciaPreview evidencia={pdf} />);

    // Assert
    expect(screen.getByText('Arquivo').className.split(' ')).toEqual(
      expect.arrayContaining(miniatura),
    );
  });

  it('deve escrever o tamanho com o texto secundário quando a evidência é exibida', () => {
    // Arrange
    const evidencia: Evidencia = { ...base, tamanhoBytes: 512 };

    // Act
    render(<EvidenciaPreview evidencia={evidencia} />);

    // Assert
    expect(screen.getByText(`${evidencia.tamanhoBytes} B`).className.split(' ')).toContain(
      'text-fg-muted',
    );
  });

  it('deve escrever o atalho de abrir com a cor de destaque quando a evidência é exibida', () => {
    // Act
    render(<EvidenciaPreview evidencia={pdf} />);

    // Assert
    expect(screen.getByRole('link', { name: 'Abrir' }).className.split(' ')).toContain(
      'text-accent',
    );
  });

  it('deve realçar o botão de excluir com o papel de perigo ao passar o mouse quando a exclusão é permitida', () => {
    // Arrange
    const realceDePerigo = ['hover:bg-danger-soft', 'hover:text-danger-fg'];

    // Act
    render(<EvidenciaPreview evidencia={base} onDelete={vi.fn()} />);

    // Assert
    const excluir = screen.getByRole('button', { name: 'Excluir evidência' });
    expect(excluir.className.split(' ')).toEqual(expect.arrayContaining(realceDePerigo));
  });
});

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
