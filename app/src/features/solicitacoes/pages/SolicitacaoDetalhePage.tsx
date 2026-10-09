import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useVoltar } from '@/shared/hooks/useVoltar';
import { isoValido, tempoRelativo } from '@/shared/lib/data';
import { canManageSolicitacoes } from '@/shared/lib/permissions';

import { ComentarioForm } from '../components/ComentarioForm';
import { SolicitacaoResumo } from '../components/SolicitacaoResumo';
import { SolicitacaoTimeline } from '../components/SolicitacaoTimeline';
import { useAcoesDoCabecalho, type AcoesDoCabecalho } from '../hooks/useAcoesDoCabecalho';
import { useAtividades } from '../hooks/useAtividades';
import { useRegistrarComentario } from '../hooks/useRegistrarComentario';
import { useSolicitacao } from '../hooks/useSolicitacao';
import { useEditarSolicitacao } from '../hooks/useEditarSolicitacao';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import {
  editarSolicitacaoSchema,
  type EditarSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';
import type { AtividadeSolicitacao, Solicitacao } from '../types/solicitacaoTypes';
import { EvidenciaList } from '@/features/evidencias/components/EvidenciaList';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';
import { useDeleteEvidencia } from '@/features/evidencias/hooks/useDeleteEvidencia';
import { useEvidencias } from '@/features/evidencias/hooks/useEvidencias';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { Input } from '@/shared/components/Input/Input';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import { useResponsaveisDisponiveis } from '@/features/admin/usuarios/hooks/useResponsaveisDisponiveis';

type AoFalhar = (mensagem: string | null) => void;
type ErrosDaEdicao = { titulo?: string; descricao?: string };

export function SolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data: solicitacao, isLoading, error } = useSolicitacao(id!);

  if (isLoading) return <LoadingState title="Carregando solicitação..." />;
  if (error || !solicitacao) {
    return (
      <ErrorState
        title="Não foi possível carregar a solicitação."
        description={getSolicitacaoErrorMessage(error)}
      />
    );
  }
  return <DetalheDaSolicitacao solicitacao={solicitacao} />;
}

type EstadoDoDetalhe = ReturnType<typeof useEstadoDoDetalhe>;

function useEstadoDoDetalhe(solicitacao: Solicitacao) {
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: atividades = [], isLoading: carregandoAtividades } = useAtividades(solicitacao.id);
  const permissoes = usePermissoesDaSolicitacao(solicitacao);
  const edicao = useEdicaoDaSolicitacao(solicitacao, setActionError);
  const editar = permissoes.canEdit && !edicao.isEditing ? { aoAcionar: edicao.iniciar } : null;
  const acoes = useAcoesDoCabecalho(solicitacao, editar);
  return {
    actionError,
    setActionError,
    atividades,
    carregandoAtividades,
    permissoes,
    edicao,
    acoes,
  };
}

function EvidenciasEHistorico({ id, estado }: { id: string; estado: EstadoDoDetalhe }) {
  const { setActionError, atividades, carregandoAtividades, permissoes } = estado;
  return (
    <>
      <EvidenciasDaSolicitacao
        id={id}
        podeAnexar={permissoes.canAnexarEvidencia}
        aoFalhar={setActionError}
      />
      <HistoricoDaSolicitacao
        id={id}
        atividades={atividades}
        carregando={carregandoAtividades}
        encerrada={permissoes.isTerminal}
        aoFalhar={setActionError}
      />
    </>
  );
}

function DetalheDaSolicitacao({ solicitacao }: { solicitacao: Solicitacao }) {
  const estado = useEstadoDoDetalhe(solicitacao);
  const { actionError, atividades, edicao, acoes } = estado;

  return (
    <section className="space-y-6">
      <BotaoVoltar />
      <CabecalhoDaSolicitacao solicitacao={solicitacao} edicao={edicao} acoes={acoes} />
      {acoes.dialogo}
      <ErroDeAcao mensagem={actionError} />
      <InformacoesDaSolicitacao solicitacao={solicitacao} edicao={edicao} atividades={atividades} />
      <DescarteDaEdicao edicao={edicao} />
      <EvidenciasEHistorico id={solicitacao.id} estado={estado} />
    </section>
  );
}

