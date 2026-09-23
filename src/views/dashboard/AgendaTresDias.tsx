import React, { useMemo } from 'react';
import { Coil, Product, SlitterOrder, SlitterIntermediaryItem } from '../../types/pcp';
import { AlertTriangle, Zap } from 'lucide-react';
import { ReadinessService, SlitterProductionProgram } from '../../services/readinessService';
import { MetricsBadge } from '../../components/MetricsBadge';

interface AgendaTresDiasProps {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
}

export const AgendaTresDias: React.FC<AgendaTresDiasProps> = ({
  products,
  coils,
  orders,
  intermediarySlitters = [],
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const slitterPrograms = useMemo(
    () => ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    [products, coils, intermediarySlitters]
  );
  const schedule3Days = useMemo(() => ReadinessService.generate3DaySchedule(slitterPrograms, orders), [slitterPrograms, orders]);

  return (
    <div className="space-y-4">
      {/* Banner Cedisa Dark Blue + Orange */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0B1F3A] to-[#163866] border border-[#1E487C] px-5 py-3.5 rounded-xl text-white shadow-md">
        <div className="flex items-center gap-2 text-sm font-black">
          <Zap className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Horizonte Rolante de 3 Dias — Cedisa Central de Aço</span>
          <span className="text-slate-300 font-normal text-xs hidden sm:inline">• Agrupamento por espessura para redução de setups</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-300">Capacidade: <strong className="text-white font-bold">120 t/dia</strong></span>
          <span className="text-slate-300">Refilo alvo: <strong className="text-emerald-400 font-bold">10-18 mm</strong></span>
        </div>
      </div>

      {schedule3Days.backlog.volumeTon > 0 && (
        <div className="flex items-start gap-2.5 p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <span>
            <strong className="font-bold">{schedule3Days.backlog.volumeTon.toLocaleString('pt-BR')} t</strong> em{' '}
            <strong className="font-bold">{schedule3Days.backlog.programs.length}</strong> lote(s) excedem a capacidade do horizonte de 3 dias (120 t/dia) e ainda não têm data de corte — fila além de D+2.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {schedule3Days.days.map((day) => {
          const dayProgs = schedule3Days.programsByDay[day.diaIndice] || [];
          const isToday = day.diaIndice === 0;
          const occupiedPercent = Math.round((day.volumeProgramadoTon / day.capacidadeNominalTon) * 100);

          return (
            <div
              key={day.diaIndice}
              className={`bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden transition-all ${
                isToday ? 'border-orange-300 ring-2 ring-orange-500/20 shadow-md' : 'border-slate-200'
              }`}
            >
              <div className={`p-4 border-b ${isToday ? 'bg-orange-50/70 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase tracking-wide ${isToday ? 'text-orange-700' : 'text-slate-500'}`}>
                    {day.dataRotulo}
                  </span>
                  {isToday && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-wide shadow-xs">
                      Em Corte
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-black text-slate-900">
                    {day.volumeProgramadoTon} <span className="text-xs font-normal text-slate-400">/ {day.capacidadeNominalTon} t</span>
                  </span>
                  <span className="text-xs font-bold text-slate-600">{occupiedPercent}% ocupado</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${occupiedPercent >= 95 ? 'bg-emerald-500' : occupiedPercent >= 60 ? 'bg-orange-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(100, occupiedPercent)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Folga PCP</div>
                    <div className="text-xs font-black text-emerald-700">{day.folgaPlanejamentoPercent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sucata Prev.</div>
                    <div className="text-xs font-black text-slate-700">{day.sucataMediaPercent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ton / Setup</div>
                    <div className={`text-xs font-black ${day.toneladasPorSetup < 20 && day.volumeProgramadoTon > 0 ? 'text-orange-600' : 'text-slate-700'}`}>
                      {day.toneladasPorSetup} t
                    </div>
                  </div>
                </div>

                {day.alertaSetup && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-1.5 text-[11px] text-orange-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{day.alertaSetup}</span>
                  </div>
                )}
              </div>

              <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px] space-y-2">
                {dayProgs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Nenhum corte alocado para este dia ainda.</div>
                ) : (
                  dayProgs.map((prog, pIdx) => (
                    <div key={pIdx} className="pt-2 first:pt-0 pb-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-slate-900">Lote {prog.coil.lote}</span>
                        <span className="font-mono text-[11px] font-bold text-[#0B1F3A]">
                          {prog.coil.peso} t • {prog.coil.largura}x{prog.coil.espessura}mm
                        </span>
                      </div>

                      {prog.coil.statusContabil === 'PENDENTE_AJUSTE' && (
                        <div className="mb-1.5">
                          <MetricsBadge type="contabil" value="PENDENTE_AJUSTE" size="sm" />
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">{prog.combination.descricao}</div>

                      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-emerald-700 font-bold">
                          {prog.aproveitamentoPercent}% Aprov. (Refilo {prog.sobraMm}mm)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenProgramSimulation(prog)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-bold text-[10px] transition-colors"
                          >
                            Simular
                          </button>
                          <button
                            onClick={() => onOpenProgramOrder(prog)}
                            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-bold text-[10px] shadow-xs transition-colors"
                          >
                            Gerar OP
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
