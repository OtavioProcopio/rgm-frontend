/**
 * Áreas da migração para as cores por papel (feature 010). Cada área lista os arquivos de
 * produção que a sua tarefa migra: caminho terminado em `/` vale para a pasta inteira.
 *
 * Uma área só é conferida pelas guardas quando o arquivo de pendência dela
 * (`tests/unit/coresPorPapel.pendentes/<área>.txt`) deixa de existir. Arquivo que não
 * pertence a nenhuma área é conferido sempre.
 */
const COMPONENTES = '/src/features/solicitacoes/components/';
const PAGINAS = '/src/features/solicitacoes/pages/';

export const AREAS: Record<string, string[]> = {
  'pecas-base': ['/src/shared/components/'],
  'layouts-e-entrada': [
    '/src/app/layouts/AppLayout.tsx',
    '/src/app/layouts/PublicLayout.tsx',
    '/src/features/auth/pages/LoginPage.tsx',
  ],
  'area-a': [
    'KanbanBoard.tsx',
    'KanbanColumn.tsx',
    'KanbanCard.tsx',
    'kanbanColunas.ts',
    'SolicitacaoCard.tsx',
    'SolicitacaoStatusBadge.tsx',
    'SolicitacaoPrioridadeBadge.tsx',
  ].map((arquivo) => COMPONENTES + arquivo),
  'area-b': [
    ...[
      'SolicitacaoResumo.tsx',
      'SolicitacaoTimeline.tsx',
      'SolicitacaoAcoes.tsx',
      'AvisoSemAtualizacao.tsx',
      'HistoricoChart.tsx',
      'SeletorDeModelo.tsx',
      'SolicitacaoFilters.tsx',
      'TriagemModal.tsx',
      'DevolucaoModal.tsx',
      'EncerramentoModal.tsx',
      'EnviarValidacaoModal.tsx',
      'AlterarResponsaveisModal.tsx',
    ].map((arquivo) => COMPONENTES + arquivo),
    '/src/features/solicitacoes/actions/',
    '/src/features/solicitacoes/lib/solicitacaoMessages.ts',
  ],
  'area-c': [
    'SolicitacoesPage.tsx',
    'SolicitacaoDetalhePage.tsx',
    'NovaSolicitacaoPage.tsx',
    'DashboardPage.tsx',
    'PessoalTab.tsx',
  ].map((arquivo) => PAGINAS + arquivo),
  'area-d': ['SolicitacoesTab.tsx', 'ModelosTab.tsx', 'DashboardKpiCard.tsx'].map(
    (arquivo) => PAGINAS + arquivo,
  ),
  'area-e': [
    '/src/features/admin/modelos/components/',
    '/src/features/admin/modelos/pages/',
    '/src/features/admin/modelos/types/modeloTypes.ts',
  ],
  'area-f': ['/src/features/admin/usuarios/components/', '/src/features/admin/usuarios/pages/'],
  'area-g': [
    '/src/features/admin/maquinas/',
    '/src/features/admin/components/',
    '/src/features/admin/pages/',
    '/src/features/modelos/',
  ],
  'area-h': [
    '/src/features/auth/pages/PerfilPage.tsx',
    '/src/features/evidencias/',
    '/src/app/routes/',
  ],
};

const pertence = (arquivo: string, caminho: string) =>
  caminho.endsWith('/') ? arquivo.startsWith(caminho) : arquivo === caminho;

/** Área que migra o arquivo, ou `null` quando ele não é de nenhuma. */
export function areaDe(arquivo: string): string | null {
  const achada = Object.entries(AREAS).find(([, caminhos]) =>
    caminhos.some((caminho) => pertence(arquivo, caminho)),
  );
  return achada ? achada[0] : null;
}

/** Arquivos que as guardas conferem: os de área sem pendência e os de nenhuma área. */
export function arquivosConferidos(
  fontes: Record<string, string>,
  pendentes: string[],
): [string, string][] {
  return Object.entries(fontes).filter(([arquivo]) => {
    const area = areaDe(arquivo);
    return area === null || !pendentes.includes(area);
  });
}

const ARQUIVOS_DE_PENDENCIA = import.meta.glob('../unit/coresPorPapel.pendentes/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Áreas ainda não migradas: uma por arquivo de pendência. */
export const PENDENTES: string[] = Object.keys(ARQUIVOS_DE_PENDENCIA).map((caminho) =>
  caminho.replace(/^.*\/([^/]+)\.txt$/, '$1'),
);
