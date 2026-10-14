import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
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
import { FerramentalAbc } from './dashboard/FerramentalAbc';
import { ProntidaoDemanda } from './dashboard/ProntidaoDemanda';

export type DashboardSubview = 'agenda-3-dias' | 'ferramental-abc' | 'prontidao-demanda';

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

const SECTIONS: { id: '' | DashboardSubview; label: string; hint: string; icon: React.ElementType }[] = [
  { id: '', label: 'Visão Geral', hint: 'O que fazer agora', icon: LayoutDashboard },
  { id: 'agenda-3-dias', label: 'Horizonte 3 Dias', hint: 'Programação', icon: Calendar },
  { id: 'ferramental-abc', label: 'Curva ABC', hint: 'Ferramentais', icon: Wrench },
  { id: 'prontidao-demanda', label: 'Carteira', hint: 'Demanda x estoque', icon: Boxes }
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
  onNavigateToOrders,
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const currentSection = SECTIONS.find(sec => sec.id === (activeSubview || '')) || SECTIONS[0];
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 pb-16 animate-fadeIn w-full">
      {/* Cabeçalho: onde estou + ação principal */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400" aria-label="Você está em">
            <button
              onClick={() => onNavigateToSubview('')}
              className={activeSubview ? 'hover:text-[#0B1F3A] transition-colors' : 'text-slate-500 cursor-default'}
            >
              Painel Geral
            </button>
            {activeSubview && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-orange-600">{currentSection.label}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight flex items-center gap-3">
            {activeSubview && (
              <button
                onClick={() => onNavigateToSubview('')}
                className="p-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#0B1F3A] text-[#0B1F3A] transition-colors"
                title="Voltar à Visão Geral"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {activeSubview ? currentSection.label : 'Visão Geral da Produção'}
          </h1>
          <p className="text-xs text-slate-500 capitalize">{today}</p>
        </div>

        <button
          onClick={() => onNavigateToPlanning()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-black shadow-md shadow-orange-500/20 transition-all group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Novo Planejamento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navegação do painel — a seção atual fica destacada */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const isActive = (activeSubview || '') === sec.id;
          return (
            <button
              key={sec.id || 'home'}
              onClick={() => onNavigateToSubview(sec.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all ${
                isActive ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
              <span className="min-w-0">
                <span className="block text-xs font-black truncate">{sec.label}</span>
                <span className={`block text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{sec.hint}</span>
              </span>
              {isActive && <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-orange-500" />}
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
          onNavigateToOrders={onNavigateToOrders}
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

      {activeSubview === 'ferramental-abc' && (
        <FerramentalAbc ferramentais={ferramentais} products={products} />
      )}

      {activeSubview === 'prontidao-demanda' && (
        <ProntidaoDemanda products={products} coils={coils} intermediarySlitters={intermediarySlitters} onNavigateToPlanning={onNavigateToPlanning} />
      )}
    </div>
  );
};
