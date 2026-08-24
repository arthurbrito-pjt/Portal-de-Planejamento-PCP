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
import { CoilCard } from '../components/CoilCard';
import { MetricsBadge } from '../components/MetricsBadge';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  Layers, 
  Disc, 
  Weight, 
  Scissors, 
  Check,
  ChevronRight,
  Filter,
  Info,
  Maximize2,
  Gauge,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected Product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [familyFilter, setFamilyFilter] = useState<'TODOS' | 'TUBO' | 'PERFIL'>('TODOS');
  const [thicknessFilter, setThicknessFilter] = useState<string>('TODOS');

  // Step 2: Desired Quantity
  const [desiredQtyTon, setDesiredQtyTon] = useState<number>(10);

  // Step 4: Selected Coil Lot
  const [selectedCoil, setSelectedCoil] = useState<Coil | null>(null);

  // Step 6: Selected Slitter Combination
  const [selectedCombination, setSelectedCombination] = useState<SlitterCombination | null>(null);

  // Auto-select product if preSelectedProductId is given
  useEffect(() => {
    if (preSelectedProductId) {
      const p = products.find(prod => prod.id === preSelectedProductId || prod.codigo === preSelectedProductId);
      if (p) {
        setSelectedProduct(p);
        setDesiredQtyTon(p.demandaT || 10);
        setCurrentStep(3); // Jump to coil selection
      }
    }
  }, [preSelectedProductId, products]);

  // Unique thicknesses for filter
  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    products.forEach(p => set.add(p.espessura));
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.codigo.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.descricao.toLowerCase().includes(productSearch.toLowerCase());
      
      const matchesFamily = familyFilter === 'TODOS' || p.familia === familyFilter;
      const matchesThickness = thicknessFilter === 'TODOS' || p.espessura === Number(thicknessFilter);

      return matchesSearch && matchesFamily && matchesThickness;
    });
  }, [products, productSearch, familyFilter, thicknessFilter]);

  // Step 3: Compatible Coils in Stock (matching thickness)
  const compatibleCoils = useMemo(() => {
    if (!selectedProduct) return [];
    return coils.filter(c => 
      c.status === 'Disponível' && 
      Math.abs(c.espessura - selectedProduct.espessura) < 0.001
    ).sort((a, b) => b.largura - a.largura);
  }, [coils, selectedProduct]);

  // Step 5 & 6: Compute optimal combinations when coil is selected
  const combinations = useMemo(() => {
    if (!selectedProduct || !selectedCoil) return [];
    return SlitterOptimizer.optimize({
      mainProduct: selectedProduct,
      desiredQuantityTon: desiredQtyTon,
      selectedCoil: selectedCoil,
      compatibleProducts: products,
      maxScrapAllowedMm: 10
    });
  }, [selectedProduct, selectedCoil, desiredQtyTon, products]);

  // Auto-select best combination on calculation
  useEffect(() => {
    if (combinations.length > 0) {
      setSelectedCombination(combinations[0]);
    }
  }, [combinations]);

  // Single-cut primary calculation for step 5
  const step5Calculation = useMemo(() => {
    if (!selectedProduct || !selectedCoil) return null;
    const fitasPossiveis = Math.floor(selectedCoil.largura / selectedProduct.larguraFita);
    const larguraOcupada = fitasPossiveis * selectedProduct.larguraFita;
    const sobraMm = selectedCoil.largura - larguraOcupada;
    const aproveitamento = Number(((larguraOcupada / selectedCoil.largura) * 100).toFixed(2));
    const isSobraPermitida = sobraMm <= 10;

    return {
      fitasPossiveis,
      larguraOcupada,
      sobraMm,
      aproveitamento,
      isSobraPermitida
    };
  }, [selectedProduct, selectedCoil]);

  // Strips generated from current selection for live preview
  const currentStrips = useMemo(() => {
    if (!selectedCoil) return [];
    if (selectedCombination) {
      return SlitterOptimizer.generateStripsFromCombination(selectedCombination, selectedCoil);
    }
    return [];
  }, [selectedCombination, selectedCoil]);

  const handleFinishPlanning = (action: 'simulation' | 'order') => {
    if (!selectedCoil || currentStrips.length === 0) return;

    if (selectedCombination?.sobraMm === 0) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    if (action === 'simulation') {
      onProceedToSimulation(selectedCoil, currentStrips, selectedCombination || undefined);
    } else {
      onProceedToOrder(selectedCoil, currentStrips, selectedCombination || undefined);
    }
  };

  const stepsList = [
    { num: 1, title: 'Produto Final' },
    { num: 2, title: 'Quantidade' },
    { num: 3, title: 'Localizar Bobinas' },
    { num: 4, title: 'Selecionar Lote' },
    { num: 5, title: 'Cálculo de Fitas' },
    { num: 6, title: 'Otimização Slitter' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Wizard Progress Header Bar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
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
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/50 scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-slate-950/60 text-slate-500 border border-slate-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCompleted ? 'bg-emerald-500 text-slate-950 font-black' : isCurrent ? 'bg-white text-blue-700' : 'bg-slate-800 text-slate-400'
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
              <h3 className="text-lg font-black text-white flex items-center gap-2.5 tracking-tight">
                <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                  1
                </span>
                Passo 1: Selecionar o Produto Final a Produzir
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Escolha o tubo ou perfil desejado. O sistema buscará as larguras de fita (blanks) e espessuras correspondentes.
              </p>
            </div>

            {selectedProduct && (
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                <span>Avançar para Passo 2 (Quantidade)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase text-[10px]">Família:</span>
              <div className="flex rounded-2xl bg-slate-900/90 border border-slate-700/80 p-1 flex-1 shadow-inner">
                {(['TODOS', 'TUBO', 'PERFIL'] as const).map(fam => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(fam)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      familyFilter === fam ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase text-[10px]">Espessura:</span>
              <select
                value={thicknessFilter}
                onChange={(e) => setThicknessFilter(e.target.value)}
                className="flex-1 py-2.5 px-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
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
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setDesiredQtyTon(p.demandaT || 10);
                  }}
                  className={`glass-card p-4 rounded-3xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/50 shadow-2xl -translate-y-1'
                      : 'border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/90 hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white">{p.codigo}</span>
                        <MetricsBadge type="familia" value={p.familia} size="sm" />
                      </div>
                      <h4 className="text-xs text-slate-300 line-clamp-2 font-medium">
                        {p.descricao}
                      </h4>
                    </div>
                    {isSelected && (
                      <div className="p-1.5 bg-blue-600 text-white rounded-full shadow-lg">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Fita Requerida</span>
                      <strong className="text-blue-400 font-extrabold text-xs">{p.larguraFita} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Espessura</span>
                      <strong className="text-purple-400 font-extrabold text-xs">{p.espessura} mm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Demanda</span>
                      <strong className="text-amber-400 font-extrabold text-xs">{p.demandaT || 0} t</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Enter Desired Quantity */}
      {currentStep === 2 && selectedProduct && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2.5 tracking-tight">
              <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                2
              </span>
              Passo 2: Informar a Quantidade Desejada
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Informe a quantidade de <strong>{selectedProduct.codigo}</strong> que você deseja programar no Slitter.
            </p>
          </div>

          {/* Selected Product Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white font-mono">{selectedProduct.codigo}</span>
                <MetricsBadge type="familia" value={selectedProduct.familia} size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-1">{selectedProduct.descricao}</p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                <span>Largura Fita: <strong className="text-blue-400">{selectedProduct.larguraFita} mm</strong></span>
                <span>•</span>
                <span>Espessura: <strong className="text-purple-400">{selectedProduct.espessura} mm</strong></span>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
            >
              Trocar Produto
            </button>
          </div>

          {/* Quick Presets for Quantity */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Quantidade Planejada (Toneladas):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={desiredQtyTon}
                onChange={(e) => setDesiredQtyTon(parseFloat(e.target.value) || 0)}
                className="flex-1 px-5 py-3.5 bg-slate-950 border-2 border-slate-700/80 rounded-2xl text-2xl font-mono font-black text-emerald-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
              />
              <span className="text-base font-black text-slate-400 font-mono">TONELADAS</span>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 pt-1">
              {[5, 10, 15, 25, 50].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDesiredQtyTon(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    desiredQtyTon === t
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t} t
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl"
            >
              ← Voltar ao Passo 1
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-blue-500/25"
            >
              <span>Localizar Bobinas Compatíveis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Compatible Coils & Lot Selection */}
      {(currentStep === 3 || currentStep === 4) && selectedProduct && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2.5 tracking-tight">
                <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                  {currentStep}
                </span>
                Passo {currentStep === 3 ? '3: Bobinas Compatíveis Localizadas' : '4: Selecionar o Lote da Bobina'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Localizamos <strong>{compatibleCoils.length} lotes disponíveis</strong> no estoque com espessura compatível de <strong className="text-purple-400 font-mono">{selectedProduct.espessura} mm</strong>.
              </p>
            </div>

            {selectedCoil && (
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                <span>Avançar para Passo 5 (Calcular Fitas)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {compatibleCoils.length === 0 ? (
            <div className="glass-card p-10 rounded-3xl border border-red-500/30 bg-red-950/20 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h4 className="text-base font-bold text-red-300">
                Nenhuma bobina disponível no estoque para espessura de {selectedProduct.espessura} mm!
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não há lotes com status &quot;Disponível&quot; com esta espessura no momento. Cadastre novas bobinas ou importe uma planilha atualizada.
              </p>
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

      {/* STEP 5: Initial Strip Calculation & Scrap Check */}
      {currentStep === 5 && selectedProduct && selectedCoil && step5Calculation && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2.5 tracking-tight">
                <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                  5
                </span>
                Passo 5: Resultado do Corte Exclusivo na Bobina
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lote selecionado: <strong className="text-blue-400 font-mono">{selectedCoil.lote}</strong> ({selectedCoil.codigo}) | Largura: <strong className="text-white font-mono">{selectedCoil.largura} mm</strong>
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Trocar Lote
            </button>
          </div>

          {/* Primary Calculation Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold uppercase text-[10px]">Largura da Bobina</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {selectedCoil.largura} mm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold uppercase text-[10px]">Fitas do Produto Principal</span>
              <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">
                {step5Calculation.fitasPossiveis} fitas ({selectedProduct.larguraFita} mm cada)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Total: {step5Calculation.larguraOcupada} mm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold uppercase text-[10px]">Sobra Resultante</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${
                step5Calculation.isSobraPermitida ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {step5Calculation.sobraMm} mm
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {step5Calculation.isSobraPermitida ? '✓ Dentro do limite (≤ 10mm)' : '⚠ Superior a 10 mm'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold uppercase text-[10px]">Aproveitamento</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${
                step5Calculation.aproveitamento >= 99 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {step5Calculation.aproveitamento}%
              </span>
            </div>
          </div>

          {/* Decision Box based on scrap */}
          {step5Calculation.isSobraPermitida ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-start gap-3.5 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-200">
                  Excelente Aproveitamento Inicial!
                </h4>
                <p className="text-xs text-emerald-300/90 mt-0.5 leading-relaxed">
                  A sobra de <strong>{step5Calculation.sobraMm} mm</strong> já respeita a regra de ouro do PCP de corte com sobra máxima de 10 mm. Você pode avançar para o Passo 6 para conferir combinações com sobra zero ou prosseguir para a simulação.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-start gap-3.5 shadow-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-amber-200">
                  Sobra de {step5Calculation.sobraMm} mm é superior ao limite máximo de 10 mm!
                </h4>
                <p className="text-xs text-amber-300/90 mt-0.5 leading-relaxed">
                  Conforme a regra de negócio do PCP, o motor de otimização combinatória irá sugerir no <strong>Passo 6</strong> produtos complementares compatíveis de mesma espessura para preencher essa sobra e garantir até 100% de aproveitamento.
                </p>
              </div>
            </div>
          )}

          {/* Action to proceed to Step 6 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl"
            >
              ← Voltar à Seleção de Lote
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ver Sugestões de Otimização (Passo 6)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Automatic Optimization & Complementary Combinations */}
      {currentStep === 6 && selectedProduct && selectedCoil && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2.5 tracking-tight">
                <span className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                  <Sparkles className="w-4 h-4" />
                </span>
                Passo 6: Sugestões de Combinação & Otimização do Slitter
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Motor de otimização combinatória buscando soluções com <strong>sobra entre 0 e 10 mm</strong> para a bobina de <strong className="text-white font-mono">{selectedCoil.largura} mm</strong>.
              </p>
            </div>

            {/* Finish Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFinishPlanning('simulation')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700"
              >
                <Scissors className="w-4 h-4 text-blue-400" />
                <span>Simular no Visualizador</span>
              </button>

              <button
                onClick={() => handleFinishPlanning('order')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 glow-emerald"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gerar Ordem de Slitter (OS)</span>
              </button>
            </div>
          </div>

          {/* Live Preview of Selected Combination */}
          {selectedCombination && (
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-blue-400" />
                Visualização Gráfica do Corte Selecionado:
              </div>
              <SlitterVisualizer
                coil={selectedCoil}
                strips={currentStrips}
                interactive={false}
              />
            </div>
          )}

          {/* Combinations List */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Opções de Combinações Ranqueadas</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {combinations.length} combinações encontradas
              </span>
            </h4>

            <div className="space-y-3">
              {combinations.map((comb, idx) => {
                const isSelected = selectedCombination?.id === comb.id;

                return (
                  <div
                    key={comb.id || idx}
                    onClick={() => setSelectedCombination(comb)}
                    className={`glass-card p-5 rounded-3xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/50 shadow-2xl -translate-y-1'
                        : 'border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/90 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs font-mono shadow-md ${
                          isSelected ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white">{comb.descricao}</span>
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              comb.classificacao === 'PERFEITO'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : comb.classificacao === 'EXCELENTE'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                              {comb.badgeTexto}
                            </span>
                            {comb.prioridadeDemanda && (
                              <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                                ★ Atende Demanda
                              </span>
                            )}
                          </div>

                          {/* Strips summary pills */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {comb.fitas.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono font-medium"
                              >
                                <strong className="text-white">{f.quantidade}x</strong> {f.product.codigo} ({f.product.larguraFita}mm)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Metrics */}
                      <div className="flex items-center gap-5 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Largura Útil</div>
                          <div className="font-black text-white text-sm">{comb.totalLarguraUsada} mm</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Sobra</div>
                          <div className={`font-black text-sm ${comb.sobraMm <= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {comb.sobraMm} mm
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Aproveitamento</div>
                          <div className="font-black text-emerald-400 text-base">
                            {comb.aproveitamentoPercent}%
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white'
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
