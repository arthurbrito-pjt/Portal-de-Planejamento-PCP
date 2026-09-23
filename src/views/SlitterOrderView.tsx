import React, { useState } from 'react';
import { Coil, SlitterStrip, SlitterOrder } from '../types/pcp';
import { ExcelService } from '../services/excelService';
import { StorageService } from '../services/storageService';
import { OrderBuilderService, OrderCoilInput } from '../services/orderBuilderService';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { PrintTagsPortal } from '../components/PrintTagsPortal';
import { EmptyState } from '../components/EmptyState';
import { MetricsBadge } from '../components/MetricsBadge';
import { CedisaLogo } from '../components/CedisaLogo';
import {
  ClipboardCheck,
  FileSpreadsheet,
  Printer,
  Save,
  Check,
  Calendar,
  ArrowLeft,
  Scissors,
  Tag,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface SlitterOrderViewProps {
  order: SlitterOrder | null;
  coil: Coil | null;
  strips: SlitterStrip[];
  coilInputs?: OrderCoilInput[];
  operadorInicial?: string;
  turnoInicial?: string;
  maquinaInicial?: string;
  observacoesInicial?: string;
  justCreated?: boolean;
  onOrderSaved?: (savedOrder: SlitterOrder) => void;
  onFinishOrder?: () => void;
  onCancelOrder?: (orderId: string) => void;
  onNavigateToPlanning: () => void;
  onNavigateToSimulation?: () => void;
  onNavigateToDashboard?: () => void;
}

export const SlitterOrderView: React.FC<SlitterOrderViewProps> = ({
  order,
  coil,
  strips,
  coilInputs,
  operadorInicial,
  turnoInicial,
  maquinaInicial,
  observacoesInicial,
  justCreated = false,
  onOrderSaved,
  onFinishOrder,
  onCancelOrder,
  onNavigateToPlanning,
  onNavigateToSimulation,
  onNavigateToDashboard
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(!!order);
  const [showJustCreatedBanner] = useState<boolean>(justCreated);
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const [isPrintingTagsPortal, setIsPrintingTagsPortal] = useState<boolean>(false);
  const [operador, setOperador] = useState<string>(order?.operador || operadorInicial || '');
  const [turno, setTurno] = useState<string>(order?.turno || turnoInicial || '');
  const [maquina, setMaquina] = useState<string>(order?.maquina || maquinaInicial || '');
  const [observacoes, setObservacoes] = useState<string>(order?.observacoes || observacoesInicial || '');

  // Rascunho estável: monta a OP (com numeroOP/id fixos) uma única vez a partir
  // da bobina + fitas vindas do Estúdio de Simulação, antes de existir uma OP
  // salva. Evita recalcular um número de OP diferente a cada render/keystroke.
  const [draftOrder] = useState<SlitterOrder | null>(() => {
    if (order) return null;
    if (coilInputs && coilInputs.length > 0) {
      return OrderBuilderService.buildNew(coilInputs, {});
    }
    if (!coil || strips.length === 0) return null;
    return OrderBuilderService.buildNew([{ coil, strips }], {});
  });

  const displayOrder = order || draftOrder;

  if (!displayOrder) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Nenhuma Ordem de Produção (OP) em Edição"
        description="Para gerar uma Ordem de Produção (OP) de Slitter, selecione uma bobina e planeje o corte no módulo de Planejamento."
        actionLabel="Iniciar Planejamento"
        actionIcon={Scissors}
        onAction={onNavigateToPlanning}
      />
    );
  }

  const orderNumber = displayOrder.numeroOP || displayOrder.numeroOS || 'OP-SLT-2026-001';
  const orderDate = displayOrder.dataCriacao;
  const orderStatus = displayOrder.status;
  const isLocked = orderStatus === 'Cancelada' || orderStatus === 'Concluída';
  const bobinas = displayOrder.bobinas;
  const isMultiCoil = bobinas.length > 1;

  const handleSaveOrder = (): SlitterOrder => {
    const base = order || draftOrder!;
    const toSave = OrderBuilderService.updateFields(base, { operador, turno, maquina, observacoes });

    StorageService.addOrder(toSave);
    setIsSaved(true);
    if (isSaved) {
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    }
    if (onOrderSaved) onOrderSaved(toSave);
    return toSave;
  };

  const handleFinalizeAndClear = () => {
    const savedOrder = isSaved ? order : handleSaveOrder();
    const orderId = savedOrder?.id;

    if (orderId) {
      StorageService.updateOrderStatus(orderId, 'Concluída');
    }

    if (onFinishOrder) {
      onFinishOrder();
    }
  };

  const handleCancelOrder = () => {
    if (!order || !onCancelOrder) return;
    const lotesTexto = bobinas.map(b => b.bobinaLote).join(', ');
    const confirmed = window.confirm(
      `Cancelar a OP ${orderNumber}? A(s) bobina(s) ${lotesTexto} volta(m) ao estoque como Disponível e o corte não será executado.`
    );
    if (!confirmed) return;
    onCancelOrder(order.id);
  };

  const handleExportExcel = () => {
    const base = order || draftOrder!;
    const toExport = OrderBuilderService.updateFields(base, { operador, turno, maquina, observacoes });
    ExcelService.exportSlitterOrderToExcel(toExport);
  };

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

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Portal Container for Tag Printing */}
      {isPrintingTagsPortal && (
        <PrintTagsPortal
          strips={displayOrder.fitas}
          coil={{ lote: displayOrder.bobinaLote, codigo: displayOrder.bobinaCodigo }}
          orderNumber={orderNumber}
        />
      )}

      {showJustCreatedBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>OP {orderNumber} gerada e salva com sucesso. Revise abaixo, imprima ou clique em "Finalizar OP & Concluir" para voltar ao painel.</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToPlanning}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B1F3A]" />
            <span>Voltar ao Planejamento</span>
          </button>

          {onNavigateToSimulation && (
            <button
              onClick={onNavigateToSimulation}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold"
            >
              <span>Voltar ao Estúdio</span>
            </button>
          )}

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-xs text-xs font-bold"
            >
              Voltar ao Painel
            </button>
          )}

          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              Ordem de Produção (OP) do Slitter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Documento oficial de programação de corte de fitas para a linha de produção do Slitter.
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

          {isSaved && !isLocked && justUpdated && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Check className="w-4 h-4" />
              Alterações salvas
            </span>
          )}

          <button
            onClick={handleSaveOrder}
            disabled={isLocked}
            title={isLocked ? `OP ${orderStatus === 'Cancelada' ? 'cancelada' : 'concluída'} — não pode mais ser editada` : undefined}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
              isLocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : isSaved
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Atualizar OP' : 'Salvar OP'}</span>
          </button>

          {order && onCancelOrder && (
            <button
              onClick={handleCancelOrder}
              disabled={isLocked}
              title={isLocked ? `OP ${orderStatus === 'Cancelada' ? 'já cancelada' : 'concluída'} — não pode mais ser cancelada` : 'Cancelar esta OP e devolver a(s) bobina(s) ao estoque'}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
                isLocked
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelar OP</span>
            </button>
          )}

          <button
            onClick={handleFinalizeAndClear}
            disabled={isLocked}
            title={isLocked ? `OP ${orderStatus === 'Cancelada' ? 'cancelada' : 'já concluída'}` : undefined}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
              isLocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar OP & Concluir</span>
          </button>
        </div>
      </div>

      {isLocked && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 print:hidden ${
          orderStatus === 'Cancelada'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {orderStatus === 'Cancelada' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>
            {orderStatus === 'Cancelada'
              ? `Esta OP foi cancelada. A(s) bobina(s) ${bobinas.map(b => b.bobinaLote).join(', ')} foram devolvidas ao estoque como Disponível.`
              : 'Esta OP já foi concluída e não pode mais ser editada, atualizada ou cancelada.'}
          </span>
        </div>
      )}

      {/* Printable OP Sheet Container */}
      <div className="print-op-document bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-7 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-200 print:border-black pb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CedisaLogo variant="horizontal" theme="color" size="lg" className="print:hidden" />
            <CedisaLogo variant="horizontal" theme="print" size="lg" className="hidden print:block" />
            <div className="border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 print:text-black tracking-tight">
                  ORDEM DE PRODUÇÃO — CORTE SLITTER (OP)
                </h1>
                <MetricsBadge type="status" value={orderStatus} size="md" />
              </div>
              <p className="text-xs text-slate-500 print:text-gray-600 mt-0.5 font-medium">
                CEDISA CENTRAL DE AÇO S/A • Planejamento e Controle da Produção Slitter
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-2xl sm:text-3xl font-black text-[#0B1F3A] print:text-black tracking-tight">
              {orderNumber}
            </div>
            <div className="text-xs text-slate-500 print:text-gray-600 flex items-center gap-2 justify-end mt-1 font-sans font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Emissão: <strong>{orderDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Coil Summary Cards (agregado — 1 ou mais bobinas) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isMultiCoil ? `Bobinas (${bobinas.length})` : 'Código Bobina Matriz'}
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-1">
              {isMultiCoil ? bobinas.map(b => b.bobinaCodigo).join(', ') : displayOrder.bobinaCodigo}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Lote da Matéria-Prima
            </div>
            <div className="text-base font-black text-[#0B1F3A] font-mono mt-1">
              {displayOrder.bobinaLote}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isMultiCoil ? 'Espessura' : 'Largura & Espessura'}
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-1">
              {isMultiCoil ? `${displayOrder.bobinaEspessura} mm` : `${displayOrder.bobinaLargura} x ${displayOrder.bobinaEspessura} mm`}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Peso {isMultiCoil ? 'Total' : 'da Bobina'}
            </div>
            <div className="text-base font-black text-emerald-700 font-mono mt-1">
              {displayOrder.bobinaPesoOriginal} t
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Aproveitamento {isMultiCoil ? 'Médio' : 'Slitter'}
            </div>
            <div className="text-base font-black text-emerald-700 font-mono mt-1">
              {displayOrder.aproveitamentoPercent}%
            </div>
          </div>
        </div>

        {/* Strips por bobina */}
        {bobinas.map((bobina, bIdx) => (
          <div key={bobina.coilId} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                {isMultiCoil && `Bobina ${bIdx + 1} de ${bobinas.length} — Lote ${bobina.bobinaLote} — `}
                Fitas de Slitter a Produzir ({bobina.totalFitas} fitas programadas) & Destinação
              </h3>
              <span className="text-xs font-mono text-slate-600 font-bold">
                Largura Útil: <strong>{bobina.totalLarguraFitas} mm</strong> | Refilo Técnico: <strong className="text-emerald-700">{bobina.sobraMm} mm</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-200 print:border-black">
                <thead>
                  <tr className="bg-slate-100 print:bg-gray-200 border-b border-slate-200 print:border-black text-slate-700 font-mono text-[11px] font-bold">
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black">Fita Slitter</th>
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black">Código Slitter</th>
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black">Material de Destino (Produto Final)</th>
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black">Família</th>
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black text-right">Largura da Fita</th>
                    <th className="py-3 px-3 border-r border-slate-200 print:border-black text-right">Peso do Rolo</th>
                    <th className="py-3 px-3 text-right">Rendimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {bobina.fitas.map((strip, idx) => {
                    const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-black border-r border-slate-200 text-slate-900">
                          Fita {String(strip.stripNumber).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3 font-black text-[#0B1F3A] border-r border-slate-200">
                          <div>{sltInfo.code}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{sltInfo.name}</div>
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-800 font-bold border-r border-slate-200">
                          <div className="font-mono text-[#0B1F3A] font-bold">{strip.productCode}</div>
                          <div className="text-slate-600 truncate">{strip.productDescription}</div>
                        </td>
                        <td className="py-3 px-3 font-sans border-r border-slate-200 font-bold">
                          {strip.productFamily}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 border-r border-slate-200">
                          {strip.largura} mm
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-bold border-r border-slate-200">
                          {strip.pesoTon} t ({strip.pesoKg} kg)
                        </td>
                        <td className="py-3 px-3 text-right text-[#0B1F3A] font-bold">
                          {strip.metrosLineares} m
                        </td>
                      </tr>
                    );
                  })}

                  {/* Scrap row */}
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-3 text-amber-700 border-r border-slate-200">
                      Refilo Lateral
                    </td>
                    <td colSpan={3} className="py-3 px-3 text-slate-600 font-sans border-r border-slate-200">
                      {bobina.sobraMm >= 10 && bobina.sobraMm <= 18
                        ? 'Refilo padrão ideal de corte (10 a 18 mm ~1,5%)'
                        : `Refilo ajustado (${bobina.sobraMm} mm)`}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 border-r border-slate-200 font-black">
                      {bobina.sobraMm} mm
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 border-r border-slate-200 font-black">
                      {bobina.sobraPesoTon} t ({bobina.perdaPercent}%)
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Operational lines & Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 print:border-black">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Dados Operacionais da Linha
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Equipamento / Máquina:</span>
                <input
                  type="text"
                  value={maquina}
                  onChange={(e) => setMaquina(e.target.value)}
                  disabled={isLocked}
                  placeholder="Selecione a máquina no Planejamento"
                  className="bg-transparent border-b border-slate-300 text-right font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Programador PCP:</span>
                <input
                  type="text"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  disabled={isLocked}
                  placeholder="Selecione o operador"
                  className="bg-transparent border-b border-slate-300 text-right font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Turno:</span>
                <input
                  type="text"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  disabled={isLocked}
                  placeholder="Selecione o turno"
                  className="bg-transparent border-b border-slate-300 text-right font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Assinaturas de Liberação
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t-2 border-slate-300 print:border-black pt-2 text-slate-600 font-bold">
                Responsável PCP
              </div>
              <div className="border-t-2 border-slate-300 print:border-black pt-2 text-slate-600 font-bold">
                Operador Slitter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
