/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaFotoCard } from './GaleriaFotoCard';
import type { FotoGaleria } from '../types/galeriaTypes';

afterEach(cleanup);

const foto: FotoGaleria = {
  id: 'f1',
  modeloId: 'm1',
  publicUrl: 'http://minio/foto.jpg',
  identificacao: 'Parte 1',
  principal: false,
  enviadaPorUsuarioId: 'u1',
  criadoEm: '2026-01-01T00:00:00Z',
};

function renderCard(props: Partial<Parameters<typeof GaleriaFotoCard>[0]> = {}) {
  return render(
    <GaleriaFotoCard
      foto={foto}
      podeGerenciar
      onDefinirCapa={vi.fn()}
      onRenomear={vi.fn()}
      onRemover={vi.fn()}
      {...props}
    />,
  );
}

describe('GaleriaFotoCard', () => {
  it('shows the identificacao', () => {
    const { container } = renderCard();
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('shows capa badge when principal', () => {
    const { container } = renderCard({ foto: { ...foto, principal: true } });
    expect(within(container).getByText('Capa')).toBeDefined();
  });

  it('does not show "Definir capa" action when already principal', () => {
    const { container } = renderCard({ foto: { ...foto, principal: true } });
    expect(within(container).queryByRole('button', { name: /definir capa/i })).toBeNull();
  });

  it('does not show management actions when podeGerenciar is false', () => {
    const { container } = renderCard({ podeGerenciar: false });
    expect(within(container).queryByRole('button', { name: /remover/i })).toBeNull();
  });

  it('calls onDefinirCapa when "Definir capa" is clicked', async () => {
    const onDefinirCapa = vi.fn();
    const { container } = renderCard({ onDefinirCapa });
    await userEvent.click(within(container).getByRole('button', { name: /definir capa/i }));
    expect(onDefinirCapa).toHaveBeenCalled();
  });

  it('edits and saves a new identificacao', async () => {
    const onRenomear = vi.fn();
    const { container } = renderCard({ onRenomear });
    await userEvent.click(within(container).getByRole('button', { name: /renomear/i }));
    const input = container.querySelector('input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Contra-macho');
    await userEvent.click(within(container).getByRole('button', { name: /salvar/i }));
    expect(onRenomear).toHaveBeenCalledWith('Contra-macho');
  });

  it('cancels editing without calling onRenomear', async () => {
    const onRenomear = vi.fn();
    const { container } = renderCard({ onRenomear });
    await userEvent.click(within(container).getByRole('button', { name: /renomear/i }));
    await userEvent.click(within(container).getByRole('button', { name: /cancelar/i }));
    expect(onRenomear).not.toHaveBeenCalled();
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('asks for confirmation before removing', async () => {
    const onRemover = vi.fn();
    const { container } = renderCard({ onRemover });
    await userEvent.click(within(container).getByRole('button', { name: /remover/i }));
    expect(within(container).getByText(/removida permanentemente/i)).toBeDefined();
    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(onRemover).toHaveBeenCalled();
  });

  it('opens and closes the lightbox', async () => {
    const { container } = renderCard();
    await userEvent.click(within(container).getByRole('button', { name: /ampliar foto/i }));
    expect(within(container).getByRole('dialog')).toBeDefined();
    await userEvent.click(within(container).getByRole('button', { name: /fechar/i }));
    expect(within(container).queryByRole('dialog')).toBeNull();
  });
});
