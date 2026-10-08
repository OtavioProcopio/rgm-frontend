/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoStatusBadge } from '@/features/solicitacoes/components/SolicitacaoStatusBadge';
import { rotuloDoStatus } from '@/shared/lib/rotulos';

const STATUS = [
  { status: 'A_FAZER', variacao: 'neutral', fundo: 'bg-surface-muted', texto: 'text-fg-muted' },
  { status: 'EM_ANDAMENTO', variacao: 'info', fundo: 'bg-info-soft', texto: 'text-info-fg' },
  {
    status: 'EM_VALIDACAO',
    variacao: 'warning',
    fundo: 'bg-warning-soft',
    texto: 'text-warning-fg',
  },
  { status: 'CONCLUIDA', variacao: 'success', fundo: 'bg-success-soft', texto: 'text-success-fg' },
  { status: 'CANCELADA', variacao: 'danger', fundo: 'bg-danger-soft', texto: 'text-danger-fg' },
] as const;
const CONCLUIDA = STATUS[3];

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('SolicitacaoStatusBadge', () => {
  it.each(STATUS)(
    'deve usar o selo na variação $variacao quando o status é $status',
    ({ status, fundo, texto }) => {
      // Act
      render(<SolicitacaoStatusBadge status={status} />);

      // Assert
      const selo = screen.getByText(rotuloDoStatus[status]);
      expect(classes(selo)).toEqual(expect.arrayContaining([fundo, texto]));
    },
  );

  it.each(STATUS)('deve mostrar o rótulo do status quando o status é $status', ({ status }) => {
    // Act
    const { container } = render(<SolicitacaoStatusBadge status={status} />);

    // Assert
    expect(container.textContent).toBe(rotuloDoStatus[status]);
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Arrange
    const extra = 'ml-2';

    // Act
    render(<SolicitacaoStatusBadge status={CONCLUIDA.status} className={extra} />);

    // Assert
    expect(classes(screen.getByText(rotuloDoStatus[CONCLUIDA.status]))).toContain(extra);
  });
});
