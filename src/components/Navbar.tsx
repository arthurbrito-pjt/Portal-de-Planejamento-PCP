import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Layers, 
  FileSpreadsheet, 
  Bell, 
  Sliders, 
  CheckCircle,
  Database
} from 'lucide-react';
import { FirestoreService } from '../firebase/firestoreService';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onRefreshData }) => {
  const [isCloudConnected, setIsCloudConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    checkCloud();
  }, []);

  const checkCloud = async () => {
    const connected = await FirestoreService.testConnection();
    setIsCloudConnected(connected);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await StorageService.syncWithFirestore();
    setIsSyncing(false);
    setIsCloudConnected(result.success);
    setSyncMessage(result.message);
    if (onRefreshData) onRefreshData();
    setTimeout(() => setSyncMessage(''), 4000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 text-white">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                PORTAL DE PLANEJAMENTO <span className="text-blue-400">PCP</span>
              </h1>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                Slitter v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Otimização de Bobinas, Corte & Programação de Fitas
            </p>
          </div>
        </div>

        {/* Right side controls: Firebase status, sync button, quick actions */}
        <div className="flex items-center gap-3">
          {/* Sync notification message */}
          {syncMessage && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 animate-fadeIn">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Firebase Connection Pill */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            title="Clique para sincronizar com o Firebase"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isCloudConnected === true
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : isCloudConnected === false
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            {isCloudConnected === true ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Firebase Conectado
              </span>
            ) : isCloudConnected === false ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Modo Local (Offline)
              </span>
            ) : (
              <span>Verificando Nuvem...</span>
            )}
          </button>

          {/* Quick Action: New Planning */}
          <button
            onClick={() => onSelectTab('planejamento')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Planejamento</span>
          </button>
        </div>
      </div>
    </header>
  );
};
