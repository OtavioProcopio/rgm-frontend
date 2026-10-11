export const tiposModeloKeys = {
  all: ['tipos-modelo'] as const,
  lists: () => [...tiposModeloKeys.all, 'list'] as const,
};