// ── Permissões ───────────────────────────────────────────────

type ContextoDePermissao = {
  perfil: PerfilUsuario | undefined;
  terminal: boolean;
  abriu: boolean;
  responsavel: boolean;
};

function podeEditar({ perfil, terminal, abriu }: ContextoDePermissao): boolean {
  if (terminal) return false;
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR' || (perfil === 'OPERADOR' && abriu);
}

// OPERADOR pode anexar evidências se é o responsável pela solicitação ou quem a abriu
function podeAnexar({ perfil, terminal, abriu, responsavel }: ContextoDePermissao): boolean {
  if (terminal) return false;
  return canManageSolicitacoes(perfil) || (perfil === 'OPERADOR' && (responsavel || abriu));
}

function usePermissoesDaSolicitacao(solicitacao: Solicitacao) {
  const { user } = useAuth();
  const { data: profile } = usePerfil();
  const contexto: ContextoDePermissao = {
    perfil: user?.perfil,
    terminal: solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA',
    abriu: solicitacao.abertaPorUsuarioId === profile?.id,
    responsavel: !!(profile?.id && solicitacao.responsavelIds?.includes(profile.id)),
  };
  return {
    isTerminal: contexto.terminal,
    canEdit: podeEditar(contexto),
    canAnexarEvidencia: podeAnexar(contexto),
  };
}

// ── Erros de ação ────────────────────────────────────────────

async function executarComErro(aoFalhar: AoFalhar, acao: () => Promise<unknown>): Promise<void> {
  aoFalhar(null);
  try {
    await acao();
  } catch (err) {
    aoFalhar(getSolicitacaoErrorMessage(err));
  }
}

function ErroDeAcao({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return <ErrorState title="Operação não concluída" description={mensagem} />;
}

// ── Edição (tipo é imutável após a abertura — não é editável) ─

function useCamposDaEdicao(solicitacao: Solicitacao) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const alterada = titulo !== solicitacao.titulo || descricao !== solicitacao.descricao;
  function carregar() {
    setTitulo(solicitacao.titulo);
    setDescricao(solicitacao.descricao);
  }
  return { titulo, setTitulo, descricao, setDescricao, alterada, carregar };
}

function useEstadoDaEdicao() {
  const [isEditing, setIsEditing] = useState(false);
  const [erros, setErros] = useState<ErrosDaEdicao>({});
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  return { isEditing, setIsEditing, erros, setErros, confirmandoDescarte, setConfirmandoDescarte };
}

function useFluxoDaEdicao(campos: ReturnType<typeof useCamposDaEdicao>) {
  const estado = useEstadoDaEdicao();
  const { setIsEditing, setErros, setConfirmandoDescarte } = estado;
  function iniciar() {
    campos.carregar();
    setIsEditing(true);
  }
  function fechar() {
    setConfirmandoDescarte(false);
    setErros({});
    setIsEditing(false);
  }
  const cancelar = () => (campos.alterada ? setConfirmandoDescarte(true) : fechar());
  const continuarEditando = () => setConfirmandoDescarte(false);
  return { ...estado, iniciar, fechar, cancelar, continuarEditando };
}

type FluxoDaEdicao = ReturnType<typeof useFluxoDaEdicao>;

function usePersistirEdicao(id: string, fluxo: FluxoDaEdicao, aoFalhar: AoFalhar) {
  const editar = useEditarSolicitacao(id);
  async function persistir(dados: EditarSolicitacaoFormData): Promise<void> {
    fluxo.setErros({});
    await executarComErro(aoFalhar, async () => {
      await editar.mutateAsync(dados);
      fluxo.setIsEditing(false);
    });
  }
  return { persistir, isPending: editar.isPending };
}

function errosDaValidacao(erros: Record<string, string[] | undefined>): ErrosDaEdicao {
  return { titulo: erros.titulo?.[0], descricao: erros.descricao?.[0] };
}

function useSalvarEdicao(
  id: string,
  campos: ReturnType<typeof useCamposDaEdicao>,
  fluxo: FluxoDaEdicao,
  aoFalhar: AoFalhar,
) {
  const { persistir, isPending } = usePersistirEdicao(id, fluxo, aoFalhar);
  async function salvar(): Promise<void> {
    const { titulo, descricao } = campos;
    const validacao = editarSolicitacaoSchema.safeParse({ titulo, descricao });
    if (validacao.success) return persistir(validacao.data);
    fluxo.setErros(errosDaValidacao(validacao.error.flatten().fieldErrors));
  }
  return { salvar, isPending };
}

