import { useId, useState } from 'react';

import { Card } from '@/shared/components/Card/Card';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { SecaoRecolhivel } from '@/shared/components/SecaoRecolhivel/SecaoRecolhivel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';
import { cn } from '@/shared/lib/cn';

import { useHistoricoMetricas } from '../hooks/useHistoricoMetricas';
import type { PeriodoDoPainel } from '../lib/periodoDoPainel';
import {
  ehHoje,
  marcasDoEixo,
  rotuloDoPonto,
  rotuloDoUltimoPonto,
  semMovimento,
} from '../lib/tendenciaDoPeriodo';
import type { HistoricoMetricas, PontoDeSerie } from '../types/solicitacaoTypes';

const MAXIMO_DE_ROTULOS = 6;
const CABECALHOS: string[] = ['Período', 'Criadas', 'Abertas', 'Concluídas', 'Canceladas'];

/** Índices que levam rótulo de data: o primeiro, o último e os espaçados entre eles. */
function indicesComRotulo(total: number): (indice: number) => boolean {
  const ultimo: number = total - 1;
  const passo: number = Math.max(1, Math.ceil(ultimo / (MAXIMO_DE_ROTULOS - 1)));
  return (indice: number): boolean =>
    indice === ultimo || (indice % passo === 0 && ultimo - indice >= passo);
}

function porcentagem(valor: number, topo: number): string {
  return `${(valor / topo) * 100}%`;
}

function Legenda({ periodoLabel }: { periodoLabel: string }) {
  return (
    <div className="mt-1 text-xs text-fg-muted">
      <p>{periodoLabel}</p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        <ItemDaLegenda cor="bg-accent" texto="Abertas: criadas neste dia que hoje estão abertas" />
        <ItemDaLegenda
          cor="bg-success"
          texto="Concluídas: criadas neste dia que hoje estão concluídas"
        />
      </ul>
    </div>
  );
}

function ItemDaLegenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('size-2.5 rounded-sm', cor)} />
      {texto}
    </li>
  );
}

function EixoVertical({ marcas }: { marcas: number[] }) {
  const topo: number = marcas[marcas.length - 1];
  return (
    <ul aria-label="Escala do gráfico" className="relative h-44 w-8 shrink-0 text-xs">
      {marcas.map((marca: number) => (
        <li
          key={marca}
          className="absolute right-0 translate-y-1/2 tabular-nums text-fg-muted"
          style={{ bottom: porcentagem(marca, topo) }}
        >
          {marca}
        </li>
      ))}
    </ul>
  );
}

function LinhasDeGrade({ marcas }: { marcas: number[] }) {
  const topo: number = marcas[marcas.length - 1];
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {marcas.map((marca: number) => (
        <div
          key={marca}
          className="absolute inset-x-0 border-t border-line/50"
          style={{ bottom: porcentagem(marca, topo) }}
        />
      ))}
    </div>
  );
}

type GrupoProps = { ponto: PontoDeSerie; topo: number; destaque: boolean };

function classeDoGrupo(destaque: boolean): string {
  return cn(
    'flex h-full items-end gap-0.5 rounded-sm px-0.5',
    destaque && 'bg-surface-muted ring-2 ring-accent',
  );
}

function useBalaoDoPonto() {
  const [focado, definirFocado] = useState<boolean>(false);
  const [sobre, definirSobre] = useState<boolean>(false);
  return {
    visivel: focado || sobre,
    gatilhos: {
      onFocus: () => definirFocado(true),
      onBlur: () => definirFocado(false),
      onMouseEnter: () => definirSobre(true),
      onMouseLeave: () => definirSobre(false),
    },
  };
}

function BarrasDoPonto({ ponto, topo }: { ponto: PontoDeSerie; topo: number }) {
  return (
    <>
      <div className="w-full bg-accent" style={{ height: porcentagem(ponto.abertas, topo) }} />
      <div className="w-full bg-success" style={{ height: porcentagem(ponto.concluidas, topo) }} />
    </>
  );
}

function GrupoDoPonto({ ponto, topo, destaque }: GrupoProps) {
  const { visivel, gatilhos } = useBalaoDoPonto();
  const rotulo: string = rotuloDoPonto(ponto);
  return (
    <div className="relative h-full flex-1">
      <div
        role="img"
        tabIndex={0}
        aria-label={rotulo}
        {...gatilhos}
        className={classeDoGrupo(destaque)}
      >
        <BarrasDoPonto ponto={ponto} topo={topo} />
      </div>
      {visivel ? <Balao texto={rotulo} /> : null}
    </div>
  );
}

function Balao({ texto }: { texto: string }) {
  return (
    <div
      role="tooltip"
      className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border border-line bg-surface px-2 py-1 text-xs whitespace-nowrap text-fg shadow-sm"
    >
      {texto}
    </div>
  );
}

