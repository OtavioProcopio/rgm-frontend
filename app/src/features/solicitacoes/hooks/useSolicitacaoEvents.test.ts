/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { evidenciasKeys } from '@/features/evidencias/hooks/evidenciasKeys';
import { ApiError } from '@/shared/api/apiError';
import { MockEventSource } from '@/test-utils/mockEventSource';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import type { Solicitacao } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';
import { useSolicitacaoEvents } from './useSolicitacaoEvents';

const mockUseAuth = vi.fn();
vi.mock('@/app/providers/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockRefreshAccessToken = vi.fn();
vi.mock('@/shared/api/httpClient', () => ({
  refreshAccessToken: () => mockRefreshAccessToken(),
}));

beforeEach(() => {
  MockEventSource.reset();
  localStorage.clear();
  vi.stubGlobal('EventSource', MockEventSource);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useSolicitacaoEvents', () => {
  it('does not connect when there is no authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('does not connect when there is a user but no stored token', () => {
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('connects with the stored token when a user is authenticated', () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain('token=token-abc');
  });

  it('invalidates solicitacoes queries when a solicitacao event arrives', async () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    MockEventSource.instances[0].emit('solicitacao');

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['solicitacoes']) }),
    );
  });

  it('closes the connection on unmount', () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    const { unmount } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    const closeSpy = vi.spyOn(MockEventSource.instances[0], 'close');
    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('reconnects with a fresh token after a fatal error (token expired)', async () => {
    vi.useFakeTimers();
    localStorage.setItem('rgm.accessToken', 'stale-token');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    mockRefreshAccessToken.mockImplementation(() => {
      localStorage.setItem('rgm.accessToken', 'fresh-token');
      return Promise.resolve();
    });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    expect(MockEventSource.instances).toHaveLength(1);

    MockEventSource.instances[0].readyState = MockEventSource.CLOSED;
    MockEventSource.instances[0].triggerError();

    await vi.advanceTimersByTimeAsync(3000);

    expect(MockEventSource.instances).toHaveLength(2);
    expect(mockRefreshAccessToken).toHaveBeenCalled();
    expect(MockEventSource.instances[1].url).toContain('token=fresh-token');
  });

  it('does not reconnect on a transient error (browser will retry on its own)', async () => {
    vi.useFakeTimers();
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    MockEventSource.instances[0].readyState = MockEventSource.CONNECTING;
    MockEventSource.instances[0].triggerError();

    await vi.advanceTimersByTimeAsync(5000);

    expect(MockEventSource.instances).toHaveLength(1);
    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
  });

  it('reconnects with a new user session when the authenticated user changes', () => {
    localStorage.setItem('rgm.accessToken', 'token-user-1');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op1', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    const { rerender } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    expect(MockEventSource.instances).toHaveLength(1);
    const closeSpy = vi.spyOn(MockEventSource.instances[0], 'close');

    localStorage.setItem('rgm.accessToken', 'token-user-2');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op2', perfil: 'GESTOR' } });
    rerender();

    expect(closeSpy).toHaveBeenCalled();
    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1].url).toContain('token=token-user-2');
  });
});

describe('useSolicitacaoEvents — eventos recebidos', () => {
  function conectar() {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    return { conexao: MockEventSource.instances[0], queryClient, invalidar };
  }

  it('deve atualizar as listas e o quadro quando outro usuário tria uma solicitação', () => {
    // Arrange
    const { conexao, invalidar } = conectar();

    // Act
    conexao.emit('solicitacao', { tipo: 'triada', solicitacao: criarSolicitacao({ status: 'EM_ANDAMENTO' }) });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
  });

  it('deve atualizar as listas quando outro usuário abre uma solicitação', () => {
    // Arrange
    const { conexao, invalidar, queryClient } = conectar();
    const nova = criarSolicitacao({ id: 'nova' });

    // Act
    conexao.emit('solicitacao', { tipo: 'aberta', solicitacao: nova });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
    expect(queryClient.getQueryData(solicitacoesKeys.detail('nova'))).toBeUndefined();
  });

  it('deve mostrar no detalhe aberto o status do evento, mantendo os responsáveis, e pedir a confirmação do detalhe e do histórico quando outro usuário devolve a solicitação', () => {
    // Arrange
    const { conexao, queryClient, invalidar } = conectar();
    const noDetalhe = criarSolicitacao({ status: 'EM_VALIDACAO', responsavelIds: ['op'], acoesPermitidas: ['DEVOLVER'] });
    queryClient.setQueryData(solicitacoesKeys.detail('s1'), noDetalhe);

    // Act
    conexao.emit('solicitacao', { tipo: 'devolvida', solicitacao: criarSolicitacao({ status: 'EM_ANDAMENTO' }) });

    // Assert
    const atualizado = queryClient.getQueryData<Solicitacao>(solicitacoesKeys.detail('s1'));
    expect(atualizado).toMatchObject({ status: 'EM_ANDAMENTO', responsavelIds: ['op'], acoesPermitidas: null });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.detail('s1') });
    expect(solicitacoesKeys.atividades('s1').slice(0, 3)).toEqual([...solicitacoesKeys.detail('s1')]);
  });

  it('deve contar a mudança da solicitação quando um evento dela chega', () => {
    // Arrange
    const { conexao, queryClient } = conectar();
    const evento = { tipo: 'editada', solicitacao: criarSolicitacao() };

    // Act
    conexao.emit('solicitacao', evento);
    conexao.emit('solicitacao', evento);

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.atualizacao('s1'))).toBe(2);
    expect(queryClient.getQueryData(solicitacoesKeys.atualizacao('outra'))).toBeUndefined();
  });

  it('deve atualizar o histórico e as evidências, sem contar mudança, quando outro usuário comenta', () => {
    // Arrange
    const { conexao, queryClient, invalidar } = conectar();

    // Act
    conexao.emit('solicitacao_atividade', { tipo: 'comentada', solicitacaoId: 's1' });

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.atividades('s1') });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: evidenciasKeys.bySolicitacao('s1') });
    expect(queryClient.getQueryData(solicitacoesKeys.atualizacao('s1'))).toBeUndefined();
  });

  it('deve só atualizar as listas quando o evento de solicitação vem sem corpo legível', () => {
    // Arrange
    const { conexao, invalidar } = conectar();

    // Act
    conexao.emit('solicitacao');

    // Assert
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
  });

  it('deve ignorar o aviso de atividade quando ele vem sem corpo legível', () => {
    // Arrange
    const { conexao, invalidar } = conectar();

    // Act
    conexao.emit('solicitacao_atividade');

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('deve parar de ouvir os dois eventos quando a tela é desmontada', () => {
    // Arrange
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { unmount } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    const conexao = MockEventSource.instances[0];

    // Act
    unmount();
    conexao.emit('solicitacao', { tipo: 'triada', solicitacao: criarSolicitacao() });
    conexao.emit('solicitacao_atividade', { tipo: 'comentada', solicitacaoId: 's1' });

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });
});

