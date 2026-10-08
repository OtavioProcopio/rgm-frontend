/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AlterarResponsaveisModal } from '@/features/solicitacoes/components/AlterarResponsaveisModal';

const USUARIOS = [
  { id: 'u1', nome: 'João' },
  { id: 'u2', nome: 'Maria' },
];
const AVISO_SEM_RESPONSAVEL = 'Selecione pelo menos 1 responsável.';

const classes = (elemento: Element) => elemento.className.split(' ');

function montar(responsaveisAtuais: string[] = [], usuarios = USUARIOS) {
  const onConfirm = vi.fn<(responsavelIds: string[]) => void>();
  const onCancel = vi.fn<() => void>();
  const { container } = render(
    <AlterarResponsaveisModal
      responsaveisAtuais={responsaveisAtuais}
      usuarios={usuarios}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  );
  return { container, onConfirm, onCancel };
}

afterEach(cleanup);

describe('AlterarResponsaveisModal', () => {
  it('deve marcar os responsáveis atuais quando abre', () => {
    // Arrange
    const [atual] = USUARIOS;

    // Act
    montar([atual.id]);
    const marcados = USUARIOS.filter(
      (usuario) => (screen.getByLabelText(usuario.nome) as HTMLInputElement).checked,
    );

    // Assert
    expect(marcados).toEqual([atual]);
  });

  it('deve confirmar com os responsáveis escolhidos quando um responsável é acrescentado', async () => {
    // Arrange
    const [atual, novo] = USUARIOS;
    const { onConfirm } = montar([atual.id]);
    await userEvent.click(screen.getByLabelText(novo.nome));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect(onConfirm.mock.calls).toEqual([[[atual.id, novo.id]]]);
  });

  it('deve impedir a confirmação quando nenhum responsável está marcado', () => {
    // Act
    montar([]);
    const confirmar = screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement;

    // Assert
    expect(confirmar.disabled).toBe(true);
  });

  it('deve chamar onCancel uma vez quando Cancelar é acionado', async () => {
    // Arrange
    const { onCancel } = montar([USUARIOS[0].id]);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('AlterarResponsaveisModal — cores por papel', () => {
  it('deve usar o fundo e a borda de informação quando o formulário é mostrado', () => {
    // Act
    const { container } = montar();

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-info-soft', 'border-info']),
    );
  });

  it('deve usar o texto de informação quando mostra o título', () => {
    // Act
    montar();

    // Assert
    expect(classes(screen.getByRole('heading'))).toContain('text-info-fg');
  });

  it('deve usar o texto de perigo quando nenhum responsável está marcado', () => {
    // Act
    montar([]);

    // Assert
    expect(classes(screen.getByText(AVISO_SEM_RESPONSAVEL))).toContain('text-danger-fg');
  });

  it('deve usar o texto secundário quando não há responsável disponível', () => {
    // Act
    montar([], []);

    // Assert
    expect(classes(screen.getByText('Nenhum responsável disponível.'))).toContain('text-fg-muted');
  });

  it('deve usar o texto principal quando mostra o nome de um responsável', () => {
    // Arrange
    const [usuario] = USUARIOS;

    // Act
    montar();

    // Assert
    expect(classes(screen.getByText(usuario.nome))).toContain('text-fg');
  });
});
