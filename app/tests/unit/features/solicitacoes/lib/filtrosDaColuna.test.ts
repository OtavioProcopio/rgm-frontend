import { describe, expect, it } from 'vitest';

import {
  filtrosDaColuna,
  inicioDosUltimos30Dias,
  TAMANHO_DO_BLOCO,
} from '@/features/solicitacoes/lib/filtrosDaColuna';
import type { StatusSolicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

const TRINTA_DIAS_ATRAS = '2026-09-07T00:00:00.000Z';
const ABERTAS: StatusSolicitacao[] = ['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO'];
const ENCERRADAS: StatusSolicitacao[] = ['CONCLUIDA', 'CANCELADA'];

describe('TAMANHO_DO_BLOCO', () => {
  it('deve carregar as colunas em blocos de 20', () => {
    // Act
    const tamanho = TAMANHO_DO_BLOCO;

    // Assert
    expect(tamanho).toBe(20);
  });
});

describe('filtrosDaColuna', () => {
  it('deve pedir o status da coluna, na página informada, com o tamanho do bloco', () => {
    // Act
    const filtros = filtrosDaColuna('EM_ANDAMENTO', {}, TRINTA_DIAS_ATRAS, 2);

    // Assert
    expect(filtros).toEqual({ status: 'EM_ANDAMENTO', page: 2, size: 20 });
  });

  it.each([...ABERTAS, ...ENCERRADAS])(
    'deve repassar o filtro de modelo à coluna %s',
    (status) => {
      // Act
      const filtros = filtrosDaColuna(status, { modeloId: 'm-1' }, TRINTA_DIAS_ATRAS, 0);

      // Assert
      expect(filtros.modeloId).toBe('m-1');
    },
  );

  it.each([...ABERTAS, ...ENCERRADAS])(
    'deve repassar o período de criação à coluna %s',
    (status) => {
      // Arrange
      const periodo = {
        criadaEmInicio: '2026-08-01T00:00:00Z',
        criadaEmFim: '2026-08-31T23:59:59Z',
      };

      // Act
      const filtros = filtrosDaColuna(status, periodo, TRINTA_DIAS_ATRAS, 0);

      // Assert
      expect(filtros).toMatchObject(periodo);
    },
  );

  it.each(ENCERRADAS)(
    'deve limitar a coluna %s às encerradas dos últimos 30 dias quando não há período escolhido',
    (status) => {
      // Act
      const filtros = filtrosDaColuna(status, { modeloId: 'm-1' }, TRINTA_DIAS_ATRAS, 0);

      // Assert
      expect(filtros).toMatchObject({ tipoData: 'CONCLUSAO', dataInicio: TRINTA_DIAS_ATRAS });
    },
  );

  it.each([
    ['início', { criadaEmInicio: '2026-08-01T00:00:00Z' }],
    ['fim', { criadaEmFim: '2026-08-31T23:59:59Z' }],
  ])(
    'deve tirar o limite de 30 dias das encerradas quando o %s do período foi escolhido',
    (_nome, periodo) => {
      // Act
      const filtros = filtrosDaColuna('CONCLUIDA', periodo, TRINTA_DIAS_ATRAS, 0);

      // Assert
      expect(filtros).not.toHaveProperty('tipoData');
    },
  );

  it.each(ABERTAS)('deve nunca limitar por data de conclusão a coluna em aberto %s', (status) => {
    // Act
    const filtros = filtrosDaColuna(status, {}, TRINTA_DIAS_ATRAS, 0);

    // Assert
    expect(filtros).not.toHaveProperty('dataInicio');
  });
});

describe('inicioDosUltimos30Dias', () => {
  it('deve devolver o início do dia de 30 dias antes do instante informado', () => {
    // Arrange
    const agora = new Date('2026-10-07T15:42:10.500Z');

    // Act
    const inicio = inicioDosUltimos30Dias(agora);

    // Assert
    expect(inicio).toBe('2026-09-07T00:00:00.000Z');
  });

  it('deve devolver o mesmo instante para dois momentos do mesmo dia', () => {
    // Arrange
    const cedo = new Date('2026-10-07T00:00:01Z');
    const tarde = new Date('2026-10-07T23:59:59Z');

    // Act
    const instantes = [inicioDosUltimos30Dias(cedo), inicioDosUltimos30Dias(tarde)];

    // Assert
    expect(instantes[0]).toBe(instantes[1]);
  });
});
