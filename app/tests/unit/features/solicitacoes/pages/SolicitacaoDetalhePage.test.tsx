/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { createAppWrapper } from '@tests/support/appWrapper';

import { SolicitacaoDetalhePage } from '@/features/solicitacoes/pages/SolicitacaoDetalhePage';

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
vi.mock('@/features/solicitacoes/hooks/useSolicitacaoEvents', () => ({ useSolicitacaoEvents: vi.fn() }));
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
  usePerfil: vi.fn().mockReturnValue({ data: { id: 'u-admin', nome: 'Teste', email: 't@t.com', perfil: 'ADMINISTRADOR' } }),
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoStatusBadge', () => ({
  SolicitacaoStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoTimeline', () => ({
  SolicitacaoTimeline: () => <div data-testid="timeline" />,
}));
vi.mock('@/features/solicitacoes/components/TriagemModal', () => ({
  TriagemModal: ({ onConfirm }: { onConfirm: (d: unknown) => void }) => (
    <button onClick={() => onConfirm({ prioridade: 'ALTA', responsavelIds: [] })}>confirmar-triagem</button>
  ),
}));
vi.mock('@/features/solicitacoes/components/EncerramentoModal', () => ({
  EncerramentoModal: ({ onConfirm }: { onConfirm: (d: unknown) => void }) => (
    <button onClick={() => onConfirm({ concluir: true, comentario: 'ok' })}>confirmar-encerramento</button>
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
  EvidenciaList: () => <div data-testid="evidencia-list" />,
}));
vi.mock('@/features/evidencias/components/EvidenciaUploader', () => ({
  EvidenciaUploader: () => <div data-testid="evidencia-uploader" />,
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
  id: 's1', titulo: 'Reparo na Máquina A', descricao: 'Desc', tipo: 'REPARO' as const,
  status: 'A_FAZER' as const, prioridade: 'ALTA' as const, modeloId: 'm1', abertaPorUsuarioId: 'u1',
  comentarioFinal: null, criadaEm: '2024-01-01T00:00:00Z', atualizadaEm: '2024-01-01T00:00:00Z',
  concluidaEm: null, canceladaEm: null, responsavelIds: [],
};

afterEach(cleanup);

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
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /triar/i })).toBeDefined();
  });

  it('shows Encerrar button for GESTOR when in EM_VALIDACAO', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /encerrar/i })).toBeDefined();
  });

  it('shows Devolver button for GESTOR when in EM_VALIDACAO', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /devolver/i })).toBeDefined();
  });

  it('shows Voltar button in loaded state', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao, isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /voltar/i })).toBeDefined();
  });

  it('shows solicitacao tipo and descricao', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, tipo: 'INSPECAO', descricao: 'Verificar pressão' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/verificar pressão/i)).toBeDefined();
  });

  it('opens triagem modal and calls handleTriar', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useTriarSolicitacao } = await import('@/features/solicitacoes/hooks/useTriarSolicitacao');
    const triarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTriarSolicitacao).mockReturnValue({ mutateAsync: triarMock, isPending: false } as unknown as ReturnType<typeof useTriarSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'A_FAZER' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /triar/i }));
    await userEvent.click(within(container).getByText('confirmar-triagem'));
    expect(triarMock).toHaveBeenCalled();
  });

  it('opens enviarValidacao modal when button is clicked', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useEnviarParaValidacao } = await import('@/features/solicitacoes/hooks/useEnviarParaValidacao');
    const enviarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEnviarParaValidacao).mockReturnValue({ mutateAsync: enviarMock, isPending: false } as unknown as ReturnType<typeof useEnviarParaValidacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_ANDAMENTO', responsavelIds: ['u1'] },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /enviar para validação/i }));
    // Modal should now be visible — getByText throws if not found
    within(container).getByText(/Descrição do serviço realizado/i);
  });

  it('opens encerramento modal and calls handleEncerrar', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useEncerrarSolicitacao } = await import('@/features/solicitacoes/hooks/useEncerrarSolicitacao');
    const encerrarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEncerrarSolicitacao).mockReturnValue({ mutateAsync: encerrarMock, isPending: false } as unknown as ReturnType<typeof useEncerrarSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /encerrar/i }));
    await userEvent.click(within(container).getByText('confirmar-encerramento'));
    expect(encerrarMock).toHaveBeenCalled();
  });

  it('opens devolucao modal and calls handleDevolver', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useDevolverSolicitacao } = await import('@/features/solicitacoes/hooks/useDevolverSolicitacao');
    const devolverMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDevolverSolicitacao).mockReturnValue({ mutateAsync: devolverMock, isPending: false } as unknown as ReturnType<typeof useDevolverSolicitacao>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_VALIDACAO' },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByRole('button', { name: /devolver/i }));
    await userEvent.click(within(container).getByText('confirmar-devolucao'));
    expect(devolverMock).toHaveBeenCalled();
  });

  it('calls handleComentario when submitted', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    const { useRegistrarComentario } = await import('@/features/solicitacoes/hooks/useRegistrarComentario');
    const comentarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRegistrarComentario).mockReturnValue({ mutateAsync: comentarMock, isPending: false } as unknown as ReturnType<typeof useRegistrarComentario>);
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao, isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('enviar-comentario'));
    expect(comentarMock).toHaveBeenCalled();
  });

  it('shows evidence list and uploader', async () => {
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: mockSolicitacao, isLoading: false, error: null,
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
      data: mockSolicitacao, isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);

    const { AppWrapper } = createAppWrapper({
      user: { nome: 'G', perfil: 'GESTOR' },
      initialEntries: ['/solicitacoes/s1'],
    });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    await userEvent.click(within(container).getByRole('button', { name: /^editar$/i }));

    expect(within(container).getByText(/não pode ser alterado/i)).toBeDefined();
    expect(container.querySelector('select')).toBeNull();
  });

  it('deve mostrar só os responsáveis disponíveis quando o gestor abre Alterar responsáveis', async () => {
    // Arrange
    const { useSolicitacao } = await import('@/features/solicitacoes/hooks/useSolicitacao');
    vi.mocked(useSolicitacao).mockReturnValue({
      data: { ...mockSolicitacao, status: 'EM_ANDAMENTO', responsavelIds: ['op'] },
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useSolicitacao>);
    const usuario = { email: null, ativo: true, criadoEm: '', atualizadoEm: '' };
    vi.mocked(usuariosApi.listar).mockResolvedValueOnce({
      content: [
        { ...usuario, id: 'op', nome: 'Olga Operadora', perfil: 'OPERADOR' },
        { ...usuario, id: 'ge', nome: 'Gil Gestor', perfil: 'GESTOR' },
        { ...usuario, id: 'ad', nome: 'Ana Administradora', perfil: 'ADMINISTRADOR' },
        { ...usuario, id: 'in', nome: 'Ivo Inativo', perfil: 'OPERADOR', ativo: false },
      ],
      page: 0, totalPages: 1, totalElements: 4,
    } as Awaited<ReturnType<typeof usuariosApi.listar>>);
    const { AppWrapper } = createAppWrapper({ user: { nome: 'G', perfil: 'GESTOR' }, initialEntries: ['/solicitacoes/s1'] });
    const { container } = render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Alterar responsáveis' }));

    // Assert
    expect(await within(container).findByText('Olga Operadora')).toBeDefined();
    expect(within(container).getByText('Gil Gestor')).toBeDefined();
    expect(within(container).queryByText('Ana Administradora')).toBeNull();
    expect(within(container).queryByText('Ivo Inativo')).toBeNull();
  });

  it('deve ouvir os eventos de tempo real quando o detalhe é aberto', async () => {
    // Arrange
    const { useSolicitacaoEvents } = await import('@/features/solicitacoes/hooks/useSolicitacaoEvents');
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/solicitacoes/s1'] });

    // Act
    render(<SolicitacaoDetalhePage />, { wrapper: AppWrapper });

    // Assert
    expect(useSolicitacaoEvents).toHaveBeenCalled();
  });
});
