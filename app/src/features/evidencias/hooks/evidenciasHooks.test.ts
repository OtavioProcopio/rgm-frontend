/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useEvidencias } from './useEvidencias';
import { useUploadEvidencia } from './useUploadEvidencia';

vi.mock('../api/evidenciasApi', () => {
  const e = { id: 'e1', publicUrl: 'http://minio/foto.jpg', mimeType: 'image/jpeg', nomeArquivo: 'foto.jpg', tamanhoBytes: 1024, enviadaPorUsuarioId: 'u1', criadaEm: '2024-01-01T00:00:00Z' };
  return { evidenciasApi: { listar: vi.fn().mockResolvedValue([e]), anexar: vi.fn().mockResolvedValue(e) } };
});

afterEach(() => vi.clearAllMocks());

describe('useEvidencias', () => {
  it('fetches evidencias for a solicitacao', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEvidencias('s1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].nomeArquivo).toBe('foto.jpg');
  });

  it('does not fetch when solicitacaoId is empty', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEvidencias(''), { wrapper: QueryWrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useUploadEvidencia', () => {
  it('exposes mutateAsync', () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUploadEvidencia('s1'), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
