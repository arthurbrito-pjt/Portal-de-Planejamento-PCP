import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Disc, 
  TrendingUp, 
  Layers, 
  AlertOctagon, 
  Scissors, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Percent, 
  Weight, 
  Sparkles, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  ArrowUpRight,
  Sliders,
  Boxes,
  Maximize2,
  CalendarClock,
  Play,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Coil, Product, SlitterOrder, PCPKPIs } from '../types/pcp';
import { ReadinessService, SlitterProductionProgram, ProductReadiness } from '../services/readinessService';
import { MetricsBadge } from '../components/MetricsBadge';

interface DashboardViewProps {
  kpis: PCPKPIs;
  coils: Coil[];
  products: Product[];
  orders: SlitterOrder[];
  onNavigateToPlanning: (productId?: string) => void;
  onNavigateToOrders: () => void;
  onNavigateToData: () => void;
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  coils,
  products,
  orders,
  onNavigateToPlanning,
  onNavigateToOrders,
  onNavigateToData,
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const [activeBoardView, setActiveBoardView] = useState<'slitter_programs' | 'demand_readiness'>('slitter_programs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');
  const [yieldFilter, setYieldFilter] = useState<'TODOS' | 'PERFEITO' | 'CONFORME'>('TODOS');

  // Generate Slitter Cutting Programs (Bobina -> Slitter -> Materiais Destino)
  const slitterPrograms = useMemo(() => {
    return ReadinessService.generateSlitterPrograms(products, coils);
  }, [products, coils]);

  // Product readiness analysis
  const readinessList = useMemo(() => {
    return ReadinessService.analyze(products, coils);
  }, [products, coils]);

