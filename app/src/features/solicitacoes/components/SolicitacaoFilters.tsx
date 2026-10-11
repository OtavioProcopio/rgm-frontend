import { X } from 'lucide-react';

import { useMaquinaOptions } from '@/features/admin/modelos/hooks/useMaquinaOptions';
import { Select } from '@/shared/components/Select/Select';
import { Input } from '@/shared/components/Input/Input';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

import { BuscaTextual } from './BuscaTextual';
import { SeletorDeModelo } from './SeletorDeModelo';

import type {
  PrioridadeSolicitacao,
  SolicitacoesFilters,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../types/solicitacaoTypes';

type Props = {
  filters: SolicitacoesFilters;
  onChange: (filters: SolicitacoesFilters) => void;
};

/** Opções de um filtro, na ordem do mapa de rótulos compartilhado. */
function opcoesDe(rotulos: Record<string, string>): { value: string; label: string }[] {
  return Object.entries(rotulos).map(([value, label]) => ({ value, label }));
}

const statusOptions = opcoesDe(rotuloDoStatus);
const tipoOptions = opcoesDe(rotuloDoTipoDeSolicitacao);
const prioridadeOptions = opcoesDe(rotuloDaPrioridade);

type EtiquetaProps = { rotulo: string; onRemove: () => void };

/** Etiqueta de um filtro ativo sem controle próprio, removível com um toque. */
function EtiquetaDeFiltro({ rotulo, onRemove }: EtiquetaProps) {
  return (
    <button
      type="button"
      aria-label={`Remover filtro ${rotulo}`}
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg-muted pointer-coarse:min-h-11"
    >
      {rotulo}
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

/** Etiquetas removíveis dos filtros sem controle próprio na lista, quando ativos. */
function EtiquetasAtivas({ filters, onChange }: Props) {
  if (!filters.atrasada && !filters.emAberto && !filters.responsavelId) return null;
  const remover = (campo: 'atrasada' | 'emAberto' | 'responsavelId') => () =>
    onChange({ ...filters, page: 0, [campo]: undefined });

  return (
    <div className="flex w-full flex-wrap gap-2">
      {filters.atrasada && <EtiquetaDeFiltro rotulo="Em atraso" onRemove={remover('atrasada')} />}
      {filters.emAberto && <EtiquetaDeFiltro rotulo="Em aberto" onRemove={remover('emAberto')} />}
      {filters.responsavelId && (
        <EtiquetaDeFiltro rotulo="Um responsável" onRemove={remover('responsavelId')} />
      )}
    </div>
  );
}

export function SolicitacaoFilters({ filters, onChange }: Props) {
  const { options: maquinaOptions } = useMaquinaOptions(filters.maquina);

  /** Muda um campo do filtro e volta para a primeira página. */
  function alterar<K extends keyof SolicitacoesFilters>(
    campo: K,
    valor: SolicitacoesFilters[K] | undefined,
  ) {
    onChange({ ...filters, page: 0, [campo]: valor });
  }

  const doSelect =
    <T extends string>(campo: 'status' | 'tipo' | 'prioridade' | 'maquina') =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      alterar(campo, (e.target.value as T | '') || undefined);

  const dataDe =
    (campo: 'criadaEmInicio' | 'criadaEmFim', hora: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      alterar(campo, e.target.value ? `${e.target.value}T${hora}Z` : undefined);

  return (
    <div className="mb-5 flex flex-wrap gap-4">
      <EtiquetasAtivas filters={filters} onChange={onChange} />
      <div className="w-full sm:w-80">
        <BuscaTextual valor={filters.q} onChange={(q) => alterar('q', q)} />
      </div>
      <div className="w-full sm:w-56">
        <Select
          label="Status"
          options={statusOptions}
          placeholder="Todos os status"
          limpavel
          value={filters.status ?? ''}
          onChange={doSelect<StatusSolicitacao>('status')}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          label="Tipo"
          options={tipoOptions}
          placeholder="Todos os tipos"
          limpavel
          value={filters.tipo ?? ''}
          onChange={doSelect<TipoSolicitacao>('tipo')}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          label="Prioridade"
          options={prioridadeOptions}
          placeholder="Todas as prioridades"
          limpavel
          value={filters.prioridade ?? ''}
          onChange={doSelect<PrioridadeSolicitacao>('prioridade')}
        />
      </div>
      <div className="w-full sm:w-64">
        <SeletorDeModelo
          label="Modelo"
          placeholder="Todos os modelos"
          value={filters.modeloId ?? ''}
          onChange={(modeloId) => alterar('modeloId', modeloId || undefined)}
        />
      </div>
      {maquinaOptions.length > 0 && (
        <div className="w-full sm:w-56">
          <Select
            label="Máquina"
            options={maquinaOptions}
            placeholder="Todas as máquinas"
            limpavel
            value={filters.maquina ?? ''}
            onChange={doSelect<string>('maquina')}
          />
        </div>
      )}
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada a partir de"
          value={filters.criadaEmInicio ? filters.criadaEmInicio.split('T')[0] : ''}
          onChange={dataDe('criadaEmInicio', '00:00:00')}
        />
      </div>
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada até"
          value={filters.criadaEmFim ? filters.criadaEmFim.split('T')[0] : ''}
          onChange={dataDe('criadaEmFim', '23:59:59')}
        />
      </div>
    </div>
  );
}
