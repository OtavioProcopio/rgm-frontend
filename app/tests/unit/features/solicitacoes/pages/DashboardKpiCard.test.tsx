/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import type { Leitura } from '@/features/solicitacoes/lib/leituraDosIndicadores';
import { KPICard } from '@/features/solicitacoes/pages/DashboardKpiCard';

type Cor = Parameters<typeof KPICard>[0]['gradient'];

const ROTULO = 'Em atraso';
const VALOR = 7;
const DETALHE = 'fora do prazo de SLA';
const DESTINO = '/app/solicitacoes';
const NOME_DO_ICONE = 'ícone do indicador';

const VARIACOES: { nome: string; cor: Cor; papelDoIcone: string }[] = [
  { nome: 'sky', cor: 'sky', papelDoIcone: 'text-accent' },
  { nome: 'purple', cor: 'purple', papelDoIcone: 'text-accent' },
  { nome: 'emerald', cor: 'emerald', papelDoIcone: 'text-success-fg' },
  { nome: 'amber', cor: 'amber', papelDoIcone: 'text-warning-fg' },
  { nome: 'rose', cor: 'rose', papelDoIcone: 'text-danger-fg' },
  { nome: 'slate', cor: 'slate', papelDoIcone: 'text-fg-muted' },
  { nome: 'nenhuma', cor: undefined, papelDoIcone: 'text-fg-muted' },
];

const FUNDO_COLORIDO =
  /^(bg-(.+-soft|accent|danger|success|warning|info|gradient-.+)|(from|via|to)-.+)$/;

function Icone({ className }: { size?: number; className?: string }) {
  return <span role="img" aria-label={NOME_DO_ICONE} className={className} />;
}

function renderIndicador(cor?: Cor, onClickPath?: string): Element {
  const { container } = render(
    <MemoryRouter>
      <KPICard
        icon={Icone}
        label={ROTULO}
        value={VALOR}
        subtext={DETALHE}
        gradient={cor}
        onClickPath={onClickPath}
      />
    </MemoryRouter>,
  );
  return container.firstElementChild!;
}

const classes = (elemento: Element) => elemento.className.split(' ').filter(Boolean);
const semVariante = (classe: string) => classe.split(':').pop()!;
const icone = () => screen.getByRole('img', { name: NOME_DO_ICONE });

afterEach(cleanup);

