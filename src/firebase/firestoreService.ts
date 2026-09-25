import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Coil, Product, SlitterOrder, CutHistoryItem, Ferramental, AIRecommendationFeedback } from '../types/pcp';

export class FirestoreService {
  private static isFirestoreAvailable = true;

  static async testConnection(): Promise<boolean> {
    try {
      const colRef = collection(db, '_connection_test');
      await getDocs(query(colRef, limit(1)));
      this.isFirestoreAvailable = true;
      return true;
    } catch (err) {
      console.warn('Firestore connection check (using local fallback if offline):', err);
      this.isFirestoreAvailable = false;
      return false;
    }
  }

  // Coils
  static async getCoils(): Promise<Coil[]> {
    try {
      const snap = await getDocs(collection(db, 'bobinas'));
      if (snap.empty) return [];
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Coil));
    } catch (e) {
      console.warn('Firestore getCoils error, fallback to local', e);
      return [];
    }
  }

  static async saveCoil(coil: Coil): Promise<void> {
    try {
      await setDoc(doc(db, 'bobinas', coil.id), coil);
    } catch (e) {
      console.warn('Firestore saveCoil error', e);
    }
  }

  static async saveMultipleCoils(coils: Coil[]): Promise<void> {
    for (const c of coils) {
      await this.saveCoil(c);
    }
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, 'produtos'));
      if (snap.empty) return [];
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
    } catch (e) {
      console.warn('Firestore getProducts error', e);
      return [];
    }
  }

  static async saveProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, 'produtos', product.id), product);
    } catch (e) {
      console.warn('Firestore saveProduct error', e);
    }
  }

  static async saveMultipleProducts(products: Product[]): Promise<void> {
    for (const p of products) {
      await this.saveProduct(p);
    }
  }

  // Ferramentais
  static async getFerramentais(): Promise<Ferramental[]> {
    try {
      const snap = await getDocs(collection(db, 'ferramentais'));
      if (snap.empty) return [];
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Ferramental));
    } catch (e) {
      console.warn('Firestore getFerramentais error', e);
      return [];
    }
  }

  static async saveFerramental(item: Ferramental): Promise<void> {
    try {
      await setDoc(doc(db, 'ferramentais', item.id), item);
    } catch (e) {
      console.warn('Firestore saveFerramental error', e);
    }
  }

  static async saveMultipleFerramentais(items: Ferramental[]): Promise<void> {
    for (const f of items) {
      await this.saveFerramental(f);
    }
  }

  // Slitter Orders
  static async getSlitterOrders(): Promise<SlitterOrder[]> {
    try {
      const q = query(collection(db, 'slitters'), orderBy('dataCriacao', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return [];
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as SlitterOrder));
    } catch (e) {
      console.warn('Firestore getSlitterOrders error', e);
      return [];
    }
  }

  static async saveSlitterOrder(order: SlitterOrder): Promise<void> {
    try {
      await setDoc(doc(db, 'slitters', order.id), {
        ...order,
        updatedAt: serverTimestamp()
      });
      
      // Also update coil status to "Em Produção" or "Consumida" (todas as bobinas da OP)
      const coilIds = order.bobinas?.length ? order.bobinas.map(b => b.coilId) : [order.bobinaId];
      for (const coilId of coilIds) {
        await updateDoc(doc(db, 'bobinas', coilId), {
          status: 'Consumida'
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore saveSlitterOrder error', e);
    }
  }

  // Cut History
  static async getCutHistory(): Promise<CutHistoryItem[]> {
    try {
      const q = query(collection(db, 'historico_cortes'), orderBy('dataCorte', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return [];
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as CutHistoryItem));
    } catch (e) {
      console.warn('Firestore getCutHistory error', e);
      return [];
    }
  }

  static async addCutHistoryItem(item: CutHistoryItem): Promise<void> {
    try {
      await setDoc(doc(db, 'historico_cortes', item.id), item);
    } catch (e) {
      console.warn('Firestore addCutHistoryItem error', e);
    }
  }

  // Feedback do Agente de IA
  static async addAIFeedbackItem(item: AIRecommendationFeedback): Promise<void> {
    try {
      await setDoc(doc(db, 'ai_feedback', item.id), item);
    } catch (e) {
      console.warn('Firestore addAIFeedbackItem error', e);
    }
  }

  /** Apaga todos os documentos de uma coleção do Firestore — usado pelos resets de base/OPs. */
  static async clearCollection(collectionName: string): Promise<void> {
    try {
      const snap = await getDocs(collection(db, collectionName));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    } catch (e) {
      console.warn(`Firestore clearCollection(${collectionName}) error`, e);
    }
  }
}
