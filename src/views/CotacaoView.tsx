import React, { useState, useMemo } from 'react';
import { 
  Product, 
  Coil, 
  SlitterOrder, 
  Ferramental, 
  SlitterIntermediaryItem, 
  CotacaoPrevisaoItem 
} from '../types/pcp';
import { ProductionForecastService } from '../services/productionForecastService';
import { MetricsBadge } from '../components/MetricsBadge';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Scissors, 
  Layers, 
  Disc, 
  Boxes, 
  ArrowRight,
  Sparkles,
  Wrench
} from 'lucide-react';

interface CotacaoViewProps {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  ferramentais: Ferramental[];
  intermediarySlitters: SlitterIntermediaryItem[];
  onNavigateToPlanning?: (productId?: string) => void;
}

export const CotacaoView: React.FC<CotacaoViewProps> = ({
  products,
  coils,
  orders,
  ferramentais,
  intermediarySlitters,
  onNavigateToPlanning
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState<'TODOS' | 'TUBO' | 'PERFIL'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PRONTA_ENTREGA' | 'EM_PRODUCAO_D2' | 'PROGRAMADO_D3' | 'AGUARDANDO_MP'>('TODOS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calcula previsões para todos os itens
  const forecastItems = useMemo(() => {
    return ProductionForecastService.generateAllForecasts(
      products,
      coils,
      orders,
      intermediarySlitters,
      ferramentais
    );
  }, [products, coils, orders, intermediarySlitters, ferramentais]);

  // Contagens para os cards de resumo
  const prontaEntregaCount = forecastItems.filter(f => f.statusAtendimento === 'PRONTA_ENTREGA').length;
  const emProducaoCount = forecastItems.filter(f => f.statusAtendimento === 'EM_PRODUCAO_D2').length;
  const programadoCount = forecastItems.filter(f => f.statusAtendimento === 'PROGRAMADO_D3').length;
  const bloqueadoCount = forecastItems.filter(f => f.statusAtendimento === 'AGUARDANDO_MP').length;

  // Filtragem da lista
  const filteredForecasts = useMemo(() => {
    return forecastItems.filter(item => {
      const p = item.produto;
      const matchesSearch = 
        p.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.larguraFita}`.includes(searchQuery) ||
        `${p.espessura}`.includes(searchQuery);

      const matchesFamily = familyFilter === 'TODOS' || p.familia === familyFilter;
      const matchesStatus = statusFilter === 'TODOS' || item.statusAtendimento === statusFilter;

      return matchesSearch && matchesFamily && matchesStatus;
    });
  }, [forecastItems, searchQuery, familyFilter, statusFilter]);

  const handleCopyQuote = (item: CotacaoPrevisaoItem) => {
    const text = `📋 [COTAÇÃO CENTRAL DE AÇO]\n` +
      `Item: ${item.produto.codigo} - ${item.produto.descricao}\n` +
      `Espessura: ${item.produto.espessura}mm | Fita Slitter: ${item.produto.larguraFita}mm\n` +
      `Previsão PCP: ${item.dataPrevisaoTexto}\n` +
      `Lote Mínimo Recomendado: ${item.loteMinimoRecomendadoT} toneladas\n` +
      `Situação do Material: ${item.detalhePrevisao}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(item.produto.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Portal da Cotação & Previsão Fabril
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Previsão de Produção & Cotações (Regra D+2)
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Previsão dinâmica calculada a partir do momento em que a produção é iniciada (sempre D+2 após corte), estoque intermediário e disponibilidade de bobinas.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'PRONTA_ENTREGA' ? 'TODOS' : 'PRONTA_ENTREGA')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'PRONTA_ENTREGA' 
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-[1.02]' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'PRONTA_ENTREGA' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Slitter no Galpão
            </span>
            <Boxes className={`w-5 h-5 ${statusFilter === 'PRONTA_ENTREGA' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black">{prontaEntregaCount}</div>
          <div className={`text-xs font-medium mt-1 ${statusFilter === 'PRONTA_ENTREGA' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Fitas prontas / Pronta Entrega
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'EM_PRODUCAO_D2' ? 'TODOS' : 'EM_PRODUCAO_D2')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'EM_PRODUCAO_D2' 
              ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'EM_PRODUCAO_D2' ? 'text-blue-100' : 'text-slate-500'}`}>
              Em Corte Hoje
            </span>
            <Scissors className={`w-5 h-5 ${statusFilter === 'EM_PRODUCAO_D2' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className="text-2xl font-black">{emProducaoCount}</div>
          <div className={`text-xs font-medium mt-1 ${statusFilter === 'EM_PRODUCAO_D2' ? 'text-blue-100' : 'text-blue-700'}`}>
            Regra Estrita D+2 (2 dias úteis)
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'PROGRAMADO_D3' ? 'TODOS' : 'PROGRAMADO_D3')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'PROGRAMADO_D3' 
              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'PROGRAMADO_D3' ? 'text-amber-100' : 'text-slate-500'}`}>
              Bobina na Baia
            </span>
            <Disc className={`w-5 h-5 ${statusFilter === 'PROGRAMADO_D3' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className="text-2xl font-black">{programadoCount}</div>
          <div className={`text-xs font-medium mt-1 ${statusFilter === 'PROGRAMADO_D3' ? 'text-amber-100' : 'text-amber-700'}`}>
            Previsão D+3 (Corte + Conformação)
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'AGUARDANDO_MP' ? 'TODOS' : 'AGUARDANDO_MP')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'AGUARDANDO_MP' 
              ? 'bg-red-500 text-white border-red-600 shadow-md scale-[1.02]' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'AGUARDANDO_MP' ? 'text-red-100' : 'text-slate-500'}`}>
              Sem Bobina
            </span>
            <AlertCircle className={`w-5 h-5 ${statusFilter === 'AGUARDANDO_MP' ? 'text-white' : 'text-red-600'}`} />
          </div>
          <div className="text-2xl font-black">{bloqueadoCount}</div>
          <div className={`text-xs font-medium mt-1 ${statusFilter === 'AGUARDANDO_MP' ? 'text-red-100' : 'text-red-700'}`}>
            Aguardando Matéria-Prima
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar código, descrição, tubo, perfil, medida..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Family Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['TODOS', 'TUBO', 'PERFIL'] as const).map(fam => (
              <button
                key={fam}
                onClick={() => setFamilyFilter(fam)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  familyFilter === fam 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PRONTA_ENTREGA">Pronta Entrega (Slitter Pronto)</option>
            <option value="EM_PRODUCAO_D2">D+2 (Em Produção Hoje)</option>
            <option value="PROGRAMADO_D3">D+3 (Bobina Disponível)</option>
            <option value="AGUARDANDO_MP">Sem Bobina (Aguardando)</option>
          </select>
        </div>
      </div>

      {/* Main Quotation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] font-bold">
                <th className="py-3 px-4">Produto / Código</th>
                <th className="py-3 px-3">Família & Dimensões</th>
                <th className="py-3 px-3 text-center">Dificuldade</th>
                <th className="py-3 px-3 text-center">Estoque Intermediário</th>
                <th className="py-3 px-3 text-center">Bobinas na Baia</th>
                <th className="py-3 px-3">Previsão PCP (Regra D+2)</th>
                <th className="py-3 px-3 text-center">Lote Mín.</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForecasts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum item encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredForecasts.slice(0, 100).map(item => {
                  const p = item.produto;
                  const isCopied = copiedId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Produto / Código */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900 text-xs">{p.codigo}</div>
                        <div className="text-[11px] text-slate-600 font-medium line-clamp-1 max-w-xs">{p.descricao}</div>
                      </td>

                      {/* Família & Dimensões */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MetricsBadge type="familia" value={p.familia} size="sm" />
                        </div>
                        <div className="font-mono text-[11px] text-slate-700 font-bold">
                          Esp: <span className="text-slate-900">{p.espessura}mm</span> | Fita: <span className="text-slate-900">{p.larguraFita}mm</span>
                        </div>
                      </td>

                      {/* Dificuldade */}
                      <td className="py-3 px-3 text-center">
                        <MetricsBadge type="dificuldade" value={item.grauDificuldade} size="sm" />
                      </td>

                      {/* Estoque Intermediário */}
                      <td className="py-3 px-3 text-center">
                        {item.estoqueIntermediarioDisponivelTon > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[11px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {item.estoqueIntermediarioDisponivelTon}t Prontas
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">0.0t</span>
                        )}
                      </td>

                      {/* Bobinas na Baia */}
                      <td className="py-3 px-3 text-center">
                        {item.bobinasCompativeisTon > 0 ? (
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {item.bobinasCompativeisTon}t disp.
                          </span>
                        ) : (
                          <span className="text-red-500 font-mono text-[11px] font-bold">Sem Bobina</span>
                        )}
                      </td>

                      {/* Previsão PCP */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-black border ${
                            item.statusAtendimento === 'PRONTA_ENTREGA' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            item.statusAtendimento === 'EM_PRODUCAO_D2' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                            item.statusAtendimento === 'PROGRAMADO_D3' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.dataPrevisaoTexto}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                          {item.detalhePrevisao}
                        </div>
                      </td>

                      {/* Lote Mín. */}
                      <td className="py-3 px-3 text-center font-mono font-black text-slate-700">
                        {item.loteMinimoRecomendadoT}t
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyQuote(item)}
                            title="Copiar dados para a proposta comercial"
                            className={`p-1.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
                              isCopied 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Copiar'}</span>
                          </button>

                          {onNavigateToPlanning && (
                            <button
                              onClick={() => onNavigateToPlanning(p.id)}
                              title="Planejar corte no Slitter"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Planejar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
