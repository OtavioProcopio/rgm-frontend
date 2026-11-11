/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { criarModelo } from '@tests/support/modeloFixture';

import { DestaqueDoModelo } from '@/features/modelos/components/DestaqueDoModelo';

afterEach(cleanup);

function montar(extra: Partial<React.ComponentProps<typeof DestaqueDoModelo>> = {}) {
  const props = {
    modelo: criarModelo({
      id: 'm1',
      codigo: 'FB-1001',
      versao: 3,
      descricao: 'Carcaça de bomba',
      tipo: 'COQUILHA_ACO',
      maquina: 'LINHA 3',
      observacoes: 'Rebarbar o canal 4.\nConferir o furo.',
    }),
    numero: 2,
    total: 48,
    podeVoltar: true,
    podeAvancar: true,
    aoVoltar: vi.fn(),
    aoAvancar: vi.fn(),
    fotos: ['https://img/capa.jpg', 'https://img/2.jpg'],
    carregandoFotos: false,
    erroNasFotos: false,
    aoTentarFotos: vi.fn(),
    estadoDaCopia: 'parado' as const,
    aoCopiar: vi.fn(),
    ...extra,
  };
  render(
    <MemoryRouter>
      <DestaqueDoModelo {...props} />
    </MemoryRouter>,
  );
  return props;
}

describe('DestaqueDoModelo', () => {
  it('deve mostrar descrição, código e versão, tipo com nome amigável, máquina e observações', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Carcaça de bomba' })).toBeDefined();
    expect(screen.getByText('FB-1001 · versão 3')).toBeDefined();
    expect(screen.getByText('Coquilha em Aço')).toBeDefined();
    expect(screen.getByText('LINHA 3')).toBeDefined();
    expect(screen.getByText(/Rebarbar o canal 4\./).textContent).toBe(
      'Rebarbar o canal 4.\nConferir o furo.',
    );
  });

  it('deve mostrar travessão quando o modelo não tem tipo nem observações', () => {
    // Act
    montar({ modelo: criarModelo({ tipo: null, observacoes: null }) });

    // Assert
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('deve mostrar os selos de inativo e de pendência só quando valem', () => {
    // Act
    montar({ modelo: criarModelo({ ativo: false, temPendenciaAberta: true }) });

    // Assert
    expect(screen.getByText('Inativo')).toBeDefined();
    expect(screen.getByText('Pendência aberta')).toBeDefined();
  });

  it('não deve mostrar selos para um modelo ativo e sem pendência', () => {
    montar();

    expect(screen.queryByText('Inativo')).toBeNull();
    expect(screen.queryByText('Pendência aberta')).toBeNull();
  });

  it('deve mostrar a posição "n de total" do servidor e anunciá-la na região em destaque', () => {
    // Act
    montar({ numero: 135, total: 300 });

    // Assert
    expect(screen.getByText('135 de 300')).toBeDefined();
    const regiao = screen.getByRole('region', { name: 'Modelo em destaque' });
    expect(regiao.querySelector('[aria-live="polite"]')?.textContent).toBe(
      'Carcaça de bomba, 135 de 300',
    );
  });

  it('deve chamar Anterior e Próximo', async () => {
    // Arrange
    const { aoVoltar, aoAvancar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    await userEvent.click(screen.getByRole('button', { name: /Próximo/ }));

    // Assert
    expect(aoVoltar).toHaveBeenCalledTimes(1);
    expect(aoAvancar).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar Anterior no primeiro e Próximo no último', () => {
    // Act
    montar({ podeVoltar: false, podeAvancar: false });

    // Assert
    expect((screen.getByRole('button', { name: /Anterior/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: /Próximo/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('deve levar "Abrir ficha completa" à ficha do modelo', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Abrir ficha completa' }).getAttribute('href')).toBe(
      '/app/modelos/m1',
    );
  });

  it('deve pedir a cópia do link e confirmar "Link copiado" quando copiou', async () => {
    // Arrange
    const { aoCopiar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Copiar link' }));

    // Assert
    expect(aoCopiar).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Link copiado')).toBeNull();
  });

  it('deve confirmar "Link copiado" depois da cópia', () => {
    montar({ estadoDaCopia: 'copiado' });

    expect(screen.getByRole('status').textContent).toBe('Link copiado');
  });

  it('deve mostrar o endereço num campo já selecionável quando a cópia foi bloqueada', async () => {
    // Arrange
    montar({ estadoDaCopia: 'bloqueado' });
    const campo = screen.getByLabelText(/Copie o endereço abaixo/) as HTMLInputElement;

    // Act
    await userEvent.click(campo);

    // Assert
    expect(campo.value).toBe(window.location.href);
    expect(campo.readOnly).toBe(true);
    expect(campo.selectionStart).toBe(0);
    expect(campo.selectionEnd).toBe(window.location.href.length);
  });

  it('deve repassar à galeria as fotos, o estado de carga e a nova tentativa', async () => {
    // Arrange
    const { aoTentarFotos } = montar({ fotos: ['https://img/capa.jpg'], erroNasFotos: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(aoTentarFotos).toHaveBeenCalledTimes(1);
  });
});
