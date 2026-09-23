import React from 'react';
import { RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import { CedisaLogo } from './CedisaLogo';

interface NavbarProps {
  activeTabTitle?: string;
  firebaseOnline?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTabTitle = 'Painel Geral',
  firebaseOnline = true,
  onSync,
  isSyncing = false
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Cedisa Brand Accent Ribbon */}
      <div className="h-1 bg-gradient-to-r from-[#0B1F3A] via-orange-500 to-[#0B1F3A]" />

      <div className="h-13 px-6 flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <CedisaLogo variant="horizontal" size="sm" theme="light" />
          <span className="text-slate-300">|</span>
          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider font-mono">PCP</span>
          <span className="text-slate-300">/</span>
          <h2 className="text-sm font-black text-slate-900 tracking-tight truncate">
            {activeTabTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isSyncing
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : firebaseOnline
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
            title={firebaseOnline ? 'Sincronizado com a nuvem — clique para sincronizar agora' : 'Sem conexão com a nuvem — dados salvos apenas localmente'}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
            ) : firebaseOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-600" />
            )}
            <span>{isSyncing ? 'Sincronizando...' : firebaseOnline ? 'Nuvem Online' : 'Offline (local)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
