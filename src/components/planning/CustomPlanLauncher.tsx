import React, { useMemo, useState } from 'react';
import { Coil, PlanTemplate, Product, SlitterStrip } from '../../types/pcp';
import { SlitterProductionProgram } from '../../services/readinessService';
import { SlitterOptimizer } from '../../services/slitterOptimizer';
import { StorageService } from '../../services/storageService';
import { StripFactory } from '../../services/stripFactory';
import { Search, Sliders, Sparkles, Trash2, X } from 'lucide-react';

interface CustomPlanLauncherProps {
  coils: Coil[];
  products: Product[];
  readyPlans: SlitterProductionProgram[];
  onStart: (coil: Coil, strips: SlitterStrip[]) => void;
  onClose: () => void;
}

/**
 * Plano personalizado: escolhe qualquer bobina disponível e abre o Estúdio de
 * Corte para montar o corte — do zero, a partir do plano pronto sugerido pelo
 * sistema para aquela bobina ou a partir de um modelo salvo pelo PCP.
 */
export const CustomPlanLauncher: React.FC<CustomPlanLauncherProps> = ({ coils, products, readyPlans, onStart, onClose }) => {
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<PlanTemplate[]>(() => StorageService.getPlanTemplates());
  const [templateByCoil, setTemplateByCoil] = useState<Record<string, string>>({});

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coils
      .filter(c => c.status === 'Disponível')
      .filter(c => !q || c.lote.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || `${c.espessura}`.includes(q) || `${c.largura}`.includes(q))
      .sort((a, b) => a.espessura - b.espessura || b.peso - a.peso);
  }, [coils, query]);

  const readyPlanByCoil = useMemo(() => {
    const map = new Map<string, SlitterProductionProgram>();
    readyPlans.forEach(p => { if (!map.has(p.coil.id)) map.set(p.coil.id, p); });
    return map;
  }, [readyPlans]);

  const removeTemplate = (id: string) => {
    StorageService.deletePlanTemplate(id);
    setTemplates(StorageService.getPlanTemplates());
  };

  const startFromTemplate = (coil: Coil) => {
    const tpl = templates.find(t => t.id === templateByCoil[coil.id]);
    if (!tpl) return;
    const strips = StripFactory.fromTemplate(tpl, coil, products);
    onStart(coil, strips);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-orange-300 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-500" /> Criar Plano Personalizado
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Escolha a bobina e como começar: do zero, pelo plano pronto do sistema ou por um modelo salvo. No Estúdio você adiciona bobinas e materiais e ajusta largura e ordem das fitas.
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Fechar">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por lote, código, espessura ou largura..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0B1F3A]"
        />
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Lote</th>
              <th className="py-2 px-3">Código</th>
              <th className="py-2 px-3 text-right">Espessura</th>
              <th className="py-2 px-3 text-right">Largura</th>
              <th className="py-2 px-3 text-right">Peso</th>
              <th className="py-2 px-3">Como começar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {available.map(c => {
              const ready = readyPlanByCoil.get(c.id);
              const coilTemplates = templates.filter(t => Math.abs(t.espessura - c.espessura) < 0.001);
              return (
                <tr key={c.id} className="hover:bg-slate-50 align-top">
                  <td className="py-2 px-3 font-black text-[#0B1F3A]">{c.lote}</td>
                  <td className="py-2 px-3 text-slate-600">{c.codigo}</td>
                  <td className="py-2 px-3 text-right text-purple-700">{c.espessura} mm</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">{c.largura} mm</td>
                  <td className="py-2 px-3 text-right text-emerald-700 font-bold">{c.peso} t</td>
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap items-center gap-1.5 font-sans">
                      <button
                        onClick={() => onStart(c, [])}
                        className="px-2.5 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#163866] text-white text-[11px] font-bold"
                      >
                        Do zero
                      </button>
                      {ready && (
                        <button
                          onClick={() => onStart(c, SlitterOptimizer.generateStripsFromCombination(ready.combination, c))}
                          title={`Plano sugerido: ${ready.totalFitas} fitas, refilo ${ready.sobraMm} mm`}
                          className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Plano pronto ({ready.mainProduct.codigo})
                        </button>
                      )}
                      {coilTemplates.length > 0 && (
                        <>
                          <select
                            value={templateByCoil[c.id] || ''}
                            onChange={e => setTemplateByCoil(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] bg-white max-w-[160px]"
                          >
                            <option value="">Modelo salvo...</option>
                            {coilTemplates.map(t => (
                              <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => startFromTemplate(c)}
                            disabled={!templateByCoil[c.id]}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-orange-400 text-slate-700 text-[11px] font-bold disabled:opacity-40"
                          >
                            Aplicar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {available.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">Nenhuma bobina disponível encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {templates.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">Modelos salvos ({templates.length})</div>
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-700 font-mono">
                {t.nome} · {t.espessura} mm · {t.fitas.length} fitas
                <button onClick={() => removeTemplate(t.id)} title="Excluir modelo" className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
