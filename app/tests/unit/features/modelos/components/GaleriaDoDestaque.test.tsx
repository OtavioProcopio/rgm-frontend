/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaDoDestaque } from '@/features/modelos/components/GaleriaDoDestaque';

afterEach(cleanup);

const FOTOS = [
  'https://img/capa.jpg',
  'https://img/2.jpg',
  'https://img/3.jpg',
  'https://img/4.jpg',
];

function montar(extra: Partial<React.ComponentProps<typeof GaleriaDoDestaque>> = {}) {
  const props = {
    descricao: 'Carcaça',
    codigo: 'FB-1001',
    fotos: FOTOS,
    carregandoFotos: false,
    erroNasFotos: false,
    onTentarFotos: vi.fn(),
    ...extra,
  };
  render(<GaleriaDoDestaque {...props} />);
  return props;
}

const fotoGrande = () => screen.getByRole('img', { name: /^Carcaça, foto/ }) as HTMLImageElement;

describe('GaleriaDoDestaque — fotos', () => {
  it('deve começar na capa, dizer em que foto está e marcar a capa', () => {
    // Act
    montar();

    // Assert
    expect(fotoGrande().src).toBe(FOTOS[0]);
    expect(fotoGrande().alt).toBe('Carcaça, foto 1 de 4');
    expect(screen.getByText('Foto 1 de 4 — capa')).toBeDefined();
  });

  it('deve trocar a foto grande e o contador quando uma miniatura é clicada, sem "capa" nas outras', async () => {
    // Arrange
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Foto 3 de 4' }));

    // Assert
    expect(fotoGrande().src).toBe(FOTOS[2]);
    expect(screen.getByText('Foto 3 de 4')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Foto 3 de 4' }).getAttribute('aria-current')).toBe(
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Foto 1 de 4 (capa)' }).getAttribute('aria-current'),
    ).toBe(null);
  });

  it('deve dar a volta nas setas sobre a foto: da última à primeira e da primeira à última', async () => {
    // Arrange
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(fotoGrande().src).toBe(FOTOS[3]);
    await userEvent.click(screen.getByRole('button', { name: 'Próxima foto' }));

    // Assert
    expect(fotoGrande().src).toBe(FOTOS[0]);
  });

  it('deve trocar a foto e mover o foco com as setas do teclado dentro da faixa', async () => {
    // Arrange
    montar();
    const faixa = screen.getByRole('group', { name: 'Fotos do modelo' });
    within(faixa).getByRole('button', { name: 'Foto 1 de 4 (capa)' }).focus();

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    expect(fotoGrande().src).toBe(FOTOS[1]);
    expect(document.activeElement).toBe(within(faixa).getByRole('button', { name: 'Foto 2 de 4' }));
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(fotoGrande().src).toBe(FOTOS[3]);
  });

  it('deve deixar só a miniatura da foto atual na ordem de tabulação e marcar a faixa para o teclado da página', () => {
    // Act
    montar();

    // Assert
    const faixa = screen.getByRole('group', { name: 'Fotos do modelo' });
    const miniaturas = within(faixa).getAllByRole('button');
    expect(miniaturas.map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    expect(faixa.hasAttribute('data-faixa-de-fotos')).toBe(true);
  });

  it('deve carregar as miniaturas de forma preguiçosa e a foto grande de uma vez', () => {
    // Act
    montar();

    // Assert
    const faixa = screen.getByRole('group', { name: 'Fotos do modelo' });
    for (const imagem of within(faixa).getAllByRole('presentation', { hidden: true })) {
      expect(imagem.getAttribute('loading')).toBe('lazy');
    }
    expect(fotoGrande().getAttribute('loading')).toBeNull();
  });

  it('deve ficar transparente até a foto carregar e aparecer com transição suave, sem ela para movimento reduzido', () => {
    // Arrange
    montar();
    const foto = fotoGrande();

    // Assert
    expect(foto.getAttribute('data-carregada')).toBe('false');
    expect(foto.className).toContain('opacity-0');
    expect(foto.className).toContain('transition-opacity');
    expect(foto.className).toContain('motion-reduce:transition-none');

    // Act
    fireEvent.load(foto);

    // Assert
    expect(foto.getAttribute('data-carregada')).toBe('true');
    expect(foto.className).toContain('opacity-100');
  });

  it('deve começar transparente de novo a cada foto nova', async () => {
    // Arrange
    montar();
    fireEvent.load(fotoGrande());

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Foto 2 de 4' }));

    // Assert
    expect(fotoGrande().getAttribute('data-carregada')).toBe('false');
  });
});

describe('GaleriaDoDestaque — detalhes do teclado e do cache', () => {
  it('deve ignorar teclas que não são setas na faixa de miniaturas', async () => {
    // Arrange
    montar();
    within(screen.getByRole('group', { name: 'Fotos do modelo' }))
      .getByRole('button', { name: 'Foto 1 de 4 (capa)' })
      .focus();

    // Act
    await userEvent.keyboard('a');

    // Assert
    expect(fotoGrande().src).toBe(FOTOS[0]);
  });

  it('deve mostrar a foto na hora quando o navegador já a tem em cache', () => {
    // Arrange
    const original = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete');
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => true,
    });

    // Act
    montar();

    // Assert
    expect(fotoGrande().getAttribute('data-carregada')).toBe('true');
    if (original) Object.defineProperty(HTMLImageElement.prototype, 'complete', original);
    else delete (HTMLImageElement.prototype as { complete?: boolean }).complete;
  });
});

