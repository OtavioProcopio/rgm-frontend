import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { EventosModeloList } from '../components/EventosModeloList';
import { ModeloFotoCapa } from '../components/ModeloFotoCapa';
import { ModeloStatusBadge } from '../components/ModeloStatusBadge';
import { UploadFotoCapaDialog } from '../components/UploadFotoCapaDialog';
import { useEventosModelo } from '../hooks/useEventosModelo';
import { useModelo } from '../hooks/useModelo';
import { useUploadFotoCapa } from '../hooks/useUploadFotoCapa';
import { getModeloErrorMessage } from '../lib/modeloMessages';

export function ModeloDetalhePage() {
  const { id } = useParams();
  const { data: modelo, error, isLoading } = useModelo(id);
  const { data: eventosData } = useEventosModelo(id);
  const uploadFoto = useUploadFotoCapa();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleUpload(file: File) {
    if (!id) return;
    setErrorMessage(null);
    try {
      await uploadFoto.mutateAsync({ id, file });
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Detalhe do modelo"
        description="Consulte dados, eventos e foto de capa do modelo."
        actions={
          id ? (
            <Link to={`/app/admin/modelos/${id}/editar`}>
              <Button variant="secondary">Editar</Button>
            </Link>
          ) : null
        }
      />
      {isLoading ? <LoadingState title="Carregando modelo..." /> : null}
      {error ? (
        <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />
      ) : null}
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={errorMessage} />
        </div>
      ) : null}
      {modelo ? (
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
                  label="Máquina / Encaixe"
                  value={modelo.maquina}
                />
                <Detail
                  label="Pendência aberta"
                  value={modelo.temPendenciaAberta ? 'Sim' : 'Não'}
                />
                <Detail label="Criado em" value={formatDate(modelo.criadoEm)} />
                <Detail label="Atualizado em" value={formatDate(modelo.atualizadoEm)} />
              </dl>
              {modelo.observacoes ? (
                <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                  {modelo.observacoes}
                </p>
              ) : null}
            </div>
            <aside className="space-y-4">
              <ModeloFotoCapa fotoUrl={modelo.fotoUrl} />
              <UploadFotoCapaDialog isUploading={uploadFoto.isPending} onUpload={handleUpload} />
            </aside>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-950 dark:text-white">Eventos</h2>
            <EventosModeloList eventos={eventosData ?? []} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

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
