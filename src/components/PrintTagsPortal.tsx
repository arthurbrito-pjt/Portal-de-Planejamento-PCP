import React from 'react';
import ReactDOM from 'react-dom';
import { SlitterStrip } from '../types/pcp';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { QRCodeSVG } from './QRCodeSVG';
import { CedisaLogo } from './CedisaLogo';

interface PrintTagsPortalProps {
  strips: SlitterStrip[];
  coil: { lote: string; codigo: string };
  orderNumber: string;
}

export const PrintTagsPortal: React.FC<PrintTagsPortalProps> = ({ strips, coil, orderNumber }) => {
  const mountNode = document.getElementById('print-mount');
  if (!mountNode) return null;

  return ReactDOM.createPortal(
    <div className="p-4 bg-white min-h-screen text-slate-900 font-sans">
      <div className="grid grid-cols-2 gap-4">
        {strips.map((strip, idx) => {
          const isTubo = strip.productFamily === 'TUBO';
          const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);
          const stripLote = strip.bobinaLote || coil.lote;
          const stripCodigo = strip.bobinaCodigo || coil.codigo;
          const qrValue = `SLT:${sltInfo.code}|FITA:${strip.stripNumber}/${strips.length}|PROD:${strip.productCode}|LOTE:${stripLote}|OP:${orderNumber}`;

          return (
            <div
              key={idx}
              className="print-tag-card bg-white rounded-2xl border-2 border-[#0B1F3A] p-4 flex flex-col justify-between overflow-hidden shadow-xs"
            >
              {/* Header Cedisa */}
              <div className="px-4 py-2.5 flex items-center justify-between text-white rounded-t-xl bg-[#0B1F3A] border-b-2 border-orange-500">
                <div className="flex items-center gap-2">
                  <CedisaLogo variant="symbol" theme="white" size="xs" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    CEDISA CENTRAL DE AÇO — ETIQUETA SLITTER
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-orange-500 text-white shadow-xs">
                  {strip.productFamily}
                </span>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-3 font-mono text-xs text-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">SLITTER A PRODUZIR:</span>
                    <strong className="text-base font-black text-[#0B1F3A]">
                      {sltInfo.code}
                    </strong>
                    <p className="text-[11px] text-slate-700 font-sans font-bold">{sltInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">FITA Nº</span>
                    <strong className="text-base font-black text-orange-600">
                      #{String(strip.stripNumber).padStart(2, '0')} / {String(strips.length).padStart(2, '0')}
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200">
                  <span className="text-[9px] font-bold uppercase block text-slate-500">MATERIAL DE DESTINO (PRODUTO FINAL):</span>
                  <strong className="text-xs font-black text-slate-900">{strip.productCode} ({strip.productFamily})</strong>
                  <p className="text-[11px] font-sans font-bold text-slate-700">{strip.productDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">LARGURA FITA</span>
                    <strong className="text-[#0B1F3A] font-black">{strip.largura} mm</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">ESPESSURA</span>
                    <strong className="font-black">{strip.espessura} mm</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">PESO ROLO</span>
                    <strong className="text-emerald-700 font-black">{strip.pesoTon} t ({strip.pesoKg} kg)</strong>
                  </div>
                </div>

                {/* Tracking Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <div className="space-y-0.5">
                    <div>OP: <strong className="text-[#0B1F3A]">{orderNumber}</strong></div>
                    <div>LOTE MP: <strong>{stripLote}</strong></div>
                    <div>CÓDIGO MP: <strong>{stripCodigo}</strong></div>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-lg">
                    <QRCodeSVG value={qrValue} size={54} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>,
    mountNode
  );
};
