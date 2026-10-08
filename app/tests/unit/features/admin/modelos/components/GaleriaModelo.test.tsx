/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaModelo } from '@/features/admin/modelos/components/GaleriaModelo';

const { fotos, adicionarMutateAsync, editarMutateAsync, removerMutateAsync } = vi.hoisted(() => {
  const fotos = [
    {
      id: 'f1',
      modeloId: 'm1',
      publicUrl: 'http://minio/f1.jpg',
      identificacao: 'Parte 1',
      principal: true,
      enviadaPorUsuarioId: 'u1',
      criadoEm: '2026-01-01T00:00:00Z',
    },
  ];
  return {
    fotos,
    adicionarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
    editarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
    removerMutateAsync: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/features/admin/modelos/hooks/useGaleriaModelo', () => ({
  useGaleriaModelo: vi.fn().mockReturnValue({ data: fotos, isLoading: false, error: null }),
}));
vi.mock('@/features/admin/modelos/hooks/useAdicionarFotoGaleria', () => ({
  useAdicionarFotoGaleria: vi
    .fn()
    .mockReturnValue({ mutateAsync: adicionarMutateAsync, isPending: false }),
}));
vi.mock('@/features/admin/modelos/hooks/useEditarFotoGaleria', () => ({
  useEditarFotoGaleria: vi
    .fn()
    .mockReturnValue({ mutateAsync: editarMutateAsync, isPending: false }),
}));
vi.mock('@/features/admin/modelos/hooks/useRemoverFotoGaleria', () => ({
  useRemoverFotoGaleria: vi
    .fn()
    .mockReturnValue({ mutateAsync: removerMutateAsync, isPending: false }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('GaleriaModelo', () => {
  it('renders a thumbnail for each photo in the gallery', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByRole('button', { name: /ver foto: parte 1/i })).toBeDefined();
  });

  it('shows "Ver galeria completa" and "Adicionar foto" when podeGerenciar is true', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByRole('button', { name: /ver galeria completa/i })).toBeDefined();
    expect(within(container).getByRole('button', { name: /adicionar foto/i })).toBeDefined();
  });

  it('hides "Adicionar foto" but keeps "Ver galeria completa" when podeGerenciar is false', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar={false} />);
    expect(within(container).getByRole('button', { name: /ver galeria completa/i })).toBeDefined();
    expect(within(container).queryByRole('button', { name: /adicionar foto/i })).toBeNull();
  });

  it('shows a "+N" overlay on the 4th thumbnail when there are more than 4 photos', async () => {
    const { useGaleriaModelo } = await import('@/features/admin/modelos/hooks/useGaleriaModelo');
    const manyFotos = Array.from({ length: 6 }, (_, i) => ({
      ...fotos[0],
      id: `f${i}`,
      identificacao: `Foto ${i}`,
      principal: i === 0,
    }));
    vi.mocked(useGaleriaModelo).mockReturnValueOnce({
      data: manyFotos,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGaleriaModelo>);

    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByText('+2')).toBeDefined();
  });

  it('shows empty state when there are no photos', async () => {
    const { useGaleriaModelo } = await import('@/features/admin/modelos/hooks/useGaleriaModelo');
    vi.mocked(useGaleriaModelo).mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGaleriaModelo>);

    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByText(/nenhuma foto na galeria/i)).toBeDefined();
  });

  it('opens the carousel when a thumbnail is clicked', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver foto: parte 1/i }));
    expect(within(container).getByRole('dialog', { name: /galeria de fotos/i })).toBeDefined();
  });

  it('opens the carousel via "Ver galeria completa"', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver galeria completa/i }));
    expect(within(container).getByRole('dialog', { name: /galeria de fotos/i })).toBeDefined();
  });

  it('opens the add-photo modal and submits a new photo', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /^adicionar foto$/i }));
    expect(
      within(container).getByRole('dialog', { name: /adicionar foto à galeria/i }),
    ).toBeDefined();

    await userEvent.type(within(container).getByLabelText(/identificação/i), 'Nova foto');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a'], 'foto.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    const submitButtons = within(container).getAllByRole('button', { name: /adicionar foto/i });
    await userEvent.click(submitButtons[submitButtons.length - 1]);

    expect(adicionarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      file,
      identificacao: 'Nova foto',
    });
    expect(
      within(container).queryByRole('dialog', { name: /adicionar foto à galeria/i }),
    ).toBeNull();
  });

  it('removes a photo from within the carousel', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver galeria completa/i }));
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));
    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(removerMutateAsync).toHaveBeenCalledWith({ modeloId: 'm1', fotoId: 'f1' });
  });
});

