import React from 'react';
import { PCPKPIs } from '../types/pcp';
import {
  Disc,
  Scissors,
  TrendingUp,
  Layers,
  Boxes,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface StatusCounts {
  pronto: number;
  parcial: number;
  bloqueado: number;
}

interface AbcCounts {
  a: number;
  b: number;
  c: number;
}

interface KpiOverviewProps {
  kpis: PCPKPIs;
  statusCounts: StatusCounts;
  abcCounts: AbcCounts;
  semCadastroCount: number;
  wipTotalTon: number;
  onNavigateToSubview: (subview: string) => void;
  onNavigateToData: () => void;
}

const StatTile: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  iconClass?: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, sub, iconClass = 'text-[#0B1F3A]', onClick }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white text-left ${onClick ? 'hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer' : ''}`}
    >
      <div className={`p-1.5 rounded-lg bg-slate-50 shrink-0 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide truncate">{label}</div>
        <div className="text-sm font-black text-slate-800 leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-slate-500 font-medium mt-0.5">{sub}</div>}
      </div>
    </Wrapper>
  );
};

export const KpiOverview: React.FC<KpiOverviewProps> = ({
  kpis,
  statusCounts,
  abcCounts,
  semCadastroCount,
  wipTotalTon,
  onNavigateToSubview,
  onNavigateToData
}) => {
  const totalSlitters = statusCounts.pronto + statusCounts.parcial + statusCounts.bloqueado;
  const pct = (n: number) => (totalSlitters > 0 ? Math.round((n / totalSlitters) * 100) : 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatTile
          icon={TrendingUp}
          label="Atendimento da Demanda"
          value={`${kpis.taxaAtendimentoPercent}%`}
          sub={`${kpis.demandaAtendidaTon.toLocaleString('pt-BR')}t / ${kpis.demandaTotalTon.toLocaleString('pt-BR')}t`}
          iconClass="text-emerald-700"
        />
        <StatTile
          icon={Disc}
          label="Estoque Disponível"
          value={`${kpis.pesoTotalEstoqueTon.toLocaleString('pt-BR')}t`}
          sub={`${kpis.totalBobinasDisponiveis} bobinas`}
          iconClass="text-orange-600"
        />
        <StatTile
          icon={Layers}
          label="Estoque WIP (Slitter)"
          value={`${wipTotalTon.toLocaleString('pt-BR')}t`}
          sub="fitas já cortadas na baia"
          iconClass="text-[#0B1F3A]"
        />
        <StatTile
          icon={Scissors}
          label="OPs Ativas"
          value={kpis.totalOrdensAtivas}
          sub="planejadas, liberadas ou em corte"
          onClick={onNavigateToSubview ? () => onNavigateToSubview('agenda-3-dias') : undefined}
        />
        <StatTile
          icon={Boxes}
          label="Refilo Total Gerado"
          value={`${kpis.totalRefiloGeradoTon.toLocaleString('pt-BR')}t`}
          sub={`${kpis.aproveitamentoMedioPercent}% aproveitamento médio`}
          iconClass="text-slate-500"
        />
        <StatTile
          icon={AlertOctagon}
          label="Sem Cadastro"
          value={semCadastroCount}
          sub={semCadastroCount > 0 ? 'código não pode ser confirmado' : 'tudo cadastrado'}
          iconClass={semCadastroCount > 0 ? 'text-red-600' : 'text-emerald-700'}
          onClick={() => onNavigateToData()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Prontidão da Carteira ({totalSlitters} slitters)</span>
            <button onClick={() => onNavigateToSubview('prontidao-demanda')} className="text-[11px] text-[#0B1F3A] hover:text-orange-600 hover:underline font-bold">
              Ver todos
            </button>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
            {statusCounts.pronto > 0 && <div className="bg-emerald-500" style={{ width: `${pct(statusCounts.pronto)}%` }} />}
            {statusCounts.parcial > 0 && <div className="bg-amber-500" style={{ width: `${pct(statusCounts.parcial)}%` }} />}
            {statusCounts.bloqueado > 0 && <div className="bg-red-500" style={{ width: `${pct(statusCounts.bloqueado)}%` }} />}
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> {statusCounts.pronto} Pronto</span>
            <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="w-3 h-3" /> {statusCounts.parcial} Parcial</span>
            <span className="flex items-center gap-1 text-red-700"><XCircle className="w-3 h-3" /> {statusCounts.bloqueado} Bloqueado</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400" /> Curva ABC de Ferramentais
            </span>
            <button onClick={() => onNavigateToSubview('ferramental-abc')} className="text-[11px] text-[#0B1F3A] hover:text-orange-600 hover:underline font-bold">
              Ver todos
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {abcCounts.a} Classe A
            </span>
            <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#0B1F3A]/10 text-[#0B1F3A] border border-[#0B1F3A]/20">
              {abcCounts.b} Classe B
            </span>
            <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              {abcCounts.c} Classe C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
