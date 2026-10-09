/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaModelo } from '@/features/admin/modelos/components/GaleriaModelo';
import { useGaleriaModelo } from '@/features/admin/modelos/hooks/useGaleriaModelo';

const { fotos, refetch, adicionarMutateAsync, editarMutateAsync, removerMutateAsync } = vi.hoisted(
  () => {
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
      refetch: vi.fn(),
      adicionarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
      editarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
      removerMutateAsync: vi.fn().mockResolvedValue(undefined),
    };
  },
);

vi.mock('@/features/admin/modelos/hooks/useGaleriaModelo', () => ({
  useGaleriaModelo: vi
    .fn()
    .mockReturnValue({ data: fotos, isLoading: false, error: null, refetch }),
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

type Resultado = { data?: typeof fotos; isLoading?: boolean; error?: Error | null };

function simularGaleria({ data, isLoading = false, error = null }: Resultado) {
  vi.mocked(useGaleriaModelo).mockReturnValue({
    data,
    isLoading,
    error,
    refetch,
  } as unknown as ReturnType<typeof useGaleriaModelo>);
}

function criarFotos(quantidade: number, indiceDaCapa: number | null) {
  return Array.from({ length: quantidade }, (_, i) => ({
    ...fotos[0],
    id: `f${i}`,
    identificacao: `Foto ${i}`,
    principal: i === indiceDaCapa,
  }));
}

function renderizar(podeGerenciar = true) {
  return render(<GaleriaModelo modeloId="m1" codigo="ab-123" podeGerenciar={podeGerenciar} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  simularGaleria({ data: fotos });
});

describe('GaleriaModelo com a foto grande', () => {
  it('deve mostrar a capa como foto grande quando a galeria tem capa', () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 3) });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('button', { name: 'Ampliar foto: Foto 3' })).toBeDefined();
  });

  it('deve mostrar a primeira foto como foto grande quando a galeria não tem capa', () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, null) });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('button', { name: 'Ampliar foto: Foto 0' })).toBeDefined();
  });

  it('deve usar a proporção 4:3 na largura toda quando a foto grande aparece', () => {
    // Act
    renderizar();

    // Assert
    const grande = screen.getByRole('button', { name: 'Ampliar foto: Parte 1' });
    expect(grande.className.split(' ')).toEqual(expect.arrayContaining(['aspect-[4/3]', 'w-full']));
  });

  it('deve trocar a foto grande quando uma miniatura é escolhida', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 2' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Ampliar foto: Foto 2' })).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve marcar a miniatura como ativa quando ela é escolhida', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 2' }));

    // Assert
    const miniatura = screen.getByRole('button', { name: 'Ver foto: Foto 2' });
    expect(miniatura.getAttribute('aria-current')).toBe('true');
  });

  it('deve manter o foco na miniatura quando ela é escolhida', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 2' }));

    // Assert
    const miniatura = screen.getByRole('button', { name: 'Ver foto: Foto 2' });
    expect(document.activeElement).toBe(miniatura);
  });

  it('deve manter a estrela de capa na miniatura da capa quando outra miniatura é escolhida', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 2' }));

    // Assert
    const capa = screen.getByRole('button', { name: 'Ver foto: Foto 0' });
    expect(capa.querySelector('svg.lucide-star')).not.toBeNull();
  });

  it('deve abrir o carrossel na foto atual quando a foto grande é tocada', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 2' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Ampliar foto: Foto 2' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Galeria de fotos: Foto 2' })).toBeDefined();
  });

  it('deve mostrar o ícone de imagem indisponível quando a foto grande falha ao carregar', () => {
    // Arrange
    renderizar();
    const grande = screen.getByRole('button', { name: 'Ampliar foto: Parte 1' });

    // Act
    fireEvent.error(within(grande).getByRole('img'));

    // Assert
    expect(grande.querySelector('svg.lucide-image-off')).not.toBeNull();
  });

  it('deve manter uma foto válida como ativa quando a lista encolhe', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(5, 0) });
    const { rerender } = renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 4' }));

    // Act
    simularGaleria({ data: criarFotos(2, null) });
    rerender(<GaleriaModelo modeloId="m1" codigo="ab-123" podeGerenciar />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ampliar foto: Foto 1' })).toBeDefined();
  });
});

