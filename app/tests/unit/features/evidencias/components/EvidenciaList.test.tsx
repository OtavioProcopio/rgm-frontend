/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Evidencia } from '@/features/evidencias/types/evidenciaTypes';
import { EvidenciaList } from '@/features/evidencias/components/EvidenciaList';

afterEach(cleanup);

const makeEvidencia = (overrides: Partial<Evidencia> = {}): Evidencia => ({
  id: '1',
  publicUrl: 'http://minio/img.jpg',
  mimeType: 'image/jpeg',
  nomeArquivo: 'foto.jpg',
  tamanhoBytes: 1024,
  enviadaPorUsuarioId: 'user-1',
  criadaEm: '2024-01-01T00:00:00Z',
  tipo: 'GERAL',
  descricao: null,
  ...overrides,
});

describe('EvidenciaList', () => {
  it('shows loading state', () => {
    const { container } = render(<EvidenciaList evidencias={[]} isLoading />);
    expect(within(container).getByText(/carregando evidências/i)).toBeDefined();
  });

  it('shows empty state when no evidencias', () => {
    const { container } = render(<EvidenciaList evidencias={[]} />);
    expect(within(container).getByText(/nenhuma evidência/i)).toBeDefined();
  });

  it('renders evidencia cards', () => {
    const evidencias = [
      makeEvidencia({ id: '1', nomeArquivo: 'a.jpg' }),
      makeEvidencia({ id: '2', nomeArquivo: 'b.jpg' }),
    ];
    const { container } = render(<EvidenciaList evidencias={evidencias} />);
    expect(within(container).getByText('a.jpg')).toBeDefined();
    expect(within(container).getByText('b.jpg')).toBeDefined();
  });
});

describe('EvidenciaList — exclusão', () => {
  const evidencia = makeEvidencia({ id: 'ev-7', nomeArquivo: 'solda.jpg' });

  /** Mostra a lista com uma evidência e aciona o botão de excluir. */
  async function pedirExclusao() {
    const onDelete = vi.fn();
    const { container } = render(<EvidenciaList evidencias={[evidencia]} onDelete={onDelete} />);
    await userEvent.click(within(container).getByRole('button', { name: 'Excluir evidência' }));
    return {
      onDelete,
      dialogo: within(container).getByRole('dialog', { name: 'Excluir evidência' }),
    };
  }

  it('deve pedir confirmação citando o arquivo e que não há como desfazer quando excluir é acionado', async () => {
    // Act
    const { onDelete, dialogo } = await pedirExclusao();

    // Assert
    expect(dialogo.textContent).toContain(evidencia.nomeArquivo);
    expect(dialogo.textContent).toContain('Não há como desfazer');
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('deve excluir a evidência e fechar a confirmação quando o usuário confirma', async () => {
    // Arrange
    const { onDelete, dialogo } = await pedirExclusao();

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Excluir' }));

    // Assert
    expect(onDelete).toHaveBeenCalledWith(evidencia.id);
    expect(dialogo.isConnected).toBe(false);
  });

  it('deve manter a evidência e fechar a confirmação quando o usuário desiste', async () => {
    // Arrange
    const { onDelete, dialogo } = await pedirExclusao();

    // Act
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onDelete).not.toHaveBeenCalled();
    expect(dialogo.isConnected).toBe(false);
  });
});
