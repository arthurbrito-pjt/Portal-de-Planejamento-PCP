import React from 'react';
import { SlitterDemandItem, FerramentalClasse } from '../types/pcp';
import { MetricsBadge } from './MetricsBadge';
import { CheckCircle, AlertTriangle, XCircle, Sparkles, Sliders, PackageCheck, Hourglass } from 'lucide-react';

interface OpSuggestionCardProps {
  item: SlitterDemandItem;
  wipAvailableTon: number;
  ferramentalClasse?: FerramentalClasse;
  ferramentalPronta?: boolean;
  ferramentalStatusAcumulo?: string;
  onAccept: () => void;
  onCustomize: () => void;
}

export const OpSuggestionCard: React.FC<OpSuggestionCardProps> = ({
  item,
  wipAvailableTon,
  ferramentalClasse,
  ferramentalPronta,
  ferramentalStatusAcumulo,
  onAccept,
  onCustomize
}) => {
  const p = item.mainProduct;
  const isReady = item.status === 'PRONTO';
  const isPartial = item.status === 'PARCIAL';
  const isBlocked = item.status === 'BLOQUEADO';
  const hasWip = wipAvailableTon > 0;
  const isFerramentalWaiting = ferramentalClasse === 'C' && ferramentalPronta === false;
  const effectiveDemandTon = item.effectiveDemandTon ?? item.totalDemandaT;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-orange-300 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black font-mono text-[#0B1F3A]">{item.codigoSlitter}</span>
        {isReady ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
            <CheckCircle className="w-3 h-3" /> Pronto
          </span>
        ) : isPartial ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
            <AlertTriangle className="w-3 h-3" /> Parcial
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-medium">
            <XCircle className="w-3 h-3" /> Sem Bobina
          </span>
        )}
      </div>

      <div>
        <h4 className="text-xs text-slate-700 font-medium line-clamp-1">{item.nomeSlitter}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">Destino: {p.codigo} ({p.descricao})</p>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <MetricsBadge type="familia" value={p.familia} size="sm" />
          {p.grauDificuldade && <MetricsBadge type="dificuldade" value={p.grauDificuldade} size="sm" />}
          {ferramentalClasse && <MetricsBadge type="ferramental_abc" value={ferramentalClasse} size="sm" />}
          {!item.ferramentalCadastrado && <MetricsBadge type="ferramental_cadastro" value="" size="sm" />}
        </div>
      </div>

      {hasWip && (
        <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5"><PackageCheck className="w-3.5 h-3.5" /> Estoque Intermediário:</span>
          <span>
            {wipAvailableTon.toFixed(1)}t prontas
            {!item.coveredByWipOnly && ` (faltam ${effectiveDemandTon.toFixed(1)}t)`}
          </span>
        </div>
      )}

      {/* Plano sugerido pelo sistema — já pré-computado, considerando estoque intermediário */}
      {!isBlocked && !item.coveredByWipOnly && item.bestCoil && (
        <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-200/80 text-[11px] text-orange-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-orange-900">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Plano sugerido pelo sistema{hasWip ? ' (após descontar estoque)' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-orange-950">
            <span>Bobina lote {item.bestCoil.lote}</span>
            <span>{item.bestCoil.peso}t</span>
            <span>Rendimento {item.estimatedYieldPercent}%</span>
            <span>Refilo {item.estimatedScrapMm}mm</span>
          </div>
        </div>
      )}

      {isFerramentalWaiting && (
        <div className="p-1.5 bg-violet-50 text-violet-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
          <Hourglass className="w-3.5 h-3.5 shrink-0" />
          <span>{ferramentalStatusAcumulo || 'Aguardando acúmulo de lote (Classe C)'}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
        <div className="p-1.5 rounded-lg bg-slate-50">
          <span className="text-slate-400 block text-[10px] uppercase">Fita</span>
          <strong className="text-[#0B1F3A] font-bold font-mono">{item.larguraFita} mm</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50">
          <span className="text-slate-400 block text-[10px] uppercase">Espessura</span>
          <strong className="text-violet-700 font-semibold font-mono">{item.espessura} mm</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50">
          <span className="text-slate-400 block text-[10px] uppercase">Demanda</span>
          <strong className="text-amber-700 font-semibold font-mono">{item.totalDemandaT} t</strong>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {item.coveredByWipOnly ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Coberto por estoque — nenhum corte necessário</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isBlocked}
            onClick={onAccept}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isBlocked
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : hasWip
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : isFerramentalWaiting
                ? 'bg-violet-100 hover:bg-violet-200 text-violet-800'
                : 'bg-[#0B1F3A] hover:bg-[#163866] text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isBlocked
                ? 'Sem bobina disponível'
                : hasWip
                ? 'Aceitar Plano (usa estoque + corte)'
                : isFerramentalWaiting
                ? 'Forçar Setup Antecipado'
                : 'Aceitar Plano Sugerido'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onCustomize}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5"
          title="Ajustar manualmente quantidade e bobina"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalizar</span>
        </button>
      </div>
    </div>
  );
};
