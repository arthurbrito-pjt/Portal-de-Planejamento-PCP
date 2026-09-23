import React, { useMemo, useState } from 'react';
import { Coil, Product, SlitterOrder, Ferramental, SlitterIntermediaryItem } from '../../types/pcp';
import { ReadinessService, SlitterProductionProgram } from '../../services/readinessService';
import { ProductionForecastService } from '../../services/productionForecastService';
import { MetricsBadge } from '../../components/MetricsBadge';
import {
  AlertTriangle,
  Hourglass,
  Clock3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardHomeProps {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  ferramentais: Ferramental[];
  intermediarySlitters: SlitterIntermediaryItem[];
  onNavigateToPlanning: (productId?: string) => void;
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
  onNavigateToSubview: (subview: string) => void;
}

interface HomeAlert {
  id: string;
  tone: 'red' | 'violet' | 'amber';
  icon: React.ElementType;
  message: React.ReactNode;
  onClick: () => void;
}

const TONE_CLASSES: Record<HomeAlert['tone'], string> = {
  red: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
  violet: 'bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100',
  amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
};

const ICON_CLASSES: Record<HomeAlert['tone'], string> = {
  red: 'text-red-600',
  violet: 'text-violet-600',
  amber: 'text-amber-600'
};

const TONE_WEIGHT: Record<HomeAlert['tone'], number> = { red: 3, violet: 2, amber: 1 };

const VISIBLE_ALERTS_DEFAULT = 4;
const VISIBLE_SUGGESTIONS = 3;

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  products,
  coils,
  orders,
  ferramentais,
  intermediarySlitters,
  onNavigateToPlanning,
  onOpenProgramSimulation,
  onOpenProgramOrder,
  onNavigateToSubview
}) => {
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const slitterPrograms = useMemo(
    () => ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    [products, coils, intermediarySlitters]
  );
  const schedule3Days = useMemo(() => ReadinessService.generate3DaySchedule(slitterPrograms, orders), [slitterPrograms, orders]);
  const toolingAnalysis = useMemo(() => ReadinessService.analyzeToolingABC(ferramentais, products), [ferramentais, products]);
  const slitterDemands = useMemo(() => {
    const list = ReadinessService.analyzeSlitters(products, coils, intermediarySlitters);
    return ReadinessService.sortSlittersByReadiness(list);
  }, [products, coils, intermediarySlitters]);

  const forecastPendencias = useMemo(() => {
    return products
      .map(p => ProductionForecastService.calculateItemForecast(p, coils, orders, intermediarySlitters, ferramentais))
      .filter(f => f.statusAtendimento === 'AGUARDANDO_MP');
  }, [products, coils, orders, intermediarySlitters, ferramentais]);

  const setupFragmentationDays = useMemo(() => schedule3Days.days.filter(d => !!d.alertaSetup), [schedule3Days]);
  const ferramentaisAguardandoLote = useMemo(
    () => toolingAnalysis.filter(t => t.ferramental.classe === 'C' && !t.prontaParaSetup),
    [toolingAnalysis]
  );

  const topReadySlitters = useMemo(
    () => slitterDemands.filter(s => s.status === 'PRONTO').slice(0, VISIBLE_SUGGESTIONS),
    [slitterDemands]
  );
  const totalReadyCount = useMemo(() => slitterDemands.filter(s => s.status === 'PRONTO').length, [slitterDemands]);

  const findProgramForSlitter = (item: (typeof slitterDemands)[number]): SlitterProductionProgram | undefined => {
    if (!item.bestCoil) return undefined;
    return slitterPrograms.find(p => p.coil.id === item.bestCoil!.id);
  };

  const allAlerts: HomeAlert[] = useMemo(() => {
    const alerts: HomeAlert[] = [];

    forecastPendencias.forEach(f => alerts.push({
      id: `mp_${f.produto.id}`,
      tone: 'red',
      icon: Clock3,
      message: <><strong className="font-mono font-medium">{f.produto.codigo}</strong> sem matéria-prima disponível — previsão D+2 comprometida</>,
      onClick: () => onNavigateToPlanning(f.produto.id)
    }));

    ferramentaisAguardandoLote.forEach(item => alerts.push({
      id: `abc_${item.ferramental.id}`,
      tone: 'violet',
      icon: Hourglass,
      message: <><strong className="font-mono font-medium">{item.ferramental.codigo}</strong> (Classe C) — {item.statusAcumulo}</>,
      onClick: () => onNavigateToSubview('ferramental-abc')
    }));

    setupFragmentationDays.forEach(day => alerts.push({
      id: `setup_${day.diaIndice}`,
      tone: 'amber',
      icon: AlertTriangle,
      message: <><strong className="font-medium">{day.dataRotulo}:</strong> {day.alertaSetup}</>,
      onClick: () => onNavigateToSubview('agenda-3-dias')
    }));

    return alerts.sort((a, b) => TONE_WEIGHT[b.tone] - TONE_WEIGHT[a.tone]);
  }, [forecastPendencias, ferramentaisAguardandoLote, setupFragmentationDays, onNavigateToPlanning, onNavigateToSubview]);

  const visibleAlerts = showAllAlerts ? allAlerts : allAlerts.slice(0, VISIBLE_ALERTS_DEFAULT);
  const hiddenAlertsCount = allAlerts.length - visibleAlerts.length;

  return (
    <div className="space-y-4">
      {allAlerts.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span>Pendências e alertas ({allAlerts.length})</span>
          </h4>

          <div className="space-y-1.5">
            {visibleAlerts.map(alert => {
              const Icon = alert.icon;
              return (
                <button
                  key={alert.id}
                  onClick={alert.onClick}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 border rounded-lg text-left text-xs transition-colors ${TONE_CLASSES[alert.tone]}`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${ICON_CLASSES[alert.tone]}`} />
                    <span className="truncate">{alert.message}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              );
            })}
          </div>

          {allAlerts.length > VISIBLE_ALERTS_DEFAULT && (
            <button
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 pt-1"
            >
              {showAllAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{showAllAlerts ? 'Mostrar menos' : `Mostrar mais ${hiddenAlertsCount} alerta(s)`}</span>
            </button>
          )}
        </div>
      )}

      {allAlerts.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sem pendências no momento — tudo em dia.</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Prontos para virar OP agora {totalReadyCount > 0 && `(${totalReadyCount})`}
          </h4>
          <button onClick={() => onNavigateToSubview('prontidao-demanda')} className="text-[11px] text-[#0B1F3A] hover:text-orange-600 hover:underline font-bold">
            Ver todos
          </button>
        </div>

        {topReadySlitters.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">Nenhum slitter pronto para produção no momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topReadySlitters.map(item => {
              const program = findProgramForSlitter(item);
              return (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors space-y-2.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-[#0B1F3A]">{item.codigoSlitter}</span>
                    <MetricsBadge type="familia" value={item.mainProduct.familia} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 font-medium">{item.nomeSlitter}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>{item.totalDemandaT}t demanda</span>
                    <span className="text-emerald-700 font-bold">{item.estimatedYieldPercent}% rend.</span>
                  </div>
                  <button
                    onClick={() => program ? onOpenProgramOrder(program) : onNavigateToPlanning(item.mainProduct.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black rounded-lg shadow-sm shadow-orange-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Gerar OP</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
