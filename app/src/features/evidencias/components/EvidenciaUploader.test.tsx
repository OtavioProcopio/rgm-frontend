/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
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
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('foto.jpg', 'image/jpeg', 100);

    await userEvent.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('deve recusar listando os tipos aceitos, sem enviar, quando o arquivo é um executável', async () => {
    // Arrange
    const onUpload = vi.fn();
    render(<EvidenciaUploader onUpload={onUpload} />);
    const executavel = makeFile('instalador.exe', 'application/x-msdownload', 100);

    // Act
    await userEvent.upload(screen.getByLabelText('Arquivo de evidência'), executavel, { applyAccept: false });

    // Assert
    expect(screen.getByText('Tipo de arquivo não permitido. Os tipos aceitos são JPEG, PNG, GIF, WebP, PDF e MP4.')).toBeDefined();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('deve recusar dizendo o limite, sem enviar, quando o arquivo tem 11 MB', async () => {
    // Arrange
    const onUpload = vi.fn();
    render(<EvidenciaUploader onUpload={onUpload} />);
    const grande = makeFile('grande.jpg', 'image/jpeg', 11 * 1024 * 1024);

    // Act
    await userEvent.upload(screen.getByLabelText('Arquivo de evidência'), grande);

    // Assert
    expect(screen.getByText('Arquivo muito grande. O limite é 10 MB.')).toBeDefined();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('deve enviar quando o arquivo é um MP4 de 5 MB', async () => {
    // Arrange
    const onUpload = vi.fn();
    render(<EvidenciaUploader onUpload={onUpload} />);
    const video = makeFile('servico.mp4', 'video/mp4', 5 * 1024 * 1024);

    // Act
    await userEvent.upload(screen.getByLabelText('Arquivo de evidência'), video);

    // Assert
    expect(onUpload).toHaveBeenCalledWith(video);
    expect(screen.queryByText(/não permitido|muito grande/i)).toBeNull();
  });

  it('deve limpar o erro quando um arquivo válido é escolhido depois de um recusado', async () => {
    // Arrange
    const onUpload = vi.fn();
    render(<EvidenciaUploader onUpload={onUpload} />);
    const campo = screen.getByLabelText('Arquivo de evidência');
    await userEvent.upload(campo, makeFile('nota.txt', 'text/plain', 10), { applyAccept: false });
    const valido = makeFile('foto.png', 'image/png', 10);

    // Act
    await userEvent.upload(campo, valido);

    // Assert
    expect(screen.queryByText(/não permitido/i)).toBeNull();
    expect(onUpload).toHaveBeenCalledWith(valido);
  });

});
