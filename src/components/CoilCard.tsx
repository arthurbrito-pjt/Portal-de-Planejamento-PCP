import React from 'react';
import { Coil } from '../types/pcp';
import { Disc, Weight, Maximize2, Layers, CheckCircle2 } from 'lucide-react';
import { MetricsBadge } from './MetricsBadge';

interface CoilCardProps {
  coil: Coil;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
}

export const CoilCard: React.FC<CoilCardProps> = ({
  coil,
  isSelected = false,
  onSelect,
  showSelectButton = true
}) => {
  return (
    <div
      onClick={onSelect}
      className={`glass-card p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-blue-950/70 border-blue-500 shadow-2xl ring-2 ring-blue-500/50 -translate-y-1'
          : 'border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/90 hover:-translate-y-1'
      }`}
    >
      {/* Active selection glowing aura */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all ${
            isSelected 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-500/30' 
              : 'bg-slate-800/80 text-slate-400 border-slate-700/80 group-hover:text-blue-400 group-hover:border-blue-500/40'
          }`}>
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white font-mono tracking-tight">{coil.lote}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono font-semibold">
                {coil.codigo}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Matéria-prima Bobina de Aço
            </p>
          </div>
        </div>

        <MetricsBadge type="status" value={coil.status} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <Maximize2 className="w-3 h-3 text-blue-400" />
            Largura
          </div>
          <div className="font-extrabold text-white font-mono mt-0.5 text-sm">{coil.largura} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <Layers className="w-3 h-3 text-purple-400" />
            Espessura
          </div>
          <div className="font-extrabold text-purple-300 font-mono mt-0.5 text-sm">{coil.espessura} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <Weight className="w-3 h-3 text-emerald-400" />
            Peso
          </div>
          <div className="font-extrabold text-emerald-400 font-mono mt-0.5 text-sm">{coil.peso} t</div>
        </div>
      </div>

      {showSelectButton && (
        <div className="mt-3.5">
          <button
            type="button"
            className={`w-full py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800/90 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 group-hover:border-blue-500/50'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lote Selecionado</span>
              </>
            ) : (
              <span>Selecionar este Lote</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
