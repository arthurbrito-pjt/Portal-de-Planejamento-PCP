import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Scissors,
  ClipboardCheck,
  BarChart3,
  Database,
  Bot,
  Clock
} from 'lucide-react';
import { CedisaLogo } from './CedisaLogo';

export type TabType = 'dashboard' | 'planning' | 'simulation' | 'order' | 'reports' | 'cotacao' | 'data' | 'ai';

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
      id: 'cotacao' as TabType,
      title: 'Gestão de Estoque',
      icon: Clock,
      badge: 'D+2'
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
      title: 'Importador & Cadastros',
      icon: Database,
      badge: coilsCount > 0 ? `${coilsCount}` : null
    },
    {
      id: 'ai' as TabType,
      title: 'Agente de IA',
      icon: Bot,
      badge: 'Novo'
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-gradient-to-b from-[#0B1F3A] via-[#08182D] to-[#05101E] text-slate-200 border-r border-[#163866]/60 flex flex-col justify-between shrink-0 min-h-screen shadow-xl">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#163866]/60 bg-[#071527]/50">
          <CedisaLogo variant="horizontal" theme="white" size="md" />
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="uppercase tracking-wider font-semibold text-slate-300">Portal PCP</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
              Slitter Cedisa
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-400/90 font-mono flex items-center justify-between">
            <span>Navegação Fabril</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
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
                    ? 'bg-[#163866] text-white shadow-md border-l-4 border-orange-500'
                    : 'text-slate-300 hover:text-white hover:bg-[#163866]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span className="truncate">{item.title}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2 shadow-sm ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
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
      <div className="p-4 border-t border-[#163866]/60 bg-[#05101E]/80 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">CEDISA S/A</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Linha Ativa
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Central de Aço — Serra / ES
        </div>
      </div>
    </aside>
  );
};
