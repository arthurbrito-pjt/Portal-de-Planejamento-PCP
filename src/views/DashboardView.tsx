import React, { useState } from 'react';
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
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Weight,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Coil, Product, SlitterOrder, PCPKPIs } from '../types/pcp';
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
  // Compute chart data: Coils by Thickness
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

  // Compute Demand by Family (Tubos vs Perfis)
  const tuboDemand = products.filter(p => p.familia === 'TUBO').reduce((a, b) => a + (b.demandaT || 0), 0);
  const perfilDemand = products.filter(p => p.familia === 'PERFIL').reduce((a, b) => a + (b.demandaT || 0), 0);
  
  const familyChartData = [
    { name: 'Tubos Industriais', value: Math.round(tuboDemand), color: '#3b82f6' },
    { name: 'Perfis U Estruturais', value: Math.round(perfilDemand), color: '#8b5cf6' }
  ];

  // Slitter Utilization distribution (orders or simulated plans)
  const utilizationData = orders.length > 0 ? orders.slice(0, 10).map((o, idx) => ({
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

  // Missing thickness warnings
  const demandThicknesses = Array.from(new Set(products.map(p => p.espessura)));
  const stockThicknesses = Array.from(new Set(coils.filter(c => c.status === 'Disponível').map(c => c.espessura)));
  const missingThicknesses = demandThicknesses.filter(t => !stockThicknesses.includes(t));

  return (
    <div className="space-y-7 pb-16 animate-fadeIn">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-2xl">
        {/* Glow ambient lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              SISTEMA DE OTIMIZAÇÃO INDUSTRIAL • METALÚRGICA 2026
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Portal de Planejamento & Controle PCP
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Otimização de corte de bobinas de aço com controle de refilo, motor combinatório para sobra máxima de <strong className="text-emerald-400 font-mono">10 mm</strong> e emissão de ordens de produção.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToPlanning()}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 glow-blue"
            >
              <Sparkles className="w-4 h-4" />
              <span>Novo Planejamento (6 Passos)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estoque Bobinas */}
        <div className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Estoque Disponível</span>
            <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis.totalBobinasDisponiveis} <span className="text-sm font-medium text-slate-400 font-sans">lotes</span>
            </div>
            <div className="text-xs text-blue-400 font-mono mt-1 font-bold flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5" />
              {kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t em bobinas
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Card 2: Aproveitamento Médio */}
        <div className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Aproveitamento Médio</span>
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {kpis.aproveitamentoMedioPercent}%
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Meta PCP: ≥ 99.0% (Sobra ≤ 10mm)
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" 
              style={{ width: `${Math.min(100, kpis.aproveitamentoMedioPercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Ordens de Slitter */}
        <div className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ordens de Slitter</span>
            <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {orders.length} <span className="text-sm font-medium text-slate-400 font-sans">OS geradas</span>
            </div>
            <div className="text-xs text-purple-400 mt-1 font-bold">
              {kpis.totalOrdensAtivas} ordens em andamento
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Card 4: Demanda Planejada */}
        <div className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Demanda Planejada</span>
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {kpis.demandaTotalTon.toLocaleString('pt-BR')} <span className="text-sm font-medium text-slate-400 font-sans">t</span>
            </div>
            <div className="text-xs text-slate-300 mt-1 font-medium flex items-center gap-1.5">
              <span>{products.length} itens cadastrados</span>
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full" 
              style={{ width: `${Math.min(100, kpis.taxaAtendimentoPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Missing Thickness Warning Alert */}
      {missingThicknesses.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-start gap-4 shadow-lg">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
            <AlertOctagon className="w-5 h-5 shrink-0" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <h4 className="font-extrabold text-sm text-amber-200">
              Alerta de PCP: Demanda Cadastrada sem Bobinas Compatíveis em Estoque
            </h4>
            <p className="text-amber-300/90 leading-relaxed">
              Existem itens com demanda planejada para as seguintes espessuras que não possuem lotes disponíveis de bobina no estoque:
              <strong className="text-amber-100 font-mono ml-1.5 font-bold">
                {missingThicknesses.map(t => `${t} mm`).join(', ')}
              </strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Coils by Thickness (Bar Chart) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
                <Disc className="w-4 h-4 text-blue-400" />
                Estoque de Bobinas por Espessura (Toneladas)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribuição do peso total disponível por bitola de aço</p>
            </div>
            <button
              onClick={onNavigateToData}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>Ver Tabela</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coilsByThickness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  formatter={(val: any) => [`${val} t`, 'Peso Disponível']}
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

        {/* Chart 2: Demand breakdown (Pie Chart) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3.5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-4 h-4 text-purple-400" />
              Demanda por Família de Produtos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Proporção planejada: Tubos vs Perfis U</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={familyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
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
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">{item.name}</div>
                  <div className="font-black text-white font-mono text-sm">{item.value} t</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slitter Utilization Rate and Active Slitters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slitter Efficiency Trend */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Histórico de Aproveitamento das Bobinas (%)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Rendimento de corte por plano programado no Slitter</p>
            </div>
            <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30 shadow-sm">
              Meta ≥ 99.0%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAprov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[95, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Aproveitamento']}
                />
                <Area type="monotone" dataKey="aproveitamento" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAprov)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Demands to Plan */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-blue-400" />
                Demandas Prioritárias para Corte
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Produtos com maior volume para planejar no Slitter</p>
            </div>
            <button
              onClick={() => onNavigateToPlanning()}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>Planejar Todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
            {products
              .filter(p => (p.demandaT || 0) > 0)
              .sort((a, b) => (b.demandaT || 0) - (a.demandaT || 0))
              .slice(0, 5)
              .map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-blue-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white font-mono">{prod.codigo}</span>
                      <MetricsBadge type="familia" value={prod.familia} size="sm" />
                      <span className="text-[11px] text-slate-400 font-mono">Fita: {prod.larguraFita}mm</span>
                    </div>
                    <div className="text-xs text-slate-300 truncate max-w-sm">
                      {prod.descricao}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400 font-mono">{prod.demandaT} t</div>
                      <div className="text-[10px] text-slate-500 font-mono">Esp. {prod.espessura}mm</div>
                    </div>
                    <button
                      onClick={() => onNavigateToPlanning(prod.id)}
                      title="Planejar este produto"
                      className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all shadow-md group-hover:scale-105"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
