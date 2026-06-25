import { useQuery } from '@tanstack/react-query';
import { perfilApi } from '../api/perfilApi';

export function usePerfil() {
  return useQuery({
    queryKey: ['perfil', 'me'],
    queryFn: async () => {
      const response = await perfilApi.obterPerfil();
      return response.data;
    },
  });
}
