import React, { useState } from 'react';
import { Coil, SlitterStrip } from '../types/pcp';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { PrintTagsPortal } from './PrintTagsPortal';
import { QRCodeSVG } from './QRCodeSVG';
import { Printer, X, Tag } from 'lucide-react';

interface SlitterTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  coil: Coil | null;
  strips: SlitterStrip[];
  orderNumber?: string;
}

export const SlitterTagModal: React.FC<SlitterTagModalProps> = ({
  isOpen,
  onClose,
  coil,
  strips,
  orderNumber = 'OP-SLT-2026-001'
}) => {
  const [familyFilter, setFamilyFilter] = useState<'TODOS' | 'TUBO' | 'PERFIL'>('TODOS');
  const [printingStripId, setPrintingStripId] = useState<string | null>(null);
  const [printSubset, setPrintSubset] = useState<SlitterStrip[] | null>(null);

  if (!isOpen || !coil || strips.length === 0) return null;

  const tuboCount = strips.filter(s => s.productFamily === 'TUBO').length;
  const perfilCount = strips.filter(s => s.productFamily === 'PERFIL').length;

  const filteredStrips = strips.filter(s => {
    if (familyFilter === 'TUBO') return s.productFamily === 'TUBO';
    if (familyFilter === 'PERFIL') return s.productFamily === 'PERFIL';
    return true;
  });

  const printViaPortal = (stripsToPrint: SlitterStrip[]) => {
    setPrintSubset(stripsToPrint);
    document.body.classList.add('printing-portal');
    const cleanup = () => {
      document.body.classList.remove('printing-portal');
      setPrintSubset(null);
      setPrintingStripId(null);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintAll = () => {
    setPrintingStripId(null);
    printViaPortal(filteredStrips);
  };

  const handlePrintSingle = (stripId: string) => {
    setPrintingStripId(stripId);
    printViaPortal(strips.filter(s => s.id === stripId));
  };

  return (
    <>
      {printSubset && (
        <PrintTagsPortal
          strips={printSubset}
          coil={{ lote: coil.lote, codigo: coil.codigo }}
          orderNumber={orderNumber}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-4 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                <span>IMPRESSÃO DE ETIQUETAS DE SLITTER</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-mono font-bold">
                  {strips.length} etiquetas
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Etiquetas industriais com QR Code e código de cores (Tubo = Azul | Perfil = Roxo).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setFamilyFilter('TODOS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  familyFilter === 'TODOS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({strips.length})
              </button>

              <button
                onClick={() => setFamilyFilter('TUBO')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  familyFilter === 'TUBO' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Tubos ({tuboCount})
              </button>

              <button
                onClick={() => setFamilyFilter('PERFIL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  familyFilter === 'PERFIL' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Perfis ({perfilCount})
              </button>
            </div>

            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Abrir Painel de Impressão</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Grid Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-4">
            {filteredStrips.map((strip, idx) => {
              if (printingStripId && printingStripId !== strip.id) {
                return null;
              }

              const isTubo = strip.productFamily === 'TUBO';
              const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);
              const qrValue = `SLT:${sltInfo.code}|FITA:${strip.stripNumber}/${strips.length}|PROD:${strip.productCode}|LOTE:${coil.lote}|OP:${orderNumber}`;

              return (
                <div
                  key={strip.id || idx}
                  className={`print-tag-card bg-white rounded-2xl border-2 shadow-xs overflow-hidden flex flex-col justify-between transition-all print:shadow-none print:break-inside-avoid print:mb-4 ${
                    isTubo 
                      ? 'border-blue-600 hover:border-blue-700' 
                      : 'border-purple-600 hover:border-purple-700'
                  }`}
                >
                  {/* Tag Header with Color Coding */}
                  <div className={`px-4 py-3 flex items-center justify-between text-white ${
                    isTubo ? 'bg-blue-700' : 'bg-purple-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black font-mono">
                        PCP
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider block opacity-90">
                          CEDISA CENTRAL DE AÇO
                        </span>
                        <h4 className="text-xs font-black tracking-tight">
                          ETIQUETA DE CORTE SLITTER
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                        isTubo 
                          ? 'bg-blue-100 text-blue-900 border-blue-300' 
                          : 'bg-purple-100 text-purple-900 border-purple-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isTubo ? 'bg-blue-600' : 'bg-purple-600'}`} />
                        {strip.productFamily}
                      </span>
                    </div>
                  </div>

                  {/* Tag Information Body */}
                  <div className="p-4 space-y-3.5 text-slate-900 font-mono text-xs">
                    
                    {/* Row 1: Slitter Code & Name + Fita # */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                          SLITTER A PRODUZIR:
                        </span>
                        <span className={`text-base font-black ${isTubo ? 'text-blue-900' : 'text-purple-900'}`}>
                          {sltInfo.code}
                        </span>
                        <p className="text-[11px] text-slate-700 font-bold font-sans line-clamp-1 mt-0.5">
                          {sltInfo.name}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">FITA Nº</span>
                        <span className="text-lg font-black text-slate-900">
                          #{String(strip.stripNumber).padStart(2, '0')} / {String(strips.length).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Destination Material (Produto Final) */}
                    <div className={`p-2.5 rounded-xl border ${
                      isTubo 
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950' 
                        : 'bg-purple-50/70 border-purple-200 text-purple-950'
                    }`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                        MATERIAL DE DESTINO (PRODUTO FINAL):
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-xs font-black">{strip.productCode}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isTubo ? 'bg-blue-200/60 border-blue-300' : 'bg-purple-200/60 border-purple-300'
                        }`}>
                          {strip.productFamily}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans font-bold mt-1 line-clamp-1">
                        {strip.productDescription}
                      </p>
                    </div>

                    {/* Row 3: Dimensions & Weight Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Largura Fita</span>
                        <strong className={`text-xs font-black ${isTubo ? 'text-blue-800' : 'text-purple-800'}`}>
                          {strip.largura} mm
                        </strong>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Espessura</span>
                        <strong className="text-xs font-black text-slate-900">
                          {strip.espessura} mm
                        </strong>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Peso do Rolo</span>
                        <strong className="text-xs font-black text-emerald-700">
                          {strip.pesoTon} t ({strip.pesoKg} kg)
                        </strong>
                      </div>
                    </div>

                    {/* Row 4: Parent Coil Lot */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Lote Origem:</span>
                      <strong className="text-slate-900 font-bold text-xs">{coil.lote} ({coil.codigo})</strong>
                    </div>

                    {/* Footer Row: QR Code & Production Specs */}
                    <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <QRCodeSVG value={qrValue} size={64} />
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">
                            SCAN QR CODE
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-800 block mt-0.5">
                            {sltInfo.code}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block">
                            OP: {orderNumber}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-500 font-sans font-bold">
                        <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                        <div className="mt-0.5 text-slate-400">PCP Cedisa Central</div>
                      </div>
                    </div>

                  </div>

                  {/* Individual Print Button (Hidden during printing) */}
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
                    <span className="text-[10px] text-slate-500 font-sans font-medium">
                      Padrão 100x75mm
                    </span>
                    <button
                      onClick={() => handlePrintSingle(strip.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg text-white shadow-xs transition-all ${
                        isTubo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Imprimir Esta Etiqueta
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      </div>
    </>
  );
};
