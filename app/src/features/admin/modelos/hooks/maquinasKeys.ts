export const maquinasKeys = {
  all: ['maquinas'] as const,
  lists: () => [...maquinasKeys.all, 'list'] as const,
};
