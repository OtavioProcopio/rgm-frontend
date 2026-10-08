/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import type {
  PrioridadeSolicitacao,
  Solicitacao,
  StatusSolicitacao,
  TipoSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { SolicitacaoResumo } from '@/features/solicitacoes/components/SolicitacaoResumo';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

const modelo = { id: 'm1', codigo: 'MD-010', descricao: 'Carcaça de bomba' };

function montar(solicitacao: Solicitacao, comModelo = false) {
  return render(
    <MemoryRouter>
      <SolicitacaoResumo solicitacao={solicitacao} modelo={comModelo ? modelo : undefined} />
    </MemoryRouter>,
  );
}

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('SolicitacaoResumo — rótulos dos valores da API', () => {
  it.each(Object.entries(rotuloDoTipoDeSolicitacao) as [TipoSolicitacao, string][])(
    'deve mostrar o rótulo compartilhado do tipo quando a solicitação é do tipo %s',
    (tipo, rotulo) => {
      // Arrange
      const solicitacao = criarSolicitacao({ tipo });

      // Act
      montar(solicitacao);

      // Assert
      expect(screen.getByText(rotulo).textContent).toBe(rotulo);
    },
  );

  it.each(Object.entries(rotuloDoStatus) as [StatusSolicitacao, string][])(
    'deve mostrar o rótulo compartilhado do status quando a solicitação está em %s',
    (status, rotulo) => {
      // Arrange
      const solicitacao = criarSolicitacao({ status });

      // Act
      montar(solicitacao);

      // Assert
      expect(screen.getByText(rotulo).textContent).toBe(rotulo);
    },
  );

  it.each(Object.entries(rotuloDaPrioridade) as [PrioridadeSolicitacao, string][])(
    'deve mostrar o rótulo compartilhado da prioridade quando a solicitação tem prioridade %s',
    (prioridade, rotulo) => {
      // Arrange
      const solicitacao = criarSolicitacao({ prioridade });

      // Act
      montar(solicitacao);

      // Assert
      expect(screen.getByText(rotulo).textContent).toBe(rotulo);
    },
  );
});

describe('SolicitacaoResumo — cores por papel', () => {
  it('deve usar a borda do papel de divisória quando o resumo é mostrado', () => {
    // Arrange
    const solicitacao = criarSolicitacao();

    // Act
    const { container } = montar(solicitacao);

    // Assert
    expect(classes(container.firstElementChild!)).toContain('border-line');
  });

  it('deve usar o texto secundário quando mostra o nome de um campo', () => {
    // Arrange
    const solicitacao = criarSolicitacao();

    // Act
    montar(solicitacao);

    // Assert
    expect(classes(screen.getByText('Tipo'))).toContain('text-fg-muted');
  });

  it('deve usar o texto principal quando mostra o valor de um campo', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ tipo: 'REPARO' });

    // Act
    montar(solicitacao);

    // Assert
    expect(classes(screen.getByText(rotuloDoTipoDeSolicitacao[solicitacao.tipo]))).toContain(
      'text-fg',
    );
  });

  it('deve usar o texto de destaque quando mostra o link do modelo', () => {
    // Arrange
    const solicitacao = criarSolicitacao();

    // Act
    montar(solicitacao, true);

    // Assert
    expect(classes(screen.getByRole('link'))).toContain('text-accent');
  });
});

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
      tipo: 'CRIACAO',
      modeloId: null,
      modeloCodigo: 'MD-099',
      modeloMaquina: 'Injetora 3',
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
