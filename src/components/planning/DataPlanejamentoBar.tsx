import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { PeriodoData, PlanningScenarioService } from '../../services/planningScenarioService';
import { Product } from '../../types/pcp';

interface DataPlanejamentoBarProps {
  products: Product[]; // sem filtro de data
  periodo: PeriodoData;
  onChange: (periodo: PeriodoData) => void;
  demandaFiltradaT: number;
  itensFiltrados: number;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

const addDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return PlanningScenarioService.dataIso(d);
};

const inputClass = 'py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400';

/**
 * Período do planejamento (de ... até ...): abre no dia de hoje e o operador ajusta as duas datas,
 * ou usa um atalho. Data em branco = sem limite daquele lado.
 */
export const DataPlanejamentoBar: React.FC<DataPlanejamentoBarProps> = ({ products, periodo, onChange, demandaFiltradaT, itensFiltrados }) => {
  const hoje = PlanningScenarioService.hojeIso();
  const { inicio, fim } = periodo;
  const porData = useMemo(() => PlanningScenarioService.resumoDatas(products), [products]);
  const atrasadoT = useMemo(() => porData.filter(d => d.data < hoje).reduce((a, d) => a + d.qtdT, 0), [porData, hoje]);
  const semDataT = useMemo(() => products.filter(p => !p.demandaPorData?.length).reduce((a, p) => a + (p.demandaT || 0), 0), [products]);
  const aberto = !inicio && !fim;
  const proxima = useMemo(() => porData.find(d => d.data >= (inicio || hoje)), [porData, inicio, hoje]);
  const vazio = !aberto && itensFiltrados === 0;

  const set = (i: string, f: string) => onChange(i && f && i > f ? { inicio: f, fim: i } : { inicio: i, fim: f });

  const diaSemana = (() => {
    const d = new Date(`${hoje}T12:00:00`);
    const dow = (d.getDay() + 6) % 7; // segunda = 0
    return { seg: addDias(hoje, -dow), dom: addDias(hoje, 6 - dow) };
  })();
  const mes = { ini: `${hoje.slice(0, 8)}01`, fim: PlanningScenarioService.dataIso(new Date(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)), 0)) };

  const atalhos: { label: string; periodo: PeriodoData }[] = [
    { label: 'Hoje', periodo: { inicio: hoje, fim: hoje } },
    { label: 'Amanhã', periodo: { inicio: addDias(hoje, 1), fim: addDias(hoje, 1) } },
    { label: 'Próx. 7 dias', periodo: { inicio: hoje, fim: addDias(hoje, 6) } },
    { label: 'Esta semana', periodo: { inicio: diaSemana.seg, fim: diaSemana.dom } },
    { label: 'Este mês', periodo: { inicio: mes.ini, fim: mes.fim } },
    { label: 'Atrasados', periodo: { inicio: '', fim: addDias(hoje, -1) } },
    { label: 'Atrasados + hoje', periodo: { inicio: '', fim: hoje } },
    { label: 'Todas as datas', periodo: { inicio: '', fim: '' } }
  ];
  const ativo = (p: PeriodoData) => p.inicio === inicio && p.fim === fim;

  const rotulo = aberto
    ? 'Toda a programação'
    : inicio && fim
      ? inicio === fim ? PlanningScenarioService.formatData(inicio) : `${PlanningScenarioService.formatData(inicio)} a ${PlanningScenarioService.formatData(fim)}`
      : inicio ? `a partir de ${PlanningScenarioService.formatData(inicio)}` : `até ${PlanningScenarioService.formatData(fim)}`;

  const ehHoje = inicio === hoje && fim === hoje;
  const futuro = !!inicio && inicio > hoje;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
      {ehHoje ? (
        <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
          Planejando a demanda do dia: hoje, {PlanningScenarioService.formatData(hoje)} (data da máquina). A otimização usa só o que está programado para hoje.
        </div>
      ) : futuro ? (
        <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 font-bold flex flex-wrap items-center gap-2">
          <span>Planejamento antecipado: o período escolhido é futuro ({rotulo}). Para produzir o que é do dia, volte para hoje.</span>
          <button onClick={() => onChange({ inicio: hoje, fim: hoje })} className="underline">Voltar para hoje</button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#0B1F3A]">
          <CalendarDays className="w-4 h-4 text-orange-500" /> Período do planejamento
        </span>
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          De
          <input type="date" value={inicio} onChange={e => set(e.target.value, fim)} className={inputClass} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          Até
          <input type="date" value={fim} onChange={e => set(inicio, e.target.value)} className={inputClass} />
        </label>
        <span className="ml-auto text-xs text-slate-600">
          {rotulo}: <strong className="font-mono text-[#0B1F3A]">{fmt(demandaFiltradaT)} t</strong> em <strong className="font-mono">{itensFiltrados}</strong> item(ns)
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {atalhos.map(a => (
          <button
            key={a.label}
            onClick={() => onChange(a.periodo)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
              ativo(a.periodo) ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]' : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {vazio && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center gap-2">
          <span>Nada programado neste período.</span>
          {proxima && (
            <button onClick={() => onChange({ inicio: proxima.data, fim: proxima.data })} className="underline font-bold">
              Ir para {PlanningScenarioService.formatData(proxima.data)} ({fmt(proxima.qtdT)} t)
            </button>
          )}
          <button onClick={() => onChange({ inicio: '', fim: '' })} className="underline font-bold">Ver todas as datas</button>
        </div>
      )}

      {inicio >= hoje && inicio !== '' && atrasadoT > 0.05 && (
        <div className="text-[11px] text-slate-500">
          Há <strong className="text-red-600">{fmt(atrasadoT)} t</strong> programadas para datas anteriores a hoje e ainda não produzidas.{' '}
          <button onClick={() => onChange({ inicio: '', fim })} className="underline font-bold text-[#0B1F3A]">Incluir atrasados</button>
        </div>
      )}

      {!aberto && semDataT > 0.05 && (
        <div className="text-[11px] text-slate-500">
          Há <strong className="text-slate-700">{fmt(semDataT)} t</strong> de demanda sem data de programação (fora da planilha de programação); só aparecem em "Todas as datas".
        </div>
      )}

      {porData.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {porData.slice(0, 40).map(d => {
            const dentro = !aberto && (!inicio || d.data >= inicio) && (!fim || d.data <= fim);
            return (
              <button
                key={d.data}
                onClick={() => onChange({ inicio: d.data, fim: d.data })}
                className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                  dentro ? 'bg-orange-500 text-white border-orange-500' : d.data < hoje ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-400' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-400'
                }`}
                title={`${PlanningScenarioService.formatData(d.data)}: ${fmt(d.qtdT)} t programadas`}
              >
                {d.data.slice(8, 10)}/{d.data.slice(5, 7)} · {fmt(d.qtdT)} t
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
