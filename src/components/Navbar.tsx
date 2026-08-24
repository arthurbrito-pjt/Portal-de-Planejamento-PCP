import React from 'react';
import { 
  Scissors, 
  RefreshCw, 
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  firebaseOnline: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  firebaseOnline,
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
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] font-mono border border-blue-200">
                SLITTER 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Otimização de Corte de Bobinas de Aço • Tubos & Perfis
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Scrap Rule Guarantee Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sobra Máxima Permitida: ≤ 10 mm</span>
          </div>

          {/* Firebase Status Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
            firebaseOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                firebaseOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                firebaseOnline ? 'bg-emerald-600' : 'bg-amber-600'
              }`} />
            </span>
            <span>{firebaseOnline ? 'Nuvem Conectada' : 'Modo Local'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sincronizar dados"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
