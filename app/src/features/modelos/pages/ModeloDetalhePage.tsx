import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useMaquinas } from '@/features/admin/maquinas/hooks/useMaquinas';
import { EventosModeloList } from '@/features/admin/modelos/components/EventosModeloList';
import { ModeloFotoCapa } from '@/features/admin/modelos/components/ModeloFotoCapa';
import { ModeloStatusBadge } from '@/features/admin/modelos/components/ModeloStatusBadge';
import { useEventosModelo } from '@/features/admin/modelos/hooks/useEventosModelo';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import { getModeloErrorMessage } from '@/features/admin/modelos/lib/modeloMessages';
import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function ModeloDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: modelo, error, isLoading } = useModelo(id);
  const { data: eventosData } = useEventosModelo(id);
  const { data: maquinasData } = useMaquinas({ page: 0, size: 200 });

  const maquinasMap = useMemo(
    () => new Map((maquinasData?.content ?? []).map((m) => [m.id, `${m.codigo} - ${m.nome}`])),
    [maquinasData],
  );

  if (isLoading) return <LoadingState title="Carregando modelo..." />;
  if (error || !modelo)
    return <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />;

  return (
    <section>
      <PageHeader
        title={`${modelo.codigo} v${modelo.versao}`}
        description="Detalhes do modelo de máquina."
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate('/app/modelos')}>
            Voltar
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                {modelo.codigo} v{modelo.versao}
              </h2>
              <ModeloStatusBadge ativo={modelo.ativo} />
            </div>
            <p className="mt-3 text-slate-700 dark:text-slate-200">{modelo.descricao}</p>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <Detail
                label="Máquina"
                value={maquinasMap.get(modelo.maquinaId) ?? modelo.maquinaId}
              />
              <Detail label="Pendência aberta" value={modelo.temPendenciaAberta ? 'Sim' : 'Não'} />
              <Detail label="Criado em" value={formatDate(modelo.criadoEm)} />
              <Detail label="Atualizado em" value={formatDate(modelo.atualizadoEm)} />
            </dl>
            {modelo.observacoes ? (
              <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                {modelo.observacoes}
              </p>
            ) : null}
          </div>
          <aside>
            <ModeloFotoCapa fotoUrl={modelo.fotoUrl} />
          </aside>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-950 dark:text-white">Eventos</h2>
          <EventosModeloList eventos={eventosData ?? []} />
        </div>
      </div>
    </section>
  );
}
