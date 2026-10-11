/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TriagemModal } from '@/features/solicitacoes/components/TriagemModal';
import { LIMITES } from '@/shared/lib/limites';

const buscar = vi.fn();
let candidatos = [
  { id: '11111111-1111-4111-8111-111111111111', nome: 'João', perfil: 'OPERADOR' },
  { id: '22222222-2222-4222-8222-222222222222', nome: 'Maria', perfil: 'OPERADOR' },
];
let falhou = false;

vi.mock('@/features/solicitacoes/hooks/useBuscaDeResponsaveis', () => ({
  useBuscaDeResponsaveis: () => ({ buscar, candidatos, carregando: false, falhou }),
}));

const classes = (elemento: Element) => elemento.className.split(' ');

function montar(props: { isPending?: boolean } = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const { container } = render(
    <TriagemModal isPending={props.isPending} onCancel={onCancel} onConfirm={onConfirm} />,
  );
  return { container, onConfirm, onCancel };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  falhou = false;
  candidatos = [
    { id: '11111111-1111-4111-8111-111111111111', nome: 'João', perfil: 'OPERADOR' },
    { id: '22222222-2222-4222-8222-222222222222', nome: 'Maria', perfil: 'OPERADOR' },
  ];
});

describe('TriagemModal — prioridade com prazo', () => {
  it.each([['Urgente · 4 h'], ['Alta · 24 h'], ['Média · 3 dias'], ['Baixa · 7 dias']])(
    'deve mostrar a prioridade "%s" antes de confirmar quando o formulário abre',
    (rotulo) => {
      // Act
      montar();

      // Assert
      expect(screen.getByRole('radio', { name: new RegExp(rotulo) })).toBeDefined();
    },
  );
});

describe('TriagemModal — responsáveis por busca', () => {
  it('deve repassar o termo digitado à busca quando o usuário digita', async () => {
    // Arrange
    montar();

    // Act
    await userEvent.type(screen.getByLabelText('Responsáveis'), 'mar');

    // Assert
    expect(buscar).toHaveBeenLastCalledWith('mar');
  });

  it('deve mostrar o escolhido como etiqueta removível quando uma opção é tocada', async () => {
    // Arrange
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Maria' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Remover Maria' })).toBeDefined();
  });

  it('deve avisar quando não há responsável disponível', () => {
    // Arrange
    candidatos = [];

    // Act
    montar();

    // Assert
    expect(screen.getByText('Nenhum responsável disponível.')).toBeDefined();
  });

  it('deve avisar quando a busca falha', () => {
    // Arrange
    falhou = true;

    // Act
    montar();

    // Assert
    expect(screen.getByText(/Não foi possível buscar os responsáveis/)).toBeDefined();
  });
});

describe('TriagemModal — envio', () => {
  it('deve confirmar com a prioridade e os responsáveis escolhidos quando o formulário é válido', async () => {
    // Arrange
    const { onConfirm } = montar();
    await userEvent.click(screen.getByRole('radio', { name: /Alta · 24 h/ }));
    await userEvent.click(screen.getByRole('button', { name: 'João' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar triagem' }));

    // Assert
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm.mock.calls[0][0]).toEqual({
      prioridade: 'ALTA',
      responsavelIds: ['11111111-1111-4111-8111-111111111111'],
    });
  });

  it('deve exigir a prioridade e um responsável quando nada foi escolhido', async () => {
    // Arrange
    const { onConfirm } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar triagem' }));

    // Assert
    expect(await screen.findByText('Escolha a prioridade.')).toBeDefined();
    expect(screen.getByText('Selecione ao menos um responsável')).toBeDefined();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('deve chamar onCancel quando Cancelar é acionado', async () => {
    // Arrange
    const { onCancel } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o estado de envio quando a triagem está pendente', () => {
    // Act
    montar({ isPending: true });

    // Assert
    expect(screen.getByRole('button', { name: 'Triando...' })).toBeDefined();
  });
});

describe('TriagemModal — cores por papel e limite de texto', () => {
  it('deve usar o fundo e a borda de informação quando o formulário é mostrado', () => {
    // Act
    const { container } = montar();

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-info-soft', 'border-info']),
    );
  });

  it('deve limitar a observação da foto ao tamanho que a API grava quando uma foto é anexada', async () => {
    // Arrange
    const foto = new File(['x'], 'servico.png', { type: 'image/png' });
    montar();

    // Act
    await userEvent.upload(screen.getByLabelText('Arquivo de evidência'), foto);
    const campo = (await screen.findByLabelText(/observação/i)) as HTMLTextAreaElement;

    // Assert
    expect(campo.maxLength).toBe(LIMITES.textoLongo);
  });

  it('deve guardar a observação digitada quando uma foto foi anexada', async () => {
    // Arrange
    const foto = new File(['x'], 'servico.png', { type: 'image/png' });
    montar();
    await userEvent.upload(screen.getByLabelText('Arquivo de evidência'), foto);
    const campo = (await screen.findByLabelText(/observação/i)) as HTMLTextAreaElement;

    // Act
    await userEvent.type(campo, 'usar gabarito');

    // Assert
    expect(campo.value).toBe('usar gabarito');
  });
});
