import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { PlanningView } from './views/PlanningView';
import { SimulationView } from './views/SimulationView';
import { SlitterOrderView } from './views/SlitterOrderView';
import { ReportsView } from './views/ReportsView';
import { DataManagementView } from './views/DataManagementView';
import { AIAgentView } from './views/AIAgentView';
import { CotacaoView } from './views/CotacaoView';
import { StorageService } from './services/storageService';
import { SlitterOptimizer } from './services/slitterOptimizer';
import { OrderBuilderService, OrderCoilInput } from './services/orderBuilderService';
import { Product, Coil, SlitterStrip, SlitterOrder, SlitterCombination, Ferramental, SlitterIntermediaryItem } from './types/pcp';
import { SlitterProductionProgram } from './services/readinessService';

const TAB_ROUTES: Record<TabType, string> = {
  dashboard: 'programacao',
  planning: 'planejamento',
  simulation: 'estudio',
  order: 'ordem-producao',
  cotacao: 'cotacao',
  reports: 'relatorios',
  data: 'gestao-dados',
  ai: 'agente-ia'
};

const ROUTE_TABS: Record<string, TabType> = {
  'programacao': 'dashboard',
  'planejamento': 'planning',
  'estudio': 'simulation',
  'ordem-producao': 'order',
  'cotacao': 'cotacao',
  'relatorios': 'reports',
  'gestao-dados': 'data',
  'agente-ia': 'ai'
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

const buildInputsFromOrder = (order: SlitterOrder): OrderCoilInput[] => {
  if (order.bobinas && order.bobinas.length > 0) {
    return order.bobinas.map(b => ({
      coil: {
        id: b.coilId,
        codigo: b.bobinaCodigo,
        lote: b.bobinaLote,
        largura: b.bobinaLargura,
        espessura: b.bobinaEspessura,
        peso: b.bobinaPesoOriginal,
        quantidade: 1,
        status: 'Consumida' as const
      },
      strips: b.fitas
    }));
  }
  return [{
    coil: {
      id: order.bobinaId,
      codigo: order.bobinaCodigo,
      lote: order.bobinaLote,
      largura: order.bobinaLargura,
      espessura: order.bobinaEspessura,
      peso: order.bobinaPesoOriginal,
      quantidade: 1,
      status: 'Consumida' as const
    },
    strips: order.fitas
  }];
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
  const [intermediarySlitters, setIntermediarySlitters] = useState<SlitterIntermediaryItem[]>([]);
  const [history, setHistory] = useState(StorageService.getCutHistory());
  const [kpis, setKpis] = useState(StorageService.getKPIs());

  // Active planning / simulation state
  const [preSelectedProductId, setPreSelectedProductId] = useState<string | null>(null);
  const [activeCoil, setActiveCoil] = useState<Coil | null>(null);
  const [activeStrips, setActiveStrips] = useState<SlitterStrip[]>([]);
  const [activeCoilInputs, setActiveCoilInputs] = useState<OrderCoilInput[]>([]);
  const [activeOrder, setActiveOrder] = useState<SlitterOrder | null>(null);
  const [selectedOpIdSummary, setSelectedOpIdSummary] = useState<string | null>(null);
  const [orderDraft, setOrderDraft] = useState<{ operador?: string; turno?: string; maquina?: string; observacoes?: string }>({});
  const [orderJustCreated, setOrderJustCreated] = useState<boolean>(false);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  const activeTab = currentRoute.tab;
  const dashboardSubview = currentRoute.tab === 'dashboard' ? currentRoute.paramId : null;
  const reportsSubTab = currentRoute.tab === 'reports' && currentRoute.subAction !== 'op' ? currentRoute.paramId : null;

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
          const inputs = buildInputsFromOrder(found);
          setActiveOrder(found);
          setActiveCoilInputs(inputs);
          setActiveCoil(inputs[0]?.coil || null);
          setActiveStrips(inputs[0]?.strips || []);
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
    setIntermediarySlitters(StorageService.getIntermediarySlitters());
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
    setActiveCoilInputs([]);
    setActiveOrder(null);
    setPreSelectedProductId(null);
    setSelectedOpIdSummary(null);
    setOrderDraft({});
    setOrderJustCreated(false);
  };

  const handleNavigateToPlanning = (productId?: string) => {
    handleClearActiveWorkspace();
    if (productId) {
      setPreSelectedProductId(productId);
    }
    navigateToRoute('planning');
  };

  const handleCancelSimulation = () => {
    handleClearActiveWorkspace();
    navigateToRoute('planning');
  };

  const handleNavigateToDashboardFromSimulation = () => {
    handleClearActiveWorkspace();
    navigateToRoute('dashboard');
  };

  const handleFinishOrder = () => {
    handleClearActiveWorkspace();
    loadData();
    navigateToRoute('dashboard');
  };

  const handleOpenProgramInSimulation = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    const inputs: OrderCoilInput[] = [{ coil: program.coil, strips }];
    setActiveCoilInputs(inputs);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    navigateToRoute('simulation');
  };

  const handleOpenProgramInOrder = (program: SlitterProductionProgram) => {
    const strips = SlitterOptimizer.generateStripsFromCombination(program.combination, program.coil);
    const inputs: OrderCoilInput[] = [{ coil: program.coil, strips }];
    setActiveCoilInputs(inputs);
    setActiveCoil(program.coil);
    setActiveStrips(strips);
    setActiveOrder(null);
    setOrderJustCreated(false);
    navigateToRoute('order');
  };

  const handleProceedToSimulation = (
    coil: Coil,
    strips: SlitterStrip[],
    combination?: SlitterCombination,
    allInputs?: OrderCoilInput[]
  ) => {
    const inputs = (allInputs && allInputs.length > 0) ? allInputs : [{ coil, strips }];
    setActiveCoilInputs(inputs);
    setActiveCoil(inputs[0].coil);
    setActiveStrips(inputs[0].strips);
    setActiveOrder(null);
    navigateToRoute('simulation');
  };

  const handleProceedToOrder = (
    coil: Coil,
    strips: SlitterStrip[],
    combination?: SlitterCombination,
    allInputs?: OrderCoilInput[]
  ) => {
    const inputs = (allInputs && allInputs.length > 0) ? allInputs : [{ coil, strips }];
    setActiveCoilInputs(inputs);
    setActiveCoil(inputs[0].coil);
    setActiveStrips(inputs[0].strips);
    setActiveOrder(null);
    setOrderDraft({});
    navigateToRoute('order');
  };

  // A OP já vem salva do wizard de Planejamento (Etapa 3) — só precisamos
  // refletir o estado e abrir o documento já pronto para revisão/impressão.
  const handleOrderCreatedFromPlanning = (order: SlitterOrder) => {
    const inputs = buildInputsFromOrder(order);
    setActiveOrder(order);
    setActiveCoilInputs(inputs);
    setActiveCoil(inputs[0]?.coil || null);
    setActiveStrips(inputs[0]?.strips || []);
    setOrderDraft({});
    setOrderJustCreated(true);
    setHighlightOrderId(order.id);
    loadData();
    navigateToRoute('order', null, order.numeroOP || order.numeroOS || order.id);
  };

  const handleViewOrderDetails = (order: SlitterOrder) => {
    const opId = order.numeroOP || order.numeroOS || order.id;
    const inputs = buildInputsFromOrder(order);
    setActiveOrder(order);
    setActiveCoilInputs(inputs);
    setActiveCoil(inputs[0]?.coil || null);
    setActiveStrips(inputs[0]?.strips || []);
    setOrderJustCreated(false);
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
    setHighlightOrderId(savedOrder.id);
    loadData();
    navigateToRoute('order', null, opId);
  };

  const handleCancelOrder = (orderId: string) => {
    const updated = StorageService.cancelOrder(orderId);
    if (updated) {
      setActiveOrder(prev => (prev && prev.id === updated.id ? updated : prev));
    }
    loadData();
  };

  const activeTabTitles: Record<string, string> = {
    dashboard: 'Painel Geral — Programação de Slitters',
    planning: 'Planejamento de Corte (3 Etapas)',
    simulation: 'Estúdio de Corte & Ajuste de Facas',
    order: 'Ordem de Produção (OP)',
    cotacao: 'Gestão de Estoque — Previsão D+2, Físico vs Contábil & Lote Mínimo',
    reports: 'Relatórios & Histórico',
    data: 'Importador Excel & Base de Cadastros',
    ai: 'Agente de IA — Recomendações, Alertas & Resumo'
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 text-slate-900 selection:bg-orange-500 selection:text-white">
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
              ferramentais={ferramentais}
              intermediarySlitters={intermediarySlitters}
              activeSubview={dashboardSubview}
              onNavigateToSubview={(subview) => navigateToRoute('dashboard', null, subview)}
              onNavigateToPlanning={handleNavigateToPlanning}
              onNavigateToOrders={() => handleSelectTab('reports')}
              onNavigateToData={() => handleSelectTab('data')}
              onNavigateToCotacao={() => handleSelectTab('cotacao')}
              onOpenProgramSimulation={handleOpenProgramInSimulation}
              onOpenProgramOrder={handleOpenProgramInOrder}
            />
          )}

          {activeTab === 'planning' && (
            <PlanningView
              products={products}
              coils={coils}
              ferramentais={ferramentais}
              intermediarySlitters={intermediarySlitters}
              preSelectedProductId={preSelectedProductId}
              onProceedToSimulation={handleProceedToSimulation}
              onOrderCreated={handleOrderCreatedFromPlanning}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}

          {activeTab === 'cotacao' && (
            <CotacaoView
              products={products}
              coils={coils}
              orders={orders}
              ferramentais={ferramentais}
              intermediarySlitters={intermediarySlitters}
              onNavigateToPlanning={handleNavigateToPlanning}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationView
              coil={activeCoil}
              strips={activeStrips}
              coilInputs={activeCoilInputs}
              products={products}
              onUpdateStrips={setActiveStrips}
              onUpdateCoilInputs={setActiveCoilInputs}
              onProceedToOrder={(c, s, all) => handleProceedToOrder(c, s, undefined, all)}
              onNavigateToPlanning={handleNavigateToPlanning}
              onNavigateToDashboard={handleNavigateToDashboardFromSimulation}
              onCancelSimulation={handleCancelSimulation}
            />
          )}

          {activeTab === 'order' && (
            <SlitterOrderView
              order={activeOrder}
              coil={activeCoil}
              strips={activeStrips}
              coilInputs={activeCoilInputs}
              operadorInicial={orderDraft.operador}
              turnoInicial={orderDraft.turno}
              maquinaInicial={orderDraft.maquina}
              observacoesInicial={orderDraft.observacoes}
              justCreated={orderJustCreated}
              onOrderSaved={handleOrderSaved}
              onFinishOrder={handleFinishOrder}
              onCancelOrder={handleCancelOrder}
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
              highlightOrderId={highlightOrderId}
              activeReportTab={reportsSubTab}
              onNavigateToReportTab={(tab) => navigateToRoute('reports', null, tab)}
              onSelectOpSummary={handleSelectOpSummary}
              onViewOrderDetails={handleViewOrderDetails}
              onCancelOrder={(order) => handleCancelOrder(order.id)}
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

          {activeTab === 'ai' && (
            <AIAgentView
              products={products}
              coils={coils}
              orders={orders}
              kpis={kpis}
              history={history}
              onOpenProgramSimulation={handleOpenProgramInSimulation}
              onOpenProgramOrder={handleOpenProgramInOrder}
              onNavigateToDashboard={() => handleSelectTab('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