describe('KPICard — conteúdo', () => {
  it('deve mostrar o rótulo do indicador', () => {
    // Act
    renderIndicador();

    // Assert
    expect(screen.getByText(ROTULO)).toBeDefined();
  });

  it('deve mostrar o valor do indicador', () => {
    // Act
    renderIndicador();

    // Assert
    expect(screen.getByText(String(VALOR))).toBeDefined();
  });

  it('deve mostrar o detalhe quando ele é informado', () => {
    // Act
    renderIndicador();

    // Assert
    expect(screen.getByText(DETALHE)).toBeDefined();
  });

  it('deve mostrar o ícone do indicador', () => {
    // Act
    renderIndicador();

    // Assert
    expect(icone()).toBeDefined();
  });

  it('deve levar ao destino quando o indicador tem caminho', () => {
    // Act
    renderIndicador('sky', DESTINO);

    // Assert
    expect(screen.getByRole('link').getAttribute('href')).toBe(DESTINO);
  });

  it('deve não ser um link quando o indicador não tem caminho', () => {
    // Act
    renderIndicador('sky');

    // Assert
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('KPICard — fundo neutro e cor só no ícone', () => {
  it.each(VARIACOES)(
    'deve ter a moldura com o fundo de superfície quando a cor pedida é $nome',
    ({ cor }) => {
      // Act
      const moldura = renderIndicador(cor);

      // Assert
      expect(classes(moldura)).toContain('bg-surface');
    },
  );

  it.each(VARIACOES)(
    'deve ter a moldura com a borda do papel quando a cor pedida é $nome',
    ({ cor }) => {
      // Act
      const moldura = renderIndicador(cor);

      // Assert
      expect(classes(moldura)).toEqual(expect.arrayContaining(['border', 'border-line']));
    },
  );

  it.each(VARIACOES)(
    'deve não ter fundo colorido na moldura quando a cor pedida é $nome',
    ({ cor }) => {
      // Act
      const moldura = renderIndicador(cor);

      // Assert
      expect(classes(moldura).filter((classe) => FUNDO_COLORIDO.test(semVariante(classe)))).toEqual(
        [],
      );
    },
  );

  it.each(VARIACOES)(
    'deve colorir o ícone com $papelDoIcone quando a cor pedida é $nome',
    ({ cor, papelDoIcone }) => {
      // Act
      renderIndicador(cor);

      // Assert
      expect(classes(icone())).toContain(papelDoIcone);
    },
  );

  it.each(VARIACOES)(
    'deve não repetir na moldura a cor do ícone quando a cor pedida é $nome',
    ({ cor, papelDoIcone }) => {
      // Act
      const moldura = renderIndicador(cor);

      // Assert
      expect(classes(moldura)).not.toContain(papelDoIcone);
    },
  );

  it('deve ter a moldura com o fundo de superfície quando o indicador é um link', () => {
    // Act
    const link = renderIndicador('sky', DESTINO);

    // Assert
    expect(classes(link.firstElementChild!)).toContain('bg-surface');
  });
});

describe('KPICard — textos', () => {
  it('deve mostrar o valor com o texto principal', () => {
    // Act
    renderIndicador();

    // Assert
    expect(classes(screen.getByText(String(VALOR)))).toContain('text-fg');
  });

  it('deve mostrar o rótulo com o texto secundário', () => {
    // Act
    renderIndicador();

    // Assert
    expect(classes(screen.getByText(ROTULO))).toContain('text-fg-muted');
  });

  it('deve mostrar o detalhe com o texto secundário', () => {
    // Act
    renderIndicador();

    // Assert
    expect(classes(screen.getByText(DETALHE))).toContain('text-fg-muted');
  });
});

const TONS: { tom: Leitura['tom'] }[] = [
  { tom: 'ok' },
  { tom: 'atencao' },
  { tom: 'ruim' },
  { tom: 'neutro' },
];

const TOMS_COM_ICONE_E_COR: { tom: Leitura['tom']; icone: string; cor: string }[] = [
  { tom: 'ok', icone: 'lucide-circle-check', cor: 'text-success-fg' },
  { tom: 'atencao', icone: 'lucide-triangle-alert', cor: 'text-warning-fg' },
  { tom: 'ruim', icone: 'lucide-circle-x', cor: 'text-danger-fg' },
  { tom: 'neutro', icone: 'lucide-minus', cor: 'text-fg-muted' },
];

const TEXTO_DA_LEITURA = 'dentro da meta de prazo';

function renderComLeitura(leitura?: Leitura, subtext?: string, onClickPath?: string) {
  return render(
    <MemoryRouter>
      <KPICard
        icon={Icone}
        label={ROTULO}
        value={VALOR}
        subtext={subtext}
        leitura={leitura}
        onClickPath={onClickPath}
      />
    </MemoryRouter>,
  );
}

describe('KPICard — leitura', () => {
  it('deve não mostrar o texto de leitura quando a leitura não é informada', () => {
    // Arrange
    const leitura = undefined;

    // Act
    renderComLeitura(leitura);

    // Assert
    expect(screen.queryByText(TEXTO_DA_LEITURA)).toBeNull();
  });

  it('deve não mostrar ícone de tom quando a leitura não é informada', () => {
    // Arrange
    const leitura = undefined;

    // Act
    const { container } = renderComLeitura(leitura);

    // Assert
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  it.each(TONS)('deve mostrar o texto da leitura quando o tom é $tom', ({ tom }) => {
    // Arrange
    const leitura: Leitura = { tom, texto: TEXTO_DA_LEITURA };

    // Act
    renderComLeitura(leitura);

    // Assert
    expect(screen.getByText(TEXTO_DA_LEITURA)).toBeDefined();
  });

  it.each(TOMS_COM_ICONE_E_COR)(
    'deve colorir o texto da leitura com $cor quando o tom é $tom',
    ({ tom, cor }) => {
      // Arrange
      const leitura: Leitura = { tom, texto: TEXTO_DA_LEITURA };

      // Act
      renderComLeitura(leitura);

      // Assert
      expect(classes(screen.getByText(TEXTO_DA_LEITURA))).toContain(cor);
    },
  );

  it.each(TOMS_COM_ICONE_E_COR)(
    'deve colorir o ícone da leitura com $cor quando o tom é $tom',
    ({ tom, cor }) => {
      // Arrange
      const leitura: Leitura = { tom, texto: TEXTO_DA_LEITURA };

      // Act
      renderComLeitura(leitura);

      // Assert
      const svg = screen.getByText(TEXTO_DA_LEITURA).querySelector('svg')!;
      expect(svg.getAttribute('class')).toContain(cor);
    },
  );

  it.each(TOMS_COM_ICONE_E_COR)(
    'deve mostrar o ícone $icone quando o tom é $tom',
    ({ tom, icone: nomeDoIcone }) => {
      // Arrange
      const leitura: Leitura = { tom, texto: TEXTO_DA_LEITURA };

      // Act
      renderComLeitura(leitura);

      // Assert
      const svg = screen.getByText(TEXTO_DA_LEITURA).querySelector('svg')!;
      expect(svg.classList.contains(nomeDoIcone)).toBe(true);
    },
  );

  it('deve esconder o ícone da leitura dos leitores de tela quando há leitura', () => {
    // Arrange
    const leitura: Leitura = { tom: 'ok', texto: TEXTO_DA_LEITURA };

    // Act
    const { container } = renderComLeitura(leitura);

    // Assert
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('deve mostrar o texto da leitura quando há detalhe', () => {
    // Arrange
    const leitura: Leitura = { tom: 'ruim', texto: TEXTO_DA_LEITURA };

    // Act
    renderComLeitura(leitura, DETALHE);

    // Assert
    expect(screen.getByText(TEXTO_DA_LEITURA)).toBeDefined();
  });

  it('deve manter o link para o destino quando há leitura', () => {
    // Arrange
    const leitura: Leitura = { tom: 'ok', texto: TEXTO_DA_LEITURA };

    // Act
    renderComLeitura(leitura, undefined, DESTINO);

    // Assert
    expect(screen.getByRole('link').getAttribute('href')).toBe(DESTINO);
  });
});
