/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useSolicitacaoEvents } from './useSolicitacaoEvents';

const mockUseAuth = vi.fn();
vi.mock('@/app/providers/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockRefreshAccessToken = vi.fn();
vi.mock('@/shared/api/httpClient', () => ({
  refreshAccessToken: () => mockRefreshAccessToken(),
}));

class MockEventSource {
  static CLOSED = 2;
  static OPEN = 1;
  static CONNECTING = 0;

  readyState = MockEventSource.OPEN;
  url: string;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, Set<() => void>>();

  constructor(url: string) {
    this.url = url;
    instances.push(this);
  }

  addEventListener(type: string, listener: () => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  emit(type: string) {
    this.listeners.get(type)?.forEach((listener) => listener());
  }

  triggerError() {
    this.onerror?.();
  }
}

let instances: MockEventSource[] = [];

beforeEach(() => {
  instances = [];
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

    expect(instances).toHaveLength(0);
  });

  it('does not connect when there is a user but no stored token', () => {
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    expect(instances).toHaveLength(0);
  });

  it('connects with the stored token when a user is authenticated', () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    expect(instances).toHaveLength(1);
    expect(instances[0].url).toContain('token=token-abc');
  });

  it('invalidates solicitacoes queries when a solicitacao event arrives', async () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    instances[0].emit('solicitacao');

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['solicitacoes']) }),
    );
  });

  it('closes the connection on unmount', () => {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    const { unmount } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    const closeSpy = vi.spyOn(instances[0], 'close');
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
    expect(instances).toHaveLength(1);

    instances[0].readyState = MockEventSource.CLOSED;
    instances[0].triggerError();

    await vi.advanceTimersByTimeAsync(3000);

    expect(instances).toHaveLength(2);
    expect(mockRefreshAccessToken).toHaveBeenCalled();
    expect(instances[1].url).toContain('token=fresh-token');
  });

  it('does not reconnect on a transient error (browser will retry on its own)', async () => {
    vi.useFakeTimers();
    localStorage.setItem('rgm.accessToken', 'token-abc');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });

    instances[0].readyState = MockEventSource.CONNECTING;
    instances[0].triggerError();

    await vi.advanceTimersByTimeAsync(5000);

    expect(instances).toHaveLength(1);
    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
  });

  it('reconnects with a new user session when the authenticated user changes', () => {
    localStorage.setItem('rgm.accessToken', 'token-user-1');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op1', perfil: 'OPERADOR' } });

    const { QueryWrapper } = createQueryWrapper();
    const { rerender } = renderHook(() => useSolicitacaoEvents(), { wrapper: QueryWrapper });
    expect(instances).toHaveLength(1);
    const closeSpy = vi.spyOn(instances[0], 'close');

    localStorage.setItem('rgm.accessToken', 'token-user-2');
    mockUseAuth.mockReturnValue({ user: { nome: 'Op2', perfil: 'GESTOR' } });
    rerender();

    expect(closeSpy).toHaveBeenCalled();
    expect(instances).toHaveLength(2);
    expect(instances[1].url).toContain('token=token-user-2');
  });
});
