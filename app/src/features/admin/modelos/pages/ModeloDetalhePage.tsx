import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { modelosApi } from '../api/modelosApi';

import { useAuth } from '@/app/providers/authContext';
import { Abas } from '@/shared/components/Abas/Abas';
import { Badge } from '@/shared/components/Badge/Badge';
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

import { useResumoDasSolicitacoesDoModelo } from '@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo';
import { useSolicitacoes } from '@/features/solicitacoes/hooks/useSolicitacoes';
import { formatDuracao } from '@/features/solicitacoes/lib/solicitacaoMessages';
import { GaleriaModelo } from '../components/GaleriaModelo';
import { HistoricoDoModelo } from '../components/HistoricoDoModelo';
import { ModeloStatusBadge } from '../components/ModeloStatusBadge';
import type { Modelo, ResumoDasSolicitacoesDoModelo } from '../types/modeloTypes';
import { useDesativarModelo } from '../hooks/useDesativarModelo';
import { useAtivarModelo } from '../hooks/useAtivarModelo';
import { useEventosModelo } from '../hooks/useEventosModelo';
import { useModelo } from '../hooks/useModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';

type AcaoDeConfirmacao = 'desativar' | 'ativar';
type Mutacao = { mutateAsync: (id: string) => Promise<unknown> };

export function ModeloDetalhePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: modelo, error, isLoading } = useModelo(id);
  const dados = useDadosDoModelo(id);
  const podeGerenciarFoto = canManageModelos(user?.perfil);

  return (
    <section>
      <CabecalhoDoModelo id={id} modelo={modelo} gerencia={Boolean(id) && podeGerenciarFoto} />
      {isLoading ? <LoadingState title="Carregando modelo..." /> : null}
      {error ? (
        <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />
      ) : null}
      {modelo ? (
        <CorpoDoModelo
          id={id}
          modelo={modelo}
          podeGerenciarFoto={podeGerenciarFoto}
          dados={dados}
        />
      ) : null}
    </section>
  );
}

// ── Dados das abas ───────────────────────────────────────────

function useDadosDoModelo(id: string | undefined) {
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
  return { eventosData, solicitacoesPage, resumoDasSolicitacoes, carregandoResumo, erroNoResumo };
}

type DadosDoModelo = ReturnType<typeof useDadosDoModelo>;

// ── Ativar, desativar e exportar ─────────────────────────────

async function executarAcao(mutacao: Mutacao, id: string): Promise<string | null> {
  try {
    await mutacao.mutateAsync(id);
    return null;
  } catch (mutationError) {
    return getModeloErrorMessage(mutationError);
  }
}

function useConfirmacaoDoModelo(id: string | undefined) {
  const desativarModelo = useDesativarModelo();
  const ativarModelo = useAtivarModelo();
  const [showConfirm, setShowConfirm] = useState<AcaoDeConfirmacao | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmar() {
    if (!id || !showConfirm) return;
    setActionError(null);
    setActionError(
      await executarAcao(showConfirm === 'desativar' ? desativarModelo : ativarModelo, id),
    );
    setShowConfirm(null);
  }

  const isMutating = desativarModelo.isPending || ativarModelo.isPending;
  return { showConfirm, setShowConfirm, actionError, confirmar, isMutating };
}

type ConfirmacaoDoModelo = ReturnType<typeof useConfirmacaoDoModelo>;

function useExportacaoDoModelo(id: string | undefined, modelo: Modelo | undefined) {
  const buscarFicha = () => modelosApi.exportarFicha(id ?? '');
  const nomeDaFicha = () => `ficha-modelo-${modelo?.codigo ?? id}.pdf`;
  const { exportar, exportando, erro } = useExportarPdf({
    buscar: buscarFicha,
    nomeDoArquivo: nomeDaFicha,
  });
  return { buscarFicha, nomeDaFicha, exportar, exportando, erro };
}

type ExportacaoDoModelo = ReturnType<typeof useExportacaoDoModelo>;

