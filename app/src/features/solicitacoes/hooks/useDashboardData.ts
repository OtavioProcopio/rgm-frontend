import { useMemo, useState } from 'react';

import { useKanbanSolicitacoes } from './useKanbanSolicitacoes';

export type DashboardMetrics = {
  total: number;
  byStatus: Record<string, number>;
  byTipo: Record<string, number>;
  byPrioridade: Record<string, number>;
  avgLeadTimeDays: number | null;
  concludedCount: number;
  agingCount: number;
  agingTasks: Array<{ id: string; titulo: string; status: string; diasAberta: number }>;
};

const AGING_THRESHOLD_DAYS = 7;

export function useDashboardData() {
  const { data: solicitacoes = [], isLoading, error } = useKanbanSolicitacoes();
  const [now] = useState(() => Date.now());

  const metrics = useMemo((): DashboardMetrics => {
    const byStatus: Record<string, number> = {};
    const byTipo: Record<string, number> = {};
    const byPrioridade: Record<string, number> = {};
    const leadTimes: number[] = [];

    for (const s of solicitacoes) {
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
      byTipo[s.tipo] = (byTipo[s.tipo] ?? 0) + 1;
      if (s.prioridade) {
        byPrioridade[s.prioridade] = (byPrioridade[s.prioridade] ?? 0) + 1;
      }
      if (s.status === 'CONCLUIDA' && s.concluidaEm) {
        const days =
          (new Date(s.concluidaEm).getTime() - new Date(s.criadaEm).getTime()) / 86_400_000;
        if (days >= 0) leadTimes.push(days);
      }
    }

    const avgLeadTimeDays =
      leadTimes.length > 0
        ? Math.round((leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) * 10) / 10
        : null;

    const agingTasks = solicitacoes
      .filter((s) => {
        if (s.status === 'CONCLUIDA' || s.status === 'CANCELADA') return false;
        const dias = (now - new Date(s.criadaEm).getTime()) / 86_400_000;
        return dias > AGING_THRESHOLD_DAYS;
      })
      .map((s) => ({
        id: s.id,
        titulo: s.titulo,
        status: s.status,
        diasAberta: Math.floor((now - new Date(s.criadaEm).getTime()) / 86_400_000),
      }))
      .sort((a, b) => b.diasAberta - a.diasAberta)
      .slice(0, 10);

    return {
      total: solicitacoes.length,
      byStatus,
      byTipo,
      byPrioridade,
      avgLeadTimeDays,
      concludedCount: byStatus['CONCLUIDA'] ?? 0,
      agingCount: agingTasks.length,
      agingTasks,
    };
  }, [solicitacoes, now]);

  return { metrics, isLoading, error };
}
