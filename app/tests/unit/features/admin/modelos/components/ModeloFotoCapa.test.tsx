/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ModeloFotoCapa } from '@/features/admin/modelos/components/ModeloFotoCapa';

afterEach(cleanup);

describe('ModeloFotoCapa', () => {
  it('renders sem foto placeholder when fotoUrl is null', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl={null} />);
    expect(within(container).getByText(/sem foto de capa/i)).toBeDefined();
  });

  it('renders image when fotoUrl is provided', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    const img = container.querySelector('img')!;
    expect(img).toBeDefined();
    expect(img.src).toBe('http://example.com/foto.jpg');
  });

  it('renders ampliar button when fotoUrl is provided', () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    expect(within(container).getByRole('button', { name: /ampliar/i })).toBeDefined();
  });

  it('opens lightbox when image button is clicked', async () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    const btn = within(container).getByRole('button', { name: /ampliar/i });
    await userEvent.click(btn);
    expect(within(container).getByRole('dialog')).toBeDefined();
  });

  it('closes lightbox when close button is clicked', async () => {
    const { container } = render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
    await userEvent.click(within(container).getByRole('button', { name: /ampliar/i }));
    await userEvent.click(within(container).getByRole('button', { name: /fechar/i }));
    expect(within(container).queryByRole('dialog')).toBeNull();
  });
});

const NOME_DO_DIALOGO = 'Foto de capa ampliada';
const NOME_DE_QUEM_ABRE = 'Ampliar foto de capa';
const classes = (elemento: Element) => elemento.className.split(' ');

async function abrirFotoAmpliada() {
  render(<ModeloFotoCapa fotoUrl="http://example.com/foto.jpg" />);
  await userEvent.click(screen.getByRole('button', { name: NOME_DE_QUEM_ABRE }));
}

describe('ModeloFotoCapa com a foto ampliada como diálogo modal', () => {
  it('deve ser anunciada como diálogo modal com o nome da foto de capa quando é ampliada', async () => {
    // Act
    await abrirFotoAmpliada();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco para dentro do diálogo quando a foto é ampliada', async () => {
    // Act
    await abrirFotoAmpliada();

    // Assert
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });

  it('deve manter o foco dentro do diálogo quando Tab é apertado no último controle', async () => {
    // Arrange
    await abrirFotoAmpliada();
    const controles = within(screen.getByRole('dialog')).getAllByRole('button');
    controles[controles.length - 1].focus();

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(controles[0]);
  });

  it('deve fechar a foto ampliada quando Esc é apertado', async () => {
    // Arrange
    await abrirFotoAmpliada();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve devolver o foco ao botão de ampliar quando a foto ampliada fecha', async () => {
    // Arrange
    await abrirFotoAmpliada();
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar' }).focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: NOME_DE_QUEM_ABRE }));
  });

  it('deve fechar a foto ampliada quando o clique é fora da foto', async () => {
    // Arrange
    await abrirFotoAmpliada();
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    const areaEmVoltaDaFoto = within(dialogo).getByRole('img').parentElement!;

    // Act
    await userEvent.click(areaEmVoltaDaFoto);

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve manter a foto ampliada aberta quando o clique é na própria foto', async () => {
    // Arrange
    await abrirFotoAmpliada();
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });

    // Act
    await userEvent.click(within(dialogo).getByRole('img'));

    // Assert
    expect(screen.getByRole('dialog', { name: NOME_DO_DIALOGO })).toBeDefined();
  });

  it('deve usar o fundo de sobreposição de foto quando a foto é ampliada', async () => {
    // Act
    await abrirFotoAmpliada();

    // Assert
    expect(classes(screen.getByRole('dialog').parentElement!)).toContain('bg-scrim');
  });
});