function acoesDeAtivacao(
  ativo: boolean | undefined,
  ocupado: boolean,
  pedir: (a: AcaoDeConfirmacao) => void,
): AcaoDoMenu[] {
  if (ativo === true) {
    const desativar = { rotulo: 'Desativar', perigo: true, desabilitada: ocupado };
    return [{ ...desativar, onSelect: () => pedir('desativar') }];
  }
  if (ativo === false) {
    return [{ rotulo: 'Ativar', onSelect: () => pedir('ativar'), desabilitada: ocupado }];
  }
  return [];
}

function montarMaisAcoes(
  ficha: ExportacaoDoModelo,
  confirmacao: ConfirmacaoDoModelo,
  modelo: Modelo | undefined,
): AcaoDoMenu[] {
  const exportar: AcaoDoMenu = {
    rotulo: ficha.exportando ? 'Exportando...' : 'Exportar PDF',
    onSelect: ficha.exportar,
    desabilitada: ficha.exportando,
  };
  const { isMutating, setShowConfirm } = confirmacao;
  return [exportar, ...acoesDeAtivacao(modelo?.ativo, isMutating, setShowConfirm)];
}

// ── Cabeçalho ────────────────────────────────────────────────

type PropsDoCabecalho = { id: string | undefined; modelo: Modelo | undefined; gerencia: boolean };

function CabecalhoDoModelo({ id, modelo, gerencia }: PropsDoCabecalho) {
  const confirmacao = useConfirmacaoDoModelo(id);
  const ficha = useExportacaoDoModelo(id, modelo);
  const maisAcoes = montarMaisAcoes(ficha, confirmacao, modelo);

  return (
    <>
      <PageHeader
        title="Detalhe do modelo"
        description="Consulte dados, eventos e a galeria de fotos do modelo."
        actions={<AcaoPrincipalDoModelo id={id} gerencia={gerencia} ficha={ficha} />}
        maisAcoes={gerencia ? maisAcoes : undefined}
      />
      <ErroDoModelo titulo="Exportação não concluída" mensagem={gerencia ? ficha.erro : null} />
      <ErroDoModelo titulo="Operação não concluída" mensagem={confirmacao.actionError} />
      <DialogosDoModelo codigo={modelo?.codigo} confirmacao={confirmacao} />
    </>
  );
}

type PropsDaAcaoPrincipal = {
  id: string | undefined;
  gerencia: boolean;
  ficha: ExportacaoDoModelo;
};

function AcaoPrincipalDoModelo({ id, gerencia, ficha }: PropsDaAcaoPrincipal) {
  if (gerencia) {
    return (
      <Link to={`/app/admin/modelos/${id}/editar`}>
        <Button>Editar</Button>
      </Link>
    );
  }
  if (!id) return null;
  return <ExportarPdfButton buscar={ficha.buscarFicha} nomeDoArquivo={ficha.nomeDaFicha} />;
}

function ErroDoModelo({ titulo, mensagem }: { titulo: string; mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div className="mb-4">
      <ErrorState title={titulo} description={mensagem} />
    </div>
  );
}

type PropsDosDialogos = { codigo: string | undefined; confirmacao: ConfirmacaoDoModelo };

function DialogosDoModelo({ codigo, confirmacao }: PropsDosDialogos) {
  const { showConfirm, setShowConfirm, confirmar, isMutating } = confirmacao;
  const comum = {
    isPending: isMutating,
    onCancel: () => setShowConfirm(null),
    onConfirm: confirmar,
  };
  if (showConfirm === 'desativar') return <DialogoDeDesativar {...comum} />;
  if (showConfirm === 'ativar') return <DialogoDeAtivar codigo={codigo} {...comum} />;
  return null;
}

type PropsDoDialogo = { isPending: boolean; onCancel: () => void; onConfirm: () => void };

function DialogoDeDesativar(props: PropsDoDialogo) {
  return (
    <ConfirmDialog
      title="Desativar modelo"
      message="Modelos inativos não devem ser usados em novas solicitações. Deseja continuar?"
      confirmLabel="Desativar"
      variant="danger"
      {...props}
    />
  );
}

function DialogoDeAtivar({ codigo, ...props }: PropsDoDialogo & { codigo: string | undefined }) {
  return (
    <ConfirmDialog
      title="Ativar modelo"
      message={`Deseja ativar o modelo ${codigo}?`}
      confirmLabel="Ativar"
      variant="warning"
      {...props}
    />
  );
}

