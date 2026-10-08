/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoPrioridadeBadge } from '@/features/solicitacoes/components/SolicitacaoPrioridadeBadge';
import { rotuloDaPrioridade } from '@/shared/lib/rotulos';

const PRIORIDADES = [
  { prioridade: 'BAIXA', variacao: 'neutral', fundo: 'bg-surface-muted', texto: 'text-fg-muted' },
  { prioridade: 'MEDIA', variacao: 'info', fundo: 'bg-info-soft', texto: 'text-info-fg' },
  { prioridade: 'ALTA', variacao: 'warning', fundo: 'bg-warning-soft', texto: 'text-warning-fg' },
  { prioridade: 'URGENTE', variacao: 'danger', fundo: 'bg-danger-soft', texto: 'text-danger-fg' },
] as const;
const URGENTE = PRIORIDADES[3];

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('SolicitacaoPrioridadeBadge', () => {
  it.each(PRIORIDADES)(
    'deve usar o selo na variação $variacao quando a prioridade é $prioridade',
    ({ prioridade, fundo, texto }) => {
      // Act
      render(<SolicitacaoPrioridadeBadge prioridade={prioridade} />);

      // Assert
      const selo = screen.getByText(rotuloDaPrioridade[prioridade]);
      expect(classes(selo)).toEqual(expect.arrayContaining([fundo, texto]));
    },
  );

  it.each(PRIORIDADES)(
    'deve mostrar o rótulo da prioridade quando a prioridade é $prioridade',
    ({ prioridade }) => {
      // Act
      const { container } = render(<SolicitacaoPrioridadeBadge prioridade={prioridade} />);

      // Assert
      expect(container.textContent).toBe(rotuloDaPrioridade[prioridade]);
    },
  );

  it('deve não mostrar selo quando a solicitação não tem prioridade', () => {
    // Act
    const { container } = render(<SolicitacaoPrioridadeBadge prioridade={null} />);

    // Assert
    expect(container.childElementCount).toBe(0);
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Arrange
    const extra = 'ml-2';

    // Act
    render(<SolicitacaoPrioridadeBadge prioridade={URGENTE.prioridade} className={extra} />);

    // Assert
    expect(classes(screen.getByText(rotuloDaPrioridade[URGENTE.prioridade]))).toContain(extra);
  });
});
