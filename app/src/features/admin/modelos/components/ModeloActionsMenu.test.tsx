/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { ModeloActionsMenu } from './ModeloActionsMenu';

const modelo = {
  id: '123', codigo: 'M01', descricao: 'Desc', maquina: 'Injetora',
  versao: 1, observacoes: null, temPendenciaAberta: false,
  ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '',
};

afterEach(cleanup);

describe('ModeloActionsMenu', () => {
  it('renders Detalhes and Abrir solicitação links when active', () => {
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={modelo} /></MemoryRouter>,
    );
    expect(within(container).getByText('Detalhes')).toBeDefined();
    
    const abrirBtn = within(container).getByText('Abrir solicitação');
    expect(abrirBtn).toBeDefined();
    expect(abrirBtn.getAttribute('href')).toBe('/app/solicitacoes/nova?modeloId=123');
  });

  it('does not render Abrir solicitação link when modelo is inactive', () => {
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={{ ...modelo, ativo: false }} /></MemoryRouter>,
    );
    expect(within(container).getByText('Detalhes')).toBeDefined();
    expect(within(container).queryByText('Abrir solicitação')).toBeNull();
  });
});
