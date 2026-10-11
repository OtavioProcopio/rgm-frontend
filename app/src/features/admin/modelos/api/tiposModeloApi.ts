import { httpClient } from '@/shared/api/httpClient';

import type { TipoDeModelo } from '../types/tipoModeloTypes';

export const tiposModeloApi = {
  listar: () => httpClient.get<TipoDeModelo[]>('/tipos-modelo'),
};
