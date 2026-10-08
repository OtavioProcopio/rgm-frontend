import { Activity } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { Badge } from '@/shared/components/Badge/Badge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canAccessAdmin, canManageModelos } from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/cn';

import { HistoricoChart } from '../components/HistoricoChart';
import { useMetricas } from '../hooks/useMetricas';
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
        <Badge
          variant="info"
          icon={<Activity className="h-3.5 w-3.5 animate-pulse" />}
          className="gap-1.5 self-start border border-info px-3 py-1 font-semibold"
        >
          <span>Monitoramento em Tempo Real</span>
        </Badge>
      </div>

      {visibleTabs.length > 1 ? (
        <div className="flex gap-1 border-b border-line">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors pointer-coarse:min-h-11',
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-fg-muted hover:text-fg',
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
