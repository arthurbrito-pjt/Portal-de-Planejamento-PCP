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
}

export const CoilCard: React.FC<CoilCardProps> = ({
  coil,
  isSelected = false,
  isLocked = false,
  onSelect,
  showSelectButton = true
}) => {
  const isClickable = isSelected || !isLocked;

  return (
    <div
      onClick={() => {
        if (isClickable && onSelect) onSelect();
      }}
      className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/40 -translate-y-1'
          : isLocked
          ? 'bg-slate-50/60 border-slate-200 opacity-70 hover:border-slate-300 cursor-not-allowed'
          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all ${
            isSelected 
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20' 
              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600'
          }`}>
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 font-mono tracking-tight">{coil.lote}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-bold">
                {coil.codigo}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Matéria-prima Bobina de Aço
            </p>
          </div>
        </div>

        <MetricsBadge type="status" value={coil.status} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-bold uppercase">
            <Maximize2 className="w-3 h-3 text-blue-600" />
            Largura
          </div>
          <div className="font-black text-slate-900 font-mono mt-0.5 text-sm">{coil.largura} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-bold uppercase">
            <Layers className="w-3 h-3 text-purple-600" />
            Espessura
          </div>
          <div className="font-black text-purple-800 font-mono mt-0.5 text-sm">{coil.espessura} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-bold uppercase">
            <Weight className="w-3 h-3 text-emerald-600" />
            Peso
          </div>
          <div className="font-black text-emerald-700 font-mono mt-0.5 text-sm">{coil.peso} t</div>
        </div>
      </div>

      {showSelectButton && (
        <div className="mt-3.5">
          <button
            type="button"
            className={`w-full py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-sm'
                : isLocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lote Selecionado</span>
              </>
            ) : isLocked ? (
              <span>🔒 Demanda Já Atendida</span>
            ) : (
              <span>Selecionar este Lote</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
