import React, { useState, useMemo } from 'react';
import { 
  Disc, 
  TrendingUp, 
  Layers, 
  Scissors, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Percent, 
  Sparkles, 
  CheckCircle, 
  Search, 
  Boxes 
} from 'lucide-react';
import { Coil, Product, SlitterOrder, PCPKPIs, SlitterDemandItem } from '../types/pcp';
import { ReadinessService, SlitterProductionProgram } from '../services/readinessService';
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  coils,
  products,
  orders,
  onNavigateToPlanning,
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const [activeBoardView, setActiveBoardView] = useState<'slitter_programs' | 'demand_readiness'>('slitter_programs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');
  const [scrapFilter, setScrapFilter] = useState<'TODOS' | 'IDEAL' | 'BAIXO' | 'ALTO'>('TODOS');

  // Generate Slitter Cutting Programs (Bobina -> Slitter)
  const slitterPrograms = useMemo(() => {
    return ReadinessService.generateSlitterPrograms(products, coils);
  }, [products, coils]);

  // Slitter demand analysis (aggregated from Tubos and Perfis)
  const slitterDemands = useMemo(() => {
    const list = ReadinessService.analyzeSlitters(products, coils);
    return ReadinessService.sortSlittersByReadiness(list);
  }, [products, coils]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    coils.forEach(c => set.add(c.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [coils]);

  // Total Slitter Demand Ton
  const totalSlitterDemandTon = useMemo(() => {
    return Number(slitterDemands.reduce((acc, s) => acc + s.totalDemandaT, 0).toFixed(2));
  }, [slitterDemands]);

  // Filtered Slitter Programs
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

  // Filtered Slitter Demands
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
    <div className="space-y-6 pb-16 animate-fadeIn w-full">
      {/* Top Cockpit Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Central de Programação de Slitters & Matéria-Prima
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Programação e controle de produção de <strong>Slitters</strong> a partir de bobinas de aço matrizes, com demanda calculada pela soma das necessidades de perfis e tubos (refilo padrão de 10 a 18 mm).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToPlanning()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Novo Planejamento de Slitter (6 Passos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Estoque de Bobinas</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {kpis.totalBobinasDisponiveis} <span className="text-xs font-sans text-slate-500 font-normal">lotes disponíveis</span>
          </div>
          <div className="text-xs text-blue-700 font-mono mt-0.5 font-bold">
            {kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t em estoque
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Aproveitamento Médio</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {kpis.aproveitamentoMedioPercent}%
          </div>
          <div className="text-xs text-slate-600 mt-0.5 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Refilo Padrão: 10 a 18 mm (1,5%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Ordens de Produção (OP)</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {orders.length} <span className="text-xs font-sans text-slate-500 font-normal">OP geradas</span>
          </div>
          <div className="text-xs text-purple-700 mt-0.5 font-bold">
            {kpis.totalOrdensAtivas} em andamento
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Demanda Total de Slitters</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-2">
            {totalSlitterDemandTon.toLocaleString('pt-BR')} t
          </div>
          <div className="text-xs text-slate-600 mt-0.5 font-medium">
            {slitterDemands.length} tipos de slitters cadastrados
          </div>
        </div>
      </div>

      {/* Main Mode Tabs & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Sub-view switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5">
          <button
            onClick={() => setActiveBoardView('slitter_programs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeBoardView === 'slitter_programs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Slitters Prontos para Corte ({slitterPrograms.length} programas)</span>
          </button>

          <button
            onClick={() => setActiveBoardView('demand_readiness')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeBoardView === 'demand_readiness'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Fila de Slitters a Produzir ({slitterDemands.length} slitters)</span>
          </button>
        </div>

        {/* Search & Bitola Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código ou nome do slitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <select
            value={thicknessFilter}
            onChange={(e) => setThicknessFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
          >
            <option value="TODOS">Todas as Bitolas</option>
            {uniqueThicknesses.map(t => (
              <option key={t} value={t}>{t} mm</option>
            ))}
          </select>

          <div className="flex rounded-xl bg-slate-100 p-1">
            {[
              { id: 'TODOS', label: 'Todos os Slitters' },
              { id: 'IDEAL', label: '✓ Conforme (10 a 18 mm)' },
              { id: 'ALTO', label: 'Sobra > 18 mm' }
            ].map(y => (
              <button
                key={y.id}
                onClick={() => setScrapFilter(y.id as any)}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  scrapFilter === y.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: SLITTER PROGRAMS */}
      {activeBoardView === 'slitter_programs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2 font-bold">
            <span>Exibindo <strong>{filteredPrograms.length}</strong> combinações de corte otimizadas prontas para execução</span>
            <span className="text-emerald-700">✓ Regra PCP: Refilo padrão de 10 a 18 mm (~1,5%)</span>
          </div>

          <div className="space-y-4">
            {filteredPrograms.map((prog, idx) => {
              const coil = prog.coil;
              const isIdeal = prog.sobraMm >= 10 && prog.sobraMm <= 18;

              return (
                <div
                  key={prog.id || idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md space-y-4 group"
                >
                  {/* Top Bar: Coil info + Performance Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
                    {/* Left: Coil Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                        <Disc className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                            BOBINA MATRIZ
                          </span>
                          <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                            LOTE: {coil.lote}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono font-bold">
                            {coil.codigo}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold">
                            {coil.largura} x {coil.espessura} mm
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Estoque de Matéria-Prima: <strong className="text-emerald-700 font-black">{coil.peso} t</strong> disponível
                        </p>
                      </div>
                    </div>

                    {/* Right: Yield Badges & Action Buttons */}
                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono pr-2">
                        <div className="text-xs text-slate-400 uppercase font-bold">Aproveitamento Slitter</div>
                        <div className={`text-base font-black ${isIdeal ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {prog.aproveitamentoPercent}% ({prog.sobraMm}mm refilo)
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenProgramSimulation(prog)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl border border-slate-200 transition-all hover:scale-105"
                      >
                        <Scissors className="w-4 h-4 text-blue-600" />
                        <span>Simular Slitter</span>
                      </button>

                      <button
                        onClick={() => onOpenProgramOrder(prog)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Emitir Ordem de Produção (OP)</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle: Slitter Diagram Bar */}
                  <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between text-xs font-mono text-slate-700 font-bold">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <Scissors className="w-4 h-4 text-blue-600" />
                        <span>PRODUÇÃO NO SLITTER — Montagem de Facas ({prog.totalFitas} fitas):</span>
                      </span>
                      <span className="text-slate-900 font-black">
                        {prog.materialsProduced.map(m => `${m.quantidadeFitas}x fita ${m.fitaLargura}mm`).join(' + ')} 
                        {prog.sobraMm > 0 ? ` + [${prog.sobraMm}mm refilo]` : ''} = {coil.largura}mm
                      </span>
                    </div>

                    {/* Graphical strip bar */}
                    <div className="w-full h-12 bg-slate-200 rounded-xl border-2 border-slate-300 p-1 flex items-stretch overflow-hidden shadow-inner">
                      {prog.materialsProduced.map((m, mIdx) => {
                        const widthPct = (m.larguraTotal / coil.largura) * 100;
                        const isMain = m.finalidade === 'PRINCIPAL';

                        return (
                          <div
                            key={mIdx}
                            style={{ width: `${widthPct}%` }}
                            className={`h-full flex items-center justify-between px-3 text-white font-mono text-xs font-black border-r-2 border-white rounded-lg transition-all shadow-sm ${
                              isMain ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                            title={`${m.quantidadeFitas}x ${m.codigoSlitter} - ${m.nomeSlitter} (${m.fitaLargura}mm)`}
                          >
                            <span className="truncate drop-shadow-sm font-black">
                              {m.quantidadeFitas}x {m.codigoSlitter} ({m.fitaLargura}mm)
                            </span>
                            <span className="text-[11px] opacity-95 shrink-0 ml-1 drop-shadow-sm bg-black/20 px-1.5 py-0.5 rounded">
                              {m.pesoAlocadoTon}t
                            </span>
                          </div>
                        );
                      })}

                      {prog.sobraMm > 0 && (
                        <div
                          style={{ width: `${(prog.sobraMm / coil.largura) * 100}%` }}
                          className={`h-full border border-dashed text-[11px] font-mono font-black flex items-center justify-center px-1 rounded-lg ${
                            isIdeal 
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900' 
                              : prog.sobraMm < 10 
                              ? 'bg-amber-100 border-amber-400 text-amber-900' 
                              : 'bg-red-100 border-red-400 text-red-900'
                          }`}
                        >
                          {prog.sobraMm}mm refilo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Slitter Strips to be Produced & Destination Materials */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Fitas de Slitter Produzidas & Materiais de Destino:
                      </span>
                      <span className="text-slate-500 font-normal normal-case">
                        Fita do Slitter cortada na bobina e produto final que utiliza este material
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {prog.materialsProduced.map((mat, matIdx) => {
                        const isMain = mat.finalidade === 'PRINCIPAL';

                        return (
                          <div
                            key={matIdx}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isMain
                                ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300/40'
                                : 'bg-purple-50/70 border-purple-200 ring-1 ring-purple-300/40'
                            }`}
                          >
                            {/* Slitter Specifications */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                              <span className="text-[10px] font-mono font-black text-slate-500 uppercase block tracking-wider">
                                ✂️ SLITTER A PRODUZIR:
                              </span>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <span className="text-sm font-black font-mono text-blue-900">{mat.codigoSlitter}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-black font-mono ${
                                  isMain ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {mat.finalidade}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 mt-1 font-bold">
                                {mat.nomeSlitter}
                              </p>
                              <div className="text-[11px] font-mono text-slate-600 mt-1">
                                Fita: <strong className="text-slate-900">{mat.fitaLargura} x {coil.espessura} mm</strong>
                              </div>
                            </div>

                            {/* Destination Material */}
                            <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70">
                              <span className="text-[10px] font-mono font-black text-slate-500 uppercase block tracking-wider">
                                🏭 MATERIAL DE DESTINO:
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-slate-900 font-mono">{mat.product.codigo}</span>
                                <MetricsBadge type="familia" value={mat.product.familia} size="sm" />
                              </div>
                              <p className="text-xs text-slate-700 mt-1 font-semibold line-clamp-1">
                                {mat.product.descricao}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-xs font-mono">
                              <div className="text-center bg-white p-2 rounded-xl border border-slate-200/60">
                                <span className="text-slate-400 block text-[10px] font-bold">QTD ROLOS</span>
                                <strong className="text-slate-900 font-black">{mat.quantidadeFitas}x fitas</strong>
                              </div>
                              <div className="text-center bg-white p-2 rounded-xl border border-slate-200/60">
                                <span className="text-slate-400 block text-[10px] font-bold">PESO TOTAL</span>
                                <strong className="text-emerald-700 font-black">{mat.pesoAlocadoTon} t</strong>
                              </div>
                              <div className="text-center bg-white p-2 rounded-xl border border-slate-200/60">
                                <span className="text-slate-400 block text-[10px] font-bold">METRAGEM</span>
                                <strong className="text-blue-700 font-black">{mat.metrosEstimados} m</strong>
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

      {/* VIEW 2: SLITTER DEMAND READINESS */}
      {activeBoardView === 'demand_readiness' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Fila de Slitters a Produzir ({filteredSlitterDemands.length} tipos de slitters cadastrados)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demanda de cada <strong>Slitter</strong> com relação dos <strong>Materiais de Destino</strong> (Perfis e Tubos).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-mono sticky top-0 bg-white z-10 font-bold">
                  <th className="py-3 px-3">Status Matéria-Prima</th>
                  <th className="py-3 px-3">Código Slitter</th>
                  <th className="py-3 px-3">Nome / Descrição do Slitter</th>
                  <th className="py-3 px-3">Materiais de Destino</th>
                  <th className="py-3 px-3 text-right">Largura (mm)</th>
                  <th className="py-3 px-3 text-right">Espessura (mm)</th>
                  <th className="py-3 px-3 text-right bg-amber-50/70 text-amber-900 font-black">Demanda Total (t)</th>
                  <th className="py-3 px-3 text-right">Estoque Matéria-Prima</th>
                  <th className="py-3 px-3 text-center">Melhor Bobina Matriz</th>
                  <th className="py-3 px-3 text-right">Aprov. Slitter</th>
                  <th className="py-3 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredSlitterDemands.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      {s.status === 'PRONTO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Pronto ({s.compatibleLotCount} lotes)
                        </span>
                      ) : s.status === 'PARCIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                          Parcial ({s.coveragePercent}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 text-red-800 border border-red-300 text-[10px] font-bold">
                          Sem Bobina
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-black text-blue-700">
                      {s.codigoSlitter}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{s.nomeSlitter}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans">
                      <div className="flex flex-wrap items-center gap-1 max-w-xs">
                        {s.produtos.slice(0, 2).map((item, iIdx) => (
                          <span key={iIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold" title={item.product.descricao}>
                            {item.product.codigo} ({item.demandaT}t)
                          </span>
                        ))}
                        {s.produtos.length > 2 && (
                          <span className="text-[10px] text-slate-500 font-bold">+{s.produtos.length - 2} itens</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900">{s.larguraFita} mm</td>
                    <td className="py-3.5 px-3 text-right text-purple-800 font-bold">{s.espessura} mm</td>
                    <td className="py-3.5 px-3 text-right font-black text-amber-700 bg-amber-50/40 text-sm">
                      {s.totalDemandaT} t
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-700">{s.totalCompatibleWeightTon} t</td>
                    <td className="py-3.5 px-3 text-center">
                      {s.bestCoil ? (
                        <span className="text-blue-700 font-black">{s.bestCoil.lote} ({s.bestCoil.largura}mm)</span>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                      {s.estimatedYieldPercent > 0 ? `${s.estimatedYieldPercent}%` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onNavigateToPlanning(s.mainProduct.id)}
                        disabled={s.compatibleLotCount === 0}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-black transition-all"
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
      )}
    </div>
  );
};

