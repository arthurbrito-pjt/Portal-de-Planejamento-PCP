import React, { useState } from 'react';
import { SlitterStrip, Coil } from '../types/pcp';
import { 
  Scissors, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Weight, 
  Gauge, 
  Sparkles,
  Maximize2,
  Info,
  ArrowRight
} from 'lucide-react';

interface SlitterVisualizerProps {
  coil: Coil;
  strips: SlitterStrip[];
  onAddStrip?: (productId?: string) => void;
  onRemoveStrip?: (stripId: string) => void;
  interactive?: boolean;
}

export const SlitterVisualizer: React.FC<SlitterVisualizerProps> = ({
  coil,
  strips,
  onAddStrip,
  onRemoveStrip,
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

  // Build formula text for visualization: e.g. "240 + 240 + 240 + 240 + 240 + 50 = 1250 mm"
  const formulaText = strips.map(s => `${s.largura}`).join(' + ') + (scrapWidth > 0 ? ` + [${scrapWidth} refilo]` : '') + ` = ${coil.largura} mm`;

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 shadow-2xl space-y-6">
      {/* Visualizer Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Simulação Gráfica de Corte Slitter
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                Tolerância ≤ 10 mm
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
              <span>Bobina: <strong className="text-white">{coil.largura} mm</strong></span>
              <span>•</span>
              <span>Espessura: <strong className="text-purple-400">{coil.espessura} mm</strong></span>
              <span>•</span>
              <span>Peso: <strong className="text-emerald-400">{coil.peso} t</strong></span>
              <span>•</span>
              <span>Lote: <strong className="text-blue-300">{coil.lote}</strong></span>
            </p>
          </div>
        </div>

        {/* Quality status badge */}
        <div className="flex items-center gap-3">
          {scrapWidth <= 10 && !isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conforme (Sobra {scrapWidth} mm ≤ 10mm)</span>
            </div>
          ) : isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-500/15 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Largura Excedida em +{overflowAmount} mm!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Sobra Alta ({scrapWidth} mm &gt; 10 mm)</span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className={utilizationPercent >= 99 ? 'text-emerald-400' : 'text-blue-400'}>
              {utilizationPercent}% Útil
            </span>
          </div>
        </div>
      </div>

      {/* Cross Section Strip Diagram */}
      <div className="space-y-2.5">
        {/* Rulers / Upper millimeter markers */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            0 mm (Origem)
          </span>
          <span className="text-slate-300 text-xs font-mono bg-slate-800/70 px-2.5 py-0.5 rounded-lg border border-slate-700">
            {formulaText}
          </span>
          <span className="flex items-center gap-1 font-bold text-white">
            {coil.largura} mm (Largura Total)
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </span>
        </div>

        {/* 3D-effect Metallic Coil Cross Section */}
        <div className="relative w-full h-28 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-2 border-2 border-slate-700/80 shadow-2xl flex items-stretch overflow-hidden">
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
                className={`relative group h-full flex flex-col justify-between p-2 border-r-2 border-slate-950/80 transition-all duration-200 cursor-pointer coil-texture strip-shadow ${
                  isHovered ? 'brightness-125 ring-2 ring-white z-20 scale-[1.02] shadow-2xl' : 'hover:brightness-110'
                }`}
              >
                {/* Top Strip Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md font-mono shadow">
                    #{idx + 1}
                  </span>
                  {interactive && onRemoveStrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStrip(strip.id);
                      }}
                      title="Remover esta fita"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded-md bg-black/70 text-white transition-opacity shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Center Strip Metric */}
                <div className="text-center my-auto overflow-hidden">
                  <div className="text-sm sm:text-base font-black text-white font-mono tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {strip.largura} mm
                  </div>
                  <div className="text-[10px] font-bold text-white/95 truncate drop-shadow">
                    {strip.productCode}
                  </div>
                </div>

                {/* Bottom Strip Info */}
                <div className="flex justify-between items-center text-[9px] font-mono text-white/90 drop-shadow">
                  <span>{widthPercent.toFixed(1)}%</span>
                  <span className="font-bold">{strip.pesoTon} t</span>
                </div>
              </div>
            );
          })}

          {/* Scrap / Sobra Zone */}
          {scrapWidth > 0 && !isOverflow && (
            <div
              style={{ width: `${scrapPercent}%` }}
              className={`h-full flex flex-col justify-between items-center p-2 border-2 border-dashed transition-all ${
                scrapWidth <= 10
                  ? 'scrap-stripes-green border-emerald-500/60 text-emerald-300'
                  : 'scrap-stripes border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="text-[9px] uppercase font-extrabold tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
                Refilo
              </div>
              <div className="text-center">
                <div className="text-sm font-black font-mono">
                  {scrapWidth} mm
                </div>
                <div className="text-[9px] font-mono opacity-90">
                  {scrapPercent}% ({scrapWeightTon} t)
                </div>
              </div>
              <div className="text-[8px] font-bold">
                {scrapWidth <= 10 ? '✓ CONFORME' : '⚠ ALERTA'}
              </div>
            </div>
          )}

          {/* Overflow Bar if width > coil */}
          {isOverflow && (
            <div
              style={{ width: '12%' }}
              className="h-full flex flex-col justify-center items-center p-1 bg-red-900/90 border-2 border-red-500 text-red-200 animate-pulse font-mono font-bold text-xs"
            >
              <span>+{overflowAmount}mm</span>
            </div>
          )}
        </div>

        {/* Lower Millimeter Scale Ticks */}
        <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
          <span>| 0 mm</span>
          <span>| {Math.round(coil.largura * 0.25)} mm</span>
          <span>| {Math.round(coil.largura * 0.5)} mm</span>
          <span>| {Math.round(coil.largura * 0.75)} mm</span>
          <span>| {coil.largura} mm</span>
        </div>
      </div>

      {/* Floating Strip Inspection Card on Hover */}
      {hoveredStrip && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shadow-lg ring-2 ring-white/50"
              style={{ backgroundColor: hoveredStrip.cor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">Fita #{hoveredStrip.stripNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                  {hoveredStrip.productCode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  {hoveredStrip.productFamily}
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">{hoveredStrip.productDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">LARGURA</span>
              <strong className="text-white text-sm">{hoveredStrip.largura} mm</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">PESO ALOCADO</span>
              <strong className="text-emerald-400 text-sm">{hoveredStrip.pesoTon} t ({hoveredStrip.pesoKg} kg)</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">METROS LINEARES</span>
              <strong className="text-sky-400 text-sm">{hoveredStrip.metrosLineares} m</strong>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Fitas Programadas
          </div>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {strips.length} tiras
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {totalUsedWidth} mm de facas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            Aproveitamento Útil
          </div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${
            utilizationPercent >= 99 ? 'text-emerald-400' : utilizationPercent >= 95 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {utilizationPercent}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {usedWeightTon} t transformadas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Sobra / Refilo
          </div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${
            scrapWidth <= 10 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {scrapWidth} mm
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {scrapWeightTon} t ({scrapPercent}%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Weight className="w-3.5 h-3.5 text-purple-400" />
            Peso da Matéria-Prima
          </div>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {coil.peso} t
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Lote: {coil.lote}
          </div>
        </div>
      </div>
    </div>
  );
};