describe('GaleriaModelo com as miniaturas', () => {
  it('deve mostrar seis miniaturas quando há oito fotos', () => {
    // Arrange
    simularGaleria({ data: criarFotos(8, 0) });

    // Act
    renderizar();

    // Assert
    expect(screen.getAllByRole('button', { name: /^Ver foto: / })).toHaveLength(5);
    expect(screen.getByRole('button', { name: /^Ver galeria completa/ })).toBeDefined();
  });

  it('deve mostrar +2 na sexta miniatura quando há oito fotos', () => {
    // Arrange
    simularGaleria({ data: criarFotos(8, 0) });

    // Act
    renderizar();

    // Assert
    const sexta = screen.getByRole('button', { name: /^Ver galeria completa/ });
    expect(within(sexta).getByText('+2')).toBeDefined();
  });

  it('deve abrir o carrossel na sexta foto quando a miniatura com +2 é acionada', async () => {
    // Arrange
    simularGaleria({ data: criarFotos(8, 0) });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^Ver galeria completa/ }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Galeria de fotos: Foto 5' })).toBeDefined();
  });

  it('deve mostrar Adicionar foto junto das miniaturas quando pode gerenciar', () => {
    // Act
    renderizar(true);

    // Assert
    const adicionar = screen.getByRole('button', { name: 'Adicionar foto' });
    const miniatura = screen.getByRole('button', { name: 'Ver foto: Parte 1' });
    expect(adicionar.getAttribute('type')).toBe('button');
    expect(adicionar.parentElement).toBe(miniatura.parentElement);
  });

  it('deve esconder Adicionar foto quando não pode gerenciar', () => {
    // Act
    renderizar(false);

    // Assert
    expect(screen.queryByRole('button', { name: 'Adicionar foto' })).toBeNull();
  });

  it('deve não mostrar Ver galeria completa quando a galeria tem poucas fotos', () => {
    // Act
    renderizar();

    // Assert
    expect(screen.queryByRole('button', { name: 'Ver galeria completa' })).toBeNull();
  });
});

describe('GaleriaModelo sem fotos', () => {
  it('deve mostrar as duas primeiras letras do código em maiúsculas quando não há fotos', () => {
    // Arrange
    simularGaleria({ data: [] });

    // Act
    renderizar(false);

    // Assert
    expect(screen.getByText('AB')).toBeDefined();
    expect(screen.getByText(/nenhuma foto na galeria deste modelo/i)).toBeDefined();
  });

  it('deve mostrar Adicionar foto quando não há fotos e pode gerenciar', () => {
    // Arrange
    simularGaleria({ data: [] });

    // Act
    renderizar(true);

    // Assert
    expect(screen.getByRole('button', { name: 'Adicionar foto' })).toBeDefined();
  });

  it('deve esconder Adicionar foto quando não há fotos e não pode gerenciar', () => {
    // Arrange
    simularGaleria({ data: [] });

    // Act
    renderizar(false);

    // Assert
    expect(screen.queryByRole('button', { name: 'Adicionar foto' })).toBeNull();
  });
});

describe('GaleriaModelo com a consulta em erro', () => {
  it('deve mostrar o erro e Tentar novamente quando a galeria falha', () => {
    // Arrange
    simularGaleria({ data: undefined, error: new Error('falha') });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Não foi possível carregar a galeria')).toBeDefined();
    const tentar = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(tentar.getAttribute('type')).toBe('button');
  });

  it('deve chamar refetch uma vez quando Tentar novamente é acionado', async () => {
    // Arrange
    simularGaleria({ data: undefined, error: new Error('falha') });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith();
  });
});

