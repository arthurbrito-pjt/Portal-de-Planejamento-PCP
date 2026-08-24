import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
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
  Sliders, 
  Scissors, 
  ClipboardCheck, 
  BarChart3, 
  Database 
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firebaseOnline, setFirebaseOnline] = useState<boolean>(true);
  
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

  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    try {
      await StorageService.syncWithFirestore();
      setFirebaseOnline(true);
      loadData();
    } catch {
      setFirebaseOnline(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSyncFirebase().catch(() => {});
  }, []);

  // Handlers for cross-view navigation
  const handleNavigateToPlanning = (productId?: string) => {
    if (productId) {
      setPreSelectedProductId(productId);
    } else {
      setPreSelectedProductId(null);
    }
    setActiveTab('planning');
  };

  const handleProceedToSimulation = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setActiveTab('simulation');
  };

  const handleProceedToOrder = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setActiveTab('order');
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
    setActiveTab('order');
  };

  const handleOrderSaved = (savedOrder: SlitterOrder) => {
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        firebaseOnline={firebaseOnline}
        onSync={handleSyncFirebase}
        isSyncing={isSyncing}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          ordersCount={orders.length}
          coilsCount={coils.filter(c => c.status === 'Disponível').length}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              coils={coils}
              products={products}
              orders={orders}
              onNavigateToPlanning={handleNavigateToPlanning}
              onNavigateToOrders={() => setActiveTab('reports')}
              onNavigateToData={() => setActiveTab('data')}
            />
          )}

          {activeTab === 'planning' && (
            <PlanningView
              products={products}
              coils={coils}
              preSelectedProductId={preSelectedProductId}
              onProceedToSimulation={handleProceedToSimulation}
              onProceedToOrder={handleProceedToOrder}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationView
              coil={activeCoil}
              strips={activeStrips}
              products={products}
              onUpdateStrips={setActiveStrips}
              onProceedToOrder={handleProceedToOrder}
              onNavigateToPlanning={() => setActiveTab('planning')}
            />
          )}

          {activeTab === 'order' && (
            <SlitterOrderView
              order={activeOrder}
              coil={activeCoil}
              strips={activeStrips}
              onOrderSaved={handleOrderSaved}
              onNavigateToPlanning={() => setActiveTab('planning')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              orders={orders}
              coils={coils}
              products={products}
              history={history}
              onViewOrderDetails={handleViewOrderDetails}
            />
          )}

          {activeTab === 'data' && (
            <DataManagementView
              coils={coils}
              products={products}
              onDataUpdated={loadData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden sticky bottom-0 z-40 w-full border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
          { id: 'planning' as TabType, label: 'Planejar', icon: Sliders },
          { id: 'simulation' as TabType, label: 'Slitter', icon: Scissors },
          { id: 'order' as TabType, label: 'OS', icon: ClipboardCheck },
          { id: 'reports' as TabType, label: 'Relatórios', icon: BarChart3 },
          { id: 'data' as TabType, label: 'Dados', icon: Database }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
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
