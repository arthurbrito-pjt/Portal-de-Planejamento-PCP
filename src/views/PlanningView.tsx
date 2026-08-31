import React, { useState, useMemo, useEffect } from 'react';
import { 
  Product, 
  Coil, 
  SlitterCombination, 
  SlitterStrip 
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
  XCircle 
} from 'lucide-react';

interface PlanningViewProps {
  products: Product[];
  coils: Coil[];
  preSelectedProductId?: string | null;
  onProceedToSimulation: (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => void;
  onProceedToOrder: (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  products,
  coils,
  preSelectedProductId,
  onProceedToSimulation,
  onProceedToOrder
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
    return totalSelectedCoilsWeightTon >= desiredQtyTon;
  }, [totalSelectedCoilsWeightTon, desiredQtyTon]);

  const handleToggleCoil = (coil: Coil) => {
    if (selectedCoils.some(c => c.id === coil.id)) {
      if (selectedCoils.length > 1) {
        setSelectedCoils(selectedCoils.filter(c => c.id !== coil.id));
      }
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
    if (compatibleCoils.length > 0) {
      setSelectedCoils([compatibleCoils[0]]);
    }
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
    { num: 1, title: 'Slitter a Produzir' },
    { num: 2, title: 'Quantidade (t)' },
    { num: 3, title: 'Bobinas Compatíveis' },
    { num: 4, title: 'Selecionar Lote' },
    { num: 5, title: 'Cálculo de Fitas' },
    { num: 6, title: 'Otimização do Slitter' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Wizard Progress Header Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-2.5 pb-1">
          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <button
                key={st.num}
                onClick={() => {
                  if (isCompleted || (st.num <= 3 && selectedProduct) || (st.num <= 5 && selectedCoil)) {
                    setCurrentStep(st.num);
                  }
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? '✓' : st.num}
                </div>
                <span>Passo {st.num}: {st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Slitter */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  1
                </span>
                Passo 1: Selecionar o Slitter a Produzir
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Selecione o Slitter a ser cortado. A demanda é a soma total das necessidades de tubos e perfis.
              </p>
            </div>

            {selectedProduct && (
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <span>Avançar para Passo 2 (Quantidade)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Feasibility Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'PRONTO', label: '🔥 Prontos para Produzir (100% Viáveis)', count: prontoCount },
              { id: 'PARCIAL', label: '⚠️ Atendimento Parcial', count: parcialCount },
              { id: 'TODOS', label: 'Todos os Slitters', count: slitterDemands.length },
              { id: 'BLOQUEADO', label: '✕ Sem Bobina no Estoque', count: bloqueadoCount }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReadinessFilter(f.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                  readinessFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
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
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição do slitter..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase text-[10px]">Espessura:</span>
              <select
                value={thicknessFilter}
                onChange={(e) => setThicknessFilter(e.target.value)}
                className="flex-1 py-2.5 px-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm font-bold"
              >
                <option value="TODOS">Todas as Espessuras</option>
                {uniqueThicknesses.map(th => (
                  <option key={th} value={th}>{th} mm</option>
                ))}
              </select>
            </div>
          </div>

          {/* Slitter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
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
                  className={`p-4 rounded-3xl border transition-all cursor-pointer group bg-white shadow-sm space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 -translate-y-1'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Slitter Header */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase block tracking-wider">
                      ✂️ SLITTER A PRODUZIR:
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-sm font-mono font-black text-blue-900">{s.codigoSlitter}</span>
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold font-mono">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          Pronto ({s.compatibleLotCount} lotes)
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                          Parcial ({s.coveragePercent}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300 text-[10px] font-bold font-mono">
                          <XCircle className="w-2.5 h-2.5 text-red-600" />
                          Sem Bobina
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs text-slate-800 line-clamp-1 font-bold mt-1">
                      {s.nomeSlitter}
                    </h4>
                  </div>

                  {/* Destination Material */}
                  <div className="bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/70">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase block tracking-wider">
                      🏭 MATERIAL DE DESTINO:
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-mono font-black text-slate-900">{p.codigo}</span>
                      <MetricsBadge type="familia" value={p.familia} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {p.descricao}
                    </p>
                  </div>

                  {s.bestCoil && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                      <span>Bobina: <strong className="text-blue-700">{s.bestCoil.lote}</strong> ({s.bestCoil.largura}mm)</span>
                      <span className="text-emerald-700 font-bold">Aprov: {s.estimatedYieldPercent}%</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Largura Fita</span>
                      <strong className="text-blue-700 font-black text-xs">{s.larguraFita} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Espessura</span>
                      <strong className="text-purple-800 font-black text-xs">{s.espessura} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Demanda Total</span>
                      <strong className="text-amber-700 font-black text-xs">
                        {s.totalDemandaT} t
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Quantity */}
      {currentStep === 2 && selectedProduct && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                2
              </span>
              Passo 2: Informar a Quantidade de Slitter a Produzir
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Informe a quantidade de toneladas do Slitter a ser programada para corte.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-blue-900 font-mono">
                  {SlitterCatalogService.getSlitterInfo(selectedProduct.larguraFita, selectedProduct.espessura, selectedProduct).code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                  {selectedProduct.larguraFita} x {selectedProduct.espessura} mm
                </span>
              </div>
              <p className="text-xs text-slate-800 mt-1 font-bold">
                {SlitterCatalogService.getSlitterInfo(selectedProduct.larguraFita, selectedProduct.espessura, selectedProduct).name}
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-700 hover:text-blue-800 font-black underline"
            >
              Trocar Slitter
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Quantidade Planejada (Toneladas):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={desiredQtyTon}
                onChange={(e) => setDesiredQtyTon(parseFloat(e.target.value) || 0)}
                className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-2xl font-mono font-black text-emerald-700 focus:outline-none focus:border-blue-600"
              />
              <span className="text-base font-black text-slate-500 font-mono">TONELADAS</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[5, 10, 15, 25, 50].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDesiredQtyTon(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black transition-all ${
                    desiredQtyTon === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t} t
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
            >
              ← Voltar ao Passo 1
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20"
            >
              <span>Localizar Bobinas Compatíveis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Compatible Coils (Multi-Coil Selection & Demand Locking) */}
      {(currentStep === 3 || currentStep === 4) && selectedProduct && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  {currentStep}
                </span>
                Passo {currentStep === 3 ? '3: Bobinas Compatíveis Localizadas' : '4: Selecionar Lote(s) de Bobina'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Localizamos <strong>{compatibleCoils.length} lotes disponíveis</strong> no estoque com espessura de <strong className="text-purple-700 font-mono">{selectedProduct.espessura} mm</strong>.
              </p>
            </div>

            {selectedCoils.length > 0 && (
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <span>Avançar para Passo 5 ({selectedCoils.length} Lote{selectedCoils.length > 1 ? 's' : ''})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {compatibleCoils.length > 0 && (
            <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl font-mono text-xs font-black flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>{selectedCoils.length} de {compatibleCoils.length} Bobina(s) Selecionada(s)</span>
                  </div>

                  <div className="text-xs text-slate-700 font-mono font-bold flex items-center gap-2">
                    <span>Demanda Solicitada: <strong className="text-blue-900 font-black">{desiredQtyTon} t</strong></span>
                    <span>•</span>
                    <span>Peso Acumulado: <strong className="text-emerald-700 text-sm font-black">{totalSelectedCoilsWeightTon} t</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isDemandCovered && (
                    <button
                      type="button"
                      onClick={handleSelectAllCoils}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-sm transition-all"
                    >
                      ✓ Auto-Selecionar para {desiredQtyTon}t
                    </button>
                  )}
                  {selectedCoils.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearCoilSelection}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 transition-all"
                    >
                      Manter Apenas 1 Lote
                    </button>
                  )}
                </div>
              </div>

              {/* Demand Locking Alert Bar */}
              {isDemandCovered ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <strong>🔒 Demanda de {desiredQtyTon} t 100% Atendida!</strong> A seleção de novos lotes foi travada para evitar exceder o peso da demanda.
                  </span>
                  <span className="text-[11px] bg-emerald-200/60 px-2.5 py-0.5 rounded-full font-black">
                    {((totalSelectedCoilsWeightTon / desiredQtyTon) * 100).toFixed(0)}% Atendido ({totalSelectedCoilsWeightTon}t / {desiredQtyTon}t)
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Selecione mais bobinas para atingir a meta de <strong>{desiredQtyTon} t</strong> (Faltam <strong>{(desiredQtyTon - totalSelectedCoilsWeightTon).toFixed(2)} t</strong>).</span>
                  </span>
                  <span className="text-[11px] bg-amber-200/60 px-2.5 py-0.5 rounded-full font-black">
                    {((totalSelectedCoilsWeightTon / desiredQtyTon) * 100).toFixed(0)}% Atendido
                  </span>
                </div>
              )}
            </div>
          )}

          {compatibleCoils.length === 0 ? (
            <div className="bg-red-50 p-10 rounded-3xl border border-red-200 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <h4 className="text-base font-bold text-red-900">
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
                    onSelect={() => {
                      handleToggleCoil(c);
                      setCurrentStep(4);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Initial Strip Calculation */}
      {currentStep === 5 && selectedProduct && selectedCoil && step5Calculation && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  5
                </span>
                Passo 5: Resultado do Corte Exclusivo na Bobina
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lote(s): <strong className="text-blue-700 font-mono">{selectedCoils.map(c => c.lote).join(', ')}</strong> | Largura Base: <strong className="text-slate-900 font-mono">{selectedCoil.largura} mm</strong> | Peso Total: <strong className="text-emerald-700 font-mono">{totalSelectedCoilsWeightTon} t</strong>
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Trocar / Ajustar Lotes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold uppercase text-[10px]">Largura Bobina</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                {selectedCoil.largura} mm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold uppercase text-[10px]">Fitas do Produto Principal</span>
              <span className="text-2xl font-black font-mono text-blue-700 mt-1 block">
                {step5Calculation.fitasPossiveis} fitas ({selectedProduct.larguraFita} mm cada)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Total: {step5Calculation.larguraOcupada} mm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold uppercase text-[10px]">Sobra Resultante</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${
                step5Calculation.isSobraPermitida ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {step5Calculation.sobraMm} mm
              </span>
              <span className="text-xs text-slate-600 font-bold">
                {step5Calculation.isSobraPermitida 
                  ? '✓ Dentro da faixa ideal (10 a 18 mm ~1,5%)' 
                  : step5Calculation.sobraMm < 10 
                  ? '⚠ Refilo baixo (< 10 mm)' 
                  : '⚠ Superior a 18 mm'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-bold uppercase text-[10px]">Aproveitamento</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${
                step5Calculation.aproveitamento >= 98.5 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {step5Calculation.aproveitamento}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
            >
              ← Voltar à Seleção de Lote
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20 hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ver Sugestões de Otimização (Passo 6)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Combinations */}
      {currentStep === 6 && selectedProduct && selectedCoil && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  <Sparkles className="w-4 h-4" />
                </span>
                Passo 6: Sugestões de Combinação & Otimização do Slitter
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Motor de otimização combinatória buscando soluções com <strong>refilo ideal entre 10 e 18 mm (~1,5%)</strong> para {selectedCoils.length > 1 ? `${selectedCoils.length} bobinas (${totalSelectedCoilsWeightTon} t)` : `a bobina de ${selectedCoil.largura} mm`}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFinishPlanning('simulation')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl border border-slate-200"
              >
                <Scissors className="w-4 h-4 text-blue-600" />
                <span>Simular no Visualizador</span>
              </button>

              <button
                onClick={() => handleFinishPlanning('order')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gerar Ordem de Produção (OP)</span>
              </button>
            </div>
          </div>

          {selectedCombination && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-blue-50/90 p-4 rounded-3xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl text-xs font-black">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 tracking-tight">
                      Simulação Gráfica do Corte Slitter ({selectedCoils.length} {selectedCoils.length > 1 ? 'Simulações Individuais' : 'Simulação'})
                    </h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Visualização gráfica por bobina individual com seu lote e peso real.
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Massa Total Selecionada</span>
                  <strong className="text-emerald-700 text-sm font-black">{totalSelectedCoilsWeightTon} t</strong>
                </div>
              </div>

              {selectedCoils.map((coilItem, cIdx) => {
                const coilStrips = SlitterOptimizer.generateStripsFromCombination(selectedCombination, coilItem);

                return (
                  <div key={coilItem.id || cIdx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black font-mono shadow-xs">
                          #{cIdx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-mono font-black text-slate-900">
                            Bobina Lote <strong className="text-blue-700">{coilItem.lote}</strong> ({coilItem.codigo})
                          </span>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Largura: {coilItem.largura} mm | Espessura: {coilItem.espessura} mm | Peso Matéria-Prima: <strong className="text-slate-800">{coilItem.peso} t</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-xl">
                          Rendimento: {coilItem.peso} t cortadas
                        </span>
                      </div>
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

          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Opções de Combinações Ranqueadas</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {combinations.length} combinações
              </span>
            </h4>

            <div className="space-y-3">
              {combinations.map((comb, idx) => {
                const isSelected = selectedCombination?.id === comb.id;

                return (
                  <div
                    key={comb.id || idx}
                    onClick={() => setSelectedCombination(comb)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white shadow-sm ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 shadow-md'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs font-mono ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{comb.descricao}</span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                              comb.classificacao === 'PERFEITO'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {comb.badgeTexto}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {comb.fitas.map((f, fIdx) => {
                              const slt = SlitterCatalogService.getSlitterInfo(f.product.larguraFita, f.product.espessura, f.product);

                              return (
                                <span
                                  key={fIdx}
                                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono font-medium flex items-center gap-1.5"
                                >
                                  <strong className="text-blue-700 font-black">{f.quantidade}x {slt.code} ({f.product.larguraFita}mm)</strong>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-slate-900 font-bold">p/ {f.product.codigo}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Largura Útil</div>
                          <div className="font-black text-slate-900 text-sm">{comb.totalLarguraUsada} mm</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Refilo</div>
                          <div className={`font-black text-sm ${comb.sobraMm >= 10 && comb.sobraMm <= 18 ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {comb.sobraMm} mm
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Aproveitamento</div>
                          <div className="font-black text-emerald-700 text-base">
                            {comb.aproveitamentoPercent}%
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
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
