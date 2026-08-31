import React from 'react';
import { Scissors } from 'lucide-react';

interface NavbarProps {
  firebaseOnline?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              PORTAL DE PLANEJAMENTO PCP
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Planejamento e Otimização de Corte de Bobinas de Aço • Tubos & Perfis
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
