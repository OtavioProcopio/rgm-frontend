/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UsuariosFilters } from '@/features/admin/usuarios/components/UsuariosFilters';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('UsuariosFilters', () => {
  it('renders perfil and status selects', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Perfil')).toBeDefined();
    expect(within(container).getByText('Status')).toBeDefined();
  });

  it.each(Object.entries(rotuloDoPerfil))(
    'deve mostrar o rótulo da fonte única quando a opção de perfil é %s',
    (perfil, rotulo) => {
      // Arrange
      const { container } = render(
        <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      const opcao = container.querySelector(`option[value="${perfil}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );

  it('renders status options', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Ativos')).toBeDefined();
    expect(within(container).getByText('Inativos')).toBeDefined();
  });

  it('deve mostrar a seção Filtros aberta quando não há preferência guardada', () => {
    // Arrange
    render(<UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />);

    // Act
    const botao = screen.getByRole('button', { name: 'Filtros' });

    // Assert
    expect(botao.getAttribute('aria-expanded')).toBe('true');
  });

  it('deve resumir como Filtros quando a seção fecha sem filtro preenchido', () => {
    // Arrange
    render(<UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Filtros' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('deve resumir como 2 ativos quando perfil e situação estão preenchidos e a seção fecha', () => {
    // Arrange
    render(
      <UsuariosFilters
        perfil="ADMINISTRADOR"
        ativo={false}
        onPerfilChange={vi.fn()}
        onAtivoChange={vi.fn()}
      />,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Filtros · 2 ativos' })).toBeDefined();
  });

  it('deve resumir como 1 ativo quando só a situação está preenchida e a seção fecha', () => {
    // Arrange
    render(<UsuariosFilters ativo={true} onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Filtros · 1 ativo' })).toBeDefined();
  });

  it('deve manter os campos montados com os valores quando a seção recolhe', () => {
    // Arrange
    const { container } = render(
      <UsuariosFilters
        perfil="ADMINISTRADOR"
        ativo={false}
        onPerfilChange={vi.fn()}
        onAtivoChange={vi.fn()}
      />,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    // Assert
    const selects = container.querySelectorAll('select');
    expect([selects[0]?.value, selects[1]?.value]).toEqual(['ADMINISTRADOR', 'false']);
  });

  it('deve guardar o estado fechado quando a seção recolhe', () => {
    // Arrange
    render(<UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    // Assert
    expect(localStorage.getItem('rgm.secao.filtros-usuarios')).toBe('fechada');
  });
});
