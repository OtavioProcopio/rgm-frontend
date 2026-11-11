/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { useFiltrosDoCatalogo } from '@/features/modelos/hooks/useFiltrosDoCatalogo';

afterEach(cleanup);

function montar(inicial = '/app/modelos') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/antes', inicial]} initialIndex={1}>
      {children}
    </MemoryRouter>
  );
  return renderHook(
    () => ({
      catalogo: useFiltrosDoCatalogo(),
      local: useLocation(),
      navegar: useNavigate(),
    }),
    { wrapper },
  );
}

describe('useFiltrosDoCatalogo', () => {
  it('deve ler os filtros do endereço', () => {
    // Act
    const { result } = montar('/app/modelos?tipo=RESINA&maquina=FBOX&q=ab&inativos=1&modelo=m1');

    // Assert
    expect(result.current.catalogo.filtros).toEqual({
      tipo: 'RESINA',
      maquina: 'FBOX',
      q: 'ab',
      inativos: true,
      modelo: 'm1',
    });
  });

  it('deve escolher o tipo, tirar o modelo do endereço e criar entrada no histórico', () => {
    // Arrange
    const { result } = montar('/app/modelos?modelo=m1');

    // Act
    act(() => result.current.catalogo.escolherTipo('RESINA'));

    // Assert
    expect(result.current.local.search).toBe('?tipo=RESINA');
    act(() => void result.current.navegar(-1));
    expect(result.current.local.search).toBe('?modelo=m1');
  });

  it('deve voltar a todos quando o tipo ou a máquina já escolhidos são clicados de novo', () => {
    // Arrange
    const { result } = montar('/app/modelos?tipo=RESINA&maquina=FBOX');

    // Act
    act(() => result.current.catalogo.escolherTipo('RESINA'));
    act(() => result.current.catalogo.escolherMaquina('FBOX'));

    // Assert
    expect(result.current.local.search).toBe('');
  });

  it('deve trocar de tipo sem passar por "Todos" quando outro botão é clicado', () => {
    const { result } = montar('/app/modelos?tipo=RESINA');

    act(() => result.current.catalogo.escolherTipo('COQUILHA_ACO'));

    expect(result.current.catalogo.filtros.tipo).toBe('COQUILHA_ACO');
  });

  it('deve substituir a entrada, e não criar outra, na busca, nos inativos e na troca de modelo', () => {
    // Arrange
    const { result } = montar('/app/modelos');

    // Act
    act(() => result.current.catalogo.definirBusca('mancal'));
    act(() => result.current.catalogo.definirInativos(true));
    act(() => result.current.catalogo.definirModelo('m7'));

    // Assert
    expect(result.current.local.search).toBe('?q=mancal&inativos=1&modelo=m7');
    act(() => void result.current.navegar(-1));
    expect(result.current.local.pathname).toBe('/antes');
  });

  it('deve tirar o modelo do endereço quando a busca ou os inativos mudam', () => {
    const { result } = montar('/app/modelos?modelo=m1');

    act(() => result.current.catalogo.definirBusca('ab'));

    expect(result.current.catalogo.filtros.modelo).toBe('');
  });

  it('deve trocar vários filtros de uma vez, sem criar entrada, e manter o modelo', () => {
    // Arrange
    const { result } = montar('/app/modelos?tipo=RESINA&maquina=FBOX&modelo=m1');

    // Act
    act(() => result.current.catalogo.substituirFiltros({ tipo: '', maquina: '', inativos: true }));

    // Assert
    expect(result.current.local.search).toBe('?inativos=1&modelo=m1');
    act(() => void result.current.navegar(-1));
    expect(result.current.local.pathname).toBe('/antes');
  });

  it('deve limpar todos os filtros e o modelo', () => {
    const { result } = montar('/app/modelos?tipo=RESINA&q=ab&inativos=1&modelo=m1');

    act(() => result.current.catalogo.limpar());

    expect(result.current.local.search).toBe('');
  });
});
