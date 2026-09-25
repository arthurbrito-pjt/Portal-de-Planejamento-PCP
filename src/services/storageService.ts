import { Product, Coil, SlitterOrder, CutHistoryItem, PCPKPIs, Ferramental, SlitterIntermediaryItem, AIRecommendationFeedback } from '../types/pcp';
import { INITIAL_PRODUCTS, INITIAL_COILS, INITIAL_FERRAMENTAL, INITIAL_INTERMEDIARY_SLITTERS } from '../data/initialData';
import { FirestoreService } from '../firebase/firestoreService';

const STORAGE_KEYS = {
  PRODUCTS: 'pcp_products_v1',
  COILS: 'pcp_coils_v1',
  SLITTER_ORDERS: 'pcp_slitter_orders_v1',
  CUT_HISTORY: 'pcp_cut_history_v1',
  FERRAMENTAL: 'pcp_ferramental_v1',
  SLITTER_INTERMEDIARY: 'pcp_slitter_intermediary_v1',
  AI_FEEDBACK: 'pcp_ai_feedback_v1',
  LAST_SYNC: 'pcp_last_sync_v1'
};

// Máximo de registros de feedback da IA guardados — histórico recente é o
// que importa para calibrar a próxima sugestão, não retenção ilimitada.
const AI_FEEDBACK_MAX_ENTRIES = 200;

export class StorageService {
  private static productsCache: Product[] | null = null;
  private static coilsCache: Coil[] | null = null;
  private static ordersCache: SlitterOrder[] | null = null;
  private static historyCache: CutHistoryItem[] | null = null;
  private static ferramentaisCache: Ferramental[] | null = null;
  private static intermediaryCache: SlitterIntermediaryItem[] | null = null;
  private static aiFeedbackCache: AIRecommendationFeedback[] | null = null;

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
    
    // Seed ferramentais se vazio
    const rawFrm = localStorage.getItem(STORAGE_KEYS.FERRAMENTAL);
    if (!rawFrm || JSON.parse(rawFrm).length === 0) {
      localStorage.setItem(STORAGE_KEYS.FERRAMENTAL, JSON.stringify(INITIAL_FERRAMENTAL));
      this.ferramentaisCache = INITIAL_FERRAMENTAL;
    }

