import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export type TabType = 'dashboard' | 'planning' | 'simulation' | 'order' | 'reports' | 'data';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  ordersCount?: number;
  coilsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  ordersCount = 0,
  coilsCount = 0
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'TELA 1 – Dashboard PCP',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'planning' as TabType,
      label: 'TELA 2 – Planejamento 6P',
      shortLabel: 'Planejamento',
      icon: Sliders,
      badge: 'Motor'
    },
    {
      id: 'simulation' as TabType,
      label: 'TELA 3 – Simulação Slitter',
      shortLabel: 'Simulação',
      icon: Scissors,
      badge: null
    },
    {
      id: 'order' as TabType,
      label: 'TELA 4 – Ordem de Slitter (OS)',
      shortLabel: 'Ordem OS',
      icon: ClipboardCheck,
      badge: ordersCount > 0 ? String(ordersCount) : null
    },
    {
      id: 'reports' as TabType,
      label: 'TELA 5 – Relatórios & Histórico',
      shortLabel: 'Relatórios',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'data' as TabType,
      label: 'TELA 6 – Gestão & Importação',
      shortLabel: 'Dados & Excel',
      icon: Database,
      badge: coilsCount > 0 ? `${coilsCount} lotes` : null
    }
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      {/* Navigation Card */}
      <div className="glass-card p-3 rounded-3xl border border-slate-800/80 bg-slate-950/80 shadow-2xl space-y-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
          Navegação do Sistema
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive 
                    ? 'bg-white/25 text-white' 
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Info Box in Sidebar */}
      <div className="hidden lg:block p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 text-xs space-y-2 shadow-xl">
        <div className="flex items-center gap-2 text-blue-400 font-extrabold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regra de Ouro PCP</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          O motor de otimização combina automaticamente tubos e perfis de mesma bitola para manter a sobra <strong className="text-emerald-400 font-mono">≤ 10 mm</strong>.
        </p>
      </div>
    </aside>
  );
};
