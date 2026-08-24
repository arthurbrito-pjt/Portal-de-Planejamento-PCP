import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database,
  Sparkles
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
      num: '01',
      title: 'Programação de Slitters',
      subtitle: 'Painel Geral & Combinações',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'planning' as TabType,
      num: '02',
      title: 'Planejamento em 6 Passos',
      subtitle: 'Assistente de Corte & Otimização',
      icon: Sliders,
      badge: 'Motor'
    },
    {
      id: 'simulation' as TabType,
      num: '03',
      title: 'Estúdio do Slitter',
      subtitle: 'Ajuste de Facas & Simulação',
      icon: Scissors,
      badge: null
    },
    {
      id: 'order' as TabType,
      num: '04',
      title: 'Ordem de Slitter (OS)',
      subtitle: 'Folha de Produção & Liberação',
      icon: ClipboardCheck,
      badge: ordersCount > 0 ? `${ordersCount} OS` : null
    },
    {
      id: 'reports' as TabType,
      num: '05',
      title: 'Relatórios & Histórico',
      subtitle: 'Métricas de Perdas & Produção',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'data' as TabType,
      num: '06',
      title: 'Gestão & Importador Excel',
      subtitle: 'Bobinas, Produtos e Nuvem',
      icon: Database,
      badge: coilsCount > 0 ? `${coilsCount} bobinas` : null
    }
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4">
      {/* Navigation Card */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
          Menu de Produção
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      TELA {item.num}
                    </span>
                  </div>
                  <div className="text-xs font-black truncate">
                    {item.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ml-2 ${
                  isActive 
                    ? 'bg-white/25 text-white' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Info Box in Sidebar */}
      <div className="hidden lg:block p-4 rounded-3xl bg-blue-50/90 border border-blue-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-blue-900 font-black text-[11px]">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Regra de Ouro PCP</span>
        </div>
        <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
          Combinações automáticas entre tubos e perfis para garantir sobra máxima <strong className="text-emerald-700 font-mono font-black">≤ 10 mm</strong>.
        </p>
      </div>
    </aside>
  );
};
