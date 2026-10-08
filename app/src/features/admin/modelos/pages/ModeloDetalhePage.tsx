import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { modelosApi } from '../api/modelosApi';

import { useAuth } from '@/app/providers/authContext';
import { ExportarPdfButton } from '@/shared/components/ExportarPdfButton/ExportarPdfButton';
import { Button } from '@/shared/components/Button/Button';
import { Card } from '@/shared/components/Card/Card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader, type AcaoDoMenu } from '@/shared/components/PageHeader/PageHeader';
import { useExportarPdf } from '@/shared/hooks/useExportarPdf';
import { cn } from '@/shared/lib/cn';
import { canManageModelos } from '@/shared/lib/permissions';
import { rotuloDoTipoDeModelo } from '@/shared/lib/rotulos';

import { SolicitacaoStatusBadge } from '@/features/solicitacoes/components/SolicitacaoStatusBadge';
import { useResumoDasSolicitacoesDoModelo } from '@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo';
import { useSolicitacoes } from '@/features/solicitacoes/hooks/useSolicitacoes';
import { formatDuracao } from '@/features/solicitacoes/lib/solicitacaoMessages';
import { EventosModeloList } from '../components/EventosModeloList';
import { GaleriaModelo } from '../components/GaleriaModelo';
import { ModeloStatusBadge } from '../components/ModeloStatusBadge';
import type { ResumoDasSolicitacoesDoModelo } from '../types/modeloTypes';
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
  const {
    data: resumoDasSolicitacoes,
    isLoading: carregandoResumo,
    isError: erroNoResumo,
  } = useResumoDasSolicitacoesDoModelo(id);
  const desativarModelo = useDesativarModelo();
  const ativarModelo = useAtivarModelo();
  const [showConfirm, setShowConfirm] = useState<'desativar' | 'ativar' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
  const buscarFicha = () => modelosApi.exportarFicha(id ?? '');
  const nomeDaFicha = () => `ficha-modelo-${modelo?.codigo ?? id}.pdf`;
  const {
    exportar,
    exportando,
    erro: erroDaExportacao,
  } = useExportarPdf({
    buscar: buscarFicha,
    nomeDoArquivo: nomeDaFicha,
  });
  const gerencia = Boolean(id) && podeGerenciarFoto;

  const maisAcoes: AcaoDoMenu[] = [
    {
      rotulo: exportando ? 'Exportando...' : 'Exportar PDF',
      onSelect: exportar,
      desabilitada: exportando,
    },
    ...(modelo?.ativo === true
      ? [
          {
            rotulo: 'Desativar',
            perigo: true,
            onSelect: () => setShowConfirm('desativar'),
            desabilitada: isMutating,
          },
        ]
      : []),
    ...(modelo?.ativo === false
      ? [{ rotulo: 'Ativar', onSelect: () => setShowConfirm('ativar'), desabilitada: isMutating }]
      : []),
  ];

  return (
    <section>
      <PageHeader
        title="Detalhe do modelo"
        description="Consulte dados, eventos e a galeria de fotos do modelo."
        actions={
          gerencia ? (
            <Link to={`/app/admin/modelos/${id}/editar`}>
              <Button>Editar</Button>
            </Link>
          ) : id ? (
            <ExportarPdfButton buscar={buscarFicha} nomeDoArquivo={nomeDaFicha} />
          ) : null
        }
        maisAcoes={gerencia ? maisAcoes : undefined}
      />
      {erroDaExportacao && gerencia ? (
        <div className="mb-4">
          <ErrorState title="Exportação não concluída" description={erroDaExportacao} />
        </div>
      ) : null}
      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}
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
      ) : null}
      {showConfirm === 'ativar' ? (
        <ConfirmDialog
          title="Ativar modelo"
          message={`Deseja ativar o modelo ${modelo?.codigo}?`}
          confirmLabel="Ativar"
          variant="warning"
          isPending={isMutating}
          onCancel={() => setShowConfirm(null)}
          onConfirm={handleConfirmAction}
        />
      ) : null}
      {isLoading ? <LoadingState title="Carregando modelo..." /> : null}
      {error ? (
        <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />
      ) : null}
      {modelo ? (
        <div className="space-y-6">
          <Card className="rounded-md p-5 shadow-none">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-fg">
                {modelo.codigo} v{modelo.versao}
              </h2>
              <ModeloStatusBadge ativo={modelo.ativo} />
            </div>
            <p className="mt-3 text-fg-muted">{modelo.descricao}</p>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Máquina / Encaixe" value={modelo.maquina} />
              <Detail
                label="Tipo do Modelo"
                value={modelo.tipo ? rotuloDoTipoDeModelo[modelo.tipo] : 'Não definido'}
              />
              <Detail label="Pendência aberta" value={modelo.temPendenciaAberta ? 'Sim' : 'Não'} />
              <Detail label="Criado em" value={formatDate(modelo.criadoEm)} />
              <Detail label="Atualizado em" value={formatDate(modelo.atualizadoEm)} />
            </dl>
            {modelo.observacoes ? (
              <p className="mt-5 text-sm text-fg-muted">{modelo.observacoes}</p>
            ) : null}
          </Card>
          <div>
            <h2 className="text-lg font-semibold text-fg">Galeria de fotos</h2>
            <p className="mb-3 text-xs text-fg-muted">
              Fotos de apresentação e estado atual do modelo. Independente do histórico de
              evidências — marque uma foto como capa para destacá-la nas listagens.
            </p>
            {id ? <GaleriaModelo modeloId={id} podeGerenciar={podeGerenciarFoto} /> : null}
          </div>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-fg">Visão geral das solicitações</h2>
            <p className="mb-3 text-xs text-fg-muted">
              Indicadores consolidados de todos os chamados vinculados a este modelo.
            </p>
            {erroNoResumo ? (
              <p role="alert" className="text-sm text-danger-fg">
                Não foi possível carregar o resumo das solicitações deste modelo.
              </p>
            ) : carregandoResumo || !resumoDasSolicitacoes ? (
              <p role="status" className="text-sm text-fg-muted">
                Carregando o resumo das solicitações...
              </p>
            ) : (
              <ModeloDashboard resumo={resumoDasSolicitacoes} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">Eventos do Modelo</h2>
            <p className="mb-3 text-xs text-fg-muted">
              Histórico cronológico de modificações físicas, atualizações cadastrais e intervenções
              concluídas neste modelo.
            </p>
            <EventosModeloList eventos={eventosData ?? []} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">
              Histórico de Solicitações ({solicitacoesPage?.totalElements ?? 0})
            </h2>
            <p className="mb-3 text-xs text-fg-muted">
              Todos os chamados de manutenção e ordens de serviço (ativos no Kanban ou já
              encerrados) vinculados a este modelo.
            </p>
            {solicitacoesPage?.content?.length ? (
              <ul className="divide-y divide-line rounded-md border border-line">
                {solicitacoesPage.content.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/app/solicitacoes/${s.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-muted"
                    >
                      <span className="text-sm font-medium text-fg">{s.titulo}</span>
                      <SolicitacaoStatusBadge status={s.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">
                Nenhuma solicitação registrada para este modelo.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ModeloDashboard({ resumo }: { resumo: ResumoDasSolicitacoesDoModelo }) {
  const { total, concluidas, tempoMedioResolucaoSegundos, intervaloMedioSegundos } = resumo;
  const taxaSucesso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Total" value={total} tom="neutro" />
      <KpiCard label="Abertas" value={resumo.emAberto} tom="alerta" />
      <KpiCard label="Concluídas" value={concluidas} tom="sucesso" />
      <KpiCard label="Taxa de sucesso" value={`${taxaSucesso}%`} tom="destaque" />
      <KpiCard
        label="Tempo médio de resolução"
        value={
          tempoMedioResolucaoSegundos != null ? formatDuracao(tempoMedioResolucaoSegundos) : '—'
        }
        tom="neutro"
      />
      <KpiCard
        label="Intervalo médio entre solicitações"
        value={intervaloMedioSegundos != null ? formatDuracao(intervaloMedioSegundos) : '—'}
        tom="neutro"
      />
    </div>
  );
}

const TONS_DO_INDICADOR = {
  neutro: { borda: 'border-line', valor: 'text-fg' },
  alerta: { borda: 'border-warning', valor: 'text-warning-fg' },
  sucesso: { borda: 'border-success', valor: 'text-success-fg' },
  destaque: { borda: 'border-accent', valor: 'text-accent' },
};

function KpiCard({
  label,
  value,
  tom,
}: {
  label: string;
  value: number | string;
  tom: keyof typeof TONS_DO_INDICADOR;
}) {
  return (
    <Card className={cn('rounded-md p-4 shadow-none', TONS_DO_INDICADOR[tom].borda)}>
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', TONS_DO_INDICADOR[tom].valor)}>{value}</p>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-fg-muted">{label}</dt>
      <dd className="mt-1 text-fg">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}
