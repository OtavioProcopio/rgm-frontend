/**
 * @vitest-environment jsdom
 */
import { useState } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaCarousel } from '@/features/admin/modelos/components/GaleriaCarousel';
import type { FotoGaleria } from '@/features/admin/modelos/types/galeriaTypes';

afterEach(cleanup);

const fotos: FotoGaleria[] = [
  {
    id: 'f1',
    modeloId: 'm1',
    publicUrl: 'http://minio/1.jpg',
    identificacao: 'Parte 1',
    principal: true,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f2',
    modeloId: 'm1',
    publicUrl: 'http://minio/2.jpg',
    identificacao: 'Parte 2',
    principal: false,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-02T00:00:00Z',
  },
];

function renderCarousel(props: Partial<Parameters<typeof GaleriaCarousel>[0]> = {}) {
  return render(
    <GaleriaCarousel
      fotos={fotos}
      initialIndex={0}
      podeGerenciar
      pendingFotoId={null}
      isSavingGlobal={false}
      isRemovingGlobal={false}
      onDefinirCapa={vi.fn()}
      onRenomear={vi.fn()}
      onRemover={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe('GaleriaCarousel', () => {
  it('shows the photo at initialIndex and the position indicator', () => {
    const { container } = renderCarousel({ initialIndex: 1 });
    expect(within(container).getByText('Parte 2')).toBeDefined();
    expect(within(container).getByText('2 / 2')).toBeDefined();
  });

  it('navigates to the next and previous photo', async () => {
    const { container } = renderCarousel();
    expect(within(container).getByText('Parte 1')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(within(container).getByText('Parte 2')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /foto anterior/i }));
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('wraps around when navigating past the last photo', async () => {
    const { container } = renderCarousel({ initialIndex: 1 });
    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(within(container).getByText('Parte 1')).toBeDefined();
    expect(within(container).getByText('1 / 2')).toBeDefined();
  });

  it('hides navigation arrows and position indicator with a single photo', () => {
    const { container } = renderCarousel({ fotos: [fotos[0]] });
    expect(within(container).queryByRole('button', { name: /próxima foto/i })).toBeNull();
    expect(within(container).queryByText(/1 \/ 1/)).toBeNull();
  });

  it('shows the capa badge only for the principal photo', () => {
    const { container } = renderCarousel();
    expect(within(container).getByText('Capa')).toBeDefined();
  });

  it('hides management actions when podeGerenciar is false', () => {
    const { container } = renderCarousel({ podeGerenciar: false });
    expect(within(container).queryByRole('button', { name: /remover foto/i })).toBeNull();
    expect(within(container).queryByRole('button', { name: /renomear foto/i })).toBeNull();
  });

  it('calls onDefinirCapa for the currently displayed photo', async () => {
    const onDefinirCapa = vi.fn();
    const { container } = renderCarousel({ initialIndex: 1, onDefinirCapa });
    await userEvent.click(within(container).getByRole('button', { name: /definir capa/i }));
    expect(onDefinirCapa).toHaveBeenCalledWith('f2');
  });

  it('renames the currently displayed photo', async () => {
    const onRenomear = vi.fn();
    const { container } = renderCarousel({ onRenomear });
    await userEvent.click(within(container).getByRole('button', { name: /renomear foto/i }));
    const input = container.querySelector('input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Novo nome');
    await userEvent.click(within(container).getByRole('button', { name: /salvar identificação/i }));
    expect(onRenomear).toHaveBeenCalledWith('f1', 'Novo nome');
  });

  it('resets editing state when navigating to another photo', async () => {
    const { container } = renderCarousel();
    await userEvent.click(within(container).getByRole('button', { name: /renomear foto/i }));
    expect(container.querySelector('input')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(container.querySelector('input')).toBeNull();
    expect(within(container).getByRole('button', { name: /renomear foto/i })).toBeDefined();
  });

  it('confirms and calls onRemover for the currently displayed photo', async () => {
    const onRemover = vi.fn();
    const { container } = renderCarousel({ initialIndex: 1, onRemover });
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));
    expect(within(container).getByText(/removida permanentemente/i)).toBeDefined();

    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(onRemover).toHaveBeenCalledWith('f2');
  });

  it('closes when the close button is clicked', async () => {
    const onClose = vi.fn();
    const { container } = renderCarousel({ onClose });
    await userEvent.click(within(container).getByRole('button', { name: /^fechar$/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with arrow keys', async () => {
    const { container } = renderCarousel();
    await userEvent.keyboard('{ArrowRight}');
    expect(within(container).getByText('Parte 2')).toBeDefined();
    await userEvent.keyboard('{ArrowLeft}');
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('closes automatically when the gallery becomes empty', () => {
    const onClose = vi.fn();
    renderCarousel({ fotos: [], onClose });
    expect(onClose).toHaveBeenCalled();
  });

  it('deve abrir a confirmação de remover como diálogo modal com o foco em Cancelar', async () => {
    // Arrange
    const { container } = renderCarousel();

    // Act
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));

    // Assert
    const dialogo = within(container).getByRole('dialog', { name: 'Remover foto' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(within(dialogo).getByRole('button', { name: 'Cancelar' }));
  });

  it('deve fechar só a confirmação quando Esc é apertado com ela aberta', async () => {
    // Arrange
    const onClose = vi.fn();
    const { container } = renderCarousel({ onClose });
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(within(container).queryByRole('dialog', { name: 'Remover foto' })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve manter a foto atual quando a seta é apertada com a confirmação aberta', async () => {
    // Arrange
    const { container } = renderCarousel();
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(within(container).getByRole('dialog', { name: /galeria de fotos/i })).toBeDefined();
    expect(within(container).getByText('1 / 2')).toBeDefined();
  });
});

const NOME_DO_DIALOGO = `Galeria de fotos: ${fotos[0].identificacao}`;
const classes = (elemento: Element) => elemento.className.split(' ');

/** Página com um botão que abre o carrossel, para provar o foco ao abrir e ao fechar. */
function PaginaComCarrossel() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>
        Abrir
      </button>
      {aberto ? (
        <GaleriaCarousel
          fotos={fotos}
          initialIndex={0}
          podeGerenciar
          pendingFotoId={null}
          isSavingGlobal={false}
          isRemovingGlobal={false}
          onDefinirCapa={vi.fn()}
          onRenomear={vi.fn()}
          onRemover={vi.fn()}
          onClose={() => setAberto(false)}
        />
      ) : null}
    </>
  );
}

async function abrirCarrossel() {
  render(<PaginaComCarrossel />);
  await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
}

describe('GaleriaCarousel como diálogo modal', () => {
  it('deve ser anunciado como diálogo modal com o nome da foto exibida quando abre', async () => {
    // Act
    await abrirCarrossel();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco para dentro do diálogo quando abre', async () => {
    // Act
    await abrirCarrossel();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it('deve levar o foco ao primeiro controle quando Tab é apertado no último', async () => {
    // Arrange
    await abrirCarrossel();
    const controles = within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO })).getAllByRole(
      'button',
    );
    controles[controles.length - 1].focus();

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(controles[0]);
  });

  it('deve fechar quando Esc é apertado', async () => {
    // Arrange
    await abrirCarrossel();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve devolver o foco ao controle que abriu quando fecha', async () => {
    // Arrange
    await abrirCarrossel();
    within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO }))
      .getByRole('button', { name: 'Fechar' })
      .focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir' }));
  });

  it('deve usar o fundo de sobreposição de foto quando abre', async () => {
    // Act
    await abrirCarrossel();

    // Assert
    const fundo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO }).parentElement!;
    expect(classes(fundo)).toContain('bg-scrim');
  });
});
