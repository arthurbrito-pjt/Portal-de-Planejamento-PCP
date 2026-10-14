import React, { useRef, useState } from 'react';
import { SlitterStrip, Coil } from '../types/pcp';
import { SlitterCatalogService } from '../services/slitterCatalogService';
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
  onReorderStrip?: (fromStripId: string, toStripId: string) => void;
  interactive?: boolean;
}

export const SlitterVisualizer: React.FC<SlitterVisualizerProps> = ({
  coil,
  strips,
  onAddStrip,
  onRemoveStrip,
  onReorderStrip,
  interactive = false
}) => {
  const [hoveredStrip, setHoveredStrip] = useState<SlitterStrip | null>(null);

  React.useEffect(() => {
    if (hoveredStrip && !strips.some(s => s.id === hoveredStrip.id)) {
      setHoveredStrip(null);
    }
  }, [strips, hoveredStrip]);

  const canReorder = interactive && !!onReorderStrip;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ id: string; originIdx: number; startX: number; dx: number; trackPx: number } | null>(null);
  const [settledId, setSettledId] = useState<string | null>(null);

  const totalUsedWidth = strips.reduce((acc, s) => acc + s.largura, 0);
  const scrapWidth = Math.max(0, coil.largura - totalUsedWidth);
  const isOverflow = totalUsedWidth > coil.largura;
  const overflowAmount = isOverflow ? totalUsedWidth - coil.largura : 0;
  
  const scrapPercent = Number(((scrapWidth / coil.largura) * 100).toFixed(2));
  const utilizationPercent = Number(((Math.min(totalUsedWidth, coil.largura) / coil.largura) * 100).toFixed(2));
  const scrapWeightTon = Number((coil.peso * (scrapWidth / coil.largura)).toFixed(3));
  const usedWeightTon = Number((coil.peso * (Math.min(totalUsedWidth, coil.largura) / coil.largura)).toFixed(3));

  const isScrapIdeal = scrapWidth >= 8 && scrapWidth <= 18;
  const isScrapLow = scrapWidth < 8;
  const isScrapHigh = scrapWidth > 18;

  // Layout em % da trilha. Com excesso de largura as fitas são comprimidas em 88% e o bloco vermelho ocupa o resto.
  const layoutK = isOverflow ? 88 / ((totalUsedWidth / coil.largura) * 100) : 1;
  const widthPct = (s: SlitterStrip) => (s.largura / coil.largura) * 100 * layoutK;
  const usedPct = strips.reduce((acc, s) => acc + widthPct(s), 0);

  // Durante o arraste a fita segue o cursor e as demais abrem espaço em tempo real.
  const layout = (() => {
    const draggedStrip = drag ? strips.find(s => s.id === drag.id) : undefined;
    const others = draggedStrip ? strips.filter(s => s.id !== draggedStrip.id) : strips;
    const originLeft = draggedStrip
      ? strips.slice(0, drag!.originIdx).reduce((acc, s) => acc + widthPct(s), 0)
      : 0;
    const dragW = draggedStrip ? widthPct(draggedStrip) : 0;
    const dragLeft = draggedStrip
      ? Math.max(0, Math.min(usedPct - dragW, originLeft + (drag!.dx / drag!.trackPx) * 100))
      : 0;

    let insertIdx = drag ? drag.originIdx : 0;
    if (draggedStrip) {
      const dragCenter = dragLeft + dragW / 2;
      let acc = 0;
      let count = 0;
      for (const o of others) {
        const w = widthPct(o);
        if (acc + w / 2 < dragCenter) count++;
        acc += w;
      }
      insertIdx = count;
    }

    const order = draggedStrip
      ? [...others.slice(0, insertIdx), draggedStrip, ...others.slice(insertIdx)]
      : strips;
    const slots: { left: number; width: number }[] = [];
    const slotById = new Map<string, { left: number; width: number }>();
    const previewIndex = new Map<string, number>();
    let acc = 0;
    order.forEach((s, i) => {
      const slot = { left: acc, width: widthPct(s) };
      slots.push(slot);
      slotById.set(s.id, slot);
      previewIndex.set(s.id, i);
      acc += slot.width;
    });
    return { slots, slotById, previewIndex, insertIdx, dragLeft, usedPct: acc };
  })();

  const finishDrag = (stripId: string) => {
    if (!drag || drag.id !== stripId) return;
    const target = strips[layout.insertIdx];
    if (target && target.id !== stripId) {
      onReorderStrip?.(stripId, target.id);
      setSettledId(stripId);
      setTimeout(() => setSettledId(null), 900);
    }
    setDrag(null);
  };

  const formulaText = strips.map(s => `${s.largura}`).join(' + ') + (scrapWidth > 0 ? ` + [${scrapWidth} refilo]` : '') + ` = ${coil.largura} mm`;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#0B1F3A] text-white rounded-2xl shadow-md shadow-[#0B1F3A]/20">
            <Scissors className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Simulação Gráfica do Corte Slitter
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] border border-[#0B1F3A]/20 text-[10px] font-mono font-bold">
                Faixa Padrão: 8 a 18 mm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2 font-mono font-medium">
              <span>Bobina: <strong className="text-slate-900">{coil.largura} mm</strong></span>
              <span>•</span>
              <span>Espessura: <strong className="text-purple-700">{coil.espessura} mm</strong></span>
              <span>•</span>
              <span>Peso: <strong className="text-emerald-700">{coil.peso} t</strong></span>
              <span>•</span>
              <span>Lote: <strong className="text-[#0B1F3A]">{coil.lote}</strong></span>
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3">
          {isScrapIdeal && !isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ideal: Refilo {scrapWidth} mm (8 a 18 mm)</span>
            </div>
          ) : isOverflow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Largura Excedida em +{overflowAmount} mm!</span>
            </div>
          ) : isScrapLow ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Refilo Baixo ({scrapWidth} mm &lt; 8 mm)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Sobra Alta ({scrapWidth} mm &gt; 18 mm)</span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-black text-slate-800 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#0B1F3A]" />
            <span className={utilizationPercent >= 98.5 ? 'text-emerald-700' : 'text-[#0B1F3A]'}>
              {utilizationPercent}% Útil
            </span>
          </div>
        </div>
      </div>

      {/* Cross Section Strip Diagram */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-500 px-1 font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0B1F3A]"></span>
            0 mm (Origem)
          </span>
          <span className="text-slate-700 bg-slate-100 px-3 py-0.5 rounded-lg border border-slate-200">
            {formulaText}
          </span>
          <span className="flex items-center gap-1 font-black text-slate-900">
            {coil.largura} mm (Largura Total)
            <span className="w-2 h-2 rounded-full bg-[#0B1F3A]"></span>
          </span>
        </div>

        {/* 3D-effect Cross Section — fitas posicionadas por offset para animar a reordenação ao arrastar */}
        <div className="relative w-full h-28 bg-slate-100 rounded-2xl p-1.5 border-2 border-slate-300 shadow-sm">
          <div ref={trackRef} className="relative w-full h-full select-none">
            {drag && layout.slots[layout.insertIdx] && (
              <div
                className="absolute top-0 bottom-0 rounded-lg border-2 border-dashed border-orange-400 bg-orange-400/15 transition-all duration-200 ease-out"
                style={{ left: `${layout.slots[layout.insertIdx].left}%`, width: `${layout.slots[layout.insertIdx].width}%` }}
              />
            )}

            {strips.map((strip) => {
              const slot = layout.slotById.get(strip.id)!;
              const isDragging = drag?.id === strip.id;
              const left = isDragging ? layout.dragLeft : slot.left;
              const isHovered = !drag && hoveredStrip?.id === strip.id;
              const isSettled = settledId === strip.id;

              return (
                <div
                  key={strip.id}
                  style={{
                    left: `${left}%`,
                    width: `${slot.width}%`,
                    backgroundColor: strip.cor,
                    touchAction: canReorder ? 'none' : undefined,
                    transition: isDragging
                      ? 'transform 150ms ease, box-shadow 150ms ease'
                      : 'left 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease, filter 150ms ease'
                  }}
                  onMouseEnter={() => !drag && setHoveredStrip(strip)}
                  onMouseLeave={() => setHoveredStrip(null)}
                  onPointerDown={(e) => {
                    if (!canReorder || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setHoveredStrip(null);
                    setDrag({
                      id: strip.id,
                      originIdx: strips.findIndex(s => s.id === strip.id),
                      startX: e.clientX,
                      dx: 0,
                      trackPx: trackRef.current?.getBoundingClientRect().width || 1
                    });
                  }}
                  onPointerMove={(e) => {
                    if (drag?.id === strip.id) setDrag({ ...drag, dx: e.clientX - drag.startX });
                  }}
                  onPointerUp={() => finishDrag(strip.id)}
                  onPointerCancel={() => setDrag(null)}
                  title={canReorder ? 'Arraste para mudar a fita de lugar' : undefined}
                  className={`absolute top-0 bottom-0 group flex flex-col justify-between p-2 border-r-2 border-white rounded-lg coil-texture strip-shadow ${
                    canReorder ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'
                  } ${
                    isDragging
                      ? 'z-40 scale-y-[1.08] scale-x-[1.02] shadow-2xl shadow-black/40 ring-2 ring-orange-400 brightness-110'
                      : drag
                      ? 'opacity-80'
                      : isSettled
                      ? 'z-30 ring-4 ring-orange-400/70'
                      : isHovered
                      ? 'brightness-125 ring-2 ring-orange-500 z-20 scale-[1.02]'
                      : 'hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded font-mono shadow">
                      #{layout.previewIndex.get(strip.id)! + 1}
                    </span>
                    {interactive && onRemoveStrip && !drag && (
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

                  <div className="text-center my-auto overflow-hidden px-0.5 pointer-events-none">
                    <div className="text-sm sm:text-base font-black text-white font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {strip.largura} mm
                    </div>
                    <div className="text-[10px] font-black text-white uppercase truncate drop-shadow tracking-tight">
                      {SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura).code}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-white/90 drop-shadow font-bold pointer-events-none">
                    <span>{((strip.largura / coil.largura) * 100).toFixed(1)}%</span>
                    <span>{strip.pesoTon} t</span>
                  </div>
                </div>
              );
            })}

            {/* Scrap Zone */}
            {scrapWidth > 0 && !isOverflow && (
              <div
                style={{
                  left: `${layout.usedPct}%`,
                  width: `${scrapPercent}%`,
                  transition: 'left 260ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                className={`absolute top-0 bottom-0 flex flex-col justify-between items-center p-2 border-2 border-dashed rounded-lg ${
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
                  {isScrapIdeal ? '✓ IDEAL 8-18mm' : isScrapLow ? '⚠ < 8mm' : '⚠ > 18mm'}
                </div>
              </div>
            )}

            {isOverflow && (
              <div
                style={{ left: '88%', width: '12%' }}
                className="absolute top-0 bottom-0 flex flex-col justify-center items-center p-1 bg-red-600 text-white font-mono font-black text-xs rounded-lg"
              >
                <span>+{overflowAmount}mm</span>
              </div>
            )}
          </div>
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
      {hoveredStrip && strips.some(s => s.id === hoveredStrip.id) && (() => {
        const sltInfo = SlitterCatalogService.getSlitterInfo(hoveredStrip.largura, hoveredStrip.espessura);
        return (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shadow ring-2 ring-white"
                style={{ backgroundColor: hoveredStrip.cor }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 font-mono">Fita #{hoveredStrip.stripNumber}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#0B1F3A] text-white font-mono font-black border border-[#163866] shadow-xs">
                    ✂️ {sltInfo.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    {hoveredStrip.productFamily}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  Slitter: {sltInfo.name}
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                  Material de Destino: <strong className="text-slate-900 font-mono">{hoveredStrip.productCode}</strong> ({hoveredStrip.productDescription})
                </p>
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
                <strong className="text-[#0B1F3A] text-sm font-black">{hoveredStrip.metrosLineares} m</strong>
              </div>
            </div>
          </div>
        );
      })()}

      {/* KPI Cards Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase">
            <Layers className="w-3.5 h-3.5 text-[#0B1F3A]" />
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
            utilizationPercent >= 98.5 ? 'text-emerald-700' : 'text-[#0B1F3A]'
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
