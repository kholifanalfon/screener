export const stocksKeys = {
  all: ['stocks'] as const,
  lists: () => [...stocksKeys.all, 'list'] as const,
  screener: (filters: Record<string, any>) => [...stocksKeys.all, 'screener', filters] as const,
  details: (ticker: string) => [...stocksKeys.all, 'detail', ticker] as const,
};
