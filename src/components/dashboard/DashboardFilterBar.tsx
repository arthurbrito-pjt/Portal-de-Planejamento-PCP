import React from 'react';
import { Search } from 'lucide-react';
import { DashboardFilters } from './useDashboardFilters';

interface DashboardFilterBarProps {
  filters: DashboardFilters;
  uniqueThicknesses: number[];
  showScrapFilter?: boolean;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  uniqueThicknesses,
  showScrapFilter = false
}) => {
  const { searchQuery, setSearchQuery, thicknessFilter, setThicknessFilter, scrapFilter, setScrapFilter } = filters;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-56">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código ou slitter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
        />
      </div>

      <select
        value={thicknessFilter}
        onChange={(e) => setThicknessFilter(e.target.value)}
        className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
      >
        <option value="TODOS">Todas as Bitolas</option>
        {uniqueThicknesses.map(t => (
          <option key={t} value={t}>{t} mm</option>
        ))}
      </select>

      {showScrapFilter && (
        <div className="flex rounded-lg bg-slate-100 p-1">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'IDEAL', label: 'Conforme (10-18mm)' },
            { id: 'ALTO', label: 'Sobra > 18mm' }
          ].map(y => (
            <button
              key={y.id}
              onClick={() => setScrapFilter(y.id as any)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                scrapFilter === y.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
