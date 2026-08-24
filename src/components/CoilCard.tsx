import React from 'react';
import { Coil } from '../types/pcp';
import { Disc, Weight, Maximize2, Layers } from 'lucide-react';
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
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-blue-950/50 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isSelected 
              ? 'bg-blue-600 text-white border-blue-400 shadow-md' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white font-mono">{coil.lote}</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {coil.codigo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Matéria-prima Bobina de Aço
            </p>
          </div>
        </div>

        <MetricsBadge type="status" value={coil.status} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-blue-400" />
            Largura
          </div>
          <div className="font-bold text-white font-mono mt-0.5">{coil.largura} mm</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            Espessura
          </div>
          <div className="font-bold text-white font-mono mt-0.5">{coil.espessura} mm</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Weight className="w-3 h-3 text-emerald-400" />
            Peso
          </div>
          <div className="font-bold text-emerald-400 font-mono mt-0.5">{coil.peso} t</div>
        </div>
      </div>

      {showSelectButton && (
        <div className="mt-3">
          <button
            type="button"
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isSelected ? '✓ Lote Selecionado' : 'Selecionar este Lote'}
          </button>
        </div>
      )}
    </div>
  );
};
