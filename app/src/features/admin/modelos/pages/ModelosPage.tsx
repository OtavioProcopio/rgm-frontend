import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Pagination } from '@/shared/components/Pagination/Pagination';

import { modelosApi } from '../api/modelosApi';
import { ModelosFilters } from '../components/ModelosFilters';
import { ModelosTable } from '../components/ModelosTable';
import { useModelos } from '../hooks/useModelos';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { ModelosFilters as ModelosFiltersType } from '../types/modeloTypes';

const PAGE_SIZE = 20;

export function ModelosPage() {
  const [filters, setFilters] = useState<ModelosFiltersType>({ page: 0, size: PAGE_SIZE });
  const { data, error, isLoading } = useModelos(filters);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportar() {
    setIsExporting(true);
    try {
      const blob = await modelosApi.exportarLista({
        ativo: filters.ativo,
        codigo: filters.codigo,
        maquina: filters.maquina,
        descricao: filters.descricao,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_modelos_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Modelos"
        description="Gerencie modelos vinculados às máquinas."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" disabled={isExporting} onClick={handleExportar}>
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
            <Link to="/app/admin/modelos/novo">
              <Button>Novo modelo</Button>
            </Link>
          </div>
        }
      />
      <ModelosFilters
        codigo={filters.codigo}
        maquina={filters.maquina}
        descricao={filters.descricao}
        ativo={filters.ativo}
        onCodigoChange={(codigo) => setFilters((current) => ({ ...current, codigo, page: 0 }))}
        onMaquinaChange={(maquina) => setFilters((current) => ({ ...current, maquina, page: 0 }))}
        onDescricaoChange={(descricao) => setFilters((current) => ({ ...current, descricao, page: 0 }))}
        onAtivoChange={(ativo) => setFilters((current) => ({ ...current, ativo, page: 0 }))}
      />
      {isLoading ? <LoadingState title="Carregando modelos..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar modelos."
          description={getModeloErrorMessage(error)}
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState title="Nenhum modelo encontrado" description="Cadastre o primeiro modelo." />
      ) : null}
      {data && data.content.length > 0 ? (
        <>
          <ModelosTable modelos={data.content} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            itemLabel="modelo(s)"
            onPrev={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}
            onNext={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}
          />
        </>
      ) : null}
    </section>
  );
}