// ── Corpo (grade e abas) ─────────────────────────────────────

type PropsDoCorpo = {
  id: string | undefined;
  modelo: Modelo;
  podeGerenciarFoto: boolean;
  dados: DadosDoModelo;
};

function CorpoDoModelo({ id, modelo, podeGerenciarFoto, dados }: PropsDoCorpo) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        {id ? (
          <GaleriaModelo modeloId={id} codigo={modelo.codigo} podeGerenciar={podeGerenciarFoto} />
        ) : null}
        <IdentificacaoDoModelo modelo={modelo} />
      </div>
      <Abas
        rotulo="Detalhes do modelo"
        abas={[abaDeResumo(modelo, dados), abaDeHistorico(dados)]}
      />
    </div>
  );
}

function abaDeResumo(modelo: Modelo, dados: DadosDoModelo) {
  const conteudo = (
    <ResumoDoModelo
      observacoes={modelo.observacoes}
      resumo={dados.resumoDasSolicitacoes}
      carregando={dados.carregandoResumo}
      comErro={dados.erroNoResumo}
    />
  );
  return { id: 'resumo', rotulo: 'Resumo', conteudo };
}

function abaDeHistorico({ eventosData, solicitacoesPage }: DadosDoModelo) {
  const conteudo = (
    <HistoricoDoModelo
      eventos={eventosData ?? []}
      solicitacoes={solicitacoesPage?.content ?? []}
      totalDeSolicitacoes={solicitacoesPage?.totalElements}
    />
  );
  return { id: 'historico', rotulo: 'Histórico', conteudo };
}

function IdentificacaoDoModelo({ modelo }: { modelo: Modelo }) {
  return (
    <Card className="rounded-md p-5 shadow-none lg:self-start">
      <h2 className="text-2xl font-semibold text-fg">
        <span className="font-mono">{modelo.codigo}</span> v{modelo.versao}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ModeloStatusBadge ativo={modelo.ativo} />
        {modelo.temPendenciaAberta ? <Badge variant="warning">Pendência aberta</Badge> : null}
      </div>
      <p className="mt-3 text-fg-muted">{modelo.descricao}</p>
      <DadosDoModelo modelo={modelo} />
    </Card>
  );
}

function DadosDoModelo({ modelo }: { modelo: Modelo }) {
  return (
    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
      <Detail label="Máquina / Encaixe" value={modelo.maquina} />
      <Detail
        label="Tipo do Modelo"
        value={modelo.tipo ? rotuloDoTipoDeModelo[modelo.tipo] : 'Não definido'}
      />
      <Detail label="Criado em" value={formatDate(modelo.criadoEm)} />
      <Detail label="Atualizado em" value={formatDate(modelo.atualizadoEm)} />
    </dl>
  );
}

type ResumoDoModeloProps = {
  observacoes?: string | null;
  resumo?: ResumoDasSolicitacoesDoModelo;
  carregando: boolean;
  comErro: boolean;
};

function ResumoDoModelo({ observacoes, resumo, carregando, comErro }: ResumoDoModeloProps) {
  return (
    <div className="space-y-6">
      {observacoes ? <p className="text-sm text-fg-muted">{observacoes}</p> : null}
      {comErro ? (
        <p role="alert" className="text-sm text-danger-fg">
          Não foi possível carregar o resumo das solicitações deste modelo.
        </p>
      ) : carregando || !resumo ? (
        <p role="status" className="text-sm text-fg-muted">
          Carregando o resumo das solicitações...
        </p>
      ) : (
        <ModeloDashboard resumo={resumo} />
      )}
    </div>
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
        value={duracaoOuVazio(tempoMedioResolucaoSegundos)}
        tom="neutro"
      />
      <KpiCard
        label="Intervalo médio entre solicitações"
        value={duracaoOuVazio(intervaloMedioSegundos)}
        tom="neutro"
      />
    </div>
  );
}

function duracaoOuVazio(segundos: number | null | undefined): string {
  return segundos != null ? formatDuracao(segundos) : 'Sem dados ainda';
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
