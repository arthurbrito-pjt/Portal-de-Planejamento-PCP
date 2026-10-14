import React, { useMemo, useState } from 'react';
import { Coil, Product, SlitterOrder, Ferramental, SlitterIntermediaryItem, PCPKPIs } from '../../types/pcp';
import { ReadinessService, SlitterProductionProgram } from '../../services/readinessService';
import { ProductionForecastService } from '../../services/productionForecastService';
import { StorageService } from '../../services/storageService';
import { MetricsBadge } from '../../components/MetricsBadge';
import {
  AlertTriangle,
  Hourglass,
  Clock3,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Wrench,
  Boxes,
  Disc,
  Scissors,
  TrendingUp,
  Target,
  PackageCheck
} from 'lucide-react';

interface DashboardHomeProps {
  kpis: PCPKPIs;
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  ferramentais: Ferramental[];
  intermediarySlitters: SlitterIntermediaryItem[];
  onNavigateToPlanning: (productId?: string) => void;
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
  onNavigateToSubview: (subview: string) => void;
  onNavigateToData: () => void;
  onNavigateToOrders: () => void;
}

interface HomeAlert {
  id: string;
  tone: 'red' | 'violet' | 'amber';
  icon: React.ElementType;
  message: React.ReactNode;
  actionLabel: string;
  onClick: () => void;
}

const TONE_BAR: Record<HomeAlert['tone'], string> = {
  red: 'border-l-red-500',
  violet: 'border-l-violet-500',
  amber: 'border-l-amber-500'
};

const ICON_CLASSES: Record<HomeAlert['tone'], string> = {
  red: 'text-red-600',
  violet: 'text-violet-600',
  amber: 'text-amber-600'
};

const TONE_WEIGHT: Record<HomeAlert['tone'], number> = { red: 3, violet: 2, amber: 1 };

const VISIBLE_ALERTS_DEFAULT = 3;
const VISIBLE_READY = 4;

