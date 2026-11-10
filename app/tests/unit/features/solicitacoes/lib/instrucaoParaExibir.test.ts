import { describe, expect, it } from 'vitest';

import { instrucaoParaExibir } from '@/features/solicitacoes/lib/instrucaoParaExibir';
import type { StatusSolicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

describe('instrucaoParaExibir', () => {
  it.each<StatusSolicitacao>(['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA', 'CANCELADA'])(
    'deve mostrar a instrução quando existe, no status %s',
    (status) => {
      // Act
      const resultado = instrucaoParaExibir({
        status,
        instrucao: '  Trocar o gabarito\nConferir  ',
      });

      // Assert
      expect(resultado).toEqual({ tipo: 'instrucao', texto: 'Trocar o gabarito\nConferir' });
    },
  );

  it.each<StatusSolicitacao>(['EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA'])(
    'deve avisar que não há registro quando %s não tem instrução',
    (status) => {
      expect(instrucaoParaExibir({ status, instrucao: null })).toEqual({ tipo: 'semRegistro' });
    },
  );

  it.each<StatusSolicitacao>(['A_FAZER', 'CANCELADA'])(
    'não deve mostrar nada quando %s não tem instrução',
    (status) => {
      expect(instrucaoParaExibir({ status, instrucao: null })).toEqual({ tipo: 'nenhuma' });
    },
  );

  it('deve tratar a instrução só com espaços como ausente', () => {
    expect(instrucaoParaExibir({ status: 'EM_ANDAMENTO', instrucao: ' \n ' })).toEqual({
      tipo: 'semRegistro',
    });
  });
});
