/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTipoModeloOptions } from '@/features/admin/modelos/hooks/useTipoModeloOptions';

type Tipo = { id: string; nome: string; ativo: boolean; criadoEm: string; atualizadoEm: string };

let catalogo: Tipo[] | undefined;
let carregando = false;

vi.mock('@/features/admin/modelos/hooks/useTiposModelo', () => ({
  useTiposModelo: () => ({ data: catalogo, isLoading: carregando }),
}));

const tipo = (nome: string, ativo = true): Tipo => ({
  id: nome,
  nome,
  ativo,
  criadoEm: '',
  atualizadoEm: '',
});

afterEach(() => {
  catalogo = undefined;
  carregando = false;
});

describe('useTipoModeloOptions', () => {
  it('deve começar com "Não definido" e listar só os tipos ativos com o nome amigável', () => {
    // Arrange
    catalogo = [tipo('RESINA'), tipo('Aço inox'), tipo('MADEIRA_E_3D', false)];

    // Act
    const { result } = renderHook(() => useTipoModeloOptions());

    // Assert
    expect(result.current.options).toEqual([
      { value: '', label: 'Não definido' },
      { value: 'RESINA', label: 'Resina' },
      { value: 'Aço inox', label: 'Aço inox' },
    ]);
  });

  it('deve manter o tipo atual como "(inativo)" quando ele foi desativado', () => {
    // Arrange
    catalogo = [tipo('RESINA'), tipo('MADEIRA_E_3D', false)];

    // Act
    const { result } = renderHook(() => useTipoModeloOptions('MADEIRA_E_3D'));

    // Assert
    expect(result.current.options.at(-1)).toEqual({
      value: 'MADEIRA_E_3D',
      label: 'Madeira e 3D (inativo)',
    });
  });

  it('deve não repetir o tipo atual quando ele está ativo no catálogo', () => {
    // Arrange
    catalogo = [tipo('RESINA')];

    // Act
    const { result } = renderHook(() => useTipoModeloOptions('RESINA'));

    // Assert
    expect(result.current.options.filter((o) => o.value === 'RESINA')).toHaveLength(1);
  });

  it('deve devolver só "Não definido" e carregando quando o catálogo ainda não chegou', () => {
    // Arrange
    carregando = true;

    // Act
    const { result } = renderHook(() => useTipoModeloOptions());

    // Assert
    expect(result.current.options).toEqual([{ value: '', label: 'Não definido' }]);
    expect(result.current.isLoading).toBe(true);
  });
});