describe('GaleriaModelo com ações', () => {
  it('deve abrir o modal e enviar a nova foto quando o formulário é preenchido', async () => {
    // Arrange
    const { container } = renderizar();
    await userEvent.click(within(container).getByRole('button', { name: /^adicionar foto$/i }));
    await userEvent.type(within(container).getByLabelText(/identificação/i), 'Nova foto');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a'], 'foto.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);
    const botoes = within(container).getAllByRole('button', { name: /adicionar foto/i });

    // Act
    await userEvent.click(botoes[botoes.length - 1]);

    // Assert
    expect(adicionarMutateAsync).toHaveBeenCalledTimes(1);
    expect(adicionarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      file,
      identificacao: 'Nova foto',
    });
    expect(screen.queryByRole('dialog', { name: /adicionar foto à galeria/i })).toBeNull();
  });

  it('deve remover a foto quando a remoção é confirmada no carrossel', async () => {
    // Arrange
    const { container } = renderizar();
    await userEvent.click(within(container).getByRole('button', { name: 'Ampliar foto: Parte 1' }));
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));
    const confirmar = within(container).getAllByRole('button', { name: /remover/i });

    // Act
    await userEvent.click(confirmar[confirmar.length - 1]);

    // Assert
    expect(removerMutateAsync).toHaveBeenCalledTimes(1);
    expect(removerMutateAsync).toHaveBeenCalledWith({ modeloId: 'm1', fotoId: 'f1' });
  });

  it('deve não usar a classe outline-none quando a galeria é exibida', () => {
    // Act
    const { container } = renderizar();

    // Assert
    expect(container.innerHTML).not.toContain('outline-none');
  });
});

const NOME_DO_DIALOGO = `Galeria de fotos: ${fotos[0].identificacao}`;
const NOME_DA_FOTO_GRANDE = `Ampliar foto: ${fotos[0].identificacao}`;
const classes = (elemento: Element) => elemento.className.split(' ');

async function abrirGaleriaPor(nomeDoControle: string) {
  renderizar();
  await userEvent.click(screen.getByRole('button', { name: nomeDoControle }));
}

describe('GaleriaModelo com a galeria completa como diálogo modal', () => {
  it('deve ser anunciada como diálogo modal com o nome da foto exibida quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve levar o foco para dentro da galeria quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO });
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it('deve levar o foco ao primeiro controle da galeria quando Tab é apertado no último', async () => {
    // Arrange
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);
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
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve devolver o foco à foto grande quando a foto ampliada fecha', async () => {
    // Arrange
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);
    within(screen.getByRole('dialog', { name: NOME_DO_DIALOGO }))
      .getByRole('button', { name: 'Fechar' })
      .focus();

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('button', { name: NOME_DA_FOTO_GRANDE }));
  });

  it('deve usar o fundo de sobreposição de foto quando a galeria completa abre', async () => {
    // Act
    await abrirGaleriaPor(NOME_DA_FOTO_GRANDE);

    // Assert
    const fundo = screen.getByRole('dialog', { name: NOME_DO_DIALOGO }).parentElement!;
    expect(classes(fundo)).toContain('bg-scrim');
  });
});

const NOME_DO_MODAL_DE_ADICIONAR = 'Adicionar foto à galeria';
const NOME_DE_QUEM_ABRE_O_MODAL = 'Adicionar foto';

async function abrirModalDeAdicionar() {
  renderizar();
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

  it('deve fechar o modal de adicionar quando Cancelar é clicado', async () => {
    // Arrange
    await abrirModalDeAdicionar();
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve mostrar o erro e manter o modal aberto quando o envio da foto falha', async () => {
    // Arrange
    adicionarMutateAsync.mockRejectedValueOnce(new Error('falha'));
    await abrirModalDeAdicionar();
    const dialogo = screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR });
    await userEvent.type(within(dialogo).getByLabelText(/identificação/i), 'Nova foto');
    const arquivo = new File(['a'], 'foto.png', { type: 'image/png' });
    await userEvent.upload(
      dialogo.querySelector('input[type="file"]') as HTMLInputElement,
      arquivo,
    );
    const botoes = within(dialogo).getAllByRole('button', { name: /adicionar foto/i });

    // Act
    await userEvent.click(botoes[botoes.length - 1]);

    // Assert
    expect(adicionarMutateAsync).toHaveBeenCalledTimes(1);
    expect(adicionarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      file: arquivo,
      identificacao: 'Nova foto',
    });
    expect(screen.getByText('Operação não concluída')).toBeDefined();
    expect(screen.getByRole('dialog', { name: NOME_DO_MODAL_DE_ADICIONAR })).toBeDefined();
  });
});

