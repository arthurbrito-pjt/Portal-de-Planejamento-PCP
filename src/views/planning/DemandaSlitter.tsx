import React, { useMemo, useState } from 'react';
import { Coil, Ferramental, Product, SlitterDemandItem, SlitterIntermediaryItem } from '../../types/pcp';
import { ReadinessService } from '../../services/readinessService';
import { StorageService } from '../../services/storageService';
import { CoilCompatibilityService } from '../../services/coilCompatibilityService';
import { OpSuggestionCard } from '../../components/OpSuggestionCard';
import {
  PlanningFilters,
  PlanningFilterBar,
  FerramentalGroupHeader,
  groupByFerramental
} from '../../components/planning/planningFilters';

type StatusFilter = 'TODOS' | 'PRONTO' | 'PARCIAL' | 'BLOQUEADO';

interface DemandaSlitterProps {
  products: Product[];
  coils: Coil[];
  ferramentais: Ferramental[];
  intermediarySlitters: SlitterIntermediaryItem[];
  filters: PlanningFilters;
  viewToggle?: React.ReactNode;
  onAccept: (item: SlitterDemandItem) => void;
  onCustomize: (item: SlitterDemandItem) => void;
}

/**
 * Planejamento por demanda (fluxo clássico): um card por slitter com toda a
 * demanda que sai dele, agrupados pelo ferramental de conformação. "Aceitar"
 * e "Personalizar" seguem para a Etapa 2 (Revisar & Confirmar) do wizard.
 */
export const DemandaSlitter: React.FC<DemandaSlitterProps> = ({
  products,
  coils,
  ferramentais,
  intermediarySlitters,
  filters,
  viewToggle,
  onAccept,
  onCustomize
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');

  const slitterDemands = useMemo(
    () => ReadinessService.sortSlittersByReadiness(ReadinessService.analyzeSlitters(products, coils, intermediarySlitters)),
    [products, coils, intermediarySlitters]
  );

  const abcByCodigo = useMemo(() => {
    const analysis = ReadinessService.analyzeToolingABC(ferramentais, products, StorageService.getFerramentalHistorico());
    return new Map(analysis.map(a => [a.ferramental.codigo, a]));
  }, [ferramentais, products]);

  const produtividadeByCodigo = useMemo(
    () => new Map(StorageService.getFerramentalProdutividade().map(p => [p.codigoFerramental, p.tonPorHora])),
    []
  );

  // Filtros de produto/bitola/busca primeiro; os contadores de status refletem esse recorte.
  const filteredByProduct = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return slitterDemands.filter(item => {
      const matchesSearch = !q ||
        item.codigoSlitter.toLowerCase().includes(q) ||
        item.nomeSlitter.toLowerCase().includes(q) ||
        `${item.larguraFita}`.includes(q) ||
        item.produtos.some(p => p.product.codigo.toLowerCase().includes(q) || p.product.descricao.toLowerCase().includes(q));
      return matchesSearch &&
        filters.matchesProducts(item.produtos.map(p => p.product)) &&
        filters.matchesThickness(item.espessura);
    });
  }, [slitterDemands, filters]);

  const counts = useMemo(() => ({
    TODOS: filteredByProduct.length,
    PRONTO: filteredByProduct.filter(i => i.status === 'PRONTO').length,
    PARCIAL: filteredByProduct.filter(i => i.status === 'PARCIAL').length,
    BLOQUEADO: filteredByProduct.filter(i => i.status === 'BLOQUEADO').length
  }), [filteredByProduct]);

  const filteredItems = useMemo(
    () => statusFilter === 'TODOS' ? filteredByProduct : filteredByProduct.filter(i => i.status === statusFilter),
    [filteredByProduct, statusFilter]
  );

  const grouped = useMemo(
    () => groupByFerramental(filteredItems, item => item.mainProduct, products, filters),
    [filteredItems, products, filters]
  );

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'PRONTO', label: 'Prontos' },
    { id: 'PARCIAL', label: 'Parciais' },
    { id: 'BLOQUEADO', label: 'Sem Bobina' }
  ];

  return (
    <div className="space-y-3">
      {viewToggle}

      <PlanningFilterBar filters={filters}>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {statusTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[10px] font-mono text-slate-400">{counts[t.id]}</span>
            </button>
          ))}
        </div>
      </PlanningFilterBar>

      <div className="text-xs text-slate-500 px-1">
        Exibindo <strong className="font-medium text-slate-700">{filteredItems.length}</strong> slitters a produzir em{' '}
        <strong className="font-medium text-slate-700">{grouped.filter(g => g.codigo !== 'COMPLEMENTAR').length}</strong> ferramentais
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-10 text-sm text-slate-400">Nenhuma demanda encontrada para os filtros selecionados.</div>
      )}

      <div className="space-y-5">
        {grouped.map(group => (
          <section key={group.codigo} className="space-y-3">
            <FerramentalGroupHeader
              nome={group.nome}
              demandaT={group.demandaT}
              countLabel={`${group.entries.length} ${group.entries.length === 1 ? 'slitter' : 'slitters'}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.entries.map(item => {
                const abc = abcByCodigo.get(item.codigoSlitter);
                return (
                  <OpSuggestionCard
                    key={item.id}
                    item={item}
                    wipAvailableTon={CoilCompatibilityService.getIntermediaryStockTon(item.mainProduct, intermediarySlitters)}
                    ferramentalClasse={abc?.classeGiro}
                    ferramentalPronta={abc?.prontaParaSetup}
                    ferramentalStatusAcumulo={abc?.statusAcumulo}
                    capacidadeTonHora={produtividadeByCodigo.get(item.codigoSlitter)}
                    onAccept={() => onAccept(item)}
                    onCustomize={() => onCustomize(item)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
