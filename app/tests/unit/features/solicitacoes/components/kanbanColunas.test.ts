import { describe, expect, it } from 'vitest';

import { ETAPAS } from '@tests/support/etapasDoQuadro';

import { COLUMNS } from '@/features/solicitacoes/components/kanbanColunas';

const colunaDe = (status: string) => COLUMNS.find((coluna) => coluna.status === status);

describe('kanbanColunas', () => {
  it('deve listar as etapas na ordem do quadro quando as colunas são lidas', () => {
    // Arrange
    const esperadas = ETAPAS.map((etapa) => etapa.status);

    // Act
    const listadas = COLUMNS.map((coluna) => coluna.status);

    // Assert
    expect(listadas).toEqual(esperadas);
  });

  it.each(ETAPAS)(
    'deve dar o papel $ponto ao ponto de cor quando a etapa é $status',
    ({ status, ponto }) => {
      // Act
      const valores = Object.values(colunaDe(status) ?? {});

      // Assert
      expect(valores).toContain(ponto);
    },
  );
});
