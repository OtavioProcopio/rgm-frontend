import { Activity } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canAccessAdmin, canManageModelos } from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/cn';

import { HistoricoChart } from '../components/HistoricoChart';
import { useMetricas } from '../hooks/useMetricas';
import { useSolicitacaoEvents } from '../hooks/useSolicitacaoEvents';
import { ModelosTab } from './ModelosTab';
import { PessoalTab } from './PessoalTab';
import { SolicitacoesTab } from './SolicitacoesTab';

type TabId = 'solicitacoes' | 'modelos' | 'pessoal';

const TABS: { id: TabId; label: string }[] = [
  { id: 'solicitacoes', label: 'Solicitações' },
  { id: 'modelos', label: 'Modelos' },
  { id: 'pessoal', label: 'Pessoal' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const isOperador = user?.perfil === 'OPERADOR';
  const [activeTab, setActiveTab] = useState<TabId>(isOperador ? 'pessoal' : 'solicitacoes');
  useSolicitacaoEvents();
  const {
    data: metricas,
    isLoading: loadingMetricas,
    isError: errorMetricas,
  } = useMetricas({ enabled: !isOperador });

  const isAdmin = canAccessAdmin(user?.perfil);
  const isGestor = canManageModelos(user?.perfil) && !isAdmin;
  // OPERADOR nao ve indicadores agregados de outros responsaveis (dashboard/contadores globais) —
  // so a aba "Pessoal", ja escopada ao proprio usuario.
  const visibleTabs = isOperador ? TABS.filter((tab) => tab.id === 'pessoal') : TABS;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard"
          description={
            isOperador
              ? 'Suas solicitações'
              : metricas
                ? `${metricas.totalSolicitacoes} solicitações no total`
                : 'Painel de indicadores'
          }
        />
        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-sky-100 bg-sky-50/50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-300">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Monitoramento em Tempo Real</span>
        </div>
      </div>

      {visibleTabs.length > 1 ? (
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'solicitacoes' ? (
        loadingMetricas ? (
          <LoadingState title="Carregando painel de indicadores..." />
        ) : errorMetricas || !metricas ? (
          <ErrorState
            title="Não foi possível carregar o dashboard"
            description="Verifique sua conexão com o servidor."
          />
        ) : (
          <div className="space-y-6">
            <SolicitacoesTab metricas={metricas} isAdmin={isAdmin} isGestor={isGestor} />
            <HistoricoChart />
          </div>
        )
      ) : null}

      {activeTab === 'modelos' ? <ModelosTab /> : null}
      {activeTab === 'pessoal' ? <PessoalTab /> : null}
    </section>
  );
}
