import React, { useMemo, useState } from 'react';
import { Coil, Product, SlitterIntermediaryItem } from '../../types/pcp';
import { Disc, Scissors, Layers, Boxes, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { ReadinessService, SlitterProductionProgram } from '../../services/readinessService';
import { MetricsBadge } from '../../components/MetricsBadge';
import { DashboardFilterBar } from '../../components/dashboard/DashboardFilterBar';
import { useDashboardFilters } from '../../components/dashboard/useDashboardFilters';

interface ProgramasSlitterProps {
  products: Product[];
  coils: Coil[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
}

export const ProgramasSlitter: React.FC<ProgramasSlitterProps> = ({
  products,
  coils,
  intermediarySlitters = [],
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const filters = useDashboardFilters();
  const { searchQuery, thicknessFilter, scrapFilter } = filters;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const slitterPrograms = useMemo(
    () => ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    [products, coils, intermediarySlitters]
  );

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    coils.forEach(c => set.add(c.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [coils]);

  const filteredPrograms = useMemo(() => {
    return slitterPrograms.filter(prog => {
      const matchesSearch =
        prog.coil.lote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.coil.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.materialsProduced.some(m =>
          m.codigoSlitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.nomeSlitter.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesThickness = thicknessFilter === 'TODOS' || prog.coil.espessura === Number(thicknessFilter);
      const matchesScrap =
        scrapFilter === 'TODOS' ||
        (scrapFilter === 'IDEAL' && prog.sobraMm >= 10 && prog.sobraMm <= 18) ||
        (scrapFilter === 'BAIXO' && prog.sobraMm < 10) ||
        (scrapFilter === 'ALTO' && prog.sobraMm > 18);

      return matchesSearch && matchesThickness && matchesScrap;
    });
  }, [slitterPrograms, searchQuery, thicknessFilter, scrapFilter]);

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <DashboardFilterBar filters={filters} uniqueThicknesses={uniqueThicknesses} showScrapFilter />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Exibindo <strong className="font-medium text-slate-700">{filteredPrograms.length}</strong> combinações de corte otimizadas prontas para execução</span>
        <span className="text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Regra PCP: refilo padrão de 10 a 18 mm (~1,5%)
        </span>
      </div>

      <div className="space-y-3">
        {filteredPrograms.map((prog, idx) => {
          const coil = prog.coil;
          const isIdeal = prog.sobraMm >= 10 && prog.sobraMm <= 18;

          return (
            <div key={prog.id || idx} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Disc className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Bobina Matriz</span>
                      <span className="text-sm font-semibold text-slate-900">Lote: {coil.lote}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">{coil.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">{coil.largura} x {coil.espessura} mm</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estoque de matéria-prima: <strong className="text-emerald-700 font-medium">{coil.peso} t</strong> disponível
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right pr-2">
                    <div className="text-xs text-slate-400">Aproveitamento Slitter</div>
                    <div className={`text-sm font-semibold ${isIdeal ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {prog.aproveitamentoPercent}% ({prog.sobraMm}mm refilo)
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenProgramSimulation(prog)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Simular Slitter</span>
                  </button>

                  <button
                    onClick={() => onOpenProgramOrder(prog)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Emitir Ordem de Produção (OP)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-wrap justify-between gap-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Scissors className="w-3.5 h-3.5 text-blue-600" />
                    Produção no slitter — montagem de facas ({prog.totalFitas} fitas):
                  </span>
                  <span className="font-mono text-slate-700">
                    {prog.materialsProduced.map(m => `${m.quantidadeFitas}x fita ${m.fitaLargura}mm`).join(' + ')}
                    {prog.sobraMm > 0 ? ` + [${prog.sobraMm}mm refilo]` : ''} = {coil.largura}mm
                  </span>
                </div>

                <div className="w-full h-11 bg-slate-200 rounded-lg p-1 flex items-stretch overflow-hidden">
                  {prog.materialsProduced.map((m, mIdx) => {
                    const widthPct = (m.larguraTotal / coil.largura) * 100;
                    const isMain = m.finalidade === 'PRINCIPAL';

                    return (
                      <div
                        key={mIdx}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full flex items-center justify-between px-3 text-white font-mono text-xs font-medium border-r-2 border-white rounded-md transition-colors ${
                          isMain ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'
                        }`}
                        title={`${m.quantidadeFitas}x ${m.codigoSlitter} - ${m.nomeSlitter} (${m.fitaLargura}mm)`}
                      >
                        <span className="truncate">{m.quantidadeFitas}x {m.codigoSlitter} ({m.fitaLargura}mm)</span>
                        <span className="text-[11px] opacity-90 shrink-0 ml-1 bg-black/20 px-1.5 py-0.5 rounded">{m.pesoAlocadoTon}t</span>
                      </div>
                    );
                  })}

                  {prog.sobraMm > 0 && (
                    <div
                      style={{ width: `${(prog.sobraMm / coil.largura) * 100}%` }}
                      className={`h-full border border-dashed text-[11px] font-mono font-medium flex items-center justify-center px-1 rounded-md ${
                        isIdeal ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : prog.sobraMm < 10 ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-red-100 border-red-400 text-red-800'
                      }`}
                    >
                      {prog.sobraMm}mm refilo
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleExpanded(prog.id || String(idx))}
                  className="w-full text-xs font-medium text-slate-600 flex flex-wrap items-center justify-between gap-1 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Fitas de slitter produzidas & materiais de destino ({prog.materialsProduced.length})
                  </span>
                  {expandedIds.has(prog.id || String(idx)) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {!expandedIds.has(prog.id || String(idx)) && (
                  <div className="flex flex-wrap gap-1.5">
                    {prog.materialsProduced.map((mat, matIdx) => (
                      <span
                        key={matIdx}
                        className={`text-[11px] font-mono px-2 py-1 rounded-md ${mat.finalidade === 'PRINCIPAL' ? 'bg-blue-50 text-blue-800' : 'bg-violet-50 text-violet-800'}`}
                      >
                        {mat.quantidadeFitas}x {mat.codigoSlitter} → {mat.product.codigo} ({mat.pesoAlocadoTon}t)
                      </span>
                    ))}
                  </div>
                )}

                {expandedIds.has(prog.id || String(idx)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prog.materialsProduced.map((mat, matIdx) => {
                    const isMain = mat.finalidade === 'PRINCIPAL';
                    return (
                      <div key={matIdx} className={`p-3.5 rounded-lg border space-y-3 ${isMain ? 'bg-blue-50/60 border-blue-200' : 'bg-violet-50/60 border-violet-200'}`}>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            Slitter a produzir
                          </span>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-sm font-semibold font-mono text-blue-800">{mat.codigoSlitter}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isMain ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                              {mat.finalidade}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1">{mat.nomeSlitter}</p>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Fita: <span className="text-slate-700">{mat.fitaLargura} x {coil.espessura} mm</span>
                          </div>
                        </div>

                        <div className="bg-white/70 p-3 rounded-lg border border-slate-200/70">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <Boxes className="w-3 h-3" />
                            Material de destino
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-800 font-mono">{mat.product.codigo}</span>
                            <MetricsBadge type="familia" value={mat.product.familia} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{mat.product.descricao}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-xs">
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Qtd rolos</span>
                            <strong className="text-slate-800 font-semibold font-mono">{mat.quantidadeFitas}x</strong>
                          </div>
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Peso total</span>
                            <strong className="text-emerald-700 font-semibold font-mono">{mat.pesoAlocadoTon} t</strong>
                          </div>
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Metragem</span>
                            <strong className="text-blue-700 font-semibold font-mono">{mat.metrosEstimados} m</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
