import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Coil,
  SlitterCombination,
  SlitterStrip,
  Ferramental
} from '../types/pcp';
import { 
  SlitterOptimizer 
} from '../services/slitterOptimizer';
import { ReadinessService } from '../services/readinessService';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { CoilCard } from '../components/CoilCard';
import { MetricsBadge } from '../components/MetricsBadge';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Scissors, 
  Check, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ArrowLeft
} from 'lucide-react';

interface PlanningViewProps {
  products: Product[];
  coils: Coil[];
  ferramentais: Ferramental[];
  preSelectedProductId?: string | null;
  onProceedToSimulation: (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => void;
  onProceedToOrder: (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => void;
  onNavigateToDashboard?: () => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  products,
  coils,
  ferramentais,
  preSelectedProductId,
  onProceedToSimulation,
  onProceedToOrder,
  onNavigateToDashboard
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected Product & Filters
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [readinessFilter, setReadinessFilter] = useState<'PRONTO' | 'PARCIAL' | 'TODOS' | 'BLOQUEADO'>('PRONTO');
  const [familyFilter, setFamilyFilter] = useState<'TODOS' | 'TUBO' | 'PERFIL'>('TODOS');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');

  // Step 2: Desired Quantity
  const [desiredQtyTon, setDesiredQtyTon] = useState<number>(10);

  // Step 4: Selected Coil Lots (Multi-Coil selection)
  const [selectedCoils, setSelectedCoils] = useState<Coil[]>([]);

  const selectedCoil = useMemo(() => selectedCoils[0] || null, [selectedCoils]);

  const totalSelectedCoilsWeightTon = useMemo(() => {
    return Number(selectedCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(3));
  }, [selectedCoils]);

  // Step 6: Selected Slitter Combination
  const [selectedCombination, setSelectedCombination] = useState<SlitterCombination | null>(null);

  // Analyze slitter readiness
  const slitterDemands = useMemo(() => {
    const list = ReadinessService.analyzeSlitters(products, coils);
    return ReadinessService.sortSlittersByReadiness(list);
  }, [products, coils]);

  const prontoCount = slitterDemands.filter(r => r.status === 'PRONTO').length;
  const parcialCount = slitterDemands.filter(r => r.status === 'PARCIAL').length;
  const bloqueadoCount = slitterDemands.filter(r => r.status === 'BLOQUEADO').length;

  useEffect(() => {
    if (preSelectedProductId) {
      const p = products.find(prod => prod.id === preSelectedProductId || prod.codigo === preSelectedProductId);
      if (p) {
        setSelectedProduct(p);
        const slt = slitterDemands.find(s => s.larguraFita === p.larguraFita && s.espessura === p.espessura);
        setDesiredQtyTon(slt?.totalDemandaT || p.demandaT || 10);
        setCurrentStep(3);
      }
    }
  }, [preSelectedProductId, products, slitterDemands]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    products.forEach(p => set.add(p.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const filteredSlitterDemands = useMemo(() => {
    let list = slitterDemands;

    if (readinessFilter !== 'TODOS') {
      list = list.filter(r => r.status === readinessFilter);
    }
    if (thicknessFilter !== 'TODOS') {
      list = list.filter(r => r.espessura === Number(thicknessFilter));
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(r => 
        r.codigoSlitter.toLowerCase().includes(q) ||
        r.nomeSlitter.toLowerCase().includes(q) ||
        `${r.larguraFita}`.includes(q)
      );
    }

    return ReadinessService.sortSlittersByReadiness(list);
  }, [slitterDemands, readinessFilter, thicknessFilter, productSearch]);

  const compatibleCoils = useMemo(() => {
    if (!selectedProduct) return [];
    return coils.filter(c => 
      c.status === 'Disponível' && 
      Math.abs(c.espessura - selectedProduct.espessura) < 0.001
    ).sort((a, b) => b.largura - a.largura);
  }, [coils, selectedProduct]);

  const isDemandCovered = useMemo(() => {
    return desiredQtyTon > 0 && totalSelectedCoilsWeightTon >= desiredQtyTon;
  }, [totalSelectedCoilsWeightTon, desiredQtyTon]);

  const handleToggleCoil = (coil: Coil) => {
    if (selectedCoils.some(c => c.id === coil.id)) {
      setSelectedCoils(selectedCoils.filter(c => c.id !== coil.id));
    } else {
      if (isDemandCovered) {
        // Lock coil selection when desired demand is already 100% fulfilled
        return;
      }
      setSelectedCoils([...selectedCoils, coil]);
    }
  };

  const handleSelectAllCoils = () => {
    let accum = 0;
    const neededCoils: Coil[] = [];
    for (const c of compatibleCoils) {
      neededCoils.push(c);
      accum += c.peso;
      if (accum >= desiredQtyTon) break;
    }
    setSelectedCoils(neededCoils);
  };

  const handleClearCoilSelection = () => {
    setSelectedCoils([]);
  };

  const combinations = useMemo(() => {
    if (!selectedProduct || !selectedCoil) return [];
    return SlitterOptimizer.optimize({
      mainProduct: selectedProduct,
      desiredQuantityTon: desiredQtyTon,
      selectedCoil: selectedCoil,
      compatibleProducts: products,
      minScrapMm: 10,
      maxScrapAllowedMm: 18
    });
  }, [selectedProduct, selectedCoil, desiredQtyTon, products]);

  useEffect(() => {
    if (combinations.length > 0) {
      setSelectedCombination(combinations[0]);
    }
  }, [combinations]);

  const step5Calculation = useMemo(() => {
    if (!selectedProduct || !selectedCoil) return null;
    const fitasPossiveis = Math.floor(selectedCoil.largura / selectedProduct.larguraFita);
    const larguraOcupada = fitasPossiveis * selectedProduct.larguraFita;
    const sobraMm = selectedCoil.largura - larguraOcupada;
    const aproveitamento = Number(((larguraOcupada / selectedCoil.largura) * 100).toFixed(2));
    const isSobraPermitida = sobraMm >= 10 && sobraMm <= 18;

    return {
      fitasPossiveis,
      larguraOcupada,
      sobraMm,
      aproveitamento,
      isSobraPermitida
    };
  }, [selectedProduct, selectedCoil]);

  const currentStrips = useMemo(() => {
    if (!selectedCoil) return [];
    
    // Create effective coil for strip weight calculation considering total multi-coil tonnage
    const effectiveCoil: Coil = selectedCoils.length > 1 ? {
      ...selectedCoil,
      peso: totalSelectedCoilsWeightTon,
      lote: selectedCoils.map(c => c.lote).join(' + ')
    } : selectedCoil;

    if (selectedCombination) {
      return SlitterOptimizer.generateStripsFromCombination(selectedCombination, effectiveCoil);
    }
    return [];
  }, [selectedCombination, selectedCoil, selectedCoils, totalSelectedCoilsWeightTon]);

  const handleFinishPlanning = (action: 'simulation' | 'order') => {
    if (!selectedCoil || currentStrips.length === 0) return;

    const targetCoil: Coil = selectedCoils.length > 1 ? {
      ...selectedCoil,
      lote: selectedCoils.map(c => c.lote).join(' + '),
      peso: totalSelectedCoilsWeightTon,
      quantidade: selectedCoils.length
    } : selectedCoil;

    if (action === 'simulation') {
      onProceedToSimulation(targetCoil, currentStrips, selectedCombination || undefined);
    } else {
      onProceedToOrder(targetCoil, currentStrips, selectedCombination || undefined);
    }
  };

  const stepsList = [
    { num: 1, title: 'Slitter & Demanda' },
    { num: 2, title: 'Seleção de Bobinas' },
    { num: 3, title: 'Plano de Corte & OP' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 3-Step Wizard Header Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <button
                key={st.num}
                onClick={() => {
                  if (isCompleted || (st.num === 2 && selectedProduct) || (st.num === 3 && selectedCoil)) {
                    setCurrentStep(st.num);
                  }
                }}
                className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-white text-blue-700 font-black' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? '✓' : st.num}
                </div>
                <span className="truncate">Etapa {st.num}: {st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ETAPA 1: Selecionar Slitter & Quantidade (t) */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 text-blue-600" />
                  <span>Voltar ao Painel</span>
                </button>
              )}
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Etapa 1: Selecionar Slitter a Produzir & Demanda (t)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Escolha o slitter e defina a quantidade planejada de toneladas.
                </p>
              </div>
            </div>

            {selectedProduct && (
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <span>Avançar para Seleção de Bobinas (Etapa 2)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Feasibility Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'PRONTO', label: '🔥 Prontos para Produzir', count: prontoCount },
              { id: 'PARCIAL', label: '⚠️ Parciais', count: parcialCount },
              { id: 'TODOS', label: 'Todos os Slitters', count: slitterDemands.length },
              { id: 'BLOQUEADO', label: '✕ Sem Bobina', count: bloqueadoCount }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReadinessFilter(f.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  readinessFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  readinessFilter === f.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição do slitter..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase text-[10px]">Espessura:</span>
              <select
                value={thicknessFilter}
                onChange={(e) => setThicknessFilter(e.target.value)}
                className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs font-bold"
              >
                <option value="TODOS">Todas as Espessuras</option>
                {uniqueThicknesses.map(th => (
                  <option key={th} value={th}>{th} mm</option>
                ))}
              </select>
            </div>
          </div>

          {/* Slitter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredSlitterDemands.map((s) => {
              const p = s.mainProduct;
              const isSelected = selectedProduct?.larguraFita === s.larguraFita && selectedProduct?.espessura === s.espessura;
              const isReady = s.status === 'PRONTO';
              const isPartial = s.status === 'PARCIAL';

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setDesiredQtyTon(s.totalDemandaT || 10);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white space-y-3 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold font-mono text-blue-900">{s.codigoSlitter}</span>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Pronto
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Parcial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold font-mono">
                        <XCircle className="w-2.5 h-2.5 text-red-600" /> Sem Bobina
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs text-slate-800 font-bold line-clamp-1">{s.nomeSlitter}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Destino: {p.codigo} ({p.descricao})</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs font-mono text-center">
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Fita</span>
                      <strong className="text-blue-700 font-bold">{s.larguraFita} mm</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Espessura</span>
                      <strong className="text-purple-800 font-bold">{s.espessura} mm</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Demanda</span>
                      <strong className="text-amber-700 font-bold">{s.totalDemandaT} t</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Tonnage & Proceed Panel when Slitter Selected */}
          {selectedProduct && (
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                    SLITTER SELECIONADO:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h4 className="text-base font-bold text-slate-900 font-mono">
                      {SlitterCatalogService.getSlitterInfo(selectedProduct.larguraFita, selectedProduct.espessura, selectedProduct).code}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                      {selectedProduct.larguraFita} x {selectedProduct.espessura} mm
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 pl-2">Quantidade (t):</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={desiredQtyTon}
                      onChange={(e) => setDesiredQtyTon(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-600 text-center"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 25, 50].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDesiredQtyTon(t)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          desiredQtyTon === t
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t}t
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>Ir para Seleção de Bobinas (Etapa 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedProduct.volumePoliticaT && (
                desiredQtyTon < selectedProduct.volumePoliticaT.minimo || desiredQtyTon > selectedProduct.volumePoliticaT.maximo
              ) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Quantidade fora da política de volume deste item (mín {selectedProduct.volumePoliticaT.minimo}t / ideal {selectedProduct.volumePoliticaT.ideal}t / máx {selectedProduct.volumePoliticaT.maximo}t).
                    Produções muito pequenas ou muito grandes tendem a aumentar setups ou reduzir eficiência.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 2: Seleção de Bobinas Matrizes */}
      {currentStep === 2 && selectedProduct && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span>Voltar à Etapa 1</span>
              </button>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Etapa 2: Seleção de Bobinas Matrizes no Estoque
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lotes disponíveis com espessura de <strong className="text-purple-700 font-mono">{selectedProduct.espessura} mm</strong>.
                </p>
              </div>
            </div>

            {selectedCoils.length > 0 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <span>Avançar para Plano de Corte ({selectedCoils.length} Lote{selectedCoils.length > 1 ? 's' : ''})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {compatibleCoils.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>{selectedCoils.length} de {compatibleCoils.length} Bobina(s) Selecionada(s)</span>
                  </div>

                  <span className="text-slate-600 font-bold">
                    Demanda: <strong className="text-blue-900">{desiredQtyTon} t</strong> • Acumulado: <strong className="text-emerald-700">{totalSelectedCoilsWeightTon} t</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isDemandCovered && (
                    <button
                      type="button"
                      onClick={handleSelectAllCoils}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                      ✓ Auto-Selecionar para {desiredQtyTon}t
                    </button>
                  )}
                  {selectedCoils.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCoilSelection}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-all"
                    >
                      ✕ Desselecionar Todas ({selectedCoils.length})
                    </button>
                  )}
                </div>
              </div>

              {selectedCoils.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Nenhuma bobina selecionada. Clique em uma das bobinas abaixo para selecionar.</span>
                </div>
              )}

              {selectedCoils.length > 0 && (isDemandCovered ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <strong>🔒 Demanda de {desiredQtyTon} t 100% Atendida!</strong>
                  </span>
                  <span className="text-[11px] bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    {totalSelectedCoilsWeightTon}t / {desiredQtyTon}t
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Faltam <strong>{(desiredQtyTon - totalSelectedCoilsWeightTon).toFixed(2)} t</strong> para atingir a meta.</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {compatibleCoils.length === 0 ? (
            <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
              <h4 className="text-sm font-bold text-red-900">
                Nenhuma bobina disponível no estoque para espessura de {selectedProduct.espessura} mm!
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compatibleCoils.map((c) => {
                const isSelected = selectedCoils.some(sc => sc.id === c.id);
                const isLocked = isDemandCovered && !isSelected;

                return (
                  <CoilCard
                    key={c.id}
                    coil={c}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onSelect={() => handleToggleCoil(c)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 3: Plano de Corte & Otimização & Emitir OP */}
      {currentStep === 3 && selectedProduct && (!selectedCoil || selectedCoils.length === 0) && (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Nenhuma Bobina Selecionada</h3>
          <p className="text-xs text-slate-500">
            Selecione pelo menos um lote de bobina na Etapa 2 para gerar o plano de corte slitter.
          </p>
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            <span>Ir para Seleção de Bobinas (Etapa 2)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {currentStep === 3 && selectedProduct && selectedCoil && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span>Voltar à Seleção de Bobinas</span>
              </button>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Etapa 3: Plano de Corte & Otimização do Slitter
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Refilo padrão de 10 a 18 mm (~1,5%) para {selectedCoils.length > 1 ? `${selectedCoils.length} bobinas (${totalSelectedCoilsWeightTon} t)` : `a bobina de ${selectedCoil.largura} mm`}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFinishPlanning('simulation')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
              >
                <Scissors className="w-4 h-4 text-blue-600" />
                <span>Simular no Visualizador</span>
              </button>

              <button
                onClick={() => handleFinishPlanning('order')}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gerar Ordem de Produção (OP)</span>
              </button>
            </div>
          </div>

          {(() => {
            const sltCode = SlitterCatalogService.getSlitterInfo(selectedProduct.larguraFita, selectedProduct.espessura, selectedProduct).code;
            const matchedFerramental = ferramentais.find(f => f.codigo === sltCode);
            if (!matchedFerramental) return null;
            const foraDaPolitica = totalSelectedCoilsWeightTon < matchedFerramental.capacidadeMinimaT || totalSelectedCoilsWeightTon > matchedFerramental.capacidadeMaximaT;
            if (!foraDaPolitica) return null;
            return (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Volume programado ({totalSelectedCoilsWeightTon}t) fora da política de capacidade do ferramental {matchedFerramental.codigo} — {matchedFerramental.nome}
                  (mín {matchedFerramental.capacidadeMinimaT}t / ideal {matchedFerramental.capacidadeIdealT}t / máx {matchedFerramental.capacidadeMaximaT}t).
                </span>
              </div>
            );
          })()}

          {selectedCombination && (
            <div className="space-y-4">
              {selectedCoils.map((coilItem, cIdx) => {
                const coilStrips = SlitterOptimizer.generateStripsFromCombination(selectedCombination, coilItem);

                return (
                  <div key={coilItem.id || cIdx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                          #{cIdx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            Bobina Lote <strong className="text-blue-700">{coilItem.lote}</strong> ({coilItem.codigo})
                          </span>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Largura: {coilItem.largura} mm | Espessura: {coilItem.espessura} mm | Peso: {coilItem.peso} t
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-lg">
                        Rendimento: {coilItem.peso} t
                      </span>
                    </div>

                    <SlitterVisualizer
                      coil={coilItem}
                      strips={coilStrips}
                      interactive={false}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Combinations List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Combinações de Corte Ranqueadas ({combinations.length}):
            </h4>

            <div className="space-y-2.5">
              {combinations.map((comb, idx) => {
                const isSelected = selectedCombination?.id === comb.id;

                return (
                  <div
                    key={comb.id || idx}
                    onClick={() => setSelectedCombination(comb)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{comb.descricao}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {comb.badgeTexto}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {comb.fitas.map((f, fIdx) => {
                              const slt = SlitterCatalogService.getSlitterInfo(f.product.larguraFita, f.product.espessura, f.product);

                              return (
                                <span
                                  key={fIdx}
                                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono font-medium"
                                >
                                  <strong className="text-blue-700 font-bold">{f.quantidade}x {slt.code} ({f.product.larguraFita}mm)</strong> → p/ {f.product.codigo}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-slate-400 text-[9px] uppercase font-bold">Largura Útil</div>
                          <div className="font-bold text-slate-900">{comb.totalLarguraUsada} mm</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[9px] uppercase font-bold">Refilo</div>
                          <div className="font-bold text-emerald-700">{comb.sobraMm} mm</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[9px] uppercase font-bold">Aproveitamento</div>
                          <div className="font-bold text-emerald-700 text-sm">{comb.aproveitamentoPercent}%</div>
                        </div>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ Selecionada' : 'Selecionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