const NOME_DO_DIALOGO = `Galeria de fotos: ${fotos[0].identificacao}`;
const NOME_DA_MINIATURA = `Ver foto: ${fotos[0].identificacao}`;
const classes = (elemento: Element) => elemento.className.split(' ');

async function abrirGaleriaPor(nomeDoControle: string) {
  render(<GaleriaModelo modeloId="m1" podeGerenciar />);
  await userEvent.click(screen.getByRole('button', { name: nomeDoControle }));
}

describe('GaleriaModelo com a galeria completa como diálogo modal', () => {
  it('deve ser anunciada como diálogo modal com o nome da foto exibida quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor('Ver galeria completa');

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco para dentro da galeria quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor('Ver galeria completa');

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it('deve levar o foco ao primeiro controle da galeria quando Tab é apertado no último', async () => {
    // Arrange
    await abrirGaleriaPor('Ver galeria completa');
    const controles = within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO })).getAllByRole(
      'button',
    );
    controles[controles.length - 1].focus();

    // Act
    await userEvent.tab();

    // Assert
    expect(document.activeElement).toBe(controles[0]);
  });

  it('deve fechar a galeria completa quando Esc é apertado', async () => {
    // Arrange
    await abrirGaleriaPor('Ver galeria completa');

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve devolver o foco ao botão da galeria completa quando ela fecha', async () => {
    // Arrange
    await abrirGaleriaPor('Ver galeria completa');
    within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO }))
      .getByRole('button', { name: 'Fechar' })
      .focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Ver galeria completa' }),
    );
  });

  it('deve devolver o foco à miniatura que abriu quando a foto ampliada fecha', async () => {
    // Arrange
    await abrirGaleriaPor(NOME_DA_MINIATURA);
    within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO }))
      .getByRole('button', { name: 'Fechar' })
      .focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: NOME_DA_MINIATURA }));
  });

  it('deve usar o fundo de sobreposição de foto quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor('Ver galeria completa');

    // Assert
    const fundo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO }).parentElement!;
    expect(classes(fundo)).toContain('bg-scrim');
  });
});

const NOME_DO_MODAL_DE_ADICIONAR = 'Adicionar foto à galeria';
const NOME_DE_QUEM_ABRE_O_MODAL = 'Adicionar foto';

async function abrirModalDeAdicionar() {
  render(<GaleriaModelo modeloId="m1" podeGerenciar />);
  await userEvent.click(screen.getByRole('button', { name: NOME_DE_QUEM_ABRE_O_MODAL }));
}

async function simularEnvio(emAndamento: boolean) {
  const { useAdicionarFotoGaleria } =
    await import('@/features/admin/modelos/hooks/useAdicionarFotoGaleria');
  vi.mocked(useAdicionarFotoGaleria).mockReturnValue({
    mutateAsync: adicionarMutateAsync,
    isPending: emAndamento,
  } as never);
}

describe('GaleriaModelo com o modal de adicionar foto como diálogo modal', () => {
  afterEach(() => simularEnvio(false));

  it('deve ser anunciado como diálogo modal com o nome da ação quando o modal de adicionar abre', async () => {
    // Act
    await abrirModalDeAdicionar();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco para dentro do modal quando o modal de adicionar abre', async () => {
    // Act
    await abrirModalDeAdicionar();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it('deve fechar o modal de adicionar quando Esc é apertado', async () => {
    // Arrange
    await abrirModalDeAdicionar();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve devolver o foco ao botão que abriu quando o modal de adicionar fecha', async () => {
    // Arrange
    await abrirModalDeAdicionar();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: NOME_DE_QUEM_ABRE_O_MODAL }),
    );
  });

  it('deve fechar o modal de adicionar quando o botão Fechar é clicado', async () => {
    // Arrange
    await abrirModalDeAdicionar();
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve usar a superfície elevada no painel quando o modal de adicionar abre', async () => {
    // Act
    await abrirModalDeAdicionar();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });
    expect(classes(dialogo)).toContain('bg-surface-raised');
  });

  it('deve manter o modal de adicionar aberto quando Esc é apertado com o envio em andamento', async () => {
    // Arrange
    await simularEnvio(true);
    await abrirModalDeAdicionar();
    screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR }).focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR })).toBeDefined();
  });

  it('deve desabilitar o botão Fechar quando o envio está em andamento', async () => {
    // Arrange
    await simularEnvio(true);

    // Act
    await abrirModalDeAdicionar();

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });
    const fechar = within(dialogo).getByRole<HTMLButtonElement>('button', { name: 'Fechar' });
    expect(fechar.disabled).toBe(true);
  });
});
