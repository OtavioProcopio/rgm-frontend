/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { DialogoDaAcao } from '@/features/solicitacoes/actions/DialogoDaAcao';
import { useAcoesDoCabecalho } from '@/features/solicitacoes/hooks/useAcoesDoCabecalho';
import { useAcoesPermitidas } from '@/features/solicitacoes/hooks/useAcoesPermitidas';
import type { AcaoSolicitacao } from '@/features/solicitacoes/lib/acoesSolicitacao';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/solicitacoes/hooks/useAcoesPermitidas', () => ({
  useAcoesPermitidas: vi.fn(),
}));
vi.mock('@/features/solicitacoes/actions/DialogoDaAcao', () => ({
  DialogoDaAcao: vi.fn(() => null),
}));

const acoesDe = vi.fn();

function permitir(...acoes: AcaoSolicitacao[]): void {
  acoesDe.mockReturnValue(new Set(acoes));
}

function montar(solicitacao: Solicitacao, editar?: { aoAcionar: () => void } | null) {
  const { AppWrapper } = createAppWrapper();
  return renderHook(() => useAcoesDoCabecalho(solicitacao, editar), { wrapper: AppWrapper });
}

function rotulosDoMenu(menu: { rotulo: string }[]): string[] {
  return menu.map((item) => item.rotulo);
}

beforeEach(() => {
  acoesDe.mockReset();
  vi.mocked(useAcoesPermitidas).mockReturnValue(acoesDe);
  vi.mocked(DialogoDaAcao).mockClear();
});

afterEach(cleanup);

