import React from 'react';
import { FaltaMateriaPrimaRegistro, OrderExecucao, SlitterOrder } from '../types/pcp';
import { OrderExecutionService } from '../services/orderExecutionService';
import { Timer, Scale, AlertTriangle, Gauge } from 'lucide-react';

interface OrderExecutionPanelProps {
  order: SlitterOrder;
  execucao: OrderExecucao;
  faltas: FaltaMateriaPrimaRegistro[];
  disabled?: boolean;
  onChange?: (execucao: OrderExecucao) => void;
}

const toLocalInput = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (value: string): string | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

/** Apontamento de execução da OP (sucata antes/depois, tempo de processo) e resumo de aproveitamento. */
export const OrderExecutionPanel: React.FC<OrderExecutionPanelProps> = ({
  order,
  execucao,
  faltas,
  disabled = false,
  onChange
}) => {
  const editable = !disabled && !!onChange;
  const set = (patch: Partial<OrderExecucao>) => onChange?.({ ...execucao, ...patch });

  const tempoMin = OrderExecutionService.tempoProcessoMin(execucao);
  const sucataRealKg = OrderExecutionService.sucataRealKg(execucao);
  const sucataPlanejadaKg = Math.round(order.sobraPesoTon * 1000);
  const pesoKg = order.bobinaPesoOriginal * 1000;
  const aproveitamentoReal = sucataRealKg !== null && pesoKg > 0
    ? Number((100 - (sucataRealKg / pesoKg) * 100).toFixed(2))
    : null;
  const tonPorHora = tempoMin && tempoMin > 0 ? Number((order.bobinaPesoOriginal / (tempoMin / 60)).toFixed(2)) : null;

  const numberField = (value: number | undefined, key: 'sucataAntesKg' | 'sucataDepoisKg') => (
    <input
      type="number"
      min={0}
      step={0.1}
      value={value ?? ''}
      disabled={!editable}
      onChange={e => set({ [key]: e.target.value === '' ? undefined : Number(e.target.value) })}
      className="w-28 px-2 py-1 rounded-lg border border-slate-200 bg-white text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500 disabled:bg-slate-50 disabled:text-slate-500"
    />
  );

  const dateField = (value: string | undefined, key: 'inicioEm' | 'fimEm') => (
    <input
      type="datetime-local"
      value={toLocalInput(value)}
      disabled={!editable}
      onChange={e => set({ [key]: fromLocalInput(e.target.value) })}
      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 disabled:bg-slate-50 disabled:text-slate-500"
    />
  );

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 print:border-black">
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
        Execução, Sucata & Resumo de Aproveitamento
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 font-black text-slate-800">
            <Scale className="w-4 h-4 text-orange-500" /> Medição pela sucata
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Sucata antes do corte (kg):</span>
            {numberField(execucao.sucataAntesKg, 'sucataAntesKg')}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Sucata depois do corte (kg):</span>
            {numberField(execucao.sucataDepoisKg, 'sucataDepoisKg')}
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 font-mono">
            <span className="text-slate-600 font-sans">Sucata gerada (real):</span>
            <strong className="text-slate-900">{sucataRealKg !== null ? `${sucataRealKg} kg` : '—'}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 font-mono">
            <span className="text-slate-600 font-sans">Refilo planejado:</span>
            <strong className="text-slate-900">{sucataPlanejadaKg} kg</strong>
          </div>
        </div>

        <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 font-black text-slate-800">
            <Timer className="w-4 h-4 text-orange-500" /> Tempo de processo
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Início do corte:</span>
            {dateField(execucao.inicioEm, 'inicioEm')}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Fim do corte:</span>
            {dateField(execucao.fimEm, 'fimEm')}
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 font-mono">
            <span className="text-slate-600 font-sans">Tempo de processo:</span>
            <strong className="text-slate-900">{OrderExecutionService.formatDuration(tempoMin)}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 font-mono">
            <span className="text-slate-600 font-sans flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Produtividade real:</span>
            <strong className="text-slate-900">{tonPorHora !== null ? `${tonPorHora} t/h` : '—'}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Aproveitamento planejado</div>
          <div className="text-base font-black font-mono text-emerald-700 mt-1">{order.aproveitamentoPercent}%</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Aproveitamento real</div>
          <div className="text-base font-black font-mono text-[#0B1F3A] mt-1">
            {aproveitamentoReal !== null ? `${aproveitamentoReal}%` : '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Desvio da sucata</div>
          <div className={`text-base font-black font-mono mt-1 ${
            sucataRealKg === null ? 'text-slate-400' : sucataRealKg > sucataPlanejadaKg ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {sucataRealKg !== null ? `${sucataRealKg - sucataPlanejadaKg > 0 ? '+' : ''}${Number((sucataRealKg - sucataPlanejadaKg).toFixed(1))} kg` : '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Peso processado</div>
          <div className="text-base font-black font-mono text-slate-900 mt-1">{order.bobinaPesoOriginal} t</div>
        </div>
      </div>

      {editable && (
        <textarea
          value={execucao.observacoes || ''}
          onChange={e => set({ observacoes: e.target.value })}
          placeholder="Observações da execução (paradas, ajustes de faca, ocorrências)..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-orange-500 print:hidden"
        />
      )}
      {!editable && execucao.observacoes && (
        <p className="text-xs text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-200">{execucao.observacoes}</p>
      )}

      {faltas.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Não produzidos por falta de matéria-prima ({faltas.length}) — gravado ao concluir a OP
          </div>
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-left text-amber-800 uppercase text-[10px]">
                <th className="py-1">Item</th>
                <th className="py-1 text-right">Espessura</th>
                <th className="py-1 text-right">Demanda</th>
                <th className="py-1 text-right">MP disp.</th>
                <th className="py-1 text-right">Falta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200/70">
              {faltas.map(f => (
                <tr key={f.id}>
                  <td className="py-1 font-bold text-slate-900">{f.produtoCodigo}</td>
                  <td className="py-1 text-right">{f.espessura} mm</td>
                  <td className="py-1 text-right">{f.demandaT} t</td>
                  <td className="py-1 text-right">{f.mpDisponivelT} t</td>
                  <td className="py-1 text-right font-black text-red-700">{f.faltaT} t</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
