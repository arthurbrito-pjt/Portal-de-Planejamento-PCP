import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Scissors,
  Wrench
} from 'lucide-react';
import { Coil, Product, SlitterIntermediaryItem } from '../../types/pcp';
import {
  CenarioProducao,
  CoberturaEspessura,
  MIN_BOBINAS_PLANEJAMENTO,
  PlanningScenarioService,
  ResultadoCenario,
  VisaoOtimizacao
} from '../../services/planningScenarioService';
import { SlitterOptimizer } from '../../services/slitterOptimizer';
import { OrderCoilInput } from '../../services/orderBuilderService';
import { SlitterVisualizer } from '../../components/SlitterVisualizer';

interface OtimizacaoCenariosProps {
  products: Product[];
  coils: Coil[];
  intermediarySlitters: SlitterIntermediaryItem[];
  viewToggle?: React.ReactNode;
  escopoInicial?: { modo: Modo; codigo: string; nonce: number } | null;
  onOpenInStudio: (inputs: OrderCoilInput[]) => void;
}

type Modo = 'slitter' | 'ferramental';

const VISOES: Record<VisaoOtimizacao, { titulo: string; subtitulo: string }> = {
  A: { titulo: 'Visão A', subtitulo: 'Melhor aproveitamento real da bobina' },
  B: { titulo: 'Visão B', subtitulo: 'Melhor aproveitamento com menos trocas de facas' }
};

const CENARIOS: Record<CenarioProducao, string> = { MESCLADA: 'Produção mesclada', SEPARADA: 'Produção separada' };

const fmt = (n: number, d = 2) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });

const resumoFitas = (r: ResultadoCenario['planos'][number]) =>
  r.combination.fitas.map(f => `${f.product.codigo} ×${f.quantidade}`).join(' + ');

