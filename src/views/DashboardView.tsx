import React from 'react';
import {
  Disc,
  TrendingUp,
  Scissors,
  Sparkles,
  ArrowRight,
  Calendar,
  Wrench,
  Boxes
} from 'lucide-react';
import {
  Coil,
  Product,
  SlitterOrder,
  PCPKPIs,
  Ferramental,
  SlitterIntermediaryItem
} from '../types/pcp';
import { SlitterProductionProgram } from '../services/readinessService';
import { DashboardHome } from './dashboard/DashboardHome';
import { AgendaTresDias } from './dashboard/AgendaTresDias';
import { ProgramasSlitter } from './dashboard/ProgramasSlitter';
import { FerramentalAbc } from './dashboard/FerramentalAbc';
import { ProntidaoDemanda } from './dashboard/ProntidaoDemanda';

export type DashboardSubview = 'agenda-3-dias' | 'programas-slitter' | 'ferramental-abc' | 'prontidao-demanda';

interface DashboardViewProps {
  kpis: PCPKPIs;
  coils: Coil[];
  products: Product[];
  orders: SlitterOrder[];
  ferramentais?: Ferramental[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  activeSubview?: string | null;
  onNavigateToSubview: (subview: string) => void;
  onNavigateToPlanning: (productId?: string) => void;
  onNavigateToOrders: () => void;
  onNavigateToData: () => void;
  onNavigateToCotacao?: () => void;
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
}

const SUBVIEW_TABS: { id: DashboardSubview; label: string; icon: React.ElementType }[] = [
  { id: 'agenda-3-dias', label: 'Horizonte 3 Dias', icon: Calendar },
  { id: 'programas-slitter', label: 'Combinações Otimizadas', icon: Scissors },
  { id: 'ferramental-abc', label: 'Curva ABC Ferramentais', icon: Wrench },
  { id: 'prontidao-demanda', label: 'Carteira Consolidada', icon: Boxes }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  coils,
  products,
  orders,
  ferramentais = [],
  intermediarySlitters = [],
  activeSubview,
  onNavigateToSubview,
  onNavigateToPlanning,
  onNavigateToData,
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  return (
    <div className="space-y-4 pb-16 animate-fadeIn w-full">
      {/* Header compacto: título + ação primária na mesma linha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-orange-600" />
            <strong className="text-slate-800 font-semibold">{kpis.totalBobinasDisponiveis}</strong> bobinas ({kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t)
          </span>
          <span className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#0B1F3A]" />
            <strong className="text-slate-800 font-semibold">{orders.length}</strong> OPs geradas
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <strong className="text-emerald-700 font-semibold">{kpis.aproveitamentoMedioPercent}%</strong> aproveitamento médio
          </span>
        </div>

        <button
          onClick={() => onNavigateToPlanning()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-black shadow-md shadow-black/10 border border-[#163866] transition-all group"
        >
          <Sparkles className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
          <span>Novo Planejamento de Slitter</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
        </button>
      </div>

      {/* Navegação secundária — sub-painéis com dados detalhados, cada um com rota própria */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => onNavigateToSubview('')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
            !activeSubview ? 'bg-[#0B1F3A] text-white shadow-sm ring-1 ring-orange-500/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${!activeSubview ? 'text-orange-400' : 'text-slate-400'}`} />
          <span>O que fazer agora</span>
        </button>

        <span className="text-slate-300 text-xs px-1">·</span>
        <span className="text-[11px] text-slate-400 uppercase tracking-wide px-1 font-bold">Dados detalhados:</span>

        {SUBVIEW_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubview === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigateToSubview(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                isActive ? 'bg-[#0B1F3A] text-white shadow-sm ring-1 ring-orange-500/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {!activeSubview && (
        <DashboardHome
          kpis={kpis}
          products={products}
          coils={coils}
          orders={orders}
          ferramentais={ferramentais}
          intermediarySlitters={intermediarySlitters}
          onNavigateToPlanning={onNavigateToPlanning}
          onOpenProgramSimulation={onOpenProgramSimulation}
          onOpenProgramOrder={onOpenProgramOrder}
          onNavigateToSubview={onNavigateToSubview}
          onNavigateToData={onNavigateToData}
        />
      )}

      {activeSubview === 'agenda-3-dias' && (
        <AgendaTresDias
          products={products}
          coils={coils}
          orders={orders}
          intermediarySlitters={intermediarySlitters}
          onOpenProgramSimulation={onOpenProgramSimulation}
          onOpenProgramOrder={onOpenProgramOrder}
        />
      )}

      {activeSubview === 'programas-slitter' && (
        <ProgramasSlitter
          products={products}
          coils={coils}
          intermediarySlitters={intermediarySlitters}
          onOpenProgramSimulation={onOpenProgramSimulation}
          onOpenProgramOrder={onOpenProgramOrder}
        />
      )}

      {activeSubview === 'ferramental-abc' && (
        <FerramentalAbc ferramentais={ferramentais} products={products} />
      )}

      {activeSubview === 'prontidao-demanda' && (
        <ProntidaoDemanda products={products} coils={coils} intermediarySlitters={intermediarySlitters} onNavigateToPlanning={onNavigateToPlanning} />
      )}
    </div>
  );
};
