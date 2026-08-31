import React from 'react';
import ReactDOM from 'react-dom';
import { SlitterStrip } from '../types/pcp';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { QRCodeSVG } from './QRCodeSVG';

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
          const qrValue = `SLT:${sltInfo.code}|FITA:${strip.stripNumber}/${strips.length}|PROD:${strip.productCode}|LOTE:${coil.lote}|OP:${orderNumber}`;

          return (
            <div
              key={idx}
              className={`print-tag-card bg-white rounded-2xl border-2 p-4 flex flex-col justify-between overflow-hidden ${
                isTubo ? 'border-blue-600' : 'border-purple-600'
              }`}
            >
              {/* Header */}
              <div className={`px-4 py-2.5 flex items-center justify-between text-white rounded-t-xl ${
                isTubo ? 'bg-blue-700' : 'bg-purple-700'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-[10px] font-black font-mono">
                    PCP
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    CEDISA CENTRAL DE AÇO — ETIQUETA DE CORTE SLITTER
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  isTubo ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
                }`}>
                  FAMÍLIA: {strip.productFamily}
                </span>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-3 font-mono text-xs text-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">SLITTER A PRODUZIR:</span>
                    <strong className={`text-base font-black ${isTubo ? 'text-blue-900' : 'text-purple-900'}`}>
                      {sltInfo.code}
                    </strong>
                    <p className="text-[11px] text-slate-700 font-sans font-bold">{sltInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">FITA Nº</span>
                    <strong className="text-base font-black">
                      #{String(strip.stripNumber).padStart(2, '0')} / {String(strips.length).padStart(2, '0')}
                    </strong>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${isTubo ? 'bg-blue-50/70 border-blue-200' : 'bg-purple-50/70 border-purple-200'}`}>
                  <span className="text-[9px] font-bold uppercase block text-slate-600">MATERIAL DE DESTINO (PRODUTO FINAL):</span>
                  <strong className="text-xs font-black">{strip.productCode} ({strip.productFamily})</strong>
                  <p className="text-[11px] font-sans font-bold text-slate-700">{strip.productDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">LARGURA FITA</span>
                    <strong className={isTubo ? 'text-blue-800' : 'text-purple-800'}>{strip.largura} mm</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">ESPESSURA</span>
                    <strong>{strip.espessura} mm</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">PESO ROLO</span>
                    <strong className="text-emerald-700">{strip.pesoTon} t ({strip.pesoKg} kg)</strong>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">BOBINA MATRIZ / LOTE ORIGEM:</span>
                  <strong className="text-slate-900">{coil.lote} ({coil.codigo})</strong>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <QRCodeSVG value={qrValue} size={60} />
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">SCAN QR CODE</span>
                      <span className="text-[10px] font-bold text-slate-800 block">{sltInfo.code}</span>
                      <span className="text-[9px] text-slate-500 block">OP: {orderNumber}</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-sans font-bold">
                    <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                    <div className="text-slate-400">PCP Cedisa Central</div>
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
