/**
 * @vitest-environment jsdom
 */
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dialog } from '@/shared/components/Dialog/Dialog';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function renderDialog(onClose = vi.fn()) {
  render(
    <Dialog titulo="Triar: Trocar correia" onClose={onClose}>
      <button type="button">Primeiro</button>
      <button type="button">Último</button>
    </Dialog>,
  );
  return onClose;
}

/** Página com um botão que abre o diálogo, para provar o que acontece ao fechar. */
function PaginaComDialog() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>
        Abrir
      </button>
      {aberto ? (
        <Dialog titulo="Triar: Trocar correia" onClose={() => setAberto(false)}>
          <button type="button">Dentro</button>
        </Dialog>
      ) : null}
    </>
  );
}

describe('Dialog', () => {
  it('deve ser anunciado como diálogo modal com o nome informado', () => {
    // Act
    renderDialog();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: 'Triar: Trocar correia' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco ao primeiro controle quando abre', () => {
    // Act
    renderDialog();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primeiro' }));
  });

  it('deve levar o foco ao próprio diálogo quando não há controle dentro dele', () => {
    // Act
    render(
      <Dialog titulo="Aviso" onClose={vi.fn()}>
        <p>Sem controles</p>
      </Dialog>,
    );

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('dialog', { name: 'Aviso' }));
  });

  it('deve levar o foco ao primeiro controle quando Tab é apertado no último', async () => {
    // Arrange
    renderDialog();
    screen.getByRole('button', { name: 'Último' }).focus();

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primeiro' }));
  });

  it('deve levar o foco ao último controle quando Shift+Tab é apertado no primeiro', async () => {
    // Arrange
    renderDialog();

    // Act
    await userEvent.tab({ shift: true });

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Último' }));
  });

  it('deve levar o foco ao último controle quando Shift+Tab é apertado com o foco no próprio diálogo', async () => {
    // Arrange
    renderDialog();
    screen.getByRole('dialog').focus();

    // Act
    await userEvent.tab({ shift: true });

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Último' }));
  });

  it('deve seguir para o controle seguinte quando Tab é apertado antes do último', async () => {
    // Arrange
    renderDialog();

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Último' }));
  });

  it('deve manter o foco no diálogo quando Tab é apertado e não há controle dentro dele', async () => {
    // Arrange
    render(
      <Dialog titulo="Aviso" onClose={vi.fn()}>
        <p>Sem controles</p>
      </Dialog>,
    );

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('dialog', { name: 'Aviso' }));
  });

  it('deve pedir para fechar quando Esc é apertado', async () => {
    // Arrange
    const onClose = renderDialog();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('deve pedir para fechar quando o clique é fora do diálogo', async () => {
    // Arrange
    const onClose = renderDialog();
    const fundo = screen.getByRole('dialog').parentElement!;

    // Act
    await userEvent.click(fundo);

    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('deve continuar aberto quando o clique é dentro do diálogo', async () => {
    // Arrange
    const onClose = renderDialog();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Último' }));

    // Assert
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve devolver o foco ao controle que abriu quando fecha', async () => {
    // Arrange
    render(<PaginaComDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir' }));
  });

  it('deve travar a rolagem da página enquanto está aberto', async () => {
    // Arrange
    render(<PaginaComDialog />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    // Assert
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('deve restaurar a rolagem da página quando fecha', async () => {
    // Arrange
    document.body.style.overflow = 'auto';
    render(<PaginaComDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.body.style.overflow).toBe('auto');
  });
});
