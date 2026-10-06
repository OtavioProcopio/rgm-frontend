/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdicionarFotoGaleriaForm } from '@/features/admin/modelos/components/AdicionarFotoGaleriaForm';

afterEach(cleanup);

function makeFile(name: string, type: string, sizeBytes = 1024) {
  const file = new File(['a'.repeat(sizeBytes)], name, { type });
  return file;
}

describe('AdicionarFotoGaleriaForm', () => {
  it('disables submit button until file and identificacao are set', async () => {
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const button = within(container).getByRole('button', { name: /adicionar foto/i });
    expect(button).toHaveProperty('disabled', true);

    await userEvent.type(within(container).getByLabelText(/identificação/i), 'Parte 1');
    expect(button).toHaveProperty('disabled', true);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, makeFile('foto.png', 'image/png'));
    expect(button).toHaveProperty('disabled', false);
  });

  it('deve recusar listando só imagens quando o arquivo é um PDF', async () => {
    // Arrange
    render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const pdf = makeFile('doc.pdf', 'application/pdf');

    // Act
    await userEvent.upload(screen.getByLabelText('Foto da galeria'), pdf, { applyAccept: false });

    // Assert
    expect(screen.getByText('Tipo de arquivo não permitido. Os tipos aceitos são JPEG, PNG e WebP.')).toBeDefined();
  });

  it('deve recusar dizendo o limite quando a foto tem 11 MB', async () => {
    // Arrange
    render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const grande = makeFile('foto.png', 'image/png', 11 * 1024 * 1024);

    // Act
    await userEvent.upload(screen.getByLabelText('Foto da galeria'), grande);

    // Assert
    expect(screen.getByText('Arquivo muito grande. O limite é 10 MB.')).toBeDefined();
  });

  it('calls onSubmit with file and trimmed identificacao', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={onSubmit} />);

    await userEvent.type(within(container).getByLabelText(/identificação/i), '  Contra-macho  ');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('foto.png', 'image/png');
    await userEvent.upload(fileInput, file);

    await userEvent.click(within(container).getByRole('button', { name: /adicionar foto/i }));

    expect(onSubmit).toHaveBeenCalledWith(file, 'Contra-macho');
  });

  it('shows "Enviando..." label when submitting', () => {
    const { container } = render(<AdicionarFotoGaleriaForm isSubmitting onSubmit={vi.fn()} />);
    expect(within(container).getByRole('button', { name: /enviando/i })).toBeDefined();
  });

  it('shows a preview after a valid file is selected, and removes it on demand', async () => {
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, makeFile('foto.png', 'image/png'));

    expect(await within(container).findByRole('img', { name: /pré-visualização/i })).toBeDefined();
    expect(within(container).getByText(/foto\.png/)).toBeDefined();
    expect(within(container).queryByRole('button', { name: /clique para selecionar/i })).toBeNull();

    await userEvent.click(within(container).getByRole('button', { name: /remover foto selecionada/i }));
    expect(within(container).queryByRole('img', { name: /pré-visualização/i })).toBeNull();
    expect(within(container).getByRole('button', { name: /clique para selecionar/i })).toBeDefined();
  });

  it('does not render a cancel button when onCancel is not provided', () => {
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    expect(within(container).queryByRole('button', { name: /cancelar/i })).toBeNull();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(within(container).getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
