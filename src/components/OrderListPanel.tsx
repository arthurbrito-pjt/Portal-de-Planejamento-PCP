import React from 'react';
import { SlitterOrder } from '../types/pcp';
import { ClipboardCheck, Scissors, ChevronRight } from 'lucide-react';

interface OrderListPanelProps {
  orders: SlitterOrder[];
  highlightOrderId?: string | null;
  onOpenOrder: (order: SlitterOrder) => void;
  onNavigateToPlanning: () => void;
}

const STATUS_CLASSES: Record<SlitterOrder['status'], string> = {
  Planejada: 'bg-slate-100 text-slate-700 border-slate-200',
  Liberada: 'bg-[#0B1F3A]/5 text-[#0B1F3A] border-[#0B1F3A]/20',
  'Em Corte': 'bg-orange-50 text-orange-700 border-orange-200',
  'Concluída': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelada: 'bg-red-50 text-red-700 border-red-200'
};

/** Lista das OPs emitidas — exibida na tela de OP quando nenhuma está em edição. */
export const OrderListPanel: React.FC<OrderListPanelProps> = ({ orders, highlightOrderId, onOpenOrder, onNavigateToPlanning }) => {
  const sorted = [...orders].sort((a, b) => (b.dataCriacao || '').localeCompare(a.dataCriacao || ''));

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0B1F3A]/5 text-[#0B1F3A] border border-[#0B1F3A]/15">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Ordens de Produção Emitidas ({orders.length})</h2>
            <p className="text-xs text-slate-500">Clique em uma OP para abrir, imprimir, emitir etiquetas ou alterar o status.</p>
          </div>
        </div>
        <button
          onClick={onNavigateToPlanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-black shadow-md transition-all"
        >
          <Scissors className="w-4 h-4 text-orange-400" />
          <span>Nova OP (Planejamento)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-mono font-bold">
              <th className="py-3 px-4">Número OP</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Bobina(s)</th>
              <th className="py-3 px-4 text-right">Peso (t)</th>
              <th className="py-3 px-4 text-right">Fitas</th>
              <th className="py-3 px-4 text-right">Aproveit.</th>
              <th className="py-3 px-4">Máquina / Operador</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(o => {
              const lotes = o.bobinas?.length ? o.bobinas.map(b => b.bobinaLote) : [o.bobinaLote];
              const peso = o.bobinas?.length ? o.bobinas.reduce((acc, b) => acc + b.bobinaPesoOriginal, 0) : o.bobinaPesoOriginal;
              const isHighlighted = o.id === highlightOrderId;
              return (
                <tr
                  key={o.id}
                  onClick={() => onOpenOrder(o)}
                  className={`cursor-pointer transition-colors ${isHighlighted ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-3 px-4 font-mono font-black text-[#0B1F3A]">{o.numeroOP || o.numeroOS}</td>
                  <td className="py-3 px-4 text-slate-600">{o.dataCriacao}</td>
                  <td className="py-3 px-4 font-mono text-slate-700" title={lotes.join(', ')}>
                    {lotes[0]}{lotes.length > 1 && <span className="text-slate-400"> +{lotes.length - 1}</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{Number(peso.toFixed(3))}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{o.totalFitas}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">{o.aproveitamentoPercent}%</td>
                  <td className="py-3 px-4 text-slate-600">{[o.maquina, o.operador].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${STATUS_CLASSES[o.status] || STATUS_CLASSES.Planejada}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400"><ChevronRight className="w-4 h-4" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
