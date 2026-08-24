import React from 'react';
import { 
  Scissors, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Layers, 
  Sparkles,
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
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">
                PORTAL PCP
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                SLITTER 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Planejamento & Otimização de Bobinas de Aço
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Scrap Rule Guarantee Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sobra Máx: ≤ 10 mm</span>
          </div>

          {/* Firebase Status Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
            firebaseOnline
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                firebaseOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                firebaseOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span>{firebaseOnline ? 'Firebase Nuvem' : 'Modo Offline'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sincronizar dados com o Firebase"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
