/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import type {
  AtividadeSolicitacao,
  PrioridadeSolicitacao,
  Solicitacao,
  StatusSolicitacao,
  TipoSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { SolicitacaoResumo } from '@/features/solicitacoes/components/SolicitacaoResumo';
import { formatarDataHora } from '@/shared/lib/data';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

const modelo = { id: 'm1', codigo: 'MD-010', descricao: 'Carcaça de bomba' };

const AGORA_MS = Date.parse('2026-01-01T10:00:00Z');

type Extras = Partial<ComponentProps<typeof SolicitacaoResumo>>;

function montar(solicitacao: Solicitacao, comModelo = false, extras: Extras = {}) {
  return render(
    <MemoryRouter>
      <SolicitacaoResumo
        solicitacao={solicitacao}
        modelo={comModelo ? modelo : undefined}
        agoraMs={AGORA_MS}
        {...extras}
      />
    </MemoryRouter>,
  );
}

function criarAbertura(autorNome: string): AtividadeSolicitacao {
  return {
    id: 'a1',
    solicitacaoId: 's1',
    tipo: 'ABERTURA',
    deStatus: null,
    paraStatus: null,
    comentario: null,
    autorUsuarioId: 'u1',
    autorNome,
    criadaEm: '2026-01-01T00:00:00Z',
  };
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

describe('SolicitacaoResumo — data de abertura malformada', () => {
  it('deve mostrar o resumo sem horário de abertura quando criadaEm é malformado', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ criadaEm: 'lixo' });

    // Act
    const { container } = montar(solicitacao);

    // Assert
    expect(screen.getByText('Status')).toBeDefined();
    expect(container.querySelector('time')).toBeNull();
  });
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

describe('SolicitacaoResumo — prazo', () => {
  it('deve mostrar quanto falta quando o prazo está longe de vencer', () => {
    // Arrange
    const solicitacao = criarSolicitacao({
      criadaEm: '2025-12-01T00:00:00Z',
      prazoLimite: '2026-01-01T15:00:00Z',
    });

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.getByText('Prazo')).toBeDefined();
    expect(screen.getByText('Vence em 5 h')).toBeDefined();
  });

  it('deve mostrar o atraso em variante de perigo quando o prazo já passou', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ prazoLimite: '2025-12-30T10:00:00Z' });

    // Act
    montar(solicitacao);

    // Assert
    expect(classes(screen.getByText('Atrasada há 2 d'))).toContain('text-danger-fg');
  });

  it('deve não mostrar o campo de prazo quando a solicitação não tem prazo', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ prazoLimite: null });

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.queryByText('Prazo')).toBeNull();
  });
});

describe('SolicitacaoResumo — responsáveis', () => {
  it('deve mostrar os nomes quando a API informa os responsáveis', () => {
    // Arrange
    const solicitacao = criarSolicitacao({
      responsavelIds: ['u2'],
      responsaveis: [{ id: 'u2', nome: 'Ana Souza' }],
    });

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.getByText('Responsáveis')).toBeDefined();
    expect(screen.getByText('Ana Souza')).toBeDefined();
  });

  it('deve mostrar os nomes da lista de usuários quando a API não informa os responsáveis', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsavelIds: ['u3'] });

    // Act
    montar(solicitacao, false, { usuarios: [{ id: 'u3', nome: 'Bruno Lima' }] });

    // Assert
    expect(screen.getByText('Bruno Lima')).toBeDefined();
  });

  it('deve mostrar a quantidade quando os nomes dos responsáveis são desconhecidos', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsavelIds: ['u4', 'u5'] });

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.getByText('2 responsáveis')).toBeDefined();
  });

  it('deve mostrar traço quando a solicitação não tem responsáveis', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsavelIds: [] });

    // Act
    montar(solicitacao);

    // Assert
    const campo = screen.getByText('Responsáveis').parentElement!;
    expect(campo.textContent).toBe('Responsáveis—');
  });
});

describe('SolicitacaoResumo — quem abriu', () => {
  it('deve mostrar o nome da atividade de abertura quando a API não informa quem abriu', () => {
    // Arrange
    const solicitacao = criarSolicitacao();

    // Act
    montar(solicitacao, false, { atividades: [criarAbertura('Carla Dias')] });

    // Assert
    expect(screen.getByText('Aberta por')).toBeDefined();
    expect(screen.getByText('Carla Dias')).toBeDefined();
  });

  it('deve mostrar o nome do campo da API quando a solicitação informa quem abriu', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorNome: 'Davi Reis' });

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.getByText('Davi Reis')).toBeDefined();
  });

  it('deve não mostrar a linha aberta por quando não há nome e mostrar o horário no campo aberta', () => {
    // Arrange
    const solicitacao = criarSolicitacao();

    // Act
    montar(solicitacao);

    // Assert
    expect(screen.queryByText('Aberta por')).toBeNull();
    const campo = screen.getByText('Aberta').parentElement!;
    expect(campo.textContent).toContain('há 10 h');
  });

  it('deve mostrar o horário relativo com a data completa no title quando foi aberta', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorNome: 'Davi Reis' });

    // Act
    montar(solicitacao);

    // Assert
    const horario = screen.getByText('há 10 h');
    expect(horario.tagName).toBe('TIME');
    expect(horario.getAttribute('datetime')).toBe(solicitacao.criadaEm);
    expect(horario.getAttribute('title')).toBe(formatarDataHora(solicitacao.criadaEm));
  });

  it('deve oferecer a data completa a leitores de tela quando mostra o horário relativo', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorNome: 'Davi Reis' });

    // Act
    montar(solicitacao);

    // Assert
    const completa = screen.getByText(formatarDataHora(solicitacao.criadaEm));
    expect(classes(completa)).toContain('sr-only');
  });

  it('deve mostrar a data completa sem segundos quando mostra o horário', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorNome: 'Davi Reis' });

    // Act
    montar(solicitacao);

    // Assert
    const completa = screen.getByText(formatarDataHora(solicitacao.criadaEm));
    expect(completa.textContent).not.toMatch(/\d{2}:\d{2}:\d{2}/);
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
