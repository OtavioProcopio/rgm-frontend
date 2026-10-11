import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { OPCOES_PADRAO_DAS_CONSULTAS } from '@/app/providers/queryOptions';

const queryClient = new QueryClient({
  defaultOptions: { queries: OPCOES_PADRAO_DAS_CONSULTAS },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
