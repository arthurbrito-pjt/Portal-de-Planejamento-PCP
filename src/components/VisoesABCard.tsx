import React from 'react';
import { Loader2 } from 'lucide-react';
import { ResultadoCenario, VisaoOtimizacao } from '../services/planningScenarioService';

export interface VisoesAB {
  A: ResultadoCenario;
  B: ResultadoCenario;
}

interface VisoesABCardProps {
  visoes: VisoesAB | 'carregando' | undefined;
  onUsar: (visao: VisaoOtimizacao) => void;
}

const TITULOS: Record<VisaoOtimizacao, { nome: string; sub: string }> = {
  A: { nome: 'Visão A', sub: 'melhor aproveitamento' },
  B: { nome: 'Visão B', sub: 'menos trocas de facas' }
};

/** Segunda e terceira opções do plano do slitter: sempre ao lado do plano sugerido. */
export const VisoesABCard: React.FC<VisoesABCardProps> = ({ visoes, onUsar }) => {
  if (visoes === 'carregando' || !visoes) {
    return (
      <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando Visões A e B deste plano...
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {(['A', 'B'] as VisaoOtimizacao[]).map(v => {
        const r = visoes[v];
        const m = r.metricas;
        const sem = r.planos.length === 0;
        return (
          <div key={v} className="p-2 rounded-lg border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 text-[11px] space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-[#0B1F3A]">{TITULOS[v].nome} <span className="font-medium text-slate-500">· {TITULOS[v].sub}</span></span>
              <button
                type="button"
                onClick={() => onUsar(v)}
                disabled={sem}
                className="px-2.5 py-1 rounded-md bg-[#0B1F3A] hover:bg-[#163866] text-white text-[10px] font-black disabled:opacity-40"
              >
                Usar esta
              </button>
            </div>
            {sem ? (
              <div className="text-slate-500">Sem plano válido (refilo 6–9 mm por lado) com as bobinas em estoque.</div>
            ) : (
              <div className="font-mono text-slate-700 flex flex-wrap gap-x-3 gap-y-0.5">
                <span>{m.qtdBobinas} bobina(s)</span>
                <span>aproveit. {m.aproveitamentoPercent}%</span>
                <span>refilo {m.refiloMedioMm} mm</span>
                <span>{m.setups} setup(s) · {m.trocasFacas} troca(s)</span>
                <span className={m.atendimentoPercent >= 99 ? 'text-emerald-700 font-bold' : ''}>atende {m.atendimentoPercent}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
