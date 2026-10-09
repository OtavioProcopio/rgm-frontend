/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { ancestralComum } from '@tests/support/ancestralComum';
import { createAppWrapper } from '@tests/support/appWrapper';

import { SolicitacaoDetalhePage } from '@/features/solicitacoes/pages/SolicitacaoDetalhePage';
import { useEditarSolicitacao } from '@/features/solicitacoes/hooks/useEditarSolicitacao';
import { useRegistrarComentario } from '@/features/solicitacoes/hooks/useRegistrarComentario';
import { useDeleteEvidencia } from '@/features/evidencias/hooks/useDeleteEvidencia';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { ApiError } from '@/shared/api/apiError';
import { SolicitacaoResumo } from '@/features/solicitacoes/components/SolicitacaoResumo';
import { useSolicitacao } from '@/features/solicitacoes/hooks/useSolicitacao';
import { useVoltar } from '@/shared/hooks/useVoltar';
import { LIMITES } from '@/shared/lib/limites';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: {
    alterarResponsaveis: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/features/admin/usuarios/api/usuariosApi', () => ({
  usuariosApi: {
    listar: vi.fn().mockResolvedValue({ content: [], totalElements: 0, page: 0, totalPages: 0 }),
  },
}));

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: {
    listar: vi.fn().mockResolvedValue([]),
    upload: vi.fn().mockResolvedValue({}),
    deletar: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/features/solicitacoes/hooks/useAlterarResponsaveis', () => ({
  useAlterarResponsaveis: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/evidencias/hooks/useDeleteEvidencia', () => ({
  useDeleteEvidencia: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/solicitacoes/hooks/useSolicitacao', () => ({
  useSolicitacao: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('@/features/solicitacoes/hooks/useAtividades', () => ({
  useAtividades: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useTriarSolicitacao', () => ({
  useTriarSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useEnviarParaValidacao', () => ({
  useEnviarParaValidacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useEncerrarSolicitacao', () => ({
  useEncerrarSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useCancelarSolicitacao', () => ({
  useCancelarSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useDevolverSolicitacao', () => ({
  useDevolverSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useRegistrarComentario', () => ({
  useRegistrarComentario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/solicitacoes/hooks/useEditarSolicitacao', () => ({
  useEditarSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/evidencias/hooks/useEvidencias', () => ({
  useEvidencias: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));
vi.mock('@/features/evidencias/hooks/useUploadEvidencia', () => ({
  useUploadEvidencia: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({
    data: { id: 'u-admin', nome: 'Teste', email: 't@t.com', perfil: 'ADMINISTRADOR' },
  }),
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoStatusBadge', () => ({
  SolicitacaoStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoTimeline', () => ({
  SolicitacaoTimeline: ({ formulario }: { formulario?: ReactNode }) => (
    <div data-testid="timeline">{formulario}</div>
  ),
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoResumo', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/features/solicitacoes/components/SolicitacaoResumo')>();
  return { SolicitacaoResumo: vi.fn(original.SolicitacaoResumo) };
});
vi.mock('@/shared/hooks/useVoltar', () => ({ useVoltar: vi.fn() }));
vi.mock('@/features/solicitacoes/components/TriagemModal', () => ({
  TriagemModal: ({ onConfirm }: { onConfirm: (d: unknown) => void }) => (
    <button onClick={() => onConfirm({ prioridade: 'ALTA', responsavelIds: [] })}>
      confirmar-triagem
    </button>
  ),
}));
vi.mock('@/features/solicitacoes/components/EncerramentoModal', () => ({
  EncerramentoModal: ({ onConfirm }: { onConfirm: (d: unknown) => void }) => (
    <button onClick={() => onConfirm({ concluir: true, comentario: 'ok' })}>
      confirmar-encerramento
    </button>
  ),
}));
vi.mock('@/features/solicitacoes/components/DevolucaoModal', () => ({
  DevolucaoModal: ({ onConfirm }: { onConfirm: (d: unknown) => void }) => (
    <button onClick={() => onConfirm({ motivo: 'errado' })}>confirmar-devolucao</button>
  ),
}));
vi.mock('@/features/solicitacoes/components/ComentarioForm', () => ({
  ComentarioForm: ({ onSubmit }: { onSubmit: (d: unknown) => void }) => (
    <button onClick={() => onSubmit({ comentario: 'ok' })}>enviar-comentario</button>
  ),
}));
vi.mock('@/features/evidencias/components/EvidenciaList', () => ({
  EvidenciaList: ({ onDelete }: { onDelete?: (id: string) => void }) => (
    <div data-testid="evidencia-list">
      {onDelete ? <button onClick={() => onDelete('ev1')}>excluir-evidencia</button> : null}
    </div>
  ),
}));
vi.mock('@/features/evidencias/components/EvidenciaUploader', () => ({
  EvidenciaUploader: ({ onUpload }: { onUpload: (f: File) => void }) => (
    <div data-testid="evidencia-uploader">
      <button onClick={() => onUpload(new File(['x'], 'foto.png', { type: 'image/png' }))}>
        anexar-evidencia
      </button>
    </div>
  ),
}));
vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined }),
}));
vi.mock('@/features/admin/usuarios/api/usuariosApi', () => ({
  usuariosApi: {
    listar: vi.fn().mockResolvedValue({ content: [], page: 0, totalPages: 0, totalElements: 0 }),
  },
}));

