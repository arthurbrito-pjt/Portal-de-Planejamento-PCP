import React, { useState } from 'react';
import { Coil, Product, SlitterOrder, CutHistoryItem } from '../types/pcp';
import { ExcelService } from '../services/excelService';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Search, 
  Disc, 
  Layers, 
  Scissors, 
  TrendingUp, 
  Eye
} from 'lucide-react';
import { MetricsBadge } from '../components/MetricsBadge';

interface ReportsViewProps {
  orders: SlitterOrder[];
  coils: Coil[];
  products: Product[];
  history: CutHistoryItem[];
  onViewOrderDetails: (order: SlitterOrder) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  coils,
  products,
  onViewOrderDetails
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'slitters' | 'bobinas' | 'produtos' | 'perdas'>('slitters');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleExportAll = () => {
    ExcelService.exportReportsToExcel(coils, products, orders);
  };

  const filteredOrders = orders.filter(o => 
    (o.numeroOP || o.numeroOS || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.bobinaLote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.bobinaCodigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCoilsCut = orders.length;
  const totalScrapMm = orders.reduce((acc, o) => acc + o.sobraMm, 0);
  const avgScrapMm = totalCoilsCut > 0 ? Number((totalScrapMm / totalCoilsCut).toFixed(1)) : 0;
  const totalScrapTon = Number(orders.reduce((acc, o) => acc + (o.sobraPesoTon || 0), 0).toFixed(3));
  const totalWeightProcessed = Number(orders.reduce((acc, o) => acc + o.bobinaPesoOriginal, 0).toFixed(2));

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            TELA 5 – Relatórios Gerenciais & Histórico de Cortes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consulte o histórico de slitters programados, aproveitamento das bobinas e balanço de matéria-prima.
          </p>
        </div>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Relatórios em Excel (.xlsx)</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'slitters', label: 'Ordens de Produção (OP) Geradas', icon: Scissors, count: orders.length },
          { id: 'bobinas', label: 'Consumo por Bobina / Lote', icon: Disc, count: coils.length },
          { id: 'produtos', label: 'Planejamento por Produto Base', icon: Layers, count: products.length },
          { id: 'perdas', label: 'Balanço de Perdas & Sobras', icon: TrendingUp, count: null }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por OP, lote, código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* TAB 1: Slitter Orders */}
      {activeReportTab === 'slitters' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Ordens de Produção (OP) de Slitter Registradas ({filteredOrders.length})
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs font-medium">
              Nenhuma ordem de produção (OP) gerada ainda. Realize um planejamento para emitir sua primeira OP!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-mono font-bold">
                    <th className="py-3 px-3">Número OP</th>
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Lote Bobina</th>
                    <th className="py-3 px-3 text-right">Largura</th>
                    <th className="py-3 px-3 text-right">Espessura</th>
                    <th className="py-3 px-3 text-right">Fitas</th>
                    <th className="py-3 px-3 text-right">Refilo</th>
                    <th className="py-3 px-3 text-right">Aproveitamento</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-black text-blue-700">{o.numeroOP || o.numeroOS}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-sans">{o.dataCriacao}</td>
                      <td className="py-3.5 px-3 font-black text-slate-900">{o.bobinaLote}</td>
                      <td className="py-3.5 px-3 text-right text-slate-700">{o.bobinaLargura} mm</td>
                      <td className="py-3.5 px-3 text-right text-purple-700">{o.bobinaEspessura} mm</td>
                      <td className="py-3.5 px-3 text-right text-slate-900 font-bold">{o.totalFitas}</td>
                      <td className={`py-3.5 px-3 text-right font-black ${o.sobraMm >= 10 && o.sobraMm <= 18 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {o.sobraMm} mm
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                        {o.aproveitamentoPercent}%
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <MetricsBadge type="status" value={o.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onViewOrderDetails(o)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 transition-all shadow-sm"
                          title="Visualizar OP"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Coils */}
      {activeReportTab === 'bobinas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Estoque e Consumo de Bobinas ({coils.length} lotes)
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-mono sticky top-0 bg-white z-10 font-bold">
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Lote</th>
                  <th className="py-3 px-3 text-right">Espessura (mm)</th>
                  <th className="py-3 px-3 text-right">Largura (mm)</th>
                  <th className="py-3 px-3 text-right">Peso (t)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {coils
                  .filter(c => c.lote.toLowerCase().includes(searchTerm.toLowerCase()) || c.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-700">{c.codigo}</td>
                      <td className="py-3 px-3 font-black text-blue-700">{c.lote}</td>
                      <td className="py-3 px-3 text-right text-purple-700">{c.espessura}</td>
                      <td className="py-3 px-3 text-right text-slate-900 font-black">{c.largura}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">{c.peso}</td>
                      <td className="py-3 px-3 text-center">
                        <MetricsBadge type="status" value={c.status} size="sm" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Products */}
      {activeReportTab === 'produtos' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Catálogo de Produtos e Blanks de Fita ({products.length} itens)
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-mono sticky top-0 bg-white z-10 font-bold">
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Família</th>
                  <th className="py-3 px-3 text-right">Espessura (mm)</th>
                  <th className="py-3 px-3 text-right">Largura da Fita (mm)</th>
                  <th className="py-3 px-3 text-right">Demanda (t)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {products
                  .filter(p => p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || p.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-black text-blue-700">{p.codigo}</td>
                      <td className="py-3 px-3 font-sans text-slate-700 max-w-sm truncate font-medium">{p.descricao}</td>
                      <td className="py-3 px-3 font-sans">
                        <MetricsBadge type="familia" value={p.familia} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right text-purple-700">{p.espessura}</td>
                      <td className="py-3 px-3 text-right text-slate-900 font-black">{p.larguraFita}</td>
                      <td className="py-3 px-3 text-right text-amber-700 font-bold">{p.demandaT || 0}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Perdas e Sobras */}
      {activeReportTab === 'perdas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Bobinas Processadas</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1.5 block">
                {totalCoilsCut} bobinas
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Peso Processado</span>
              <span className="text-2xl font-black font-mono text-blue-700 mt-1.5 block">
                {totalWeightProcessed} t
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Refilo Médio</span>
              <span className="text-2xl font-black font-mono text-emerald-700 mt-1.5 block">
                {avgScrapMm} mm (Faixa 10 a 18 mm)
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Refilo Gerado</span>
              <span className="text-2xl font-black font-mono text-amber-700 mt-1.5 block">
                {totalScrapTon} t
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
