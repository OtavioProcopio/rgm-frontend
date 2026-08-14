import { httpClient } from '@/shared/api/httpClient';

import type { Maquina } from '../types/maquinaTypes';

export const maquinasApi = {
  listar: () => httpClient.get<Maquina[]>('/maquinas'),
};
