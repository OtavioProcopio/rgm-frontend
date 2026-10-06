/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { SolicitacaoResumo } from '@/features/solicitacoes/components/SolicitacaoResumo';

const modelo = { id: 'm1', codigo: 'MD-010', descricao: 'Carcaça de bomba' };

function montar(solicitacao: Solicitacao, comModelo = false) {
  render(
    <MemoryRouter>
      <SolicitacaoResumo solicitacao={solicitacao} modelo={comModelo ? modelo : undefined} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('SolicitacaoResumo', () => {
  it('deve mostrar tipo, descrição e o link do modelo quando a solicitação tem modelo', () => {
    // Arrange
    const reparo = criarSolicitacao({ tipo: 'REPARO', descricao: 'Correia gasta' });

    // Act
    montar(reparo, true);

    // Assert
    expect(screen.getByText('Reparo')).toBeDefined();
    expect(screen.getByText('Correia gasta')).toBeDefined();
    const link = screen.getByRole('link', { name: 'MD-010 — Carcaça de bomba' });
    expect(link.getAttribute('href')).toBe('/app/modelos/m1');
  });

  it('deve mostrar o modelo pretendido quando a solicitação é de criação e o modelo ainda não existe', () => {
    // Arrange
    const criacao = criarSolicitacao({
      tipo: 'CRIACAO', modeloId: null, modeloCodigo: 'MD-099', modeloMaquina: 'Injetora 3',
      modeloObservacoes: 'Usar liga nova',
    });

    // Act
    montar(criacao);

    // Assert
    expect(screen.getByText('MD-099 — Injetora 3')).toBeDefined();
    expect(screen.getByText('Usar liga nova')).toBeDefined();
    expect(screen.getByText('O modelo será criado ao concluir esta solicitação.')).toBeDefined();
  });

  it('deve mostrar o comentário final quando a solicitação foi encerrada com comentário', () => {
    // Arrange
    const concluida = criarSolicitacao({ status: 'CONCLUIDA', comentarioFinal: 'Peça aprovada' });

    // Act
    montar(concluida);

    // Assert
    expect(screen.getByText('Comentário final')).toBeDefined();
    expect(screen.getByText('Peça aprovada')).toBeDefined();
  });

  it('deve não mostrar bloco de modelo quando não há modelo e a solicitação não é de criação', () => {
    // Arrange
    const semModelo = criarSolicitacao({ tipo: 'INSPECAO' });

    // Act
    montar(semModelo);

    // Assert
    expect(screen.queryByText('Modelo (rastreabilidade)')).toBeNull();
    expect(screen.queryByText('Modelo pretendido')).toBeNull();
  });
});
