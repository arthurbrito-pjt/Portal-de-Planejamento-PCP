import React, { useState } from 'react';
import { SlitterStrip, Coil } from '../types/pcp';
import { Layers, Scissors, AlertTriangle, CheckCircle2, Plus, Minus, Trash2, Info } from 'lucide-react';

interface SlitterVisualizerProps {
  coil: Coil;
  strips: SlitterStrip[];
  onAddStrip?: (productId?: string) => void;
  onRemoveStrip?: (stripId: string) => void;
  onUpdateStripWidth?: (stripId: string, delta: number) => void;
  interactive?: boolean;
}

export const SlitterVisualizer: React.FC<SlitterVisualizerProps> = ({
  coil,
  strips,
  onAddStrip,
  onRemoveStrip,
  onUpdateStripWidth,
  interactive = false
}) => {
  const [hoveredStrip, setHoveredStrip] = useState<SlitterStrip | null>(null);

  const totalUsedWidth = strips.reduce((acc, s) => acc + s.largura, 0);
  const scrapWidth = Math.max(0, coil.largura - totalUsedWidth);
  const isOverflow = totalUsedWidth > coil.largura;
  const overflowAmount = isOverflow ? totalUsedWidth - coil.largura : 0;
  
  const scrapPercent = Number(((scrapWidth / coil.largura) * 100).toFixed(2));
  const utilizationPercent = Number(((Math.min(totalUsedWidth, coil.largura) / coil.largura) * 100).toFixed(2));
  const scrapWeightTon = Number((coil.peso * (scrapWidth / coil.largura)).toFixed(3));
  const usedWeightTon = Number((coil.peso * (Math.min(totalUsedWidth, coil.largura) / coil.largura)).toFixed(3));

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-5">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Simulação de Corte no Slitter
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                Bobina {coil.largura} mm | {coil.espessura} mm | {coil.peso} t
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Lote: <span className="text-blue-400 font-mono font-medium">{coil.lote}</span> ({coil.codigo})
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {scrapWidth <= 10 && !isOverflow ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aproveitamento Ideal (Sobra ≤ 10mm)</span>
            </div>
          ) : isOverflow ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>Largura Excedida em {overflowAmount} mm!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Sobra Superior a 10 mm ({scrapWidth} mm)</span>
            </div>
          )}

          <div className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold font-mono">
            {utilizationPercent}% Útil
          </div>
        </div>
      </div>

      {/* Main Visual Representation: |240|240|240|240|240|50| */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-mono px-1">
          <span>0 mm</span>
          <span className="text-slate-300 font-bold">Largura Total da Bobina: {coil.largura} mm</span>
          <span>{coil.largura} mm</span>
        </div>

        {/* Coil Steel Bar Container */}
        <div className="relative w-full h-24 bg-slate-950 rounded-xl p-1.5 border-2 border-slate-700/80 shadow-inner flex items-stretch overflow-hidden">
          {/* Strips */}
          {strips.map((strip, idx) => {
            const widthPercent = (strip.largura / coil.largura) * 100;
            const isHovered = hoveredStrip?.id === strip.id;

            return (
              <div
                key={strip.id || idx}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: strip.cor
                }}
                onMouseEnter={() => setHoveredStrip(strip)}
                onMouseLeave={() => setHoveredStrip(null)}
                className={`relative group h-full flex flex-col justify-between p-1.5 border-r border-slate-900/60 transition-all duration-150 cursor-pointer coil-texture strip-shadow ${
                  isHovered ? 'brightness-125 ring-2 ring-white z-10 scale-[1.02]' : 'hover:brightness-110'
                }`}
              >
                {/* Strip Header */}
                <div className="flex items-center justify-between text-[10px] font-bold text-white drop-shadow">
                  <span className="bg-black/40 px-1 rounded font-mono">#{idx + 1}</span>
                  {interactive && onRemoveStrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStrip(strip.id);
                      }}
                      title="Remover fita"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-600 rounded bg-black/60 text-white transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Strip Width & Code */}
                <div className="text-center overflow-hidden">
                  <div className="text-xs font-black text-white tracking-wider font-mono drop-shadow-md">
                    {strip.largura} mm
                  </div>
                  <div className="text-[9px] text-white/90 truncate font-medium drop-shadow">
                    {strip.productCode}
                  </div>
                </div>

                {/* Strip Weight */}
                <div className="text-[9px] text-right font-mono text-white/90 drop-shadow">
                  {strip.pesoTon} t
                </div>
              </div>
            );
          })}

          {/* Scrap / Sobra Bar */}
          {scrapWidth > 0 && !isOverflow && (
            <div
              style={{ width: `${scrapPercent}%` }}
              className={`h-full flex flex-col justify-center items-center p-1 border-dashed border-2 transition-all ${
                scrapWidth <= 10
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-widest text-center">
                Sobra
              </div>
              <div className="text-xs font-black font-mono">
                {scrapWidth} mm
              </div>
              <div className="text-[9px] font-mono opacity-80">
                {scrapPercent}% ({scrapWeightTon} t)
              </div>
            </div>
          )}

          {/* Overflow Warning Bar */}
          {isOverflow && (
            <div
              style={{ width: '10%' }}
              className="h-full flex flex-col justify-center items-center p-1 bg-red-950/90 border-2 border-red-500 text-red-300 animate-pulse"
            >
              <span className="text-[10px] font-bold">+{overflowAmount}mm</span>
            </div>
          )}
        </div>

        {/* Ruler ticks visualization */}
        <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
          <span>| 0</span>
          <span>| {Math.round(coil.largura * 0.25)}</span>
          <span>| {Math.round(coil.largura * 0.5)}</span>
          <span>| {Math.round(coil.largura * 0.75)}</span>
          <span>| {coil.largura} mm</span>
        </div>
      </div>

      {/* Hovered Strip Detail Tooltip / Card */}
      {hoveredStrip && (
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredStrip.cor }}
            />
            <div>
              <span className="font-bold text-white">Fita #{hoveredStrip.stripNumber}: </span>
              <span className="text-blue-300 font-mono font-semibold">{hoveredStrip.productCode}</span>
              <span className="text-slate-300"> - {hoveredStrip.productDescription}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <span>Largura: <strong className="text-white">{hoveredStrip.largura} mm</strong></span>
            <span>Espessura: <strong className="text-white">{hoveredStrip.espessura} mm</strong></span>
            <span>Peso: <strong className="text-emerald-400">{hoveredStrip.pesoTon} t ({hoveredStrip.pesoKg} kg)</strong></span>
            <span>Rendimento: <strong className="text-sky-300">{hoveredStrip.metrosLineares} m</strong></span>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="text-xs text-slate-400">Total Fitas Geradas</div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            {strips.length} tiras
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{totalUsedWidth} mm de corte</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="text-xs text-slate-400">Aproveitamento da Bobina</div>
          <div className={`text-lg font-bold font-mono ${
            utilizationPercent >= 99 ? 'text-emerald-400' : utilizationPercent >= 95 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {utilizationPercent}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{usedWeightTon} t alocadas</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="text-xs text-slate-400">Sobra / Refilo Final</div>
          <div className={`text-lg font-bold font-mono ${
            scrapWidth <= 10 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {scrapWidth} mm
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{scrapWeightTon} t ({scrapPercent}%)</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="text-xs text-slate-400">Tolerância Máxima</div>
          <div className="text-lg font-bold text-slate-200 font-mono">
            ≤ 10 mm
          </div>
          <div className="text-[11px] text-slate-500">Regra de corte PCP</div>
        </div>
      </div>
    </div>
  );
};