function useEdicaoDaSolicitacao(solicitacao: Solicitacao, aoFalhar: AoFalhar) {
  const campos = useCamposDaEdicao(solicitacao);
  const fluxo = useFluxoDaEdicao(campos);
  const { salvar, isPending } = useSalvarEdicao(solicitacao.id, campos, fluxo, aoFalhar);
  return { campos, ...fluxo, salvar, isPending };
}

type EdicaoDaSolicitacao = ReturnType<typeof useEdicaoDaSolicitacao>;

// ── Cabeçalho ────────────────────────────────────────────────

function BotaoVoltar() {
  const voltar = useVoltar('/app/solicitacoes');
  return (
    <button
      type="button"
      onClick={voltar}
      className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline pointer-coarse:min-h-11"
    >
      <ArrowLeft aria-hidden="true" size={16} />
      Voltar
    </button>
  );
}

type PropsDoCabecalho = {
  solicitacao: Solicitacao;
  edicao: EdicaoDaSolicitacao;
  acoes: AcoesDoCabecalho;
};

function descricaoDaAbertura(criadaEm: string, agora: number): string | undefined {
  return isoValido(criadaEm) ? `Aberta ${tempoRelativo(criadaEm, agora)}` : undefined;
}

function CabecalhoDaSolicitacao({ solicitacao, edicao, acoes }: PropsDoCabecalho) {
  const [agora] = useState(() => Date.now());
  const editando = edicao.isEditing;
  return (
    <PageHeader
      title={editando ? 'Editar solicitação' : solicitacao.titulo}
      description={
        editando
          ? 'Atualize o título e a descrição da solicitação.'
          : descricaoDaAbertura(solicitacao.criadaEm, agora)
      }
      maisAcoes={editando ? undefined : acoes.maisAcoes}
      actions={<AcoesDoCabecalhoDaSolicitacao edicao={edicao} principal={acoes.principal} />}
    />
  );
}

type PropsDasAcoes = { edicao: EdicaoDaSolicitacao; principal: AcoesDoCabecalho['principal'] };

function AcoesDoCabecalhoDaSolicitacao({ edicao, principal }: PropsDasAcoes) {
  return (
    <div className="flex flex-wrap gap-2">
      {edicao.isEditing ? (
        <AcoesDaEdicao edicao={edicao} />
      ) : principal ? (
        <Button variant={principal.variante} onClick={principal.aoAcionar}>
          {principal.rotulo}
        </Button>
      ) : null}
    </div>
  );
}

function AcoesDaEdicao({ edicao }: { edicao: EdicaoDaSolicitacao }) {
  return (
    <>
      <Button type="button" onClick={edicao.salvar} disabled={edicao.isPending}>
        {edicao.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={edicao.cancelar}
        disabled={edicao.isPending}
      >
        Cancelar
      </Button>
    </>
  );
}

// ── Informações (edição ou resumo) ───────────────────────────

type PropsDasInformacoes = {
  solicitacao: Solicitacao;
  edicao: EdicaoDaSolicitacao;
  atividades: AtividadeSolicitacao[];
};

function InformacoesDaSolicitacao({ solicitacao, edicao, atividades }: PropsDasInformacoes) {
  const { data: modelo } = useModelo(solicitacao.modeloId);
  const { responsaveis } = useResponsaveisDisponiveis();
  if (edicao.isEditing)
    return <EdicaoDaSolicitacaoForm solicitacao={solicitacao} edicao={edicao} />;
  return (
    <SolicitacaoResumo
      solicitacao={solicitacao}
      modelo={modelo}
      atividades={atividades}
      usuarios={responsaveis}
    />
  );
}

type PropsDaEdicao = { solicitacao: Solicitacao; edicao: EdicaoDaSolicitacao };

function EdicaoDaSolicitacaoForm({ solicitacao, edicao }: PropsDaEdicao) {
  return (
    <div className="space-y-4 rounded-md border border-line bg-surface-muted p-4">
      <CampoDeTitulo edicao={edicao} />
      <TipoImutavel tipo={solicitacao.tipo} />
      <CampoDeDescricao edicao={edicao} />
    </div>
  );
}

function CampoDeTitulo({ edicao }: { edicao: EdicaoDaSolicitacao }) {
  return (
    <Input
      label="Título"
      value={edicao.campos.titulo}
      onChange={(e) => edicao.campos.setTitulo(e.target.value)}
      error={edicao.erros.titulo}
      maxLength={LIMITES.solicitacaoTitulo}
      disabled={edicao.isPending}
      required
    />
  );
}

function TipoImutavel({ tipo }: { tipo: Solicitacao['tipo'] }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-fg">Tipo</label>
      <p className="text-sm text-fg-muted">
        {rotuloDoTipoDeSolicitacao[tipo]}{' '}
        <span className="text-xs">(não pode ser alterado após a abertura)</span>
      </p>
    </div>
  );
}

