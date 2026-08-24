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

  // Step 4: Selected Coil Lot
  const [selectedCoil, setSelectedCoil] = useState<Coil | null>(null);

  // Step 6: Selected Slitter Combination
  const [selectedCombination, setSelectedCombination] = useState<SlitterCombination | null>(null);

  // Analyze readiness
  const readinessList = useMemo(() => {
    return ReadinessService.analyze(products, coils);
  }, [products, coils]);

  const prontoCount = readinessList.filter(r => r.status === 'PRONTO').length;
  const parcialCount = readinessList.filter(r => r.status === 'PARCIAL').length;
  const bloqueadoCount = readinessList.filter(r => r.status === 'BLOQUEADO').length;

  useEffect(() => {
    if (preSelectedProductId) {
      const p = products.find(prod => prod.id === preSelectedProductId || prod.codigo === preSelectedProductId);
      if (p) {
        setSelectedProduct(p);
        setDesiredQtyTon(p.demandaT || 10);
        setCurrentStep(3);
      }
    }
  }, [preSelectedProductId, products]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    products.forEach(p => set.add(p.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const filteredProductReadiness = useMemo(() => {
    let list = readinessList;

    if (readinessFilter !== 'TODOS') {
      list = list.filter(r => r.status === readinessFilter);
    }
    if (familyFilter !== 'TODOS') {
      list = list.filter(r => r.product.familia === familyFilter);
    }
    if (thicknessFilter !== 'TODOS') {
      list = list.filter(r => r.product.espessura === Number(thicknessFilter));
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(r => 
        r.product.codigo.toLowerCase().includes(q) ||
        r.product.descricao.toLowerCase().includes(q)
      );
    }

    return ReadinessService.sortByReadiness(list);
  }, [readinessList, readinessFilter, familyFilter, thicknessFilter, productSearch]);

  const compatibleCoils = useMemo(() => {
    if (!selectedProduct) return [];
    return coils.filter(c => 
      c.status === 'Disponível' && 
      Math.abs(c.espessura - selectedProduct.espessura) < 0.001
    ).sort((a, b) => b.largura - a.largura);
  }, [coils, selectedProduct]);

  useEffect(() => {
    if (compatibleCoils.length > 0 && (!selectedCoil || selectedCoil.espessura !== selectedProduct?.espessura)) {
      setSelectedCoil(compatibleCoils[0]);
    }
  }, [compatibleCoils, selectedProduct]);

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
    if (selectedCombination) {
      return SlitterOptimizer.generateStripsFromCombination(selectedCombination, selectedCoil);
    }
    return [];
  }, [selectedCombination, selectedCoil]);

  const handleFinishPlanning = (action: 'simulation' | 'order') => {
    if (!selectedCoil || currentStrips.length === 0) return;

    if (action === 'simulation') {
      onProceedToSimulation(selectedCoil, currentStrips, selectedCombination || undefined);
    } else {
      onProceedToOrder(selectedCoil, currentStrips, selectedCombination || undefined);
    }
  };

  const stepsList = [
    { num: 1, title: 'Produto Final' },
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

      {/* STEP 1: Select Product */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  1
                </span>
                Passo 1: Selecionar o Produto Final a Produzir
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Listando primeiro os materiais que possuem matéria-prima em estoque para corte imediato.
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
              { id: 'TODOS', label: 'Todos os Produtos', count: products.length },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase text-[10px]">Família:</span>
              <div className="flex rounded-2xl bg-white border border-slate-200 p-1 flex-1 shadow-sm">
                {(['TODOS', 'TUBO', 'PERFIL'] as const).map(fam => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(fam)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      familyFilter === fam ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
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

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredProductReadiness.map((r) => {
              const p = r.product;
              const isSelected = selectedProduct?.id === p.id;
              const isReady = r.status === 'PRONTO';
              const isPartial = r.status === 'PARCIAL';

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setDesiredQtyTon(p.demandaT || 10);
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer group bg-white shadow-sm ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 -translate-y-1'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-slate-900">{p.codigo}</span>
                      <MetricsBadge type="familia" value={p.familia} size="sm" />
                    </div>

                    {isReady ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold font-mono">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                        Pronto ({r.compatibleLotCount} lotes)
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        Parcial ({r.coveragePercent}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300 text-[10px] font-bold font-mono">
                        <XCircle className="w-2.5 h-2.5 text-red-600" />
                        Sem Bobina
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs text-slate-700 line-clamp-2 font-semibold mt-2">
                    {p.descricao}
                  </h4>

                  {r.bestCoil && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                      <span>Melhor Bobina: <strong className="text-blue-700">{r.bestCoil.lote}</strong> ({r.bestCoil.largura}mm)</span>
                      <span className="text-emerald-700 font-bold">Aprov: {r.estimatedYieldPercent}%</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Fita Requerida</span>
                      <strong className="text-blue-700 font-black text-xs">{p.larguraFita} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Espessura</span>
                      <strong className="text-purple-800 font-black text-xs">{p.espessura} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Estoque Disp.</span>
                      <strong className={`font-black text-xs ${r.totalCompatibleWeightTon > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {r.totalCompatibleWeightTon} t
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
              Passo 2: Informar a Quantidade Desejada
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Informe a quantidade de <strong>{selectedProduct.codigo}</strong> que você deseja produzir no Slitter.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 font-mono">{selectedProduct.codigo}</span>
                <MetricsBadge type="familia" value={selectedProduct.familia} size="sm" />
              </div>
              <p className="text-xs text-slate-700 mt-1 font-semibold">{selectedProduct.descricao}</p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 mt-2 font-medium">
                <span>Largura Fita: <strong className="text-blue-700">{selectedProduct.larguraFita} mm</strong></span>
                <span>•</span>
                <span>Espessura: <strong className="text-purple-700">{selectedProduct.espessura} mm</strong></span>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-700 hover:text-blue-800 font-black underline"
            >
              Trocar Produto
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

      {/* STEP 3 & 4: Compatible Coils */}
      {(currentStep === 3 || currentStep === 4) && selectedProduct && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">
                  {currentStep}
                </span>
                Passo {currentStep === 3 ? '3: Bobinas Compatíveis Localizadas' : '4: Selecionar o Lote da Bobina'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Localizamos <strong>{compatibleCoils.length} lotes disponíveis</strong> no estoque com espessura compatível de <strong className="text-purple-700 font-mono">{selectedProduct.espessura} mm</strong>.
              </p>
            </div>

            {selectedCoil && (
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <span>Avançar para Passo 5 (Calcular Fitas)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {compatibleCoils.length === 0 ? (
            <div className="bg-red-50 p-10 rounded-3xl border border-red-200 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <h4 className="text-base font-bold text-red-900">
                Nenhuma bobina disponível no estoque para espessura de {selectedProduct.espessura} mm!
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compatibleCoils.map((c) => (
                <CoilCard
                  key={c.id}
                  coil={c}
                  isSelected={selectedCoil?.id === c.id}
                  onSelect={() => {
                    setSelectedCoil(c);
                    setCurrentStep(4);
                  }}
                />
              ))}
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
                Lote: <strong className="text-blue-700 font-mono">{selectedCoil.lote}</strong> | Largura: <strong className="text-slate-900 font-mono">{selectedCoil.largura} mm</strong>
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Trocar Lote
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
                Motor de otimização combinatória buscando soluções com <strong>refilo ideal entre 10 e 18 mm (~1,5%)</strong> para a bobina de <strong className="text-slate-900 font-mono">{selectedCoil.largura} mm</strong>.
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
            <div className="space-y-3">
              <SlitterVisualizer
                coil={selectedCoil}
                strips={currentStrips}
                interactive={false}
              />
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
                            {comb.fitas.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono font-medium"
                              >
                                <strong className="text-slate-900">{f.quantidade}x</strong> {f.product.codigo} ({f.product.larguraFita}mm)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Largura Útil</div>
                          <div className="font-black text-slate-900 text-sm">{comb.totalLarguraUsada} mm</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Sobra</div>
                          <div className={`font-black text-sm ${comb.sobraMm <= 10 ? 'text-emerald-700' : 'text-amber-700'}`}>
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
