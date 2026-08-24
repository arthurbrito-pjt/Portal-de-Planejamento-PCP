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
  Cell, 
  AreaChart, 
  Area 
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
  Boxes
} from 'lucide-react';
import { Coil, Product, SlitterOrder, PCPKPIs } from '../types/pcp';
import { ReadinessService, ProductReadiness } from '../services/readinessService';
import { MetricsBadge } from '../components/MetricsBadge';

interface DashboardViewProps {
  kpis: PCPKPIs;
  coils: Coil[];
  products: Product[];
  orders: SlitterOrder[];
  onNavigateToPlanning: (productId?: string) => void;
  onNavigateToOrders: () => void;
  onNavigateToData: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  coils,
  products,
  orders,
  onNavigateToPlanning,
  onNavigateToOrders,
  onNavigateToData
}) => {
  const [readinessFilter, setReadinessFilter] = useState<'TODOS' | 'PRONTO' | 'PARCIAL' | 'BLOQUEADO'>('PRONTO');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Analyze readiness for all products against available coils
  const readinessList = useMemo(() => {
    return ReadinessService.analyze(products, coils);
  }, [products, coils]);

  // Counts by readiness status
  const prontoCount = readinessList.filter(r => r.status === 'PRONTO').length;
  const parcialCount = readinessList.filter(r => r.status === 'PARCIAL').length;
  const bloqueadoCount = readinessList.filter(r => r.status === 'BLOQUEADO').length;

  // Filtered and sorted readiness items for the prioritization table
  const filteredReadiness = useMemo(() => {
    let list = readinessList;
    if (readinessFilter !== 'TODOS') {
      list = list.filter(r => r.status === readinessFilter);
    }
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter(r => 
        r.product.codigo.toLowerCase().includes(q) ||
        r.product.descricao.toLowerCase().includes(q)
      );
    }
    return ReadinessService.sortByReadiness(list);
  }, [readinessList, readinessFilter, tableSearch]);

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

  // Demand by Family chart
  const tuboDemand = products.filter(p => p.familia === 'TUBO').reduce((a, b) => a + (b.demandaT || 0), 0);
  const perfilDemand = products.filter(p => p.familia === 'PERFIL').reduce((a, b) => a + (b.demandaT || 0), 0);
  
  const familyChartData = [
    { name: 'Tubos Industriais', value: Math.round(tuboDemand), color: '#3b82f6' },
    { name: 'Perfis U Estruturais', value: Math.round(perfilDemand), color: '#8b5cf6' }
  ];

  // Slitter utilization trend
  const utilizationData = orders.length > 0 ? orders.slice(0, 10).map(o => ({
    name: o.numeroOS,
    aproveitamento: o.aproveitamentoPercent,
    sobra: o.sobraMm
  })) : [
    { name: 'ESP-1.50', aproveitamento: 99.17, sobra: 10 },
    { name: 'ESP-1.80', aproveitamento: 99.17, sobra: 10 },
    { name: 'ESP-2.00', aproveitamento: 100.0, sobra: 0 },
    { name: 'ESP-2.25', aproveitamento: 99.00, sobra: 10 },
    { name: 'ESP-2.65', aproveitamento: 98.67, sobra: 20 },
    { name: 'ESP-3.00', aproveitamento: 99.17, sobra: 10 },
    { name: 'ESP-4.75', aproveitamento: 99.33, sobra: 10 }
  ];

  return (
    <div className="space-y-7 pb-16 animate-fadeIn">
      {/* Top Cockpit: Production Feasibility Overview */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              PAINEL DE PRONTIDÃO & CONTROLE DE PRODUÇÃO PCP
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Matriz de Viabilidade de Produção
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Identifique instantaneamente quais produtos <strong className="text-emerald-400">possuem bobinas disponíveis em estoque</strong> para corte imediato no Slitter.
            </p>
          </div>

          <button
            onClick={() => onNavigateToPlanning()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 glow-blue"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Planejamento (6 Passos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Feasibility Cockpit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-800/80">
          {/* Pronto */}
          <div 
            onClick={() => setReadinessFilter('PRONTO')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              readinessFilter === 'PRONTO'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Prontos para Produzir
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {prontoCount} <span className="text-xs font-sans text-emerald-300 font-medium">produtos 100% viáveis</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Possuem bobinas com espessura e peso suficientes em estoque.
            </p>
          </div>

          {/* Parcial */}
          <div 
            onClick={() => setReadinessFilter('PARCIAL')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              readinessFilter === 'PARCIAL'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Atendimento Parcial
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {parcialCount} <span className="text-xs font-sans text-amber-300 font-medium">produtos parciais</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Há bobinas disponíveis, mas quantidade menor que a demanda total.
            </p>
          </div>

          {/* Bloqueado */}
          <div 
            onClick={() => setReadinessFilter('BLOQUEADO')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              readinessFilter === 'BLOQUEADO'
                ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/40 shadow-lg shadow-red-500/20'
                : 'bg-slate-950/70 border-slate-800 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5 font-mono">
                <XCircle className="w-4 h-4 text-red-400" />
                Sem Matéria-Prima
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {bloqueadoCount} <span className="text-xs font-sans text-red-300 font-medium">produtos bloqueados</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nenhuma bobina com espessura compatível disponível no estoque.
            </p>
          </div>
        </div>
      </div>

      {/* PRIORITIZATION TABLE: Products Ready to Produce First */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Fila de Priorização de Produção no Slitter
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exibindo primeiro os materiais com matéria-prima pronta para programar corte
              </p>
            </div>
          </div>

          {/* Quick Search & Filter Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por código ou descrição..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'PRONTO', label: '✓ Prontos' },
                { id: 'PARCIAL', label: '⚠ Parciais' },
                { id: 'BLOQUEADO', label: '✕ Bloqueados' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReadinessFilter(f.id as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    readinessFilter === f.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono sticky top-0 bg-slate-900 z-10">
                <th className="py-3 px-3">Status de Produção</th>
                <th className="py-3 px-3">Produto Final</th>
                <th className="py-3 px-3">Família</th>
                <th className="py-3 px-3 text-right">Espessura</th>
                <th className="py-3 px-3 text-right">Largura Fita</th>
                <th className="py-3 px-3 text-right">Demanda (t)</th>
                <th className="py-3 px-3 text-right">Estoque Bobinas</th>
                <th className="py-3 px-3 text-center">Melhor Bobina Lote</th>
                <th className="py-3 px-3 text-right">Aprov. Teórico</th>
                <th className="py-3 px-3 text-center">Ação PCP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReadiness.slice(0, 15).map((r) => {
                const prod = r.product;
                const isReady = r.status === 'PRONTO';
                const isPartial = r.status === 'PARCIAL';

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Status Pill */}
                    <td className="py-3.5 px-3">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Pronto ({r.compatibleLotCount} lotes)
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Parcial ({r.coveragePercent}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">
                          <XCircle className="w-3 h-3 text-red-400" />
                          Sem Bobina
                        </span>
                      )}
                    </td>

                    {/* Product Code & Description */}
                    <td className="py-3.5 px-3">
                      <div className="font-black text-white group-hover:text-blue-400 transition-colors">{prod.codigo}</div>
                      <div className="text-[11px] font-sans text-slate-400 truncate max-w-xs">{prod.descricao}</div>
                    </td>

                    {/* Family */}
                    <td className="py-3.5 px-3 font-sans">
                      <MetricsBadge type="familia" value={prod.familia} size="sm" />
                    </td>

                    {/* Thickness */}
                    <td className="py-3.5 px-3 text-right text-purple-400 font-bold">
                      {prod.espessura} mm
                    </td>

                    {/* Strip Width */}
                    <td className="py-3.5 px-3 text-right font-black text-white">
                      {prod.larguraFita} mm
                    </td>

                    {/* Planned Demand */}
                    <td className="py-3.5 px-3 text-right text-amber-400 font-bold">
                      {prod.demandaT || 0} t
                    </td>

                    {/* Compatible Stock */}
                    <td className="py-3.5 px-3 text-right">
                      <div className={`font-black ${r.totalCompatibleWeightTon > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {r.totalCompatibleWeightTon} t
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.compatibleLotCount} lotes disp.
                      </div>
                    </td>

                    {/* Best Matching Coil Lot */}
                    <td className="py-3.5 px-3 text-center">
                      {r.bestCoil ? (
                        <div>
                          <span className="text-blue-400 font-black">{r.bestCoil.lote}</span>
                          <span className="text-[10px] text-slate-400 block">({r.bestCoil.largura}mm • {r.bestCoil.peso}t)</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Theoretical Yield */}
                    <td className="py-3.5 px-3 text-right">
                      {r.estimatedYieldPercent > 0 ? (
                        <div>
                          <span className={`font-black ${r.estimatedYieldPercent >= 99 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {r.estimatedYieldPercent}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Sobra: {r.estimatedScrapMm}mm
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onNavigateToPlanning(prod.id)}
                        disabled={r.compatibleLotCount === 0}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          r.compatibleLotCount > 0
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:scale-105'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span>Planejar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bobinas */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Estoque de Bobinas</span>
            <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {kpis.totalBobinasDisponiveis} <span className="text-xs font-sans text-slate-400">lotes</span>
            </div>
            <div className="text-xs text-blue-400 font-mono mt-0.5 font-bold">
              {kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t disponíveis
            </div>
          </div>
        </div>

        {/* Aproveitamento Médio */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Aproveitamento Médio</span>
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {kpis.aproveitamentoMedioPercent}%
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Meta PCP: Sobra ≤ 10mm
            </div>
          </div>
        </div>

        {/* Ordens de Slitter */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ordens de Slitter</span>
            <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {orders.length} <span className="text-xs font-sans text-slate-400">OS</span>
            </div>
            <div className="text-xs text-purple-400 mt-0.5 font-bold">
              {kpis.totalOrdensAtivas} ordens ativas
            </div>
          </div>
        </div>

        {/* Demanda Total */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Demanda Cadastrada</span>
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {kpis.demandaTotalTon.toLocaleString('pt-BR')} t
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {products.length} produtos cadastrados
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coils by Thickness */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
                <Disc className="w-4 h-4 text-blue-400" />
                Estoque de Bobinas por Espessura (Toneladas)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Volume de aço disponível em cada bitola de matéria-prima</p>
            </div>
            <button
              onClick={onNavigateToData}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>Ver Bobinas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coilsByThickness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                  formatter={(val: any) => [`${val} t`, 'Estoque Disponível']}
                />
                <Bar dataKey="peso" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {coilsByThickness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3.5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-4 h-4 text-purple-400" />
              Demanda por Família
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Proporção: Tubos vs Perfis U</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={familyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {familyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                  formatter={(val: any) => [`${val} t`, 'Demanda']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {familyChartData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase">{item.name}</div>
                  <div className="font-black text-white font-mono text-xs">{item.value} t</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
