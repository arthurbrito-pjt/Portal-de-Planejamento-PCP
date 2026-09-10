import { useState } from 'react';

export type ScrapFilter = 'TODOS' | 'IDEAL' | 'BAIXO' | 'ALTO';

export interface DashboardFilters {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  thicknessFilter: string;
  setThicknessFilter: (v: string) => void;
  scrapFilter: ScrapFilter;
  setScrapFilter: (v: ScrapFilter) => void;
}

/**
 * Filtros de busca/espessura/sobra compartilhados entre os sub-dashboards
 * (antes reimplementados separadamente em cada aba do Painel Geral).
 */
export function useDashboardFilters(): DashboardFilters {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');
  const [scrapFilter, setScrapFilter] = useState<ScrapFilter>('TODOS');

  return {
    searchQuery,
    setSearchQuery,
    thicknessFilter,
    setThicknessFilter,
    scrapFilter,
    setScrapFilter
  };
}
