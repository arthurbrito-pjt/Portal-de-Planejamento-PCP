import React, { useState, useMemo, useEffect } from 'react';
import { Coil, SlitterStrip, Product } from '../types/pcp';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { OrderCoilInput } from '../services/orderBuilderService';
import { SlitterTagModal } from '../components/SlitterTagModal';
import { EmptyState } from '../components/EmptyState';
import {
  Scissors,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Sliders,
  ArrowLeft,
  Tag,
  Eye,
  LayoutGrid,
  ChevronRight,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export interface SimulationViewProps {
  coil: Coil | null;
  strips: SlitterStrip[];
  coilInputs?: OrderCoilInput[];
  products: Product[];
  onUpdateStrips?: (newStrips: SlitterStrip[]) => void;
  onUpdateCoilInputs?: (newInputs: OrderCoilInput[]) => void;
  onProceedToOrder: (coil: Coil, strips: SlitterStrip[], allInputs?: OrderCoilInput[]) => void;
  onNavigateToPlanning: (productId?: string) => void;
  onNavigateToDashboard?: () => void;
  onCancelSimulation: () => void;
}

/**
 * Normaliza os dados de entrada para garantir que NUNCA haja fusão de bobinas.
 * Se múltiplos lotes existirem em coilInputs ou nas fitas, cada bobina matriz
 * recebe seu próprio registro isolado com suas próprias fitas.
 */
function normalizeCoilInputs(
  coil: Coil | null,
  strips: SlitterStrip[],
  coilInputs?: OrderCoilInput[]
): OrderCoilInput[] {
  if (coilInputs && coilInputs.length > 0) {
    return coilInputs.map(item => ({
      coil: item.coil,
      strips: item.strips.map(s => ({
        ...s,
        bobinaLote: s.bobinaLote || item.coil.lote,
        bobinaCodigo: s.bobinaCodigo || item.coil.codigo
      }))
    }));
  }

  if (!coil || strips.length === 0) return [];

  // Se as fitas possuem bobinaLote diferente entre si, separamos por lote
  const lotesUnicos = Array.from(new Set(strips.map(s => s.bobinaLote).filter(Boolean))) as string[];
  if (lotesUnicos.length > 1) {
    return lotesUnicos.map((lote, idx) => {
      const fitasDoLote = strips.filter(s => s.bobinaLote === lote);
      const bobinaItem: Coil = {
        id: `coil_${lote}_${idx}`,
        codigo: fitasDoLote[0]?.bobinaCodigo || coil.codigo,
        lote: lote,
        largura: coil.largura,
        espessura: coil.espessura,
        peso: Number((coil.peso / lotesUnicos.length).toFixed(3)),
        quantidade: 1,
        status: 'Consumida'
      };
      return {
        coil: bobinaItem,
        strips: fitasDoLote
      };
    });
  }

  // Se o lote da bobina é composto ("OB01934 + P507885")
  if (coil.lote.includes(' + ')) {
    const lotes = coil.lote.split(' + ').map(l => l.trim()).filter(Boolean);
    if (lotes.length > 1) {
      const grupos = lotes.map((lote, idx) => {
        let fitas = strips.filter(s => s.bobinaLote === lote);
        if (fitas.length === 0) {
          const fatia = Math.ceil(strips.length / lotes.length);
          fitas = strips.slice(idx * fatia, (idx + 1) * fatia).map(s => ({
            ...s,
            bobinaLote: lote,
            bobinaCodigo: coil.codigo
          }));
        }
        const bobinaItem: Coil = {
          id: `coil_${lote}_${idx}`,
          codigo: coil.codigo,
          lote: lote,
          largura: coil.largura,
          espessura: coil.espessura,
          peso: Number((coil.peso / lotes.length).toFixed(3)),
          quantidade: 1,
          status: 'Consumida'
        };
        return {
          coil: bobinaItem,
          strips: fitas
        };
      });
      return grupos;
    }
  }

  // Caso padrão: 1 única bobina
  return [{
    coil,
    strips: strips.map(s => ({
      ...s,
      bobinaLote: s.bobinaLote || coil.lote,
      bobinaCodigo: s.bobinaCodigo || coil.codigo
    }))
  }];
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  coil,
  strips,
  coilInputs,
  products,
  onUpdateStrips,
  onUpdateCoilInputs,
  onProceedToOrder,
  onNavigateToPlanning,
  onNavigateToDashboard,
  onCancelSimulation
}) => {
  const initialInputs = useMemo(
    () => normalizeCoilInputs(coil, strips, coilInputs),
    [coil, strips, coilInputs]
  );

  const [activeInputs, setActiveInputs] = useState<OrderCoilInput[]>(initialInputs);
  const [activeCoilIndex, setActiveCoilIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'individual' | 'todas'>('individual');
  const [selectedCompanionProduct, setSelectedCompanionProduct] = useState<string>('');
  const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);

  // Sincroniza sempre que as props externas mudam
  useEffect(() => {
    const updated = normalizeCoilInputs(coil, strips, coilInputs);
    setActiveInputs(updated);
    if (activeCoilIndex >= updated.length) {
      setActiveCoilIndex(0);
    }
  }, [coil, strips, coilInputs]);

  if (activeInputs.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="Nenhum Corte em Simulação"
        description="Para realizar a simulação gráfica milimétrica e ajuste fino das facas do Slitter, selecione o produto base e as bobinas no Planejamento."
        actionLabel="Ir para o Planejamento (3 Etapas)"
        actionIcon={Sliders}
        onAction={onNavigateToPlanning}
      />
    );
  }

  const safeIndex = Math.min(activeCoilIndex, activeInputs.length - 1);
  const currentItem = activeInputs[safeIndex] || activeInputs[0];
  const currentCoil = currentItem.coil;
  const currentStrips = currentItem.strips;
  const totalBobinas = activeInputs.length;
  const isMultiCoil = totalBobinas > 1;

  // Produtos compatíveis para a bobina atualmente selecionada
  const compatibleProducts = products.filter(
    p => Math.abs(p.espessura - currentCoil.espessura) < 0.001
  );

  // Métricas agregadas do plano (quando há mais de uma bobina)
  const totalWeightTon = Number(activeInputs.reduce((acc, item) => acc + item.coil.peso, 0).toFixed(3));
  const totalStripsCount = activeInputs.reduce((acc, item) => acc + item.strips.length, 0);
  const totalWidthUsed = activeInputs.reduce(
    (acc, item) => acc + item.strips.reduce((sAcc, s) => sAcc + s.largura, 0),
    0
  );
  const totalNominalWidth = activeInputs.reduce((acc, item) => acc + item.coil.largura, 0);
  const overallYieldPercent = totalNominalWidth > 0 
    ? Number(((totalWidthUsed / totalNominalWidth) * 100).toFixed(2)) 
    : 0;

  // Todas as fitas consolidadas com numeração sequencial contínua
  const allStripsConsolidated = useMemo(() => {
    let seq = 1;
    return activeInputs.flatMap(item =>
      item.strips.map(s => ({
        ...s,
        stripNumber: seq++
      }))
    );
  }, [activeInputs]);

  // Atualiza estado local e propaga para os pais
  const syncUpdates = (newInputs: OrderCoilInput[]) => {
    setActiveInputs(newInputs);
    if (onUpdateCoilInputs) {
      onUpdateCoilInputs(newInputs);
    }
    if (onUpdateStrips) {
      let seq = 1;
      const allFlat = newInputs.flatMap(item =>
        item.strips.map(s => ({ ...s, stripNumber: seq++ }))
      );
      onUpdateStrips(allFlat);
    }
  };

  const handleRemoveStrip = (stripId: string, coilIndexTarget: number) => {
    const updatedInputs = activeInputs.map((item, idx) => {
      if (idx !== coilIndexTarget) return item;
      const remaining = item.strips.filter(s => s.id !== stripId);
      const renumbered = remaining.map((s, sIdx) => ({ ...s, stripNumber: sIdx + 1 }));
      return {
        ...item,
        strips: renumbered
      };
    });
    syncUpdates(updatedInputs);
  };

  const handleAddCompanionStrip = (coilIndexTarget: number) => {
    if (!selectedCompanionProduct) return;
    const prod = products.find(p => p.id === selectedCompanionProduct || p.codigo === selectedCompanionProduct);
    if (!prod) return;

    const targetItem = activeInputs[coilIndexTarget];
    if (!targetItem) return;
    const targetCoil = targetItem.coil;

    const stripWeightTon = Number((targetCoil.peso * (prod.larguraFita / targetCoil.largura)).toFixed(3));
    const stripWeightKg = Math.round(stripWeightTon * 1000);
    const kgPerMeter = prod.pesoPorMetro || (prod.larguraFita * prod.espessura * 7.85 / 1000);
    const linearMeters = kgPerMeter > 0 ? Math.round(stripWeightKg / kgPerMeter) : 0;

    const newStrip: SlitterStrip = {
      id: `STRIP_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stripNumber: targetItem.strips.length + 1,
      productId: prod.id,
      productCode: prod.codigo,
      productDescription: prod.descricao,
      productFamily: prod.familia,
      largura: prod.larguraFita,
      espessura: targetCoil.espessura,
      pesoTon: stripWeightTon,
      pesoKg: stripWeightKg,
      metrosLineares: linearMeters,
      cor: '#EA580C', // Cedisa Orange vibrante
      bobinaLote: targetCoil.lote,
      bobinaCodigo: targetCoil.codigo
    };

    const updatedInputs = activeInputs.map((item, idx) => {
      if (idx !== coilIndexTarget) return item;
      return {
        ...item,
        strips: [...item.strips, newStrip]
      };
    });

    syncUpdates(updatedInputs);
    setSelectedCompanionProduct('');
  };

  const mainProductId = currentStrips[0]?.productId || activeInputs[0]?.strips[0]?.productId;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner de Ações */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToPlanning(mainProductId)}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-black"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B1F3A]" />
            <span>Voltar ao Planejamento</span>
          </button>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-xs text-xs font-bold"
            >
              Voltar ao Painel
            </button>
          )}

          <button
            onClick={onCancelSimulation}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-colors shadow-xs flex items-center gap-1.5 text-xs font-black"
            title="Cancelar e descartar esta simulação"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Cancelar Simulação</span>
          </button>

          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Scissors className="w-5 h-5 text-orange-500" />
              Estúdio de Simulação de Corte Slitter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMultiCoil
                ? `Plano com ${totalBobinas} bobinas matriz — cada bobina possui seu próprio corte, refilo técnico e ajuste de facas individual.`
                : 'Visualização milimétrica do corte transversal da bobina com ajuste fino interativo das facas e destinação dos rolos.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0B1F3A] border border-slate-200 text-xs font-black rounded-2xl transition-all shadow-xs"
          >
            <Tag className="w-4 h-4 text-orange-500" />
            <span>Imprimir Etiquetas ({isMultiCoil ? `${totalStripsCount} totais` : `${currentStrips.length}`})</span>
          </button>

          <button
            onClick={() => onProceedToOrder(currentCoil, currentStrips, activeInputs)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-black rounded-2xl shadow-md shadow-[#0B1F3A]/20 transition-all border border-[#163866]"
          >
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <span>Gerar Ordem de Produção (OP)</span>
          </button>
        </div>
      </div>

      {/* Alerta quando a bobina atual está sem fitas */}
      {currentStrips.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Esta bobina não possui nenhuma fita programada (100% de sobra / refilo). Adicione fitas na bancada abaixo ou cancele para descartar esta simulação.</span>
          </div>
          <button
            onClick={onCancelSimulation}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Cancelar & Descartar</span>
          </button>
        </div>
      )}

      {/* PAINEL MULTI-BOBINAS: Indicadores Globais & Seletor de Bobinas */}
      {isMultiCoil && (
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#163866] text-white p-5 rounded-3xl shadow-md border border-[#163866] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-xs">
                OP Multi-Bobinas: {totalBobinas} Bobinas Matriz
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                Cortes transversais totalmente isolados no chão de fábrica
              </span>
            </div>

            {/* Alternador de Modos de Visualização */}
            <div className="flex items-center bg-[#05101E] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode('individual')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'individual'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Bobina Selecionada</span>
              </button>

              <button
                onClick={() => setViewMode('todas')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'todas'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Ver Todas as Bobinas</span>
              </button>
            </div>
          </div>

          {/* Cards Seletores de Cada Bobina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeInputs.map((item, idx) => {
              const isSelected = activeCoilIndex === idx;
              const usedWidth = item.strips.reduce((acc, s) => acc + s.largura, 0);
              const scrapMm = Math.max(0, item.coil.largura - usedWidth);
              const yieldPct = Number(((usedWidth / item.coil.largura) * 100).toFixed(1));
              const isScrapIdeal = scrapMm >= 10 && scrapMm <= 18;

              return (
                <div
                  key={item.coil.id || idx}
                  onClick={() => {
                    setActiveCoilIndex(idx);
                    if (viewMode === 'todas') setViewMode('individual');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected && viewMode === 'individual'
                      ? 'bg-white text-slate-900 border-orange-500 ring-2 ring-orange-500/40 shadow-lg'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/15 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isSelected && viewMode === 'individual' ? 'text-orange-600' : 'text-orange-400'
                    }`}>
                      <Scissors className="w-3.5 h-3.5" />
                      Bobina {idx + 1} de {totalBobinas}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isScrapIdeal
                        ? isSelected && viewMode === 'individual'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isSelected && viewMode === 'individual'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      Refilo {scrapMm} mm
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="font-mono text-sm font-black tracking-tight">
                      Lote: {item.coil.lote}
                    </div>
                    <div className={`text-xs font-mono font-bold ${
                      isSelected && viewMode === 'individual' ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>
                      {item.coil.peso} t · {item.coil.largura} mm
                    </div>
                  </div>

                  <div className={`mt-2 pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                    isSelected && viewMode === 'individual'
                      ? 'border-slate-200 text-slate-600'
                      : 'border-white/10 text-slate-300'
                  }`}>
                    <span>{item.strips.length} fitas ({usedWidth} mm)</span>
                    <span className="font-bold">{yieldPct}% aproveitamento</span>
                  </div>

                  {isSelected && viewMode === 'individual' && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                      Ativa no Ajuste Fino
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo do Plano Consolidado */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-300 font-mono">
            <span>Peso Total Acumulado: <strong className="text-white font-bold">{totalWeightTon} t</strong></span>
            <span>Total de Fitas no Plano: <strong className="text-white font-bold">{totalStripsCount} rolos</strong></span>
            <span>Aproveitamento Médio: <strong className="text-emerald-400 font-bold">{overallYieldPercent}%</strong></span>
          </div>
        </div>
      )}

      {/* MODO 1: VISÃO DETALHADA DA BOBINA SELECIONADA */}
      {viewMode === 'individual' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Gráfico do Slitter da Bobina Atual */}
          <div className="space-y-2">
            {isMultiCoil && (
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Inspeção da Bobina {safeIndex + 1} de {totalBobinas} — Lote {currentCoil.lote} ({currentCoil.peso} t)
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Matriz: <strong>{currentCoil.largura} mm</strong> · Espessura: <strong>{currentCoil.espessura} mm</strong>
                </span>
              </div>
            )}

            <SlitterVisualizer
              coil={currentCoil}
              strips={currentStrips}
              onRemoveStrip={(stripId) => handleRemoveStrip(stripId, safeIndex)}
              interactive={true}
            />
          </div>

          {/* Bancada de Facas: Adicionar Fita Complementar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <Plus className="w-4 h-4 text-orange-500" />
                Bancada de Facas: Adicionar Fita Complementar à Bobina {isMultiCoil ? `${safeIndex + 1} (${currentCoil.lote})` : ''}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Espessura da Matriz: <strong className="text-slate-800">{currentCoil.espessura} mm</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCompanionProduct}
                onChange={(e) => setSelectedCompanionProduct(e.target.value)}
                className="flex-1 min-w-[280px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-[#0B1F3A] font-bold"
              >
                <option value="">Selecione um produto de destino compatível (espessura {currentCoil.espessura}mm)...</option>
                {compatibleProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.descricao.slice(0, 45)} (Fita {p.larguraFita}mm | Demanda {p.demandaT || 0}t)
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleAddCompanionStrip(safeIndex)}
                disabled={!selectedCompanionProduct}
                className="flex items-center gap-2 px-6 py-3 bg-[#0B1F3A] hover:bg-[#163866] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-2xl shadow-md shadow-[#0B1F3A]/20 transition-all border border-[#163866]"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Adicionar Fita a Esta Bobina</span>
              </button>
            </div>
          </div>

          {/* Tabela Detalhada de Fitas Desta Bobina */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-purple-600" />
                Fitas Programadas nesta Bobina ({currentStrips.length} fitas · Lote {currentCoil.lote})
              </h3>
              <span className="text-xs text-slate-500 font-mono font-bold">
                Largura Total: {currentStrips.reduce((a, s) => a + s.largura, 0)} mm de {currentCoil.largura} mm
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold font-mono">
                    <th className="py-3 px-3">Fita Slitter</th>
                    <th className="py-3 px-3">Código Slitter</th>
                    <th className="py-3 px-3">Material de Destino (Produto Final)</th>
                    <th className="py-3 px-3">Família</th>
                    <th className="py-3 px-3 text-right">Largura (mm)</th>
                    <th className="py-3 px-3 text-right">Peso do Rolo (t)</th>
                    <th className="py-3 px-3 text-right">Metros Lineares</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {currentStrips.map((strip, idx) => {
                    const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);

                    return (
                      <tr key={strip.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-black text-slate-900 flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shadow-xs shrink-0" style={{ backgroundColor: strip.cor }} />
                          Fita {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-3 font-black text-[#0B1F3A]">
                          <div>{sltInfo.code}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{sltInfo.name}</div>
                        </td>
                        <td className="py-3.5 px-3 font-sans text-slate-800 font-bold max-w-xs">
                          <div className="font-mono text-[#0B1F3A] font-bold">{strip.productCode}</div>
                          <div className="text-slate-600 truncate">{strip.productDescription}</div>
                        </td>
                        <td className="py-3.5 px-3 font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            strip.productFamily === 'TUBO' 
                              ? 'bg-[#0B1F3A]/10 text-[#0B1F3A] border-[#0B1F3A]/20' 
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {strip.productFamily}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-900">{strip.largura} mm</td>
                        <td className="py-3.5 px-3 text-right text-emerald-700 font-bold">{strip.pesoTon} t</td>
                        <td className="py-3.5 px-3 text-right text-[#0B1F3A] font-semibold">{strip.metrosLineares} m</td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveStrip(strip.id, safeIndex)}
                            title="Remover esta fita desta bobina"
                            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: VISÃO DE TODAS AS BOBINAS (LADO A LADO / EMPILHADO) */}
      {viewMode === 'todas' && (
        <div className="space-y-6 animate-fadeIn">
          {activeInputs.map((item, idx) => {
            const usedWidth = item.strips.reduce((acc, s) => acc + s.largura, 0);
            const scrapMm = Math.max(0, item.coil.largura - usedWidth);
            const yieldPct = Number(((usedWidth / item.coil.largura) * 100).toFixed(1));
            const isScrapIdeal = scrapMm >= 10 && scrapMm <= 18;

            return (
              <div key={item.coil.id || idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Bobina {idx + 1} de {totalBobinas} — Lote {item.coil.lote}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                      {item.coil.largura} x {item.coil.espessura} mm · {item.coil.peso} t
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                      isScrapIdeal ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      Refilo: {scrapMm} mm ({yieldPct}% útil)
                    </span>

                    <button
                      onClick={() => {
                        setActiveCoilIndex(idx);
                        setViewMode('individual');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors border border-orange-200"
                    >
                      <span>Ajustar Facas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visualizador Dedicado desta Bobina */}
                <SlitterVisualizer
                  coil={item.coil}
                  strips={item.strips}
                  onRemoveStrip={(stripId) => handleRemoveStrip(stripId, idx)}
                  interactive={true}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Impressão de Etiquetas */}
      <SlitterTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        coil={currentCoil}
        strips={viewMode === 'individual' ? currentStrips : allStripsConsolidated}
      />
    </div>
  );
};
