/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import type { AcaoProps } from '@/features/solicitacoes/types/acaoProps';
import { AcaoSolicitacaoAtiva } from '@/features/solicitacoes/actions/AcaoSolicitacaoAtiva';

function dubleDe(nome: string) {
  return ({ solicitacao, onClose, onCancelar }: AcaoProps) => (
    <>
      <button type="button" onClick={onClose}>
        {nome} de {solicitacao.id}
      </button>
      <button type="button" onClick={onCancelar}>
        Desistir de {nome}
      </button>
    </>
  );
}

vi.mock('@/features/solicitacoes/actions/TriarAction', () => ({ TriarAction: dubleDe('Triar') }));
vi.mock('@/features/solicitacoes/actions/ResponsaveisAction', () => ({
  ResponsaveisAction: dubleDe('Responsáveis'),
}));
vi.mock('@/features/solicitacoes/actions/EnviarValidacaoAction', () => ({
  EnviarValidacaoAction: dubleDe('Enviar'),
}));
vi.mock('@/features/solicitacoes/actions/DevolverAction', () => ({
  DevolverAction: dubleDe('Devolver'),
}));
vi.mock('@/features/solicitacoes/actions/EncerrarAction', () => ({
  EncerrarAction: dubleDe('Encerrar'),
}));
vi.mock('@/features/solicitacoes/actions/CancelarAction', () => ({
  CancelarAction: dubleDe('Cancelar'),
}));

afterEach(cleanup);

describe('AcaoSolicitacaoAtiva', () => {
  it.each([
    ['TRIAR', 'Triar de s1'],
    ['ALTERAR_RESPONSAVEIS', 'Responsáveis de s1'],
    ['ENVIAR_VALIDACAO', 'Enviar de s1'],
    ['DEVOLVER', 'Devolver de s1'],
    ['ENCERRAR', 'Encerrar de s1'],
    ['CANCELAR', 'Cancelar de s1'],
  ] as const)('deve abrir o formulário da ação quando a ação é %s', (acao, esperado) => {
    // Act
    render(
      <AcaoSolicitacaoAtiva
        acao={acao}
        solicitacao={criarSolicitacao()}
        onClose={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('button', { name: esperado })).toBeDefined();
  });

  it('deve repassar o fechamento quando a ação fecha', async () => {
    // Arrange
    const onClose = vi.fn();
    render(
      <AcaoSolicitacaoAtiva
        acao="DEVOLVER"
        solicitacao={criarSolicitacao()}
        onClose={onClose}
        onCancelar={vi.fn()}
      />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Devolver de s1' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve repassar a desistência quando o usuário desiste da ação', async () => {
    // Arrange
    const onClose = vi.fn();
    const onCancelar = vi.fn();
    render(
      <AcaoSolicitacaoAtiva
        acao="DEVOLVER"
        solicitacao={criarSolicitacao()}
        onClose={onClose}
        onCancelar={onCancelar}
      />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Desistir de Devolver' }));

    // Assert
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