const mockSolicitacao = {
  id: 's1',
  titulo: 'Reparo na Máquina A',
  descricao: 'Desc',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: 'ALTA' as const,
  modeloId: 'm1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  criadaEm: '2024-01-01T00:00:00Z',
  atualizadaEm: '2024-01-01T00:00:00Z',
  concluidaEm: null,
  canceladaEm: null,
  responsavelIds: [],
};

const voltarMock = vi.fn();

beforeEach(() => {
  vi.mocked(useVoltar).mockReturnValue(voltarMock);
});

afterEach(() => {
  cleanup();
  voltarMock.mockClear();
  vi.mocked(useVoltar).mockClear();
});

describe('SolicitacaoDetalhePage', () => {
  it('shows loading state while fetching', () => {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows solicitacao details when loaded', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Reparo na Máquina A')).toBeDefined();
  });

  it('shows error state when fetch fails', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Falha'),
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível/i)).toBeDefined();
  });

  it('shows Triagem button for GESTOR when status is A_FAZER', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'A_FAZER' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /triar/i })).toBeDefined();
  });

  it('shows Encerrar button for GESTOR when in EM_VALIDACAO', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /encerrar/i })).toBeDefined();
  });

  it('deve mostrar Devolver em Mais ações quando o gestor vê a solicitação Em Validação', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Mais ações' }));

    // Assert
    expect(within(container).getByRole('menuitem', { name: /devolver/i })).toBeDefined();
  });

  function abrirComoGestor(solicitacao: Record<string, unknown> = mockSolicitacao) {
    vi.mocked(useSolicitacao).mockReturnValue({
      data: solicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    return within(container);
  }

  it('deve mostrar a ação principal da etapa como botão e Mais ações quando há outras ações', () => {
    // Arrange
    const solicitacao = { ...mockSolicitacao, status: 'A_FAZER' };

    // Act
    const tela = abrirComoGestor(solicitacao);

    // Assert
    expect(tela.getByRole('button', { name: 'Triar' })).toBeDefined();
    expect(tela.getByRole('button', { name: 'Mais ações' })).toBeDefined();
  });

  it('deve listar Editar em Mais ações quando o gestor pode editar e há outras ações', async () => {
    // Arrange
    const tela = abrirComoGestor({ ...mockSolicitacao, status: 'A_FAZER' });

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Mais ações' }));

    // Assert
    expect(tela.getByRole('menuitem', { name: 'Editar' })).toBeDefined();
    expect(tela.queryByRole('button', { name: 'Editar' })).toBeNull();
  });

  it('deve abrir a edição quando Editar é escolhido em Mais ações', async () => {
    // Arrange
    const tela = abrirComoGestor({ ...mockSolicitacao, status: 'A_FAZER' });
    await userEvent.click(tela.getByRole('button', { name: 'Mais ações' }));

    // Act
    await userEvent.click(tela.getByRole('menuitem', { name: 'Editar' }));

    // Assert
    expect(tela.getByLabelText('Título')).toBeDefined();
    expect(tela.queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });

  it('deve mostrar Voltar como botão acima do título quando a solicitação está carregada', () => {
    // Arrange
    const tela = abrirComoGestor();

    // Act
    const voltar = tela.getByRole('button', { name: 'Voltar' });
    const titulo = tela.getByRole('heading', { name: mockSolicitacao.titulo });

    // Assert
    const antes = voltar.compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(antes).toBeTruthy();
    expect(titulo.parentElement?.contains(voltar)).toBe(false);
  });

  it('deve chamar a volta com a reserva da lista quando Voltar é acionado', async () => {
    // Arrange
    const tela = abrirComoGestor();

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Voltar' }));

    // Assert
    expect(useVoltar).toHaveBeenCalledWith('/app/solicitacoes');
    expect(voltarMock).toHaveBeenCalledTimes(1);
  });

  it('deve não mostrar o bloco Ações nem o título Adicionar comentário quando a página carrega', () => {
    // Arrange
    const tela = abrirComoGestor();

    // Act
    const titulos = tela.queryAllByRole('heading').map((h) => h.textContent);

    // Assert
    expect(titulos).not.toContain('Ações');
    expect(titulos).not.toContain('Adicionar comentário');
  });

  it('deve mostrar o campo de comentário dentro da linha do tempo quando a solicitação não é terminal', () => {
    // Arrange
    const tela = abrirComoGestor();

    // Act
    const linhaDoTempo = tela.getByTestId('timeline');

    // Assert
    expect(within(linhaDoTempo).getByText('enviar-comentario')).toBeDefined();
  });

  it.each(['CONCLUIDA', 'CANCELADA'] as const)(
    'deve não mostrar o campo de comentário quando a solicitação está %s',
    (status) => {
      // Arrange
      const tela = abrirComoGestor({ ...mockSolicitacao, status });

      // Act
      const campo = tela.queryByText('enviar-comentario');

      // Assert
      expect(campo).toBeNull();
    },
  );

  it('deve passar atividades e usuários ao resumo quando a página carrega', () => {
    // Arrange
    vi.mocked(SolicitacaoResumo).mockClear();

    // Act
    abrirComoGestor();

    // Assert
    const props = vi.mocked(SolicitacaoResumo).mock.calls[0][0];
    expect(props.atividades).toEqual([]);
    expect(props.usuarios).toEqual([]);
  });

  it('deve mostrar a abertura em tempo relativo sem segundos quando a página carrega', () => {
    // Arrange
    const tela = abrirComoGestor();

    // Act
    const subtitulo = tela.getByText(/^Aberta há \d+ d$/);

    // Assert
    expect(subtitulo.textContent).not.toMatch(/\d{2}:\d{2}/);
  });

  it('deve mostrar o título sem a abertura quando criadaEm é malformado', () => {
    // Arrange
    const solicitacao = { ...mockSolicitacao, criadaEm: 'lixo' };

    // Act
    const tela = abrirComoGestor(solicitacao);

    // Assert
    expect(tela.getByText('Reparo na Máquina A')).toBeDefined();
    expect(tela.queryByText(/^Aberta há/)).toBeNull();
  });

  it('shows solicitacao tipo and descricao', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, tipo: 'INSPECAO', descricao: 'Verificar pressão' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/verificar pressão/i)).toBeDefined();
  });

  it('deve triar com prioridade e responsáveis quando a triagem é confirmada no modal', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useTriarSolicitacao } =
      await import('@/features/solicitacoes/hooks/useTriarSolicitacao');
    const triarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTriarSolicitacao).mockReturnValue({
      mutateAsync: triarMock,
      isPending: false,
    } as unknown as ReturnType<typeof useTriarSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'A_FAZER' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /triar/i }));

    // Act
    await userEvent.click(within(container).getByText('confirmar-triagem'));

    // Assert
    expect(triarMock).toHaveBeenCalledTimes(1);
    expect(triarMock).toHaveBeenCalledWith({ prioridade: 'ALTA', responsavelIds: [] });
  });

  it('opens enviarValidacao modal when button is clicked', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useEnviarParaValidacao } =
      await import('@/features/solicitacoes/hooks/useEnviarParaValidacao');
    const enviarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEnviarParaValidacao).mockReturnValue({
      mutateAsync: enviarMock,
      isPending: false,
    } as unknown as ReturnType<typeof useEnviarParaValidacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_ANDAMENTO', responsavelIds: ['u1'] },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(
      within(container).getByRole('button', { name: /enviar para validação/i }),
    );
    // Modal should now be visible — getByText throws if not found
    within(container).getByText(/Descrição do serviço realizado/i);
  });

  it('deve encerrar com conclusão e comentário quando o encerramento é confirmado no modal', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useEncerrarSolicitacao } =
      await import('@/features/solicitacoes/hooks/useEncerrarSolicitacao');
    const encerrarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEncerrarSolicitacao).mockReturnValue({
      mutateAsync: encerrarMock,
      isPending: false,
    } as unknown as ReturnType<typeof useEncerrarSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /encerrar/i }));

    // Act
    await userEvent.click(within(container).getByText('confirmar-encerramento'));

    // Assert
    expect(encerrarMock).toHaveBeenCalledTimes(1);
    expect(encerrarMock).toHaveBeenCalledWith({ concluir: true, comentario: 'ok' });
  });

  it('deve devolver com o motivo quando a devolução é confirmada no modal', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useDevolverSolicitacao } =
      await import('@/features/solicitacoes/hooks/useDevolverSolicitacao');
    const devolverMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDevolverSolicitacao).mockReturnValue({
      mutateAsync: devolverMock,
      isPending: false,
    } as unknown as ReturnType<typeof useDevolverSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(within(container).getByRole('menuitem', { name: /devolver/i }));

    // Act
    await userEvent.click(within(container).getByText('confirmar-devolucao'));

    // Assert
    expect(devolverMock).toHaveBeenCalledTimes(1);
    expect(devolverMock).toHaveBeenCalledWith({ motivo: 'errado' });
  });

  it('deve registrar o comentário quando o formulário de comentário é enviado', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useRegistrarComentario } =
      await import('@/features/solicitacoes/hooks/useRegistrarComentario');
    const comentarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRegistrarComentario).mockReturnValue({
      mutateAsync: comentarMock,
      isPending: false,
    } as unknown as ReturnType<typeof useRegistrarComentario>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByText('enviar-comentario'));

    // Assert
    expect(comentarMock).toHaveBeenCalledTimes(1);
    expect(comentarMock).toHaveBeenCalledWith({ comentario: 'ok' });
  });

  it('shows evidence list and uploader', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('evidencia-list')).toBeDefined();
  });

  it('shows the pretended model data for a CRIACAO solicitacao without a modelo yet', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: {
        ...mockSolicitacao,
        tipo: 'CRIACAO',
        modeloId: null,
        modeloCodigo: 'COD-XYZ',
        modeloMaquina: 'FBOX',
        modeloObservacoes: 'Observação livre',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    expect(within(container).getByText('Modelo pretendido')).toBeDefined();
    expect(within(container).getByText('COD-XYZ — FBOX')).toBeDefined();
    expect(within(container).getByText(/será criado ao concluir/i)).toBeDefined();
  });

  it('shows tipo as read-only text in edit mode (imutável após a abertura)', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    await userEvent.click(within(container).getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(within(container).getByRole('menuitem', { name: 'Editar' }));

    expect(within(container).getByText(/não pode ser alterado/i)).toBeDefined();
    expect(container.querySelector('select')).toBeNull();
  });

  it('deve mostrar só os responsáveis disponíveis quando o gestor abre Alterar responsáveis', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_ANDAMENTO', responsavelIds: ['op'] },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    const usuario = { email: null, ativo: true, criadoEm: '', atualizadoEm: '' };
    vi.mocked(usuariosApi.listar).mockResolvedValueOnce({
      content: [
        { ...usuario, id: 'op', nome: 'Olga Operadora', perfil: 'OPERADOR' },
        { ...usuario, id: 'ge', nome: 'Gil Gestor', perfil: 'GESTOR' },
        { ...usuario, id: 'ad', nome: 'Ana Administradora', perfil: 'ADMINISTRADOR' },
        { ...usuario, id: 'in', nome: 'Ivo Inativo', perfil: 'OPERADOR', ativo: false },
      ],
      page: 0,
      totalPages: 1,
      totalElements: 4,
    } as Awaited<ReturnType<typeof usuariosApi.listar>>);
    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(
      within(container).getByRole('menuitem', { name: 'Alterar responsáveis' }),
    );

    // Assert
    const dialogo = within(await within(container).findByRole('dialog'));
    expect(await dialogo.findByText('Olga Operadora')).toBeDefined();
    expect(dialogo.getByText('Gil Gestor')).toBeDefined();
    expect(dialogo.queryByText('Ana Administradora')).toBeNull();
    expect(dialogo.queryByText('Ivo Inativo')).toBeNull();
  });
});

