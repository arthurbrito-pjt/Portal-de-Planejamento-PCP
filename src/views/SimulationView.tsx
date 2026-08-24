import React, { useState } from 'react';
import { Coil, SlitterStrip, Product, SlitterCombination } from '../types/pcp';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { 
  Scissors, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Disc, 
  Layers, 
  Weight, 
  AlertTriangle,
  Sparkles,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationViewProps {
  coil: Coil | null;
  strips: SlitterStrip[];
  products: Product[];
  onUpdateStrips: (newStrips: SlitterStrip[]) => void;
  onProceedToOrder: (coil: Coil, strips: SlitterStrip[]) => void;
  onNavigateToPlanning: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  coil,
  strips,
  products,
  onUpdateStrips,
  onProceedToOrder,
  onNavigateToPlanning
}) => {
  const [selectedCompanionProduct, setSelectedCompanionProduct] = useState<string>('');

  if (!coil || strips.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 bg-slate-900/80 text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
          <Scissors className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Nenhum Corte em Simulação</h3>
        <p className="text-sm text-slate-400">
          Para realizar a simulação gráfica e ajuste fino das fitas no Slitter, inicie selecionando um produto e bobina no Planejamento.
        </p>
        <button
          onClick={onNavigateToPlanning}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Sliders className="w-4 h-4" />
          <span>Ir para o Planejamento (6 Passos)</span>
        </button>
      </div>
    );
  }

  // Filter compatible products with same thickness
  const compatibleProducts = products.filter(
    p => Math.abs(p.espessura - coil.espessura) < 0.001
  );

  const totalUsedWidth = strips.reduce((acc, s) => acc + s.largura, 0);
  const scrapWidth = Math.max(0, coil.largura - totalUsedWidth);
  const utilizationPercent = Number(((Math.min(totalUsedWidth, coil.largura) / coil.largura) * 100).toFixed(2));
  const usedWeightTon = Number((coil.peso * (Math.min(totalUsedWidth, coil.largura) / coil.largura)).toFixed(3));
  const scrapWeightTon = Number((coil.peso * (scrapWidth / coil.largura)).toFixed(3));

  // Strip operations
  const handleRemoveStrip = (stripId: string) => {
    const updated = strips.filter(s => s.id !== stripId);
    // Renumber strips
    const renumbered = updated.map((s, idx) => ({ ...s, stripNumber: idx + 1 }));
    onUpdateStrips(renumbered);
  };

  const handleAddCompanionStrip = () => {
    if (!selectedCompanionProduct) return;
    const prod = products.find(p => p.id === selectedCompanionProduct || p.codigo === selectedCompanionProduct);
    if (!prod) return;

    const stripWeightTon = Number((coil.peso * (prod.larguraFita / coil.largura)).toFixed(3));
    const stripWeightKg = Math.round(stripWeightTon * 1000);
    const kgPerMeter = prod.pesoPorMetro || (prod.larguraFita * prod.espessura * 7.85 / 1000);
    const linearMeters = kgPerMeter > 0 ? Math.round(stripWeightKg / kgPerMeter) : 0;

    const newStrip: SlitterStrip = {
      id: `STRIP_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stripNumber: strips.length + 1,
      productId: prod.id,
      productCode: prod.codigo,
      productDescription: prod.descricao,
      productFamily: prod.familia,
      largura: prod.larguraFita,
      espessura: coil.espessura,
      pesoTon: stripWeightTon,
      pesoKg: stripWeightKg,
      metrosLineares: linearMeters,
      cor: '#ec4899' // distinct vibrant color
    };

    onUpdateStrips([...strips, newStrip]);
    setSelectedCompanionProduct('');
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-400" />
            TELA 3 – Estúdio de Simulação de Corte Slitter
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualização milimétrica do corte transversal da bobina com ajuste fino interativo das fitas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (scrapWidth === 0) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              onProceedToOrder(coil, strips);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Gerar Ordem de Slitter (OS)</span>
          </button>
        </div>
      </div>

      {/* Main Slitter Visualizer Graph */}
      <SlitterVisualizer
        coil={coil}
        strips={strips}
        onRemoveStrip={handleRemoveStrip}
        interactive={true}
      />

      {/* Interactive Controls Bar: Add Companion Strip */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Ajuste Manual: Adicionar Fita Complementar
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCompanionProduct}
            onChange={(e) => setSelectedCompanionProduct(e.target.value)}
            className="flex-1 min-w-[280px] px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecione um produto compatível (espessura {coil.espessura}mm)...</option>
            {compatibleProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.descricao.slice(0, 45)} (Fita {p.larguraFita}mm)
              </option>
            ))}
          </select>

          <button
            onClick={handleAddCompanionStrip}
            disabled={!selectedCompanionProduct}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Fita à Bobina</span>
          </button>
        </div>
      </div>

      {/* Detailed Strips Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Detalhamento da Ordem de Facas / Fitas ({strips.length} fitas programadas)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Fita #</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Descrição do Produto</th>
                <th className="py-2.5 px-3">Família</th>
                <th className="py-2.5 px-3 text-right">Largura (mm)</th>
                <th className="py-2.5 px-3 text-right">Peso Alocado (t)</th>
                <th className="py-2.5 px-3 text-right">Metros Lineares</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {strips.map((strip, idx) => (
                <tr key={strip.id || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: strip.cor }} />
                    Fita {String(strip.stripNumber).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 font-bold text-blue-400">{strip.productCode}</td>
                  <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate">{strip.productDescription}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      strip.productFamily === 'TUBO' ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'
                    }`}>
                      {strip.productFamily}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white">{strip.largura} mm</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">{strip.pesoTon} t</td>
                  <td className="py-3 px-3 text-right text-sky-300">{strip.metrosLineares} m</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleRemoveStrip(strip.id)}
                      title="Remover esta fita"
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