describe('useAcoesDoCabecalho', () => {
  it('deve ter Triar como rótulo da principal quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal?.rotulo).toBe('Triar');
  });

  it('deve ter a variante primary na principal quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal?.variante).toBe('primary');
  });

  it('deve ter Editar e Cancelar no menu quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(rotulosDoMenu(result.current.maisAcoes)).toEqual(['Editar', 'Cancelar']);
  });

  it('deve marcar Cancelar como perigo no menu quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.maisAcoes[1].perigo).toBe(true);
  });

  it('deve não marcar Editar como perigo no menu quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.maisAcoes[0].perigo).toBeUndefined();
  });

  it('deve consultar as ações permitidas uma única vez quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(acoesDe).toHaveBeenCalledTimes(1);
  });

  it('deve consultar as ações permitidas com a solicitação quando o gestor vê A Fazer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR', 'CANCELAR');

    // Act
    montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(acoesDe).toHaveBeenCalledWith(solicitacao);
  });

  it('deve ter Encerrar como principal e menu sem Cancelar quando o gestor vê Em Validação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_VALIDACAO' });
    permitir('ALTERAR_RESPONSAVEIS', 'DEVOLVER', 'ENCERRAR', 'CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal?.rotulo).toBe('Encerrar');
    expect(rotulosDoMenu(result.current.maisAcoes)).toEqual([
      'Editar',
      'Alterar responsáveis',
      'Devolver',
    ]);
  });

  it('deve ter Enviar para validação como principal e menu vazio quando o responsável vê Em Andamento sem Editar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    permitir('ENVIAR_VALIDACAO');

    // Act
    const { result } = montar(solicitacao);

    // Assert
    expect(result.current.principal?.rotulo).toBe('Enviar para validação');
    expect(result.current.maisAcoes).toEqual([]);
  });

  it('deve ter principal nula quando quem abriu pode editar e cancelar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal).toBeNull();
  });

  it('deve ter menu com Editar e Cancelar quando quem abriu pode editar e cancelar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(rotulosDoMenu(result.current.maisAcoes)).toEqual(['Editar', 'Cancelar']);
  });

  it('deve marcar Cancelar como perigo quando quem abriu pode editar e cancelar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.maisAcoes[1].perigo).toBe(true);
  });

  it('deve ter Cancelar como rótulo da principal quando é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao);

    // Assert
    expect(result.current.principal?.rotulo).toBe('Cancelar');
  });

  it('deve ter a variante danger na principal quando Cancelar é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao);

    // Assert
    expect(result.current.principal?.variante).toBe('danger');
  });

  it('deve ter menu vazio quando Cancelar é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('CANCELAR');

    // Act
    const { result } = montar(solicitacao);

    // Assert
    expect(result.current.maisAcoes).toEqual([]);
  });

  it('deve ter Editar como rótulo da principal quando é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    permitir();

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal?.rotulo).toBe('Editar');
  });

  it('deve ter a variante primary na principal quando Editar é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    permitir();

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.principal?.variante).toBe('primary');
  });

  it('deve ter menu vazio quando Editar é a única ação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    permitir();

    // Act
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Assert
    expect(result.current.maisAcoes).toEqual([]);
  });

  it('deve chamar a edição uma vez quando a principal Editar é acionada', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    const editar = { aoAcionar: vi.fn() };
    permitir();
    const { result } = montar(solicitacao, editar);

    // Act
    act(() => result.current.principal?.aoAcionar());

    // Assert
    expect(editar.aoAcionar).toHaveBeenCalledTimes(1);
  });

  it('deve não abrir diálogo quando a principal Editar é acionada', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    permitir();
    const { result } = montar(solicitacao, { aoAcionar: vi.fn() });

    // Act
    act(() => result.current.principal?.aoAcionar());

    // Assert
    expect(result.current.dialogo).toBeNull();
  });

  it('deve ter principal nula quando nada é permitido e não há Editar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'CONCLUIDA' });
    permitir();

    // Act
    const { result } = montar(solicitacao, null);

    // Assert
    expect(result.current.principal).toBeNull();
  });

  it('deve ter menu vazio quando nada é permitido e não há Editar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'CONCLUIDA' });
    permitir();

    // Act
    const { result } = montar(solicitacao, null);

    // Assert
    expect(result.current.maisAcoes).toEqual([]);
  });

  it('deve não ter diálogo quando nada é permitido e não há Editar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'CONCLUIDA' });
    permitir();

    // Act
    const { result } = montar(solicitacao, null);

    // Assert
    expect(result.current.dialogo).toBeNull();
  });

  it('deve abrir o diálogo do componente DialogoDaAcao quando a principal é acionada', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR');
    const { result } = montar(solicitacao);

    // Act
    act(() => result.current.principal?.aoAcionar());

    // Assert
    const aberto = result.current.dialogo as ReactElement<Record<string, unknown>>;
    expect(aberto.type).toBe(DialogoDaAcao);
  });

  it('deve abrir o diálogo da ação TRIAR quando a principal é acionada', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR');
    const { result } = montar(solicitacao);

    // Act
    act(() => result.current.principal?.aoAcionar());

    // Assert
    const aberto = result.current.dialogo as ReactElement<Record<string, unknown>>;
    expect(aberto.props.acao).toBe('TRIAR');
  });

  it('deve abrir o diálogo com a solicitação quando a principal é acionada', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR');
    const { result } = montar(solicitacao);

    // Act
    act(() => result.current.principal?.aoAcionar());

    // Assert
    const aberto = result.current.dialogo as ReactElement<Record<string, unknown>>;
    expect(aberto.props.solicitacao).toBe(solicitacao);
  });

  it('deve fechar o diálogo da ação quando o diálogo aberto pede para fechar', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    permitir('TRIAR');
    const { result } = montar(solicitacao);
    act(() => result.current.principal?.aoAcionar());
    const aberto = result.current.dialogo as ReactElement<Record<string, unknown>>;

    // Act
    act(() => (aberto.props.onClose as () => void)());

    // Assert
    expect(result.current.dialogo).toBeNull();
  });

  it('deve abrir o diálogo da ação escolhida quando um item do menu é selecionado', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_VALIDACAO' });
    permitir('DEVOLVER', 'ENCERRAR');
    const { result } = montar(solicitacao);

    // Act
    act(() => result.current.maisAcoes[0].onSelect?.());

    // Assert
    const aberto = result.current.dialogo as ReactElement<Record<string, unknown>>;
    expect(aberto.props.acao).toBe('DEVOLVER');
    expect(aberto.props.solicitacao).toBe(solicitacao);
  });

  it('deve chamar a edição quando o item Editar do menu é selecionado', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'A_FAZER' });
    const editar = { aoAcionar: vi.fn() };
    permitir('TRIAR');
    const { result } = montar(solicitacao, editar);

    // Act
    act(() => result.current.maisAcoes[0].onSelect?.());

    // Assert
    expect(editar.aoAcionar).toHaveBeenCalledTimes(1);
    expect(result.current.dialogo).toBeNull();
  });

  it('deve manter a ação aberta quando ela deixa de ser permitida', () => {
    // Arrange
    const aberta = criarSolicitacao({ status: 'EM_VALIDACAO' });
    permitir('DEVOLVER', 'ENCERRAR');
    const { AppWrapper } = createAppWrapper();
    const { result, rerender } = renderHook(
      ({ solicitacao }: { solicitacao: Solicitacao }) => useAcoesDoCabecalho(solicitacao),
      { wrapper: AppWrapper, initialProps: { solicitacao: aberta } },
    );
    act(() => result.current.maisAcoes[0].onSelect?.());

    // Act
    permitir();
    rerender({ solicitacao: criarSolicitacao({ status: 'CONCLUIDA' }) });

    // Assert
    const dialogo = result.current.dialogo as ReactElement<Record<string, unknown>>;
    expect(dialogo.props.acao).toBe('DEVOLVER');
    expect(result.current.principal).toBeNull();
  });
});
