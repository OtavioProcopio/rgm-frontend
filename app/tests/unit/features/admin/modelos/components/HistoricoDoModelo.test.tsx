/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { HistoricoDoModelo } from '@/features/admin/modelos/components/HistoricoDoModelo';
import type { EventoModelo } from '@/features/admin/modelos/types/modeloTypes';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

function criarEvento(sobrescritas: Partial<EventoModelo> = {}): EventoModelo {
  return {
    id: 'e1',
    modeloId: 'm1',
    titulo: 'Manutenção preventiva',
    tipo: 'MANUTENCAO',
    descricao: 'Revisão geral',
    estadoModeloDescricao: null,
    executadoPorUsuarioId: null,
    solicitacaoRelacionadaId: null,
    criadoEm: '2024-06-01T10:00:00Z',
    ...sobrescritas,
  };
}

function criarSolicitacao(sobrescritas: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: 's1',
    titulo: 'Trocar rolamento',
    descricao: 'Ruído no eixo',
    tipo: 'REPARO',
    status: 'EM_ANDAMENTO',
    prioridade: null,
    modeloId: 'm1',
    abertaPorUsuarioId: 'u1',
    comentarioFinal: null,
    criadaEm: '2024-06-02T10:00:00Z',
    atualizadaEm: '2024-06-02T10:00:00Z',
    concluidaEm: null,
    canceladaEm: null,
    responsavelIds: [],
    ...sobrescritas,
  };
}

function renderizar(
  eventos: EventoModelo[],
  solicitacoes: Solicitacao[],
  totalDeSolicitacoes?: number,
) {
  return render(
    <MemoryRouter>
      <HistoricoDoModelo
        eventos={eventos}
        solicitacoes={solicitacoes}
        totalDeSolicitacoes={totalDeSolicitacoes}
      />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('HistoricoDoModelo', () => {
  it('deve mostrar o evento uma só vez como link quando há solicitação relacionada', () => {
    // Arrange
    const evento = criarEvento({ solicitacaoRelacionadaId: 's1' });

    // Act
    renderizar([evento], [criarSolicitacao()]);

    // Assert
    const link = screen.getByRole('link', { name: 'Manutenção preventiva' });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes/s1');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('deve mostrar título, selo de status e link quando a solicitação não tem evento', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'CONCLUIDA' });

    // Act
    renderizar([], [solicitacao]);

    // Assert
    const link = screen.getByRole('link', { name: /Trocar rolamento/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes/s1');
    expect(screen.getByText('Concluída')).toBeDefined();
  });

  it('deve mostrar o evento sem link quando não há solicitação relacionada', () => {
    // Arrange
    const evento = criarEvento();

    // Act
    renderizar([evento], []);

    // Assert
    expect(screen.getByText('Manutenção preventiva')).toBeDefined();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('deve mostrar detalhe e complemento quando o evento os possui', () => {
    // Arrange
    const evento = criarEvento({ estadoModeloDescricao: 'Em uso' });

    // Act
    renderizar([evento], []);

    // Assert
    expect(screen.getByText('Revisão geral')).toBeDefined();
    expect(screen.getByText('Em uso')).toBeDefined();
  });

  it('deve mostrar o tipo como detalhe quando o evento não tem descrição', () => {
    // Arrange
    const evento = criarEvento({ descricao: null });

    // Act
    renderizar([evento], []);

    // Assert
    expect(screen.getByText('MANUTENCAO')).toBeDefined();
  });

  it('deve mostrar a solicitação uma só vez quando ela vem no evento e na lista', () => {
    // Arrange
    const evento = criarEvento({ solicitacaoRelacionadaId: 's1' });
    const solicitacao = criarSolicitacao();

    // Act
    renderizar([evento], [solicitacao]);

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByText('Trocar rolamento')).toBeNull();
  });

  it('deve ordenar do mais recente para o mais antigo quando as datas diferem', () => {
    // Arrange
    const antigo = criarEvento({
      id: 'e1',
      titulo: 'Evento antigo',
      criadoEm: '2024-06-01T10:00:00Z',
    });
    const recente = criarSolicitacao({
      titulo: 'Solicitação recente',
      criadaEm: '2024-06-05T10:00:00Z',
    });

    // Act
    renderizar([antigo], [recente]);

    // Assert
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent ?? '');
    expect(itens[0]).toContain('Solicitação recente');
    expect(itens[1]).toContain('Evento antigo');
  });

  it('deve mostrar "Nenhum evento registrado" quando não há eventos nem solicitações', () => {
    // Arrange
    const eventos: EventoModelo[] = [];

    // Act
    renderizar(eventos, []);

    // Assert
    expect(screen.getByText('Nenhum evento registrado')).toBeDefined();
  });

  it('deve mostrar a nota de limite quando o total passa do que veio', () => {
    // Arrange
    const solicitacoes = Array.from({ length: 50 }, (_, i) =>
      criarSolicitacao({ id: `s${i}`, titulo: `Solicitação ${i}` }),
    );

    // Act
    renderizar([], solicitacoes, 73);

    // Assert
    expect(screen.getByText('Mostrando 50 de 73 solicitações.')).toBeDefined();
  });

  it('deve omitir a nota quando o total é igual ao que veio', () => {
    // Arrange
    const solicitacoes = [criarSolicitacao()];

    // Act
    renderizar([], solicitacoes, 1);

    // Assert
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });

  it('deve omitir a nota quando o total está ausente', () => {
    // Arrange
    const solicitacoes = [criarSolicitacao()];

    // Act
    renderizar([], solicitacoes);

    // Assert
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });
});
