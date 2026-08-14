import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { modelosApi } from '../api/modelosApi';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canManageModelos } from '@/shared/lib/permissions';

import { SolicitacaoStatusBadge } from '@/features/solicitacoes/components/SolicitacaoStatusBadge';
import { useSolicitacoes } from '@/features/solicitacoes/hooks/useSolicitacoes';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { EventosModeloList } from '../components/EventosModeloList';
import { GaleriaModelo } from '../components/GaleriaModelo';
import { ModeloStatusBadge } from '../components/ModeloStatusBadge';
import { useDesativarModelo } from '../hooks/useDesativarModelo';
import { useAtivarModelo } from '../hooks/useAtivarModelo';
import { useEventosModelo } from '../hooks/useEventosModelo';
import { useModelo } from '../hooks/useModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';

export function ModeloDetalhePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: modelo, error, isLoading } = useModelo(id);
  const { data: eventosData } = useEventosModelo(id);
  const { data: solicitacoesPage } = useSolicitacoes(
    { modeloId: id, page: 0, size: 50 },
    { enabled: !!id },
  );
  const desativarModelo = useDesativarModelo();
  const ativarModelo = useAtivarModelo();
  const [showConfirm, setShowConfirm] = useState<'desativar' | 'ativar' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const podeGerenciarFoto = canManageModelos(user?.perfil);

  async function handleConfirmAction() {
    if (!id || !showConfirm) return;
    setActionError(null);
    try {
      if (showConfirm === 'desativar') {
        await desativarModelo.mutateAsync(id);
      } else {
        await ativarModelo.mutateAsync(id);
      }
      setShowConfirm(null);
    } catch (mutationError) {
      setActionError(getModeloErrorMessage(mutationError));
      setShowConfirm(null);
    }
  }

  const isMutating = desativarModelo.isPending || ativarModelo.isPending;

  async function handleExportarFicha() {
    if (!id) return;
    setIsExporting(true);
    try {
      const blob = await modelosApi.exportarFicha(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ficha-modelo-${modelo?.codigo ?? id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar ficha:', err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Detalhe do modelo"
        description="Consulte dados, eventos e a galeria de fotos do modelo."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" disabled={isExporting} onClick={handleExportarFicha}>
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
            {id && podeGerenciarFoto ? (
              <>
                <Link to={`/app/admin/modelos/${id}/editar`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                {modelo?.ativo ? (
                  <Button
                    variant="secondary"
                    disabled={isMutating}
                    onClick={() => setShowConfirm('desativar')}
                  >
                    Desativar
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={isMutating}
                    onClick={() => setShowConfirm('ativar')}
                  >
                    Ativar
                  </Button>
                )}
              </>
            ) : null}
          </div>
        }
      />
      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}
      {showConfirm ? (
        <div className="mb-4">
          {showConfirm === 'desativar' ? (
            <ConfirmDialog
              title="Desativar modelo"
              message="Modelos inativos não devem ser usados em novas solicitações. Deseja continuar?"
              confirmLabel="Desativar"
              variant="danger"
              isPending={isMutating}
              onCancel={() => setShowConfirm(null)}
              onConfirm={handleConfirmAction}
            />
          ) : (
            <ConfirmDialog
              title="Ativar modelo"
              message={`Deseja ativar o modelo ${modelo?.codigo}?`}
              confirmLabel="Ativar"
              variant="warning"
              isPending={isMutating}
              onCancel={() => setShowConfirm(null)}
              onConfirm={handleConfirmAction}
            />
          )}
        </div>
      ) : null}
      {isLoading ? <LoadingState title="Carregando modelo..." /> : null}
      {error ? (
        <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />
      ) : null}
      {modelo ? (
        <div className="space-y-6">
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
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Galeria de fotos
            </h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Fotos de apresentação e estado atual do modelo. Independente do histórico de
              evidências — marque uma foto como capa para destacá-la nas listagens.
            </p>
            {id ? <GaleriaModelo modeloId={id} podeGerenciar={podeGerenciarFoto} /> : null}
          </div>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-slate-950 dark:text-white">
              Visão geral das solicitações
            </h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Indicadores consolidados de todos os chamados vinculados a este modelo.
            </p>
            <ModeloDashboard solicitacoes={solicitacoesPage?.content ?? []} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Eventos do Modelo</h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Histórico cronológico de modificações físicas, atualizações cadastrais e intervenções concluídas neste modelo.
            </p>
            <EventosModeloList eventos={eventosData ?? []} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Histórico de Solicitações ({solicitacoesPage?.totalElements ?? 0})
            </h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Todos os chamados de manutenção e ordens de serviço (ativos no Kanban ou já encerrados) vinculados a este modelo.
            </p>
            {solicitacoesPage?.content?.length ? (
              <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {solicitacoesPage.content.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/app/solicitacoes/${s.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {s.titulo}
                      </span>
                      <SolicitacaoStatusBadge status={s.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma solicitação registrada para este modelo.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ModeloDashboard({ solicitacoes }: { solicitacoes: Solicitacao[] }) {
  const total = solicitacoes.length;
  const abertas = solicitacoes.filter((s) => !['CONCLUIDA', 'CANCELADA'].includes(s.status)).length;
  const concluidas = solicitacoes.filter((s) => s.status === 'CONCLUIDA').length;
  const taxaSucesso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Total" value={total} color="slate" />
      <KpiCard label="Abertas" value={abertas} color="amber" />
      <KpiCard label="Concluídas" value={concluidas} color="green" />
      <KpiCard label="Taxa de sucesso" value={`${taxaSucesso}%`} color="blue" />
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: 'slate' | 'amber' | 'green' | 'blue';
}) {
  const colorMap = {
    slate: 'border-slate-200 dark:border-slate-700',
    amber: 'border-amber-200 dark:border-amber-800',
    green: 'border-green-200 dark:border-green-800',
    blue: 'border-sky-200 dark:border-sky-800',
  };
  const valueColorMap = {
    slate: 'text-slate-900 dark:text-slate-100',
    amber: 'text-amber-600 dark:text-amber-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-sky-600 dark:text-sky-400',
  };
  return (
    <div
      className={`rounded-md border bg-white p-4 dark:bg-slate-900 ${colorMap[color]}`}
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
    </div>
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