function CampoDeDescricao({ edicao }: { edicao: EdicaoDaSolicitacao }) {
  return (
    <Textarea
      label="Descrição"
      value={edicao.campos.descricao}
      onChange={(e) => edicao.campos.setDescricao(e.target.value)}
      error={edicao.erros.descricao}
      maxLength={LIMITES.textoLongo}
      disabled={edicao.isPending}
      required
      rows={4}
    />
  );
}

function DescarteDaEdicao({ edicao }: { edicao: EdicaoDaSolicitacao }) {
  if (!edicao.confirmandoDescarte) return null;
  return (
    <ConfirmDialog
      title="Descartar alterações?"
      message="O título e a descrição voltam a ser o que estava salvo."
      cancelLabel="Continuar editando"
      confirmLabel="Descartar"
      variant="warning"
      onCancel={edicao.continuarEditando}
      onConfirm={edicao.fechar}
    />
  );
}

// ── Evidências ───────────────────────────────────────────────

function useAcoesDeEvidencia(id: string, aoFalhar: AoFalhar) {
  const { data: evidencias = [], isLoading } = useEvidencias(id);
  const upload = useUploadEvidencia(id);
  const remocao = useDeleteEvidencia(id);
  const enviar = (file: File) => executarComErro(aoFalhar, () => upload.mutateAsync({ file }));
  const excluir = (evidenciaId: string) =>
    executarComErro(aoFalhar, () => remocao.mutateAsync(evidenciaId));
  return {
    evidencias,
    isLoading,
    enviar,
    excluir,
    enviando: upload.isPending,
    excluindo: remocao.isPending,
  };
}

type PropsDasEvidencias = { id: string; podeAnexar: boolean; aoFalhar: AoFalhar };

function EvidenciasDaSolicitacao({ id, podeAnexar, aoFalhar }: PropsDasEvidencias) {
  const acoes = useAcoesDeEvidencia(id, aoFalhar);
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-fg-muted">Evidências</h2>
      {podeAnexar ? (
        <div className="mb-4">
          <EvidenciaUploader isPending={acoes.enviando} onUpload={acoes.enviar} />
        </div>
      ) : null}
      <EvidenciaList
        evidencias={acoes.evidencias}
        isLoading={acoes.isLoading}
        onDelete={podeAnexar ? acoes.excluir : undefined}
        isDeleting={acoes.excluindo}
      />
    </div>
  );
}

// ── Histórico, com o comentário no topo ──────────────────────

type PropsDoHistorico = {
  id: string;
  atividades: AtividadeSolicitacao[];
  carregando: boolean;
  encerrada: boolean;
  aoFalhar: AoFalhar;
};

function HistoricoDaSolicitacao(props: PropsDoHistorico) {
  const { id, atividades, carregando, encerrada, aoFalhar } = props;
  const comentar = useRegistrarComentario(id);
  const enviar = (data: { comentario: string }) =>
    executarComErro(aoFalhar, () => comentar.mutateAsync(data));
  const formulario = encerrada ? undefined : (
    <ComentarioForm isPending={comentar.isPending} onSubmit={enviar} />
  );
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-fg-muted">Histórico de atividades</h2>
      <SolicitacaoTimeline atividades={atividades} isLoading={carregando} formulario={formulario} />
    </div>
  );
}