function RotulosDeData({ series, dias }: { series: PontoDeSerie[]; dias: PeriodoDoPainel }) {
  const comRotulo = indicesComRotulo(series.length);
  const textoDe = (ponto: PontoDeSerie, indice: number): string => {
    if (ehHoje(indice, series.length)) return rotuloDoUltimoPonto(dias);
    return comRotulo(indice) ? ponto.periodo : '';
  };
  return (
    <div aria-hidden="true" className="mt-1 flex text-xs text-fg-muted">
      {series.map((ponto: PontoDeSerie, indice: number) => (
        <span key={ponto.periodo} className="min-w-0 flex-1 text-center">
          {textoDe(ponto, indice)}
        </span>
      ))}
    </div>
  );
}

function GruposDeBarras({ series, marcas }: { series: PontoDeSerie[]; marcas: number[] }) {
  const topo: number = marcas[marcas.length - 1];
  return (
    <div className="relative h-44">
      <LinhasDeGrade marcas={marcas} />
      <div className="relative flex h-full gap-1">
        {series.map((ponto: PontoDeSerie, indice: number) => (
          <GrupoDoPonto
            key={ponto.periodo}
            ponto={ponto}
            topo={topo}
            destaque={ehHoje(indice, series.length)}
          />
        ))}
      </div>
    </div>
  );
}

function Grafico({ series, dias }: { series: PontoDeSerie[]; dias: PeriodoDoPainel }) {
  const maior: number = Math.max(...series.flatMap((p) => [p.abertas, p.concluidas]));
  const marcas: number[] = marcasDoEixo(maior);
  return (
    <div
      role="group"
      aria-label={`Gráfico de tendência dos últimos ${dias} dias`}
      className="mt-4 flex gap-2"
    >
      <EixoVertical marcas={marcas} />
      <div className="min-w-0 flex-1">
        <GruposDeBarras series={series} marcas={marcas} />
        <RotulosDeData series={series} dias={dias} />
      </div>
    </div>
  );
}

function GraficoVazio({ dias }: { dias: PeriodoDoPainel }) {
  return (
    <p className="mt-4 flex h-44 items-center justify-center text-center text-sm text-fg-muted">
      Nenhuma solicitação aberta ou concluída nos últimos {dias} dias
    </p>
  );
}

function CabecalhoDaTabela() {
  return (
    <TableHead>
      <TableRow>
        {CABECALHOS.map((cabecalho: string) => (
          <TableHeaderCell key={cabecalho}>{cabecalho}</TableHeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function LinhaDaTabela({ ponto }: { ponto: PontoDeSerie }) {
  return (
    <TableRow>
      <TableCell>{ponto.periodo}</TableCell>
      <TableCell className="tabular-nums">{ponto.total}</TableCell>
      <TableCell className="tabular-nums">{ponto.abertas}</TableCell>
      <TableCell className="tabular-nums">{ponto.concluidas}</TableCell>
      <TableCell className="tabular-nums">{ponto.canceladas}</TableCell>
    </TableRow>
  );
}

function TabelaDeValores({ series }: { series: PontoDeSerie[] }) {
  return (
    <SecaoRecolhivel
      id="tendencia-valores"
      titulo="Ver valores em tabela"
      className="mt-4"
      abertaPorPadrao={false}
    >
      <Table className="mt-2">
        <CabecalhoDaTabela />
        <TableBody>
          {series.map((ponto: PontoDeSerie) => (
            <LinhaDaTabela key={ponto.periodo} ponto={ponto} />
          ))}
        </TableBody>
      </Table>
    </SecaoRecolhivel>
  );
}

type CartaoProps = { historico: HistoricoMetricas; dias: PeriodoDoPainel };

function CorpoDoGrafico({ series, dias }: { series: PontoDeSerie[]; dias: PeriodoDoPainel }) {
  if (semMovimento(series)) return <GraficoVazio dias={dias} />;
  return <Grafico series={series} dias={dias} />;
}

function CartaoDaTendencia({ historico, dias }: CartaoProps) {
  const idTitulo: string = useId();
  const { series, periodoLabel } = historico;
  return (
    <Card as="section" aria-labelledby={idTitulo} className="p-5">
      <h2 id={idTitulo} className="text-base font-semibold text-fg">
        Tendência
      </h2>
      <Legenda periodoLabel={periodoLabel} />
      <CorpoDoGrafico series={series} dias={dias} />
      <TabelaDeValores series={series} />
    </Card>
  );
}

export function TendenciaDoPeriodo({ dias }: { dias: PeriodoDoPainel }) {
  const { data, isPending, isError, refetch } = useHistoricoMetricas(dias);
  if (isPending) {
    return (
      <div role="status">
        <LoadingState title="Carregando a tendência..." />
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar a tendência"
        description="Verifique sua conexão com o servidor."
        onRetry={() => void refetch()}
      />
    );
  }
  return <CartaoDaTendencia historico={data} dias={dias} />;
}
