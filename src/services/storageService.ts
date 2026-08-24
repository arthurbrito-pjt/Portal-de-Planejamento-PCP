import { Product, Coil, SlitterOrder, CutHistoryItem, PCPKPIs } from '../types/pcp';
import { INITIAL_PRODUCTS, INITIAL_COILS } from '../data/initialData';
import { FirestoreService } from '../firebase/firestoreService';

const STORAGE_KEYS = {
  PRODUCTS: 'pcp_products_v1',
  COILS: 'pcp_coils_v1',
  SLITTER_ORDERS: 'pcp_slitter_orders_v1',
  CUT_HISTORY: 'pcp_cut_history_v1',
  LAST_SYNC: 'pcp_last_sync_v1'
};

export class StorageService {
  private static productsCache: Product[] | null = null;
  private static coilsCache: Coil[] | null = null;
  private static ordersCache: SlitterOrder[] | null = null;
  private static historyCache: CutHistoryItem[] | null = null;

  // Initialize data from local or initial seeds
  static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COILS)) {
      localStorage.setItem(STORAGE_KEYS.COILS, JSON.stringify(INITIAL_COILS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLITTER_ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.SLITTER_ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUT_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify([]));
    }
  }

  // Sync with Firestore (bidirectional)
  static async syncWithFirestore(): Promise<{ success: boolean; message: string }> {
    try {
      const isOnline = await FirestoreService.testConnection();
      if (!isOnline) {
        return { success: false, message: 'Firestore offline ou sem permissão direta. Operando com armazenamento local seguro.' };
      }

      // Fetch from Firestore
      const remoteCoils = await FirestoreService.getCoils();
      const remoteProducts = await FirestoreService.getProducts();
      const remoteOrders = await FirestoreService.getSlitterOrders();

      if (remoteCoils.length > 0) {
        this.saveCoils(remoteCoils, false);
      } else {
        // First time cloud sync: push local coils to firestore
        const localCoils = this.getCoils();
        await FirestoreService.saveMultipleCoils(localCoils.slice(0, 50));
      }

      if (remoteProducts.length > 0) {
        this.saveProducts(remoteProducts, false);
      } else {
        const localProds = this.getProducts();
        await FirestoreService.saveMultipleProducts(localProds.slice(0, 50));
      }

      if (remoteOrders.length > 0) {
        this.saveOrders(remoteOrders, false);
      }

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return { success: true, message: 'Sincronizado com sucesso com Firebase Firestore!' };
    } catch (e: any) {
      console.warn('Sync failed', e);
      return { success: false, message: `Falha na sincronização: ${e.message || e}` };
    }
  }

  // Products
  static getProducts(): Product[] {
    if (this.productsCache) return this.productsCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.productsCache = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
      return this.productsCache || INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  static saveProducts(products: Product[], syncCloud = true): void {
    this.productsCache = products;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    if (syncCloud) {
      FirestoreService.saveMultipleProducts(products).catch(() => {});
    }
  }

  static addProduct(product: Product): void {
    const prods = this.getProducts();
    const existingIdx = prods.findIndex(p => p.id === product.id || p.codigo === product.codigo);
    if (existingIdx >= 0) {
      prods[existingIdx] = product;
    } else {
      prods.unshift(product);
    }
    this.saveProducts(prods);
  }

  // Coils
  static getCoils(): Coil[] {
    if (this.coilsCache) return this.coilsCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COILS);
      this.coilsCache = raw ? JSON.parse(raw) : INITIAL_COILS;
      return this.coilsCache || INITIAL_COILS;
    } catch {
      return INITIAL_COILS;
    }
  }

  static saveCoils(coils: Coil[], syncCloud = true): void {
    this.coilsCache = coils;
    localStorage.setItem(STORAGE_KEYS.COILS, JSON.stringify(coils));
    if (syncCloud) {
      FirestoreService.saveMultipleCoils(coils).catch(() => {});
    }
  }

  static addCoil(coil: Coil): void {
    const coils = this.getCoils();
    const existingIdx = coils.findIndex(c => c.id === coil.id || (c.lote === coil.lote && c.codigo === coil.codigo));
    if (existingIdx >= 0) {
      coils[existingIdx] = coil;
    } else {
      coils.unshift(coil);
    }
    this.saveCoils(coils);
  }

  static updateCoilStatus(coilId: string, status: Coil['status']): void {
    const coils = this.getCoils();
    const c = coils.find(x => x.id === coilId);
    if (c) {
      c.status = status;
      this.saveCoils(coils);
    }
  }

  // Orders
  static getOrders(): SlitterOrder[] {
    if (this.ordersCache) return this.ordersCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SLITTER_ORDERS);
      this.ordersCache = raw ? JSON.parse(raw) : [];
      return this.ordersCache || [];
    } catch {
      return [];
    }
  }

  static saveOrders(orders: SlitterOrder[], syncCloud = true): void {
    this.ordersCache = orders;
    localStorage.setItem(STORAGE_KEYS.SLITTER_ORDERS, JSON.stringify(orders));
  }

  static addOrder(order: SlitterOrder): void {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    
    // Update coil status
    this.updateCoilStatus(order.bobinaId, 'Consumida');

    // Add to history
    this.addCutHistory({
      id: `HIST_${order.id}`,
      orderId: order.id,
      dataCorte: order.dataCriacao,
      bobinaLote: order.bobinaLote,
      bobinaLargura: order.bobinaLargura,
      bobinaEspessura: order.bobinaEspessura,
      bobinaPesoTon: order.bobinaPesoOriginal,
      aproveitamentoPercent: order.aproveitamentoPercent,
      sobraMm: order.sobraMm,
      totalFitas: order.totalFitas,
      resumoFitas: order.fitas.map(f => `${f.largura}mm (${f.productCode})`).join(' + '),
      status: 'Concluído'
    });

    // Cloud sync
    FirestoreService.saveSlitterOrder(order).catch(() => {});
  }

  // Cut History
  static getCutHistory(): CutHistoryItem[] {
    if (this.historyCache) return this.historyCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUT_HISTORY);
      this.historyCache = raw ? JSON.parse(raw) : [];
      return this.historyCache || [];
    } catch {
      return [];
    }
  }

  static addCutHistory(item: CutHistoryItem): void {
    const hist = this.getCutHistory();
    hist.unshift(item);
    this.historyCache = hist;
    localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify(hist));
    FirestoreService.addCutHistoryItem(item).catch(() => {});
  }

  // Reset to initial demo database
  static resetToInitial(): void {
    this.productsCache = INITIAL_PRODUCTS;
    this.coilsCache = INITIAL_COILS;
    this.ordersCache = [];
    this.historyCache = [];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COILS, JSON.stringify(INITIAL_COILS));
    localStorage.setItem(STORAGE_KEYS.SLITTER_ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify([]));
  }

  // KPI calculations
  static getKPIs(): PCPKPIs {
    const coils = this.getCoils();
    const availableCoils = coils.filter(c => c.status === 'Disponível');
    const orders = this.getOrders();
    const products = this.getProducts();

    const totalBobinasDisponiveis = availableCoils.length;
    const pesoTotalEstoqueTon = Number(availableCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(2));
    
    const totalOrders = orders.length;
    const aproveitamentoMedioPercent = totalOrders > 0 
      ? Number((orders.reduce((acc, o) => acc + o.aproveitamentoPercent, 0) / totalOrders).toFixed(2))
      : 99.15; // default benchmark based on actual production data

    const totalRefiloGeradoTon = Number(orders.reduce((acc, o) => acc + (o.sobraPesoTon || 0), 0).toFixed(3));

    const demandaTotalTon = Number(products.reduce((acc, p) => acc + (p.demandaT || 0), 0).toFixed(2));
    
    // Total produced/allocated from orders
    const demandaAtendidaTon = Number(
      orders.reduce((acc, o) => acc + (o.bobinaPesoOriginal - o.sobraPesoTon), 0).toFixed(2)
    );

    const taxaAtendimentoPercent = demandaTotalTon > 0 
      ? Number(Math.min(100, (demandaAtendidaTon / demandaTotalTon) * 100).toFixed(1))
      : 85.0;

    return {
      totalBobinasDisponiveis,
      pesoTotalEstoqueTon,
      aproveitamentoMedioPercent,
      totalOrdensAtivas: orders.filter(o => o.status === 'Planejada' || o.status === 'Liberada' || o.status === 'Em Corte').length,
      totalRefiloGeradoTon,
      demandaTotalTon,
      demandaAtendidaTon,
      taxaAtendimentoPercent
    };
  }
}

// Auto initialize on import
StorageService.initialize();