describe('SolicitacaoDetalhePage — edição', () => {
  const PERGUNTA = 'Descartar alterações?';

  function botaoCancelarEdicao(tela: ReturnType<typeof within>) {
    return tela.getByRole('button', { name: 'Cancelar' });
  }

  /** Abre a solicitação como gestor, entra na edição e devolve a função que salva. */
  async function abrirEdicao() {
    const editar = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    vi.mocked(useEditarSolicitacao).mockReturnValue({
      mutateAsync: editar,
      isPending: false,
    } as unknown as ReturnType<typeof useEditarSolicitacao>);
    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    const tela = within(container);
    await userEvent.click(tela.getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(tela.getByRole('menuitem', { name: 'Editar' }));
    return { editar, tela };
  }

  it.each([
    ['Título', 'solicitacaoTitulo'],
    ['Descrição', 'textoLongo'],
  ] as const)('deve limitar o campo %s ao tamanho que a API grava', async (rotulo, limite) => {
    // Arrange
    const esperado = LIMITES[limite];

    // Act
    const { tela } = await abrirEdicao();
    const campo = tela.getByLabelText(rotulo) as HTMLInputElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });

  it('deve pôr os campos da edição sobre a superfície suave com a borda do tema quando a edição é aberta', async () => {
    // Arrange
    const esperado = ['border-line', 'bg-surface-muted'];

    // Act
    const { tela } = await abrirEdicao();
    const moldura = ancestralComum(tela.getByLabelText('Título'), tela.getByLabelText('Descrição'));

    // Assert
    expect(moldura.className.split(' ')).toEqual(expect.arrayContaining(esperado));
  });

  it.each(['Evidências', 'Histórico de atividades'])(
    'deve mostrar o título da seção no texto secundário quando a seção é %s',
    async (secao) => {
      // Act
      const { tela } = await abrirEdicao();
      const titulo = tela.getByRole('heading', { name: secao });

      // Assert
      expect(titulo.className.split(' ')).toContain('text-fg-muted');
    },
  );

  it('deve recusar a edição com a mensagem do esquema quando o título fica só com espaços', async () => {
    // Arrange
    const { editar, tela } = await abrirEdicao();
    await userEvent.clear(tela.getByLabelText('Título'));
    await userEvent.type(tela.getByLabelText('Título'), '   ');

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(tela.getByText('Título obrigatório')).toBeDefined();
    expect(editar).not.toHaveBeenCalled();
  });

  it('deve recusar a edição com a mensagem do esquema quando a descrição fica vazia', async () => {
    // Arrange
    const { editar, tela } = await abrirEdicao();
    await userEvent.clear(tela.getByLabelText('Descrição'));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(tela.getByText('Descrição obrigatória')).toBeDefined();
    expect(editar).not.toHaveBeenCalled();
  });

  it('deve salvar o título e a descrição sem espaços nas pontas quando a edição é válida', async () => {
    // Arrange
    const novoTitulo = 'Reparo na Máquina B';
    const { editar, tela } = await abrirEdicao();
    await userEvent.clear(tela.getByLabelText('Título'));
    await userEvent.type(tela.getByLabelText('Título'), `  ${novoTitulo}  `);

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(editar).toHaveBeenCalledWith({
      titulo: novoTitulo,
      descricao: mockSolicitacao.descricao,
    });
  });

  it('deve não mostrar Mais ações quando a edição mostra só Salvar e Cancelar', async () => {
    // Arrange
    const { tela } = await abrirEdicao();

    // Act
    const salvar = tela.getByRole('button', { name: 'Salvar' });

    // Assert
    expect(salvar).toBeDefined();
    expect(botaoCancelarEdicao(tela)).toBeDefined();
    expect(tela.queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });

  it('deve fechar a edição sem perguntar quando cancelar é acionado sem alteração', async () => {
    // Arrange
    const { tela } = await abrirEdicao();

    // Act
    await userEvent.click(botaoCancelarEdicao(tela));

    // Assert
    expect(tela.queryByText(PERGUNTA)).toBeNull();
    expect(tela.queryByLabelText('Título')).toBeNull();
  });

  it('deve perguntar antes de descartar quando cancelar é acionado com alteração não salva', async () => {
    // Arrange
    const { tela } = await abrirEdicao();
    await userEvent.type(tela.getByLabelText('Descrição'), ' com detalhe');

    // Act
    await userEvent.click(botaoCancelarEdicao(tela));

    // Assert
    expect(tela.getByRole('dialog', { name: PERGUNTA })).toBeDefined();
    expect(tela.getByLabelText('Título')).toBeDefined();
  });

  it('deve manter a alteração quando o usuário escolhe continuar editando', async () => {
    // Arrange
    const acrescimo = ' com detalhe';
    const { tela } = await abrirEdicao();
    await userEvent.type(tela.getByLabelText('Descrição'), acrescimo);
    await userEvent.click(botaoCancelarEdicao(tela));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Continuar editando' }));

    // Assert
    expect(tela.queryByRole('dialog')).toBeNull();
    expect((tela.getByLabelText('Descrição') as HTMLTextAreaElement).value).toBe(
      `${mockSolicitacao.descricao}${acrescimo}`,
    );
  });

  it('deve fechar a edição sem salvar quando o usuário confirma o descarte', async () => {
    // Arrange
    const { editar, tela } = await abrirEdicao();
    await userEvent.type(tela.getByLabelText('Descrição'), ' com detalhe');
    await userEvent.click(botaoCancelarEdicao(tela));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(tela.queryByRole('dialog')).toBeNull();
    expect(tela.queryByLabelText('Título')).toBeNull();
    expect(editar).not.toHaveBeenCalled();
  });

  it('deve mostrar o erro da ação e manter a edição aberta quando salvar falha', async () => {
    // Arrange
    const { editar, tela } = await abrirEdicao();
    editar.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Conflito ao salvar' }));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(editar).toHaveBeenCalledTimes(1);
    expect(editar).toHaveBeenCalledWith({
      titulo: mockSolicitacao.titulo,
      descricao: mockSolicitacao.descricao,
    });
    expect(tela.getByText('Operação não concluída')).toBeDefined();
    expect(tela.getByText('Conflito ao salvar')).toBeDefined();
    expect(tela.getByLabelText('Título')).toBeDefined();
  });
});

describe('SolicitacaoDetalhePage — comentário e evidências', () => {
  function abrirComo(perfil: 'GESTOR' | 'OPERADOR', sobrescritas: Record<string, unknown> = {}) {
    const mutacoes = {
      comentar: vi.fn().mockResolvedValue(undefined),
      upload: vi.fn().mockResolvedValue(undefined),
      excluir: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(useRegistrarComentario).mockReturnValue({
      mutateAsync: mutacoes.comentar,
      isPending: false,
    } as unknown as ReturnType<typeof useRegistrarComentario>);
    vi.mocked(useUploadEvidencia).mockReturnValue({
      mutateAsync: mutacoes.upload,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadEvidencia>);
    vi.mocked(useDeleteEvidencia).mockReturnValue({
      mutateAsync: mutacoes.excluir,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteEvidencia>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, ...sobrescritas },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    const { AppWrapper } = createAppWrapper({
      user: { nome: 'U', perfil },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    return { ...mutacoes, tela: within(container) };
  }

  it('deve mostrar o erro da ação quando enviar o comentário falha', async () => {
    // Arrange
    const { comentar, tela } = abrirComo('GESTOR');
    comentar.mockRejectedValueOnce(new ApiError({ status: 500, message: 'Comentário recusado' }));

    // Act
    await userEvent.click(tela.getByText('enviar-comentario'));

    // Assert
    expect(comentar).toHaveBeenCalledTimes(1);
    expect(comentar).toHaveBeenCalledWith({ comentario: 'ok' });
    expect(tela.getByText('Comentário recusado')).toBeDefined();
  });

  it('deve usar a mensagem padrão quando o erro do comentário não é da API', async () => {
    // Arrange
    const { comentar, tela } = abrirComo('GESTOR');
    comentar.mockRejectedValueOnce(new Error('rede'));

    // Act
    await userEvent.click(tela.getByText('enviar-comentario'));

    // Assert
    expect(comentar).toHaveBeenCalledTimes(1);
    expect(tela.getByText('Ocorreu um erro inesperado.')).toBeDefined();
  });

  it('deve enviar o arquivo e não mostrar erro quando anexar a evidência dá certo', async () => {
    // Arrange
    const { upload, tela } = abrirComo('GESTOR');

    // Act
    await userEvent.click(tela.getByText('anexar-evidencia'));

    // Assert
    expect(upload).toHaveBeenCalledTimes(1);
    const enviado = upload.mock.calls[0][0] as { file: File };
    expect(enviado.file.name).toBe('foto.png');
    expect(tela.queryByText('Operação não concluída')).toBeNull();
  });

  it('deve mostrar o erro da ação quando anexar a evidência falha', async () => {
    // Arrange
    const { upload, tela } = abrirComo('GESTOR');
    upload.mockRejectedValueOnce(new ApiError({ status: 413, message: 'Arquivo grande demais' }));

    // Act
    await userEvent.click(tela.getByText('anexar-evidencia'));

    // Assert
    expect(upload).toHaveBeenCalledTimes(1);
    expect(tela.getByText('Operação não concluída')).toBeDefined();
    expect(tela.getByText('Arquivo grande demais')).toBeDefined();
  });

  it('deve excluir a evidência pelo identificador quando o gestor aciona excluir', async () => {
    // Arrange
    const { excluir, tela } = abrirComo('GESTOR');

    // Act
    await userEvent.click(tela.getByText('excluir-evidencia'));

    // Assert
    expect(excluir).toHaveBeenCalledTimes(1);
    expect(excluir).toHaveBeenCalledWith('ev1');
    expect(tela.queryByText('Operação não concluída')).toBeNull();
  });

  it('deve mostrar o erro da ação quando excluir a evidência falha', async () => {
    // Arrange
    const { excluir, tela } = abrirComo('GESTOR');
    excluir.mockRejectedValueOnce(new ApiError({ status: 403, message: 'Sem permissão' }));

    // Act
    await userEvent.click(tela.getByText('excluir-evidencia'));

    // Assert
    expect(excluir).toHaveBeenCalledTimes(1);
    expect(excluir).toHaveBeenCalledWith('ev1');
    expect(tela.getByText('Sem permissão')).toBeDefined();
  });

  it('deve esconder anexar e excluir quando o operador não abriu nem é responsável', () => {
    // Arrange
    const sobrescritas = { abertaPorUsuarioId: 'outro', responsavelIds: [] };

    // Act
    const { tela } = abrirComo('OPERADOR', sobrescritas);

    // Assert
    expect(tela.queryByText('anexar-evidencia')).toBeNull();
    expect(tela.queryByText('excluir-evidencia')).toBeNull();
  });

  it('deve permitir anexar quando o operador é o responsável pela solicitação', () => {
    // Arrange
    const sobrescritas = { abertaPorUsuarioId: 'outro', responsavelIds: ['u-admin'] };

    // Act
    const { tela } = abrirComo('OPERADOR', sobrescritas);

    // Assert
    expect(tela.getByText('anexar-evidencia')).toBeDefined();
    expect(tela.getByText('excluir-evidencia')).toBeDefined();
  });

  it('deve permitir anexar quando o operador abriu a solicitação', () => {
    // Arrange
    const sobrescritas = { abertaPorUsuarioId: 'u-admin', responsavelIds: [] };

    // Act
    const { tela } = abrirComo('OPERADOR', sobrescritas);

    // Assert
    expect(tela.getByText('anexar-evidencia')).toBeDefined();
  });

  it('deve esconder anexar e excluir quando a solicitação está concluída', () => {
    // Arrange
    const sobrescritas = { status: 'CONCLUIDA' };

    // Act
    const { tela } = abrirComo('GESTOR', sobrescritas);

    // Assert
    expect(tela.queryByText('anexar-evidencia')).toBeNull();
    expect(tela.queryByText('excluir-evidencia')).toBeNull();
  });
});