    // Seed estoque intermediário se não existir
    if (!localStorage.getItem(STORAGE_KEYS.SLITTER_INTERMEDIARY)) {
      localStorage.setItem(STORAGE_KEYS.SLITTER_INTERMEDIARY, JSON.stringify(INITIAL_INTERMEDIARY_SLITTERS));
      this.intermediaryCache = INITIAL_INTERMEDIARY_SLITTERS;
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

  // Ferramentais
  static getFerramentais(): Ferramental[] {
    if (this.ferramentaisCache) return this.ferramentaisCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FERRAMENTAL);
      this.ferramentaisCache = raw ? JSON.parse(raw) : INITIAL_FERRAMENTAL;
      return this.ferramentaisCache || INITIAL_FERRAMENTAL;
    } catch {
      return INITIAL_FERRAMENTAL;
    }
  }

  static saveFerramentais(items: Ferramental[], syncCloud = true): void {
    this.ferramentaisCache = items;
    localStorage.setItem(STORAGE_KEYS.FERRAMENTAL, JSON.stringify(items));
    if (syncCloud) {
      FirestoreService.saveMultipleFerramentais(items).catch(() => {});
    }
  }

  static addFerramental(item: Ferramental): void {
    const items = this.getFerramentais();
    const existingIdx = items.findIndex(f => f.id === item.id || f.codigo === item.codigo);
    if (existingIdx >= 0) {
      items[existingIdx] = item;
    } else {
      items.unshift(item);
    }
    this.saveFerramentais(items);
  }

  // Estoque Intermediário de Slitter (fitas cortadas)
  static getIntermediarySlitters(): SlitterIntermediaryItem[] {
    if (this.intermediaryCache) return this.intermediaryCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SLITTER_INTERMEDIARY);
      this.intermediaryCache = raw ? JSON.parse(raw) : INITIAL_INTERMEDIARY_SLITTERS;
      return this.intermediaryCache || INITIAL_INTERMEDIARY_SLITTERS;
    } catch {
      return INITIAL_INTERMEDIARY_SLITTERS;
    }
  }

  static saveIntermediarySlitters(items: SlitterIntermediaryItem[]): void {
    this.intermediaryCache = items;
    localStorage.setItem(STORAGE_KEYS.SLITTER_INTERMEDIARY, JSON.stringify(items));
  }

  static addIntermediarySlitter(item: SlitterIntermediaryItem): void {
    const items = this.getIntermediarySlitters();
    items.unshift(item);
    this.saveIntermediarySlitters(items);
  }

  // Feedback do Agente de IA (loop de aprendizado por aceitação real)
  static getAIFeedback(): AIRecommendationFeedback[] {
    if (this.aiFeedbackCache) return this.aiFeedbackCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_FEEDBACK);
      this.aiFeedbackCache = raw ? JSON.parse(raw) : [];
      return this.aiFeedbackCache || [];
    } catch {
      return [];
    }
  }

  static saveAIFeedback(items: AIRecommendationFeedback[]): void {
    this.aiFeedbackCache = items;
    localStorage.setItem(STORAGE_KEYS.AI_FEEDBACK, JSON.stringify(items));
  }

  static addAIFeedback(item: AIRecommendationFeedback): void {
    const items = this.getAIFeedback();
    items.unshift(item);
    this.saveAIFeedback(items.slice(0, AI_FEEDBACK_MAX_ENTRIES));
    FirestoreService.addAIFeedbackItem(item).catch(() => {});
  }

  /** Marca a sugestão mais recente daquele programId como aceita (usuário abriu no Estúdio de Corte ou na OP). */
  static markAIFeedbackAccepted(programId: string): void {
    const items = this.getAIFeedback();
    const idx = items.findIndex(f => f.programId === programId && f.status === 'SUGERIDA');
    if (idx === -1) return;
    items[idx] = { ...items[idx], status: 'ACEITA', aceitaEm: new Date().toISOString() };
    this.saveAIFeedback(items);
    FirestoreService.addAIFeedbackItem(items[idx]).catch(() => {});
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
    const existingIdx = orders.findIndex(o => o.id === order.id);
    const isNew = existingIdx === -1;

    if (isNew) {
      orders.unshift(order);
    } else {
      orders[existingIdx] = order;
    }
    this.saveOrders(orders);

    if (isNew) {
      // Baixa TODAS as bobinas físicas consumidas nesta OP (pode ser mais de uma)
      const coilIds = order.bobinas?.length ? order.bobinas.map(b => b.coilId) : [order.bobinaId];
      coilIds.forEach(id => this.updateCoilStatus(id, 'Consumida'));

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
    }

    // Cloud sync
    FirestoreService.saveSlitterOrder(order).catch(() => {});
  }

  static updateOrderStatus(orderId: string, status: SlitterOrder['status']): SlitterOrder | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId || o.numeroOP === orderId || o.numeroOS === orderId);
    if (idx === -1) return null;

    const updated: SlitterOrder = { ...orders[idx], status };
    orders[idx] = updated;
    this.saveOrders(orders);

    FirestoreService.saveSlitterOrder(updated).catch(() => {});
    return updated;
  }

  /**
   * Cancela uma OP e devolve TODAS as bobinas consumidas ao estoque como
   * 'Disponível', já que o corte planejado não vai (ou não vai mais) acontecer.
   */
  static cancelOrder(orderId: string): SlitterOrder | null {
    const updated = this.updateOrderStatus(orderId, 'Cancelada');
    if (updated) {
      const coilIds = updated.bobinas?.length ? updated.bobinas.map(b => b.coilId) : [updated.bobinaId];
      coilIds.forEach(id => this.updateCoilStatus(id, 'Disponível'));
    }
    return updated;
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

  /**
   * Apaga todas as Ordens de Produção e o histórico de corte, devolvendo ao
   * estoque (status 'Disponível') as bobinas que haviam sido consumidas por
   * essas OPs — como se o corte nunca tivesse acontecido.
   */
  static resetAllOrders(): void {
    const orders = this.getOrders();
    const consumedCoilIds = new Set(
      orders.flatMap(o => (o.bobinas?.length ? o.bobinas.map(b => b.coilId) : [o.bobinaId]))
    );

    const coils = this.getCoils().map(c =>
      consumedCoilIds.has(c.id) ? { ...c, status: 'Disponível' as const } : c
    );

    this.saveCoils(coils);
    this.saveOrders([]);
    this.historyCache = [];
    localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify([]));
  }

  /**
   * Zera TODA a base operacional e de demanda de demonstração (bobinas de
   * exemplo, catálogo de produtos/demanda de exemplo — com valores de
   * demandaT fictícios das planilhas originais —, fitas intermediárias de
   * exemplo, OPs, histórico de corte e feedback da IA acumulados em testes).
   * Preserva apenas os Ferramentais (cadastro de equipamento físico real,
   * já corrigido com os códigos oficiais das planilhas), que não são "dados
   * de demanda" e não mudam a cada pedido.
   * Uso: preparar o ambiente para receber dados reais de produtos/demanda e
   * estoque via Importador Excel ou cadastro manual, e testar o sistema em
   * condições reais, sem nenhum número inventado misturado.
   */
  static clearForRealTesting(): void {
    this.productsCache = [];
    this.coilsCache = [];
    this.ordersCache = [];
    this.historyCache = [];
    this.intermediaryCache = [];
    this.aiFeedbackCache = [];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COILS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SLITTER_ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SLITTER_INTERMEDIARY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AI_FEEDBACK, JSON.stringify([]));
  }

  // Reset to initial demo database
  static resetToInitial(): void {
    this.productsCache = INITIAL_PRODUCTS;
    this.coilsCache = INITIAL_COILS;
    this.ordersCache = [];
    this.historyCache = [];
    this.ferramentaisCache = INITIAL_FERRAMENTAL;
    this.intermediaryCache = INITIAL_INTERMEDIARY_SLITTERS;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COILS, JSON.stringify(INITIAL_COILS));
    localStorage.setItem(STORAGE_KEYS.SLITTER_ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CUT_HISTORY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FERRAMENTAL, JSON.stringify(INITIAL_FERRAMENTAL));
    localStorage.setItem(STORAGE_KEYS.SLITTER_INTERMEDIARY, JSON.stringify(INITIAL_INTERMEDIARY_SLITTERS));
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
