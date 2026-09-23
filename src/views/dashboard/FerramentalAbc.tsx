import React, { useMemo } from 'react';
import { Ferramental, Product } from '../../types/pcp';
import { Wrench, Zap, Layers, Clock } from 'lucide-react';
import { ReadinessService } from '../../services/readinessService';

interface FerramentalAbcProps {
  ferramentais: Ferramental[];
  products: Product[];
}

export const FerramentalAbc: React.FC<FerramentalAbcProps> = ({ ferramentais, products }) => {
  const toolingAnalysis = useMemo(() => ReadinessService.analyzeToolingABC(ferramentais, products), [ferramentais, products]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-wide mb-1">
          <Wrench className="w-3.5 h-3.5" />
          Política de Sequenciamento & Curva ABC de Ferramentais — Cedisa Central de Aço
        </div>
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Classificação por Frequência de Giro de Rolos e Facas
        </h2>
        <p className="text-sm text-slate-500 max-w-3xl mt-1">
          Ferramentais <strong className="font-bold text-slate-700">Classe A ("Sempre Roda")</strong> têm giro contínuo. Ferramentais <strong className="font-bold text-slate-700">Classe C ("Menos Roda")</strong> exigem acúmulo de lote mínimo em carteira antes de autorizar a troca de rolos, evitando paradas de máquina para volumes insignificantes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLASSE A */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-emerald-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide">Classe A</span>
              <h3 className="text-sm font-black text-slate-900 mt-1">Sempre Roda (Alto Giro)</h3>
            </div>
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="p-3 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50 font-medium">
            Itens padrão de altíssima rotatividade. Liberados para programação contínua diária.
          </div>
          <div className="p-3 divide-y divide-slate-100 space-y-2 overflow-y-auto max-h-[500px]">
            {toolingAnalysis.filter(t => t.ferramental.classe === 'A').map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{item.ferramental.codigo}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Liberado Contínuo</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{item.ferramental.nome}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Lote Mín: {item.ferramental.capacidadeMinimaT}t | Ideal: {item.ferramental.capacidadeIdealT}t | Máx: {item.ferramental.capacidadeMaximaT}t
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLASSE B - AZUL ESCURO CEDISA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-[#0B1F3A]/5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B1F3A] text-white text-[10px] font-black uppercase tracking-wide shadow-xs">Classe B</span>
              <h3 className="text-sm font-black text-slate-900 mt-1">Giro Regular (Semanal)</h3>
            </div>
            <Layers className="w-5 h-5 text-[#0B1F3A]" />
          </div>
          <div className="p-3 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50 font-medium">
            Itens com campanhas programadas em ciclos regulares.
          </div>
          <div className="p-3 divide-y divide-slate-100 space-y-2 overflow-y-auto max-h-[500px]">
            {toolingAnalysis.filter(t => t.ferramental.classe === 'B').map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{item.ferramental.codigo}</span>
                  <span className="text-[11px] font-bold text-[#0B1F3A] bg-[#0B1F3A]/10 border border-[#0B1F3A]/20 px-2 py-0.5 rounded-md">{item.statusAcumulo}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{item.ferramental.nome}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Lote Mín: {item.ferramental.capacidadeMinimaT}t | Ideal: {item.ferramental.capacidadeIdealT}t | Máx: {item.ferramental.capacidadeMaximaT}t
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLASSE C - LARANJA CEDISA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-orange-50/70 border-b border-orange-200 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wide shadow-xs">Classe C</span>
              <h3 className="text-sm font-black text-slate-900 mt-1">Menos Roda (Requer Acúmulo)</h3>
            </div>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="p-3 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50 font-medium">
            Itens sob encomenda/especiais. Setup condicionado ao atingimento do lote mínimo.
          </div>
          <div className="p-3 divide-y divide-slate-100 space-y-3 overflow-y-auto max-h-[500px]">
            {toolingAnalysis.filter(t => t.ferramental.classe === 'C').map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{item.ferramental.codigo}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    item.prontaParaSetup 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-orange-50 text-orange-800 border-orange-200'
                  }`}>
                    {item.prontaParaSetup ? 'Setup Autorizado' : 'Aguardando Lote'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{item.ferramental.nome}</div>

                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono font-bold">
                    <span>Demanda Acumulada: {item.demandaAcumuladaT} t</span>
                    <span>Mínimo: {item.ferramental.capacidadeMinimaT} t</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${item.prontaParaSetup ? 'bg-emerald-500' : 'bg-orange-500'}`}
                      style={{ width: `${item.percentualAcumulado}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
