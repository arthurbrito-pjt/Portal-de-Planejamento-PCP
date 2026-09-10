import React from 'react';
import { RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';

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
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">PCP</span>
        <span className="text-slate-300">/</span>
        <h2 className="text-sm font-semibold text-slate-800">
          {activeTabTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            isSyncing
              ? 'bg-blue-50 text-blue-700'
              : firebaseOnline
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
          title={firebaseOnline ? 'Sincronizado com a nuvem — clique para sincronizar agora' : 'Sem conexão com a nuvem — dados salvos apenas localmente'}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : firebaseOnline ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-600" />
          )}
          {isSyncing ? 'Sincronizando...' : firebaseOnline ? 'Sincronizado' : 'Offline (local)'}
        </button>
      </div>
    </header>
  );
};
