/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoTimeline } from './SolicitacaoTimeline';

const atividade = {
  id: 'a1', solicitacaoId: 's1', autorUsuarioId: 'u1',
  tipo: 'ABERTURA' as const, autorNome: 'João',
  criadaEm: '2024-06-01T10:00:00Z', comentario: null,
  deStatus: null, paraStatus: null,
};

afterEach(cleanup);

describe('SolicitacaoTimeline', () => {
  it('shows loading state', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[]} isLoading />);
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows empty message when no atividades', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[]} />);
    expect(within(container).getByText(/nenhuma atividade/i)).toBeDefined();
  });

  it('renders atividade with autor and tipo', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[atividade]} />);
    expect(within(container).getByText('Solicitação aberta')).toBeDefined();
    expect(within(container).getByText('João')).toBeDefined();
  });

  it('renders status change atividade', () => {
    const { container } = render(
      <SolicitacaoTimeline atividades={[{
        ...atividade, tipo: 'MUDANCA_STATUS',
        deStatus: 'A_FAZER' as const, paraStatus: 'EM_ANDAMENTO' as const,
      }]} />,
    );
    expect(within(container).getByText(/status alterado/i)).toBeDefined();
  });

  it('renders comentario text', () => {
    const { container } = render(
      <SolicitacaoTimeline atividades={[{ ...atividade, tipo: 'COMENTARIO', comentario: 'Bom trabalho' }]} />,
    );
    expect(within(container).getByText('Bom trabalho')).toBeDefined();
  });

  it('renders EVIDENCIA_ADICIONADA tipo', () => {
    const { container } = render(
      <SolicitacaoTimeline atividades={[{ ...atividade, tipo: 'EVIDENCIA_ADICIONADA' }]} />,
    );
    expect(within(container).getByText('Evidência anexada')).toBeDefined();
  });
});
