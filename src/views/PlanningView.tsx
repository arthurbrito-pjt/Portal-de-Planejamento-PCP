import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Coil,
  SlitterCombination,
  SlitterStrip,
  SlitterOrder,
  Ferramental,
  SlitterIntermediaryItem
} from '../types/pcp';
import { SlitterOptimizer } from '../services/slitterOptimizer';
import { ReadinessService } from '../services/readinessService';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { CoilCompatibilityService } from '../services/coilCompatibilityService';
import { OrderBuilderService, OrderCoilInput } from '../services/orderBuilderService';
import { StorageService } from '../services/storageService';
import { CoilCard } from '../components/CoilCard';
import { CoilCompatibilityBadge } from '../components/CoilCompatibilityBadge';
import { MetricsBadge } from '../components/MetricsBadge';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { StepIndicator } from '../components/StepIndicator';
import { OpSuggestionCard } from '../components/OpSuggestionCard';
import { PolicyAlertBar, PolicyAlert } from '../components/PolicyAlertBar';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Scissors,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Repeat,
  ClipboardCheck
} from 'lucide-react';

interface PlanningViewProps {
  products: Product[];
  coils: Coil[];
  ferramentais: Ferramental[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  preSelectedProductId?: string | null;
  onProceedToSimulation: (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => void;
  onOrderCreated: (order: SlitterOrder) => void;
  onNavigateToDashboard?: () => void;
}

const OPERADORES = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Pereira'];
const TURNOS = ['1º Turno', '2º Turno', '3º Turno'];
const MAQUINAS = ['SLT_01', 'SLT_02', 'SLT_03', 'SLT_04', 'SLT_05'];

export const PlanningView: React.FC<PlanningViewProps> = ({
  products,
  coils,
  ferramentais,
  intermediarySlitters = [],
  preSelectedProductId,
  onProceedToSimulation,
  onOrderCreated,
  onNavigateToDashboard
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Etapa A: Escolher o que produzir
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [readinessFilter, setReadinessFilter] = useState<'PRONTO' | 'PARCIAL' | 'TODOS' | 'BLOQUEADO'>('PRONTO');
  const [familyFilter, setFamilyFilter] = useState<'TODOS' | 'TUBO' | 'PERFIL'>('TODOS');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');

  const [desiredQtyTon, setDesiredQtyTon] = useState<number>(10);
  const [showManualCoilPicker, setShowManualCoilPicker] = useState<boolean>(false);
  const [showAllCombinations, setShowAllCombinations] = useState<boolean>(false);

  const [selectedCoils, setSelectedCoils] = useState<Coil[]>([]);
  const selectedCoil = useMemo(() => selectedCoils[0] || null, [selectedCoils]);
  const totalSelectedCoilsWeightTon = useMemo(
    () => Number(selectedCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(3)),
    [selectedCoils]
  );

  const [selectedCombination, setSelectedCombination] = useState<SlitterCombination | null>(null);

  // Etapa C: Emitir OP
  const [operador, setOperador] = useState<string>('');
  const [turno, setTurno] = useState<string>(TURNOS[0]);
  const [maquina, setMaquina] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  const slitterDemands = useMemo(() => {
    const list = ReadinessService.analyzeSlitters(products, coils, intermediarySlitters);
    return ReadinessService.sortSlittersByReadiness(list);
  }, [products, coils, intermediarySlitters]);

  const toolingAbc = useMemo(
    () => ReadinessService.analyzeToolingABC(ferramentais, products),
    [ferramentais, products]
  );

  const abcByFerramentalCodigo = useMemo(() => {
    const map = new Map<string, (typeof toolingAbc)[number]>();
    toolingAbc.forEach(a => map.set(a.ferramental.codigo, a));
    return map;
  }, [toolingAbc]);

  const prontoCount = slitterDemands.filter(r => r.status === 'PRONTO').length;
  const parcialCount = slitterDemands.filter(r => r.status === 'PARCIAL').length;
  const bloqueadoCount = slitterDemands.filter(r => r.status === 'BLOQUEADO').length;

  useEffect(() => {
    if (preSelectedProductId) {
      const p = products.find(prod => prod.id === preSelectedProductId || prod.codigo === preSelectedProductId);
      if (p) {
        const item = slitterDemands.find(s => s.larguraFita === p.larguraFita && s.espessura === p.espessura);
        setSelectedProduct(p);
        setDesiredQtyTon(item?.effectiveDemandTon ?? item?.totalDemandaT ?? p.demandaT ?? 10);
        if (item) {
          setSelectedCoils(item.recommendedCoils || []);
          setSelectedCombination(item.bestCombination || null);
        }
        setCurrentStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedProductId, products, slitterDemands]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    products.forEach(p => set.add(p.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const filteredSlitterDemands = useMemo(() => {
    let list = slitterDemands;
    if (readinessFilter !== 'TODOS') list = list.filter(r => r.status === readinessFilter);
    if (familyFilter !== 'TODOS') list = list.filter(r => r.mainProduct.familia === familyFilter);
    if (thicknessFilter !== 'TODOS') list = list.filter(r => r.espessura === Number(thicknessFilter));
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(r =>
        r.codigoSlitter.toLowerCase().includes(q) ||
        r.nomeSlitter.toLowerCase().includes(q) ||
        `${r.larguraFita}`.includes(q)
      );
    }
    return ReadinessService.sortSlittersByReadiness(list);
  }, [slitterDemands, readinessFilter, familyFilter, thicknessFilter, productSearch]);

  const handleAcceptSuggestion = (item: (typeof slitterDemands)[number]) => {
    const effectiveQty = item.effectiveDemandTon ?? item.totalDemandaT ?? item.mainProduct.demandaT ?? 10;
    const coilsToUse = item.recommendedCoils || [];
    setSelectedProduct(item.mainProduct);
    setDesiredQtyTon(effectiveQty);
    setSelectedCoils(coilsToUse);
    setSelectedCombination(item.bestCombination || null);
    setShowManualCoilPicker(coilsToUse.length === 0 && !item.coveredByWipOnly);
    setCurrentStep(2);
  };

  const handleCustomize = (item: (typeof slitterDemands)[number]) => {
    setSelectedProduct(item.mainProduct);
    setDesiredQtyTon(item.effectiveDemandTon ?? item.totalDemandaT ?? item.mainProduct.demandaT ?? 10);
    setSelectedCoils([]);
    setSelectedCombination(null);
    setShowManualCoilPicker(true);
    setCurrentStep(2);
  };

  const rankedCoils = useMemo(() => {
    if (!selectedProduct) return [];
    return CoilCompatibilityService.rank(coils, selectedProduct, intermediarySlitters);
  }, [coils, selectedProduct, intermediarySlitters]);

  const isDemandCovered = useMemo(
    () => desiredQtyTon > 0 && totalSelectedCoilsWeightTon >= desiredQtyTon,
    [totalSelectedCoilsWeightTon, desiredQtyTon]
  );

  const handleToggleCoil = (coil: Coil) => {
    if (selectedCoils.some(c => c.id === coil.id)) {
      setSelectedCoils(selectedCoils.filter(c => c.id !== coil.id));
    } else {
      if (isDemandCovered) return;
      setSelectedCoils([...selectedCoils, coil]);
    }
  };

  const handleSelectAllCoils = () => {
    let accum = 0;
    const neededCoils: Coil[] = [];
    for (const rc of rankedCoils) {
      neededCoils.push(rc.coil);
      accum += rc.coil.peso;
      if (accum >= desiredQtyTon) break;
    }
    setSelectedCoils(neededCoils);
  };

  const combinations = useMemo(() => {
    if (!selectedProduct || !selectedCoil) return [];
    return SlitterOptimizer.optimize({
      mainProduct: selectedProduct,
      desiredQuantityTon: desiredQtyTon,
      selectedCoil,
      compatibleProducts: products,
      minScrapMm: 10,
      maxScrapAllowedMm: 18
    });
  }, [selectedProduct, selectedCoil, desiredQtyTon, products]);

  useEffect(() => {
    if (combinations.length > 0 && !selectedCombination) {
      setSelectedCombination(combinations[0]);
    }
  }, [combinations, selectedCombination]);

  // Cada bobina física é cortada de forma independente e recebe seu próprio
  // plano de corte — nunca reaproveita a combinação de 1 bobina para
  // representar o peso somado de várias (isso corromperia o estoque, já que
  // cada bobina precisa ser baixada individualmente ao salvar a OP).
  // Com 1 bobina só, respeita a escolha manual do operador (selectedCombination,
  // incluindo alternativas); com várias, cada uma usa seu melhor corte próprio.
  const perCoilCombinations = useMemo((): (SlitterCombination | null)[] => {
    if (!selectedProduct || selectedCoils.length === 0) return [];
    if (selectedCoils.length === 1) return [selectedCombination];

    return selectedCoils.map(coil => {
      const combos = SlitterOptimizer.optimize({
        mainProduct: selectedProduct,
        desiredQuantityTon: desiredQtyTon,
        selectedCoil: coil,
        compatibleProducts: products,
        minScrapMm: 10,
        maxScrapAllowedMm: 18
      });
      return combos[0] || null;
    });
  }, [selectedProduct, selectedCoils, selectedCombination, desiredQtyTon, products]);

  const coilCutInputs = useMemo((): OrderCoilInput[] => {
    return selectedCoils
      .map((coil, idx) => {
        const combo = perCoilCombinations[idx];
        if (!combo) return null;
        return { coil, strips: SlitterOptimizer.generateStripsFromCombination(combo, coil) };
      })
      .filter((x): x is OrderCoilInput => !!x);
  }, [selectedCoils, perCoilCombinations]);

  const totalStripsCount = useMemo(
    () => coilCutInputs.reduce((acc, c) => acc + c.strips.length, 0),
    [coilCutInputs]
  );

  const aggregateAproveitamentoPercent = useMemo(() => {
    const totalLargura = coilCutInputs.reduce((acc, c) => acc + c.coil.largura, 0);
    if (totalLargura === 0) return 0;
    const totalUsada = coilCutInputs.reduce((acc, c) => acc + c.strips.reduce((a, s) => a + s.largura, 0), 0);
    return Number(((totalUsada / totalLargura) * 100).toFixed(2));
  }, [coilCutInputs]);

  const matchedFerramental = useMemo(() => {
    if (!selectedProduct) return null;
    const sltCode = SlitterCatalogService.getSlitterInfo(selectedProduct.larguraFita, selectedProduct.espessura, selectedProduct).code;
    return ferramentais.find(f => f.codigo === sltCode) || null;
  }, [selectedProduct, ferramentais]);

  const policyAlerts: PolicyAlert[] = useMemo(() => {
    const alerts: PolicyAlert[] = [];
    if (!selectedProduct) return alerts;

    if (selectedProduct.volumePoliticaT && (
      totalSelectedCoilsWeightTon < selectedProduct.volumePoliticaT.minimo ||
      totalSelectedCoilsWeightTon > selectedProduct.volumePoliticaT.maximo
    )) {
      alerts.push({
        id: 'volume-item',
        tone: 'amber',
        message: `Quantidade fora da política de volume deste item (mín ${selectedProduct.volumePoliticaT.minimo}t / ideal ${selectedProduct.volumePoliticaT.ideal}t / máx ${selectedProduct.volumePoliticaT.maximo}t).`
      });
    }

    if (matchedFerramental) {
      const foraDaPolitica = totalSelectedCoilsWeightTon < matchedFerramental.capacidadeMinimaT || totalSelectedCoilsWeightTon > matchedFerramental.capacidadeMaximaT;
      if (matchedFerramental.classe === 'C' && totalSelectedCoilsWeightTon < matchedFerramental.capacidadeMinimaT) {
        alerts.push({
          id: 'abc-classe-c',
          tone: 'violet',
          message: `Ferramental Classe C (Menos Roda): recomenda-se atingir o lote mínimo de ${matchedFerramental.capacidadeMinimaT}t para amortizar o tempo de setup no chão de fábrica.`
        });
      }
      if (foraDaPolitica) {
        alerts.push({
          id: 'volume-ferramental',
          tone: 'amber',
          message: `Volume programado (${totalSelectedCoilsWeightTon}t) fora da política de capacidade do ferramental ${matchedFerramental.codigo} (mín ${matchedFerramental.capacidadeMinimaT}t / ideal ${matchedFerramental.capacidadeIdealT}t / máx ${matchedFerramental.capacidadeMaximaT}t).`
        });
      }
    }

    if (totalSelectedCoilsWeightTon > 0 && totalSelectedCoilsWeightTon < 20) {
      alerts.push({
        id: 'fragmentacao-lote',
        tone: 'amber',
        message: 'Atenção: volume baixo para este setup (< 20t). Quanto menos matéria-prima por setup, maior o custo relativo de troca de facas.'
      });
    }

    return alerts;
  }, [selectedProduct, matchedFerramental, totalSelectedCoilsWeightTon]);

  // O Estúdio de Simulação (SimulationView) só sabe editar 1 bobina por vez —
  // com múltiplas bobinas, o operador vai direto para a Etapa 3 com o plano já
  // calculado por bobina.
  const handleSimulate = () => {
    if (coilCutInputs.length !== 1) return;
    const { coil, strips } = coilCutInputs[0];
    onProceedToSimulation(coil, strips, selectedCombination || undefined);
  };

  const handleGenerateOrder = () => {
    if (coilCutInputs.length === 0 || !operador || !maquina) return;
    const order = OrderBuilderService.buildNew(coilCutInputs, { operador, turno, maquina, observacoes });
    StorageService.addOrder(order);
    onOrderCreated(order);
  };

  const stepsList = [
    { num: 1, title: 'Escolher o que Produzir' },
    { num: 2, title: 'Revisar & Confirmar' },
    { num: 3, title: 'Emitir OP' }
  ];

  return (
    <div className="space-y-5 pb-16 animate-fadeIn">
      <StepIndicator
        steps={stepsList}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        isStepEnabled={(num) => (num === 2 && !!selectedProduct) || (num === 3 && coilCutInputs.length > 0)}
      />

      {/* ETAPA 1: Escolher o que Produzir */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Painel</span>
                </button>
              )}
              <div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Etapa 1: Escolher o que Produzir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  O sistema já calcula a melhor bobina e o melhor plano de corte — aceite em 1 clique ou personalize.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'PRONTO', label: 'Prontos para Produzir', count: prontoCount },
              { id: 'PARCIAL', label: 'Parciais', count: parcialCount },
              { id: 'TODOS', label: 'Todos os Slitters', count: slitterDemands.length },
              { id: 'BLOQUEADO', label: 'Sem Bobina', count: bloqueadoCount }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReadinessFilter(f.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  readinessFilter === f.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${readinessFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição do slitter..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <select
              value={thicknessFilter}
              onChange={(e) => setThicknessFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="TODOS">Todas as Espessuras</option>
              {uniqueThicknesses.map(th => (
                <option key={th} value={th}>{th} mm</option>
              ))}
            </select>

            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value as any)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="TODOS">Todas as Famílias</option>
              <option value="TUBO">TUBO</option>
              <option value="PERFIL">PERFIL</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredSlitterDemands.map((item) => {
              const abc = abcByFerramentalCodigo.get(item.codigoSlitter);
              const wipTon = CoilCompatibilityService.getIntermediaryStockTon(item.mainProduct, intermediarySlitters);

              return (
                <OpSuggestionCard
                  key={item.id}
                  item={item}
                  wipAvailableTon={wipTon}
                  ferramentalClasse={abc?.ferramental.classe}
                  ferramentalPronta={abc?.prontaParaSetup}
                  ferramentalStatusAcumulo={abc?.statusAcumulo}
                  onAccept={() => handleAcceptSuggestion(item)}
                  onCustomize={() => handleCustomize(item)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ETAPA 2: Revisar & Confirmar */}
      {currentStep === 2 && selectedProduct && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à Etapa 1</span>
              </button>
              <div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Etapa 2: Revisar & Confirmar o Plano de Corte
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Destino: <strong className="text-slate-700">{selectedProduct.codigo}</strong> · Espessura {selectedProduct.espessura} mm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 pl-2">Quantidade (t):</span>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={desiredQtyTon}
                onChange={(e) => setDesiredQtyTon(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-semibold text-emerald-700 focus:outline-none focus:border-blue-500 text-center"
              />
            </div>
          </div>

          {/* Banners preventivos SEMPRE visíveis, antes de qualquer confirmação */}
          <PolicyAlertBar alerts={policyAlerts} />

          {selectedCoils.length > 0 && !showManualCoilPicker && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>
                      {selectedCoils.length} bobina(s) — {totalSelectedCoilsWeightTon}t
                      {coilCutInputs.length === 1 && ` · ${aggregateAproveitamentoPercent}% aproveitamento`}
                    </span>
                  </div>
                  {selectedCoils.map(c => (
                    <span key={c.id} className="text-xs text-slate-500 font-mono">Lote {c.lote} ({c.peso}t)</span>
                  ))}
                  {matchedFerramental && <MetricsBadge type="ferramental_abc" value={matchedFerramental.classe} size="sm" />}
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualCoilPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Trocar bobina(s)</span>
                </button>
              </div>

              {!isDemandCovered && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Faltam <strong className="font-medium">{(desiredQtyTon - totalSelectedCoilsWeightTon).toFixed(2)} t</strong> para atingir a meta.</span>
                </div>
              )}

              {coilCutInputs.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {coilCutInputs.length > 1 && (
                    <span className="text-xs font-medium text-slate-500">Plano de corte — cada bobina com seu próprio corte:</span>
                  )}
                  {coilCutInputs.map(({ coil, strips }, idx) => (
                    <div key={coil.id} className="space-y-1.5">
                      {coilCutInputs.length > 1 && (
                        <div className="text-[11px] font-medium text-slate-500">
                          Bobina {idx + 1} de {coilCutInputs.length} — Lote {coil.lote} ({coil.peso}t)
                        </div>
                      )}
                      <SlitterVisualizer coil={coil} strips={strips} interactive={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showManualCoilPicker && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{selectedCoils.length} de {rankedCoils.length} bobina(s) selecionada(s)</span>
                  </div>
                  <span className="text-slate-500">
                    Demanda: <strong className="text-slate-800 font-medium">{desiredQtyTon} t</strong> · Acumulado: <strong className="text-emerald-700 font-medium">{totalSelectedCoilsWeightTon} t</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isDemandCovered && (
                    <button
                      type="button"
                      onClick={handleSelectAllCoils}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Auto-selecionar para {desiredQtyTon}t
                    </button>
                  )}
                  {selectedCoils.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedCoils([]); }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Desselecionar todas
                    </button>
                  )}
                  {selectedCoils.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowManualCoilPicker(false)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Confirmar seleção
                    </button>
                  )}
                </div>
              </div>

              {rankedCoils.length === 0 ? (
                <div className="p-6 rounded-lg bg-red-50 text-red-800 text-sm text-center">
                  Nenhuma bobina disponível no estoque para espessura de {selectedProduct.espessura} mm!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rankedCoils.map((rc) => {
                    const isSelected = selectedCoils.some(sc => sc.id === rc.coil.id);
                    const isLocked = isDemandCovered && !isSelected;
                    return (
                      <CoilCard
                        key={rc.coil.id}
                        coil={rc.coil}
                        isSelected={isSelected}
                        isLocked={isLocked}
                        onSelect={() => handleToggleCoil(rc.coil)}
                        compatibilityBadge={<CoilCompatibilityBadge ranked={rc} />}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedCoils.length <= 1 && combinations.length > 1 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAllCombinations(!showAllCombinations)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {showAllCombinations ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>Ver outras {combinations.length - 1} combinações</span>
              </button>

              {showAllCombinations && (
                <div className="space-y-2">
                  {combinations.map((comb, idx) => {
                    const isSelected = selectedCombination?.id === comb.id;
                    return (
                      <div
                        key={comb.id || idx}
                        onClick={() => setSelectedCombination(comb)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer bg-white text-xs ${
                          isSelected ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-800">{idx === 0 ? 'Recomendada pelo sistema' : `Alternativa ${idx}`}: {comb.descricao}</span>
                          <span className="font-mono text-emerald-700">{comb.aproveitamentoPercent}% · {comb.sobraMm}mm</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleSimulate}
              disabled={coilCutInputs.length !== 1}
              title={coilCutInputs.length > 1 ? 'O Estúdio de Simulação só edita 1 bobina por vez' : undefined}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Scissors className="w-4 h-4" />
              <span>Simular no Visualizador</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={coilCutInputs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{isDemandCovered ? 'Confirmar & Avançar para Emissão' : 'Avançar mesmo com cobertura parcial'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Emitir OP */}
      {currentStep === 3 && coilCutInputs.length === 0 && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">Nenhuma bobina selecionada</h3>
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors"
          >
            <span>Voltar à Etapa 2</span>
          </button>
        </div>
      )}

      {currentStep === 3 && coilCutInputs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar à Etapa 2</span>
            </button>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Etapa 3: Emitir Ordem de Produção</h3>
              <p className="text-xs text-slate-500 mt-0.5">Confirme os dados operacionais antes de gerar a OP.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Operador *</label>
                <select
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="mt-1 w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Selecione...</option>
                  {OPERADORES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Turno *</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="mt-1 w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Máquina / Slitter *</label>
                <select
                  value={maquina}
                  onChange={(e) => setMaquina(e.target.value)}
                  className="mt-1 w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Selecione...</option>
                  {MAQUINAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais para a linha de produção (opcional)"
                rows={3}
                className="mt-1 w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <span>Bobina(s): <strong className="font-mono">{coilCutInputs.map(c => c.coil.lote).join(' + ')}</strong></span>
              <span>Peso total: <strong className="font-mono">{totalSelectedCoilsWeightTon}t</strong></span>
              <span>Fitas: <strong className="font-mono">{totalStripsCount}</strong></span>
              <span>Aproveitamento: <strong className="font-mono text-emerald-700">{aggregateAproveitamentoPercent}%</strong></span>
            </div>

            <button
              onClick={handleGenerateOrder}
              disabled={!operador || !maquina}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Gerar & Salvar OP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
