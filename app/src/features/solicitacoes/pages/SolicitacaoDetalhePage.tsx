import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canManageSolicitacoes } from '@/shared/lib/permissions';

import { AlterarResponsaveisModal } from '../components/AlterarResponsaveisModal';
import { ComentarioForm } from '../components/ComentarioForm';
import { DevolucaoModal } from '../components/DevolucaoModal';
import { EncerramentoModal } from '../components/EncerramentoModal';
import { EnviarValidacaoModal } from '../components/EnviarValidacaoModal';
import { SolicitacaoPrioridadeBadge } from '../components/SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from '../components/SolicitacaoStatusBadge';
import { SolicitacaoTimeline } from '../components/SolicitacaoTimeline';
import { TriagemModal } from '../components/TriagemModal';
import { useAlterarResponsaveis } from '../hooks/useAlterarResponsaveis';
import { useAtividades } from '../hooks/useAtividades';
import { useCancelarSolicitacao } from '../hooks/useCancelarSolicitacao';
import { useDevolverSolicitacao } from '../hooks/useDevolverSolicitacao';
import { useEncerrarSolicitacao } from '../hooks/useEncerrarSolicitacao';
import { useEnviarParaValidacao } from '../hooks/useEnviarParaValidacao';
import { useRegistrarComentario } from '../hooks/useRegistrarComentario';
import { useSolicitacao } from '../hooks/useSolicitacao';
import { useTriarSolicitacao } from '../hooks/useTriarSolicitacao';
import { useEditarSolicitacao } from '../hooks/useEditarSolicitacao';
import { getSolicitacaoErrorMessage, tipoLabel } from '../lib/solicitacaoMessages';
import type {
  DevolverSolicitacaoRequest,
  EncerrarSolicitacaoRequest,
  TriarSolicitacaoRequest,
} from '../types/solicitacaoTypes';
import { EvidenciaList } from '@/features/evidencias/components/EvidenciaList';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';
import { useDeleteEvidencia } from '@/features/evidencias/hooks/useDeleteEvidencia';
import { useEvidencias } from '@/features/evidencias/hooks/useEvidencias';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/shared/components/Input/Input';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';

type ActiveModal = 'triagem' | 'encerramento' | 'devolucao' | 'responsaveis' | 'enviarValidacao' | null;

