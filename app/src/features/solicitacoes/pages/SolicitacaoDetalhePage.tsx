import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canManageSolicitacoes } from '@/shared/lib/permissions';

import { ComentarioForm } from '../components/ComentarioForm';
import { SolicitacaoAcoes } from '../components/SolicitacaoAcoes';
import { SolicitacaoResumo } from '../components/SolicitacaoResumo';
import { SolicitacaoTimeline } from '../components/SolicitacaoTimeline';
import { useAtividades } from '../hooks/useAtividades';
import { useRegistrarComentario } from '../hooks/useRegistrarComentario';
import { useSolicitacao } from '../hooks/useSolicitacao';
import { useEditarSolicitacao } from '../hooks/useEditarSolicitacao';
import { getSolicitacaoErrorMessage, tipoLabel } from '../lib/solicitacaoMessages';
import { editarSolicitacaoSchema } from '../schemas/solicitacaoSchema';
import { EvidenciaList } from '@/features/evidencias/components/EvidenciaList';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';
import { useDeleteEvidencia } from '@/features/evidencias/hooks/useDeleteEvidencia';
import { useEvidencias } from '@/features/evidencias/hooks/useEvidencias';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { Input } from '@/shared/components/Input/Input';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';

export function SolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = usePerfil();
  const [actionError, setActionError] = useState<string | null>(null);

  // States para Edição (tipo é imutável após a abertura — não é editável)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [errosDaEdicao, setErrosDaEdicao] = useState<{ titulo?: string; descricao?: string }>({});
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  const { data: solicitacao, isLoading, error } = useSolicitacao(id!);
  const { data: atividades = [], isLoading: isLoadingAtividades } = useAtividades(id!);
  const { data: evidencias = [], isLoading: isLoadingEvidencias } = useEvidencias(id!);
  const { data: modelo } = useModelo(solicitacao?.modeloId);

  const comentar = useRegistrarComentario(id!);
  const uploadEvidencia = useUploadEvidencia(id!);
  const editar = useEditarSolicitacao(id!);
  const deleteEvidencia = useDeleteEvidencia(id!);

  const canManage = canManageSolicitacoes(user?.perfil);
  const isResponsavel = !!(profile?.id && solicitacao?.responsavelIds?.includes(profile.id));
  async function handleComentario(data: { comentario: string }) {
    setActionError(null);
    try {
      await comentar.mutateAsync(data);
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

  const isTerminal = solicitacao
    ? solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA'
    : false;

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
      (user?.perfil === 'OPERADOR' &&
        (isResponsavel || solicitacao?.abertaPorUsuarioId === profile?.id)));

  async function handleSaveEdit() {
    const validacao = editarSolicitacaoSchema.safeParse({
      titulo: editTitulo,
      descricao: editDescricao,
    });
    if (!validacao.success) {
      const erros = validacao.error.flatten().fieldErrors;
      setErrosDaEdicao({ titulo: erros.titulo?.[0], descricao: erros.descricao?.[0] });
      return;
    }
    setErrosDaEdicao({});
    setActionError(null);
    try {
      await editar.mutateAsync(validacao.data);
      setIsEditing(false);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  function fecharEdicao() {
    setConfirmandoDescarte(false);
    setErrosDaEdicao({});
    setIsEditing(false);
  }

  function handleCancelEdit() {
    const alterada = editTitulo !== solicitacao?.titulo || editDescricao !== solicitacao?.descricao;
    if (alterada) setConfirmandoDescarte(true);
    else fecharEdicao();
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
        description={
          isEditing ? 'Atualize o título e a descrição da solicitação.' : `Aberta em ${criadaEm}`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button type="button" onClick={handleSaveEdit} disabled={editar.isPending}>
                  {editar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={editar.isPending}
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
                      setIsEditing(true);
                    }}
                  >
                    Editar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/app/solicitacoes')}
                >
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
            error={errosDaEdicao.titulo}
            maxLength={LIMITES.solicitacaoTitulo}
            disabled={editar.isPending}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tipoLabel[solicitacao.tipo]}{' '}
              <span className="text-xs">(não pode ser alterado após a abertura)</span>
            </p>
          </div>
          <Textarea
            label="Descrição"
            value={editDescricao}
            onChange={(e) => setEditDescricao(e.target.value)}
            error={errosDaEdicao.descricao}
            maxLength={LIMITES.textoLongo}
            disabled={editar.isPending}
            required
            rows={4}
          />
        </div>
      ) : (
        <SolicitacaoResumo solicitacao={solicitacao} modelo={modelo} />
      )}

      {confirmandoDescarte ? (
        <ConfirmDialog
          title="Descartar alterações?"
          message="O título e a descrição voltam a ser o que estava salvo."
          cancelLabel="Continuar editando"
          confirmLabel="Descartar"
          variant="warning"
          onCancel={() => setConfirmandoDescarte(false)}
          onConfirm={fecharEdicao}
        />
      ) : null}

      <SolicitacaoAcoes solicitacao={solicitacao} />

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
