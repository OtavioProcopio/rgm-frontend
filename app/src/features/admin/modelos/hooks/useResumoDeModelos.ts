import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

/** Contagens do cadastro de modelos, sem trazer a lista. */
export function useResumoDeModelos() {
  return useQuery({
    queryKey: modelosKeys.resumo(),
    queryFn: modelosApi.obterResumo,
  });
}