  // Unique thicknesses for filter
  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    coils.forEach(c => set.add(c.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [coils]);

  // Filtered Slitter Programs
  const filteredPrograms = useMemo(() => {
    return slitterPrograms.filter(prog => {
      const matchesSearch = 
        prog.coil.lote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.coil.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.materialsProduced.some(m => 
          m.product.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.product.descricao.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesThickness = thicknessFilter === 'TODOS' || prog.coil.espessura === Number(thicknessFilter);
      const matchesYield = 
        yieldFilter === 'TODOS' ||
        (yieldFilter === 'PERFEITO' && prog.sobraMm === 0) ||
        (yieldFilter === 'CONFORME' && prog.sobraMm <= 10);

      return matchesSearch && matchesThickness && matchesYield;
    });
  }, [slitterPrograms, searchQuery, thicknessFilter, yieldFilter]);

  // Coils by Thickness chart data
  const thicknessMap: Record<string, { thickness: number; weight: number; count: number }> = {};
  coils.filter(c => c.status === 'Disponível').forEach(c => {
    const key = `${c.espessura} mm`;
    if (!thicknessMap[key]) {
      thicknessMap[key] = { thickness: c.espessura, weight: 0, count: 0 };
    }
    thicknessMap[key].weight += c.peso;
    thicknessMap[key].count += 1;
  });

  const coilsByThickness = Object.entries(thicknessMap)
    .map(([name, data]) => ({
      name,
      espessura: data.thickness,
      peso: Number(data.weight.toFixed(1)),
      lotes: data.count
    }))
    .sort((a, b) => a.espessura - b.espessura);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn w-full">
      {/* Top Cockpit Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            PROGRAMAÇÃO DE CORTE SLITTER • PCP METALÚRGICO 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Central de Programação de Slitters & Matéria-Prima
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Acompanhe exatamente <strong className="text-blue-400">qual bobina será fatiada</strong>, <strong className="text-emerald-400">qual slitter será montado</strong> e <strong className="text-purple-300">quais tubos e perfis serão produzidos</strong> com cada fita.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToPlanning()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 glow-blue"
          >
            <Sparkles className="w-4 h-4" />
            <span>Novo Planejamento Customizado (6 Passos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Mode Tabs & Filter Controls */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Sub-view switcher */}
        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1.5">
          <button
            onClick={() => setActiveBoardView('slitter_programs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeBoardView === 'slitter_programs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Slitters Prontos para Corte ({slitterPrograms.length} programas)</span>
          </button>

          <button
            onClick={() => setActiveBoardView('demand_readiness')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeBoardView === 'demand_readiness'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Fila de Demandas por Produto ({readinessList.length} itens)</span>
          </button>
        </div>

        {/* Search & Bitola Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lote, fita ou produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <select
            value={thicknessFilter}
            onChange={(e) => setThicknessFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="TODOS">Todas as Bitolas</option>
            {uniqueThicknesses.map(t => (
              <option key={t} value={t}>{t} mm</option>
            ))}
          </select>

          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'PERFEITO', label: '100% (Sobra 0)' },
              { id: 'CONFORME', label: '≤ 10mm Conforme' }
            ].map(y => (
              <button
                key={y.id}
                onClick={() => setYieldFilter(y.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  yieldFilter === y.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: SLITTER PROGRAMS (Bobina -> Slitter -> Materiais Produzidos) */}
      {activeBoardView === 'slitter_programs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
            <span>Exibindo <strong>{filteredPrograms.length}</strong> combinações de corte otimizadas prontas para execução</span>
            <span className="text-emerald-400 font-bold">✓ Regra garantida: Sobra máxima ≤ 10 mm</span>
          </div>

          <div className="space-y-4">
            {filteredPrograms.map((prog, idx) => {
              const coil = prog.coil;
              const isPerfect = prog.sobraMm === 0;

              return (
                <div
                  key={prog.id || idx}
                  className="glass-card p-6 rounded-3xl border border-slate-800/90 hover:border-blue-500/50 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950 transition-all shadow-xl hover:shadow-2xl space-y-4 group"
                >
                  {/* Top Bar: Coil info + Performance Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
                    {/* Left: Coil Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                        <Disc className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white font-mono tracking-tight">
                            LOTE: {coil.lote}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold">
                            {coil.codigo}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-bold">
                            Bitola: {coil.largura} x {coil.espessura} mm
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          Matéria-prima em Estoque: <strong className="text-emerald-400">{coil.peso} t</strong> disponível
                        </p>
                      </div>
                    </div>

                    {/* Right: Yield Badges & Action Buttons */}
                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono pr-2">
                        <div className="text-xs text-slate-400 uppercase font-bold">Aproveitamento</div>
                        <div className={`text-base font-black ${isPerfect ? 'text-emerald-400' : 'text-emerald-300'}`}>
                          {prog.aproveitamentoPercent}% ({prog.sobraMm}mm sobra)
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenProgramSimulation(prog)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-2xl border border-slate-700 transition-all hover:scale-105"
                      >
                        <Scissors className="w-4 h-4 text-blue-400" />
                        <span>Abrir no Estúdio</span>
                      </button>

                      <button
                        onClick={() => onOpenProgramOrder(prog)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 glow-emerald"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Emitir Ordem de Slitter (OS)</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle: Slitter Diagram Bar (Mini Cross Section) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                      <span>Montagem de Facas no Slitter ({prog.totalFitas} fitas programadas):</span>
                      <span className="text-slate-300">
                        {prog.materialsProduced.map(m => `${m.quantidadeFitas}x ${m.fitaLargura}mm`).join(' + ')} 
                        {prog.sobraMm > 0 ? ` + [${prog.sobraMm}mm refilo]` : ''} = {coil.largura}mm
                      </span>
                    </div>

                    {/* Graphical strip bar */}
                    <div className="w-full h-10 bg-slate-950 rounded-xl border border-slate-700/80 p-1 flex items-stretch overflow-hidden shadow-inner">
                      {prog.materialsProduced.map((m, mIdx) => {
                        const widthPct = (m.larguraTotal / coil.largura) * 100;
                        const isMain = m.finalidade === 'PRINCIPAL';

                        return (
                          <div
                            key={mIdx}
                            style={{ width: `${widthPct}%` }}
                            className={`h-full flex items-center justify-between px-2 text-white font-mono text-[10px] font-bold border-r border-slate-950 ${
                              isMain ? 'bg-blue-600' : 'bg-purple-600'
                            }`}
                            title={`${m.quantidadeFitas}x Fita de ${m.fitaLargura}mm para ${m.product.codigo}`}
                          >
                            <span className="truncate">{m.quantidadeFitas}x {m.fitaLargura}mm</span>
                            <span className="text-[9px] opacity-80">{m.pesoAlocadoTon}t</span>
                          </div>
                        );
                      })}

                      {prog.sobraMm > 0 && (
                        <div
                          style={{ width: `${(prog.sobraMm / coil.largura) * 100}%` }}
                          className="h-full bg-emerald-950/80 border border-dashed border-emerald-500/60 text-emerald-400 text-[9px] font-mono font-bold flex items-center justify-center px-1"
                        >
                          {prog.sobraMm}mm
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Destination Materials (PARA QUAIS MATERIAIS ELE VAI SER UTILIZADO) */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Produtos Finais Produzidos a partir deste Slitter:
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {prog.materialsProduced.map((mat, matIdx) => {
                        const isMain = mat.finalidade === 'PRINCIPAL';

                        return (
                          <div
                            key={matIdx}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isMain
                                ? 'bg-blue-950/40 border-blue-500/40'
                                : 'bg-purple-950/40 border-purple-500/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white font-mono">{mat.product.codigo}</span>
                                  <MetricsBadge type="familia" value={mat.product.familia} size="sm" />
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                                    isMain ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                                  }`}>
                                    {mat.finalidade}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 font-medium line-clamp-1">
                                  {mat.product.descricao}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono">
                              <div className="text-center bg-slate-950/60 p-1.5 rounded-lg">
                                <span className="text-slate-400 block text-[9px]">FITAS</span>
                                <strong className="text-white font-bold">{mat.quantidadeFitas}x ({mat.fitaLargura}mm)</strong>
                              </div>
                              <div className="text-center bg-slate-950/60 p-1.5 rounded-lg">
                                <span className="text-slate-400 block text-[9px]">PESO GERADO</span>
                                <strong className="text-emerald-400 font-bold">{mat.pesoAlocadoTon} t</strong>
                              </div>
                              <div className="text-center bg-slate-950/60 p-1.5 rounded-lg">
                                <span className="text-slate-400 block text-[9px]">RENDIMENTO</span>
                                <strong className="text-sky-300 font-bold">{mat.metrosEstimados} m</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PRODUCT DEMAND READINESS */}
      {activeBoardView === 'demand_readiness' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Cobertura de Estoque de Bobinas por Produto ({readinessList.length} itens)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulte o estoque de bobinas disponível para cada item e a bobina recomendada para o corte
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono sticky top-0 bg-slate-900 z-10">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Código / Descrição</th>
                  <th className="py-3 px-3">Família</th>
                  <th className="py-3 px-3 text-right">Espessura</th>
                  <th className="py-3 px-3 text-right">Fita (mm)</th>
                  <th className="py-3 px-3 text-right">Demanda (t)</th>
                  <th className="py-3 px-3 text-right">Estoque Bobinas</th>
                  <th className="py-3 px-3 text-center">Melhor Bobina Lote</th>
                  <th className="py-3 px-3 text-right">Aprov. Teórico</th>
                  <th className="py-3 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {readinessList
                  .filter(r => 
                    r.product.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.product.descricao.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((r) => (
                    <tr key={r.product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        {r.status === 'PRONTO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            <Check className="w-3 h-3" /> Pronto ({r.compatibleLotCount} lotes)
                          </span>
                        ) : r.status === 'PARCIAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            Parcial ({r.coveragePercent}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            Sem Bobina
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-black text-white">{r.product.codigo}</div>
                        <div className="text-[11px] font-sans text-slate-400 truncate max-w-xs">{r.product.descricao}</div>
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <MetricsBadge type="familia" value={r.product.familia} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right text-purple-400 font-bold">{r.product.espessura} mm</td>
                      <td className="py-3.5 px-3 text-right font-black text-white">{r.product.larguraFita} mm</td>
                      <td className="py-3.5 px-3 text-right text-amber-400 font-bold">{r.product.demandaT || 0} t</td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-400">{r.totalCompatibleWeightTon} t</td>
                      <td className="py-3.5 px-3 text-center">
                        {r.bestCoil ? (
                          <span className="text-blue-400 font-black">{r.bestCoil.lote} ({r.bestCoil.largura}mm)</span>
                        ) : '-'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-400">
                        {r.estimatedYieldPercent > 0 ? `${r.estimatedYieldPercent}%` : '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onNavigateToPlanning(r.product.id)}
                          disabled={r.compatibleLotCount === 0}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-black transition-all"
                        >
                          Planejar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Estoque de Bobinas</span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {kpis.totalBobinasDisponiveis} <span className="text-xs font-sans text-slate-400">lotes</span>
          </div>
          <div className="text-xs text-blue-400 font-mono mt-0.5 font-bold">
            {kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t disponíveis
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Aproveitamento Médio</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {kpis.aproveitamentoMedioPercent}%
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            Meta: Sobra ≤ 10 mm
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ordens de Slitter</span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {orders.length} <span className="text-xs font-sans text-slate-400">OS geradas</span>
          </div>
          <div className="text-xs text-purple-400 mt-0.5 font-bold">
            {kpis.totalOrdensAtivas} em andamento
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Demanda Cadastrada</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            {kpis.demandaTotalTon.toLocaleString('pt-BR')} t
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {products.length} produtos cadastrados
          </div>
        </div>
      </div>
    </div>
  );
};
