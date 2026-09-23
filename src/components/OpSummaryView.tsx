import React, { useState } from 'react';
import { SlitterOrder } from '../types/pcp';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { PrintTagsPortal } from './PrintTagsPortal';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Printer, 
  Tag, 
  FileSpreadsheet
} from 'lucide-react';
import { ExcelService } from '../services/excelService';

interface OpSummaryViewProps {
  order: SlitterOrder;
  onBack: () => void;
}

export const OpSummaryView: React.FC<OpSummaryViewProps> = ({
  order,
  onBack
}) => {
  const [isPrintingTagsPortal, setIsPrintingTagsPortal] = useState<boolean>(false);

  const handlePrintOp = () => {
    document.body.classList.remove('printing-portal');
    window.print();
  };

  const handlePrintTagsOnly = () => {
    setIsPrintingTagsPortal(true);
    document.body.classList.add('printing-portal');
    const cleanup = () => {
      document.body.classList.remove('printing-portal');
      setIsPrintingTagsPortal(false);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 150);
  };

  const handleExportExcel = () => {
    ExcelService.exportSlitterOrderToExcel(order);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Portal Container for Tag Printing */}
      {isPrintingTagsPortal && (
        <PrintTagsPortal
          strips={order.fitas}
          coil={{ lote: order.bobinaLote, codigo: order.bobinaCodigo }}
          orderNumber={order.numeroOP || order.numeroOS || 'OP-SLT-2026-001'}
        />
      )}

      {/* Top Action Header Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B1F3A]" />
            <span>Voltar aos Relatórios</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              Resumo da Ordem de Produção — {order.numeroOP || order.numeroOS}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ficha oficial resumida da Ordem de Produção de Slitter emitida.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintTagsOnly}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            title="Imprime apenas as etiquetas industriais dos slitters"
          >
            <Tag className="w-4 h-4" />
            <span>Imprimir Etiquetas dos Slitters</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar OP (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintOp}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir OP</span>
          </button>
        </div>
      </div>

      {/* Main OP Summary Document */}
      <div className="print-op-document bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6 print:bg-white print:p-0 print:border-none print:shadow-none">
        
        {/* Document Title Bar */}
        <div className="border-b-2 border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#0B1F3A] text-white rounded-xl font-black text-lg shadow-xs">
              PCP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  ORDEM DE PRODUÇÃO — {order.numeroOP || order.numeroOS}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                  {order.status || 'LIBERADA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                CEDISA Central de Aço • Programação de Corte de Slitter
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xl font-black text-[#0B1F3A]">
              Emissão: {order.dataCriacao}
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5 font-bold">
              Operador: {order.operador || 'Slitter 01'}
            </p>
          </div>
        </div>

        {/* Coil Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Lote Matéria-Prima</span>
            <strong className="text-[#0B1F3A] font-black text-sm block mt-0.5">{order.bobinaLote}</strong>
            <span className="text-[11px] text-slate-500">{order.bobinaCodigo}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Largura Base</span>
            <strong className="text-slate-900 font-black text-sm block mt-0.5">{order.bobinaLargura} mm</strong>
            <span className="text-[11px] text-slate-500">Bobina Matriz</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Espessura</span>
            <strong className="text-purple-800 font-black text-sm block mt-0.5">{order.bobinaEspessura} mm</strong>
            <span className="text-[11px] text-slate-500">Bitola Aço</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Peso Processado</span>
            <strong className="text-emerald-700 font-black text-sm block mt-0.5">{order.bobinaPesoOriginal} t</strong>
            <span className="text-[11px] text-slate-500">Massa Total</span>
          </div>
        </div>

        {/* Strips Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
              Fitas de Slitter Programadas ({order.totalFitas} fitas)
            </h4>
            <span className="text-xs font-mono text-slate-600 font-bold">
              Aproveitamento: <strong className="text-emerald-700">{order.aproveitamentoPercent}%</strong> | Refilo: <strong className="text-emerald-700">{order.sobraMm} mm</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Fita #</th>
                  <th className="py-3 px-3">Código Slitter</th>
                  <th className="py-3 px-3">Material de Destino</th>
                  <th className="py-3 px-3">Família</th>
                  <th className="py-3 px-3 text-right">Largura</th>
                  <th className="py-3 px-3 text-right">Peso (t)</th>
                  <th className="py-3 px-3 text-right">Rendimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.fitas.map((strip, idx) => {
                  const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        Fita {String(strip.stripNumber).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3 font-black text-[#0B1F3A]">
                        {sltInfo.code}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-800 font-bold">
                        <span className="font-mono text-[#0B1F3A]">{strip.productCode}</span> - {strip.productDescription}
                      </td>
                      <td className="py-3 px-3 font-sans font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          strip.productFamily === 'TUBO' ? 'bg-[#0B1F3A]/10 text-[#0B1F3A]' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {strip.productFamily}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {strip.largura} mm
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                        {strip.pesoTon} t
                      </td>
                      <td className="py-3 px-3 text-right text-[#0B1F3A] font-bold">
                        {strip.metrosLineares} m
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-slate-50 font-bold text-slate-700">
                  <td className="py-3 px-3 text-amber-700">Refilo Lateral</td>
                  <td colSpan={3} className="py-3 px-3 text-slate-500 font-sans">
                    Refilo técnico de borda ({order.sobraMm} mm)
                  </td>
                  <td className="py-3 px-3 text-right text-amber-700 font-black">{order.sobraMm} mm</td>
                  <td className="py-3 px-3 text-right text-amber-700 font-black">{order.sobraPesoTon || 0} t</td>
                  <td className="py-3 px-3 text-right text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {order.observacoes && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans text-slate-600">
            <strong className="text-slate-900 font-bold block mb-1">Observações do PCP:</strong>
            {order.observacoes}
          </div>
        )}
      </div>
    </div>
  );
};
