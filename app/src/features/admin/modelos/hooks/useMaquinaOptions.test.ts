/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMaquinaOptions } from './useMaquinaOptions';

const mockUseMaquinas = vi.fn();

vi.mock('./useMaquinas', () => ({
  useMaquinas: () => mockUseMaquinas(),
}));

afterEach(() => vi.clearAllMocks());

describe('useMaquinaOptions', () => {
  it('maps only active machines to options', () => {
    mockUseMaquinas.mockReturnValue({
      data: [
        { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' },
        { id: '2', nome: 'Desativada', ativo: false, criadoEm: '', atualizadoEm: '' },
      ],
      isLoading: false,
    });

    const { result } = renderHook(() => useMaquinaOptions());

    expect(result.current.options).toEqual([{ value: 'FBOX', label: 'FBOX' }]);
    expect(result.current.isLoading).toBe(false);
  });

  it('appends the current value as a "fora do catálogo" option when missing from active machines', () => {
    mockUseMaquinas.mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      isLoading: false,
    });

    const { result } = renderHook(() => useMaquinaOptions('Prensa Antiga'));

    expect(result.current.options).toEqual([
      { value: 'FBOX', label: 'FBOX' },
      { value: 'Prensa Antiga', label: 'Prensa Antiga (fora do catálogo)' },
    ]);
  });

  it('does not duplicate the current value when it is already an active machine', () => {
    mockUseMaquinas.mockReturnValue({
      data: [{ id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' }],
      isLoading: false,
    });

    const { result } = renderHook(() => useMaquinaOptions('FBOX'));

    expect(result.current.options).toEqual([{ value: 'FBOX', label: 'FBOX' }]);
  });

  it('returns no options while the catalog has not loaded yet', () => {
    mockUseMaquinas.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useMaquinaOptions());

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
