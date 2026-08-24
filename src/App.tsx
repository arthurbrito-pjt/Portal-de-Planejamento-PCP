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
import { SlitterOptimizer } from './services/slitterOptimizer';
import { Product, Coil, SlitterStrip, SlitterOrder, SlitterCombination } from './types/pcp';
import { SlitterProductionProgram } from './services/readinessService';

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

  const handleOpenProgramInSimulation = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setActiveTab('simulation');
  };

  const handleOpenProgramInOrder = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setActiveTab('order');
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
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        firebaseOnline={firebaseOnline}
        onSync={handleSyncFirebase}
        isSyncing={isSyncing}
      />

      {/* Fullscreen PC Container: w-full without max-w constraints */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          ordersCount={orders.length}
          coilsCount={coils.filter(c => c.status === 'Disponível').length}
        />

        {/* Dynamic View Panel occupying the entire remaining screen width */}
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
              onOpenProgramSimulation={handleOpenProgramInSimulation}
              onOpenProgramOrder={handleOpenProgramInOrder}
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
    </div>
  );
};

export default App;
