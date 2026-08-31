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
import { Product, Coil, SlitterStrip, SlitterOrder, SlitterCombination, Ferramental } from './types/pcp';
import { SlitterProductionProgram } from './services/readinessService';

const TAB_ROUTES: Record<TabType, string> = {
  dashboard: 'programacao',
  planning: 'planejamento',
  simulation: 'estudio',
  order: 'ordem-producao',
  reports: 'relatorios',
  data: 'gestao-dados'
};

const ROUTE_TABS: Record<string, TabType> = {
  'programacao': 'dashboard',
  'planejamento': 'planning',
  'estudio': 'simulation',
  'ordem-producao': 'order',
  'relatorios': 'reports',
  'gestao-dados': 'data'
};

interface ParsedRoute {
  hash: string;
  tab: TabType;
  subAction: string | null;
  paramId: string | null;
}

const parseHashRoute = (): ParsedRoute => {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const parts = hash.split('/').filter(Boolean);
  
  const mainRoute = parts[0] || 'programacao';
  const tab = ROUTE_TABS[mainRoute] || 'dashboard';

  let subAction: string | null = null;
  let paramId: string | null = null;

  if (parts.length === 2) {
    paramId = parts[1];
  } else if (parts.length >= 3) {
    subAction = parts[1];
    paramId = parts[2];
  }

  return { hash, tab, subAction, paramId };
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<ParsedRoute>(parseHashRoute);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firebaseOnline, setFirebaseOnline] = useState<boolean>(true);
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [coils, setCoils] = useState<Coil[]>([]);
  const [orders, setOrders] = useState<SlitterOrder[]>([]);
  const [ferramentais, setFerramentais] = useState<Ferramental[]>([]);
  const [history, setHistory] = useState(StorageService.getCutHistory());
  const [kpis, setKpis] = useState(StorageService.getKPIs());

  // Active planning / simulation state
  const [preSelectedProductId, setPreSelectedProductId] = useState<string | null>(null);
  const [activeCoil, setActiveCoil] = useState<Coil | null>(null);
  const [activeStrips, setActiveStrips] = useState<SlitterStrip[]>([]);
  const [activeOrder, setActiveOrder] = useState<SlitterOrder | null>(null);
  const [selectedOpIdSummary, setSelectedOpIdSummary] = useState<string | null>(null);

  const activeTab = currentRoute.tab;

  const navigateToRoute = (tab: TabType, subAction?: string | null, paramId?: string | null) => {
    const route = TAB_ROUTES[tab] || 'programacao';
    let newHash = `#/${route}`;
    
    if (subAction && paramId) {
      newHash = `#/${route}/${subAction}/${paramId}`;
    } else if (paramId) {
      newHash = `#/${route}/${paramId}`;
    }

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  };

  const handleSelectTab = (tab: TabType) => {
    setSelectedOpIdSummary(null);
    navigateToRoute(tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashRoute();
      setCurrentRoute(parsed);

      if (parsed.tab === 'reports' && parsed.subAction === 'op' && parsed.paramId) {
        setSelectedOpIdSummary(parsed.paramId);
      } else if (parsed.tab === 'reports') {
        setSelectedOpIdSummary(null);
      }

      if (parsed.tab === 'order' && parsed.paramId) {
        const found = StorageService.getOrders().find(
          o => o.id === parsed.paramId || o.numeroOP === parsed.paramId || o.numeroOS === parsed.paramId
        );
        if (found) {
          setActiveOrder(found);
          setActiveCoil({
            id: found.bobinaId,
            codigo: found.bobinaCodigo,
            lote: found.bobinaLote,
            largura: found.bobinaLargura,
            espessura: found.bobinaEspessura,
            peso: found.bobinaPesoOriginal,
            quantidade: 1,
            status: 'Consumida'
          });
          setActiveStrips(found.fitas);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial route if hash is empty
    if (!window.location.hash) {
      window.location.hash = '#/programacao';
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadData = () => {
    setProducts(StorageService.getProducts());
    setCoils(StorageService.getCoils());
    setOrders(StorageService.getOrders());
    setFerramentais(StorageService.getFerramentais());
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

  // Handlers for cross-view navigation with deep links
  const handleClearActiveWorkspace = () => {
    setActiveCoil(null);
    setActiveStrips([]);
    setActiveOrder(null);
    setPreSelectedProductId(null);
    setSelectedOpIdSummary(null);
  };

  const handleNavigateToPlanning = (productId?: string) => {
    handleClearActiveWorkspace();
    if (productId) {
      setPreSelectedProductId(productId);
    }
    navigateToRoute('planning');
  };

  const handleFinishOrder = () => {
    handleClearActiveWorkspace();
    loadData();
    navigateToRoute('dashboard');
  };

  const handleOpenProgramInSimulation = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    navigateToRoute('simulation');
  };

  const handleOpenProgramInOrder = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    navigateToRoute('order');
  };

  const handleProceedToSimulation = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    navigateToRoute('simulation');
  };

  const handleProceedToOrder = (coil: Coil, strips: SlitterStrip[], combination?: SlitterCombination) => {
    setActiveCoil(coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    navigateToRoute('order');
  };

  const handleViewOrderDetails = (order: SlitterOrder) => {
    const opId = order.numeroOP || order.numeroOS || order.id;
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
    navigateToRoute('order', null, opId);
  };

  const handleSelectOpSummary = (opId: string | null) => {
    if (opId) {
      setSelectedOpIdSummary(opId);
      navigateToRoute('reports', 'op', opId);
    } else {
      setSelectedOpIdSummary(null);
      navigateToRoute('reports');
    }
  };

  const handleOrderSaved = (savedOrder: SlitterOrder) => {
    const opId = savedOrder.numeroOP || savedOrder.numeroOS || savedOrder.id;
    loadData();
    navigateToRoute('order', null, opId);
  };

  const activeTabTitles: Record<string, string> = {
    dashboard: 'Painel Geral — Programação de Slitters',
    planning: 'Planejamento de Corte (3 Etapas)',
    simulation: 'Estúdio de Corte & Ajuste de Facas',
    order: 'Ordem de Produção (OP)',
    reports: 'Relatórios & Histórico',
    data: 'Gestão de Estoque & Importador Excel'
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Docked Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        ordersCount={orders.length}
        coilsCount={coils.filter(c => c.status === 'Disponível').length}
      />

      {/* Main Content Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTabTitle={activeTabTitles[activeTab]}
          firebaseOnline={firebaseOnline}
          onSync={handleSyncFirebase}
          isSyncing={isSyncing}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              coils={coils}
              products={products}
              orders={orders}
              onNavigateToPlanning={handleNavigateToPlanning}
              onNavigateToOrders={() => handleSelectTab('reports')}
              onNavigateToData={() => handleSelectTab('data')}
              onOpenProgramSimulation={handleOpenProgramInSimulation}
              onOpenProgramOrder={handleOpenProgramInOrder}
            />
          )}

          {activeTab === 'planning' && (
            <PlanningView
              products={products}
              coils={coils}
              ferramentais={ferramentais}
              preSelectedProductId={preSelectedProductId}
              onProceedToSimulation={handleProceedToSimulation}
              onProceedToOrder={handleProceedToOrder}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationView
              coil={activeCoil}
              strips={activeStrips}
              products={products}
              onUpdateStrips={setActiveStrips}
              onProceedToOrder={handleProceedToOrder}
              onNavigateToPlanning={() => handleSelectTab('planning')}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {activeTab === 'order' && (
            <SlitterOrderView
              order={activeOrder}
              coil={activeCoil}
              strips={activeStrips}
              onOrderSaved={handleOrderSaved}
              onFinishOrder={handleFinishOrder}
              onNavigateToPlanning={() => handleSelectTab('planning')}
              onNavigateToSimulation={() => handleSelectTab('simulation')}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              orders={orders}
              coils={coils}
              products={products}
              history={history}
              selectedOpIdSummary={selectedOpIdSummary}
              onSelectOpSummary={handleSelectOpSummary}
              onViewOrderDetails={handleViewOrderDetails}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {activeTab === 'data' && (
            <DataManagementView
              coils={coils}
              products={products}
              ferramentais={ferramentais}
              onDataUpdated={loadData}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