const KpiTile: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, sub, onClick }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white text-left shadow-xs ${
        onClick ? 'hover:border-orange-300 hover:shadow-md transition-all cursor-pointer' : ''
      }`}
    >
      <div className="p-2.5 rounded-xl bg-[#0B1F3A] shrink-0">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wide truncate">{label}</div>
        <div className="text-2xl font-black text-[#0B1F3A] leading-tight font-mono">{value}</div>
        <div className="text-[11px] text-slate-500 font-medium truncate">{sub}</div>
      </div>
    </Wrapper>
  );
};

const ShortcutCard: React.FC<{
  icon: React.ElementType;
  title: string;
  summary: React.ReactNode;
  onClick: () => void;
}> = ({ icon: Icon, title, summary, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white text-left hover:border-[#0B1F3A] hover:shadow-md transition-all"
  >
    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#0B1F3A] transition-colors shrink-0">
      <Icon className="w-5 h-5 text-[#0B1F3A] group-hover:text-orange-400 transition-colors" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-black text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{summary}</div>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
  </button>
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  kpis,
  products,
  coils,
  orders,
  ferramentais,
  intermediarySlitters,
  onNavigateToPlanning,
  onOpenProgramOrder,
  onNavigateToSubview,
  onNavigateToData,
  onNavigateToOrders
}) => {
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const slitterPrograms = useMemo(
    () => ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    [products, coils, intermediarySlitters]
  );
  const schedule3Days = useMemo(() => ReadinessService.generate3DaySchedule(slitterPrograms, orders), [slitterPrograms, orders]);
  const toolingAnalysis = useMemo(
    () => ReadinessService.analyzeToolingABC(ferramentais, products, StorageService.getFerramentalHistorico()),
    [ferramentais, products]
  );
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
    () => toolingAnalysis.filter(t => t.classeGiro === 'C' && !t.prontaParaSetup),
    [toolingAnalysis]
  );

  const readySlitters = useMemo(() => slitterDemands.filter(s => s.status === 'PRONTO'), [slitterDemands]);
  const topReadySlitters = useMemo(
    () => [...readySlitters].sort((a, b) => b.totalDemandaT - a.totalDemandaT).slice(0, VISIBLE_READY),
    [readySlitters]
  );

  const statusCounts = useMemo(() => ({
    pronto: readySlitters.length,
    parcial: slitterDemands.filter(s => s.status === 'PARCIAL').length,
    bloqueado: slitterDemands.filter(s => s.status === 'BLOQUEADO').length
  }), [slitterDemands, readySlitters]);

  const abcCounts = useMemo(() => ({
    a: toolingAnalysis.filter(t => t.classeGiro === 'A').length,
    b: toolingAnalysis.filter(t => t.classeGiro === 'B').length,
    c: toolingAnalysis.filter(t => t.classeGiro === 'C').length
  }), [toolingAnalysis]);

  const semCadastroCount = useMemo(
    () => slitterDemands.filter(s => !s.ferramentalCadastrado && s.totalDemandaT > 0).length,
    [slitterDemands]
  );

  const findProgramForSlitter = (item: (typeof slitterDemands)[number]): SlitterProductionProgram | undefined => {
    if (!item.bestCoil) return undefined;
    return slitterPrograms.find(p => p.coil.id === item.bestCoil!.id);
  };

  const allAlerts: HomeAlert[] = useMemo(() => {
    const alerts: HomeAlert[] = [];

    if (forecastPendencias.length > 0) {
      const first = forecastPendencias[0];
      alerts.push({
        id: 'mp_falta',
        tone: 'red',
        icon: Clock3,
        message: (
          <>
            <strong className="font-black">{forecastPendencias.length} {forecastPendencias.length === 1 ? 'item' : 'itens'}</strong> sem matéria-prima — prazo D+2 comprometido
          </>
        ),
        actionLabel: 'Ver demanda',
        onClick: () => onNavigateToPlanning(first.produto.id)
      });
    }

    if (semCadastroCount > 0) {
      alerts.push({
        id: 'ferramental_sem_cadastro',
        tone: 'red',
        icon: AlertTriangle,
        message: <><strong className="font-black">{semCadastroCount}</strong> slitter(s) com demanda sem ferramental cadastrado</>,
        actionLabel: 'Cadastrar',
        onClick: onNavigateToData
      });
    }

    if (ferramentaisAguardandoLote.length > 0) {
      alerts.push({
        id: 'abc_c',
        tone: 'violet',
        icon: Hourglass,
        message: <><strong className="font-black">{ferramentaisAguardandoLote.length}</strong> ferramental(is) Classe C aguardando lote mínimo</>,
        actionLabel: 'Ver curva ABC',
        onClick: () => onNavigateToSubview('ferramental-abc')
      });
    }

    if (setupFragmentationDays.length > 0) {
      alerts.push({
        id: 'setup',
        tone: 'amber',
        icon: AlertTriangle,
        message: <><strong className="font-black">{setupFragmentationDays.length}</strong> dia(s) do horizonte com setups fragmentados (&lt; 20 t por setup)</>,
        actionLabel: 'Ver horizonte',
        onClick: () => onNavigateToSubview('agenda-3-dias')
      });
    }

    return alerts.sort((a, b) => TONE_WEIGHT[b.tone] - TONE_WEIGHT[a.tone]);
  }, [forecastPendencias, semCadastroCount, ferramentaisAguardandoLote, setupFragmentationDays, onNavigateToPlanning, onNavigateToSubview, onNavigateToData]);

  const visibleAlerts = showAllAlerts ? allAlerts : allAlerts.slice(0, VISIBLE_ALERTS_DEFAULT);

  return (
    <div className="space-y-6">
      {/* 4 números que importam */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiTile
          icon={Target}
          label="Demanda atendida"
          value={`${kpis.taxaAtendimentoPercent}%`}
          sub={`${kpis.demandaAtendidaTon.toLocaleString('pt-BR')} de ${kpis.demandaTotalTon.toLocaleString('pt-BR')} t`}
        />
        <KpiTile
          icon={Disc}
          label="Matéria-prima em estoque"
          value={`${kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')} t`}
          sub={`${kpis.totalBobinasDisponiveis} bobinas disponíveis`}
        />
        <KpiTile
          icon={Scissors}
          label="OPs em andamento"
          value={kpis.totalOrdensAtivas}
          sub="ver ordens de produção"
          onClick={onNavigateToOrders}
        />
        <KpiTile
          icon={TrendingUp}
          label="Aproveitamento médio"
          value={`${kpis.aproveitamentoMedioPercent}%`}
          sub={`${kpis.totalRefiloGeradoTon.toLocaleString('pt-BR')} t de refilo gerado`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Ação principal: o que já pode virar OP */}
        <section className="xl:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-orange-500" />
                Pronto para virar OP
                {readySlitters.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-mono">{readySlitters.length}</span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Slitters com matéria-prima disponível, do maior para o menor volume.</p>
            </div>
            <button
              onClick={() => onNavigateToPlanning()}
              className="text-xs font-bold text-[#0B1F3A] hover:text-orange-600 flex items-center gap-1 shrink-0"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topReadySlitters.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              Nenhum slitter com matéria-prima disponível no momento.
            </div>
          ) : (
            <div className="space-y-2">
              {topReadySlitters.map(item => {
                const program = findProgramForSlitter(item);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-[#0B1F3A]">{item.codigoSlitter}</span>
                        <MetricsBadge type="familia" value={item.mainProduct.familia} size="sm" />
                        {!item.ferramentalCadastrado && <MetricsBadge type="ferramental_cadastro" value="" size="sm" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5 max-w-md">{item.nomeSlitter}</div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-slate-900">{item.totalDemandaT} t</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">demanda</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-emerald-700">{item.estimatedYieldPercent}%</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">rendimento</div>
                      </div>
                      <button
                        onClick={() => (program ? onOpenProgramOrder(program) : onNavigateToPlanning(item.mainProduct.id))}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Gerar OP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Atenção: só o que exige decisão, cada item com uma ação */}
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Precisa de atenção
            {allAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono">{allAlerts.length}</span>
            )}
          </h3>

          {allAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nenhuma pendência — tudo em dia.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleAlerts.map(alert => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`p-3 rounded-xl border border-slate-200 border-l-4 ${TONE_BAR[alert.tone]} space-y-2`}>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${ICON_CLASSES[alert.tone]}`} />
                      <span>{alert.message}</span>
                    </div>
                    <button
                      onClick={alert.onClick}
                      className="flex items-center gap-1 text-[11px] font-black text-[#0B1F3A] hover:text-orange-600"
                    >
                      {alert.actionLabel} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {allAlerts.length > VISIBLE_ALERTS_DEFAULT && (
            <button
              onClick={() => setShowAllAlerts(v => !v)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              {showAllAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{showAllAlerts ? 'Mostrar menos' : `Mostrar mais ${allAlerts.length - VISIBLE_ALERTS_DEFAULT}`}</span>
            </button>
          )}
        </section>
      </div>

      {/* Atalhos para os outros painéis */}
      <section className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Ir para outro painel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ShortcutCard
            icon={Calendar}
            title="Horizonte 3 Dias"
            summary={setupFragmentationDays.length > 0 ? `${setupFragmentationDays.length} alerta(s) de setup` : 'Programação dos próximos 3 dias'}
            onClick={() => onNavigateToSubview('agenda-3-dias')}
          />
          <ShortcutCard
            icon={Wrench}
            title="Curva ABC Ferramentais"
            summary={`${abcCounts.a} A · ${abcCounts.b} B · ${abcCounts.c} C`}
            onClick={() => onNavigateToSubview('ferramental-abc')}
          />
          <ShortcutCard
            icon={Boxes}
            title="Carteira Consolidada"
            summary={`${statusCounts.pronto} com MP · ${statusCounts.parcial} parciais · ${statusCounts.bloqueado} sem bobina`}
            onClick={() => onNavigateToSubview('prontidao-demanda')}
          />
        </div>
      </section>
    </div>
  );
};
