import React from 'react';
import { Coil } from '../types/pcp';
import { Disc, Weight, Maximize2, Layers, CheckCircle2 } from 'lucide-react';
import { MetricsBadge } from './MetricsBadge';

interface CoilCardProps {
  coil: Coil;
  isSelected?: boolean;
  isLocked?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
  compatibilityBadge?: React.ReactNode;
}

export const CoilCard: React.FC<CoilCardProps> = ({
  coil,
  isSelected = false,
  isLocked = false,
  onSelect,
  showSelectButton = true,
  compatibilityBadge
}) => {
  const isClickable = isSelected || !isLocked;

  return (
    <div
      onClick={() => {
        if (isClickable && onSelect) onSelect();
      }}
      className={`p-4 rounded-xl border transition-colors cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-500/20'
          : isLocked
          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
          : 'bg-white border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
          }`}>
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 font-mono">{coil.lote}</h4>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                {coil.codigo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Matéria-prima bobina de aço
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <MetricsBadge type="status" value={coil.status} size="sm" />
          {coil.statusContabil && (
            <MetricsBadge type="contabil" value={coil.statusContabil} size="sm" />
          )}
        </div>
      </div>

      {compatibilityBadge && (
        <div className="mt-2.5">{compatibilityBadge}</div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
        <div className="p-2 rounded-lg bg-slate-50 text-center">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
            <Maximize2 className="w-3 h-3 text-blue-600" />
            Largura
          </div>
          <div className="font-semibold text-slate-800 font-mono mt-0.5">{coil.largura} mm</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 text-center">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
            <Layers className="w-3 h-3 text-violet-600" />
            Espessura
          </div>
          <div className="font-semibold text-violet-700 font-mono mt-0.5">{coil.espessura} mm</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 text-center">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
            <Weight className="w-3 h-3 text-emerald-600" />
            Peso
          </div>
          <div className="font-semibold text-emerald-700 font-mono mt-0.5">{coil.peso} t</div>
        </div>
      </div>

      {showSelectButton && (
        <div className="mt-3">
          <button
            type="button"
            className={`w-full py-2 px-3.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-blue-600 hover:bg-red-600 text-white'
                : isLocked
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="group-hover:hidden">Lote selecionado</span>
                <span className="hidden group-hover:inline">Desselecionar lote</span>
              </>
            ) : isLocked ? (
              <span>Demanda já atendida</span>
            ) : (
              <span>Selecionar este lote</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
