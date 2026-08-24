import React, { useState } from 'react';
import { Coil, SlitterStrip, SlitterOrder } from '../types/pcp';
import { ExcelService } from '../services/excelService';
import { StorageService } from '../services/storageService';
import { 
  ClipboardCheck, 
  FileSpreadsheet, 
  Printer, 
  Save, 
  CheckCircle2, 
  Disc, 
  Layers, 
  Weight, 
  Scissors, 
  ArrowLeft,
  Calendar,
  User,
  Check,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlitterOrderViewProps {
  order: SlitterOrder | null;
  coil: Coil | null;
  strips: SlitterStrip[];
  onOrderSaved?: (savedOrder: SlitterOrder) => void;
  onNavigateToPlanning: () => void;
}

export const SlitterOrderView: React.FC<SlitterOrderViewProps> = ({
  order,
  coil,
  strips,
  onOrderSaved,
  onNavigateToPlanning
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [operador, setOperador] = useState<string>('Operador PCP - Linha 01');
  const [maquina, setMaquina] = useState<string>('Slitter Principal SLT-01');
  const [observacoes, setObservacoes] = useState<string>('Plano de corte otimizado pelo Portal PCP com aproveitamento máximo de bobina.');

  const currentCoil = order ? {
    id: order.bobinaId,
    codigo: order.bobinaCodigo,
    lote: order.bobinaLote,
    largura: order.bobinaLargura,
    espessura: order.bobinaEspessura,
    peso: order.bobinaPesoOriginal,
    quantidade: 1,
    status: 'Consumida' as const
  } : coil;

  const currentStrips = order ? order.fitas : strips;

  if (!currentCoil || currentStrips.length === 0) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-slate-800 bg-slate-900/80 text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">Nenhuma Ordem de Slitter em Edição</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para gerar uma Ordem de Slitter (OS), selecione uma bobina e planeje o corte no módulo de Planejamento.
        </p>
        <button
          onClick={onNavigateToPlanning}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
        >
          <Scissors className="w-4 h-4" />
          <span>Iniciar Planejamento</span>
        </button>
      </div>
    );
  }

  const totalUsedWidth = currentStrips.reduce((acc, s) => acc + s.largura, 0);
  const sobraMm = Math.max(0, currentCoil.largura - totalUsedWidth);
  const aproveitamentoPercent = Number(((totalUsedWidth / currentCoil.largura) * 100).toFixed(2));
  const perdaPercent = Number(((sobraMm / currentCoil.largura) * 100).toFixed(2));
  const sobraPesoTon = Number((currentCoil.peso * (sobraMm / currentCoil.largura)).toFixed(3));

  const orderNumber = order ? order.numeroOS : `SLT-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
  const orderDate = order ? order.dataCriacao : new Date().toLocaleDateString('pt-BR');

  const handleSaveOrder = () => {
    const newOrder: SlitterOrder = {
      id: order ? order.id : `ORD_${Date.now()}`,
      numeroOS: orderNumber,
      dataCriacao: new Date().toISOString().split('T')[0],
      bobinaId: currentCoil.id,
      bobinaCodigo: currentCoil.codigo,
      bobinaLote: currentCoil.lote,
      bobinaLargura: currentCoil.largura,
      bobinaEspessura: currentCoil.espessura,
      bobinaPesoOriginal: currentCoil.peso,
      fitas: currentStrips,
      totalFitas: currentStrips.length,
      totalLarguraFitas: totalUsedWidth,
      sobraMm: sobraMm,
      sobraPesoTon: sobraPesoTon,
      aproveitamentoPercent: aproveitamentoPercent,
      perdaPercent: perdaPercent,
      status: 'Liberada',
      operador,
      maquina,
      observacoes
    };

    StorageService.addOrder(newOrder);
    setIsSaved(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    if (onOrderSaved) onOrderSaved(newOrder);
  };

  const handleExportExcel = () => {
    const orderObj: SlitterOrder = {
      id: order ? order.id : `ORD_${Date.now()}`,
      numeroOS: orderNumber,
      dataCriacao: orderDate,
      bobinaId: currentCoil.id,
      bobinaCodigo: currentCoil.codigo,
      bobinaLote: currentCoil.lote,
      bobinaLargura: currentCoil.largura,
      bobinaEspessura: currentCoil.espessura,
      bobinaPesoOriginal: currentCoil.peso,
      fitas: currentStrips,
      totalFitas: currentStrips.length,
      totalLarguraFitas: totalUsedWidth,
      sobraMm: sobraMm,
      sobraPesoTon: sobraPesoTon,
      aproveitamentoPercent: aproveitamentoPercent,
      perdaPercent: perdaPercent,
      status: 'Liberada',
      operador,
      maquina,
      observacoes
    };

    ExcelService.exportSlitterOrderToExcel(orderObj);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onNavigateToPlanning}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              TELA 4 – Ordem de Slitter & Emissão OS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Documento oficial de programação de corte para a linha de produção do Slitter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-extrabold rounded-2xl transition-all shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-extrabold rounded-2xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir OS</span>
          </button>

          <button
            onClick={handleSaveOrder}
            disabled={isSaved}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black rounded-2xl shadow-xl transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:scale-105 active:scale-95 glow-blue'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>OS Salva & Liberada!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Aprovar & Liberar OS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-7 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 print:border-black pb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl print:bg-black font-black text-xl shadow-lg">
              PCP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight">
                  ORDEM DE CORTE SLITTER
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 print:text-black border border-emerald-500/30 text-[10px] font-mono font-bold">
                  LIBERADA
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                Planejamento e Controle da Produção Metalúrgica • Indústria de Aço
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-2xl sm:text-3xl font-black text-blue-400 print:text-black tracking-tight">
              {orderNumber}
            </div>
            <div className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-2 justify-end mt-1 font-sans">
              <Calendar className="w-3.5 h-3.5" />
              <span>Emissão: <strong>{orderDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Coil Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="text-[10px] font-extrabold text-slate-400 print:text-gray-600 uppercase tracking-wider">
              Código Bobina
            </div>
            <div className="text-base font-black text-white print:text-black font-mono mt-1">
              {currentCoil.codigo}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="text-[10px] font-extrabold text-slate-400 print:text-gray-600 uppercase tracking-wider">
              Lote da Matéria-Prima
            </div>
            <div className="text-base font-black text-blue-400 print:text-black font-mono mt-1">
              {currentCoil.lote}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="text-[10px] font-extrabold text-slate-400 print:text-gray-600 uppercase tracking-wider">
              Largura & Espessura
            </div>
            <div className="text-base font-black text-white print:text-black font-mono mt-1">
              {currentCoil.largura} x {currentCoil.espessura} mm
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="text-[10px] font-extrabold text-slate-400 print:text-gray-600 uppercase tracking-wider">
              Peso da Bobina
            </div>
            <div className="text-base font-black text-emerald-400 print:text-black font-mono mt-1">
              {currentCoil.peso} t
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="text-[10px] font-extrabold text-slate-400 print:text-gray-600 uppercase tracking-wider">
              Aproveitamento
            </div>
            <div className="text-base font-black text-emerald-400 print:text-black font-mono mt-1">
              {aproveitamentoPercent}%
            </div>
          </div>
        </div>

        {/* Strips List Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-400 pb-2.5">
            <h3 className="text-sm font-extrabold text-white print:text-black uppercase tracking-wider font-mono">
              Sequência de Facas / Tiras no Slitter ({currentStrips.length} fitas)
            </h3>
            <span className="text-xs font-mono text-slate-400 print:text-black font-semibold">
              Largura Útil: <strong>{totalUsedWidth} mm</strong> | Sobra: <strong className="text-emerald-400">{sobraMm} mm</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-800 print:border-black">
              <thead>
                <tr className="bg-slate-950 print:bg-gray-200 border-b border-slate-800 print:border-black text-slate-300 print:text-black font-mono text-[11px]">
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black">Posição</th>
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black">Produto Final Destino</th>
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black">Código Item</th>
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black">Família</th>
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black text-right">Largura (mm)</th>
                  <th className="py-3 px-3 border-r border-slate-800 print:border-black text-right">Peso Estimado</th>
                  <th className="py-3 px-3 text-right">Rendimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black font-mono">
                {currentStrips.map((strip, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-extrabold border-r border-slate-800 print:border-black">
                      Fita {String(strip.stripNumber).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3 font-sans text-white print:text-black font-medium border-r border-slate-800 print:border-black">
                      {strip.productDescription}
                    </td>
                    <td className="py-3 px-3 text-blue-400 print:text-black font-black border-r border-slate-800 print:border-black">
                      {strip.productCode}
                    </td>
                    <td className="py-3 px-3 font-sans border-r border-slate-800 print:border-black">
                      {strip.productFamily}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-white print:text-black border-r border-slate-800 print:border-black">
                      {strip.largura} mm
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 print:text-black font-bold border-r border-slate-800 print:border-black">
                      {strip.pesoTon} t ({strip.pesoKg} kg)
                    </td>
                    <td className="py-3 px-3 text-right text-sky-300 print:text-black">
                      {strip.metrosLineares} m
                    </td>
                  </tr>
                ))}

                {/* Scrap row */}
                <tr className="bg-slate-950/90 print:bg-gray-100 font-bold">
                  <td className="py-3 px-3 text-amber-400 print:text-black border-r border-slate-800 print:border-black">
                    Refilo / Sobra
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-slate-400 print:text-gray-700 font-sans border-r border-slate-800 print:border-black">
                    {sobraMm === 0 ? 'Sobra zero (100% de aproveitamento)' : `Refilo residual dentro da tolerância máxima (≤ 10mm)`}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 print:text-black border-r border-slate-800 print:border-black">
                    {sobraMm} mm
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 print:text-black border-r border-slate-800 print:border-black">
                    {sobraPesoTon} t ({perdaPercent}%)
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 print:text-gray-600">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Slitter Machine Setup Details & Operator Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800 print:border-black">
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 print:text-black">
              Dados Operacionais da Linha
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 print:text-gray-600">Equipamento / Máquina:</span>
                <input
                  type="text"
                  value={maquina}
                  onChange={(e) => setMaquina(e.target.value)}
                  className="bg-transparent border-b border-slate-700 print:border-black text-right font-mono font-bold text-white print:text-black focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 print:text-gray-600">Programador PCP:</span>
                <input
                  type="text"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="bg-transparent border-b border-slate-700 print:border-black text-right font-mono font-bold text-white print:text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 print:text-black">
              Assinaturas de Liberação
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t-2 border-slate-700 print:border-black pt-2 text-slate-400 print:text-black font-semibold">
                Responsável PCP
              </div>
              <div className="border-t-2 border-slate-700 print:border-black pt-2 text-slate-400 print:text-black font-semibold">
                Operador Slitter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
