import React, { useState } from 'react';
import { Coil, SlitterStrip, Product } from '../types/pcp';
import { SlitterVisualizer } from '../components/SlitterVisualizer';
import { SlitterCatalogService } from '../services/slitterCatalogService';
import { 
  Scissors, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Sliders
} from 'lucide-react';

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
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
          <Scissors className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Nenhum Corte em Simulação</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Para realizar a simulação gráfica e ajuste fino das fitas do Slitter, inicie selecionando um produto base e a bobina no Planejamento.
        </p>
        <button
          onClick={onNavigateToPlanning}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
        >
          <Sliders className="w-4 h-4" />
          <span>Ir para o Planejamento (6 Passos)</span>
        </button>
      </div>
    );
  }

  const compatibleProducts = products.filter(
    p => Math.abs(p.espessura - coil.espessura) < 0.001
  );

  const handleRemoveStrip = (stripId: string) => {
    const updated = strips.filter(s => s.id !== stripId);
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
      cor: '#ec4899'
    };

    onUpdateStrips([...strips, newStrip]);
    setSelectedCompanionProduct('');
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Scissors className="w-5 h-5 text-blue-600" />
            TELA 3 – Estúdio de Simulação de Corte Slitter
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualização milimétrica do corte transversal da bobina com ajuste fino interativo das facas e destinação dos rolos de fita.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onProceedToOrder(coil, strips)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Gerar Ordem de Produção (OP)</span>
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <Plus className="w-4 h-4 text-blue-600" />
          Bancada de Facas: Adicionar Fita de Slitter Complementar
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCompanionProduct}
            onChange={(e) => setSelectedCompanionProduct(e.target.value)}
            className="flex-1 min-w-[280px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value="">Selecione um produto de destino compatível (espessura {coil.espessura}mm)...</option>
            {compatibleProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.descricao.slice(0, 45)} (Fita {p.larguraFita}mm | Demanda {p.demandaT || 0}t)
              </option>
            ))}
          </select>

          <button
            onClick={handleAddCompanionStrip}
            disabled={!selectedCompanionProduct}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Fita à Bobina</span>
          </button>
        </div>
      </div>

      {/* Detailed Strips Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Layers className="w-4 h-4 text-purple-600" />
            Fitas de Slitter Produzidas & Destinação de Uso ({strips.length} fitas programadas)
          </h3>
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
              {strips.map((strip, idx) => {
                const sltInfo = SlitterCatalogService.getSlitterInfo(strip.largura, strip.espessura);

                return (
                  <tr key={strip.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-black text-slate-900 flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: strip.cor }} />
                      Fita {String(strip.stripNumber).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-3 font-black text-blue-700">
                      <div>{sltInfo.code}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{sltInfo.name}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-slate-800 font-bold max-w-xs">
                      <div className="font-mono text-blue-900 font-bold">{strip.productCode}</div>
                      <div className="text-slate-600 truncate">{strip.productDescription}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        strip.productFamily === 'TUBO' 
                          ? 'bg-blue-50 text-blue-800 border-blue-200' 
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {strip.productFamily}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900">{strip.largura} mm</td>
                    <td className="py-3.5 px-3 text-right text-emerald-700 font-bold">{strip.pesoTon} t</td>
                    <td className="py-3.5 px-3 text-right text-blue-700 font-semibold">{strip.metrosLineares} m</td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveStrip(strip.id)}
                        title="Remover esta fita"
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
  );
};
