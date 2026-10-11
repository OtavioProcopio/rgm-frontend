import { describe, expect, it } from 'vitest';

import {
  opcoesDePrioridadeComPrazo,
  prazoEmTexto,
} from '@/features/solicitacoes/lib/prazosDaPrioridade';

describe('prazoEmTexto', () => {
  it.each([
    ['URGENTE', '4 h'],
    ['ALTA', '24 h'],
    ['MEDIA', '3 dias'],
    ['BAIXA', '7 dias'],
  ] as const)(
    'deve escrever o prazo de %s como "%s" quando a prioridade é informada',
    (p, texto) => {
      // Act
      const resultado = prazoEmTexto(p);

      // Assert
      expect(resultado).toBe(texto);
    },
  );
});

describe('opcoesDePrioridadeComPrazo', () => {
  it('deve listar da mais urgente para a menos urgente com o prazo no rótulo', () => {
    // Act
    const opcoes = opcoesDePrioridadeComPrazo();

    // Assert
    expect(opcoes).toEqual([
      { valor: 'URGENTE', rotulo: 'Urgente · 4 h' },
      { valor: 'ALTA', rotulo: 'Alta · 24 h' },
      { valor: 'MEDIA', rotulo: 'Média · 3 dias' },
      { valor: 'BAIXA', rotulo: 'Baixa · 7 dias' },
    ]);
  });
});
