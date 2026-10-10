import { useState, type JSX } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { cn } from '@/shared/lib/cn';

import { AtualizadoEm } from '../components/AtualizadoEm';
import { useFilaDeAtencao } from '../hooks/useFilaDeAtencao';
import { useMetricas } from '../hooks/useMetricas';
import { ModelosTab } from './ModelosTab';
import { PessoalTab } from './PessoalTab';
import { SolicitacoesTab } from './SolicitacoesTab';

type TabId = 'solicitacoes' | 'modelos' | 'pessoal';
type Tab = { id: TabId; label: string };

const TABS: Tab[] = [
  { id: 'solicitacoes', label: 'Solicitações' },
  { id: 'modelos', label: 'Modelos' },
  { id: 'pessoal', label: 'Pessoal' },
];

type NavegacaoProps = { tabs: Tab[]; ativa: TabId; onSelect: (id: TabId) => void };

function classeDaAba(ativa: boolean): string {
  return cn(
    '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors pointer-coarse:min-h-11',
    ativa ? 'border-accent text-accent' : 'border-transparent text-fg-muted hover:text-fg',
  );
}

function NavegacaoDasAbas({ tabs, ativa, onSelect }: NavegacaoProps): JSX.Element | null {
  if (tabs.length <= 1) return null;
  return (
    <div className="flex gap-1 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={classeDaAba(ativa === tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function AbaAtiva({ id }: { id: TabId }): JSX.Element {
  if (id === 'solicitacoes') return <SolicitacoesTab />;
  if (id === 'modelos') return <ModelosTab />;
  return <PessoalTab />;
}

function useAtualizadoEm(habilitado: boolean): number {
  const metricas = useMetricas({ enabled: habilitado });
  const fila = useFilaDeAtencao({ enabled: habilitado });
  return Math.max(metricas.dataUpdatedAt, fila.dataUpdatedAt);
}

export function DashboardPage(): JSX.Element {
  const { user } = useAuth();
  const isOperador: boolean = user?.perfil === 'OPERADOR';
  const [ativa, setAtiva] = useState<TabId>(isOperador ? 'pessoal' : 'solicitacoes');
  const atualizadoEm: number = useAtualizadoEm(!isOperador);
  // OPERADOR nao ve indicadores agregados de outros responsaveis: so a aba "Pessoal".
  const tabs: Tab[] = isOperador ? TABS.filter((tab) => tab.id === 'pessoal') : TABS;
  const descricao: string | undefined = isOperador ? 'Suas solicitações' : undefined;
  const acoes: JSX.Element | undefined = isOperador ? undefined : (
    <AtualizadoEm instante={atualizadoEm} />
  );

  return (
    <section className="space-y-6">
      <PageHeader title="Dashboard" description={descricao} actions={acoes} />
      <NavegacaoDasAbas tabs={tabs} ativa={ativa} onSelect={setAtiva} />
      <AbaAtiva id={ativa} />
    </section>
  );
}
