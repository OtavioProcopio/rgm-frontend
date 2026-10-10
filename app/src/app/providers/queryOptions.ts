/** Opções padrão de toda consulta da aplicação; o QueryProvider as aplica ao QueryClient. */
export const OPCOES_PADRAO_DAS_CONSULTAS = {
  retry: 1,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
};
