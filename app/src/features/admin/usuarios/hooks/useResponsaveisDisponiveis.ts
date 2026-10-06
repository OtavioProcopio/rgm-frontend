import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/authContext';
import { canManageSolicitacoes } from '@/shared/lib/permissions';

import { usuariosApi } from '../api/usuariosApi';
import { filtrarResponsaveisDisponiveis } from '../lib/responsaveisDisponiveis';
import type { UsuariosFilters } from '../types/usuarioTypes';
import { usuariosKeys } from './usuariosKeys';

const FILTROS: UsuariosFilters = { page: 0, size: 100, ativo: true };
const STALE_TIME_MS = 5 * 60 * 1000;

/** Quem pode ser responsável por uma solicitação. Só é buscado para quem tria. */
export function useResponsaveisDisponiveis() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: usuariosKeys.list(FILTROS),
    queryFn: () => usuariosApi.listar(FILTROS),
    enabled: canManageSolicitacoes(user?.perfil),
    staleTime: STALE_TIME_MS,
    select: (page) => filtrarResponsaveisDisponiveis(page.content),
  });

  return { responsaveis: data ?? [], isLoading };
}