describe('useSolicitacaoEvents — reconexão', () => {
  function conectar() {
    vi.useFakeTimers();
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    mockRefreshAccessToken.mockResolvedValue(undefined);
    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { unmount } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    return { queryClient, invalidar, unmount };
  }

  function ultima() {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }

  function derrubar() {
    ultima().readyState = MockEventSource.CLOSED;
    ultima().triggerError();
  }

  it('deve não atualizar nenhuma consulta quando a conexão abre pela primeira vez', () => {
    // Arrange
    const { invalidar } = conectar();

    // Act
    ultima().emit('open');

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('deve atualizar as listas quando a conexão volta depois de cair', async () => {
    // Arrange
    const { invalidar } = conectar();
    ultima().emit('open');
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    ultima().emit('open');

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
  });

  it('deve atualizar os detalhes e os históricos abertos quando a conexão volta depois de cair', async () => {
    // Arrange
    const { invalidar } = conectar();
    ultima().emit('open');
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    ultima().emit('open');

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.details() });
  });

  it('deve atualizar as evidências quando a conexão volta depois de cair', async () => {
    // Arrange
    const { invalidar } = conectar();
    ultima().emit('open');
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    ultima().emit('open');

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: evidenciasKeys.all });
  });

  it('deve atualizar as consultas quando o navegador reabre a mesma conexão sozinho', () => {
    // Arrange
    const { invalidar } = conectar();
    ultima().emit('open');
    ultima().readyState = MockEventSource.CONNECTING;
    ultima().triggerError();

    // Act
    ultima().emit('open');

    // Assert
    expect(invalidar).toHaveBeenCalledWith({ queryKey: solicitacoesKeys.lists() });
  });

  it('deve tentar de novo quando a renovação da sessão falha por falta de rede', async () => {
    // Arrange
    conectar();
    mockRefreshAccessToken.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    await vi.advanceTimersByTimeAsync(6_000);

    // Assert
    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(2);
    expect(MockEventSource.instances).toHaveLength(2);
  });

  it('deve esperar mais a cada falha seguida da renovação', async () => {
    // Arrange
    conectar();
    mockRefreshAccessToken.mockRejectedValue(new TypeError('Failed to fetch'));
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    await vi.advanceTimersByTimeAsync(5_999);

    // Assert
    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('deve voltar à espera inicial quando a conexão cai de novo depois de restabelecida', async () => {
    // Arrange
    conectar();
    mockRefreshAccessToken.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    derrubar();
    await vi.advanceTimersByTimeAsync(9_000);
    ultima().emit('open');
    mockRefreshAccessToken.mockClear();
    derrubar();

    // Act
    await vi.advanceTimersByTimeAsync(3_000);

    // Assert
    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('deve parar de tentar quando a renovação é recusada por sessão expirada', async () => {
    // Arrange
    conectar();
    mockRefreshAccessToken.mockRejectedValue(new ApiError({ status: 401, message: 'Sessão expirada.' }));
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    await vi.advanceTimersByTimeAsync(120_000);

    // Assert
    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances).toHaveLength(1);
  });

  it('deve publicar a conexão como aberta quando ela abre', () => {
    // Arrange
    const { queryClient } = conectar();
    vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));

    // Act
    ultima().emit('open');

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.conexao())).toEqual({
      aberta: true,
      desde: Date.parse('2026-10-06T12:00:00Z'),
    });
  });

  it('deve publicar a conexão como fechada, com o instante da queda, quando ela cai', () => {
    // Arrange
    const { queryClient } = conectar();
    ultima().emit('open');
    vi.setSystemTime(new Date('2026-10-06T12:00:05Z'));

    // Act
    derrubar();

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.conexao())).toEqual({
      aberta: false,
      desde: Date.parse('2026-10-06T12:00:05Z'),
    });
  });

  it('deve manter o instante da primeira queda quando as tentativas seguintes também falham', async () => {
    // Arrange
    const { queryClient } = conectar();
    vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
    derrubar();
    await vi.advanceTimersByTimeAsync(3_000);

    // Act
    derrubar();

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.conexao())).toEqual({
      aberta: false,
      desde: Date.parse('2026-10-06T12:00:00Z'),
    });
  });

  it('deve esquecer o estado da conexão quando a tela é desmontada', () => {
    // Arrange
    const { queryClient, unmount } = conectar();
    ultima().emit('open');

    // Act
    unmount();

    // Assert
    expect(queryClient.getQueryData(solicitacoesKeys.conexao())).toBeUndefined();
  });
});
