import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { canManageSolicitacoes } from '@/shared/lib/permissions';

import { responsaveisDisponiveisApi } from '../api/responsaveisDisponiveisApi';

const TAMANHO_DA_PAGINA = 20;
const MINIMO_DE_CARACTERES = 2;
const ATRASO_DA_BUSCA_MS = 300;

/**
 * Candidatos a responsável, buscados no servidor por parte do nome. O termo de 1 caractere
 * vale como busca vazia (a API exige 2 ou mais): lista a primeira página por nome.
 */
export function useBuscaDeResponsaveis() {
  const { user } = useAuth();
  const [termo, setTermo] = useState('');
  const atrasado = useDebounce(termo.trim(), ATRASO_DA_BUSCA_MS);
  const busca = atrasado.length >= MINIMO_DE_CARACTERES ? atrasado : undefined;

  const consulta = useQuery({
    queryKey: ['responsaveis-disponiveis', busca ?? ''],
    queryFn: () => responsaveisDisponiveisApi.listar({ busca, page: 0, size: TAMANHO_DA_PAGINA }),
    enabled: canManageSolicitacoes(user?.perfil),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    buscar: setTermo,
    candidatos: consulta.data?.content ?? [],
    carregando: consulta.isLoading || consulta.isFetching,
    falhou: consulta.isError,
  };
}