export const OtimizacaoCenarios: React.FC<OtimizacaoCenariosProps> = ({
  products,
  coils,
  intermediarySlitters,
  viewToggle,
  escopoInicial,
  onOpenInStudio
}) => {
  const [modo, setModo] = useState<Modo>('slitter');
  const [codigo, setCodigo] = useState<string>('');
  const [ateData, setAteData] = useState<string>('');
  const [completar, setCompletar] = useState<boolean>(true);
  const [permitirExcedente, setPermitirExcedente] = useState<boolean>(false);
  const [resultados, setResultados] = useState<ResultadoCenario[] | null>(null);
  const [calculando, setCalculando] = useState<boolean>(false);
  const [cenarioVista, setCenarioVista] = useState<CenarioProducao>('MESCLADA');
  const [visaoDetalhe, setVisaoDetalhe] = useState<VisaoOtimizacao>('A');
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());
  const [autoCalcular, setAutoCalcular] = useState<number>(0);
  const [recalcular, setRecalcular] = useState<boolean>(false);

  const datas = useMemo(() => PlanningScenarioService.datasDeProgramacao(products), [products]);
  const horizonte = ateData || null;

  const grupos = useMemo(
    () => (modo === 'slitter'
      ? PlanningScenarioService.agruparPorSlitter(products, horizonte)
      : PlanningScenarioService.agruparPorFerramental(products, horizonte)),
    [products, modo, horizonte]
  );
  const grupo = useMemo(() => grupos.find(g => g.codigo === codigo) ?? null, [grupos, codigo]);

  useEffect(() => {
    if (!grupo && grupos.length > 0) setCodigo(grupos[0].codigo);
  }, [grupo, grupos]);

  // Qualquer mudança de escopo/opção invalida o cálculo anterior.
  useEffect(() => {
    setResultados(null);
    setExpandidas(new Set());
  }, [modo, codigo, ateData, completar, permitirExcedente, products, coils]);

  const detalheFerramental = useMemo(
    () => (modo === 'ferramental' && grupo ? PlanningScenarioService.detalharFerramental(grupo.codigo, products, coils, horizonte) : null),
    [modo, grupo, products, coils, horizonte]
  );

  // Vindo do botão "Planejar ferramental completo": já abre o ferramental escolhido e calcula.
  useEffect(() => {
    if (!escopoInicial) return;
    setModo(escopoInicial.modo);
    setCodigo(escopoInicial.codigo);
    setAteData('');
    setAutoCalcular(escopoInicial.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escopoInicial?.nonce]);

  useEffect(() => {
    if (autoCalcular && grupo && escopoInicial && grupo.codigo === escopoInicial.codigo && modo === escopoInicial.modo) {
      setAutoCalcular(0);
      calcular();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCalcular, grupo, modo]);

  // "Permitir excedente e recalcular": espera o cálculo anterior ser descartado e roda de novo.
  useEffect(() => {
    if (recalcular && resultados === null && grupo) {
      setRecalcular(false);
      calcular();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalcular, resultados]);

  const calcular = () => {
    if (!grupo) return;
    setCalculando(true);
    // Deixa o "Calculando..." aparecer antes do trabalho pesado.
    setTimeout(() => {
      const params = PlanningScenarioService.paramsDoEscopo(grupo.produtos, products, coils, {
        intermediary: intermediarySlitters,
        ateData: horizonte,
        completar,
        permitirExcedente
      });
      setResultados(PlanningScenarioService.compararTodos(params));
      setCalculando(false);
    }, 30);
  };

  const get = (v: VisaoOtimizacao, c: CenarioProducao) => resultados?.find(r => r.visao === v && r.cenario === c) ?? null;
  const atual = get(visaoDetalhe, cenarioVista);
  const rA = get('A', cenarioVista);
  const rB = get('B', cenarioVista);

  // Demanda por data: antes de calcular mostra só a demanda; depois, o que o plano atende de cada linha.
  const linhasDemanda = useMemo(() => {
    if (!grupo) return [];
    const mapa = new Map<string, { data: string; product: Product; demandaT: number; planejadoT?: number; atendidoT?: number; saldoT?: number }>();
    grupo.produtos.forEach(p =>
      PlanningScenarioService.demandaDoProduto(p, horizonte).forEach(d => mapa.set(`${p.id}|${d.data}`, { data: d.data, product: p, demandaT: d.qtdT }))
    );
    atual?.linhas.forEach(l => {
      const k = `${l.product.id}|${l.data}`;
      const base = mapa.get(k);
      if (base) { base.planejadoT = l.planejadoT + l.wipT; base.atendidoT = l.atendidoT; base.saldoT = l.saldoT; }
    });
    return Array.from(mapa.values()).sort((a, b) =>
      (a.data || '9999').localeCompare(b.data || '9999') || a.product.codigo.localeCompare(b.product.codigo)
    );
  }, [grupo, horizonte, atual]);

  const datasDaLista = useMemo(() => Array.from(new Set(linhasDemanda.map(l => l.data))), [linhasDemanda]);

  const recomendacao = (v: VisaoOtimizacao) => (resultados ? PlanningScenarioService.recomendarCenario(resultados, v) : null);

  const levarParaEstudio = (r: ResultadoCenario | null) => {
    if (!r || r.planos.length === 0) return;
    onOpenInStudio(PlanningScenarioService.paraEstudio(r));
  };

  const toggleExpand = (i: number) =>
    setExpandidas(prev => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i); else n.add(i);
      return n;
    });

  const metricRow = (label: string, a: string, b: string, destaque?: 'a' | 'b' | null) => (
    <tr key={label} className="border-t border-slate-100">
      <td className="py-1.5 pr-2 text-slate-500">{label}</td>
      <td className={`py-1.5 px-2 text-right font-mono ${destaque === 'a' ? 'font-black text-emerald-700' : 'text-slate-800'}`}>{a}</td>
      <td className={`py-1.5 pl-2 text-right font-mono ${destaque === 'b' ? 'font-black text-emerald-700' : 'text-slate-800'}`}>{b}</td>
    </tr>
  );
  const melhor = (a: number, b: number, menorMelhor: boolean): 'a' | 'b' | null => {
    if (Math.abs(a - b) < 1e-9) return null;
    return (a < b) === menorMelhor ? 'a' : 'b';
  };

  const visaoCard = (v: VisaoOtimizacao, r: ResultadoCenario | null) => {
    const m = r?.metricas;
    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm space-y-3 ${visaoDetalhe === v ? 'border-orange-400 ring-2 ring-orange-500/15' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">{VISOES[v].titulo}</div>
            <div className="text-sm font-black text-[#0B1F3A]">{VISOES[v].subtitulo}</div>
          </div>
          <button
            onClick={() => setVisaoDetalhe(v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${visaoDetalhe === v ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            {visaoDetalhe === v ? 'Em detalhe' : 'Ver detalhe'}
          </button>
        </div>
        {!m || !r ? (
          <div className="text-xs text-slate-400">Sem resultado.</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-[10px] font-bold uppercase text-slate-500">Aproveitamento</div>
                <div className="text-lg font-black text-[#0B1F3A] font-mono">{fmt(m.aproveitamentoPercent)}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-[10px] font-bold uppercase text-slate-500">Atendimento</div>
                <div className="text-lg font-black text-[#0B1F3A] font-mono">{fmt(m.atendimentoPercent, 1)}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-[10px] font-bold uppercase text-slate-500">Trocas de facas</div>
                <div className="text-lg font-black text-[#0B1F3A] font-mono">{m.trocasFacas}</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>Refilo <strong className="font-mono">E {fmt(m.refiloEsqMedioMm, 1)} / D {fmt(m.refiloDirMedioMm, 1)} / T {fmt(m.refiloMedioMm, 1)} mm</strong> (médio)</span>
              <span>Faixa total <strong className="font-mono">{m.refiloMinMm}–{m.refiloMaxMm} mm</strong></span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold ${r.minBobinas.atendido ? 'text-emerald-700' : 'text-amber-700'}`}>
              {r.minBobinas.atendido ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {m.qtdBobinas} bobina(s) — {r.minBobinas.atendido ? `mínimo de ${MIN_BOBINAS_PLANEJAMENTO} atendido` : `abaixo do mínimo de ${MIN_BOBINAS_PLANEJAMENTO}`}
            </div>
            {r.nota && <div className="text-[11px] text-slate-500 italic">{r.nota}</div>}
            <button
              onClick={() => levarParaEstudio(r)}
              disabled={r.planos.length === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-black disabled:opacity-40"
            >
              <Scissors className="w-3.5 h-3.5 text-orange-400" />
              Levar para o Estúdio de Corte
            </button>
          </>
        )}
      </div>
    );
  };

  const paraMatriz = resultados
    ? (['A', 'B'] as VisaoOtimizacao[]).flatMap(v => (['MESCLADA', 'SEPARADA'] as CenarioProducao[]).map(c => get(v, c)!))
    : [];

  const cobertura: CoberturaEspessura[] = useMemo(
    () => (atual ? PlanningScenarioService.coberturaPorEspessura(atual, coils) : []),
    [atual, coils]
  );
  const totFalta = cobertura.reduce((a, c) => a + c.faltaMpT, 0);
  const totLimite = cobertura.reduce((a, c) => a + c.limiteCorteT, 0);

  const trocasDoCenario = atual?.planos.filter(p => p.trocasAntes > 0) ?? [];

  return (
    <div className="space-y-4">
      {viewToggle}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {([['slitter', 'Por Slitter'], ['ferramental', 'Por Ferramental']] as [Modo, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => { setModo(id); setCodigo(''); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${modo === id ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {modo === 'slitter'
              ? 'Materiais que saem da mesma faca (largura de fita) — mesmo motor de cálculo do planejamento por ferramental.'
              : 'Todos os materiais que o ferramental de conformação (perfiladeira/tubeira) produz.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">{modo === 'slitter' ? 'Slitter' : 'Ferramental'}</span>
            <select
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            >
              {grupos.length === 0 && <option value="">Nenhum material com demanda</option>}
              {grupos.map(g => (
                <option key={g.codigo} value={g.codigo}>
                  {g.nome} — {fmt(g.demandaT)} t · {g.produtos.length} material(is)
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={completar} onChange={e => setCompletar(e.target.checked)} className="accent-orange-500" />
              Completar bobinas com outros itens da mesma espessura (produção mesclada)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={permitirExcedente} onChange={e => setPermitirExcedente(e.target.checked)} className="accent-orange-500" />
              Permitir produzir acima da demanda (exige autorização na OP)
            </label>
          </div>
          <button
            onClick={calcular}
            disabled={!grupo || calculando}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {calculando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            {calculando ? 'Calculando cenários...' : 'Calcular Visões A/B e Cenários'}
          </button>
        </div>
      </div>

      {detalheFerramental && grupo && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-[#0B1F3A]">
            <Wrench className="w-4 h-4 text-orange-500" /> {grupo.nome}
            <span className="text-xs font-medium text-slate-500">· máquina de conformação: {detalheFerramental.maquina}</span>
          </div>
          {grupo.codigo === 'SEM_FERRAMENTAL' && (
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Estes itens não têm ferramental de conformação mapeado — o agrupamento é só pelos dados que existem.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="font-bold uppercase text-[10px] text-slate-500">Materiais que o ferramental produz ({detalheFerramental.materiais.length})</div>
              <ul className="max-h-40 overflow-auto space-y-0.5">
                {detalheFerramental.materiais.map(m => (
                  <li key={m.product.id} className="flex justify-between gap-2">
                    <span className="font-mono text-slate-800">{m.product.codigo}</span>
                    <span className="text-slate-500">{m.product.espessura} mm · fita {m.product.larguraFita} mm</span>
                    <span className={`font-mono ${m.demandaT > 0 ? 'text-[#0B1F3A] font-bold' : 'text-slate-300'}`}>{fmt(m.demandaT)} t</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold uppercase text-[10px] text-slate-500">Slitters (facas) compatíveis</div>
              <ul className="max-h-40 overflow-auto space-y-1">
                {detalheFerramental.slitters.map(s => (
                  <li key={`${s.codigo}${s.larguraFita}${s.espessura}`}>
                    <span className="font-mono font-bold text-slate-800">{s.cadastrado ? s.codigo : 'SEM CADASTRO'}</span>{' '}
                    <span className="text-slate-500">{s.larguraFita} × {s.espessura} mm</span>
                    {s.materiais.length > 1 && (
                      <span className="ml-1 text-emerald-700 font-bold">· {s.materiais.length} materiais na mesma faca (sem troca)</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400">Máquinas SLT_01–05: não há regra de compatibilidade por máquina cadastrada — todas consideradas compatíveis.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold uppercase text-[10px] text-slate-500">Bobinas compatíveis em estoque</div>
              <ul className="space-y-0.5">
                {detalheFerramental.bobinas.map(b => (
                  <li key={b.espessura} className="flex justify-between gap-2">
                    <span className="font-mono">{b.espessura} mm</span>
                    <span className={b.qtd === 0 ? 'text-red-600 font-bold' : 'text-slate-700'}>{b.qtd} bobina(s) · {fmt(b.pesoT)} t</span>
                    <span className="text-slate-400 truncate">{b.larguras.join(', ')} mm</span>
                  </li>
                ))}
              </ul>
              {detalheFerramental.semBobina.length > 0 && (
                <p className="text-[11px] text-red-700 font-bold">Sem bobina em estoque para {detalheFerramental.semBobina.join(', ')} mm — a demanda dessa espessura não pode ser planejada.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Demanda por data */}
      {grupo && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="text-sm font-black text-[#0B1F3A] flex items-center gap-2"><CalendarDays className="w-4 h-4 text-orange-500" /> Demanda por data de programação</div>
            <div className="text-[11px] text-slate-500">
              {atual ? `Atendimento conforme ${VISOES[visaoDetalhe].titulo} · ${CENARIOS[cenarioVista]}` : 'Calcule os cenários para ver o que será atendido'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Data</th>
                  <th className="text-left px-2 py-2">Material</th>
                  <th className="text-right px-2 py-2">Esp. × fita</th>
                  <th className="text-right px-2 py-2">Demanda (t)</th>
                  <th className="text-right px-2 py-2">Planejado (t)</th>
                  <th className="text-right px-2 py-2">Atendido</th>
                  <th className="text-right px-2 py-2">Saldo pendente (t)</th>
                  <th className="text-left px-4 py-2">Situação</th>
                </tr>
              </thead>
              <tbody>
                {datasDaLista.map(d => {
                  const ls = linhasDemanda.filter(l => l.data === d);
                  const tot = ls.reduce((a, l) => a + l.demandaT, 0);
                  const totAt = ls.reduce((a, l) => a + (l.atendidoT ?? 0), 0);
                  return (
                    <React.Fragment key={d || 'sem-data'}>
                      <tr className="bg-[#0B1F3A]/5">
                        <td colSpan={3} className="px-4 py-1.5 font-black text-[#0B1F3A]">{PlanningScenarioService.formatData(d)}</td>
                        <td className="px-2 py-1.5 text-right font-mono font-black text-[#0B1F3A]">{fmt(tot)}</td>
                        <td />
                        <td className="px-2 py-1.5 text-right font-mono font-black text-[#0B1F3A]">{atual ? `${fmt(tot > 0 ? (totAt / tot) * 100 : 0, 1)}%` : ''}</td>
                        <td className="px-2 py-1.5 text-right font-mono font-black text-[#0B1F3A]">{atual ? fmt(Math.max(0, tot - totAt)) : ''}</td>
                        <td />
                      </tr>
                      {ls.map(l => {
                        const pct = l.atendidoT !== undefined && l.demandaT > 0 ? (l.atendidoT / l.demandaT) * 100 : null;
                        const situacao = pct === null ? '' : pct >= 99 ? 'Atendido' : pct > 0 ? 'Parcial' : 'Pendente';
                        return (
                          <tr key={`${l.product.id}|${l.data}`} className="border-t border-slate-100">
                            <td className="px-4 py-1.5 text-slate-400">{PlanningScenarioService.formatData(l.data)}</td>
                            <td className="px-2 py-1.5"><span className="font-mono font-bold text-slate-800">{l.product.codigo}</span> <span className="text-slate-400">{l.product.descricao.slice(0, 40)}</span></td>
                            <td className="px-2 py-1.5 text-right font-mono text-slate-500">{l.product.espessura} × {l.product.larguraFita}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{fmt(l.demandaT)}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{l.planejadoT !== undefined ? fmt(l.planejadoT) : ''}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{pct !== null ? `${fmt(pct, 1)}%` : ''}</td>
                            <td className={`px-2 py-1.5 text-right font-mono ${l.saldoT ? 'text-red-600 font-bold' : ''}`}>{l.saldoT !== undefined ? fmt(l.saldoT) : ''}</td>
                            <td className={`px-4 py-1.5 font-bold ${situacao === 'Atendido' ? 'text-emerald-700' : situacao === 'Parcial' ? 'text-amber-700' : 'text-red-600'}`}>{situacao}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {linhasDemanda.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Nenhum material com demanda neste escopo/horizonte.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {datas.length === 0 && linhasDemanda.length > 0 && (
            <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">
              A demanda importada não traz datas (coluna Data da aba PROG IM) — tudo foi tratado como "Sem data". Reimporte a programação para planejar por data.
            </div>
          )}
        </div>
      )}

      {/* 2-5. Visões lado a lado e comparações */}
      {resultados && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {(['MESCLADA', 'SEPARADA'] as CenarioProducao[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCenarioVista(c)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${cenarioVista === c ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {CENARIOS[c]}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500">
              Perda = peso do refilo (proporcional à largura da bobina). Setup = configuração de facas; troca = faca movimentada entre configurações.
            </div>
          </div>

          {atual && cobertura.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-black text-[#0B1F3A]">Cobertura da demanda — o que o plano atende e o que falta</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  O plano tenta atender o máximo da demanda de {grupo?.nome}. O limite é o estoque de bobinas de cada espessura e as regras de refilo e de não passar da demanda.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="text-left px-4 py-2">Espessura</th>
                      <th className="text-right px-2 py-2">Demanda a cortar (t)</th>
                      <th className="text-right px-2 py-2">Estoque de bobinas (t)</th>
                      <th className="text-right px-2 py-2">Atendido (t)</th>
                      <th className="text-right px-2 py-2">Falta bobina (t)</th>
                      <th className="text-right px-4 py-2">Pendente por regra de corte (t)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobertura.map(c => (
                      <tr key={c.espessura} className="border-t border-slate-100">
                        <td className="px-4 py-1.5 font-mono font-bold">{c.espessura} mm</td>
                        <td className="px-2 py-1.5 text-right font-mono">{fmt(c.demandaT)}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{fmt(c.estoqueT)} <span className="text-slate-400">({c.qtdBobinas})</span></td>
                        <td className="px-2 py-1.5 text-right font-mono text-emerald-700 font-bold">{fmt(c.atendidoT)}</td>
                        <td className={`px-2 py-1.5 text-right font-mono ${c.faltaMpT > 0 ? 'text-red-600 font-bold' : 'text-slate-300'}`}>{fmt(c.faltaMpT)}</td>
                        <td className={`px-4 py-1.5 text-right font-mono ${c.limiteCorteT > 0.05 ? 'text-amber-700 font-bold' : 'text-slate-300'}`}>{fmt(c.limiteCorteT)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-700 space-y-1">
                {totFalta > 0.05 && <div><strong className="text-red-600">{fmt(totFalta)} t</strong> da demanda não podem ser atendidos por falta de bobina em estoque (peso total das bobinas menor que a demanda da espessura).</div>}
                {totLimite > 0.05 && (
                  <div>
                    <strong className="text-amber-700">{fmt(totLimite)} t</strong> ficam pendentes mesmo havendo bobina: fechar o corte exigiria produzir acima da demanda ou não fecha o refilo de 6–9 mm por lado.{' '}
                    {!permitirExcedente && <button onClick={() => { setPermitirExcedente(true); setRecalcular(true); }} className="underline font-bold text-[#0B1F3A]">Permitir excedente e recalcular</button>}
                  </div>
                )}
                {totFalta <= 0.05 && totLimite <= 0.05 && <div className="text-emerald-700 font-bold">Demanda completa atendida neste cenário.</div>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visaoCard('A', rA)}
            {visaoCard('B', rB)}
          </div>

          {rA && rB && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-sm font-black text-[#0B1F3A] mb-2">Diferenças entre as visões — {CENARIOS[cenarioVista]}</div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr><th className="text-left py-1">Indicador</th><th className="text-right px-2">Visão A</th><th className="text-right pl-2">Visão B</th></tr>
                </thead>
                <tbody>
                  {metricRow('Aproveitamento da bobina', `${fmt(rA.metricas.aproveitamentoPercent)}%`, `${fmt(rB.metricas.aproveitamentoPercent)}%`, melhor(rA.metricas.aproveitamentoPercent, rB.metricas.aproveitamentoPercent, false))}
                  {metricRow('Refilo médio (E / D / T, mm)', `${fmt(rA.metricas.refiloEsqMedioMm, 1)} / ${fmt(rA.metricas.refiloDirMedioMm, 1)} / ${fmt(rA.metricas.refiloMedioMm, 1)}`, `${fmt(rB.metricas.refiloEsqMedioMm, 1)} / ${fmt(rB.metricas.refiloDirMedioMm, 1)} / ${fmt(rB.metricas.refiloMedioMm, 1)}`, melhor(rA.metricas.refiloMedioMm, rB.metricas.refiloMedioMm, true))}
                  {metricRow('Quantidade de bobinas', String(rA.metricas.qtdBobinas), String(rB.metricas.qtdBobinas))}
                  {metricRow('Peso das bobinas (t)', fmt(rA.metricas.pesoBobinasT), fmt(rB.metricas.pesoBobinasT))}
                  {metricRow('Toneladas produzidas (fitas)', fmt(rA.metricas.producaoT), fmt(rB.metricas.producaoT))}
                  {metricRow('Perdas — refilo (t)', fmt(rA.metricas.perdasT), fmt(rB.metricas.perdasT), melhor(rA.metricas.perdasT, rB.metricas.perdasT, true))}
                  {metricRow('Setups (configurações de facas)', String(rA.metricas.setups), String(rB.metricas.setups), melhor(rA.metricas.setups, rB.metricas.setups, true))}
                  {metricRow('Trocas de facas', String(rA.metricas.trocasFacas), String(rB.metricas.trocasFacas), melhor(rA.metricas.trocasFacas, rB.metricas.trocasFacas, true))}
                  {metricRow('Atendimento da demanda', `${fmt(rA.metricas.atendimentoPercent, 1)}%`, `${fmt(rB.metricas.atendimentoPercent, 1)}%`, melhor(rA.metricas.atendimentoPercent, rB.metricas.atendimentoPercent, false))}
                  {metricRow('Saldo pendente (t)', fmt(rA.metricas.saldoT), fmt(rB.metricas.saldoT), melhor(rA.metricas.saldoT, rB.metricas.saldoT, true))}
                  {metricRow('Excedente de produção (t)', fmt(rA.metricas.excedenteT), fmt(rB.metricas.excedenteT), melhor(rA.metricas.excedenteT, rB.metricas.excedenteT, true))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-700">
                {(() => {
                  const dTroca = rA.metricas.trocasFacas - rB.metricas.trocasFacas;
                  const dSetup = rA.metricas.setups - rB.metricas.setups;
                  const dPerda = Number((rB.metricas.perdasT - rA.metricas.perdasT).toFixed(2));
                  const dApr = Number((rA.metricas.aproveitamentoPercent - rB.metricas.aproveitamentoPercent).toFixed(2));
                  const dAtend = Number((rB.metricas.atendimentoPercent - rA.metricas.atendimentoPercent).toFixed(1));
                  const partes: string[] = [];
                  if (dTroca !== 0 || dSetup !== 0) partes.push(`${dTroca > 0 ? 'A Visão B faz' : 'A Visão A faz'} ${Math.abs(dTroca)} troca(s) de facas e ${Math.abs(dSetup)} setup(s) a ${dTroca > 0 ? 'menos' : 'mais'}`);
                  if (dApr !== 0) partes.push(`${dApr > 0 ? 'a Visão A aproveita' : 'a Visão B aproveita'} ${Math.abs(dApr)} p.p. a mais da bobina (${dPerda >= 0 ? `${fmt(dPerda)} t a menos de perda na A` : `${fmt(Math.abs(dPerda))} t a menos de perda na B`})`);
                  if (dAtend !== 0) partes.push(`${dAtend > 0 ? 'a Visão B atende' : 'a Visão A atende'} ${Math.abs(dAtend)} p.p. a mais da demanda`);
                  return partes.length ? `${partes.join('; ')}.` : 'As duas visões chegaram ao mesmo resultado para este escopo.';
                })()}
              </p>
            </div>
          )}

          {/* Mesclada x separada */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 text-sm font-black text-[#0B1F3A]">Produção mesclada x produção separada</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">Cenário</th>
                    <th className="text-right px-2 py-2">Aproveit.</th>
                    <th className="text-right px-2 py-2">Refilo E/D/T</th>
                    <th className="text-right px-2 py-2">Bobinas</th>
                    <th className="text-right px-2 py-2">Produzido (t)</th>
                    <th className="text-right px-2 py-2">Perdas (t)</th>
                    <th className="text-right px-2 py-2">Setups</th>
                    <th className="text-right px-2 py-2">Trocas</th>
                    <th className="text-right px-2 py-2">Atendimento</th>
                    <th className="text-right px-4 py-2">Saldo (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {paraMatriz.map(r => {
                    const rec = recomendacao(r.visao);
                    const recomendado = rec?.melhor === r.cenario && !r.equivalenteA;
                    return (
                      <tr key={`${r.visao}${r.cenario}`} className={`border-t border-slate-100 ${recomendado ? 'bg-emerald-50/60' : ''}`}>
                        <td className="px-4 py-2 font-bold text-slate-800">
                          {VISOES[r.visao].titulo} · {CENARIOS[r.cenario]}
                          {recomendado && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">Recomendado</span>}
                          {r.equivalenteA && <span className="ml-2 text-[10px] text-slate-400">= mesclada</span>}
                        </td>
                        <td className="px-2 py-2 text-right font-mono">{fmt(r.metricas.aproveitamentoPercent)}%</td>
                        <td className="px-2 py-2 text-right font-mono">{fmt(r.metricas.refiloEsqMedioMm, 1)}/{fmt(r.metricas.refiloDirMedioMm, 1)}/{fmt(r.metricas.refiloMedioMm, 1)}</td>
                        <td className="px-2 py-2 text-right font-mono">{r.metricas.qtdBobinas}</td>
                        <td className="px-2 py-2 text-right font-mono">{fmt(r.metricas.producaoT)}</td>
                        <td className="px-2 py-2 text-right font-mono">{fmt(r.metricas.perdasT)}</td>
                        <td className="px-2 py-2 text-right font-mono">{r.metricas.setups}</td>
                        <td className="px-2 py-2 text-right font-mono">{r.metricas.trocasFacas}</td>
                        <td className="px-2 py-2 text-right font-mono">{fmt(r.metricas.atendimentoPercent, 1)}%</td>
                        <td className="px-4 py-2 text-right font-mono">{fmt(r.metricas.saldoT)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 space-y-1 text-xs text-slate-700">
              {(['A', 'B'] as VisaoOtimizacao[]).map(v => {
                const rec = recomendacao(v);
                return rec?.motivo ? <div key={v}><strong>{VISOES[v].titulo}:</strong> {rec.motivo}</div> : null;
              })}
              <div className="text-[10px] text-slate-400">Critério: atendimento da demanda → excedente → perdas (t) → trocas de facas → aproveitamento. A produção mesclada não é presumida melhor: ela só vence quando os números vencem.</div>
            </div>
          </div>

          {/* Detalhe do cenário selecionado */}
          {atual && (
            <div className="space-y-3">
              <div className="text-sm font-black text-[#0B1F3A]">Detalhe — {VISOES[visaoDetalhe].titulo} · {CENARIOS[cenarioVista]}</div>

              {atual.restricoes.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-black flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Restrições e saldos pendentes</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {atual.restricoes.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 text-sm font-black text-[#0B1F3A]">Atendimento por material</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="text-left px-4 py-2">Material</th>
                        <th className="text-right px-2 py-2">Demanda (t)</th>
                        <th className="text-right px-2 py-2">Estoque slitter (t)</th>
                        <th className="text-right px-2 py-2">Produzido (t)</th>
                        <th className="text-right px-2 py-2">Atendido</th>
                        <th className="text-right px-2 py-2">Saldo (t)</th>
                        <th className="text-right px-2 py-2">Excedente (t)</th>
                        <th className="text-left px-4 py-2">Motivo do saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atual.produtos.map(p => (
                        <tr key={p.product.id} className="border-t border-slate-100">
                          <td className="px-4 py-1.5">
                            <span className="font-mono font-bold text-slate-800">{p.product.codigo}</span>
                            {!p.noEscopo && <span className="ml-2 text-[10px] text-slate-400">complemento</span>}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmt(p.demandaT)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{p.wipT ? fmt(p.wipT) : '—'}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmt(p.producaoT)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmt(p.atendidoPercent, 1)}%</td>
                          <td className={`px-2 py-1.5 text-right font-mono ${p.saldoT > 0.05 ? 'text-red-600 font-bold' : ''}`}>{fmt(p.saldoT)}</td>
                          <td className={`px-2 py-1.5 text-right font-mono ${p.excedenteT > 0.05 ? 'text-amber-700 font-bold' : ''}`}>{fmt(p.excedenteT)}</td>
                          <td className="px-4 py-1.5 text-slate-500">{p.motivoSaldo ?? ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-[#0B1F3A]">Bobinas e configurações de corte ({atual.planos.length})</div>
                  <div className="text-[11px] text-slate-500">
                    {visaoDetalhe === 'B'
                      ? 'Sequência ordenada para somar o menor número de facas trocadas (respeitando a data de programação).'
                      : 'Sequência com os cortes de maior aproveitamento primeiro (respeitando a data de programação); aceita mais trocas de facas.'}
                    {trocasDoCenario.length > 0 ? ` ${trocasDoCenario.length} corte(s) exigem troca de facas.` : ''}
                    {' '}Total: <strong>{atual.metricas.trocasFacas}</strong> faca(s) trocada(s) em <strong>{atual.metricas.setups}</strong> setup(s).
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2" />
                        <th className="text-left px-2 py-2">#</th>
                        <th className="text-left px-2 py-2">Programação</th>
                        <th className="text-left px-2 py-2">Bobina</th>
                        <th className="text-left px-2 py-2">Fitas</th>
                        <th className="text-right px-2 py-2">Refilo E / D / T (mm)</th>
                        <th className="text-right px-2 py-2">Aproveit.</th>
                        <th className="text-right px-2 py-2">Setup</th>
                        <th className="text-right px-2 py-2">Facas trocadas</th>
                        <th className="text-left px-3 py-2">O que fazer nas facas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atual.planos.map((p, i) => (
                        <React.Fragment key={p.coil.id}>
                          <tr className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => toggleExpand(i)}>
                            <td className="px-3 py-1.5 text-slate-400">{expandidas.has(i) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</td>
                            <td className="px-2 py-1.5 font-mono font-bold">{p.ordem}</td>
                            <td className="px-2 py-1.5 text-slate-500">{PlanningScenarioService.formatData(p.dataFoco)}</td>
                            <td className="px-2 py-1.5 font-mono">Lote {p.coil.lote} · {p.coil.largura}×{p.coil.espessura} mm · {fmt(p.coil.peso)} t</td>
                            <td className="px-2 py-1.5 text-slate-700">{resumoFitas(p)}{p.excedeDemanda && <span className="ml-1 text-amber-700 font-bold">· EXCEDE DEMANDA</span>}</td>
                            <td className={`px-2 py-1.5 text-right font-mono ${p.refilo.valido ? '' : 'text-red-600 font-bold'}`}>{fmt(p.refilo.esquerdoMm, 1)} / {fmt(p.refilo.direitoMm, 1)} / <strong>{fmt(p.refilo.totalMm, 1)}</strong></td>
                            <td className="px-2 py-1.5 text-right font-mono">{fmt(p.combination.aproveitamentoPercent)}%</td>
                            <td className="px-2 py-1.5 text-right font-mono">S{p.setup}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{p.trocasAntes}</td>
                            <td className="px-3 py-1.5 text-slate-600">{p.trocaDetalhe || (p.ordem === 1 ? '' : 'mesma configuração do corte anterior')}</td>
                          </tr>
                          {expandidas.has(i) && (
                            <tr className="bg-slate-50/60">
                              <td colSpan={10} className="px-4 py-3">
                                <SlitterVisualizer coil={p.coil} strips={SlitterOptimizer.generateStripsFromCombination(p.combination, p.coil)} interactive={false} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {atual.planos.length === 0 && (
                        <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400">Nenhuma bobina gerou corte válido para este escopo.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
