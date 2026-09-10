import React, { useMemo } from 'react';
import { Coil, Product, SlitterIntermediaryItem } from '../../types/pcp';
import { CheckCircle } from 'lucide-react';
import { ReadinessService } from '../../services/readinessService';
import { DashboardFilterBar } from '../../components/dashboard/DashboardFilterBar';
import { useDashboardFilters } from '../../components/dashboard/useDashboardFilters';

interface ProntidaoDemandaProps {
  products: Product[];
  coils: Coil[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  onNavigateToPlanning: (productId?: string) => void;
}

export const ProntidaoDemanda: React.FC<ProntidaoDemandaProps> = ({ products, coils, intermediarySlitters = [], onNavigateToPlanning }) => {
  const filters = useDashboardFilters();
  const { searchQuery, thicknessFilter } = filters;

  const slitterDemands = useMemo(() => {
    const list = ReadinessService.analyzeSlitters(products, coils, intermediarySlitters);
    return ReadinessService.sortSlittersByReadiness(list);
  }, [products, coils, intermediarySlitters]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    coils.forEach(c => set.add(c.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [coils]);

  const filteredSlitterDemands = useMemo(() => {
    return slitterDemands.filter(s => {
      const matchesSearch =
        s.codigoSlitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nomeSlitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${s.larguraFita}`.includes(searchQuery);
      const matchesThickness = thicknessFilter === 'TODOS' || s.espessura === Number(thicknessFilter);
      return matchesSearch && matchesThickness;
    });
  }, [slitterDemands, searchQuery, thicknessFilter]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Fila de Slitters a Produzir ({filteredSlitterDemands.length} tipos de slitters cadastrados)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demanda de cada <strong className="font-medium text-slate-700">Slitter</strong> com relação dos <strong className="font-medium text-slate-700">Materiais de Destino</strong> (Perfis e Tubos).
          </p>
        </div>
        <DashboardFilterBar filters={filters} uniqueThicknesses={uniqueThicknesses} />
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px] tracking-wide sticky top-0 bg-white z-10 font-medium">
              <th className="py-3 px-3">Status Matéria-Prima</th>
              <th className="py-3 px-3">Código Slitter</th>
              <th className="py-3 px-3">Materiais de Destino</th>
              <th className="py-3 px-3 text-right">Dimensões</th>
              <th className="py-3 px-3 text-right text-amber-700">Demanda (t)</th>
              <th className="py-3 px-3 text-right">Estoque MP</th>
              <th className="py-3 px-3 text-center">Melhor Bobina / Aprov.</th>
              <th className="py-3 px-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSlitterDemands.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3">
                  {s.status === 'PRONTO' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                      <CheckCircle className="w-3 h-3" /> Pronto ({s.compatibleLotCount} lotes)
                    </span>
                  ) : s.status === 'PARCIAL' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-medium">
                      Parcial ({s.coveragePercent}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-[11px] font-medium">Sem Bobina</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono font-medium text-blue-700">{s.codigoSlitter}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{s.nomeSlitter}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap items-center gap-1 max-w-xs">
                    {s.produtos.slice(0, 2).map((item, iIdx) => (
                      <span key={iIdx} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono" title={item.product.descricao}>
                        {item.product.codigo} ({item.demandaT}t)
                      </span>
                    ))}
                    {s.produtos.length > 2 && <span className="text-[11px] text-slate-400">+{s.produtos.length - 2} itens</span>}
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">{s.larguraFita} x {s.espessura} mm</td>
                <td className="py-3 px-3 text-right font-mono font-medium text-amber-700">{s.totalDemandaT} t</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700">{s.totalCompatibleWeightTon} t</td>
                <td className="py-3 px-3 text-center">
                  {s.bestCoil ? (
                    <>
                      <div className="font-mono text-blue-700">{s.bestCoil.lote} ({s.bestCoil.largura}mm)</div>
                      {s.estimatedYieldPercent > 0 && (
                        <div className="text-[10px] text-emerald-700 font-mono">{s.estimatedYieldPercent}% aprov.</div>
                      )}
                    </>
                  ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onNavigateToPlanning(s.mainProduct.id)}
                    disabled={s.compatibleLotCount === 0}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Programar Slitter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
