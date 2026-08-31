import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database,
  Layers
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
      title: 'Painel Geral',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'planning' as TabType,
      title: 'Planejamento Slitter',
      icon: Sliders,
      badge: 'Motor'
    },
    {
      id: 'simulation' as TabType,
      title: 'Estúdio de Corte',
      icon: Scissors,
      badge: null
    },
    {
      id: 'order' as TabType,
      title: 'Ordem de Produção (OP)',
      icon: ClipboardCheck,
      badge: ordersCount > 0 ? `${ordersCount}` : null
    },
    {
      id: 'reports' as TabType,
      title: 'Relatórios & Histórico',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'data' as TabType,
      title: 'Gestão de Estoque',
      icon: Database,
      badge: coilsCount > 0 ? `${coilsCount}` : null
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
            PCP
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white tracking-tight truncate">
              PORTAL PCP
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Central de Planejamento Slitter
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navegação Principal
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left text-xs font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.title}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Linha de Produção</span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
          Ativo Local
        </span>
      </div>
    </aside>
  );
};