describe('GaleriaDoDestaque — uma foto, nenhuma e estados', () => {
  it('não deve mostrar setas nem faixa quando o modelo tem uma foto', () => {
    // Act
    montar({ fotos: [FOTOS[0]] });

    // Assert
    expect(screen.queryByRole('button', { name: 'Próxima foto' })).toBeNull();
    expect(screen.queryByRole('group', { name: 'Fotos do modelo' })).toBeNull();
    expect(screen.getByText('Foto 1 de 1 — capa')).toBeDefined();
  });

  it('deve mostrar a sigla do código e "Sem foto cadastrada" quando não há foto', () => {
    // Act
    montar({ fotos: [] });

    // Assert
    expect(screen.getByText('FB')).toBeDefined();
    expect(screen.getByText('Sem foto cadastrada')).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('deve avisar que as outras fotos estão chegando enquanto só a capa está disponível', () => {
    // Act
    montar({ fotos: [FOTOS[0]], carregandoFotos: true });

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Carregando as outras fotos…');
  });

  it('não deve avisar de carregamento quando as fotos já estão todas na tela', () => {
    montar({ carregandoFotos: true });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('deve manter a capa, avisar da falha e oferecer "Tentar novamente" quando as outras fotos falham', async () => {
    // Arrange
    const { onTentarFotos } = montar({ fotos: [FOTOS[0]], erroNasFotos: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar as outras fotos.',
    );
    expect(fotoGrande().src).toBe(FOTOS[0]);
    expect(onTentarFotos).toHaveBeenCalledTimes(1);
  });

  it('deve limitar a foto atual ao que existe quando a lista de fotos encolhe', () => {
    // Arrange
    const { rerender } = render(
      <GaleriaDoDestaque
        descricao="Carcaça"
        codigo="FB-1001"
        fotos={FOTOS}
        carregandoFotos={false}
        erroNasFotos={false}
        onTentarFotos={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Foto 4 de 4' }));

    // Act
    rerender(
      <GaleriaDoDestaque
        descricao="Carcaça"
        codigo="FB-1001"
        fotos={FOTOS.slice(0, 2)}
        carregandoFotos={false}
        erroNasFotos={false}
        onTentarFotos={vi.fn()}
      />,
    );

    // Assert
    expect(fotoGrande().alt).toBe('Carcaça, foto 2 de 2');
  });
});
