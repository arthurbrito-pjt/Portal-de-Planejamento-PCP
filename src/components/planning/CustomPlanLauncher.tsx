import React, { useMemo, useState } from 'react';
import { Coil } from '../../types/pcp';
import { Search, Sliders, X } from 'lucide-react';

interface CustomPlanLauncherProps {
  coils: Coil[];
  onStart: (coil: Coil) => void;
  onClose: () => void;
}

/**
 * Plano personalizado: escolhe qualquer bobina disponível e abre o Estúdio de
 * Corte vazio para montar o corte do zero (item, largura de cada fita, ordem).
 */
export const CustomPlanLauncher: React.FC<CustomPlanLauncherProps> = ({ coils, onStart, onClose }) => {
  const [query, setQuery] = useState('');

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coils
      .filter(c => c.status === 'Disponível')
      .filter(c => !q || c.lote.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || `${c.espessura}`.includes(q) || `${c.largura}`.includes(q))
      .sort((a, b) => a.espessura - b.espessura || b.peso - a.peso);
  }, [coils, query]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-orange-300 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-500" /> Criar Plano Personalizado
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Escolha a bobina e monte o corte no Estúdio: adicione itens (inclusive fora da programação), ajuste a largura de cada fita e a ordem.
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

      <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Lote</th>
              <th className="py-2 px-3">Código</th>
              <th className="py-2 px-3 text-right">Espessura</th>
              <th className="py-2 px-3 text-right">Largura</th>
              <th className="py-2 px-3 text-right">Peso</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {available.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-black text-[#0B1F3A]">{c.lote}</td>
                <td className="py-2 px-3 text-slate-600">{c.codigo}</td>
                <td className="py-2 px-3 text-right text-purple-700">{c.espessura} mm</td>
                <td className="py-2 px-3 text-right text-slate-900 font-bold">{c.largura} mm</td>
                <td className="py-2 px-3 text-right text-emerald-700 font-bold">{c.peso} t</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => onStart(c)}
                    className="px-3 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#163866] text-white text-[11px] font-bold font-sans"
                  >
                    Montar corte
                  </button>
                </td>
              </tr>
            ))}
            {available.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">Nenhuma bobina disponível encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
