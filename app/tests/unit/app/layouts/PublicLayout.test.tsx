/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { PublicLayout } from '@/app/layouts/PublicLayout';

const CONTROLE_DE_TEMA = /^Tema: /;
const FUNDO_DA_APLICACAO = 'bg-canvas';
const CONTEUDO = 'Conteúdo da rota pública';

const classes = (elemento: Element) => elemento.className.split(' ');

function montar() {
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<p>{CONTEUDO}</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('PublicLayout', () => {
  it('deve mostrar o controle de tema quando a área pública é montada', () => {
    // Act
    montar();

    // Assert
    expect(screen.getAllByRole('button', { name: CONTROLE_DE_TEMA })).toHaveLength(1);
  });

  it('deve mostrar o conteúdo da rota quando a área pública é montada', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('main').textContent).toContain(CONTEUDO);
  });

  it('deve usar o fundo do papel canvas quando a área pública é montada', () => {
    // Act
    montar();

    // Assert
    expect(classes(screen.getByRole('main'))).toContain(FUNDO_DA_APLICACAO);
  });
});
