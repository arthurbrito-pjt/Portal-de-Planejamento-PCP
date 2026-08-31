import React from 'react';
import { Scissors, RefreshCw, CheckCircle2 } from 'lucide-react';

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
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 font-mono">PCP</span>
        <span className="text-slate-300">/</span>
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
          {activeTabTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Refilo Conforme (10-18mm)
        </span>
      </div>
    </header>
  );
};
