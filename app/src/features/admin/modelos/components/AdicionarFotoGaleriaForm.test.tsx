/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdicionarFotoGaleriaForm } from './AdicionarFotoGaleriaForm';

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

  it('rejects unsupported file types', async () => {
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, makeFile('doc.pdf', 'application/pdf'), {
      applyAccept: false,
    });
    expect(within(container).getByText(/apenas imagens/i)).toBeDefined();
  });

  it('rejects files larger than 10MB', async () => {
    const { container } = render(<AdicionarFotoGaleriaForm onSubmit={vi.fn()} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = makeFile('foto.png', 'image/png', 11 * 1024 * 1024);
    await userEvent.upload(fileInput, bigFile);
    expect(within(container).getByText(/no máximo 10 mb/i)).toBeDefined();
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
