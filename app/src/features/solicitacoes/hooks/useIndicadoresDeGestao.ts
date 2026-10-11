import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { AuthContext } from '@/app/providers/authContext';

import { solicitacoesApi } from '../api/solicitacoesApi';

/** Indicadores de gestão do período: só gestor e administrador; o operador nem os pede. */
export function useIndicadoresDeGestao(dias: number) {
  const perfil = useContext(AuthContext)?.user?.perfil;
  return useQuery({
    queryKey: ['solicitacoes', 'metricas', 'gestao', dias] as const,
    queryFn: () => solicitacoesApi.obterIndicadoresDeGestao(dias),
    enabled: perfil !== undefined && perfil !== 'OPERADOR',
  });
}
