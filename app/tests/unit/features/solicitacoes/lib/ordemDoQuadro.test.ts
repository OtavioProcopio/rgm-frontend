import { describe, expect, it } from 'vitest';

import { ordemDaColuna } from '@/features/solicitacoes/lib/ordemDoQuadro';

describe('ordemDaColuna', () => {
  it('deve ordenar por criação decrescente com o texto dos mais recentes quando o status é A_FAZER', () => {
    // Arrange
    const status = 'A_FAZER';

    // Act
    const ordem = ordemDaColuna(status);

    // Assert
    expect(ordem).toEqual({
      sort: 'criadaEm',
      dir: 'desc',
      texto: 'mais recentes primeiro',
    });
  });

  it.each(['EM_ANDAMENTO', 'EM_VALIDACAO'] as const)(
    'deve ordenar por prazo crescente com o texto do prazo mais vencido quando o status é %s',
    (status) => {
      // Act
      const ordem = ordemDaColuna(status);

      // Assert
      expect(ordem).toEqual({
        sort: 'prazoLimite',
        dir: 'asc',
        texto: 'prazo mais vencido primeiro',
      });
    },
  );

  it.each(['CONCLUIDA', 'CANCELADA'] as const)(
    'deve ordenar pela data de encerramento, mais recente primeiro, quando o status é %s',
    (status) => {
      // Act
      const ordem = ordemDaColuna(status);

      // Assert
      expect(ordem).toEqual({
        sort: 'concluidaEm',
        dir: 'desc',
        texto: 'encerradas mais recentes primeiro',
      });
    },
  );
});
