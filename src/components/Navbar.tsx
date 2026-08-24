import React from 'react';
import { 
  Scissors, 
  RefreshCw 
} from 'lucide-react';

interface NavbarProps {
  firebaseOnline: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSync,
  isSyncing
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                PORTAL DE PLANEJAMENTO PCP
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] font-mono border border-blue-200">
                SLITTER 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Planejamento e Otimização de Corte de Bobinas de Aço • Tubos & Perfis
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sincronizar dados e recalcular estoque"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Sincronizar Dados</span>
          </button>
        </div>
      </div>
    </header>
  );
};
