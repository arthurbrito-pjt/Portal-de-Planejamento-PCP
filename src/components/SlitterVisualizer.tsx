import React, { useState } from 'react';
import { SlitterStrip, Coil } from '../types/pcp';
import { 
  Scissors, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Weight, 
  Gauge
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

  const isScrapIdeal = scrapWidth >= 10 && scrapWidth <= 18;
  const isScrapLow = scrapWidth < 10;
  const isScrapHigh = scrapWidth > 18;

  const formulaText = strips.map(s => `${s.largura}`).join(' + ') + (scrapWidth > 0 ? ` + [${scrapWidth} refilo]` : '') + ` = ${coil.largura} mm`;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Simulação Gráfica do Corte Slitter
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                Faixa Padrão: 10 a 18 mm (1,5%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2 font-mono font-medium">
              <span>Bobina: <strong className="text-slate-900">{coil.largura} mm</strong></span>
              <span>•</span>
              <span>Espessura: <strong className="text-purple-700">{coil.espessura} mm</strong></span>
              <span>•</span>
              <span>Peso: <strong className="text-emerald-700">{coil.peso} t</strong></span>
              <span>•</span>
              <span>Lote: <strong className="text-blue-700">{coil.lote}</strong></span>
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3">
          {isScrapIdeal && !isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ideal: Refilo {scrapWidth} mm (10 a 18 mm ~1,5%)</span>
            </div>
          ) : isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Largura Excedida em +{overflowAmount} mm!</span>
            </div>
          ) : isScrapLow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Refilo Baixo ({scrapWidth} mm &lt; 10 mm)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Sobra Alta ({scrapWidth} mm &gt; 18 mm)</span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-black text-slate-800 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span className={utilizationPercent >= 98.5 ? 'text-emerald-700' : 'text-blue-700'}>
              {utilizationPercent}% Útil
            </span>
          </div>
        </div>
      </div>

      {/* Cross Section Strip Diagram */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-500 px-1 font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            0 mm (Origem)
          </span>
          <span className="text-slate-700 bg-slate-100 px-3 py-0.5 rounded-lg border border-slate-200">
            {formulaText}
          </span>
          <span className="flex items-center gap-1 font-black text-slate-900">
            {coil.largura} mm (Largura Total)
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </span>
        </div>

        {/* 3D-effect Cross Section */}
        <div className="relative w-full h-28 bg-slate-100 rounded-2xl p-1.5 border-2 border-slate-300 shadow-sm flex items-stretch overflow-hidden">
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
                className={`relative group h-full flex flex-col justify-between p-2 border-r-2 border-white rounded-lg transition-all duration-150 cursor-pointer coil-texture strip-shadow ${
                  isHovered ? 'brightness-125 ring-2 ring-blue-500 z-20 scale-[1.02]' : 'hover:brightness-110'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded font-mono shadow">
                    #{idx + 1}
                  </span>
                  {interactive && onRemoveStrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStrip(strip.id);
                      }}
                      title="Remover fita"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded bg-black/70 text-white transition-opacity shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="text-center my-auto overflow-hidden">
                  <div className="text-sm sm:text-base font-black text-white font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {strip.largura} mm
                  </div>
                  <div className="text-[10px] font-bold text-white/95 truncate drop-shadow">
                    {strip.productCode}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-white/90 drop-shadow font-bold">
                  <span>{widthPercent.toFixed(1)}%</span>
                  <span>{strip.pesoTon} t</span>
                </div>
              </div>
            );
          })}

          {/* Scrap Zone */}
          {scrapWidth > 0 && !isOverflow && (
            <div
              style={{ width: `${scrapPercent}%` }}
              className={`h-full flex flex-col justify-between items-center p-2 border-2 border-dashed rounded-lg transition-all ${
                isScrapIdeal
                  ? 'scrap-stripes-green border-emerald-500 text-emerald-800'
                  : isScrapLow
                  ? 'scrap-stripes border-amber-500 text-amber-800'
                  : 'scrap-stripes border-red-400 text-red-800'
              }`}
            >
              <div className="text-[9px] uppercase font-black tracking-wider bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                Refilo
              </div>
              <div className="text-center">
                <div className="text-sm font-black font-mono">
                  {scrapWidth} mm
                </div>
                <div className="text-[9px] font-mono font-bold">
                  {scrapPercent}% ({scrapWeightTon} t)
                </div>
              </div>
              <div className="text-[8px] font-black uppercase">
                {isScrapIdeal ? '✓ IDEAL 10-18mm' : isScrapLow ? '⚠ < 10mm' : '⚠ > 18mm'}
              </div>
            </div>
          )}

          {isOverflow && (
            <div
              style={{ width: '12%' }}
              className="h-full flex flex-col justify-center items-center p-1 bg-red-600 text-white font-mono font-black text-xs rounded-lg"
            >
              <span>+{overflowAmount}mm</span>
            </div>
          )}
        </div>

        {/* Lower Millimeter Scale Ticks */}
        <div className="w-full flex justify-between text-[11px] font-mono text-slate-400 px-1 pt-1 font-bold">
          <span>| 0 mm</span>
          <span>| {Math.round(coil.largura * 0.25)} mm</span>
          <span>| {Math.round(coil.largura * 0.5)} mm</span>
          <span>| {Math.round(coil.largura * 0.75)} mm</span>
          <span>| {coil.largura} mm</span>
        </div>
      </div>

      {/* Floating Strip Inspection Card on Hover */}
      {hoveredStrip && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shadow ring-2 ring-white"
              style={{ backgroundColor: hoveredStrip.cor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 font-mono">Fita #{hoveredStrip.stripNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-black border border-blue-200">
                  {hoveredStrip.productCode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  {hoveredStrip.productFamily}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5 font-medium">{hoveredStrip.productDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-700 font-mono">
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">LARGURA</span>
              <strong className="text-slate-900 text-sm font-black">{hoveredStrip.largura} mm</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">PESO ALOCADO</span>
              <strong className="text-emerald-700 text-sm font-black">{hoveredStrip.pesoTon} t ({hoveredStrip.pesoKg} kg)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">METROS LINEARES</span>
              <strong className="text-blue-700 text-sm font-black">{hoveredStrip.metrosLineares} m</strong>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Fitas Programadas
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {strips.length} tiras
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {totalUsedWidth} mm de facas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            Aproveitamento Útil
          </div>
          <div className={`text-xl font-black font-mono mt-1 ${
            utilizationPercent >= 98.5 ? 'text-emerald-700' : 'text-blue-700'
          }`}>
            {utilizationPercent}%
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {usedWeightTon} t transformadas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Sobra / Refilo
          </div>
          <div className={`text-xl font-black font-mono mt-1 ${
            isScrapIdeal ? 'text-emerald-700' : isScrapLow ? 'text-amber-700' : 'text-red-700'
          }`}>
            {scrapWidth} mm
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {scrapWeightTon} t ({scrapPercent}%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase">
            <Weight className="w-3.5 h-3.5 text-purple-600" />
            Peso da Matéria-Prima
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {coil.peso} t
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Lote: {coil.lote}
          </div>
        </div>
      </div>
    </div>
  );
};
