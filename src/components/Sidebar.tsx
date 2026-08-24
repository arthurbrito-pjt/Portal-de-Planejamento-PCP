import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'TELA 1 – Dashboard PCP',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Geral'
    },
    {
      id: 'planejamento',
      label: 'TELA 2 – Planejamento 6 Passos',
      shortLabel: 'Planejamento',
      icon: CalendarClock,
      badge: 'Principal'
    },
    {
      id: 'simulacao',
      label: 'TELA 3 – Simulação Slitter',
      shortLabel: 'Simulação',
      icon: Scissors,
      badge: 'Gráfico'
    },
    {
      id: 'ordem-slitter',
      label: 'TELA 4 – Ordem de Slitter (OS)',
      shortLabel: 'Ordens OS',
      icon: ClipboardCheck,
      badge: 'Emissão'
    },
    {
      id: 'relatorios',
      label: 'TELA 5 – Relatórios & Histórico',
      shortLabel: 'Relatórios',
      icon: BarChart3,
      badge: 'Métricas'
    },
    {
      id: 'dados',
      label: 'TELA 6 – Dados & Importar Excel',
      shortLabel: 'Importar Excel',
      icon: Database,
      badge: 'Base'
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos do Sistema
          </div>
          <nav className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Industrial Slitter parameters summary card */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Parâmetros PCP
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Sobra Máx. Permitida:</span>
              <span className="font-mono font-bold text-emerald-400">10 mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Refilo Padrão:</span>
              <span className="font-mono text-slate-300">10 a 18 mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Densidade do Aço:</span>
              <span className="font-mono text-slate-300">7,85 kg/dm³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
        Portal Metalúrgico PCP • 2026
      </div>
    </aside>
  );
};
