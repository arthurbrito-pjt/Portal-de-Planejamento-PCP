import React, { useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModoData, PlanningScenarioService } from '../../services/planningScenarioService';
import { Product } from '../../types/pcp';

interface DataPlanejamentoBarProps {
  products: Product[]; // sem filtro de data
  modo: ModoData;
  data: string;
  onChange: (modo: ModoData, data: string) => void;
  demandaFiltradaT: number;
  itensFiltrados: number;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

const addDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return PlanningScenarioService.dataIso(d);
};

/**
 * Data de planejamento: abre no dia de hoje e o operador troca para o dia que quer programar.
 * "No dia" mostra só o que está programado para a data; "Até o dia" soma também o que ficou atrasado.
 */
export const DataPlanejamentoBar: React.FC<DataPlanejamentoBarProps> = ({ products, modo, data, onChange, demandaFiltradaT, itensFiltrados }) => {
  const hoje = PlanningScenarioService.hojeIso();
  const porData = useMemo(() => PlanningScenarioService.resumoDatas(products), [products]);
  const atrasadoT = useMemo(() => porData.filter(d => d.data < hoje).reduce((a, d) => a + d.qtdT, 0), [porData, hoje]);
  const proxima = useMemo(() => porData.find(d => d.data >= data), [porData, data]);
  const semDataT = useMemo(() => products.filter(p => !p.demandaPorData?.length).reduce((a, p) => a + (p.demandaT || 0), 0), [products]);
  const vazio = modo !== 'todas' && itensFiltrados === 0;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#0B1F3A]">
          <CalendarDays className="w-4 h-4 text-orange-500" /> Data do planejamento
        </span>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {([['dia', 'No dia'], ['ate', 'Até o dia (com atrasados)'], ['todas', 'Todas as datas']] as [ModoData, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onChange(id, data)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${modo === id ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {modo !== 'todas' && (
          <div className="flex items-center gap-1">
            <button onClick={() => onChange(modo, addDias(data, -1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" title="Dia anterior"><ChevronLeft className="w-4 h-4" /></button>
            <input
              type="date"
              value={data}
              onChange={e => e.target.value && onChange(modo, e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
            <button onClick={() => onChange(modo, addDias(data, 1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" title="Próximo dia"><ChevronRight className="w-4 h-4" /></button>
            <button
              onClick={() => onChange(modo, hoje)}
              disabled={data === hoje}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Hoje
            </button>
          </div>
        )}
        <span className="ml-auto text-xs text-slate-600">
          {modo === 'todas' ? 'Toda a programação' : `${PlanningScenarioService.formatData(data)}${modo === 'ate' ? ' e anteriores' : ''}`}:{' '}
          <strong className="font-mono text-[#0B1F3A]">{fmt(demandaFiltradaT)} t</strong> em <strong className="font-mono">{itensFiltrados}</strong> item(ns)
        </span>
      </div>

      {vazio && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center gap-2">
          <span>Nada programado {modo === 'dia' ? 'para este dia' : 'até esta data'}.</span>
          {proxima && (
            <button onClick={() => onChange(modo, proxima.data)} className="underline font-bold">
              Ir para {PlanningScenarioService.formatData(proxima.data)} ({fmt(proxima.qtdT)} t)
            </button>
          )}
          <button onClick={() => onChange('todas', data)} className="underline font-bold">Ver todas as datas</button>
        </div>
      )}

      {modo === 'dia' && atrasadoT > 0.05 && data >= hoje && (
        <div className="text-[11px] text-slate-500">
          Há <strong className="text-red-600">{fmt(atrasadoT)} t</strong> programadas para datas anteriores a hoje e ainda não produzidas.{' '}
          <button onClick={() => onChange('ate', data)} className="underline font-bold text-[#0B1F3A]">Incluir atrasados</button>
        </div>
      )}

      {modo !== 'todas' && semDataT > 0.05 && (
        <div className="text-[11px] text-slate-500">
          Há <strong className="text-slate-700">{fmt(semDataT)} t</strong> de demanda sem data de programação (fora da planilha de programação); só aparecem em "Todas as datas".
        </div>
      )}

      {porData.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {porData.slice(0, 40).map(d => (
            <button
              key={d.data}
              onClick={() => onChange(modo === 'todas' ? 'dia' : modo, d.data)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                modo !== 'todas' && d.data === data ? 'bg-orange-500 text-white border-orange-500' : d.data < hoje ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-400' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-400'
              }`}
              title={`${PlanningScenarioService.formatData(d.data)}: ${fmt(d.qtdT)} t programadas`}
            >
              {d.data.slice(8, 10)}/{d.data.slice(5, 7)} · {fmt(d.qtdT)} t
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
