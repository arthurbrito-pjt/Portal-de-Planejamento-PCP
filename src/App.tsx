import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { PlanningView } from './views/PlanningView';
import { SimulationView } from './views/SimulationView';
import { SlitterOrderView } from './views/SlitterOrderView';
import { ReportsView } from './views/ReportsView';
import { DataManagementView } from './views/DataManagementView';
import { StorageService } from './services/storageService';
import { Product, Coil, SlitterStrip, SlitterOrder, SlitterCombination } from './types/pcp';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database 
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [coils, setCoils] = useState<Coil[]>([]);
  const [orders, setOrders] = useState<SlitterOrder[]>([]);
  const [history, setHistory] = useState(StorageService.getCutHistory());
  const [kpis, setKpis] = useState(StorageService.getKPIs());

  // Active planning / simulation state
  const [preSelectedProductId, setPreSelectedProductId] = useState<string | null>(null);
  const [activeCoil, setActiveCoil] = useState<Coil | null>(null);
  const [activeStrips, setActiveStrips] = useState<SlitterStrip[]>([]);
  const [activeOrder, setActiveOrder] = useState<SlitterOrder | null>(null);

  const loadData = () => {
    setProducts(StorageService.getProducts());
    setCoils(StorageService.getCoils());
    setOrders(StorageService.getOrders());
    setHistory(StorageService.getCutHistory());
    setKpis(StorageService.getKPIs());
  };

  useEffect(() => {
    loadData();
    // Try background sync with Firebase on initial mount
    StorageService.syncWithFirestore().catch(() => {});
  }, []);

  // Handlers for cross-view navigation
  const handleNavigateToPlanning = (productId?: string) => {
    if (productId) {
      setPreSelectedProductId(productId);
    } else {
      setPreSelectedProductId(null);
    }
    setCurrentTab('planejamento');
  };

  const handleProceedToSimulation = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setCurrentTab('simulacao');
  };

  const handleProceedToOrder = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setCurrentTab('ordem-slitter');
  };

  const handleViewOrderDetails = (order: SlitterOrder) => {
    setActiveOrder(order);
    setActiveCoil({
      id: order.bobinaId,
      codigo: order.bobinaCodigo,
      lote: order.bobinaLote,
      largura: order.bobinaLargura,
      espessura: order.bobinaEspessura,
      peso: order.bobinaPesoOriginal,
      quantidade: 1,
      status: 'Consumida'
    });
    setActiveStrips(order.fitas);
    setCurrentTab('ordem-slitter');
  };

  const handleOrderSaved = (savedOrder: SlitterOrder) => {
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onRefreshData={loadData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {/* View Router Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                kpis={kpis}
                coils={coils}
                products={products}
                orders={orders}
                onNavigateToPlanning={handleNavigateToPlanning}
                onNavigateToOrders={() => setCurrentTab('relatorios')}
                onNavigateToData={() => setCurrentTab('dados')}
              />
            )}

            {currentTab === 'planejamento' && (
              <PlanningView
                products={products}
                coils={coils}
                preSelectedProductId={preSelectedProductId}
                onProceedToSimulation={handleProceedToSimulation}
                onProceedToOrder={handleProceedToOrder}
              />
            )}

            {currentTab === 'simulacao' && (
              <SimulationView
                coil={activeCoil}
                strips={activeStrips}
                products={products}
                onUpdateStrips={setActiveStrips}
                onProceedToOrder={handleProceedToOrder}
                onNavigateToPlanning={() => setCurrentTab('planejamento')}
              />
            )}

            {currentTab === 'ordem-slitter' && (
              <SlitterOrderView
                order={activeOrder}
                coil={activeCoil}
                strips={activeStrips}
                onOrderSaved={handleOrderSaved}
                onNavigateToPlanning={() => setCurrentTab('planejamento')}
              />
            )}

            {currentTab === 'relatorios' && (
              <ReportsView
                orders={orders}
                coils={coils}
                products={products}
                history={history}
                onViewOrderDetails={handleViewOrderDetails}
              />
            )}

            {currentTab === 'dados' && (
              <DataManagementView
                coils={coils}
                products={products}
                onDataUpdated={loadData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 w-full border-t border-slate-800 bg-slate-900/95 backdrop-blur px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'planejamento', label: 'Planejar', icon: CalendarClock },
          { id: 'simulacao', label: 'Slitter', icon: Scissors },
          { id: 'ordem-slitter', label: 'OS', icon: ClipboardCheck },
          { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
          { id: 'dados', label: 'Dados', icon: Database }
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default App;