export function SolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = usePerfil();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // States para Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editTipo, setEditTipo] = useState<import('../types/solicitacaoTypes').TipoSolicitacao>('REPARO');

  const { data: solicitacao, isLoading, error } = useSolicitacao(id!);
  const { data: atividades = [], isLoading: isLoadingAtividades } = useAtividades(id!);
  const { data: evidencias = [], isLoading: isLoadingEvidencias } = useEvidencias(id!);
  const { data: modelo } = useModelo(solicitacao?.modeloId);

  const triar = useTriarSolicitacao(id!);
  const enviarValidacao = useEnviarParaValidacao(id!);
  const encerrar = useEncerrarSolicitacao(id!);
  const cancelar = useCancelarSolicitacao(id!);
  const devolver = useDevolverSolicitacao(id!);
  const comentar = useRegistrarComentario(id!);
  const uploadEvidencia = useUploadEvidencia(id!);
  const editar = useEditarSolicitacao(id!);
  const alterarResponsaveis = useAlterarResponsaveis(id!);
  const deleteEvidencia = useDeleteEvidencia(id!);

  const canManage = canManageSolicitacoes(user?.perfil);
  const isResponsavel = !!(profile?.id && solicitacao?.responsavelIds?.includes(profile.id));
  const canEnviarValidacao = canManage || (user?.perfil === 'OPERADOR' && isResponsavel);
  const canOperadorCancelar =
    user?.perfil === 'OPERADOR' &&
    solicitacao?.status === 'A_FAZER' &&
    solicitacao?.abertaPorUsuarioId === profile?.id &&
    (solicitacao?.responsavelIds?.length ?? 0) === 0;

  const { data: usuariosPage } = useQuery({
    queryKey: ['admin', 'usuarios', 'triagem'],
    queryFn: () => usuariosApi.listar({ page: 0, size: 100, ativo: true }),
    enabled: canManageSolicitacoes(user?.perfil),
    staleTime: 5 * 60 * 1000,
  });
  const responsaveisOpcoes = (usuariosPage?.content ?? []).filter(
    (u) => u.perfil === 'OPERADOR' || u.perfil === 'GESTOR',
  );

  async function handleTriar(data: TriarSolicitacaoRequest, foto: File | null, nota: string) {
    setActionError(null);
    try {
      await triar.mutateAsync(data);
      if (foto) {
        try {
          await uploadEvidencia.mutateAsync({
            file: foto,
            tipo: 'INSTRUCAO_SERVICO',
            descricao: nota || undefined,
          });
        } catch (uploadErr) {
          console.error('Erro ao anexar evidência de triagem:', uploadErr);
        }
      }
      setActiveModal(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleEnviarValidacao(data: { comentario: string }) {
    setActionError(null);
    try {
      await enviarValidacao.mutateAsync(data.comentario);
      setActiveModal(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleEncerrar(data: EncerrarSolicitacaoRequest, foto: File | null) {
    setActionError(null);
    try {
      if (data.concluir) {
        await encerrar.mutateAsync(data);
        if (foto) {
          try {
            await uploadEvidencia.mutateAsync({
              file: foto,
              tipo: 'CONCLUSAO',
              descricao: data.comentario,
            });
          } catch (uploadErr) {
            console.error('Erro ao anexar evidência de conclusão:', uploadErr);
          }
        }
      } else {
        await cancelar.mutateAsync({ motivo: data.comentario });
      }
      setActiveModal(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleDevolver(data: DevolverSolicitacaoRequest, foto: File | null) {
    setActionError(null);
    try {
      await devolver.mutateAsync(data);
      if (foto) {
        try {
          await uploadEvidencia.mutateAsync({
            file: foto,
            tipo: 'DEVOLUCAO',
            descricao: data.motivo,
          });
        } catch (uploadErr) {
          console.error('Erro ao anexar evidência de devolução:', uploadErr);
        }
      }
      setActiveModal(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleComentario(data: { comentario: string }) {
    setActionError(null);
    try {
      await comentar.mutateAsync(data);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleAlterarResponsaveis(responsavelIds: string[]) {
    setActionError(null);
    try {
      await alterarResponsaveis.mutateAsync({ responsavelIds });
      setActiveModal(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleDeleteEvidencia(evidenciaId: string) {
    setActionError(null);
    try {
      await deleteEvidencia.mutateAsync(evidenciaId);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleUpload(file: File) {
    setActionError(null);
    try {
      await uploadEvidencia.mutateAsync({ file });
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  const isTerminal = solicitacao ? (solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA') : false;

  const canEdit =
    solicitacao &&
    !isTerminal &&
    (user?.perfil === 'ADMINISTRADOR' ||
      user?.perfil === 'GESTOR' ||
      (user?.perfil === 'OPERADOR' && solicitacao.abertaPorUsuarioId === profile?.id));

  // OPERADOR pode anexar evidências se é o responsável pela solicitação ou quem a abriu
  const canAnexarEvidencia =
    !isTerminal &&
    (canManage ||
      (user?.perfil === 'OPERADOR' && (isResponsavel || solicitacao?.abertaPorUsuarioId === profile?.id)));

  async function handleSaveEdit() {
    if (!editTitulo.trim() || !editDescricao.trim()) {
      setActionError('Título e descrição são obrigatórios.');
      return;
    }
    setActionError(null);
    try {
      await editar.mutateAsync({
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim(),
        tipo: editTipo,
      });
      setIsEditing(false);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  if (isLoading) return <LoadingState title="Carregando solicitação..." />;
  if (error || !solicitacao) {
    return (
      <ErrorState
        title="Não foi possível carregar a solicitação."
        description={getSolicitacaoErrorMessage(error)}
      />
    );
  }

  const criadaEm = new Date(solicitacao.criadaEm).toLocaleString('pt-BR');

  return (
    <section className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar solicitação' : solicitacao.titulo}
        description={isEditing ? 'Atualize o título e a descrição da solicitação.' : `Aberta em ${criadaEm}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editar.isPending}
                >
                  {editar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button
                    type="button"
                    onClick={() => {
                      setEditTitulo(solicitacao.titulo);
                      setEditDescricao(solicitacao.descricao);
                      setEditTipo(solicitacao.tipo);
                      setIsEditing(true);
                    }}
                  >
                    Editar
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={() => navigate('/app/solicitacoes')}>
                  Voltar
                </Button>
              </>
            )}
          </div>
        }
      />

      {actionError ? <ErrorState title="Operação não concluída" description={actionError} /> : null}

      {/* Info */}
      {isEditing ? (
        <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <Input
            label="Título"
            value={editTitulo}
            onChange={(e) => setEditTitulo(e.target.value)}
            disabled={editar.isPending}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Tipo
            </label>
            <select
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              value={editTipo}
              onChange={(e) => setEditTipo(e.target.value as import('../types/solicitacaoTypes').TipoSolicitacao)}
              disabled={editar.isPending}
            >
              <option value="REPARO">Reparo</option>
              <option value="INSPECAO">Inspeção</option>
              <option value="REENGENHARIA">Reengenharia</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Descrição
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              value={editDescricao}
              onChange={(e) => setEditDescricao(e.target.value)}
              disabled={editar.isPending}
              required
              rows={4}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Status
            </p>
            <div className="mt-1">
              <SolicitacaoStatusBadge status={solicitacao.status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Prioridade
            </p>
            <div className="mt-1">
              <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
              {!solicitacao.prioridade && (
                <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tipo
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
              {tipoLabel[solicitacao.tipo]}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Descrição
            </p>
            <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{solicitacao.descricao}</p>
          </div>
          {modelo ? (
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Modelo (rastreabilidade)
              </p>
              <Link
                to={`/app/modelos/${modelo.id}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                {modelo.codigo} — {modelo.descricao}
              </Link>
            </div>
          ) : null}
          {solicitacao.comentarioFinal ? (
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Comentário final
              </p>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                {solicitacao.comentarioFinal}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Ações */}
      {!isTerminal && (canManage || canEnviarValidacao || canOperadorCancelar) ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ações</h2>
          <div className="flex flex-wrap gap-2">
            {canManage && solicitacao.status === 'A_FAZER' ? (
              <Button type="button" onClick={() => setActiveModal('triagem')}>
                Triar
              </Button>
            ) : null}
            {canManage && solicitacao.status !== 'A_FAZER' ? (
              <Button type="button" variant="secondary" onClick={() => setActiveModal('responsaveis')}>
                Alterar responsáveis
              </Button>
            ) : null}
            {canEnviarValidacao && solicitacao.status === 'EM_ANDAMENTO' ? (
              <Button
                type="button"
                disabled={enviarValidacao.isPending}
                onClick={() => setActiveModal('enviarValidacao')}
              >
                Enviar para validação
              </Button>
            ) : null}
            {canManage && solicitacao.status === 'EM_VALIDACAO' ? (
              <Button type="button" onClick={() => setActiveModal('devolucao')}>
                Devolver
              </Button>
            ) : null}
            {canManage &&
            (solicitacao.status === 'A_FAZER' ||
              solicitacao.status === 'EM_ANDAMENTO' ||
              solicitacao.status === 'EM_VALIDACAO') ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveModal('encerramento')}
              >
                {solicitacao.status === 'EM_VALIDACAO' ? 'Encerrar' : 'Cancelar'}
              </Button>
            ) : null}
            {canOperadorCancelar ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveModal('encerramento')}
              >
                Cancelar
              </Button>
            ) : null}
          </div>

          {activeModal === 'triagem' ? (
            <TriagemModal
              isPending={triar.isPending}
              usuarios={responsaveisOpcoes}
              onCancel={() => setActiveModal(null)}
              onConfirm={handleTriar}
            />
          ) : null}
          {activeModal === 'encerramento' ? (
            <EncerramentoModal
              isPending={encerrar.isPending}
              podeConcluir={solicitacao.status === 'EM_VALIDACAO'}
              onCancel={() => setActiveModal(null)}
              onConfirm={handleEncerrar}
            />
          ) : null}
          {activeModal === 'devolucao' ? (
            <DevolucaoModal
              isPending={devolver.isPending}
              onCancel={() => setActiveModal(null)}
              onConfirm={handleDevolver}
            />
          ) : null}
          {activeModal === 'responsaveis' ? (
            <AlterarResponsaveisModal
              responsaveisAtuais={solicitacao.responsavelIds}
              usuarios={responsaveisOpcoes}
              isPending={alterarResponsaveis.isPending}
              onCancel={() => setActiveModal(null)}
              onConfirm={handleAlterarResponsaveis}
            />
          ) : null}
          {activeModal === 'enviarValidacao' ? (
            <EnviarValidacaoModal
              solicitacaoId={id!}
              isPending={enviarValidacao.isPending}
              onCancel={() => setActiveModal(null)}
              onConfirm={handleEnviarValidacao}
            />
          ) : null}
        </div>
      ) : null}

      {/* Evidências */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Evidências
        </h2>
        {canAnexarEvidencia ? (
          <div className="mb-4">
            <EvidenciaUploader isPending={uploadEvidencia.isPending} onUpload={handleUpload} />
          </div>
        ) : null}
        <EvidenciaList
          evidencias={evidencias}
          isLoading={isLoadingEvidencias}
          onDelete={canAnexarEvidencia ? handleDeleteEvidencia : undefined}
          isDeleting={deleteEvidencia.isPending}
        />
      </div>

      {/* Histórico */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Histórico de atividades
        </h2>
        <SolicitacaoTimeline atividades={atividades} isLoading={isLoadingAtividades} />
      </div>

      {/* Comentário */}
      {!isTerminal ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Adicionar comentário
          </h2>
          <ComentarioForm isPending={comentar.isPending} onSubmit={handleComentario} />
        </div>
      ) : null}
    </section>
  );
}