const MENSAGEM_DE_FALHA = 'Não foi possível concluir a operação. Tente novamente.';

async function abrirCarrosselNaSegundaFoto() {
  simularGaleria({ data: criarFotos(2, 0) });
  renderizar();
  await userEvent.click(screen.getByRole('button', { name: 'Ver foto: Foto 1' }));
  await userEvent.click(screen.getByRole('button', { name: 'Ampliar foto: Foto 1' }));
  return screen.getByRole('dialog', { name: 'Galeria de fotos: Foto 1' });
}

async function renomearPara(dialogo: HTMLElement, nome: string) {
  await userEvent.click(within(dialogo).getByRole('button', { name: 'Renomear foto' }));
  const campo = within(dialogo).getByRole('textbox');
  await userEvent.clear(campo);
  await userEvent.type(campo, nome);
  await userEvent.click(within(dialogo).getByRole('button', { name: 'Salvar identificação' }));
}

async function confirmarRemocao(dialogo: HTMLElement) {
  await userEvent.click(within(dialogo).getByRole('button', { name: 'Remover foto' }));
  const botoes = screen.getAllByRole('button', { name: 'Remover' });
  await userEvent.click(botoes[botoes.length - 1]);
}

describe('GaleriaModelo com as ações do carrossel', () => {
  it('deve definir a foto como capa quando Definir capa é acionado', async () => {
    // Arrange
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Definir capa' }));

    // Assert
    expect(editarMutateAsync).toHaveBeenCalledTimes(1);
    expect(editarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      fotoId: 'f1',
      payload: { principal: true },
    });
    expect(screen.queryByText('Operação não concluída')).toBeNull();
  });

  it('deve mostrar o erro quando definir a capa falha', async () => {
    // Arrange
    editarMutateAsync.mockRejectedValueOnce(new Error('falha'));
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Definir capa' }));

    // Assert
    expect(editarMutateAsync).toHaveBeenCalledTimes(1);
    expect(editarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      fotoId: 'f1',
      payload: { principal: true },
    });
    expect(screen.getByText('Operação não concluída')).toBeDefined();
    expect(screen.getByText(MENSAGEM_DE_FALHA)).toBeDefined();
  });

  it('deve renomear a foto quando a nova identificação é salva', async () => {
    // Arrange
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await renomearPara(dialogo, 'Nome novo');

    // Assert
    expect(editarMutateAsync).toHaveBeenCalledTimes(1);
    expect(editarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      fotoId: 'f1',
      payload: { identificacao: 'Nome novo' },
    });
    expect(screen.queryByText('Operação não concluída')).toBeNull();
  });

  it('deve mostrar o erro quando renomear a foto falha', async () => {
    // Arrange
    editarMutateAsync.mockRejectedValueOnce(new Error('falha'));
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await renomearPara(dialogo, 'Nome novo');

    // Assert
    expect(editarMutateAsync).toHaveBeenCalledTimes(1);
    expect(editarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      fotoId: 'f1',
      payload: { identificacao: 'Nome novo' },
    });
    expect(screen.getByText(MENSAGEM_DE_FALHA)).toBeDefined();
  });

  it('deve mostrar o erro quando remover a foto falha', async () => {
    // Arrange
    removerMutateAsync.mockRejectedValueOnce(new Error('falha'));
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await confirmarRemocao(dialogo);

    // Assert
    expect(removerMutateAsync).toHaveBeenCalledTimes(1);
    expect(removerMutateAsync).toHaveBeenCalledWith({ modeloId: 'm1', fotoId: 'f1' });
    expect(screen.getByText('Operação não concluída')).toBeDefined();
    expect(screen.getByText(MENSAGEM_DE_FALHA)).toBeDefined();
  });

  it('deve fechar o carrossel quando Fechar é acionado', async () => {
    // Arrange
    const dialogo = await abrirCarrosselNaSegundaFoto();

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
