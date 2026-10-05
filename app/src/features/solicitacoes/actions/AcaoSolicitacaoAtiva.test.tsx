/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import type { AcaoProps } from '../types/acaoProps';
import { AcaoSolicitacaoAtiva } from './AcaoSolicitacaoAtiva';

function dubleDe(nome: string) {
  return ({ solicitacao, onClose }: AcaoProps) => (
    <button type="button" onClick={onClose}>
      {nome} de {solicitacao.id}
    </button>
  );
}

vi.mock('./TriarAction', () => ({ TriarAction: dubleDe('Triar') }));
vi.mock('./ResponsaveisAction', () => ({ ResponsaveisAction: dubleDe('Responsáveis') }));
vi.mock('./EnviarValidacaoAction', () => ({ EnviarValidacaoAction: dubleDe('Enviar') }));
vi.mock('./DevolverAction', () => ({ DevolverAction: dubleDe('Devolver') }));
vi.mock('./EncerrarAction', () => ({ EncerrarAction: dubleDe('Encerrar') }));
vi.mock('./CancelarAction', () => ({ CancelarAction: dubleDe('Cancelar') }));

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
    render(<AcaoSolicitacaoAtiva acao={acao} solicitacao={criarSolicitacao()} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: esperado })).toBeDefined();
  });

  it('deve repassar o fechamento quando a ação fecha', async () => {
    // Arrange
    const onClose = vi.fn();
    render(<AcaoSolicitacaoAtiva acao="DEVOLVER" solicitacao={criarSolicitacao()} onClose={onClose} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Devolver de s1' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
