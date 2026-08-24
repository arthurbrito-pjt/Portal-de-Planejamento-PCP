import React from 'react';
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
  Weight
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
    { name: 'Perfis U Estruturais', value: Math.round(perfilDemand), color: '#a855f7' }
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
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-800/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Painel Executivo de Planejamento Slitter (PCP)
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Monitore a eficiência de corte das bobinas, estoques disponíveis de matéria-prima, distribuição de demandas e conformidade com a regra de sobra máxima de <strong>10 mm</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToPlanning()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Iniciar Planejamento
          </button>
        </div>
      </div>

      {/* KPI Highlights (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estoque Bobinas */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Estoque Disponível</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Disc className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {kpis.totalBobinasDisponiveis} <span className="text-sm font-normal text-slate-400 font-sans">lotes</span>
            </div>
            <div className="text-xs text-blue-400 font-mono mt-1 font-semibold flex items-center gap-1">
              <Weight className="w-3.5 h-3.5" />
              {kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} toneladas em estoque
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Card 2: Aproveitamento Médio */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Aproveitamento Médio</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {kpis.aproveitamentoMedioPercent}%
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Meta PCP: ≥ 99.0% (Sobra ≤ 10mm)
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, kpis.aproveitamentoMedioPercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Ordens de Slitter */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ordens de Slitter</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {orders.length} <span className="text-sm font-normal text-slate-400 font-sans">OS geradas</span>
            </div>
            <div className="text-xs text-purple-400 mt-1 font-semibold">
              {kpis.totalOrdensAtivas} ordens em andamento/liberadas
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Card 4: Demanda Planejada */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Demanda Total Mês</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {kpis.demandaTotalTon.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400 font-sans">t</span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-medium">
              <span>{products.length} itens cadastrados</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, kpis.taxaAtendimentoPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Missing Thickness Warning Box */}
      {missingThicknesses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-amber-200">
              Alerta de PCP: Espessuras com Demanda sem Bobinas no Estoque
            </h4>
            <p className="text-amber-300/90">
              Existem itens com demanda cadastrada para as seguintes espessuras que não possuem lotes disponíveis de bobina no estoque:
              <strong className="text-amber-100 font-mono ml-1">
                {missingThicknesses.map(t => `${t} mm`).join(', ')}
              </strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Coils by Thickness (Bar Chart) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-blue-400" />
                Estoque de Bobinas por Espessura (Toneladas)
              </h3>
              <p className="text-xs text-slate-400">Distribuição do peso total disponível por bitola de aço</p>
            </div>
            <button
              onClick={onNavigateToData}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Ver Tabela Completa →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coilsByThickness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} t`, 'Peso Disponível']}
                />
                <Bar dataKey="peso" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {coilsByThickness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demand breakdown (Pie Chart) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Demanda por Família de Produtos
            </h3>
            <p className="text-xs text-slate-400">Proporção planejada: Tubos vs Perfis U</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={familyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {familyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} t`, 'Demanda']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {familyChartData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-slate-400 text-[10px]">{item.name}</div>
                  <div className="font-bold text-white font-mono">{item.value} t</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slitter Utilization Rate and Active Slitters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slitter Efficiency Trend */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Histórico de Eficiência de Corte (%)
              </h3>
              <p className="text-xs text-slate-400">Rendimento e aproveitamento dos planos de Slitter</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Meta ≥ 99.0%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAprov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Aproveitamento']}
                />
                <Area type="monotone" dataKey="aproveitamento" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAprov)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Demands to Plan */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Produtos com Demanda Prioritária
              </h3>
              <p className="text-xs text-slate-400">Itens com maior volume pendente para planejar corte</p>
            </div>
            <button
              onClick={() => onNavigateToPlanning()}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Planejar Todos →
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
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{prod.codigo}</span>
                      <MetricsBadge type="familia" value={prod.familia} size="sm" />
                      <span className="text-[11px] text-slate-400 font-mono">Fita: {prod.larguraFita}mm</span>
                    </div>
                    <div className="text-xs text-slate-300 truncate max-w-sm">
                      {prod.descricao}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400 font-mono">{prod.demandaT} t</div>
                      <div className="text-[10px] text-slate-500 font-mono">Esp. {prod.espessura}mm</div>
                    </div>
                    <button
                      onClick={() => onNavigateToPlanning(prod.id)}
                      title="Planejar este produto"
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
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
